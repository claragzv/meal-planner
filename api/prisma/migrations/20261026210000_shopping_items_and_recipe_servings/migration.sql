-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "servings" INTEGER NOT NULL DEFAULT 1;

-- CreateEnum
CREATE TYPE "ShoppingItemSourceType" AS ENUM ('meal_plan', 'manual');

-- CreateTable
CREATE TABLE "ShoppingItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ingredientId" TEXT,
    "productId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingItemSource" (
    "id" TEXT NOT NULL,
    "shoppingItemId" TEXT NOT NULL,
    "type" "ShoppingItemSourceType" NOT NULL,
    "mealItemId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingItemSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShoppingItem_ingredientId_idx" ON "ShoppingItem"("ingredientId");

-- CreateIndex
CREATE INDEX "ShoppingItem_productId_idx" ON "ShoppingItem"("productId");

-- CreateIndex
CREATE INDEX "ShoppingItemSource_shoppingItemId_idx" ON "ShoppingItemSource"("shoppingItemId");

-- CreateIndex
CREATE INDEX "ShoppingItemSource_mealItemId_idx" ON "ShoppingItemSource"("mealItemId");

-- AddForeignKey
ALTER TABLE "ShoppingItem" ADD CONSTRAINT "ShoppingItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingItem" ADD CONSTRAINT "ShoppingItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingItemSource" ADD CONSTRAINT "ShoppingItemSource_shoppingItemId_fkey" FOREIGN KEY ("shoppingItemId") REFERENCES "ShoppingItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingItemSource" ADD CONSTRAINT "ShoppingItemSource_mealItemId_fkey" FOREIGN KEY ("mealItemId") REFERENCES "MealItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
