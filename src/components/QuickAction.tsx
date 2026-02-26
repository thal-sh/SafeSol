import React from 'react'
import { Pressable, View } from 'react-native'
import { PS2PText } from './PS2PText'

export interface QuickActionProps {
  icon: React.ReactNode
  // vertical layout uses "label"; horizontal uses "title"/"subtitle"
  label?: string
  title?: string
  subtitle?: string
  onPress: () => void
  layout?: 'vertical' | 'horizontal'
}

export const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  label,
  title,
  subtitle,
  onPress,
  layout = 'vertical',
}) => {
  if (layout === 'horizontal') {
    return (
      <Pressable onPress={onPress} className="mb-2">
        <View className="bg-[#1a1a2f] p-4 flex-row items-center">
          <View className="mr-3 w-8 h-8 items-center justify-center">
            {icon}
          </View>
          <View className="flex-1">
            <PS2PText className="text-white text-xs">{title || label}</PS2PText>
            {subtitle && (
              <PS2PText className="text-[#a0a0b0] text-[6px] mt-1">
                {subtitle}
              </PS2PText>
            )}
          </View>
        </View>
      </Pressable>
    )
  }

  // vertical default
  return (
    <Pressable onPress={onPress} className="items-center flex-1">
      <View className="w-12 h-12 bg-[#1a1a2f] items-center justify-center mb-1">
        {icon}
      </View>
      {label && (
        <PS2PText className="text-[#a0a0b0] text-[6px]">{label}</PS2PText>
      )}
    </Pressable>
  )
}
