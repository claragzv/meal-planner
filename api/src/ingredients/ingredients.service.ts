import { Injectable } from '@nestjs/common';
import { CreateIngredientDto } from './dto/create-ingredient.dto.js';
import { UpdateIngredientDto } from './dto/update-ingredient.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { IngredientNotFoundException } from '../common/exceptions/ingredient-not-found.exception.js';

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) { }

  create(createIngredientDto: CreateIngredientDto) {
    return this.prisma.ingredient.create({
      data: createIngredientDto,
    });
  }

  findAll() {
    return this.prisma.ingredient.findMany();
  }

  async findOne(id: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
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
    });
  }

  async delete(id: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient) {
      throw new IngredientNotFoundException(id);
    }

    await this.prisma.ingredient.delete({
      where: { id },
    });
  }
}
