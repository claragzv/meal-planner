import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateMealItemDto } from './create-meal-item.dto.js';

export class CreateMealDto {
  @ApiPropertyOptional({ example: 'Desayuno del lunes' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ type: [CreateMealItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealItemDto)
  items?: CreateMealItemDto[];
}
