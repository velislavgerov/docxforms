import Docxtemplater from "docxtemplater"
import type { NextApiRequest, NextApiResponse } from "next"

import prisma from '../../../lib/db/prisma'
import errorHandler from "../../../lib/utils/error-handler"
import formidable from 'formidable'
import { getSession } from "next-auth/client"

const PizZip = require('pizzip')

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default async function protectedHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req
  const session = await getSession({ req })
  const formId  = query.formId as string
  
  switch(method) {
    case 'POST':
      try {
        const data: FormidableData = await new Promise((resolve, reject) => {
          const form = formidable()

          form.parse(req, (err, fields, files) => {
            if (err) reject({ err })
            resolve({ err, fields, files })
          }) 
        })

        const form = await prisma.form.findUnique({
          where: {
            id: formId,
          },
          include: {
            documentTemplate: {
              select: {
                id: true,
                file: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                fileLastModifiedDate: true,
                createdAt: true,
                updatedAt: true,
                forms: true,
              },
            },
          },
        })

        const zip = new PizZip(form!.documentTemplate!.file);
        let doc;
        try {
          doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
        } catch(error) {
          // Catch compilation errors (errors caused by the compilation of the template: misplaced tags)
          errorHandler(error)
        }

        doc = doc as Docxtemplater

        // set the templateVariables
        doc.setData(data.fields)

        try {
            // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
            doc.render()
        }
        catch (error) {
            // Catch rendering errors (errors relating to the rendering of the template: angularParser throws an error)
            errorHandler(error);
        }

        const buf = doc.getZip()
          .generate({type: 'nodebuffer'})

        await prisma.submission.create({
          data: {
            documentTemplateId: form!.documentTemplate!.id,
            formId: form!.documentTemplate!.forms[0]!.id,
            content: data.fields,
            fileName: form!.documentTemplate!.fileName,
            fileType: form!.documentTemplate!.fileType,
            fileSize: Buffer.byteLength(buf),
            file: buf,
            userId: session != null ? session.userId : null,
          }
        })

        res.setHeader("Content-disposition", `attachment; filename=${form!.documentTemplate!.fileName}`);
        res.setHeader("Content-Type", form!.documentTemplate!.fileType)
        return res.send(buf)
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
