import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';

export const NutritionBasisUnits = { Gram: 'g', Milliliter: 'ml' } as const;

export class SetNutritionDto {
  @ApiProperty({ example: 100, minimum: 0.001 })
  @IsNumber()
  @Min(0.001)
  basisQuantity: number;

  @ApiProperty({ enum: Object.values(NutritionBasisUnits), example: 'g' })
  @IsIn(Object.values(NutritionBasisUnits))
  basisUnit: (typeof NutritionBasisUnits)[keyof typeof NutritionBasisUnits];

  @ApiPropertyOptional({ example: 364, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @ApiPropertyOptional({ example: 10.3, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  protein?: number;

  @ApiPropertyOptional({ example: 76.3, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbohydrates?: number;

  @ApiPropertyOptional({ example: 1, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fat?: number;

  @ApiPropertyOptional({ example: 2.7, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fiber?: number;

  @ApiPropertyOptional({ example: 0.3, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sugar?: number;

  @ApiPropertyOptional({ example: 0.2, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  saturatedFat?: number;

  @ApiPropertyOptional({ example: 0.01, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salt?: number;
}
