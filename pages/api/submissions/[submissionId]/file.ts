import type { NextApiRequest, NextApiResponse } from "next"

import prisma from '../../../../lib/db/prisma'

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
  const submissionId = query.submissionId as string;

  switch(method) {
    case 'GET':
      try {
        const submission = await prisma.submission.findUnique({
          where: {
            id: submissionId,
          },
          select: {
            file: true,
            fileName: true,
            fileType: true,
          },
        })

        res.setHeader("Content-disposition", `attachment; filename=${submission!.fileName}`);
        res.setHeader("Content-Type", submission!.fileType);
        return res.send(submission!.file)
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

