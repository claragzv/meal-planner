import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateIngredientDto {
    @ApiProperty({
        example: 'Leche',
        description: 'Name of the ingredient',
        minLength: 1,
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'l',
        description: 'Default unit used for this ingredient',
    })
    @IsString()
    @IsNotEmpty()
    defaultUnit: string;
}