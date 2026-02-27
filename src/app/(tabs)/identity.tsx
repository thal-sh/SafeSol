import { useState, useEffect } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { PixelIcon } from '../../components/PixelIcon'
import { PS2PText } from '../../components/PS2PText'
import { StatusBadge } from '../../components/StatusBadge'
import { AgeProofCard, AgeProof } from '../../components/AgeProofCard'
import { CredentialCard, Credential } from '../../components/CredentialCard'

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
          <PS2PText className="text-white text-lg">
            IDENTITY
          </PS2PText>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Document Vault Link */}
        <Pressable 
          onPress={() => router.push('/document-vault')}
          className="bg-[#8a2be2] p-4 mb-4"
        >
          <PS2PText className="text-white text-xs text-center font-bold">
            🗂️ DOCUMENT VAULT
          </PS2PText>
        </Pressable>

        {/* KYC Status */}
        <View className="bg-[#1a1a2f] p-4 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <PS2PText className="text-white text-xs">
              KYC VERIFICATION
            </PS2PText>
            <StatusBadge status={kycStatus} />
          </View>
          
          {kycStatus === 'verified' ? (
            <PS2PText className="text-[#a0a0b0] text-[8px]">
              IDENTITY CONFIRMED • LEVEL 2
            </PS2PText>
          ) : (
            <Pressable 
              onPress={() => router.push('/kyc')}
              className="bg-[#0a0a1f] p-2 mt-2"
            >
              <PS2PText className="text-[#ffb86b] text-[8px] text-center">
                START VERIFICATION →
              </PS2PText>
            </Pressable>
          )}
        </View>

        {/* Age Proofs */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <PS2PText className="text-white text-xs">
              AGE PROOFS
            </PS2PText>
            <Pressable onPress={() => router.push('/attestations/receive')}>
              <PS2PText className="text-[#ffb86b] text-[8px]">
                + ADD
              </PS2PText>
            </Pressable>
          </View>

          {ageProofs.length === 0 ? (
            <View className="bg-[#1a1a2f] p-6 items-center">
              <PS2PText className="text-[#a0a0b0] text-[8px]">
                NO AGE PROOFS
              </PS2PText>
              <PS2PText className="text-[#4a4a6a] text-[6px] mt-2">
                VERIFY WITH DMV OR GOVERNMENT
              </PS2PText>
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
            <PS2PText className="text-white text-xs">
              PROFESSIONAL
            </PS2PText>
            <Pressable>
              <PS2PText className="text-[#ffb86b] text-[8px]">
                + ADD
              </PS2PText>
            </Pressable>
          </View>

          {credentials.length === 0 ? (
            <View className="bg-[#1a1a2f] p-6 items-center">
              <PS2PText className="text-[#a0a0b0] text-[8px]">
                NO CREDENTIALS
              </PS2PText>
            </View>
          ) : (
            credentials.map((cred) => (
              <CredentialCard key={cred.id} credential={cred} />
            ))
          )}
        </View>

        {/* Verifiable Attributes */}
        <View className="mb-8">
          <PS2PText className="text-white text-xs mb-3">
            VERIFIABLE ATTRIBUTES
          </PS2PText>

          <View className="flex-row flex-wrap">
            <View className="bg-[#1a1a2f] px-3 py-2 mr-2 mb-2">
              <PS2PText className="text-[#00ff9d] text-[6px]">
                OVER 18 ✓
              </PS2PText>
            </View>
            <View className="bg-[#1a1a2f] px-3 py-2 mr-2 mb-2">
              <PS2PText className="text-[#00ff9d] text-[6px]">
                OVER 21 ✓
              </PS2PText>
            </View>
            <View className="bg-[#1a1a2f] px-3 py-2 mr-2 mb-2">
              <PS2PText className="text-[#ffb86b] text-[6px]">
                US CITIZEN ⚠
              </PS2PText>
            </View>
          </View>
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}