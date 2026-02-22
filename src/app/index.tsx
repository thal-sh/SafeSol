import { StatusBar } from 'expo-status-bar'
import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable, RefreshControl } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { router } from 'expo-router'
import { WalletButton } from '../components/WalletButton'
import { Header } from '../components/Header'
import { StatusCard } from '../components/StatusCard'
import { storage } from '../utils/storage'
import { colors } from '../constants/colors'
import Toast from 'react-native-toast-message'
import { MedicalInfo } from '../types'

export default function Home() {
  const { account } = useMobileWallet()
  const [savedMedical, setSavedMedical] = useState(false)
  const [kycVerified, setKycVerified] = useState(false)
  const [medicalData, setMedicalData] = useState<MedicalInfo | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (account) {
      loadStatus()
    }
  }, [account])

  const loadStatus = async () => {
    if (!account) return
    
    const medical = await storage.getMedical(account.address.toString())
    setSavedMedical(!!medical)
    setMedicalData(medical)
    
    const kyc = await storage.getKYC(account.address.toString())
    setKycVerified(kyc)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadStatus()
    setRefreshing(false)
  }

  const getMedicalSummary = () => {
    if (!medicalData) return null
    
    const items = []
    if (medicalData.allergies) items.push(`🌿 Allergies: ${medicalData.allergies}`)
    if (medicalData.bloodType) items.push(`🩸 Blood: ${medicalData.bloodType}`)
    if (medicalData.conditions?.length) items.push(`🏥 ${medicalData.conditions.length} conditions`)
    if (medicalData.emergencyContacts?.length) items.push(`📞 ${medicalData.emergencyContacts.length} contacts`)
    
    return items.slice(0, 2).join(' • ')
  }

  if (!account) {
    return (
      <View className={`flex-1 ${colors.primary.bg} items-center justify-center px-8`}>
        <Text className={`text-4xl font-extrabold ${colors.primary.text} mb-3 tracking-tight`}>
          SafeSol
        </Text>
        <Text className={`text-xl ${colors.primary.subtext} mb-8 text-center leading-relaxed`}>
          Your secure medical ID on Solana Mobile
        </Text>
        
        {/* Feature preview for non-connected users */}
        <View className="w-full mb-8">
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-3">🏥</Text>
            <Text className={`${colors.primary.subtext} flex-1`}>Store medical info securely</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-3">✅</Text>
            <Text className={`${colors.primary.subtext} flex-1`}>Verify your identity</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-3">🚑</Text>
            <Text className={`${colors.primary.subtext} flex-1`}>Emergency QR for first responders</Text>
          </View>
        </View>
        
        <WalletButton />
        <StatusBar style="auto" />
      </View>
    )
  }

  return (
    <View className={`flex-1 ${colors.primary.bg}`}>
      <Header address={account.address.toString()} />
      
      <ScrollView 
        className="flex-1 px-6 pt-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section with Stats */}
        <View className="mb-6">
          <Text className={`text-3xl font-bold ${colors.primary.text} mb-1`}>
            Welcome back
          </Text>
          <View className="flex-row items-center">
            <View className={`h-2 w-2 rounded-full ${kycVerified ? 'bg-green-500' : 'bg-yellow-500'} mr-2`} />
            <Text className={`${colors.primary.subtext}`}>
              {kycVerified ? 'Identity verified' : 'Verification pending'}
            </Text>
          </View>
        </View>

        {/* Quick Stats Cards */}
        <View className="flex-row mb-6">
          <View className="flex-1 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl mr-2">
            <Text className="text-2xl mb-1">🏥</Text>
            <Text className="text-blue-600 dark:text-blue-400 text-lg font-bold">
              {savedMedical ? 'Active' : 'Not set'}
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400">Medical</Text>
          </View>
          
          <View className="flex-1 bg-green-50 dark:bg-green-900/30 p-4 rounded-xl mx-2">
            <Text className="text-2xl mb-1">✅</Text>
            <Text className="text-green-600 dark:text-green-400 text-lg font-bold">
              {kycVerified ? 'Verified' : 'Pending'}
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400">KYC</Text>
          </View>
          
          <View className="flex-1 bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl ml-2">
            <Text className="text-2xl mb-1">📱</Text>
            <Text className="text-purple-600 dark:text-purple-400 text-lg font-bold">
              {savedMedical ? 'Ready' : 'Locked'}
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400">QR</Text>
          </View>
        </View>

        {/* Medical Summary (if data exists) */}
        {savedMedical && medicalData && (
          <Pressable 
            onPress={() => router.push('/medical')}
            className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl mb-6 border border-gray-200 dark:border-gray-800"
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className={`font-bold ${colors.primary.text}`}>Medical Summary</Text>
              <Text className="text-blue-600 text-sm">Edit →</Text>
            </View>
            <Text className={`${colors.primary.subtext}`}>
              {getMedicalSummary() || 'No medical data entered'}
            </Text>
            {medicalData.lastUpdated && (
              <Text className="text-xs text-gray-400 mt-2">
                Updated: {new Date(medicalData.lastUpdated).toLocaleDateString()}
              </Text>
            )}
          </Pressable>
        )}

        {/* Main Action Cards */}
        <Text className={`text-lg font-bold ${colors.primary.text} mb-3`}>
          Quick Actions
        </Text>
        
        <StatusCard
          title="Medical Info"
          description={savedMedical 
            ? medicalData?.bloodType 
              ? `Blood: ${medicalData.bloodType} • ${medicalData.emergencyContacts?.length || 0} contacts`
              : 'Your medical information is stored securely'
            : 'Add allergies, blood type, and emergency contacts'}
          status={savedMedical ? 'saved' : 'not set'}
          isComplete={savedMedical}
          onPress={() => router.push('/medical')}
          actionText={savedMedical ? "Update →" : "Set up now →"}
        />

        <StatusCard
          title="KYC Verification"
          description={kycVerified 
            ? 'Your identity is verified. No personal data stored.'
            : 'Verify your identity once to unlock all features'}
          status={kycVerified ? 'verified' : 'pending'}
          isComplete={kycVerified}
          onPress={() => router.push('/kyc')}
          actionText={kycVerified ? "View status →" : "Verify now →"}
        />

        <StatusCard
          title="Emergency QR"
          description={savedMedical 
            ? 'Generate QR code for first responders'
            : 'Complete medical info first to enable QR'}
          status={savedMedical ? 'ready' : 'locked'}
          isComplete={savedMedical}
          onPress={() => {
            if (savedMedical) {
              router.push('/qr')
            } else {
              Toast.show({
                type: 'info',
                text1: 'Medical Info Required',
                text2: 'Please add your medical information first',
                position: 'top',
                visibilityTime: 3000,
              })
            }
          }}
          actionText={savedMedical ? "Generate →" : "Complete medical first"}
        />

        {/* Quick Tips Section */}
        <View className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl mt-4 mb-8">
          <Text className="text-yellow-800 dark:text-yellow-200 font-bold mb-2">
            💡 Quick Tips
          </Text>
          <View className="space-y-2">
            {!savedMedical && (
              <Text className="text-yellow-700 dark:text-yellow-300 text-sm">
                • Add medical info to enable emergency QR
              </Text>
            )}
            {savedMedical && !kycVerified && (
              <Text className="text-yellow-700 dark:text-yellow-300 text-sm">
                • Verify your identity to build trust
              </Text>
            )}
            {savedMedical && kycVerified && (
              <Text className="text-yellow-700 dark:text-yellow-300 text-sm">
                • Your emergency QR is ready for lock screen
              </Text>
            )}
            <Text className="text-yellow-700 dark:text-yellow-300 text-sm">
              • All data stays encrypted on your device
            </Text>
          </View>
        </View>

        {/* Disconnect Button */}
        <View className="mb-12">
          <WalletButton />
        </View>
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  )
}