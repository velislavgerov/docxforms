import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import prisma from '../../../../lib/db/prisma'

export default async function protectedHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })
  const { method, query } = req;
  const submissionId  = query.submissionId as string;
  
  if (!session) {
    return res.status(401).send({
      success: false,
      error: "Unauthorized.",
    })
  }

  switch(method) {
    case 'DELETE':
      try {
        const submission = await prisma.submission.findUnique({
          where: {
            id: submissionId,
          },
          include: {
            documentTemplate: true,
          }
        })

        if (submission?.documentTemplate.userId !== session.userId) {
          return res.status(404).send({
            success: false,
            error: "Could not find such submission.",
          })
        }

        await prisma.submission.delete({
          where: {
            id: submissionId,
          }
        })

        return res.status(204).json({ success: true })
      } catch (error) {
        console.error(error)
        return res.status(400).json({
          success: false,
        })
      }
    default:
      return res.status(405).json({
        success: false,
        error: `Method '${method}' Not Allowed`
      })
  }
}
