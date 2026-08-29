import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { ProductsService } from './products.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Product } from 'generated/prisma/client.js';
import { ProductNotFoundException } from '../common/exceptions/product-not-found.exception.js';
import { IngredientNotFoundException } from '../common/exceptions/ingredient-not-found.exception.js';

describe('ProductsService', () => {
  let service: ProductsService;

  const productId = '550e8400-e29b-41d4-a716-446655440000';
  const productId2 = '550e8400-e29b-41d4-a716-446655440001';
  const nonExistingId = '550e8400-e29b-41d4-a716-446655440002';

  const prismaMock = {
    product: {
      create: jest.fn<() => Promise<Product>>(),
      findMany: jest.fn<() => Promise<Product[]>>(),
      findUnique: jest.fn<() => Promise<Product | null>>(),
      update: jest.fn<() => Promise<Product>>(),
      delete: jest.fn<() => Promise<void>>(),
    },
    ingredient: {
      findUnique: jest.fn<() => Promise<{ id: string; name: string; defaultUnit: string } | null>>(),
    },
  };


  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto = {
        name: 'Leche Entera',
        brand: 'Hacendado',
      };

      const product = {
        id: productId,
        name: 'Leche Entera',
        brand: 'Hacendado',
        ingredientId: null,
      };

      prismaMock.product.create.mockResolvedValue(product);

      const result = await service.create(dto);

      expect(result).toEqual(product);

      expect(prismaMock.product.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it('should throw IngredientNotFoundException when ingredient does not exist', async () => {
      prismaMock.ingredient.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          name: 'Leche Entera',
          brand: 'Hacendado',
          ingredientId: nonExistingId,
        }),
      ).rejects.toThrow(IngredientNotFoundException);

      expect(prismaMock.ingredient.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistingId },
      });

      expect(prismaMock.product.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const products = [
        {
          id: productId,
          name: 'Leche Entera',
          brand: 'Hacendado',
          ingredientId: null,
        },
        {
          id: productId2,
          name: 'Pasta 500 g',
          brand: 'Gallo',
          ingredientId: null,
        },
      ];

      prismaMock.product.findMany.mockResolvedValue(products);

      const result = await service.findAll();

      expect(result).toEqual(products);

      expect(prismaMock.product.findMany).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return a product when it exists', async () => {
      const product = {
        id: productId,
        name: 'Leche Entera',
        brand: 'Hacendado',
        ingredientId: null,
      };

      prismaMock.product.findUnique.mockResolvedValue(product);

      const result = await service.findOne(productId);

      expect(result).toEqual(product);

      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('should throw ProductNotFoundException when product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne(nonExistingId),
      ).rejects.toThrow(ProductNotFoundException);

      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistingId },
      });
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const dto = {
        name: 'Leche Entera',
        brand: 'Hacendado',
      };

      const product = {
        id: productId,
        ingredientId: null,
        ...dto,
      };

      prismaMock.product.findUnique.mockResolvedValue(product);
      prismaMock.product.update.mockResolvedValue(product);

      const result = await service.update(productId, dto);

      expect(result).toEqual(product);

      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });

      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: dto,
      });
    });

    it('should throw ProductNotFoundException when product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      await expect(
        service.update(nonExistingId, {
          name: 'Pasta',
        }),
      ).rejects.toThrow(ProductNotFoundException);

      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistingId },
      });

      expect(prismaMock.product.update).not.toHaveBeenCalled();
    });

    it('should throw IngredientNotFoundException when ingredient does not exist', async () => {
      const product = {
        id: productId,
        name: 'Leche Entera',
        brand: 'Hacendado',
        ingredientId: null,
      };

      prismaMock.product.findUnique.mockResolvedValue(product);
      prismaMock.ingredient.findUnique.mockResolvedValue(null);

      await expect(
        service.update(productId, {
          ingredientId: nonExistingId,
        }),
      ).rejects.toThrow(IngredientNotFoundException);

      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });

      expect(prismaMock.ingredient.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistingId },
      });

      expect(prismaMock.product.update).not.toHaveBeenCalled();
    });

  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const product = {
        id: productId,
        name: 'Leche Entera',
        brand: 'Hacendado',
        ingredientId: null,
      };

      prismaMock.product.findUnique.mockResolvedValue(product);
      prismaMock.product.delete.mockResolvedValue();

      const result = await service.delete(productId);

      expect(result).toBeUndefined();

      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });

      expect(prismaMock.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('should throw ProductNotFoundException when product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      await expect(
        service.delete(nonExistingId),
      ).rejects.toThrow(ProductNotFoundException);

      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistingId },
      });

      expect(prismaMock.product.delete).not.toHaveBeenCalled();
    });
  });
});
