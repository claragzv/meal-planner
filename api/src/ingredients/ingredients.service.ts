import { Injectable } from '@nestjs/common';
import { CreateIngredientDto } from './dto/create-ingredient.dto.js';
import { UpdateIngredientDto } from './dto/update-ingredient.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { IngredientNotFoundException } from '../common/exceptions/ingredient-not-found.exception.js';
import { DependencyReference, EntityInUseException } from '../common/exceptions/entity-in-use.exception.js';

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) { }

  create(createIngredientDto: CreateIngredientDto) {
    return this.prisma.ingredient.create({
      data: createIngredientDto,
      include: { nutrition: true },
    });
  }

  findAll() {
    return this.prisma.ingredient.findMany({ include: { nutrition: true } });
  }

  async findOne(id: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
      include: { nutrition: true },
    });

    if (!ingredient) {
      throw new IngredientNotFoundException(id);
    }

    return ingredient;
  }

  async update(id: string, updateIngredientDto: UpdateIngredientDto) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: {
        id,
      },
    });

    if (!ingredient) {
      throw new IngredientNotFoundException(id);
    }

    return this.prisma.ingredient.update({
      where: {
        id,
      },
      data: updateIngredientDto,
      include: { nutrition: true },
    });
  }

  async delete(id: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient) {
      throw new IngredientNotFoundException(id);
    }

    const [products, recipeLines, mealItems, inventoryItems, shoppingItems] = await Promise.all([
      this.prisma.product.findMany({ where: { ingredientId: id }, select: { id: true, name: true } }),
      this.prisma.recipeIngredient.findMany({
        where: { ingredientId: id },
        include: { recipe: { select: { id: true, name: true } } },
      }),
      this.prisma.mealItem.findMany({
        where: { ingredientId: id },
        include: { meal: { select: { id: true, name: true } } },
      }),
      this.prisma.inventoryItem.findMany({ where: { ingredientId: id }, select: { id: true } }),
      this.prisma.shoppingItem.findMany({ where: { ingredientId: id }, select: { id: true, name: true } }),
    ]);

    const dependencies: DependencyReference[] = [
      ...products.map((item) => ({ type: 'Product', id: item.id, name: item.name })),
      ...recipeLines.map((line) => ({ type: 'Recipe', id: line.recipe.id, name: line.recipe.name })),
      ...mealItems.map((item) => ({ type: 'Meal', id: item.meal.id, name: item.meal.name ?? item.meal.id })),
      ...inventoryItems.map((item) => ({ type: 'InventoryItem', id: item.id, name: ingredient.name })),
      ...shoppingItems.map((item) => ({ type: 'ShoppingItem', id: item.id, name: item.name })),
    ];

    const uniqueDependencies = [...new Map(dependencies.map((dependency) => [
      `${dependency.type}:${dependency.id}`,
      dependency,
    ])).values()];
    if (uniqueDependencies.length) {
      throw new EntityInUseException('ingredient', id, ingredient.name, uniqueDependencies);
    }

    await this.prisma.ingredient.delete({
      where: { id },
    });
  }
}
