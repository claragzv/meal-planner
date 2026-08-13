import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateRecipeDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsInt()
    @Min(1)
    prepTime: number;
}