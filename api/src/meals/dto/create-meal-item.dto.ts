import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsUUID, Min, ValidateIf } from 'class-validator';

export enum MealItemKind {
  Recipe = 'recipe',
  Ingredient = 'ingredient',
  Product = 'product',
}

export class CreateMealItemDto {
  @ApiProperty({ enum: MealItemKind, example: MealItemKind.Recipe })
  @IsEnum(MealItemKind)
  type: MealItemKind;

  @ApiProperty({ required: false, format: 'uuid' })
  @ValidateIf((item: CreateMealItemDto) => item.type === MealItemKind.Recipe)
  @IsUUID()
  recipeId?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @ValidateIf((item: CreateMealItemDto) => item.type === MealItemKind.Ingredient)
  @IsUUID()
  ingredientId?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @ValidateIf((item: CreateMealItemDto) => item.type === MealItemKind.Product)
  @IsUUID()
  productId?: string;

  @ApiProperty({ required: false, example: 2, minimum: 0.001 })
  @ValidateIf((item: CreateMealItemDto) => item.type === MealItemKind.Recipe)
  @IsNumber()
  @Min(0.001)
  servings?: number;

  @ApiProperty({ required: false, example: 1, minimum: 0.001 })
  @ValidateIf((item: CreateMealItemDto) => item.type === MealItemKind.Ingredient || item.type === MealItemKind.Product)
  @IsNumber()
  @Min(0.001)
  quantity?: number;

  @ApiProperty({ required: false, example: 'g' })
  @ValidateIf((item: CreateMealItemDto) => item.type === MealItemKind.Ingredient || item.type === MealItemKind.Product)
  @IsString()
  unit?: string;
}
