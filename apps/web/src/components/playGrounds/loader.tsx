import React from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const PlayGoundLoader = () => {
  return (
    <div className="flex flex-wrap justify-start items-center gap-3 w-10/12  mx-auto my-10 ">
      {new Array(4).fill(0).map((_, index) => (
        <Card className="flex flex-row items-center justify-start  px-8 cursor-pointer py-1" key={index} >
          <Skeleton className="h-11 w-12 " />
          <CardHeader>
            <Skeleton className="h-2 w-20  " />
            <div className="my-1 flex-col gap-y-3 ">
              <Skeleton className="h-2 w-40 mt-2" />
              <Skeleton className="h-2 w-32 mt-1" />
            </div>
          </CardHeader>
        </Card>))}
    </div>
  )

}

