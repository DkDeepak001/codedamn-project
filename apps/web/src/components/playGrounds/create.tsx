'use client'
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useCreatePlayGround } from '@/store/modal';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation'


export const SetupPlayGround = () => {

  const { setOpen, open, language } = useCreatePlayGround(state => ({
    language: state.language,
    open: state.open,
    setOpen: state.setOpen
  }))


  const [projectName, setProjectName] = useState("")
  const { toast } = useToast()
  const { isSignedIn, userId } = useAuth()

  const router = useRouter()

  const handleCreate = async () => {
    if (!isSignedIn) return toast({ title: "Please Sigin", description: "Please create a account to Continue", variant: "destructive" })
    if (projectName.trim().length === 0) return toast({ title: "Title Required", description: "Please Enter a Project Name to Continue", variant: "destructive" })
    if (projectName.trim().includes(" ")) return toast({ title: "Invalid Project Name", description: "Give project name like, my-awesome-project", variant: 'destructive' });

    try {
      const res = await fetch('/api/playground', {
        method: "POST",
        body: JSON.stringify({
          userId,
          language,
          projectName
        })
      })
      const data = await res.json()
      router.push(`playground?projectId=${data.project.id}`)
      setOpen(false)
      setProjectName('')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)} >
      <DialogContent className=''>
        <DialogHeader className=''>
          <DialogTitle className=' mb-5'>Create A Playground</DialogTitle>
          <div className='flex flex-row items-center h-full justify-between gap-x-3 pb-2'>
            <div className='w-2/5 border flex flex-col items-center justify-center h-40'>
              <img src={language?.iconUrl} className='h-20 w-20' />
              <h3 className='text-lg font-bold'>{language?.language}</h3>
              <p className='text-sm '>{language?.descripition}</p>
            </div>
            <div className='flex flex-col justify-start items-start  h-32'>
              <Input
                className='w-full font-semibold'
                placeholder='Project name'
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
          </div>
          <Button variant='secondary' onClick={handleCreate}>
            Create a PlayGround
          </Button>

        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

