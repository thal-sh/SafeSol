import { View } from 'react-native'
import PS2PText from './PS2PText'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../constants/colors'

type Props = {
  address: string
}

export function Header({ address }: Props) {
  return (
    <LinearGradient
      colors={['#1a0f2e', '#0a0a1f']}
      className="pt-12 pb-4 px-6 border-b-2 border-[#6a0dad]"
    >
      <View className="flex-row justify-between items-center">
        <PS2PText className="text-[#ffd9b3] text-lg">SAFESOL</PS2PText>
        <View className="border border-[#8a2be2] px-3 py-1">
          <PS2PText className="text-[#b39eb5] text-[8px]">
            {address.slice(0, 4)}...{address.slice(-4)}
          </PS2PText>
        </View>
      </View>
    </LinearGradient>
  )
}