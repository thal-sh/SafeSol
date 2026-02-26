import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useLocalSearchParams, useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import PS2PText from '../../components/PS2PText'
import { Attestation } from '../../types'

export default function IssueScreen() {
  const { account } = useMobileWallet()
  const params = useLocalSearchParams()
  const router = useRouter()
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (account && !done && params.subject && params.predicate && params.type) {
      // build attestation
      const newAttestation: Attestation = {
        id: Date.now().toString(),
        type: (params.type as Attestation['type']) || 'employment',
        issuer: {
          name: account.address.slice(0, 8) + '...',
          wallet: account.address,
          trusted: true,
        },
        subject: params.subject as string,
        predicate: params.predicate as string,
        value: true,
        issuedAt: Date.now(),
      }

      ;(async () => {
        // store for issuer
        const issuedKey = `attestations_issued_${account.address}`
        const issued = await AsyncStorage.getItem(issuedKey)
        const issuedList = issued ? JSON.parse(issued) : []
        issuedList.push(newAttestation)
        await AsyncStorage.setItem(issuedKey, JSON.stringify(issuedList))

        // store for subject
        const recvKey = `attestations_received_${params.subject}`
        const rec = await AsyncStorage.getItem(recvKey)
        const recvList = rec ? JSON.parse(rec) : []
        recvList.push(newAttestation)
        await AsyncStorage.setItem(recvKey, JSON.stringify(recvList))

        Toast.show({
          type: 'success',
          text1: 'ATTESTATION ISSUED',
          text2: `${newAttestation.type.toUpperCase()} for ${newAttestation.subject}`,
          position: 'top',
        })
        setDone(true)
        router.replace('/attestations')
      })()
    }
  }, [account, params, done])

  return (
    <View className="flex-1 items-center justify-center bg-[#0a0a1f]">
      <PS2PText className="text-white text-xs">ISSUING ATTESTATION...</PS2PText>
    </View>
  )
}
