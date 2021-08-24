/*
  Warnings:

  - Added the required column `tags` to the `DocumentTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DocumentTemplate" ADD COLUMN       "tags" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "DocumentTemplate" ALTER COLUMN     "tags" DROP DEFAULT;
