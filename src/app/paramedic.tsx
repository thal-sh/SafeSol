import React from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { colors } from '../constants/colors'
import { ParamedicView } from '../components/ParamedicView'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { storage } from '../utils/storage'

export default function Paramedic() {
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
      <ParamedicView info={info} />
    </View>
  )
}
