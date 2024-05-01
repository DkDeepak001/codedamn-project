'use client'
import { PlayGrounds } from "@repo/database"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreatePlayGround } from "@/store/useCreatePlayground"

export const PlayGound = (p: PlayGrounds) => {
  const { setLanguage, showModal } = useCreatePlayGround(state => ({
    showModal: state.setOpen,
    setLanguage: state.setLanguage
  }))

  const handleSelect = (p: PlayGrounds) => {
    setLanguage(p)
    showModal(true)
  }

  return (
    <Card
      className="w-1/5 flex flex-row items-center justify-start px-5 cursor-pointer hover:scale-105 hover:shadow-muted-foreground/50"
      onClick={() => handleSelect(p)} >
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

