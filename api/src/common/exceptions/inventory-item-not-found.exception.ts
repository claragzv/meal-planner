import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception.js';

export class InventoryItemNotFoundException extends AppException {
  constructor(id: string) {
    super(HttpStatus.NOT_FOUND, 'INVENTORY_ITEM_NOT_FOUND', `Inventory item with id ${id} not found`);
  }
}
