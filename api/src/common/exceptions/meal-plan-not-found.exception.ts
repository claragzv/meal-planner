import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception.js';

export class MealPlanNotFoundException extends AppException {
  constructor(id: string) {
    super(HttpStatus.NOT_FOUND, 'MEAL_PLAN_NOT_FOUND', `Meal plan with id ${id} not found`);
  }
}
