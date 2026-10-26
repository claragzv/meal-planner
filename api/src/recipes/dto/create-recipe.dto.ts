import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateRecipeIngredientDto } from './create-recipe-ingredient.dto.js';

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

    @ApiPropertyOptional({ type: [CreateRecipeIngredientDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateRecipeIngredientDto)
    ingredients?: CreateRecipeIngredientDto[];
}
