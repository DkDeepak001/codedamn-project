import { PlayGrounds } from '@repo/database'
import { create } from 'zustand'
type state = {
  open: boolean
  language: PlayGrounds | null
}

type action = {
  setOpen: (val: state['open']) => void;
  setLanguage: (val: state['language']) => void
}


type CreatePlayGround = state & action



export const useCreatePlayGround = create<CreatePlayGround>((set) => {
  return {
    open: false,
    language: null,
    setLanguage: (val) => set({ language: val }),
    setOpen: (val) => set({ open: val })
  }
})

