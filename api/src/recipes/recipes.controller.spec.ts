import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from './recipes.controller.js';
import { RecipesService } from './recipes.service.js';
import { jest } from '@jest/globals';
import { Recipe } from './entities/recipe.entity.js';

describe('RecipesController', () => {
  let controller: RecipesController;

  const recipesServiceMock = {
    create: jest.fn<() => Promise<Recipe>>(),
    findAll: jest.fn<() => Promise<Recipe[]>>(),
    findOne: jest.fn<() => Promise<Recipe>>(),
    update: jest.fn<() => Promise<Recipe>>(),
    delete: jest.fn<() => Promise<void>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [
        {
          provide: RecipesService,
          useValue: recipesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<RecipesController>(RecipesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      ];

      recipesServiceMock.findAll.mockResolvedValue(recipes);

      const result = await controller.findAll();

      expect(result).toEqual(recipes);

      expect(recipesServiceMock.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a recipe by ID', async () => {
      const recipe = {
        id: 1,
        name: 'Pasta carbonara',
        description: 'Pasta con huevo y queso',
        prepTime: 25,
      };

      recipesServiceMock.findOne.mockResolvedValue(recipe);

      const result = await controller.findOne(1);

      expect(result).toEqual(recipe);

      expect(recipesServiceMock.findOne).toHaveBeenCalledWith(1);
    });
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

      recipesServiceMock.create.mockResolvedValue(recipe);

      const result = await controller.create(dto);

      expect(result).toEqual(recipe);

      expect(recipesServiceMock.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a recipe', async () => {
      const updateDto = {
        name: 'Pasta carbonara actualizada',
        prepTime: 30,
      };

      const updatedRecipe = {
        id: 1,
        name: 'Pasta carbonara actualizada',
        description: 'Pasta con huevo y queso',
        prepTime: 30,
      };

      recipesServiceMock.update.mockResolvedValue(updatedRecipe);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(updatedRecipe);

      expect(recipesServiceMock.update).toHaveBeenCalledWith(
        1,
        updateDto,
      );
    });
  });

  describe('delete', () => {
    it('should delete a recipe', async () => {
      recipesServiceMock.delete.mockResolvedValue(undefined);

      const result = await controller.delete(1);

      expect(result).toBeUndefined();

      expect(recipesServiceMock.delete).toHaveBeenCalledWith(1);
    });
  });
});
