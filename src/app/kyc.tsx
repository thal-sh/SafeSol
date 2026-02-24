import { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable, Image } from 'react-native'
import { router } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { Header } from '../components/Header'

type KYCStatus = 'pending' | 'submitted' | 'verified' | 'rejected'

type KYCData = {
  status: KYCStatus
  idDocument?: {
    uri: string
    type: 'passport' | 'drivers_license' | 'national_id'
    verifiedAt?: number
  }
  selfie?: {
    uri: string
    verifiedAt?: number
  }
  submittedAt?: number
  verifiedAt?: number
  rejectionReason?: string
}

export default function KYCScreen() {
  const { account } = useMobileWallet()
  const [kycData, setKycData] = useState<KYCData>({
    status: 'pending',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [idImage, setIdImage] = useState<string | null>(null)
  const [selfieImage, setSelfieImage] = useState<string | null>(null)

  // Load existing KYC data
  useEffect(() => {
    if (account) {
      loadKYCData()
    }
  }, [account])

  useEffect(() => {
    // Request permissions on mount
    ;(async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync()
      const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
      
      if (!cameraStatus.granted || !mediaStatus.granted) {
        showError('CAMERA & MEDIA PERMISSIONS REQUIRED')
      }
    })()
  }, [])

  const loadKYCData = async () => {
    if (!account) return
    
    try {
      const saved = await AsyncStorage.getItem(`kyc_${account.address.toString()}`)
      if (saved) {
        const data = JSON.parse(saved)
        setKycData(data)
        if (data.idDocument) setIdImage(data.idDocument.uri)
        if (data.selfie) setSelfieImage(data.selfie.uri)
      }
    } catch (error) {
      console.log('No existing KYC data')
    }
  }

  const showError = (message: string) => {
    Toast.show({
      type: 'error',
      text1: 'ERROR',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    })
  }

  const showSuccess = (message: string) => {
    Toast.show({
      type: 'success',
      text1: 'SUCCESS',
      text2: message,
      position: 'top',
      visibilityTime: 2000,
    })
  }

  const showInfo = (message: string) => {
    Toast.show({
      type: 'info',
      text1: 'INFO',
      text2: message,
      position: 'top',
      visibilityTime: 2000,
    })
  }

  const pickImage = async (type: 'id' | 'selfie') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: type === 'selfie',
        aspect: type === 'selfie' ? [1, 1] : [4, 3],
        quality: 0.8,
        base64: true,
      })

      if (!result.canceled && result.assets[0]) {
        if (type === 'id') {
          setIdImage(result.assets[0].uri)
          showSuccess('ID UPLOADED')
        } else {
          setSelfieImage(result.assets[0].uri)
          showSuccess('SELFIE UPLOADED')
        }
      }
    } catch (error) {
      showError('FAILED TO PICK IMAGE')
    }
  }

  const takePhoto = async (type: 'id' | 'selfie') => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: type === 'selfie',
        aspect: type === 'selfie' ? [1, 1] : [4, 3],
        quality: 0.8,
        base64: true,
      })

      if (!result.canceled && result.assets[0]) {
        if (type === 'id') {
          setIdImage(result.assets[0].uri)
          showSuccess('ID PHOTO TAKEN')
        } else {
          setSelfieImage(result.assets[0].uri)
          showSuccess('SELFIE TAKEN')
        }
      }
    } catch (error) {
      showError('FAILED TO TAKE PHOTO')
    }
  }

  const validateForm = () => {
    if (!idImage) {
      showError('UPLOAD ID DOCUMENT')
      return false
    }
    if (!selfieImage) {
      showError('UPLOAD SELFIE')
      return false
    }
    return true
  }

  const submitForVerification = async () => {
    if (!account) {
      showError('WALLET NOT CONNECTED')
      return
    }

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const newKYCData: KYCData = {
        status: 'submitted',
        idDocument: {
          uri: idImage!,
          type: 'passport',
        },
        selfie: {
          uri: selfieImage!,
        },
        submittedAt: Date.now(),
      }

      await AsyncStorage.setItem(
        `kyc_${account.address.toString()}`,
        JSON.stringify(newKYCData)
      )
      
      setKycData(newKYCData)
      showSuccess('KYC SUBMITTED')

      // Simulate verification after 3 seconds
      setTimeout(() => simulateVerification(), 3000)
      
    } catch (error) {
      showError('FAILED TO SUBMIT')
    } finally {
      setIsLoading(false)
    }
  }

  const simulateVerification = async () => {
    if (!account) return
    
    const success = Math.random() > 0.2
    
    const updatedData: KYCData = {
      ...kycData,
      status: success ? 'verified' : 'rejected',
      verifiedAt: success ? Date.now() : undefined,
      rejectionReason: success ? undefined : 'IMAGE QUALITY LOW',
    }

    await AsyncStorage.setItem(
      `kyc_${account.address.toString()}`,
      JSON.stringify(updatedData)
    )
    
    setKycData(updatedData)
    
    if (success) {
      showSuccess('KYC VERIFIED')
    } else {
      showInfo('KYC REJECTED - TRY AGAIN')
    }
  }

  const resetKYC = async () => {
    if (!account) return
    
    const newData: KYCData = { status: 'pending' }
    await AsyncStorage.setItem(
      `kyc_${account.address.toString()}`,
      JSON.stringify(newData)
    )
    
    setKycData(newData)
    setIdImage(null)
    setSelfieImage(null)
    showSuccess('KYC RESET')
  }

  const getStatusBadge = () => {
    switch (kycData.status) {
      case 'verified':
        return (
          <View className="border-2 border-[#00ff9d] px-3 py-1 self-start">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[8px]">
              ✓ VERIFIED
            </Text>
          </View>
        )
      case 'submitted':
        return (
          <View className="border-2 border-[#ffb86b] px-3 py-1 self-start">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffb86b] text-[8px]">
              ⏳ PENDING
            </Text>
          </View>
        )
      case 'rejected':
        return (
          <View className="border-2 border-[#ff6f61] px-3 py-1 self-start">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
              ✗ REJECTED
            </Text>
          </View>
        )
      default:
        return (
          <View className="border-2 border-[#4a2c5a] px-3 py-1 self-start">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px]">
              ○ NOT STARTED
            </Text>
          </View>
        )
    }
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

  return (
    <LinearGradient colors={['#0a0a1f', '#1a0f2e', '#000000']} className="flex-1">
      <Header address={account.address.toString()} />
      
      <ScrollView className="flex-1 px-4 pt-4">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-lg mb-1">
          ✅ KYC VERIFICATION
        </Text>
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mb-4">
          VERIFY ONCE • NO DATA STORED
        </Text>
        
        {/* Status Section */}
        <View className="mb-6">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs mb-2">
            CURRENT STATUS
          </Text>
          {getStatusBadge()}
          {kycData.verifiedAt && (
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a2c5a] text-[6px] mt-2">
              VERIFIED: {new Date(kycData.verifiedAt).toLocaleDateString().toUpperCase()}
            </Text>
          )}
          {kycData.rejectionReason && (
            <View className="border-2 border-[#ff6f61] p-2 mt-2">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
                REASON: {kycData.rejectionReason}
              </Text>
            </View>
          )}
        </View>

        {kycData.status === 'verified' ? (
          // Verified State
          <View className="items-center py-8">
            <View className="w-24 h-24 border-4 border-[#00ff9d] items-center justify-center mb-4">
              <Text className="text-5xl text-[#00ff9d]">✓</Text>
            </View>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-sm mb-2 text-center">
              IDENTITY VERIFIED
            </Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] text-center mb-6">
              ALL FEATURES UNLOCKED
            </Text>
            <Pressable 
              onPress={resetKYC}
              className="border-2 border-[#ff6f61] px-4 py-2"
            >
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
                RESET KYC (DEMO)
              </Text>
            </Pressable>
          </View>
        ) : (
          // KYC Form
          <>
            {/* ID Document Upload */}
            <View className="mb-6">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs mb-2">
                ID DOCUMENT
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px] mb-3">
                PASSPORT, LICENSE, OR NATIONAL ID
              </Text>
              
              {idImage ? (
                <View className="mb-3">
                  <View className="border-2 border-[#00ff9d] p-1">
                    <Image source={{ uri: idImage }} className="w-full h-48" resizeMode="contain" />
                  </View>
                  <Pressable 
                    onPress={() => pickImage('id')}
                    className="mt-2"
                  >
                    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px] text-center">
                      CHANGE ID
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View className="flex-row">
                  <Pressable 
                    onPress={() => pickImage('id')}
                    className="flex-1 border-2 border-[#6a0dad] p-3 items-center mr-1"
                  >
                    <Text className="text-2xl mb-1">📁</Text>
                    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
                      UPLOAD
                    </Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => takePhoto('id')}
                    className="flex-1 border-2 border-[#6a0dad] p-3 items-center ml-1"
                  >
                    <Text className="text-2xl mb-1">📷</Text>
                    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
                      CAMERA
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Selfie Upload */}
            <View className="mb-8">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs mb-2">
                SELFIE
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px] mb-3">
                CLEAR PHOTO OF YOUR FACE
              </Text>
              
              {selfieImage ? (
                <View className="mb-3 items-center">
                  <View className="border-2 border-[#00ff9d] p-1 w-32 h-32">
                    <Image source={{ uri: selfieImage }} className="w-full h-full" resizeMode="cover" />
                  </View>
                  <Pressable 
                    onPress={() => takePhoto('selfie')}
                    className="mt-2"
                  >
                    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
                      RETAKE
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View className="flex-row">
                  <Pressable 
                    onPress={() => pickImage('selfie')}
                    className="flex-1 border-2 border-[#6a0dad] p-3 items-center mr-1"
                  >
                    <Text className="text-2xl mb-1">📁</Text>
                    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
                      UPLOAD
                    </Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => takePhoto('selfie')}
                    className="flex-1 border-2 border-[#6a0dad] p-3 items-center ml-1"
                  >
                    <Text className="text-2xl mb-1">📷</Text>
                    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
                      CAMERA
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <Pressable 
              onPress={submitForVerification}
              disabled={isLoading || kycData.status === 'submitted'}
              className="mb-4"
            >
              <LinearGradient
                colors={isLoading || kycData.status === 'submitted' ? ['#4a2c5a', '#2a1a3a'] : ['#ff6f61', '#8a2be2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className={`p-4 border-2 border-[#ff6f61] ${isLoading || kycData.status === 'submitted' ? 'opacity-50' : ''}`}
                style={{ shadowColor: '#ff6f61', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }}
              >
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs text-center">
                  {isLoading ? 'SUBMITTING...' : 
                   kycData.status === 'submitted' ? 'PENDING REVIEW' : 
                   'SUBMIT FOR VERIFICATION'}
                </Text>
              </LinearGradient>
            </Pressable>

            {kycData.status === 'submitted' && (
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] text-center mb-8">
                REVIEW TAKES 1-2 MINUTES
              </Text>
            )}
          </>
        )}

        {/* Info Box */}
        <View className="border-2 border-[#8a2be2] p-4 mb-8">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px] mb-2">
            🔐 PRIVACY FIRST
          </Text>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px]">
            • IMAGES PROCESSED LOCALLY{'\n'}
            • NO DATA PERMANENTLY STORED{'\n'}
            • ONLY STATUS SAVED{'\n'}
            • DEMO: SIMULATED VERIFICATION
          </Text>
        </View>
      </ScrollView>

      <StatusBar style="auto" />
    </LinearGradient>
  )
}