import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProductNotFoundException } from '../common/exceptions/product-not-found.exception.js';
import { IngredientNotFoundException } from '../common/exceptions/ingredient-not-found.exception.js';
import { DependencyReference, EntityInUseException } from '../common/exceptions/entity-in-use.exception.js';

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
      include: { nutrition: true },
    });
  }


  findAll() {
    return this.prisma.product.findMany({ include: { nutrition: true } });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { nutrition: true },
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
      include: { nutrition: true },
    });
  }


  async delete(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new ProductNotFoundException(id);
    }

    const [mealItems, inventoryItems, shoppingItems] = await Promise.all([
      this.prisma.mealItem.findMany({
        where: { productId: id },
        include: { meal: { select: { id: true, name: true } } },
      }),
      this.prisma.inventoryItem.findMany({ where: { productId: id }, select: { id: true } }),
      this.prisma.shoppingItem.findMany({ where: { productId: id }, select: { id: true, name: true } }),
    ]);
    const dependencies: DependencyReference[] = [
      ...mealItems.map((item) => ({ type: 'Meal', id: item.meal.id, name: item.meal.name ?? item.meal.id })),
      ...inventoryItems.map((item) => ({ type: 'InventoryItem', id: item.id, name: product.name })),
      ...shoppingItems.map((item) => ({ type: 'ShoppingItem', id: item.id, name: item.name })),
    ];
    if (dependencies.length) {
      throw new EntityInUseException('product', id, product.name, dependencies);
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
      include: { nutrition: true },
    });
  }
}
