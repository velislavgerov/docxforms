import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import prisma from '../../../../lib/db/prisma'
import getServerURL from "../../../../lib/utils/server";

export default async function protectedHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })
  const { method, query } = req;
  const documentId  = query.documentId as string;
  
  if (!session) {
    return res.status(401).send({
      success: false,
      error: "you must be sign in to view the protected content on this page.",
    })
  }

  switch(method) {
    case 'GET':
      try {
        const documentTemplate = await prisma.documentTemplate.findFirst({
          where: {
            id: documentId,
            userId: session.userId 
          },
          include: {
            submissions: true,
          }
        })

        const submissions = documentTemplate!.submissions.map(submission => ({
          id: submission.id,
          fileUrl: getServerURL(`/api/submissions/${submission.id}/file`),
          formData: submission.content,
          user: null
        }))

        return res.status(200).json(submissions)
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
