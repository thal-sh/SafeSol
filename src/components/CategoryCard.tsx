import React from 'react'
import { Pressable, View } from 'react-native'
import { ProgressBar } from './ProgressBar'
import { PS2PText } from './PS2PText'

interface CategoryCardProps {
  title: string
  percent: number
  subtitle: string
  color: string
  onPress: () => void
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  percent,
  subtitle,
  color,
  onPress,
}) => (
  <Pressable onPress={onPress} className="mb-3">
    <View className="bg-[#1a1a2f] p-4">
      <View className="flex-row justify-between items-center">
        <PS2PText className="text-white text-xs">{title}</PS2PText>
        <PS2PText className="text-[#a0a0b0] text-[8px]">{percent}%</PS2PText>
      </View>
      <ProgressBar percent={percent} color={color} />
      <PS2PText className="text-[#a0a0b0] text-[8px] mt-2">{subtitle}</PS2PText>
    </View>
  </Pressable>
)
