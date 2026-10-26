import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { MealPlanNotFoundException } from '../common/exceptions/meal-plan-not-found.exception.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto.js';
import { CreateMealPlanItemDto } from './dto/create-meal-plan-item.dto.js';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto.js';
import { DependencyReference, EntityInUseException } from '../common/exceptions/entity-in-use.exception.js';
import { MealNotFoundException } from '../common/exceptions/meal-not-found.exception.js';

const itemInclude = { meal: { include: { items: true } } } satisfies Prisma.MealPlanItemInclude;

function toMealPlanItemCreateData(item: CreateMealPlanItemDto): Prisma.MealPlanItemCreateWithoutMealPlanInput {
  return {
    date: new Date(`${item.date}T00:00:00.000Z`),
    moment: item.moment,
    meal: { connect: { id: item.mealId } },
  };
}

@Injectable()
export class MealPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMealPlanDto) {
    const { items, ...planData } = dto;
    await this.ensureMealsExist(items);
    return this.prisma.mealPlan.create({
      data: {
        ...planData,
        ...(items && { items: { create: items.map(toMealPlanItemCreateData) } }),
      },
      include: { items: { include: itemInclude } },
    });
  }

  findAll() {
    return this.prisma.mealPlan.findMany({
      include: { items: { include: itemInclude } },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.mealPlan.findUnique({
      where: { id },
      include: { items: { include: itemInclude } },
    });
    if (!plan) throw new MealPlanNotFoundException(id);
    return plan;
  }

  async update(id: string, dto: UpdateMealPlanDto) {
    const existing = await this.prisma.mealPlan.findUnique({ where: { id } });
    if (!existing) throw new MealPlanNotFoundException(id);

    const { items, ...planData } = dto;
    await this.ensureMealsExist(items);
    return this.prisma.mealPlan.update({
      where: { id },
      data: {
        ...planData,
        ...(items && {
          items: {
            deleteMany: {},
            create: items.map(toMealPlanItemCreateData),
          },
        }),
      },
      include: { items: { include: itemInclude } },
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.mealPlan.findUnique({ where: { id } });
    if (!existing) throw new MealPlanNotFoundException(id);

    const shoppingItems = await this.prisma.shoppingItem.findMany({
      where: { mealPlanId: id },
      select: { id: true, name: true },
    });
    if (shoppingItems.length) {
      const dependencies: DependencyReference[] = shoppingItems.map((item) => ({
        type: 'ShoppingItem',
        id: item.id,
        name: item.name,
      }));
      throw new EntityInUseException('meal plan', id, existing.name ?? id, dependencies);
    }
    await this.prisma.mealPlan.delete({ where: { id } });
  }

  private async ensureMealsExist(items?: CreateMealPlanItemDto[]) {
    if (!items?.length) return;
    await Promise.all(items.map(async (item) => {
      const meal = await this.prisma.meal.findUnique({ where: { id: item.mealId } });
      if (!meal) throw new MealNotFoundException(item.mealId);
    }));
  }
}
