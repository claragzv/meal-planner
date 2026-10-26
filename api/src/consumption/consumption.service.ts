import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { InventoryItemNotFoundException } from '../common/exceptions/inventory-item-not-found.exception.js';
import { MealItemNotFoundException } from '../common/exceptions/meal-item-not-found.exception.js';
import { convertQuantity, roundQuantity, tryConvertQuantity } from '../common/units.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConsumeMealItemDto } from '../meals/dto/consume-meal-item.dto.js';

const mealItemInclude = {
  recipe: { include: { recipeIngredients: { include: { ingredient: true } } } },
  ingredient: true,
  product: true,
} satisfies Prisma.MealItemInclude;

const inventoryInclude = {
  ingredient: true,
  product: true,
} satisfies Prisma.InventoryItemInclude;

@Injectable()
export class ConsumptionService {
  constructor(private readonly prisma: PrismaService) {}

  async getConsumables(mealItemId: string) {
    const mealItem = await this.prisma.mealItem.findUnique({ where: { id: mealItemId }, include: mealItemInclude });
    if (!mealItem) throw new MealItemNotFoundException(mealItemId);

    const components: Array<{
      type: 'ingredient' | 'product';
      id: string;
      name: string;
      plannedQuantity: number;
      unit: string;
    }> = [];

    if (mealItem.type === 'recipe' && mealItem.recipe) {
      const factor = (mealItem.servings ?? 0) / mealItem.recipe.servings;
      for (const line of mealItem.recipe.recipeIngredients) {
        const planned = roundQuantity(line.quantity * factor);
        const existing = components.find((item) => item.type === 'ingredient' && item.id === line.ingredientId);
        if (existing) existing.plannedQuantity = roundQuantity(existing.plannedQuantity + planned);
        else components.push({
          type: 'ingredient',
          id: line.ingredientId,
          name: line.ingredient.name,
          plannedQuantity: planned,
          unit: line.ingredient.defaultUnit,
        });
      }
    } else if (mealItem.type === 'ingredient' && mealItem.ingredient) {
      components.push({
        type: 'ingredient',
        id: mealItem.ingredientId!,
        name: mealItem.ingredient.name,
        plannedQuantity: mealItem.quantity!,
        unit: mealItem.unit!,
      });
    } else if (mealItem.type === 'product' && mealItem.product) {
      components.push({
        type: 'product',
        id: mealItem.productId!,
        name: mealItem.product.name,
        plannedQuantity: mealItem.quantity!,
        unit: mealItem.unit!,
      });
    }

    const consumables = await Promise.all(components.map(async (component) => {
      const inventory = await this.prisma.inventoryItem.findMany({
        where: component.type === 'ingredient'
          ? { ingredientId: component.id }
          : { productId: component.id },
        include: inventoryInclude,
      });
      return {
        ...component,
        inventory: inventory.map((entry) => ({
          ...entry,
          availableInUnit: tryConvertQuantity(entry.quantity, entry.unit, component.unit) ?? null,
        })),
      };
    }));

    return { mealItemId, consumables };
  }

  async consume(mealItemId: string, dto: ConsumeMealItemDto) {
    const inventoryIds = dto.items.map((item) => item.inventoryItemId);
    if (new Set(inventoryIds).size !== inventoryIds.length) {
      throw new BadRequestException('Each inventory item can appear only once per consumption request.');
    }

    return this.prisma.$transaction(async (tx) => {
      const mealItem = await tx.mealItem.findUnique({ where: { id: mealItemId }, include: mealItemInclude });
      if (!mealItem) throw new MealItemNotFoundException(mealItemId);

      const allowedIngredients = new Set<string>();
      const allowedProducts = new Set<string>();
      if (mealItem.type === 'recipe' && mealItem.recipe) {
        for (const line of mealItem.recipe.recipeIngredients) allowedIngredients.add(line.ingredientId);
      } else if (mealItem.type === 'ingredient' && mealItem.ingredientId) {
        allowedIngredients.add(mealItem.ingredientId);
      } else if (mealItem.type === 'product' && mealItem.productId) {
        allowedProducts.add(mealItem.productId);
      }

      const results: Array<{
        inventoryItemId?: string;
        inventoryItem?: {
          id: string;
          ingredientId: string | null;
          productId: string | null;
          quantity: number;
          unit: string;
          createdAt: Date;
          updatedAt: Date;
        };
        consumed: number;
        unit: string;
        remaining?: number;
      }> = [];
      for (const selection of dto.items) {
        const inventoryItem = await tx.inventoryItem.findUnique({ where: { id: selection.inventoryItemId } });
        if (!inventoryItem) throw new InventoryItemNotFoundException(selection.inventoryItemId);

        const isAllowed = inventoryItem.ingredientId
          ? allowedIngredients.has(inventoryItem.ingredientId)
          : inventoryItem.productId && allowedProducts.has(inventoryItem.productId);
        if (!isAllowed) {
          throw new BadRequestException('The selected inventory item is not part of this meal item.');
        }

        const quantityToConsume = convertQuantity(selection.quantity, selection.unit, inventoryItem.unit);
        if (quantityToConsume > inventoryItem.quantity + 1e-9) {
          throw new BadRequestException(
            `Cannot consume ${selection.quantity} ${selection.unit}; only ${inventoryItem.quantity} ${inventoryItem.unit} are available.`,
          );
        }

        const remaining = roundQuantity(Math.max(0, inventoryItem.quantity - quantityToConsume));
        if (remaining <= 1e-9) {
          await tx.inventoryItem.delete({ where: { id: inventoryItem.id } });
          results.push({ inventoryItemId: inventoryItem.id, consumed: selection.quantity, unit: selection.unit, remaining: 0 });
        } else {
          const updated = await tx.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: { quantity: remaining },
          });
          results.push({ inventoryItem: updated, consumed: selection.quantity, unit: selection.unit });
        }
      }

      return { mealItemId, consumed: results };
    });
  }
}
