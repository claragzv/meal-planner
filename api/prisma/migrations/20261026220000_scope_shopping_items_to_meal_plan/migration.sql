-- AlterTable
ALTER TABLE "ShoppingItem" ADD COLUMN "mealPlanId" TEXT;

-- CreateIndex
CREATE INDEX "ShoppingItem_mealPlanId_idx" ON "ShoppingItem"("mealPlanId");

-- AddForeignKey
ALTER TABLE "ShoppingItem" ADD CONSTRAINT "ShoppingItem_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
