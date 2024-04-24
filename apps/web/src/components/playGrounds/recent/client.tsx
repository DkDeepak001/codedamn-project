'use client'
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectReturnType } from "./server"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ClipLoader } from "react-spinners"
type RecentPlayGroundProps = ProjectReturnType


export const RecentPlayGround = (p: RecentPlayGroundProps) => {

  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const handleOpen = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/playground', {
        method: "POST",
        body: JSON.stringify({
          projectId: p.id,
          userId: p.userId,
          language: p.playGround.language,
          projectName: p.title
        })
      })
      const data = await res.json()
      router.push(`playground?projectId=${data.project.id}`)
      setLoading(false)
      setLoading(false)
    } catch (error) {
      console.log(error)

    }
  }

  return (
    <Card
      className="w-full  flex flex-row items-center justify-between px-5 cursor-pointer  hover:shadow-muted-foreground/50"
      onClick={handleOpen}
    >
      <div className="flex flex-row items-center justify-start">
        <img
          src={p.playGround.iconUrl}
          alt={`${p.playGround.language}`}
          className="w-14 h-14"
        />
        <CardHeader>
          <CardTitle className="text-base">{p.title}</CardTitle>
          <CardDescription>{p.playGround.language}</CardDescription>
        </CardHeader>
      </div>
      <div className="flex flex-row gap-x-5">
        <Button variant={'default'} disabled={loading} className="w-24">
          {loading ? <ClipLoader color="#000" size={12} />
            : 'open'}
        </Button>

      </div>
    </Card >
  )
} 
