/*
  Warnings:

  - You are about to drop the column `lastUpdated` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "lastUpdated",
ADD COLUMN     "createdDate" TIMESTAMP(3);
