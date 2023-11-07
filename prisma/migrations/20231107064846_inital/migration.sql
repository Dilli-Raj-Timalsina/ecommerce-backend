/*
  Warnings:

  - A unique constraint covering the columns `[category]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "lastUpdated" TIMESTAMP(3),
ADD COLUMN     "sideImages" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "products_category_key" ON "products"("category");
