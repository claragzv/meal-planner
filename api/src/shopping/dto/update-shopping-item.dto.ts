import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateShoppingItemDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  checked: boolean;
}
