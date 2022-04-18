/*
  Warnings:

  - A unique constraint covering the columns `[ah_id]` on the table `ingredient` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ingredient_ah_id_key` ON `ingredient`(`ah_id`);
