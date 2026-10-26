-- CreateEnum
CREATE TYPE "NutritionBasisUnit" AS ENUM ('g', 'ml');

-- CreateTable
CREATE TABLE "Nutrition" (
    "id" TEXT NOT NULL,
    "basisQuantity" DOUBLE PRECISION NOT NULL,
    "basisUnit" "NutritionBasisUnit" NOT NULL,
    "calories" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "carbohydrates" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "fiber" DOUBLE PRECISION,
    "sugar" DOUBLE PRECISION,
    "saturatedFat" DOUBLE PRECISION,
    "salt" DOUBLE PRECISION,
    "ingredientId" TEXT,
    "productId" TEXT,

    CONSTRAINT "Nutrition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Nutrition_ingredientId_key" ON "Nutrition"("ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "Nutrition_productId_key" ON "Nutrition"("productId");

-- AddForeignKey
ALTER TABLE "Nutrition" ADD CONSTRAINT "Nutrition_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nutrition" ADD CONSTRAINT "Nutrition_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
