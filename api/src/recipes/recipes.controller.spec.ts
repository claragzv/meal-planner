import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from './recipes.controller.js';
import { RecipesService } from './recipes.service.js';
import { jest } from '@jest/globals';

describe('RecipesController', () => {
  let controller: RecipesController;

  const recipesServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
});