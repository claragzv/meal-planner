import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { NutritionController } from './nutrition.controller.js';
import { NutritionService } from './nutrition.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [NutritionController],
  providers: [NutritionService],
})
export class NutritionModule {}
