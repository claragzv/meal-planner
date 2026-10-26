import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RecipesModule } from './recipes/recipes.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { IngredientsModule } from './ingredients/ingredients.module.js';
import { ProductsModule } from './products/products.module.js';
import { MealsModule } from './meals/meals.module.js';
import { MealPlansModule } from './meal-plans/meal-plans.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RecipesModule,
    PrismaModule,
    IngredientsModule,
    ProductsModule,
    MealsModule,
    MealPlansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
