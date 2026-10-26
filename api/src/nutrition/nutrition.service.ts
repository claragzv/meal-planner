import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { IngredientNotFoundException } from '../common/exceptions/ingredient-not-found.exception.js';
import { MealNotFoundException } from '../common/exceptions/meal-not-found.exception.js';
import { ProductNotFoundException } from '../common/exceptions/product-not-found.exception.js';
import { RecipeNotFoundException } from '../common/exceptions/recipe-not-found.exception.js';
import { convertQuantity, roundQuantity } from '../common/units.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SetNutritionDto } from './dto/set-nutrition.dto.js';

const recipeInclude = {
  recipeIngredients: { include: { ingredient: { include: { nutrition: true } } } },
} satisfies Prisma.RecipeInclude;

const mealInclude = {
  items: {
    include: {
      recipe: { include: recipeInclude },
      ingredient: { include: { nutrition: true } },
      product: { include: { nutrition: true } },
    },
  },
} satisfies Prisma.MealInclude;

const macroKeys = ['calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar', 'saturatedFat', 'salt'] as const;
type MacroKey = (typeof macroKeys)[number];
type NutritionData = {
  basisQuantity: number;
  basisUnit: string;
} & Record<MacroKey, number | null>;

type NutritionAccumulator = {
  totals: Record<MacroKey, number>;
  present: Record<MacroKey, boolean>;
  complete: boolean;
  missing: Set<string>;
};

function createAccumulator(): NutritionAccumulator {
  return {
    totals: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, saturatedFat: 0, salt: 0 },
    present: { calories: false, protein: false, carbohydrates: false, fat: false, fiber: false, sugar: false, saturatedFat: false, salt: false },
    complete: true,
    missing: new Set<string>(),
  };
}

function addNutrition(
  accumulator: NutritionAccumulator,
  nutrition: NutritionData | null,
  quantity: number,
  unit: string,
  label: string,
) {
  if (!nutrition) {
    accumulator.complete = false;
    accumulator.missing.add(label);
    return;
  }

  let quantityInBasisUnit: number;
  try {
    quantityInBasisUnit = convertQuantity(quantity, unit, nutrition.basisUnit);
  } catch {
    accumulator.complete = false;
    accumulator.missing.add(`${label} (unit ${unit} cannot be converted to ${nutrition.basisUnit})`);
    return;
  }

  const factor = quantityInBasisUnit / nutrition.basisQuantity;
  let hasAllCoreValues = true;
  for (const key of macroKeys) {
    const value = nutrition[key];
    if (value === null) {
      if (['calories', 'protein', 'carbohydrates', 'fat'].includes(key)) hasAllCoreValues = false;
      continue;
    }
    accumulator.totals[key] += value * factor;
    accumulator.present[key] = true;
  }
  if (!hasAllCoreValues) {
    accumulator.complete = false;
    accumulator.missing.add(label);
  }
}

function summary(accumulator: NutritionAccumulator, divisor = 1) {
  const nutrition = Object.fromEntries(
    macroKeys.map((key) => [key, accumulator.present[key] ? roundQuantity(accumulator.totals[key] / divisor) : null]),
  );
  return {
    nutrition,
    complete: accumulator.complete,
    missingItems: [...accumulator.missing],
  };
}

@Injectable()
export class NutritionService {
  constructor(private readonly prisma: PrismaService) {}

  async setIngredientNutrition(id: string, dto: SetNutritionDto) {
    const ingredient = await this.prisma.ingredient.findUnique({ where: { id } });
    if (!ingredient) throw new IngredientNotFoundException(id);
    return this.prisma.nutrition.upsert({
      where: { ingredientId: id },
      create: { ...dto, ingredient: { connect: { id } } },
      update: dto,
    });
  }

  async removeIngredientNutrition(id: string) {
    const ingredient = await this.prisma.ingredient.findUnique({ where: { id } });
    if (!ingredient) throw new IngredientNotFoundException(id);
    await this.prisma.nutrition.deleteMany({ where: { ingredientId: id } });
  }

  async setProductNutrition(id: string, dto: SetNutritionDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new ProductNotFoundException(id);
    return this.prisma.nutrition.upsert({
      where: { productId: id },
      create: { ...dto, product: { connect: { id } } },
      update: dto,
    });
  }

  async removeProductNutrition(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new ProductNotFoundException(id);
    await this.prisma.nutrition.deleteMany({ where: { productId: id } });
  }

  async calculateRecipe(id: string) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id }, include: recipeInclude });
    if (!recipe) throw new RecipeNotFoundException(id);
    const accumulator = createAccumulator();

    for (const line of recipe.recipeIngredients) {
      addNutrition(accumulator, line.ingredient.nutrition, line.quantity, line.unit, line.ingredient.name);
    }
    if (recipe.recipeIngredients.length === 0) {
      accumulator.complete = false;
      accumulator.missing.add('No recipe ingredients defined');
    }

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      servings: recipe.servings,
      total: summary(accumulator),
      perServing: summary(accumulator, recipe.servings),
    };
  }

  async calculateMeal(id: string) {
    const meal = await this.prisma.meal.findUnique({ where: { id }, include: mealInclude });
    if (!meal) throw new MealNotFoundException(id);
    const accumulator = createAccumulator();

    for (const item of meal.items) {
      if (item.type === 'recipe' && item.recipe) {
        const factor = (item.servings ?? 0) / item.recipe.servings;
        for (const line of item.recipe.recipeIngredients) {
          addNutrition(
            accumulator,
            line.ingredient.nutrition,
            line.quantity * factor,
            line.unit,
            line.ingredient.name,
          );
        }
      } else if (item.type === 'ingredient' && item.ingredient) {
        addNutrition(accumulator, item.ingredient.nutrition, item.quantity ?? 0, item.unit ?? '', item.ingredient.name);
      } else if (item.type === 'product' && item.product) {
        addNutrition(accumulator, item.product.nutrition, item.quantity ?? 0, item.unit ?? '', item.product.name);
      }
    }
    if (meal.items.length === 0) {
      accumulator.complete = false;
      accumulator.missing.add('No meal items defined');
    }

    return { mealId: meal.id, mealName: meal.name, ...summary(accumulator) };
  }
}
