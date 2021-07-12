import { getSession } from "next-auth/client"
import type { NextApiRequest, NextApiResponse } from "next"

import fs from 'fs'
import formidable from 'formidable'

import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater';
import InspectModule from 'docxtemplater/js/inspect-module'

import prisma from '../../../lib/prisma'
import errorHandler from "../../../utils/error-handler"
import { PessimisticLockTransactionRequiredError } from "typeorm"
import { JsonSchema } from "@jsonforms/core"

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
        const webForm = formidable({ multiples: true });
        const file = await new Promise((resolve, reject) => {
          webForm.parse(req, async (err, fields, files) => {
            if (err) {
              reject(err as Error)
            }
            resolve(files.file as formidable.File)
          })
        })

        const buffer = fs.readFileSync(file.path);
        var zip = new PizZip(buffer);
        const iModule = InspectModule();
        let doc;
        try {
          doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            modules: [iModule]
          });
        } catch(error) {
          // Catch compilation errors (errors caused by the compilation of the template: misplaced tags)
          errorHandler(error);
        }

        let tags = iModule.getAllTags();
        console.log('tags', tags);

        let schema: JsonSchema = {
          title: file.name!,
          description: '',
          type: 'object',
          required: [],
          properties: {},
        };

        for (const [key, value] of Object.entries(tags)) {
          console.log(`${key}: ${value}`);
          tags[key]['type'] = 'string';
          schema.required?.push(key)
        }
        schema.properties = tags;

        console.log('schema', schema);

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
            schemaJson: JSON.stringify(schema),
            formJson: '{}',
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
