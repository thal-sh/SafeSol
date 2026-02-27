import { View, Pressable } from 'react-native'
import PS2PText from './PS2PText'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../constants/colors'

type Props = {
  address: string
  onDisconnect?: () => void
}

export function Header({ address, onDisconnect }: Props) {
  return (
    <LinearGradient
      colors={['#1a0f2e', '#0a0a1f']}
      className="pt-12 pb-4 px-6 border-b-2 border-[#6a0dad]"
    >
      <View className="flex-row justify-between items-center">
        <PS2PText className="text-[#ffd9b3] text-lg">SAFESOL</PS2PText>
        <View className="flex-row items-center gap-2">
          <View className="border border-[#8a2be2] px-3 py-1">
            <PS2PText className="text-[#b39eb5] text-[8px]">
              {address.slice(0, 4)}...{address.slice(-4)}
            </PS2PText>
          </View>
          {onDisconnect && (
            <Pressable
              onPress={onDisconnect}
              className="bg-[#6a0dad] px-2 py-1 border border-[#8a2be2]"
            >
              <PS2PText className="text-white text-[7px] font-bold">
                ✕
              </PS2PText>
            </Pressable>
          )}
        </View>
      </View>
    </LinearGradient>
  )
}