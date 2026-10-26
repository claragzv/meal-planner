import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({ example: 400, minimum: 0.001 })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  quantity?: number;

  @ApiPropertyOptional({ example: 'g' })
  @IsOptional()
  @IsString()
  unit?: string;
}
