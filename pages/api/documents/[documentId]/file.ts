import type { NextApiRequest, NextApiResponse } from "next"
import prisma from '../../../../lib/prisma'

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default async function protectedHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const documentId = query.documentId as string;

  switch(method) {
    case 'GET':
      try {
        const documentTemplate = await prisma.documentTemplate.findUnique({
          where: {
            id: documentId,
          },
          select: {
            file: true,
            fileName: true,
            fileType: true,
          },
        })

        res.setHeader("Content-disposition", `attachment; filename=${documentTemplate!.fileName}`);
        res.setHeader("Content-Type", documentTemplate!.fileType);
        return res.send(documentTemplate!.file)
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

