import { prisma } from "@repo/database";

export async function GET(req: Request) {
  const projectId = req.url.split("projectId=")[1]

  if (!projectId) return Response.json({ messag: "invalid request" })

  const projects = await prisma.projects.findUnique({
    where: {
      id: projectId
    }
  })
  return Response.json({ projects })
}
