import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { storage } from '../utils/storage'
import { colors } from '../constants/colors'

export default function KYC() {
  const { account } = useMobileWallet()

  const verify = async () => {
    if (!account) return
    await storage.saveKYC(account.address.toString(), true)
    // show success or navigate
  }

  return (
    <View className={`flex-1 ${colors.primary.bg} px-6 pt-12`}>
      <Text className={`text-2xl font-bold ${colors.primary.text} mb-4`}>KYC Verification</Text>
      <Text className={`${colors.primary.subtext} mb-8`}>This is a placeholder KYC flow for judges.</Text>

      <Pressable onPress={verify} className="bg-blue-600 px-6 py-3 rounded-xl">
        <Text className="text-white font-bold">Verify Identity</Text>
      </Pressable>
    </View>
  )
}
