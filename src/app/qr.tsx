import { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable, Share, Linking } from 'react-native'
import { router } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import QRCode from 'react-native-qrcode-svg'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { Header } from '../components/Header'

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
      await Share.share({
        message: '🔐 SAFESOL EMERGENCY QR CODE',
        title: 'Emergency QR Code',
      })
      Toast.show({
        type: 'success',
        text1: 'SUCCESS',
        text2: 'SAVE SCREENSHOT AS LOCK SCREEN',
        position: 'top',
        visibilityTime: 3000,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FAILED TO SHARE QR',
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
      <LinearGradient colors={['#0a0a1f', '#1a0f2e', '#000000']} className="flex-1 items-center justify-center">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs">
          CONNECT WALLET
        </Text>
      </LinearGradient>
    )
  }

  if (showParamedic && medicalInfo) {
    // PARAMEDIC VIEW - Cyberpunk Emergency Mode
    return (
      <LinearGradient colors={['#2a0a0a', '#1a0a0a', '#0a0a0a']} className="flex-1">
        <ScrollView className="flex-1 px-4 pt-12">
          <Pressable 
            onPress={() => setShowParamedic(false)}
            className="absolute top-12 right-4 z-10 border-2 border-[#ff6f61] px-3 py-2"
            style={{ shadowColor: '#ff6f61', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }}
          >
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
              EXIT
            </Text>
          </Pressable>

          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-2xl mb-2 mt-8">
            🚑 EMERGENCY
          </Text>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mb-8">
            VERIFIED ON SOLANA
          </Text>
          
          {/* Allergies - Most Critical */}
          <View className="border-4 border-[#ff6f61] p-4 mb-4" style={{ shadowColor: '#ff6f61', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 15 }}>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[10px] mb-2">
              ALLERGIES
            </Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xl">
              {medicalInfo.allergies || 'NONE RECORDED'}
            </Text>
          </View>

          {/* Blood Type */}
          <View className="border-2 border-[#00ff9d] p-4 mb-4">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[10px] mb-2">
              BLOOD TYPE
            </Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-3xl">
              {medicalInfo.bloodType || 'UNKNOWN'}
            </Text>
          </View>

          {/* Medical Conditions */}
          <View className="border-2 border-[#8a2be2] p-4 mb-4">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[10px] mb-3">
              CONDITIONS
            </Text>
            {medicalInfo.conditions.length > 0 ? (
              medicalInfo.conditions.map((condition, index) => (
                <View key={index} className="flex-row items-center mb-2">
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs flex-1">
                    • {condition.name}
                  </Text>
                  <View className={`border-2 px-2 py-1 ${
                    condition.severity === 'severe' ? 'border-[#ff6f61]' :
                    condition.severity === 'moderate' ? 'border-[#ffb86b]' : 'border-[#00ff9d]'
                  }`}>
                    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className={`text-[6px] ${
                      condition.severity === 'severe' ? 'text-[#ff6f61]' :
                      condition.severity === 'moderate' ? 'text-[#ffb86b]' : 'text-[#00ff9d]'
                    }`}>
                      {condition.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-xs">
                NONE RECORDED
              </Text>
            )}
          </View>

          {/* Emergency Contacts */}
          <View className="border-2 border-[#ff6f61] p-4 mb-8">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[10px] mb-3">
              CONTACTS
            </Text>
            {medicalInfo.emergencyContacts.map((contact, index) => (
              <Pressable
                key={index}
                onPress={() => callEmergencyContact(contact.phone)}
                className="mb-3 border border-[#ff6f61] p-3 active:opacity-50"
              >
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs">
                  {contact.name}
                </Text>
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px] mt-1">
                  {contact.relationship}
                </Text>
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-xs mt-2">
                  {contact.phone}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a2c5a] text-[6px] text-center mb-8">
            DATA VERIFIED ON SOLANA • EMERGENCY ACCESS
          </Text>
        </ScrollView>
      </LinearGradient>
    )
  }

  // QR CODE VIEW
  return (
    <LinearGradient colors={['#0a0a1f', '#1a0f2e', '#000000']} className="flex-1">
      <Header address={account.address.toString()} />
      
      <ScrollView className="flex-1 px-4 pt-4">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-lg mb-1">
          📱 EMERGENCY QR
        </Text>
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mb-6">
          FIRST RESPONDERS SCAN FROM LOCK SCREEN
        </Text>

        {isLoading ? (
          <View className="items-center py-8">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-xs">
              LOADING...
            </Text>
          </View>
        ) : !medicalInfo ? (
          // No medical data
          <View className="border-2 border-[#ff6f61] p-6 items-center">
            <Text className="text-4xl mb-3">⚠️</Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-xs mb-2 text-center">
              NO MEDICAL DATA FOUND
            </Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] text-center mb-4">
              ADD MEDICAL INFO FIRST TO GENERATE QR
            </Text>
            <Pressable 
              onPress={() => router.push('/medical')}
              className="border-2 border-[#ff6f61] px-4 py-2"
            >
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
                GO TO MEDICAL →
              </Text>
            </Pressable>
          </View>
        ) : (
          // Has medical data - show QR
          <>
            <View className="items-center mb-6">
              <View className="bg-white p-4 border-2 border-[#00ff9d] mb-4">
                <QRCode
                  value={generateQRData()}
                  size={200}
                />
              </View>
              
              <Pressable 
                onPress={saveQRToPhone}
                className="border-2 border-[#ff6f61] px-4 py-3 mb-4"
                style={{ shadowColor: '#ff6f61', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }}
              >
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-xs">
                  SAVE QR CODE
                </Text>
              </Pressable>
            </View>

            {/* Lock Screen Instructions */}
            <View className="border-2 border-[#8a2be2] p-4 mb-6">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs mb-3">
                📱 SET AS LOCK SCREEN
              </Text>
              <View>
                <View className="flex-row mb-2">
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px] mr-2">1.</Text>
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] flex-1">
                    TAKE SCREENSHOT
                  </Text>
                </View>
                <View className="flex-row mb-2">
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px] mr-2">2.</Text>
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] flex-1">
                    SETTINGS → WALLPAPER
                  </Text>
                </View>
                <View className="flex-row">
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px] mr-2">3.</Text>
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] flex-1">
                    SELECT SCREENSHOT AS LOCK SCREEN
                  </Text>
                </View>
              </View>
            </View>

            {/* Emergency Mode Button */}
            <Pressable 
              onPress={() => setShowParamedic(true)}
              className="border-2 border-[#ff6f61] p-4 mb-4"
              style={{ shadowColor: '#ff6f61', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 15 }}
            >
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-xs text-center">
                🚑 EMERGENCY MODE
              </Text>
            </Pressable>

            {/* Data Summary */}
            <View className="border-2 border-[#00ff9d] p-4 mb-8">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs mb-2">
                QR INCLUDES:
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px]">
                • ALLERGIES: {medicalInfo.allergies || 'NONE'}
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mt-1">
                • BLOOD: {medicalInfo.bloodType || 'UNKNOWN'}
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mt-1">
                • CONDITIONS: {medicalInfo.conditions.length}
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mt-1">
                • CONTACTS: {medicalInfo.emergencyContacts.length}
              </Text>
              {medicalInfo.lastUpdated && (
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a2c5a] text-[6px] mt-2">
                  UPDATED: {new Date(medicalInfo.lastUpdated).toLocaleDateString().toUpperCase()}
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <StatusBar style="auto" />
    </LinearGradient>
  )
}