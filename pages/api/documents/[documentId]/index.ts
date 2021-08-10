import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import prisma from '../../../../lib/prisma'

export default async function protectedHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })
  const { method, query } = req;
  const documentId = query.documentId as string;
  
  if (!session) {
    return res.status(401).send({
      success: false,
      error: "you must be sign in to view the protected content on this page.",
    })
  }

  switch(method) {
    case 'GET':
      try {
        const documentTemplate = await prisma.documentTemplate.findUnique({
          where: {
            id: documentId,
          },
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            fileLastModifiedDate: true,
            createdAt: true,
            updatedAt: true,
            forms: true,
          },
        })

        return res.status(200).json({
          id: documentTemplate!.id,
          name: documentTemplate!.fileName,
          fileUrl: `/api/documents/${documentId}/file`,
          createdAt: documentTemplate!.createdAt,
          updatedAt: documentTemplate!.updatedAt,
        })
      } catch (error) {
        console.error(error)
        return res.status(400).json({
          success: false,
        })
      }
    case 'DELETE':
      try {
        await prisma.submission.deleteMany({
          where: {
            documentTemplateId: documentId,
          }
        })

        await prisma.form.deleteMany({
          where: {
            documentTemplateId: documentId,
          }
        })

        await prisma.documentTemplate.delete({
          where: {
            id: documentId,
          }
        })

        return res.status(204).json({ })
      } catch (error) {
        console.error(error)
        return res.status(400).json({
          success: false,
        })
      }
    default:
      // res.setHeaders("Allow", ["GET", "POST"])
      return res.status(405).json({
        success: false,
        error: `Method '${method}' Not Allowed`
      })
  }
}