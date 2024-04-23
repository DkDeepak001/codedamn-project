import { prisma } from "@repo/database"
import { PlayGound } from "./client"


export const PlayGrounds = async () => {
  const playGrounds = await prisma.playGrounds.findMany({})

  return (
    <div className="flex flex-wrap justify-start items-center gap-3 w-10/12  mx-auto my-10">
      {playGrounds?.map((p) => <PlayGound {...p} />)}
    </div>)
}



