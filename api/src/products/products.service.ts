import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProductNotFoundException } from '../common/exceptions/product-not-found.exception.js';
import { IngredientNotFoundException } from '../common/exceptions/ingredient-not-found.exception.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    if (createProductDto.ingredientId) {
      const ingredient = await this.prisma.ingredient.findUnique({
        where: {
          id: createProductDto.ingredientId,
        },
      });

      if (!ingredient) {
        throw new IngredientNotFoundException(
          createProductDto.ingredientId,
        );
      }

    }

    return this.prisma.product.create({
      data: createProductDto,
    });
  }


  findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new ProductNotFoundException(id);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new ProductNotFoundException(id);
    }

    if (updateProductDto.ingredientId) {
      const ingredient = await this.prisma.ingredient.findUnique({
        where: {
          id: updateProductDto.ingredientId,
        },
      });

      if (!ingredient) {
        throw new IngredientNotFoundException(
          updateProductDto.ingredientId,
        );
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }


  async delete(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new ProductNotFoundException(id);
    }

    await this.prisma.product.delete({
      where: { id },
    });
  }

  async findByIngredient(ingredientId: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      throw new IngredientNotFoundException(ingredientId);
    }

    return this.prisma.product.findMany({
      where: { ingredientId },
    });
  }
}
