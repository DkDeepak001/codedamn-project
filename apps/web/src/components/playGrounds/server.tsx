import { prisma } from "@repo/database"
import { PlayGound } from "./client"


export const PlayGrounds = async () => {
  const playGrounds = await prisma.playGrounds.findMany({})

  return (
    <div className="flex flex-wrap justify-start items-center gap-5 ">
      {playGrounds?.map((p) => <PlayGound {...p} />)}
    </div>)
}



