import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsUUID, Min, ValidateIf } from 'class-validator';

export enum InventoryItemKind {
  Ingredient = 'ingredient',
  Product = 'product',
}

export class CreateInventoryItemDto {
  @ApiProperty({ enum: InventoryItemKind, example: InventoryItemKind.Ingredient })
  @IsEnum(InventoryItemKind)
  type: InventoryItemKind;

  @ApiProperty({ required: false, format: 'uuid' })
  @ValidateIf((item: CreateInventoryItemDto) => item.type === InventoryItemKind.Ingredient)
  @IsUUID()
  ingredientId?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @ValidateIf((item: CreateInventoryItemDto) => item.type === InventoryItemKind.Product)
  @IsUUID()
  productId?: string;

  @ApiProperty({ example: 500, minimum: 0.001 })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ example: 'g' })
  @IsString()
  unit: string;
}
