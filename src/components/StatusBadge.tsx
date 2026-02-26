import React from 'react'
import { View } from 'react-native'
import { PS2PText } from './PS2PText'

interface StatusBadgeProps {
  status: 'verified' | 'pending' | 'not_started'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'verified':
        return { bg: '#00ff9d', text: 'VERIFIED', textColor: '#0a0a1f' }
      case 'pending':
        return { bg: '#ffb86b', text: 'PENDING', textColor: '#0a0a1f' }
      default:
        return { bg: '#2a2a3f', text: 'NOT STARTED', textColor: '#a0a0b0' }
    }
  }

  const style = getStyle()
  return (
    <View style={{ backgroundColor: style.bg }} className="px-2 py-1">
      <PS2PText className={`text-[6px]`} style={{ color: style.textColor }}>
        {style.text}
      </PS2PText>
    </View>
  )
}
