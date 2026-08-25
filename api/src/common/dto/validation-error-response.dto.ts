import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorResponseDto {
    @ApiProperty({
        example: 400,
    })
    statusCode: number;

    @ApiProperty({
        example: 'VALIDATION_ERROR',
    })
    code: string;

    @ApiProperty({
        example: ['name should not be empty'],
        type: [String],
    })
    message: string[];
}