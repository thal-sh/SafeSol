import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { storage } from '../utils/storage'
import { colors } from '../constants/colors'
import { ParamedicView } from '../components/ParamedicView'

export default function QR() {
  const { account } = useMobileWallet()
  const [info, setInfo] = React.useState(null)

  React.useEffect(() => {
    if (account) load()
  }, [account])

  const load = async () => {
    const medical = await storage.getMedical(account.address.toString())
    setInfo(medical)
  }

  return (
    <View className={`flex-1 ${colors.primary.bg}`}>
      <View className="px-6 pt-12">
        <Text className={`text-2xl font-bold ${colors.primary.text} mb-4`}>Emergency QR</Text>
        <Text className={`${colors.primary.subtext} mb-4`}>Present this to first responders.</Text>
      </View>
      <ParamedicView info={info} />
    </View>
  )
}
