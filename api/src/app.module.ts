import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecipesModule } from './recipes/recipes.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [RecipesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
