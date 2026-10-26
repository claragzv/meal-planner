import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddShoppingItemToInventoryDto {
  @ApiPropertyOptional({ example: 1, minimum: 0.001, description: 'Quantity purchased; defaults to the full pending quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  quantity?: number;

  @ApiPropertyOptional({ example: 'l', description: 'Unit of the purchased quantity; defaults to the shopping item unit' })
  @IsOptional()
  @IsString()
  unit?: string;
}
