import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty({
        example: 404,
        description: 'HTTP status code',
    })
    statusCode: number;

    @ApiProperty({
        example: 'ENTITY_NOT_FOUND',
        description: 'Application-specific error code',
    })
    code: string;

    @ApiProperty({
        example:
            'Entity with id 550e8400-e29b-41d4-a716-446655440000 not found',
        description: 'Human-readable error message',
    })
    message: string;
}