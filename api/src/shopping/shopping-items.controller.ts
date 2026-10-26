import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateManualShoppingItemDto } from './dto/create-manual-shopping-item.dto.js';
import { UpdateShoppingItemDto } from './dto/update-shopping-item.dto.js';
import { ShoppingService } from './shopping.service.js';

@ApiTags('shopping-items')
@Controller('shopping-items')
export class ShoppingItemsController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateManualShoppingItemDto) {
    return this.shoppingService.createManualItem(dto);
  }

  @Get()
  findAll(@Query('mealPlanId') mealPlanId?: string) {
    return this.shoppingService.findItems(mealPlanId);
  }

  @Patch(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateShoppingItemDto) {
    return this.shoppingService.updateItem(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.shoppingService.deleteItem(id);
  }
}
