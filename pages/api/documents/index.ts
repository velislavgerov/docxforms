import { getSession } from "next-auth/client"
import type { NextApiRequest, NextApiResponse } from "next"

import fs from 'fs'
import formidable from 'formidable'

import prisma from '../../../lib/prisma'
import { getSchemas } from "../../../utils/document"
import { Prisma } from "@prisma/client"

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
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            fileLastModifiedDate: true,
            createdAt: true,
            updatedAt: true,
          },
        })

        return res.send({
          data: documentTemplates,
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
        const data: FormidableData = await new Promise((resolve, reject) => {
          const form = formidable({ multiples: true })
          form.parse(req, (err, fields, files) => {
            if (err) reject({ err })
            resolve({ err, fields, files })
          }) 
        })
        const { files: { file } } = data;
        const buffer = fs.readFileSync(file.path)
        const { schema, uiSchema } = getSchemas({
          buffer,
          title: file.name!,
          description: ''
        })
        console.log('schema', schema)
        console.log('uiSchema', uiSchema)

        const documentTemplate = await prisma.documentTemplate.create({
          data: {
            userId: session.userId,
            fileName: file.name!,
            fileType: file.type!,
            fileSize: file.size!,
            file: buffer,
            fileLastModifiedDate: file.lastModifiedDate!,
          },
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            fileLastModifiedDate: true,
            createdAt: true,
            updatedAt: true,
          },
        })

        const form = await prisma.form.create({
          data: {
            documentTemplateId: documentTemplate.id,
            schema: schema as Prisma.JsonObject,
            uiSchema: uiSchema as Prisma.JsonObject,
            userId: session.userId
          }
        })
        console.log('form', form);

        return res.status(200).json({
          data: documentTemplate,
          success: true,
        })
      } catch (error) {
        console.log(error)
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
