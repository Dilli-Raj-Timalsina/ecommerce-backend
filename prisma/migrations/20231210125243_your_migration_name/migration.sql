-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('pending', 'completed', 'history');

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "amount" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
