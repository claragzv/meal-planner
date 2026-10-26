import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SetNutritionDto } from './dto/set-nutrition.dto.js';
import { NutritionService } from './nutrition.service.js';

@ApiTags('nutrition')
@Controller()
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Put('ingredients/:id/nutrition')
  setIngredientNutrition(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: SetNutritionDto) {
    return this.nutritionService.setIngredientNutrition(id, dto);
  }

  @Delete('ingredients/:id/nutrition')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeIngredientNutrition(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.nutritionService.removeIngredientNutrition(id);
  }

  @Put('products/:id/nutrition')
  setProductNutrition(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: SetNutritionDto) {
    return this.nutritionService.setProductNutrition(id, dto);
  }

  @Delete('products/:id/nutrition')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProductNutrition(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.nutritionService.removeProductNutrition(id);
  }

  @Get('recipes/:id/nutrition')
  calculateRecipe(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.nutritionService.calculateRecipe(id);
  }

  @Get('meals/:id/nutrition')
  calculateMeal(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.nutritionService.calculateMeal(id);
  }
}
