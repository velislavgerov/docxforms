# docxforms

Create web forms to fill .docx files online. Try it at [docxforms.com](https://docxforms.com/)

## Overview

docxforms is a web application that allows you to:
- Upload .docx templates
- Create web forms based on your documents
- Share forms with users to collect data
- Generate filled documents automatically

Visit [docxforms.com](https://docxforms.com/) to start using the application.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [React Bootstrap](https://react-bootstrap.github.io/) - UI components
- [docxtemplater](https://docxtemplater.com/) - Document processing

## Requirements

- Node.js 14.x
- Yarn 3.x
- PostgreSQL database

## Development

1. Install dependencies:
```bash
yarn install
```

2. Set up your environment variables:
```bash
cp .env.example .env
```

3. Run database migrations:
```bash
yarn prisma migrate dev
```

4. Start the development server:
```bash
yarn dev
```

## Deployment

The application is ready to deploy to Heroku. Make sure to set the following environment variables in your Heroku dashboard:

- `DATABASE_URL` - Your PostgreSQL database URL
- `NEXTAUTH_URL` - Your application URL (e.g., https://your-app.herokuapp.com)
- `SECRET` - A random string for NextAuth.js session encryption

Deploy using the Heroku CLI:
```bash
heroku create
git push heroku main
```

## License

ISC © Velislav Gerov
