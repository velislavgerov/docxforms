import express from 'express';
import stream from 'stream';
import fs from 'fs';
import path from 'path';

import createReport from 'docx-templates';

const app = express();
const PORT = process.env.PORT || process.argv[2] || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Download the sample <a href="/sample-template">template</a> or fill out the <a href="/sample-form">form</a>.');
});

app.get('/sample-form', (req, res) => {
  res.send(`<form method="POST" action="/sample-form">
  <label for="first_name">First name:</label><br>
  <input type="text" name="first_name" id="first_name"/><br>
  <label for="last_name">Last name:</label><br>
  <input type="text" name="last_name" id="last_name"/><br>
  <input type="submit" value="Download"/>
</form>`);
});

app.get('/sample-template', (req, res) => {
  res.sendFile('sample-template.docx', { root: path.join(__dirname, '.') });
});

app.post('/sample-form', async (req, res) => {
  const { first_name, last_name } = req.body;

  const template = fs.readFileSync('sample-template.docx');
  const fileName = 'sample-output.docx';
  const mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const buffer = await createReport({
    template,
    data: {
      first_name,
      last_name
    },
    cmdDelimiter: ['{', '}'],
  });

  // source: https://stackoverflow.com/questions/62657362/send-binary-response-from-uint8array-in-express-js
  // Pass your output.docx buffer to this
  const readStream = new stream.PassThrough();
  readStream.end(buffer);
  res.set("Content-disposition", 'attachment; filename=' + fileName);
  res.set("Content-Type", mimeType);
  readStream.pipe(res);
});

app.use(express.urlencoded({
  extended: true
}));

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})