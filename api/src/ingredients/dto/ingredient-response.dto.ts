import { ApiProperty } from '@nestjs/swagger';

export class IngredientResponseDto {
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        format: 'uuid',
    })
    id: string;

    @ApiProperty({
        example: 'Pasta',
        description: 'Name of the ingredient',
    })
    name: string;

    @ApiProperty({
        example: 'g',
        description: 'Default unit used for the ingredient',
    })
    defaultUnit: string;
}