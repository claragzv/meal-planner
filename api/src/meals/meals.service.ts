import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { MealNotFoundException } from '../common/exceptions/meal-not-found.exception.js';
import { CreateMealDto } from './dto/create-meal.dto.js';
import { CreateMealItemDto, MealItemKind } from './dto/create-meal-item.dto.js';
import { UpdateMealDto } from './dto/update-meal.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

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

  create(dto: CreateMealDto) {
    const { items, ...mealData } = dto;
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
    await this.prisma.meal.delete({ where: { id } });
  }
}
