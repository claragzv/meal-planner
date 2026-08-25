import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  ParseUUIDPipe
} from '@nestjs/common';
import { RecipesService } from './recipes.service.js';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { UpdateRecipeDto } from './dto/update-recipe.dto.js';
import { RecipeResponseDto } from './dto/recipe-response.dto.js';

import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { ValidationErrorResponseDto } from '../common/dto/validation-error-response.dto.js';

import {
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Recipe created successfully',
    type: RecipeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns all recipes',
    type: RecipeResponseDto,
    isArray: true,
  })
  findAll() {
    return this.recipesService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'Recipe UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the recipe with the given id',
    type: RecipeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid recipe id',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recipe not found',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.recipesService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    description: 'Recipe UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Recipe updated successfully',
    type: RecipeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid recipe id or validation error',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recipe not found',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    name: 'id',
    description: 'Recipe UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Recipe deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid recipe id',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recipe not found',
    type: ErrorResponseDto,
  })
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.recipesService.delete(id);
  }
}
