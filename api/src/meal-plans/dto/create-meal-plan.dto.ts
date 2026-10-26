import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateMealPlanItemDto } from './create-meal-plan-item.dto.js';

export class CreateMealPlanDto {
  @ApiPropertyOptional({ example: 'Plan semanal' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ type: [CreateMealPlanItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealPlanItemDto)
  items?: CreateMealPlanItemDto[];
}
