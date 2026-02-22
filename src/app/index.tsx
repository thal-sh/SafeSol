import { StatusBar } from 'expo-status-bar'
import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { router } from 'expo-router'
import { WalletButton } from '../../src/components/WalletButton'
import { Header } from '../../src/components/Header'
import { StatusCard } from '../../src/components/StatusCard'
import { storage } from '../../src/utils/storage'
import { colors } from '../../src/constants/colors'

export default function Home() {
  const { account } = useMobileWallet()
  const [savedMedical, setSavedMedical] = useState(false)
  const [kycVerified, setKycVerified] = useState(false)

  useEffect(() => {
    if (account) {
      loadStatus()
    }
  }, [account])

 const loadStatus = async () => {
  if (!account) return
  
  const medical = await storage.getMedical(account.address.toString())
  setSavedMedical(!!medical)
  
  const kyc = await storage.getKYC(account.address.toString())
  setKycVerified(kyc)
}

  if (!account) {
    return (
      <View className={`flex-1 ${colors.primary.bg} items-center justify-center px-8`}>
        <Text className={`text-4xl font-extrabold ${colors.primary.text} mb-3 tracking-tight`}>
          SafeSol
        </Text>
        <Text className={`text-xl ${colors.primary.subtext} mb-8 text-center leading-relaxed`}>
          KYC & Health on Solana
        </Text>
        <WalletButton />
        <StatusBar style="auto" />
      </View>
    )
  }

  return (
    <View className={`flex-1 ${colors.primary.bg}`}>
      <Header address={account.address.toString()} />
      
      <ScrollView className="flex-1 px-8 pt-8">
        <Text className={`text-3xl font-bold ${colors.primary.text} mb-1`}>
          Welcome back
        </Text>
        <Text className={`${colors.primary.subtext} mb-8`}>
          Manage your KYC and health information
        </Text>
        
        <StatusCard
          title="Medical Info"
          description={savedMedical 
            ? 'Your medical information is stored securely'
            : 'Add allergies, blood type, and emergency contacts'}
          status={savedMedical ? 'saved' : 'not set'}
          isComplete={savedMedical}
          onPress={() => router.push('/medical')}
          actionText="Update →"
        />

        <StatusCard
          title="KYC Verification"
          description={kycVerified 
            ? 'Your identity is verified'
            : 'Verify your identity once'}
          status={kycVerified ? 'verified' : 'pending'}
          isComplete={kycVerified}
          onPress={() => router.push('/kyc')}
          actionText="View status →"
        />

        <StatusCard
          title="Emergency QR"
          description={savedMedical 
            ? 'Generate QR for first responders'
            : 'Complete medical info first'}
          status={savedMedical ? 'ready' : 'locked'}
          isComplete={savedMedical}
          onPress={() => savedMedical && router.push('/qr')}
          actionText="Generate →"
        />

        <View className="mb-12">
          <WalletButton />
        </View>
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  )
}
