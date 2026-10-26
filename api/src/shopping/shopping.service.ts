import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { MealPlanNotFoundException } from '../common/exceptions/meal-plan-not-found.exception.js';
import { ShoppingItemNotFoundException } from '../common/exceptions/shopping-item-not-found.exception.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateManualShoppingItemDto } from './dto/create-manual-shopping-item.dto.js';
import { UpdateShoppingItemDto } from './dto/update-shopping-item.dto.js';
import { AddShoppingItemToInventoryDto } from './dto/add-shopping-item-to-inventory.dto.js';
import { convertQuantity as convert, roundQuantity, tryConvertQuantity } from '../common/units.js';
import { IngredientNotFoundException } from '../common/exceptions/ingredient-not-found.exception.js';
import { ProductNotFoundException } from '../common/exceptions/product-not-found.exception.js';

const planInclude = {
  items: {
    include: {
      meal: {
        include: {
          items: {
            include: {
              recipe: { include: { recipeIngredients: { include: { ingredient: true } } } },
              ingredient: true,
              product: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.MealPlanInclude;

const shoppingItemInclude = {
  ingredient: true,
  product: true,
  sources: { include: { mealItem: true } },
} satisfies Prisma.ShoppingItemInclude;

type NeedSource = { mealItemId: string; quantity: number; unit: string; mealName: string | null };
type NeedGroup = {
  kind: 'ingredient' | 'product';
  id: string;
  name: string;
  unit: string;
  quantity: number;
  sources: NeedSource[];
};

@Injectable()
export class ShoppingService {
  constructor(private readonly prisma: PrismaService) {}

  findItems(mealPlanId?: string) {
    return this.prisma.shoppingItem.findMany({
      where: mealPlanId ? { mealPlanId } : undefined,
      include: shoppingItemInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async createManualItem(dto: CreateManualShoppingItemDto) {
    if (dto.ingredientId && dto.productId) {
      throw new BadRequestException('A shopping item can reference an ingredient or a product, not both.');
    }
    if (dto.ingredientId && !(await this.prisma.ingredient.findUnique({ where: { id: dto.ingredientId } }))) {
      throw new IngredientNotFoundException(dto.ingredientId);
    }
    if (dto.productId && !(await this.prisma.product.findUnique({ where: { id: dto.productId } }))) {
      throw new ProductNotFoundException(dto.productId);
    }
    if (dto.mealPlanId && !(await this.prisma.mealPlan.findUnique({ where: { id: dto.mealPlanId } }))) {
      throw new MealPlanNotFoundException(dto.mealPlanId);
    }
    const { ingredientId, productId, mealPlanId, ...itemData } = dto;
    return this.prisma.shoppingItem.create({
      data: {
        ...itemData,
        ...(ingredientId && { ingredient: { connect: { id: ingredientId } } }),
        ...(productId && { product: { connect: { id: productId } } }),
        ...(mealPlanId && { mealPlan: { connect: { id: mealPlanId } } }),
        sources: {
          create: { type: 'manual', quantity: dto.quantity, unit: dto.unit },
        },
      },
      include: shoppingItemInclude,
    });
  }

  async updateItem(id: string, dto: UpdateShoppingItemDto) {
    const existing = await this.prisma.shoppingItem.findUnique({ where: { id } });
    if (!existing) throw new ShoppingItemNotFoundException(id);
    return this.prisma.shoppingItem.update({
      where: { id },
      data: { checked: dto.checked },
      include: shoppingItemInclude,
    });
  }

  async deleteItem(id: string) {
    const existing = await this.prisma.shoppingItem.findUnique({ where: { id } });
    if (!existing) throw new ShoppingItemNotFoundException(id);
    await this.prisma.shoppingItem.delete({ where: { id } });
  }

  async addToInventory(id: string, dto: AddShoppingItemToInventoryDto) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.shoppingItem.findUnique({ where: { id } });
      if (!item) throw new ShoppingItemNotFoundException(id);
      if (!item.ingredientId && !item.productId) {
        throw new BadRequestException('This shopping item has no ingredient or product reference to add to inventory.');
      }

      const purchasedQuantity = dto.quantity ?? item.quantity;
      const purchasedUnit = dto.unit ?? item.unit;
      const purchasedInShoppingUnit = convert(purchasedQuantity, purchasedUnit, item.unit);
      const inventoryItems = await tx.inventoryItem.findMany({
        where: item.ingredientId
          ? { ingredientId: item.ingredientId }
          : { productId: item.productId! },
      });

      let inventoryItem: {
        id: string;
        ingredientId: string | null;
        productId: string | null;
        quantity: number;
        unit: string;
        createdAt: Date;
        updatedAt: Date;
      } | null = null;
      for (const existing of inventoryItems) {
        const converted = tryConvertQuantity(purchasedQuantity, purchasedUnit, existing.unit);
        if (converted === undefined) continue;
        inventoryItem = await tx.inventoryItem.update({
          where: { id: existing.id },
          data: { quantity: roundQuantity(existing.quantity + converted) },
        });
        break;
      }

      if (!inventoryItem) {
        inventoryItem = await tx.inventoryItem.create({
          data: {
            quantity: roundQuantity(purchasedQuantity),
            unit: purchasedUnit,
            ...(item.ingredientId
              ? { ingredient: { connect: { id: item.ingredientId } } }
              : { product: { connect: { id: item.productId! } } }),
          },
        });
      }

      const remaining = roundQuantity(item.quantity - purchasedInShoppingUnit);
      let shoppingItem: unknown = null;
      if (remaining <= 1e-9) {
        await tx.shoppingItem.delete({ where: { id } });
      } else {
        shoppingItem = await tx.shoppingItem.update({
          where: { id },
          data: { quantity: remaining },
          include: shoppingItemInclude,
        });
      }

      return { inventoryItem, shoppingItem };
    });
  }

  async recalculateShoppingList(mealPlanId: string) {
    const calculated = await this.calculateNeeds(mealPlanId);
    const needs = calculated.needs;

    for (const need of needs) {
      const targetWhere = need.ingredientId
        ? { ingredientId: need.ingredientId }
        : { productId: need.productId! };
      const matches = await this.prisma.shoppingItem.findMany({
        where: { mealPlanId, ...targetWhere },
        include: { sources: true },
      });
      const checkedQuantity = matches
        .filter((item) => item.checked)
        .reduce((sum, item) => roundQuantity(sum + convert(item.quantity, item.unit, need.unit)), 0);
      const remaining = roundQuantity(Math.max(0, need.quantityToBuy - checkedQuantity));
      const automaticItems = matches.filter(
        (item) => !item.checked && item.sources.every((source) => source.type === 'meal_plan'),
      );

      if (remaining === 0) {
        await this.prisma.shoppingItem.deleteMany({
          where: { id: { in: automaticItems.map((item) => item.id) } },
        });
        continue;
      }

      const [primary, ...duplicates] = automaticItems;
      if (duplicates.length) {
        await this.prisma.shoppingItem.deleteMany({
          where: { id: { in: duplicates.map((item) => item.id) } },
        });
      }
      const sources = need.sources.map((source) => ({
        type: 'meal_plan' as const,
        mealItemId: source.mealItemId,
        quantity: source.quantity,
        unit: source.unit,
      }));

      if (primary) {
        await this.prisma.shoppingItem.update({
          where: { id: primary.id },
          data: {
            name: need.name,
            quantity: remaining,
            unit: need.unit,
            sources: {
              deleteMany: { type: 'meal_plan' },
              create: sources,
            },
          },
        });
      } else {
        await this.prisma.shoppingItem.create({
          data: {
            name: need.name,
            quantity: remaining,
            unit: need.unit,
            mealPlan: { connect: { id: mealPlanId } },
            ...(need.ingredientId
              ? { ingredient: { connect: { id: need.ingredientId } } }
              : { product: { connect: { id: need.productId! } } }),
            sources: { create: sources },
          },
        });
      }
    }

    const currentKeys = new Set(
      needs.map((need) => need.ingredientId ? `ingredient:${need.ingredientId}` : `product:${need.productId}`),
    );
    const existingAutomatic = await this.prisma.shoppingItem.findMany({
      where: {
        mealPlanId,
        checked: false,
        sources: { some: { type: 'meal_plan' } },
      },
      include: { sources: true },
    });
    const staleIds = existingAutomatic
      .filter((item) => {
        const key = item.ingredientId ? `ingredient:${item.ingredientId}` : `product:${item.productId}`;
        return !currentKeys.has(key) && item.sources.every((source) => source.type === 'meal_plan');
      })
      .map((item) => item.id);
    if (staleIds.length) {
      await this.prisma.shoppingItem.deleteMany({ where: { id: { in: staleIds } } });
    }

    return this.findItems(mealPlanId);
  }

  async calculateNeeds(mealPlanId: string) {
    const plan = await this.prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      include: planInclude,
    });
    if (!plan) throw new MealPlanNotFoundException(mealPlanId);

    const groups = new Map<string, NeedGroup>();
    const addNeed = (
      mealItemId: string,
      mealName: string | null,
      kind: 'ingredient' | 'product',
      id: string,
      name: string,
      unit: string,
      quantity: number,
      preferredUnit?: string,
    ) => {
      const key = `${kind}:${id}`;
      const group = groups.get(key);
      if (!group) {
        const targetUnit = preferredUnit ?? unit;
        groups.set(key, {
          kind,
          id,
          name,
          unit: targetUnit,
          quantity: convert(quantity, unit, targetUnit),
          sources: [{ mealItemId, mealName, quantity: roundQuantity(quantity), unit }],
        });
        return;
      }
      group.quantity = roundQuantity(group.quantity + convert(quantity, unit, group.unit));
      group.sources.push({ mealItemId, mealName, quantity: roundQuantity(quantity), unit });
    };

    for (const planItem of plan.items) {
      for (const mealItem of planItem.meal.items) {
        if (mealItem.type === 'recipe' && mealItem.recipe) {
          const factor = (mealItem.servings ?? 0) / mealItem.recipe.servings;
          for (const recipeIngredient of mealItem.recipe.recipeIngredients) {
            addNeed(
              mealItem.id,
              planItem.meal.name,
              'ingredient',
              recipeIngredient.ingredientId,
              recipeIngredient.ingredient.name,
              recipeIngredient.unit,
              recipeIngredient.quantity * factor,
              recipeIngredient.ingredient.defaultUnit,
            );
          }
        } else if (mealItem.type === 'ingredient' && mealItem.ingredient) {
          addNeed(
            mealItem.id,
            planItem.meal.name,
            'ingredient',
            mealItem.ingredientId!,
            mealItem.ingredient.name,
            mealItem.unit!,
            mealItem.quantity!,
            mealItem.ingredient.defaultUnit,
          );
        } else if (mealItem.type === 'product' && mealItem.product) {
          addNeed(
            mealItem.id,
            planItem.meal.name,
            'product',
            mealItem.productId!,
            mealItem.product.name,
            mealItem.unit!,
            mealItem.quantity!,
          );
        }
      }
    }

    const results: Array<{
      name: string;
      ingredientId?: string;
      productId?: string;
      neededQuantity: number;
      inventoryQuantity: number;
      quantityToBuy: number;
      unit: string;
      sources: NeedSource[];
    }> = [];
    for (const group of groups.values()) {
      const inventory = await this.prisma.inventoryItem.findMany({
        where: group.kind === 'ingredient'
          ? { ingredientId: group.id }
          : { productId: group.id },
      });
      const inventoryQuantity = inventory.reduce(
        (total, item) => roundQuantity(total + convert(item.quantity, item.unit, group.unit)),
        0,
      );
      const quantityToBuy = roundQuantity(Math.max(0, group.quantity - inventoryQuantity));
      results.push({
        name: group.name,
        ...(group.kind === 'ingredient' ? { ingredientId: group.id } : { productId: group.id }),
        neededQuantity: roundQuantity(group.quantity),
        inventoryQuantity,
        quantityToBuy,
        unit: group.unit,
        sources: group.sources,
      });
    }

    return { mealPlanId, needs: results };
  }
}
