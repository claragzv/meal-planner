import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { MealsController } from './meals.controller.js';
import { MealsService } from './meals.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [MealsController],
  providers: [MealsService],
})
export class MealsModule {}
