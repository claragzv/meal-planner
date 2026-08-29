import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { jest } from '@jest/globals';
import { Product } from 'generated/prisma/client.js';

describe('ProductsController', () => {
  let controller: ProductsController;

  const productId = '550e8400-e29b-41d4-a716-446655440000';

  const productsServiceMock = {
    create: jest.fn<() => Promise<Product>>(),
    findAll: jest.fn<() => Promise<Product[]>>(),
    findOne: jest.fn<() => Promise<Product>>(),
    update: jest.fn<() => Promise<Product>>(),
    delete: jest.fn<() => Promise<void>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: productsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      ];

      productsServiceMock.findAll.mockResolvedValue(products);

      const result = await controller.findAll();

      expect(result).toEqual(products);

      expect(productsServiceMock.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      const product = {
        id: productId,
        name: 'Leche Entera',
        brand: 'Hacendado',
        ingredientId: null,
      };

      productsServiceMock.findOne.mockResolvedValue(product);

      const result = await controller.findOne(productId);

      expect(result).toEqual(product);

      expect(productsServiceMock.findOne).toHaveBeenCalledWith(productId);
    });
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

      productsServiceMock.create.mockResolvedValue(product);

      const result = await controller.create(dto);

      expect(result).toEqual(product);

      expect(productsServiceMock.create).toHaveBeenCalledWith(dto);
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
        name: 'Leche Entera',
        brand: 'Hacendado',
        ingredientId: null,
      };

      productsServiceMock.update.mockResolvedValue(product);

      const result = await controller.update(productId, dto);

      expect(result).toEqual(product);

      expect(productsServiceMock.update).toHaveBeenCalledWith(
        productId,
        dto,
      );
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      productsServiceMock.delete.mockResolvedValue(undefined);

      const result = await controller.delete(productId);

      expect(result).toBeUndefined();

      expect(productsServiceMock.delete).toHaveBeenCalledWith(productId);
    });
  });
});