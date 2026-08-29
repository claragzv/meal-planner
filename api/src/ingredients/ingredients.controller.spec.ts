import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsController } from './ingredients.controller.js';
import { IngredientsService } from './ingredients.service.js';
import { jest } from '@jest/globals';
import { Ingredient } from 'generated/prisma/client.js';

describe('IngredientsController', () => {
  let controller: IngredientsController;
  const ingredientId = '550e8400-e29b-41d4-a716-446655440000';

  const ingredientsServiceMock = {
    create: jest.fn<() => Promise<Ingredient>>(),
    findAll: jest.fn<() => Promise<Ingredient[]>>(),
    findOne: jest.fn<() => Promise<Ingredient>>(),
    update: jest.fn<() => Promise<Ingredient>>(),
    delete: jest.fn<() => Promise<void>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientsController],
      providers: [
        {
          provide: IngredientsService,
          useValue: ingredientsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<IngredientsController>(IngredientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all ingredients', async () => {
      const ingredients = [
        {
          id: ingredientId,
          name: 'Pasta',
          defaultUnit: 'g',
        },
      ];

      ingredientsServiceMock.findAll.mockResolvedValue(ingredients);

      const result = await controller.findAll();

      expect(result).toEqual(ingredients);

      expect(ingredientsServiceMock.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an ingredient by ID', async () => {
      const ingredient = {
        id: ingredientId,
        name: 'Pasta',
        defaultUnit: 'g',
      };

      ingredientsServiceMock.findOne.mockResolvedValue(ingredient);

      const result = await controller.findOne(ingredientId);

      expect(result).toEqual(ingredient);

      expect(ingredientsServiceMock.findOne).toHaveBeenCalledWith(ingredientId);
    });
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

      ingredientsServiceMock.create.mockResolvedValue(ingredient);

      const result = await controller.create(dto);

      expect(result).toEqual(ingredient);

      expect(ingredientsServiceMock.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update an ingredient', async () => {
      const updateDto = {
        name: 'Pasta',
        defaultUnit: 'g',
      };

      const updatedIngredient = {
        id: ingredientId,
        name: 'Pasta',
        defaultUnit: 'g',
      };

      ingredientsServiceMock.update.mockResolvedValue(updatedIngredient);

      const result = await controller.update(ingredientId, updateDto);

      expect(result).toEqual(updatedIngredient);

      expect(ingredientsServiceMock.update).toHaveBeenCalledWith(
        ingredientId,
        updateDto,
      );
    });
  });

  describe('delete', () => {
    it('should delete an ingredient', async () => {
      ingredientsServiceMock.delete.mockResolvedValue(undefined);

      const result = await controller.delete(ingredientId);

      expect(result).toBeUndefined();

      expect(ingredientsServiceMock.delete).toHaveBeenCalledWith(ingredientId);
    });
  });
});

