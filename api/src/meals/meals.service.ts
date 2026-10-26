import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { MealNotFoundException } from '../common/exceptions/meal-not-found.exception.js';
import { CreateMealDto } from './dto/create-meal.dto.js';
import { CreateMealItemDto, MealItemKind } from './dto/create-meal-item.dto.js';
import { UpdateMealDto } from './dto/update-meal.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DependencyReference, EntityInUseException } from '../common/exceptions/entity-in-use.exception.js';
import { RecipeNotFoundException } from '../common/exceptions/recipe-not-found.exception.js';
import { IngredientNotFoundException } from '../common/exceptions/ingredient-not-found.exception.js';
import { ProductNotFoundException } from '../common/exceptions/product-not-found.exception.js';

const mealItemInclude = {
  recipe: true,
  ingredient: true,
  product: true,
} satisfies Prisma.MealItemInclude;

function toMealItemCreateData(item: CreateMealItemDto): Prisma.MealItemCreateWithoutMealInput {
  switch (item.type) {
    case MealItemKind.Recipe:
      return {
        type: item.type,
        servings: item.servings,
        recipe: { connect: { id: item.recipeId } },
      };
    case MealItemKind.Ingredient:
      return {
        type: item.type,
        quantity: item.quantity,
        unit: item.unit,
        ingredient: { connect: { id: item.ingredientId } },
      };
    case MealItemKind.Product:
      return {
        type: item.type,
        quantity: item.quantity,
        unit: item.unit,
        product: { connect: { id: item.productId } },
      };
  }
}

@Injectable()
export class MealsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMealDto) {
    const { items, ...mealData } = dto;
    await this.ensureReferencesExist(items);
    return this.prisma.meal.create({
      data: {
        ...mealData,
        ...(items && { items: { create: items.map(toMealItemCreateData) } }),
      },
      include: { items: { include: mealItemInclude } },
    });
  }

  findAll() {
    return this.prisma.meal.findMany({
      include: { items: { include: mealItemInclude } },
    });
  }

  async findOne(id: string) {
    const meal = await this.prisma.meal.findUnique({
      where: { id },
      include: { items: { include: mealItemInclude } },
    });
    if (!meal) throw new MealNotFoundException(id);
    return meal;
  }

  async update(id: string, dto: UpdateMealDto) {
    const existing = await this.prisma.meal.findUnique({ where: { id } });
    if (!existing) throw new MealNotFoundException(id);

    const { items, ...mealData } = dto;
    await this.ensureReferencesExist(items);
    return this.prisma.meal.update({
      where: { id },
      data: {
        ...mealData,
        ...(items && {
          items: {
            deleteMany: {},
            create: items.map(toMealItemCreateData),
          },
        }),
      },
      include: { items: { include: mealItemInclude } },
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.meal.findUnique({ where: { id } });
    if (!existing) throw new MealNotFoundException(id);

    const planItems = await this.prisma.mealPlanItem.findMany({
      where: { mealId: id },
      include: { mealPlan: { select: { id: true, name: true } } },
    });
    if (planItems.length) {
      const dependencies: DependencyReference[] = planItems.map((item) => ({
        type: 'MealPlan',
        id: item.mealPlan.id,
        name: item.mealPlan.name ?? item.mealPlan.id,
      }));
      throw new EntityInUseException('meal', id, existing.name ?? id, dependencies);
    }
    await this.prisma.meal.delete({ where: { id } });
  }

  private async ensureReferencesExist(items?: CreateMealItemDto[]) {
    if (!items?.length) return;
    await Promise.all(items.map(async (item) => {
      if (item.type === MealItemKind.Recipe) {
        const recipe = await this.prisma.recipe.findUnique({ where: { id: item.recipeId } });
        if (!recipe) throw new RecipeNotFoundException(item.recipeId!);
      } else if (item.type === MealItemKind.Ingredient) {
        const ingredient = await this.prisma.ingredient.findUnique({ where: { id: item.ingredientId } });
        if (!ingredient) throw new IngredientNotFoundException(item.ingredientId!);
      } else if (item.type === MealItemKind.Product) {
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new ProductNotFoundException(item.productId!);
      }
    }));
  }
}
