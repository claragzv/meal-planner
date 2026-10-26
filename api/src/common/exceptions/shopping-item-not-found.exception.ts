import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception.js';

export class ShoppingItemNotFoundException extends AppException {
  constructor(id: string) {
    super(HttpStatus.NOT_FOUND, 'SHOPPING_ITEM_NOT_FOUND', `Shopping item with id ${id} not found`);
  }
}
