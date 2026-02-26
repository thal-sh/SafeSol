import React from 'react'
import { View } from 'react-native'
import { PS2PText } from './PS2PText'

interface ActivityItemProps {
  text: string
  time: string
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ text, time }) => (
  <View className="flex-row items-center mb-3 border-b border-[#2a2a3f] pb-2">
    <View className="w-2 h-2 bg-[#00ff9d] mr-3" />
    <View className="flex-1">
      <PS2PText className="text-white text-[8px]">{text}</PS2PText>
      <PS2PText className="text-[#a0a0b0] text-[6px] mt-1">{time}</PS2PText>
    </View>
  </View>
)
