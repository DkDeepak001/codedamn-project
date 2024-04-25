import { prisma } from "@repo/database"
import { RecentPlayGround } from "./client";


export const RecentPlayGrounds = async () => {
  const user = { id: '' };

  const projects = await getProjects(user?.id!)

  if (projects.length === 0) return <div className="">
    <h2 className="text-xl font-bold">{!user?.id ? 'please sign up' : 'No Recent projects found'}</h2>
  </div>

  return (
    <div className="flex flex-wrap justify-start items-center gap-5 ">
      {projects.map(p => <RecentPlayGround {...p} />)}
    </div>)
}


export type ProjectReturnType = Awaited<ReturnType<typeof getProjects>>[number]

const getProjects = async (id: string) => {
  if (!id) return []
  return await prisma.projects.findMany({
    where: {
      userId: id
    }, select: {
      title: true,
      id: true,
      createdAt: true,
      updateAt: true,
      userId: true,
      isRunning: true,
      playGround: {
        select: {
          language: true,
          descripition: true,
          iconUrl: true
        }
      }
    }
  })
}
