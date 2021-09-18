import { env } from 'process'

export default function getServerURL(path: string) {
  const modifiedPath = path.replace(/(\/?)(.*)/, '$2')
  return `${env.SERVER_URI_PROTOCOL}://${env.SERVER_URI_AUTHORITY}/${modifiedPath}`;
}