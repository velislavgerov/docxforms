import { getSession } from "next-auth/client"
import type { NextApiRequest, NextApiResponse } from "next"

import fs from 'fs';
import formidable from 'formidable';
import { PrismaClient } from '@prisma/client';

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

const prisma = new PrismaClient()

export default async function protectedHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })
  
  if (session) {
    if (req.method === 'POST') {
      const form = formidable({ multiples: true });
      form.parse(req, async (err, fields, files) => {
        console.log(err, fields, files);
        if (err) {
          return res.status(500).json({ error: `Could not upload file` });
        }

        const file = fs.readFileSync(files.file.path);
        const documentTemplate = await prisma.documentTemplate.create({
          data: {
            userId: session.userId,
            fileName: files.file.name,
            fileType: files.file.type,
            fileSize: files.file.size,
            file,
            fileLastModifiedDate: files.file.lastModifiedDate,
          },
        })
        console.log(documentTemplate);
        return res.status(200).json({ fields, files });
      });

      return;
    } else if (req.method === 'GET') {
      const documentTemplates = await prisma.documentTemplate.findMany({
        where: {
          userId: {
            equals: session.userId,
          }
        },
      })

      return res.send({
        documentTemplates,
        content:
          "This is protected content. You can access this content because you are signed in.",
      })
    } else {
      // Handle any other HTTP method
      return res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
    }
  } else {
    return res.send({
      error: "You must be sign in to view the protected content on this page.",
    })
  }
}
