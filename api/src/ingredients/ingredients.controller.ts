import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service.js';
import { CreateIngredientDto } from './dto/create-ingredient.dto.js';
import { UpdateIngredientDto } from './dto/update-ingredient.dto.js';
import { IngredientResponseDto } from './dto/ingredient-response.dto.js';

import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { ValidationErrorResponseDto } from '../common/dto/validation-error-response.dto.js';

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(
    private readonly ingredientsService: IngredientsService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Ingredient created successfully',
    type: IngredientResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns all ingredients',
    type: IngredientResponseDto,
    isArray: true,
  })
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'Ingredient UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the ingredient with the given id',
    type: IngredientResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ingredient id',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ingredient not found',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.ingredientsService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    description: 'Ingredient UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingredient updated successfully',
    type: IngredientResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ingredient id',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ingredient not found',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.update(
      id,
      updateIngredientDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    name: 'id',
    description: 'Ingredient UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Ingredient deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ingredient id',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ingredient not found',
    type: ErrorResponseDto,
  })
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.ingredientsService.delete(id);
  }
}