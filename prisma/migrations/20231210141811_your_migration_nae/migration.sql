/*
  Warnings:

  - Changed the type of `productId` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "OrderType" ADD VALUE 'cancelled';

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "productId",
ADD COLUMN     "productId" INTEGER NOT NULL;
