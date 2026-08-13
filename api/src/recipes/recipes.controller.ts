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
  ParseIntPipe
} from '@nestjs/common';
import { RecipesService } from './recipes.service.js';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { UpdateRecipeDto } from './dto/update-recipe.dto.js';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  findAll() {
    return this.recipesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.delete(id);
  }
}
