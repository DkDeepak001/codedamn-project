import { s3 } from "@/libs/s3"


export async function POST(req: Request) {

  const { filePath, content } = await req.json()
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME ?? "",
    Key: `${filePath}`,
    Body: content
  }
  await s3.putObject(params).promise()


  return Response.json({ message: "Changes updated", })
}







