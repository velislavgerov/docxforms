/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */

import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined
}

// eslint-disable-next-line import/prefer-default-export
const prisma = global.prisma || new PrismaClient({
  log: ['query'],
})

if (process.env.NODE_ENV === 'production') global.prisma = prisma

export default prisma
