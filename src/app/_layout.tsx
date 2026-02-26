import '../global.css'
import { Stack } from 'expo-router'
import { MobileWalletProvider, createSolanaDevnet } from '@wallet-ui/react-native-kit'
import Toast from 'react-native-toast-message'
import { toastConfig } from '../components/Toast'
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p'
import { View } from 'react-native'
import PS2PText from '../components/PS2PText'
import { LinearGradient } from 'expo-linear-gradient'

const cluster = createSolanaDevnet()
const identity = {
  name: 'SafeSol',
  uri: 'https://github.com/thal-sh/SafeSol',
}

export default function RootLayout() {
  let [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  })

  if (!fontsLoaded) {
    return (
      <LinearGradient
        colors={['#0a0a1f', '#1a0f2e', '#000000']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <PS2PText className="text-[#ffd9b3]">LOADING...</PS2PText>
      </LinearGradient>
    )
  }

  return (
    <MobileWalletProvider cluster={cluster} identity={identity}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="medical" />
        <Stack.Screen name="kyc" />
        <Stack.Screen name="qr" />
        <Stack.Screen name="attestations/issue" />
        <Stack.Screen name="attestations/receive" />
        <Stack.Screen name="attestations/verify" />
        <Stack.Screen name="emergency" />
      </Stack>
      <Toast config={toastConfig} />
    </MobileWalletProvider>
  )
}