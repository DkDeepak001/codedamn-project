import { copyS3Folder } from "@/libs/copyToS3"
import { PlayGrounds, prisma } from "@repo/database"
export async function POST(req: Request) {
  const { projectName, language, userId } = await req.json() as CreateRequsetData
  const fileLocation = await copyS3Folder({ baseCodeUrl: language.baseCodeUri!, projectName: projectName, userId })
  await prisma.projects.create({
    data: {
      title: projectName,
      userId: userId,
      playGroundId: language.id,
      fileUrl: `${fileLocation}`,
    }
  })

  const creatingContainer = await fetch(`${process.env.BACKEND_URL}/script`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: "POST",
    body: JSON.stringify({ userId: `${userId}-${projectName}`, s3Url: fileLocation })
  })

  console.log(creatingContainer.status, await creatingContainer?.json())

  return Response.json({ message: "Project Created" })
}





type CreateRequsetData = {
  userId: string,
  language: PlayGrounds,
  projectName: string
}
