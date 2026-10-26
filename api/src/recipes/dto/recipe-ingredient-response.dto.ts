import { ApiProperty } from '@nestjs/swagger';

class IngredientSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Pasta' })
  name: string;

  @ApiProperty({ example: 'g' })
  defaultUnit: string;
}

export class RecipeIngredientResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 200 })
  quantity: number;

  @ApiProperty({ example: 'g' })
  unit: string;

  @ApiProperty({ type: IngredientSummaryDto })
  ingredient: IngredientSummaryDto;
}
