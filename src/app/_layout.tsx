import '../global.css'

import { Slot } from 'expo-router'
import { MobileWalletProvider, createSolanaDevnet } from '@wallet-ui/react-native-kit'
import Toast from 'react-native-toast-message'
import { toastConfig } from '../components/Toast'

const cluster = createSolanaDevnet()
const identity = {
  name: 'Kit Expo Uniwind',
  uri: 'https://github.com/beeman/thulmas',
}

export default function Layout() {
  return (
    <MobileWalletProvider cluster={cluster} identity={identity}>
      <Slot />
      <Toast config={toastConfig} />
    </MobileWalletProvider>
  )
}