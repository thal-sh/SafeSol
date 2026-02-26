import { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { PixelIcon } from '../../components/PixelIcon'

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

// Status Badge Component
const StatusBadge = ({ status }: { status: 'verified' | 'pending' | 'not_started' }) => {
  const getStyle = () => {
    switch (status) {
      case 'verified':
        return { bg: '#00ff9d', text: 'VERIFIED', textColor: '#0a0a1f' }
      case 'pending':
        return { bg: '#ffb86b', text: 'PENDING', textColor: '#0a0a1f' }
      default:
        return { bg: '#2a2a3f', text: 'NOT STARTED', textColor: '#a0a0b0' }
    }
  }
  const style = getStyle()
  
  return (
    <View style={{ backgroundColor: style.bg }} className="px-2 py-1">
      <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className={`text-[${style.textColor}] text-[6px]`}>
        {style.text}
      </Text>
    </View>
  )
}

// Age Proof Card
const AgeProofCard = ({ proof }: { proof: AgeProof }) => (
  <View className="bg-[#1a1a2f] p-3 mb-2">
    <View className="flex-row justify-between items-center">
      <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-[8px]">
        {proof.predicate === 'over_18' ? 'OVER 18' : 
         proof.predicate === 'over_21' ? 'OVER 21' : 'OVER 65'}
      </Text>
      <View className="bg-[#00ff9d] px-2 py-1">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#0a0a1f] text-[4px]">
          VERIFIED
        </Text>
      </View>
    </View>
    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px] mt-1">
      BY: {proof.issuer}
    </Text>
  </View>
)

// Credential Card
const CredentialCard = ({ credential }: { credential: Credential }) => (
  <View className="bg-[#1a1a2f] p-3 mb-2">
    <View className="flex-row justify-between items-center">
      <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-[8px] flex-1">
        {credential.title}
      </Text>
      {credential.verified && (
        <View className="bg-[#00ff9d] px-2 py-1 ml-2">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#0a0a1f] text-[4px]">
            ✓
          </Text>
        </View>
      )}
    </View>
    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px] mt-1">
      {credential.issuer} • {credential.issuedAt}
    </Text>
  </View>
)

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
      const kyc = await AsyncStorage.getItem(`kyc_${account!.address}`)
      setKycStatus(kyc === 'verified' ? 'verified' : kyc === 'pending' ? 'pending' : 'not_started')

      const ages = await AsyncStorage.getItem(`age_proofs_${account!.address}`)
      if (ages) setAgeProofs(JSON.parse(ages))

      const creds = await AsyncStorage.getItem(`credentials_${account!.address}`)
      if (creds) setCredentials(JSON.parse(creds))
    } catch (error) {
      console.log('Error loading identity data')
    }
  }

  return (
    <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1">
      {/* Header */}
      <View className="pt-12 px-4 pb-4 border-b border-[#2a2a3f]">
        <View className="flex-row items-center">
          <View className="mr-2">
            <PixelIcon name="identity" color="#ffb86b" size={24} />
          </View>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-lg">
            IDENTITY
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* KYC Status */}
        <View className="bg-[#1a1a2f] p-4 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs">
              KYC VERIFICATION
            </Text>
            <StatusBadge status={kycStatus} />
          </View>
          
          {kycStatus === 'verified' ? (
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[8px]">
              IDENTITY CONFIRMED • LEVEL 2
            </Text>
          ) : (
            <Pressable 
              onPress={() => router.push('/kyc')}
              className="bg-[#0a0a1f] p-2 mt-2"
            >
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffb86b] text-[8px] text-center">
                START VERIFICATION →
              </Text>
            </Pressable>
          )}
        </View>

        {/* Age Proofs */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs">
              AGE PROOFS
            </Text>
            <Pressable onPress={() => router.push('/attestations/receive')}>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffb86b] text-[8px]">
                + ADD
              </Text>
            </Pressable>
          </View>

          {ageProofs.length === 0 ? (
            <View className="bg-[#1a1a2f] p-6 items-center">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[8px]">
                NO AGE PROOFS
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a4a6a] text-[6px] mt-2">
                VERIFY WITH DMV OR GOVERNMENT
              </Text>
            </View>
          ) : (
            ageProofs.map((proof) => (
              <AgeProofCard key={proof.id} proof={proof} />
            ))
          )}
        </View>

        {/* Professional Credentials */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs">
              PROFESSIONAL
            </Text>
            <Pressable>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffb86b] text-[8px]">
                + ADD
              </Text>
            </Pressable>
          </View>

          {credentials.length === 0 ? (
            <View className="bg-[#1a1a2f] p-6 items-center">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[8px]">
                NO CREDENTIALS
              </Text>
            </View>
          ) : (
            credentials.map((cred) => (
              <CredentialCard key={cred.id} credential={cred} />
            ))
          )}
        </View>

        {/* Verifiable Attributes */}
        <View className="mb-8">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs mb-3">
            VERIFIABLE ATTRIBUTES
          </Text>

          <View className="flex-row flex-wrap">
            <View className="bg-[#1a1a2f] px-3 py-2 mr-2 mb-2">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[6px]">
                OVER 18 ✓
              </Text>
            </View>
            <View className="bg-[#1a1a2f] px-3 py-2 mr-2 mb-2">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[6px]">
                OVER 21 ✓
              </Text>
            </View>
            <View className="bg-[#1a1a2f] px-3 py-2 mr-2 mb-2">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffb86b] text-[6px]">
                US CITIZEN ⚠
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}