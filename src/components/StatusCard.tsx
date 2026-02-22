import { Pressable, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

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
        return {
          border: 'border-[#00ff9d]',
          text: 'text-[#00ff9d]',
          bg: 'bg-[#00ff9d]',
          glow: '#00ff9d'
        }
      case 'pending':
        return {
          border: 'border-[#ff6f61]',
          text: 'text-[#ff6f61]',
          bg: 'bg-[#ff6f61]',
          glow: '#ff6f61'
        }
      default: // 'not set', 'locked'
        return {
          border: 'border-[#8a2be2]',
          text: 'text-[#8a2be2]',
          bg: 'bg-[#8a2be2]',
          glow: '#8a2be2'
        }
    }
  }

  const colors = getStatusColor()

  return (
    <Pressable 
      onPress={onPress}
      className="mb-4 active:opacity-80"
    >
      <LinearGradient
        colors={['#1a0f2e', '#0f0a1f']}
        className={`p-5 border-2 ${colors.border}`}
        style={{ shadowColor: colors.glow, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }}
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-sm">
            {title}
          </Text>
          <View className={`px-2 py-1 border ${colors.border}`}>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className={`text-[8px] ${colors.text}`}>
              {status === 'saved' ? '✓ SAVED' : 
               status === 'verified' ? '✓ VERIFIED' :
               status === 'ready' ? '⚡ READY' :
               status === 'pending' ? '⏳ WAIT' :
               status === 'not set' ? '○ NEW' :
               status === 'locked' ? '🔒 LOCKED' : status}
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[10px] mb-4 leading-4">
          {description}
        </Text>
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className={`${colors.text} text-[10px]`}>
          {actionText}
        </Text>
      </LinearGradient>
    </Pressable>
  )
}