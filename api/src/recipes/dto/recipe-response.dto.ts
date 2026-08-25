import { ApiProperty } from '@nestjs/swagger';

export class RecipeResponseDto {
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        type: String,
        format: 'uuid',
    })
    id: string;

    @ApiProperty({
        example: 'Pasta carbonara',
    })
    name: string;

    @ApiProperty({
        example: 'Pasta con huevo, queso y panceta',
    })
    description: string;

    @ApiProperty({
        example: 25,
        minimum: 1,
    })
    prepTime: number;
}