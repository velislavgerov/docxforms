import { getSession } from "next-auth/client"
import type { NextApiRequest, NextApiResponse } from "next"

import fs from 'fs';
import formidable from 'formidable';

import prisma from '../../../lib/prisma'

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default async function protectedHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })
  const { method } = req;

  if (!session) {
    return res.status(401).send({
      success: false,
      error: "you must be sign in to view the protected content on this page.",
    })
  }

  switch(method) {
    case 'GET':
      try {
        const documentTemplates = await prisma.documentTemplate.findMany({
          where: {
            userId: {
              equals: session.userId,
            }
          },
        })

        return res.send({
          documentTemplates,
          success: true,
          content:
            "This is protected content. You can access this content because you are signed in.",
        })
      } catch (error) {
				return res.status(400).json({
					success: false,
				})
			}
    case 'POST':
      try {
        const form = formidable({ multiples: true });
        form.parse(req, async (err, fields, files) => {
          if (err) {
            return res.status(400).json({
              success: false,
              error: `Could not upload file`
            });
          }

          const file = files.file as formidable.File;
          const buffer = fs.readFileSync(file.path);
          const documentTemplate = await prisma.documentTemplate.create({
            data: {
              userId: session.userId,
              fileName: file.name!,
              fileType: file.type!,
              fileSize: file.size!,
              file: buffer,
              fileLastModifiedDate: file.lastModifiedDate!,
            },
          })

          return res.status(200).json({
            fields,
            files,
            success: true,
          })
        })

        return;
      } catch (error) {
				return res.status(400).json({
					success: false,
				})
			}
    default:
      //res.setHeaders("Allow", ["GET", "POST"])
      return res.status(405).json({
        success: false,
        error: `Method '${method}' Not Allowed`
      })
  }
}
