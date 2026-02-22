import { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable, Share, Linking } from 'react-native'
import { router } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { StatusBar } from 'expo-status-bar'
import QRCode from 'react-native-qrcode-svg'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { Header } from '../components/Header'
import { colors } from '../constants/colors'

type MedicalInfo = {
  allergies: string
  bloodType: string
  conditions: Array<{ name: string; severity: string }>
  emergencyContacts: Array<{ name: string; phone: string; relationship: string }>
  lastUpdated?: number
}

export default function QRScreen() {
  const { account } = useMobileWallet()
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo | null>(null)
  const [showParamedic, setShowParamedic] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (account) {
      loadMedicalData()
    }
  }, [account])

  const loadMedicalData = async () => {
    if (!account) return
    
    try {
      const encrypted = await AsyncStorage.getItem(`medical_${account.address.toString()}`)
      if (encrypted) {
        try {
          const decoded = atob(encrypted)
          const data = JSON.parse(decoded)
          setMedicalInfo(data)
        } catch (e) {
          console.log('Failed to decrypt medical data')
        }
      }
    } catch (error) {
      console.log('Error loading medical data')
    } finally {
      setIsLoading(false)
    }
  }

  const generateQRData = () => {
    if (!medicalInfo || !account) return ''
    
    return JSON.stringify({
      wallet: account.address.toString(),
      medical: {
        allergies: medicalInfo.allergies,
        bloodType: medicalInfo.bloodType,
        conditions: medicalInfo.conditions,
        emergencyContacts: medicalInfo.emergencyContacts.map(c => ({
          name: c.name,
          phone: c.phone,
          relationship: c.relationship
        }))
      },
      timestamp: Date.now()
    })
  }

  const saveQRToPhone = async () => {
    try {
      // For iOS/Android, we can share the QR code
      await Share.share({
        message: 'SafeSol Emergency QR Code - Save to your photos',
        title: 'Emergency QR Code',
      })
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Take a screenshot to save as lock screen',
        position: 'top',
        visibilityTime: 3000,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to share QR code',
        position: 'top',
        visibilityTime: 3000,
      })
    }
  }

  const callEmergencyContact = (phone: string) => {
    Linking.openURL(`tel:${phone}`)
  }

  if (!account) {
    return (
      <View className={`flex-1 ${colors.primary.bg} items-center justify-center`}>
        <Text className={colors.primary.text}>Please connect wallet</Text>
      </View>
    )
  }

  if (showParamedic && medicalInfo) {
    // PARAMEDIC VIEW - Large, red, easy to read
    return (
      <View className="flex-1 bg-red-900">
        <ScrollView className="flex-1 px-6 pt-12">
          <Pressable 
            onPress={() => setShowParamedic(false)}
            className="absolute top-12 right-6 z-10 bg-red-800 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-bold">Exit Emergency Mode</Text>
          </Pressable>

          <Text className="text-white text-4xl font-bold mb-2 mt-8">🚑 EMERGENCY</Text>
          <Text className="text-red-200 text-lg mb-8">Medical information verified on Solana</Text>
          
          {/* Allergies - Most Critical */}
          <View className="bg-red-800 p-6 rounded-xl mb-4 border-2 border-white">
            <Text className="text-white text-lg opacity-80 mb-1">ALLERGIES</Text>
            <Text className="text-white text-3xl font-bold">
              {medicalInfo.allergies || 'None recorded'}
            </Text>
          </View>

          {/* Blood Type */}
          <View className="bg-red-800 p-6 rounded-xl mb-4">
            <Text className="text-white text-lg opacity-80 mb-1">BLOOD TYPE</Text>
            <Text className="text-white text-5xl font-bold">
              {medicalInfo.bloodType || 'Unknown'}
            </Text>
          </View>

          {/* Medical Conditions */}
          <View className="bg-red-800 p-6 rounded-xl mb-4">
            <Text className="text-white text-lg opacity-80 mb-2">MEDICAL CONDITIONS</Text>
            {medicalInfo.conditions.length > 0 ? (
              medicalInfo.conditions.map((condition, index) => (
                <View key={index} className="flex-row items-center mb-2">
                  <Text className="text-white text-xl font-bold">• {condition.name}</Text>
                  <View className={`ml-3 px-2 py-1 rounded-full ${
                    condition.severity === 'severe' ? 'bg-red-600' :
                    condition.severity === 'moderate' ? 'bg-yellow-600' : 'bg-green-600'
                  }`}>
                    <Text className="text-white text-xs">{condition.severity}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-white text-xl">None recorded</Text>
            )}
          </View>

          {/* Emergency Contacts */}
          <View className="bg-red-800 p-6 rounded-xl mb-8">
            <Text className="text-white text-lg opacity-80 mb-3">EMERGENCY CONTACTS</Text>
            {medicalInfo.emergencyContacts.map((contact, index) => (
              <Pressable
                key={index}
                onPress={() => callEmergencyContact(contact.phone)}
                className="mb-3 p-3 bg-red-700 rounded-lg active:bg-red-600"
              >
                <Text className="text-white font-bold text-lg">{contact.name}</Text>
                <Text className="text-white text-base">{contact.relationship}</Text>
                <Text className="text-white text-xl mt-1">{contact.phone}</Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-white text-center text-sm mb-8 opacity-60">
            Data verified on Solana • Emergency access
          </Text>
        </ScrollView>
      </View>
    )
  }

  // QR CODE VIEW
  return (
    <View className={`flex-1 ${colors.primary.bg}`}>
      <Header address={account.address.toString()} />
      
      <ScrollView className="flex-1 px-6 pt-6">
        <Text className={`text-2xl font-bold ${colors.primary.text} mb-2`}>
          Emergency QR Code
        </Text>
        <Text className={`${colors.primary.subtext} mb-6`}>
          First responders can scan this from your lock screen
        </Text>

        {isLoading ? (
          <View className="items-center py-8">
            <Text className={colors.primary.text}>Loading...</Text>
          </View>
        ) : !medicalInfo ? (
          // No medical data
          <View className="bg-yellow-50 dark:bg-yellow-900/30 p-6 rounded-xl items-center">
            <Text className="text-4xl mb-3">⚠️</Text>
            <Text className={`text-lg font-bold ${colors.primary.text} mb-2 text-center`}>
              No Medical Information Found
            </Text>
            <Text className={`${colors.primary.subtext} text-center mb-4`}>
              Please add your medical information first to generate an emergency QR code.
            </Text>
            <Pressable 
              onPress={() => router.push('/medical')}
              className="bg-blue-600 px-6 py-3 rounded-xl active:bg-blue-700"
            >
              <Text className="text-white font-bold">Go to Medical Screen</Text>
            </Pressable>
          </View>
        ) : (
          // Has medical data - show QR
          <>
            <View className="items-center mb-6">
              <View className="bg-white p-4 rounded-xl shadow-lg mb-4">
                <QRCode
                  value={generateQRData()}
                  size={250}
                />
              </View>
              
              <Pressable 
                onPress={saveQRToPhone}
                className="bg-blue-600 px-6 py-3 rounded-xl active:bg-blue-700 mb-4"
              >
                <Text className="text-white font-bold">Save QR Code</Text>
              </Pressable>
            </View>

            {/* Lock Screen Instructions */}
            <View className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-xl mb-6">
              <Text className={`font-bold ${colors.primary.text} mb-3 text-lg`}>
                📱 Set as Lock Screen
              </Text>
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Text className="text-blue-600 dark:text-blue-400 text-lg mr-3">1.</Text>
                  <Text className={`flex-1 ${colors.primary.subtext}`}>
                    Take a screenshot of the QR code above
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-blue-600 dark:text-blue-400 text-lg mr-3">2.</Text>
                  <Text className={`flex-1 ${colors.primary.subtext}`}>
                    Go to Settings → Wallpaper → Choose New Wallpaper
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-blue-600 dark:text-blue-400 text-lg mr-3">3.</Text>
                  <Text className={`flex-1 ${colors.primary.subtext}`}>
                    Select the screenshot and set as Lock Screen
                  </Text>
                </View>
              </View>
            </View>

            {/* Emergency Mode Button */}
            <Pressable 
              onPress={() => setShowParamedic(true)}
              className="bg-red-600 py-4 rounded-xl active:bg-red-700 mb-4"
            >
              <Text className="text-white font-bold text-lg text-center">
                🚑 Emergency Mode (Demo)
              </Text>
            </Pressable>

            {/* Data Summary */}
            <View className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl mb-8">
              <Text className={`font-bold ${colors.primary.text} mb-2`}>
                Included in QR:
              </Text>
              <Text className={colors.primary.subtext}>
                • Allergies: {medicalInfo.allergies || 'None'}
              </Text>
              <Text className={colors.primary.subtext}>
                • Blood Type: {medicalInfo.bloodType || 'Unknown'}
              </Text>
              <Text className={colors.primary.subtext}>
                • Conditions: {medicalInfo.conditions.length}
              </Text>
              <Text className={colors.primary.subtext}>
                • Emergency Contacts: {medicalInfo.emergencyContacts.length}
              </Text>
              {medicalInfo.lastUpdated && (
                <Text className="text-xs text-gray-400 mt-2">
                  Last updated: {new Date(medicalInfo.lastUpdated).toLocaleDateString()}
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  )
}