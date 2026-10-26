import { Injectable } from '@nestjs/common';
import { RecipeNotFoundException } from '../common/exceptions/recipe-not-found.exception.js';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { UpdateRecipeDto } from './dto/update-recipe.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DependencyReference, EntityInUseException } from '../common/exceptions/entity-in-use.exception.js';
import { IngredientNotFoundException } from '../common/exceptions/ingredient-not-found.exception.js';

@Injectable()
export class RecipesService {
  // eso es para que cuando nest cree un recipe service, haga una instancia de prisma service y la inyecte en el constructor
  constructor(private readonly prisma: PrismaService) { }

  async create(createRecipeDto: CreateRecipeDto) {
    const { ingredients, ...recipeData } = createRecipeDto;
    await this.ensureIngredientsExist(ingredients);

    return this.prisma.recipe.create({
      data: {
        ...recipeData,
        ...(ingredients && {
          recipeIngredients: {
            create: ingredients.map(({ ingredientId, ...ingredientData }) => ({
              ...ingredientData,
              ingredient: { connect: { id: ingredientId } },
            })),
          },
        }),
      },
      include: {
        recipeIngredients: {
          include: { ingredient: true },
        },
      },
    });
  }

  findAll() {
    return this.prisma.recipe.findMany({
      include: {
        recipeIngredients: {
          include: { ingredient: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        recipeIngredients: {
          include: { ingredient: true },
        },
      },
    });

    if (!recipe) {
      throw new RecipeNotFoundException(id);
    }

    return recipe;
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto) {
    const recipe = await this.prisma.recipe.findUnique({
      where: {
        id,
      },
    });

    if (!recipe) {
      throw new RecipeNotFoundException(id);
    }

    const { ingredients, ...recipeData } = updateRecipeDto;
    await this.ensureIngredientsExist(ingredients);

    return this.prisma.recipe.update({
      where: {
        id,
      },
      data: {
        ...recipeData,
        ...(ingredients && {
          recipeIngredients: {
            deleteMany: {},
            create: ingredients.map(({ ingredientId, ...ingredientData }) => ({
              ...ingredientData,
              ingredient: { connect: { id: ingredientId } },
            })),
          },
        }),
      },
      include: {
        recipeIngredients: {
          include: { ingredient: true },
        },
      },
    });
  }

  private async ensureIngredientsExist(ingredients?: CreateRecipeDto['ingredients']) {
    if (!ingredients?.length) return;
    const ids = [...new Set(ingredients.map((item) => item.ingredientId))];
    const found = await this.prisma.ingredient.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const foundIds = new Set(found.map((ingredient) => ingredient.id));
    const missingId = ids.find((ingredientId) => !foundIds.has(ingredientId));
    if (missingId) throw new IngredientNotFoundException(missingId);
  }

  async delete(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      throw new RecipeNotFoundException(id);
    }

    const mealItems = await this.prisma.mealItem.findMany({
      where: { recipeId: id },
      include: { meal: { select: { id: true, name: true } } },
    });
    if (mealItems.length) {
      const dependencies: DependencyReference[] = mealItems.map((item) => ({
        type: 'Meal',
        id: item.meal.id,
        name: item.meal.name ?? item.meal.id,
      }));
      throw new EntityInUseException('recipe', id, recipe.name, dependencies);
    }

    await this.prisma.recipe.delete({
      where: { id },
    });
  }
}
