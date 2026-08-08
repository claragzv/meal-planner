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
      findMany: jest.fn(),
      findUnique: jest.fn<() => Promise<Recipe | null>>(),
      update: jest.fn(),
      delete: jest.fn(),
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
});

