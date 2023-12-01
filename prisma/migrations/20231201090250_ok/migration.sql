/*
  Warnings:

  - You are about to drop the column `cart` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "cart";

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "amount" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
