import React from 'react'
import { Pressable, View } from 'react-native'
import { PixelIcon } from './PixelIcon'
import { PS2PText } from './PS2PText'

interface Props {
  title: string
  subtitle: string
}

export const ContractItem: React.FC<Props> = ({ title, subtitle }) => (
  <Pressable className="bg-[#1a1a2f] p-3 mb-2 flex-row items-center">
    <View className="mr-3">
      <PixelIcon name="document" color="#8a2be2" size={16} />
    </View>
    <View className="flex-1">
      <PS2PText className="text-white text-[8px]">
        {title}
      </PS2PText>
      <PS2PText className="text-[#a0a0b0] text-[6px] mt-1">
        {subtitle}
      </PS2PText>
    </View>
  </Pressable>
)
