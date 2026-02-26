import React from 'react'
import { View, StyleProp, ViewStyle } from 'react-native'

interface ProgressBarProps {
  percent: number
  color: string
  style?: StyleProp<ViewStyle>
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percent, color, style }) => (
  <View className="h-2 bg-[#2a2a3f] w-full mt-2" style={style}>
    <View
      className="h-full"
      style={{
        width: `${percent}%`,
        backgroundColor: color,
      }}
    />
  </View>
)
