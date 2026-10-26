import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception.js';

export class MealItemNotFoundException extends AppException {
  constructor(id: string) {
    super(HttpStatus.NOT_FOUND, 'MEAL_ITEM_NOT_FOUND', `Meal item with id ${id} not found`);
  }
}
