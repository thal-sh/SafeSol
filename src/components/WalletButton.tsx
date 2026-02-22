import React from 'react'
import { Pressable, Text } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'

export function WalletButton() {
  const { account, connect, disconnect } = useMobileWallet()

  if (account) {
    return (
      <Pressable onPress={disconnect} className="bg-red-500 px-6 py-3 rounded-xl active:bg-red-600">
        <Text className="text-white font-bold">Disconnect</Text>
      </Pressable>
    )
  }

  return (
    <Pressable onPress={connect} className="bg-blue-600 px-6 py-3 rounded-xl active:bg-blue-700">
      <Text className="text-white font-bold text-lg">Connect Wallet</Text>
    </Pressable>
  )
}

export default WalletButton
