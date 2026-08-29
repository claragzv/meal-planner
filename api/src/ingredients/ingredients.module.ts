import { Module } from '@nestjs/common';
import { IngredientsController } from './ingredients.controller.js';
import { IngredientsService } from './ingredients.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProductsModule } from '../products/products.module.js';

@Module({
  imports: [PrismaModule, ProductsModule],
  controllers: [IngredientsController],
  providers: [IngredientsService],
})
export class IngredientsModule { }
