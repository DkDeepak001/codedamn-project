'use client'
import { PlayGrounds } from "@repo/database"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const PlayGound = (p: PlayGrounds) => {

  return (
    <Card className="w-1/5  flex flex-row items-center justify-start  px-5 cursor-pointer" onClick={() => console.log("asdas")} >
      <img
        src={p.iconUrl}
        alt={`${p.language}`}
        className="w-14 h-14"
      />
      <CardHeader >
        <CardTitle className="text-base">{p.language}</CardTitle>
        <CardDescription>{p.descripition}</CardDescription>
      </CardHeader>
    </Card>
  )

}

