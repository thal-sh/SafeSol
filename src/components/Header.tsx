import React from 'react'
import { Text, View } from 'react-native'
import { colors } from '../constants/colors'

type Props = {
  address: string
}

export function Header({ address }: Props) {
  return (
    <View className="pt-12 pb-4 px-8 border-b border-gray-200 dark:border-gray-800">
      <View className="flex-row justify-between items-center">
        <Text className={`text-2xl font-bold ${colors.primary.text}`}>SafeSol</Text>
        <Text className={`${colors.primary.subtext} text-xs`}>
          {address.slice(0, 8)}...
        </Text>
      </View>
    </View>
  )
}

export default Header
