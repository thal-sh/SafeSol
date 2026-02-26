import { useState, useEffect } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import PS2PText from '../../components/PS2PText'

export default function ScanScreen() {
  const { account } = useMobileWallet()
  const router = useRouter()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true)
    try {
      const att = JSON.parse(data)
      if (account) {
        const key = `attestations_received_${account.address}`
        const existing = await AsyncStorage.getItem(key)
        const list = existing ? JSON.parse(existing) : []
        list.push(att)
        await AsyncStorage.setItem(key, JSON.stringify(list))
        Toast.show({ type: 'success', text1: 'RECEIVED', text2: 'Attestation saved', position: 'top' })
      }
      router.replace('/attestations')
    } catch (e) {
      Toast.show({ type: 'error', text1: 'INVALID QR', text2: 'Not a valid attestation', position: 'top' })
      setScanned(false)
    }
  }

  if (hasPermission === null) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a1f]">
        <PS2PText className="text-white text-xs">Requesting camera permission...</PS2PText>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a1f]">
        <PS2PText className="text-white text-xs">No access to camera</PS2PText>
      </View>
    )
  }

  return (
    <View className="flex-1">
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ flex: 1 }}
      />
      {scanned && (
        <TouchableOpacity onPress={() => setScanned(false)} className="absolute bottom-10 left-0 right-0 items-center">
          <PS2PText className="text-[#00ff9d] text-xs">Tap to scan again</PS2PText>
        </TouchableOpacity>
      )}
    </View>
  )
}
