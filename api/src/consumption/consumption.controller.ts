import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConsumeMealItemDto } from '../meals/dto/consume-meal-item.dto.js';
import { ConsumptionService } from './consumption.service.js';

@ApiTags('consumption')
@Controller('meal-items/:mealItemId')
export class ConsumptionController {
  constructor(private readonly consumptionService: ConsumptionService) {}

  @Get('consumables')
  getConsumables(@Param('mealItemId', new ParseUUIDPipe()) mealItemId: string) {
    return this.consumptionService.getConsumables(mealItemId);
  }

  @Post('consume')
  consume(
    @Param('mealItemId', new ParseUUIDPipe()) mealItemId: string,
    @Body() dto: ConsumeMealItemDto,
  ) {
    return this.consumptionService.consume(mealItemId, dto);
  }
}
