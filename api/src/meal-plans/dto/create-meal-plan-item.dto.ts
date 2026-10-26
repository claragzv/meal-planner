import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsUUID } from 'class-validator';

export const MealMoment = {
  Breakfast: 'breakfast',
  Lunch: 'lunch',
  Dinner: 'dinner',
  Snack: 'snack',
} as const;

export type MealMomentType = (typeof MealMoment)[keyof typeof MealMoment];

export class CreateMealPlanItemDto {
  @ApiProperty({ format: 'uuid', example: 'b304bdc4-d757-4dd9-a773-d03a560cc51d' })
  @IsUUID()
  mealId: string;

  @ApiProperty({ example: '2026-10-26', description: 'Calendar date in YYYY-MM-DD format' })
  @IsDateString({ strict: true })
  date: string;

  @ApiProperty({ enum: Object.values(MealMoment), example: MealMoment.Breakfast })
  @IsIn(Object.values(MealMoment))
  moment: MealMomentType;
}
