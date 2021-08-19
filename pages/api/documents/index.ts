import { getSession } from "next-auth/client"
import type { NextApiRequest, NextApiResponse } from "next"

import fs from 'fs'
import formidable from 'formidable'
import { Prisma } from "@prisma/client"

import prisma from '../../../lib/db/prisma'
import { getSchemas, getTags } from "../../../lib/utils/document"
import getServerURL from "../../../lib/utils/server"

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
        
        const data = documentTemplates.map(dt => ({
          id: dt.id,
          name: dt.fileName,
          fileUrl: getServerURL(`/api/documents/${dt.id}/file`),
          createdAt: dt.createdAt,
          updatedAt: dt.updatedAt,
          links: {
            self: {
              href: getServerURL(`/api/documents/${dt.id}`),
              rel: 'self',
              method: 'GET'
            },
            'delete-self': {
              href: getServerURL(`/api/documents/${dt.id}`),
              rel: 'delete-self',
              method: 'DELTE'
            },
            'post-form': {
              href: getServerURL(`/api/documents/${dt.id}/forms`),
              rel: 'post-form',
              method: 'POST'
            }
          }
        }))

        return res.status(200).send(data)
      } catch (error) {
        console.log(error)
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
        const tags = getTags(buffer)
        const { schema, uiSchema } = getSchemas({
          tags,
          title: 'Default Form',
          description: 'This form was automatically created when you uploaded the document.'
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
            tags,
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
          id: documentTemplate!.id,
          name: documentTemplate!.fileName,
          fileUrl: getServerURL(`/api/documents/${documentTemplate.id}/file`),
          createdAt: documentTemplate!.createdAt,
          updatedAt: documentTemplate!.updatedAt,
          links: {
            'self': {
              href: getServerURL(`/api/documents/${documentTemplate.id}`),
              rel: 'self',
              method: 'GET'
            },
            'delete-self': {
              href: getServerURL(`/api/documents/${documentTemplate.id}`),
              rel: 'delete-self',
              method: 'DELTE'
            },
            'post-form': {
              href: getServerURL(`/api/documents/${documentTemplate.id}/forms`),
              rel: 'post-form',
              method: 'POST'
            }
          }
        })
      } catch (error) {
        console.log(error)
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
