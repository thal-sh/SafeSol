import { Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { PS2PText } from './PS2PText'

export function WalletButton() {
  const { account, connect, disconnect } = useMobileWallet()

  if (account) {
    return (
      <Pressable onPress={disconnect} className="active:opacity-80">
        <LinearGradient
          colors={['#ff1493', '#b80c6b']}
          className="px-6 py-3 border-2 border-[#ff1493]"
          style={{ shadowColor: '#ff1493', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }}
        >
          <PS2PText className="text-white text-xs">
            DISCONNECT
          </PS2PText>
        </LinearGradient>
      </Pressable>
    )
  }

  return (
    <Pressable onPress={connect} className="active:opacity-80">
      <LinearGradient
        colors={['#ff6f61', '#8a2be2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="px-8 py-4 border-2 border-[#ff6f61]"
        style={{ shadowColor: '#ff6f61', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 15 }}
      >
        <PS2PText className="text-white text-sm">
          CONNECT WALLET
        </PS2PText>
      </LinearGradient>
    </Pressable>
  )
}