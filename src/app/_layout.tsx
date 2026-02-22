import '../global.css'
import { Slot } from 'expo-router'
import { MobileWalletProvider, createSolanaDevnet } from '@wallet-ui/react-native-kit'
import Toast from 'react-native-toast-message'
import { toastConfig } from '../components/Toast'
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p'
import { View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const cluster = createSolanaDevnet()
const identity = {
  name: 'SafeSol',
  uri: 'https://github.com/yourusername/SafeSol',
}

export default function Layout() {
  let [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  })

  if (!fontsLoaded) {
    return (
      <LinearGradient
        colors={['#0a0a1f', '#1a0f2e', '#000000']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text style={{ color: '#ffd9b3', fontSize: 16 }}>LOADING...</Text>
      </LinearGradient>
    )
  }

  return (
    <MobileWalletProvider cluster={cluster} identity={identity}>
      <Slot />
      <Toast config={toastConfig} />
    </MobileWalletProvider>
  )
}