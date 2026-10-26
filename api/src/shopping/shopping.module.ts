import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ShoppingController } from './shopping.controller.js';
import { ShoppingItemsController } from './shopping-items.controller.js';
import { ShoppingService } from './shopping.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [ShoppingController, ShoppingItemsController],
  providers: [ShoppingService],
})
export class ShoppingModule {}
