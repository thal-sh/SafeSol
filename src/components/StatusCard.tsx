import { Pressable, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
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
    switch (status) {
      case 'saved':
      case 'verified':
      case 'ready':
        return 'border-[#00ff9d]'
      case 'pending':
        return 'border-[#ff6f61]'
      default:
        return 'border-[#4a2c5a]'
    }
  }

  const getGlowColor = () => {
    switch (status) {
      case 'saved':
      case 'verified':
      case 'ready':
        return '#00ff9d'
      case 'pending':
        return '#ff6f61'
      default:
        return '#4a2c5a'
    }
  }

  return (
    <Pressable 
      onPress={onPress}
      className="mb-4 active:opacity-80"
    >
      <LinearGradient
        colors={['#1a0f2e', '#0f0a1f']}
        className={`p-5 border-2 ${getStatusColor()}`}
        style={{ shadowColor: getGlowColor(), shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8 }}
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-sm">
            {title}
          </Text>
          <View className={`px-2 py-1 border ${getStatusColor()}`}>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className={`text-[8px] ${getStatusColor().replace('border-', 'text-')}`}>
              {status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[10px] mb-4 leading-4">
          {description}
        </Text>
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[10px]">
          {actionText}
        </Text>
      </LinearGradient>
    </Pressable>
  )
}