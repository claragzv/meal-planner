import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AddShoppingItemToInventoryDto } from './dto/add-shopping-item-to-inventory.dto.js';
import { ShoppingService } from './shopping.service.js';

@ApiTags('shopping')
@Controller()
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Get('meal-plans/:mealPlanId/shopping-needs')
  calculateNeeds(@Param('mealPlanId', new ParseUUIDPipe()) mealPlanId: string) {
    return this.shoppingService.calculateNeeds(mealPlanId);
  }

  @Post('meal-plans/:mealPlanId/shopping-items/recalculate')
  recalculateShoppingList(@Param('mealPlanId', new ParseUUIDPipe()) mealPlanId: string) {
    return this.shoppingService.recalculateShoppingList(mealPlanId);
  }

  @Post('shopping-items/:id/add-to-inventory')
  addToInventory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AddShoppingItemToInventoryDto,
  ) {
    return this.shoppingService.addToInventory(id, dto);
  }
}
