import { prisma } from "@repo/database"
import { currentUser } from '@clerk/nextjs/server';
import { RecentPlayGround } from "./client";


export const RecentPlayGrounds = async () => {
  const user = await currentUser();

  const projects = await getProjects(user?.id!)

  return (
    <div className="flex flex-wrap justify-start items-center gap-5 ">
      {projects.map(p => <RecentPlayGround {...p} />)}
    </div>)
}


export type ProjectReturnType = Awaited<ReturnType<typeof getProjects>>[number]

const getProjects = async (id: string) => {
  return await prisma.projects.findMany({
    where: {
      userId: id
    }, select: {
      title: true,
      id: true,
      createdAt: true,
      updateAt: true,
      userId: true,
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
