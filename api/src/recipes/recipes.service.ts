import { Injectable } from '@nestjs/common';
import { RecipeNotFoundException } from '../common/exceptions/recipe-not-found.exception.js';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { UpdateRecipeDto } from './dto/update-recipe.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RecipesService {
  // eso es para que cuando nest cree un recipe service, haga una instancia de prisma service y la inyecte en el constructor
  constructor(private readonly prisma: PrismaService) { }

  create(createRecipeDto: CreateRecipeDto) {
    const { ingredients, ...recipeData } = createRecipeDto;

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

  async delete(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      throw new RecipeNotFoundException(id);
    }

    await this.prisma.recipe.delete({
      where: { id },
    });
  }
}
