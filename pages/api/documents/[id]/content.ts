import Docxtemplater from "docxtemplater";
import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import prisma from '../../../../lib/prisma'
import errorHandler from "../../../../utils/error-handler";
import formidable from 'formidable';

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
  const session = await getSession({ req })
  const { method, query } = req;
  
  /*if (!session) {
    return res.status(401).send({
      success: false,
      error: "you must be sign in to view the protected content on this page.",
    })
  }*/

  switch(method) {
    case 'GET':
      try {
        const documentTemplate = await prisma.documentTemplate.findUnique({
          where: {
            id: query.id as string,
          },
          select: {
            file: true,
            fileName: true,
            fileType: true,
          },
        })

        res.setHeader("Content-disposition", 'attachment; filename=' + documentTemplate!.fileName);
        res.setHeader("Content-Type", documentTemplate!.fileType);
        return res.send(documentTemplate!.file)
      } catch (error) {
        console.error(error)
        return res.status(400).json({
          success: false,
        })
      }
    case 'POST':
      try {
        const data: FormidableData = await new Promise((resolve, reject) => {
          const form = formidable()

          form.parse(req, (err, fields, files) => {
            if (err) reject({ err })
            resolve({ err, fields, files })
          }) 
        })

        const documentTemplate = await prisma.documentTemplate.findUnique({
          where: {
            id: query.id as string,
          },
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
        })

        const zip = new PizZip(documentTemplate!.file);
        let doc;
        try {
          doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
        } catch(error) {
          // Catch compilation errors (errors caused by the compilation of the template: misplaced tags)
          errorHandler(error);
        }

        doc = doc as Docxtemplater

        //set the templateVariables
        doc.setData(data.fields);

        try {
            // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
            doc.render()
        }
        catch (error) {
            // Catch rendering errors (errors relating to the rendering of the template: angularParser throws an error)
            errorHandler(error);
        }

        var buf = doc.getZip()
          .generate({type: 'nodebuffer'});

        res.setHeader("Content-disposition", 'attachment; filename=' + documentTemplate!.fileName);
        res.setHeader("Content-Type", documentTemplate!.fileType);
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

