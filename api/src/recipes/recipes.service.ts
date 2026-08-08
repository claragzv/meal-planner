import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { UpdateRecipeDto } from './dto/update-recipe.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RecipesService {
  // eso es para que cuando nest cree un recipe service, haga una instancia de prisma service y la inyecte en el constructor
  constructor(private readonly prisma: PrismaService) { }

  create(createRecipeDto: CreateRecipeDto) {
    return this.prisma.recipe.create({
      data: createRecipeDto,
    });
  }

  findAll() {
    return this.prisma.recipe.findMany();
  }

  async findOne(id: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: {
        id,
      },
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    return recipe;
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto) {
    const recipe = await this.prisma.recipe.findUnique({
      where: {
        id,
      },
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    return this.prisma.recipe.update({
      where: {
        id,
      },
      data: updateRecipeDto,
    });
  }

  async remove(id: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: {
        id,
      },
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    return this.prisma.recipe.delete({
      where: {
        id,
      },
    });
  }
}
