import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { InventoryItemNotFoundException } from '../common/exceptions/inventory-item-not-found.exception.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateInventoryItemDto, InventoryItemKind } from './dto/create-inventory-item.dto.js';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto.js';
import { IngredientNotFoundException } from '../common/exceptions/ingredient-not-found.exception.js';
import { ProductNotFoundException } from '../common/exceptions/product-not-found.exception.js';

const inventoryItemInclude = {
  ingredient: true,
  product: { include: { ingredient: true } },
} satisfies Prisma.InventoryItemInclude;

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateInventoryItemDto) {
    return this.createWithReferenceValidation(dto);
  }

  private async createWithReferenceValidation(dto: CreateInventoryItemDto) {
    if (dto.type === InventoryItemKind.Ingredient) {
      const ingredient = await this.prisma.ingredient.findUnique({ where: { id: dto.ingredientId } });
      if (!ingredient) throw new IngredientNotFoundException(dto.ingredientId!);
    } else {
      const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
      if (!product) throw new ProductNotFoundException(dto.productId!);
    }

    const { type, ingredientId, productId, ...quantityData } = dto;
    const data: Prisma.InventoryItemCreateInput = {
      ...quantityData,
      ...(type === InventoryItemKind.Ingredient && {
        ingredient: { connect: { id: ingredientId } },
      }),
      ...(type === InventoryItemKind.Product && {
        product: { connect: { id: productId } },
      }),
    };

    return this.prisma.inventoryItem.create({
      data,
      include: inventoryItemInclude,
    });
  }

  findAll() {
    return this.prisma.inventoryItem.findMany({ include: inventoryItemInclude });
  }

  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: inventoryItemInclude,
    });
    if (!item) throw new InventoryItemNotFoundException(id);
    return item;
  }

  async update(id: string, dto: UpdateInventoryItemDto) {
    const existing = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!existing) throw new InventoryItemNotFoundException(id);

    return this.prisma.inventoryItem.update({
      where: { id },
      data: dto,
      include: inventoryItemInclude,
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!existing) throw new InventoryItemNotFoundException(id);
    await this.prisma.inventoryItem.delete({ where: { id } });
  }
}
