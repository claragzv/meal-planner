import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NutritionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 100 })
  basisQuantity: number;

  @ApiProperty({ enum: ['g', 'ml'] })
  basisUnit: string;

  @ApiPropertyOptional({ example: 364, nullable: true })
  calories: number | null;

  @ApiPropertyOptional({ example: 10.3, nullable: true })
  protein: number | null;

  @ApiPropertyOptional({ example: 76.3, nullable: true })
  carbohydrates: number | null;

  @ApiPropertyOptional({ example: 1, nullable: true })
  fat: number | null;

  @ApiPropertyOptional({ example: 2.7, nullable: true })
  fiber: number | null;

  @ApiPropertyOptional({ example: 0.3, nullable: true })
  sugar: number | null;

  @ApiPropertyOptional({ example: 0.2, nullable: true })
  saturatedFat: number | null;

  @ApiPropertyOptional({ example: 0.01, nullable: true })
  salt: number | null;
}
