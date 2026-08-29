import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsService } from './ingredients.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { IngredientNotFoundException } from '../common/exceptions/ingredient-not-found.exception.js';
import { jest } from '@jest/globals';
import { Ingredient } from 'generated/prisma/client.js';


describe('IngredientsService', () => {
  let service: IngredientsService;
  const ingredientId = '550e8400-e29b-41d4-a716-446655440000';
  const ingredientId2 = '550e8400-e29b-41d4-a716-446655440001';
  const nonExistingId = '550e8400-e29b-41d4-a716-446655440002';

  const prismaMock = {
    ingredient: {
      create: jest.fn<() => Promise<Ingredient>>(),
      findMany: jest.fn<() => Promise<Ingredient[]>>(),
      findUnique: jest.fn<() => Promise<Ingredient | null>>(),
      update: jest.fn<() => Promise<Ingredient>>(),
      delete: jest.fn<() => Promise<void>>(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<IngredientsService>(IngredientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an ingredient', async () => {
      const dto = {
        name: 'Pasta',
        defaultUnit: 'g',
      };

      const ingredient = {
        id: ingredientId,
        ...dto,
      };

      prismaMock.ingredient.create.mockResolvedValue(ingredient);

      const result = await service.create(dto);

      expect(result).toEqual(ingredient);

      expect(prismaMock.ingredient.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all ingredients', async () => {
      const ingredients = [
        {
          id: ingredientId,
          name: 'Pasta',
          defaultUnit: 'g',
        },
        {
          id: ingredientId2,
          name: 'Milk',
          defaultUnit: 'l',
        },
      ];

      prismaMock.ingredient.findMany.mockResolvedValue(ingredients);

      const result = await service.findAll();

      expect(result).toEqual(ingredients);

      expect(prismaMock.ingredient.findMany).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return an ingredient when it exists', async () => {
      const ingredient = {
        id: ingredientId,
        name: 'Pasta',
        defaultUnit: 'g',
      };

      prismaMock.ingredient.findUnique.mockResolvedValue(ingredient);

      const result = await service.findOne(ingredientId);

      expect(result).toEqual(ingredient);

      expect(prismaMock.ingredient.findUnique).toHaveBeenCalledWith({
        where: { id: ingredientId },
      });
    });

    it('should throw IngredientNotFoundException when ingredient does not exist', async () => {
      prismaMock.ingredient.findUnique.mockResolvedValue(null);

      await expect(service.findOne(nonExistingId)).rejects.toThrow(IngredientNotFoundException);

      expect(prismaMock.ingredient.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistingId },
      });
    });
  });

  describe('update', () => {
    it('should update an ingredient', async () => {
      const dto = {
        name: 'Milk',
        defaultUnit: 'l',
      };

      const ingredient = {
        id: ingredientId,
        ...dto,
      };

      prismaMock.ingredient.findUnique.mockResolvedValue(ingredient);
      prismaMock.ingredient.update.mockResolvedValue(ingredient);

      const result = await service.update(ingredientId, dto);

      expect(result).toEqual(ingredient);

      expect(prismaMock.ingredient.findUnique).toHaveBeenCalledWith({
        where: { id: ingredientId },
      });

      expect(prismaMock.ingredient.update).toHaveBeenCalledWith({
        where: { id: ingredientId },
        data: dto,
      });
    });

    it('should throw IngredientNotFoundException when ingredient does not exist', async () => {
      prismaMock.ingredient.findUnique.mockResolvedValue(null);

      await expect(
        service.update(nonExistingId, {
          name: 'Milk',
          defaultUnit: 'l',
        }),
      ).rejects.toThrow(IngredientNotFoundException);

      expect(prismaMock.ingredient.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistingId },
      });

      // esto comprueba que si no existe, Prisma no ejecuta el update
      expect(prismaMock.ingredient.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an ingredient', async () => {
      const ingredient = {
        id: ingredientId,
        name: 'Milk',
        defaultUnit: 'l',
      };

      prismaMock.ingredient.findUnique.mockResolvedValue(ingredient);
      prismaMock.ingredient.delete.mockResolvedValue();

      const result = await service.delete(ingredientId);

      expect(result).toBeUndefined();

      expect(prismaMock.ingredient.findUnique).toHaveBeenCalledWith({
        where: { id: ingredientId },
      });

      expect(prismaMock.ingredient.delete).toHaveBeenCalledWith({
        where: { id: ingredientId },
      });
    });
  });
});
