import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception.js';

export class RecipeNotFoundException extends AppException {
    constructor(id: string) {
        super(
            HttpStatus.NOT_FOUND,
            'RECIPE_NOT_FOUND',
            `Recipe with id ${id} not found`,
        );
    }
}