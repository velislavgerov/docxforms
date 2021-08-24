import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import prisma from '../../../../lib/db/prisma'
import { getSchemas } from "../../../../lib/utils/document";

export default async function protectedHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })
  const { method, query, body } = req;
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
        const forms = await prisma.form.findMany({
          where: {
            documentTemplateId: documentId,
          },
          select: {
            id: true,
            schema: true,
            uiSchema: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: [
            {
              createdAt: 'asc',
            },
            {
              updatedAt: 'asc',
            },
            {
              id: 'asc'
            },
          ]
        })

        return res.status(200).json(forms)
      } catch (error) {
        console.error(error)
        return res.status(400).json({
          success: false,
        })
      }
    case 'PUT':
      try {
        let schema
        let uiSchema
        if (body.schema == null || body.uiSchema == null) {
          const documentTemplate = await prisma.documentTemplate.findUnique({
            where: {
              id: documentId,
            },
            select: {
              tags: true,
            },
          })

          const schemas = getSchemas({
            tags: documentTemplate!.tags,
            title: 'New Form',
            description: ''
          })
          
          schema = schemas.schema
          uiSchema = schemas.uiSchema

        } else {
          schema = body.schema
          uiSchema = body.uiSchema
        }

        const form = await prisma.form.create({
          data: {
            userId: session.userId,
            documentTemplateId: documentId,
            schema,
            uiSchema,
          },
          select: {
            id: true,
            schema: true,
            uiSchema: true,
            createdAt: true,
            updatedAt: true,
          }
        })

        return res.status(200).json(form)
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
