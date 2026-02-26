import React from 'react'
import { Pressable } from 'react-native'
import PS2PText from './PS2PText'

interface Props {
  label: string
  selected: boolean
  onPress: () => void
}

export default function CategoryButton({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 px-3 py-2 ${selected ? 'bg-[#ff6f61]' : 'bg-[#1a1a2f]'}`}
    >
      <PS2PText className={`text-[8px] ${selected ? 'text-white' : 'text-[#a0a0b0]'}`}>
        {label}
      </PS2PText>
    </Pressable>
  )
}
