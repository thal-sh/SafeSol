import { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'

type AgeProof = {
  id: string
  predicate: string // "over_18", "over_21", "over_65"
  issuer: string
  issuerWallet: string
  issuedAt: number
  validUntil: number
}

type Credential = {
  id: string
  type: 'license' | 'certification' | 'membership' | 'education'
  title: string
  issuer: string
  issuedAt: string
  expiresAt?: string
  verified: boolean
}

export default function IdentityTab() {
  const { account } = useMobileWallet()
  const [kycStatus, setKycStatus] = useState<'verified' | 'pending' | 'not_started'>('not_started')
  const [ageProofs, setAgeProofs] = useState<AgeProof[]>([])
  const [credentials, setCredentials] = useState<Credential[]>([])

  useEffect(() => {
    if (account) {
      loadData()
    }
  }, [account])

  const loadData = async () => {
    try {
      // Load KYC status
      const kyc = await AsyncStorage.getItem(`kyc_${account!.address}`)
      setKycStatus(kyc === 'verified' ? 'verified' : kyc === 'pending' ? 'pending' : 'not_started')

      // Load age proofs
      const ages = await AsyncStorage.getItem(`age_proofs_${account!.address}`)
      if (ages) setAgeProofs(JSON.parse(ages))

      // Load credentials
      const creds = await AsyncStorage.getItem(`credentials_${account!.address}`)
      if (creds) setCredentials(JSON.parse(creds))
    } catch (error) {
      console.log('Error loading identity data')
    }
  }

  const getKycBadge = () => {
    switch (kycStatus) {
      case 'verified':
        return <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[8px]">✓ VERIFIED</Text>
      case 'pending':
        return <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">⏳ PENDING</Text>
      default:
        return <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#8a2be2] text-[8px]">○ NOT STARTED</Text>
    }
  }

  return (
    <LinearGradient colors={['#0a0a1f', '#1a0f2e', '#000000']} className="flex-1">
      {/* Header */}
      <View className="pt-12 px-4 pb-4 border-b-2 border-[#6a0dad]">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-lg">
          🆔 IDENTITY
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* KYC Status */}
        <View className="border-2 border-[#6a0dad] p-4 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs">
              KYC VERIFICATION
            </Text>
            {getKycBadge()}
          </View>
          
          {kycStatus === 'verified' ? (
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px]">
              ✓ IDENTITY CONFIRMED • LEVEL 2
            </Text>
          ) : (
            <Pressable 
              onPress={() => router.push('/kyc')}
              className="border border-[#ff6f61] p-2 mt-2"
            >
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px] text-center">
                START VERIFICATION →
              </Text>
            </Pressable>
          )}
        </View>

        {/* Age Proofs */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs">
              AGE PROOFS
            </Text>
            <Pressable onPress={() => router.push('/attestations/receive')}>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
                + ADD
              </Text>
            </Pressable>
          </View>

          {ageProofs.length === 0 ? (
            <View className="border-2 border-[#6a0dad] p-4 items-center">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px]">
                NO AGE PROOFS
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a2c5a] text-[6px] mt-2">
                VERIFY WITH DMV OR GOVERNMENT
              </Text>
            </View>
          ) : (
            ageProofs.map((proof) => (
              <View key={proof.id} className="border-2 border-[#00ff9d] p-3 mb-2">
                <View className="flex-row justify-between">
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-[8px]">
                    {proof.predicate === 'over_18' ? 'OVER 18' : 
                     proof.predicate === 'over_21' ? 'OVER 21' : 'OVER 65'}
                  </Text>
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[6px]">
                    ✓ VERIFIED
                  </Text>
                </View>
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px] mt-1">
                  BY: {proof.issuer}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Professional Credentials */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs">
              PROFESSIONAL
            </Text>
            <Pressable>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
                + ADD
              </Text>
            </Pressable>
          </View>

          {credentials.length === 0 ? (
            <View className="border-2 border-[#6a0dad] p-4 items-center">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px]">
                NO CREDENTIALS
              </Text>
            </View>
          ) : (
            credentials.map((cred) => (
              <View key={cred.id} className="border-2 border-[#8a2be2] p-3 mb-2">
                <View className="flex-row justify-between">
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-[8px]">
                    {cred.title}
                  </Text>
                  {cred.verified && (
                    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[6px]">
                      ✓
                    </Text>
                  )}
                </View>
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px]">
                  {cred.issuer} • {cred.issuedAt}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs mb-3">
          VERIFIABLE ATTRIBUTES
        </Text>

        <View className="flex-row flex-wrap mb-8">
          <View className="border border-[#00ff9d] p-2 mr-2 mb-2">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[6px]">
              OVER 18 ✓
            </Text>
          </View>
          <View className="border border-[#00ff9d] p-2 mr-2 mb-2">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[6px]">
              OVER 21 ✓
            </Text>
          </View>
          <View className="border border-[#8a2be2] p-2 mr-2 mb-2">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#8a2be2] text-[6px]">
              US CITIZEN ⚠
            </Text>
          </View>
        </View>
      </ScrollView>

      <StatusBar style="auto" />
    </LinearGradient>
  )
}