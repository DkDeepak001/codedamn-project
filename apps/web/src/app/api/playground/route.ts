import { copyS3Folder } from "@/libs/copyToS3"
import { PlayGrounds, prisma } from "@repo/database"


export async function POST(req: Request) {
  const { projectId, projectName, language, userId } = await req.json() as CreateRequsetData

  if (!projectName || !language || !userId) return Response.json({ message: "error" })

  let project;
  if (projectId) {
    const playGround = await prisma.projects.findUnique({
      where: {
        id: projectId
      }
    })
    const creatingContainer = await fetch(`${process.env.BACKEND_URL}/script`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: "POST",
      body: JSON.stringify({ userId: `${userId}-${projectName}`, s3Url: playGround?.fileUrl })
    })
    const res = await creatingContainer?.json()
    project = await prisma.projects.update({
      where: {
        id: playGround?.id
      },
      data: {
        terminalUrl: res.terminalUrl,
        outputUrl: res.outputUrl,
        isRunning: true
      }
    })
  } else {
    const fileLocation = await copyS3Folder({ baseCodeUrl: language.baseCodeUri!, projectName: projectName, userId })
    const creatingContainer = await fetch(`${process.env.BACKEND_URL}/script`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: "POST",
      body: JSON.stringify({ userId: `${userId}-${projectName}`, s3Url: fileLocation })
    })
    const res = await creatingContainer?.json()
    project = await prisma.projects.create({
      data: {
        title: projectName,
        userId: userId,
        playGroundId: language.id,
        isRunning: true,
        fileUrl: `${fileLocation}`,
        terminalUrl: res.terminalUrl,
        outputUrl: res.outputUrl
      }
    })
  }
  return Response.json({ message: "Project Created", project })
}



export async function DELETE(req: Request) {
  const projectId = req.url.split("projectId=")[1]
  await prisma.projects.update({
    where: {
      id: projectId
    },
    data: {
      terminalUrl: null,
      outputUrl: null,
      isRunning: false
    }
  })
  return Response.json({ message: "Project Stoped" })
}


type CreateRequsetData = {
  projectId?: string
  userId: string,
  language: PlayGrounds,
  projectName: string
}

