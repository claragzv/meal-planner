import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNumber, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class ConsumeInventoryEntryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  inventoryItemId: string;

  @ApiProperty({ example: 100, minimum: 0.001 })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ example: 'g' })
  @IsString()
  unit: string;
}

export class ConsumeMealItemDto {
  @ApiProperty({ type: [ConsumeInventoryEntryDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ConsumeInventoryEntryDto)
  items: ConsumeInventoryEntryDto[];
}
