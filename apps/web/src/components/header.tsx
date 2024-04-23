'use client'
import { SignInButton, UserButton, useAuth, } from "@clerk/nextjs"
import { Button } from "./ui/button"

export const Header = () => {
  const { isSignedIn } = useAuth()
  return (
    <div className="flex w-full flex-row  justify-between px-20 items-center py-5 border-b  border-b-foreground/40 border-t-transparent">
      <h1>CodeDamn project</h1>
      {isSignedIn ?
        <UserButton /> :
        <SignInButton children={<Button variant={'default'} >Sign In</Button>} />}
    </div>
  )
}
