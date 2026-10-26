import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateRecipeIngredientDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the ingredient',
    format: 'uuid',
  })
  @IsUUID()
  ingredientId: string;

  @ApiProperty({ example: 200, minimum: 0.001 })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ example: 'g' })
  @IsString()
  unit: string;
}
