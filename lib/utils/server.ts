export default function getServerURL(path: string) {
  const modifiedPath = path.replace(/(\/?)(.*)/, '$2')
  return `${process.env.SERVER_URI_PROTOCOL}://${process.env.SERVER_URI_AUTHORITY}/${modifiedPath}`;
}