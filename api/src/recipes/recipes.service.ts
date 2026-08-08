import { Injectable } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { UpdateRecipeDto } from './dto/update-recipe.dto.js';

@Injectable()
export class RecipesService {
  private recipes: CreateRecipeDto[] = [];

  create(createRecipeDto: CreateRecipeDto) {
    const recipe = {
      id: this.recipes.length + 1,
      ...createRecipeDto,
    };

    this.recipes.push(recipe);

    return recipe;
  }

  findAll() {
    return this.recipes;
  }

  findOne(id: number) {
    return `This action returns a #${id} recipe`;
  }

  update(id: number, updateRecipeDto: UpdateRecipeDto) {
    return `This action updates a #${id} recipe`;
  }

  remove(id: number) {
    return `This action removes a #${id} recipe`;
  }
}
