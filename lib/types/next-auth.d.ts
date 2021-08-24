/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
import { Session } from "next-auth"

declare module "next-auth" {
  interface Session {
    userId: string
  }
}