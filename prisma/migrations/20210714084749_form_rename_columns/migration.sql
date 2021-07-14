/*
  Warnings:

  - You are about to drop the column `formJson` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `schemaJson` on the `Form` table. All the data in the column will be lost.
  - Added the required column `schema` to the `Form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uiSchema` to the `Form` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Form"
  RENAME COLUMN "schemaJson" TO "schema";

ALTER TABLE "Form"
  RENAME COLUMN "formJson" TO "uiSchema"; 
