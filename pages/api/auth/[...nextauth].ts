import NextAuth from "next-auth"
import Providers from "next-auth/providers"
import { PrismaAdapter } from "@next-auth/prisma-adapter"

import prisma from '../../../lib/db/prisma'

export default NextAuth({
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Providers.Auth0({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      domain: process.env.AUTH0_DOMAIN,
      authorizationUrl: `https://${process.env.AUTH0_DOMAIN}/authorize?response_type=code&prompt=login`,
      profile: (profile: any) => ({
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
      }),
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session: async (session, user) => {
      // eslint-disable-next-line no-param-reassign
      session.userId = user.id as string;    
      return Promise.resolve(session);
    }
  }
})
