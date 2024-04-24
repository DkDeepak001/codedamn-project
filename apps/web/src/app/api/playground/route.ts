import { copyS3Folder } from "@/libs/copyToS3"
import { PlayGrounds, prisma } from "@repo/database"


export async function POST(req: Request) {
  const { projectName, language, userId } = await req.json() as CreateRequsetData
  if (!projectName || !language || !userId) return Response.json({ message: "error" })
  console.log(projectName, language, userId)
  const fileLocation = await copyS3Folder({ baseCodeUrl: language.baseCodeUri!, projectName: projectName, userId })

  const creatingContainer = await fetch(`${process.env.BACKEND_URL}/script`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: "POST",
    body: JSON.stringify({ userId: `${userId}-${projectName}`, s3Url: fileLocation })
  })

  const res = await creatingContainer?.json()
  console.log(res)
  const project = await prisma.projects.create({
    data: {
      title: projectName,
      userId: userId,
      playGroundId: language.id,
      fileUrl: `${fileLocation}`,
      terminalUrl: res.terminalUrl,
      outputUrl: res.outputUrl
    }
  })

  return Response.json({ message: "Project Created", project })
}





type CreateRequsetData = {
  userId: string,
  language: PlayGrounds,
  projectName: string
}

