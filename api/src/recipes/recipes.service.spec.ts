import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { RecipesService } from './recipes.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Recipe } from 'generated/prisma/client.js';

describe('RecipesService', () => {
  let service: RecipesService;

  const prismaMock = {
    recipe: {
      create: jest.fn<() => Promise<Recipe>>(),
      findMany: jest.fn<() => Promise<Recipe[]>>(),
      findUnique: jest.fn<() => Promise<Recipe | null>>(),
      update: jest.fn<() => Promise<Recipe>>(),
      delete: jest.fn<() => Promise<Recipe>>(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a recipe', async () => {
      const dto = {
        name: 'Pasta carbonara',
        description: 'Pasta con huevo y queso',
        prepTime: 25,
      };

      const recipe = {
        id: 1,
        ...dto,
      };

      prismaMock.recipe.create.mockResolvedValue(recipe);

      const result = await service.create(dto);

      expect(result).toEqual(recipe);

      expect(prismaMock.recipe.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  describe('findOne', () => {
    it('should return a recipe when it exists', async () => {
      const recipe = {
        id: 1,
        name: 'Pasta carbonara',
        description: 'Pasta con huevo y queso',
        prepTime: 25,
      };

      // "Cuando el service pregunte a Prisma por esta receta, simula que Prisma la encuentra."
      prismaMock.recipe.findUnique.mockResolvedValue(recipe);

      const result = await service.findOne(1);

      expect(result).toEqual(recipe);

      expect(prismaMock.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when recipe does not exist', async () => {
      prismaMock.recipe.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);

      expect(prismaMock.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('findAll', () => {
    it('should return all recipes', async () => {
      const recipes = [
        {
          id: 1,
          name: 'Pasta carbonara',
          description: 'Pasta con huevo y queso',
          prepTime: 25,
        },
        {
          id: 2,
          name: 'Pizza',
          description: 'Pizza de mozzarella',
          prepTime: 40,
        },
      ];

      prismaMock.recipe.findMany.mockResolvedValue(recipes);

      const result = await service.findAll();

      expect(result).toEqual(recipes);

      expect(prismaMock.recipe.findMany).toHaveBeenCalledWith();
    });
  });

  describe('update', () => {
    it('should update a recipe', async () => {
      const dto = {
        name: 'Pasta carbonara mejorada',
        description: 'Pasta con huevo, queso y panceta',
        prepTime: 30,
      };

      const recipe = {
        id: 1,
        ...dto,
      };

      prismaMock.recipe.findUnique.mockResolvedValue(recipe);
      prismaMock.recipe.update.mockResolvedValue(recipe);

      const result = await service.update(1, dto);

      expect(result).toEqual(recipe);

      expect(prismaMock.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(prismaMock.recipe.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
      });
    });

    it('should throw NotFoundException when recipe does not exist', async () => {
      prismaMock.recipe.findUnique.mockResolvedValue(null);

      await expect(
        service.update(999, {
          name: 'Pasta',
          description: 'Descripción',
          prepTime: 20,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });

      // esto comprueba que si no existe, Prisma no ejecuta el update
      expect(prismaMock.recipe.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a recipe', async () => {
      const recipe = {
        id: 1,
        name: 'Pasta carbonara',
        description: 'Pasta con huevo y queso',
        prepTime: 25,
      };

      prismaMock.recipe.findUnique.mockResolvedValue(recipe);
      prismaMock.recipe.delete.mockResolvedValue(recipe);

      const result = await service.delete(1);

      expect(result).toEqual(recipe);

      expect(prismaMock.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(prismaMock.recipe.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when recipe does not exist', async () => {
      prismaMock.recipe.findUnique.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);

      expect(prismaMock.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });

      expect(prismaMock.recipe.delete).not.toHaveBeenCalled();
    });
  });
});

