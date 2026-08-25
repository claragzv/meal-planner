import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecipeDto {
    @ApiProperty({
        example: 'Pasta carbonara',
        description: 'Name of the recipe',
        minLength: 1,
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'Pasta con huevo, queso y panceta',
        description: 'Description of the recipe',
        minLength: 1,
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        example: 20,
        description: 'Preparation time in minutes',
        minimum: 1,
        type: Number,
    })
    @IsInt()
    @Min(1)
    prepTime: number;
}