import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProductDto {
    @ApiProperty({
        example: 'Leche Entera',
        description: 'Name of the product',
        minLength: 1,
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({
        example: 'Hacendado',
        description: 'Brand of the product',
    })
    @IsOptional()
    @IsString()
    brand?: string;

    @ApiPropertyOptional({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'UUID of the related ingredient',
        format: 'uuid',
    })
    @IsOptional()
    @IsUUID()
    ingredientId?: string;
}
