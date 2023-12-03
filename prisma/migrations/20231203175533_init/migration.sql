-- CreateTable
CREATE TABLE "heros" (
    "id" SERIAL NOT NULL,
    "h1title" TEXT NOT NULL,
    "h1subTitle" TEXT NOT NULL,
    "h2title" TEXT NOT NULL,
    "h2subTitle" TEXT NOT NULL,
    "h3title" TEXT NOT NULL,
    "h3subTitle" TEXT NOT NULL,
    "imageFirst" TEXT NOT NULL,
    "imageSecond" TEXT NOT NULL,
    "imageThird" TEXT NOT NULL,
    "category1" TEXT NOT NULL,
    "category2" TEXT NOT NULL,
    "category3" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heros_pkey" PRIMARY KEY ("id")
);
