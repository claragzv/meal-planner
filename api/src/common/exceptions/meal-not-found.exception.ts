import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception.js';

export class MealNotFoundException extends AppException {
  constructor(id: string) {
    super(HttpStatus.NOT_FOUND, 'MEAL_NOT_FOUND', `Meal with id ${id} not found`);
  }
}
