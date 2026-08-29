import { Module } from '@nestjs/common';
import { IngredientsController } from './ingredients.controller.js';
import { IngredientsService } from './ingredients.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [IngredientsController],
  providers: [IngredientsService],
})
export class IngredientsModule { }
