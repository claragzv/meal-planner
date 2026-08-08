import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateRecipeDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsInt()
    @IsPositive()
    prepTime: number;
}