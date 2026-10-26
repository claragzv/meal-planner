import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateManualShoppingItemDto {
  @ApiProperty({ example: 'Papel de cocina' })
  @IsString()
  name: string;

  @ApiProperty({ example: 2, minimum: 0.001 })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ example: 'unit' })
  @IsString()
  unit: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  ingredientId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  mealPlanId?: string;
}
