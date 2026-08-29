import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception.js';

export class IngredientNotFoundException extends AppException {
    constructor(id: string) {
        super(
            HttpStatus.NOT_FOUND,
            'INGREDIENT_NOT_FOUND',
            `Ingredient with id ${id} not found`,
        );
    }
}