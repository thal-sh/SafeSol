import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { colors } from '../constants/colors'

type Props = {
  title: string
  description: string
  status: 'saved' | 'not set' | 'verified' | 'pending' | 'ready' | 'locked'
  isComplete: boolean
  onPress: () => void
  actionText: string
}

export function StatusCard({ title, description, status, isComplete, onPress, actionText }: Props) {
  const getStatusColor = () => {
    if (status === 'saved' || status === 'verified' || status === 'ready') {
      return colors.status.success
    }
    return colors.status.pending
  }

  const getStatusTextColor = () => {
    if (status === 'saved' || status === 'verified' || status === 'ready') {
      return colors.status.successText
    }
    return colors.status.pendingText
  }

  const statusDisplay = typeof status === 'string' ? status : 'pending'

  return (
    <Pressable 
      onPress={onPress}
      className={`${colors.primary.bg} border ${colors.primary.border} p-6 rounded-xl mb-4 active:opacity-70`}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className={`text-xl font-bold ${colors.primary.text}`}>{title}</Text>
        <View className={`px-3 py-1 rounded-full ${getStatusColor()}`}>
          <Text className={`text-xs font-bold ${getStatusTextColor()}`}>
            {statusDisplay}
          </Text>
        </View>
      </View>
      <Text className={`${colors.primary.subtext} mb-4`}>{description}</Text>
      <Text className={`${colors.accent.blue} font-bold`}>
        {isComplete ? actionText : 'Set up now →'}
      </Text>
    </Pressable>
  )
}

export default StatusCard
