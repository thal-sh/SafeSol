import React from 'react'
import { View } from 'react-native'
import { PS2PText } from './PS2PText'

interface InfoRowProps {
  label: string
  value: string
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View className="flex-row mb-1">
    <PS2PText className="text-[#a0a0b0] text-[8px] w-24">{label}:</PS2PText>
    <PS2PText className="text-white text-[8px] flex-1">{value}</PS2PText>
  </View>
)
