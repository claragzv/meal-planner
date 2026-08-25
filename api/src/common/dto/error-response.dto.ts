import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty({
        example: 404,
    })
    statusCode: number;

    @ApiProperty({
        example: 'RECIPE_NOT_FOUND',
    })
    code: string;

    @ApiProperty({
        example:
            'Recipe with id 550e8400-e29b-41d4-a716-446655440000 not found',
    })
    message: string;
}