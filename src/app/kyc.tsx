import { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable, Image } from 'react-native'
import { router } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { StatusBar } from 'expo-status-bar'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { Header } from '../components/Header'
import { colors } from '../constants/colors'

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
        showError('Camera and media library permissions are required')
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
      text1: 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    })
  }

  const showSuccess = (message: string) => {
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: message,
      position: 'top',
      visibilityTime: 2000,
    })
  }

  const showInfo = (message: string) => {
    Toast.show({
      type: 'info',
      text1: 'Info',
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
          showSuccess('ID document uploaded')
        } else {
          setSelfieImage(result.assets[0].uri)
          showSuccess('Selfie uploaded')
        }
      }
    } catch (error) {
      showError('Failed to pick image')
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
          showSuccess('ID photo taken')
        } else {
          setSelfieImage(result.assets[0].uri)
          showSuccess('Selfie taken')
        }
      }
    } catch (error) {
      showError('Failed to take photo')
    }
  }

  const validateForm = () => {
    if (!idImage) {
      showError('Please upload an ID document')
      return false
    }
    if (!selfieImage) {
      showError('Please upload a selfie')
      return false
    }
    return true
  }

  const submitForVerification = async () => {
    if (!account) {
      showError('Wallet not connected')
      return
    }

    if (!validateForm()) return

    setIsLoading(true)
    try {
      // In a real app, you'd send these to a KYC provider
      // For hackathon demo, we'll simulate verification after 3 seconds
      
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
      showSuccess('KYC submitted for verification')

      // Simulate verification after 3 seconds (for demo)
      setTimeout(() => simulateVerification(), 3000)
      
    } catch (error) {
      showError('Failed to submit KYC')
    } finally {
      setIsLoading(false)
    }
  }

  const simulateVerification = async () => {
    if (!account) return
    
    // For demo: 80% chance of success
    const success = Math.random() > 0.2
    
    const updatedData: KYCData = {
      ...kycData,
      status: success ? 'verified' : 'rejected',
      verifiedAt: success ? Date.now() : undefined,
      rejectionReason: success ? undefined : 'Image quality too low. Please upload clearer photos.',
    }

    await AsyncStorage.setItem(
      `kyc_${account.address.toString()}`,
      JSON.stringify(updatedData)
    )
    
    setKycData(updatedData)
    
    if (success) {
      showSuccess('KYC verified! Your identity has been confirmed.')
    } else {
      showInfo('KYC rejected. Please try again with clearer photos.')
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
    showSuccess('KYC reset. You can start over.')
  }

  const getStatusBadge = () => {
    switch (kycData.status) {
      case 'verified':
        return (
          <View className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full self-start">
            <Text className="text-green-700 dark:text-green-300 font-bold">✓ Verified</Text>
          </View>
        )
      case 'submitted':
        return (
          <View className="bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full self-start">
            <Text className="text-yellow-700 dark:text-yellow-300 font-bold">⏳ Pending Review</Text>
          </View>
        )
      case 'rejected':
        return (
          <View className="bg-red-100 dark:bg-red-900 px-3 py-1 rounded-full self-start">
            <Text className="text-red-700 dark:text-red-300 font-bold">✗ Rejected</Text>
          </View>
        )
      default:
        return (
          <View className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full self-start">
            <Text className="text-gray-700 dark:text-gray-300 font-bold">○ Not Started</Text>
          </View>
        )
    }
  }

  if (!account) {
    return (
      <View className={`flex-1 ${colors.primary.bg} items-center justify-center`}>
        <Text className={colors.primary.text}>Please connect wallet</Text>
      </View>
    )
  }

  return (
    <View className={`flex-1 ${colors.primary.bg}`}>
      <Header address={account.address.toString()} />
      
      <ScrollView className="flex-1 px-6 pt-6">
        <Text className={`text-2xl font-bold ${colors.primary.text} mb-2`}>
          Identity Verification
        </Text>
        <Text className={`${colors.primary.subtext} mb-1`}>
          Verify your identity once. Your data is not stored.
        </Text>
        
        {/* Status Section */}
        <View className="mb-6">
          <Text className={`${colors.primary.text} font-bold mb-2`}>Current Status</Text>
          {getStatusBadge()}
          {kycData.verifiedAt && (
            <Text className="text-xs text-gray-400 mt-2">
              Verified on: {new Date(kycData.verifiedAt).toLocaleDateString()}
            </Text>
          )}
          {kycData.rejectionReason && (
            <View className="bg-red-50 dark:bg-red-900/30 p-3 rounded-xl mt-2">
              <Text className="text-red-700 dark:text-red-300 text-sm">
                Reason: {kycData.rejectionReason}
              </Text>
            </View>
          )}
        </View>

        {kycData.status === 'verified' ? (
          // Verified State
          <View className="items-center py-8">
            <View className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">✓</Text>
            </View>
            <Text className={`text-xl font-bold ${colors.primary.text} mb-2 text-center`}>
              Identity Verified
            </Text>
            <Text className={`${colors.primary.subtext} text-center mb-6`}>
              Your identity has been verified. You can now use all features.
            </Text>
            <Pressable 
              onPress={resetKYC}
              className="bg-blue-600 px-6 py-3 rounded-xl active:bg-blue-700"
            >
              <Text className="text-white font-bold">Reset KYC (Demo)</Text>
            </Pressable>
          </View>
        ) : (
          // KYC Form
          <>
            {/* ID Document Upload */}
            <View className="mb-6">
              <Text className={`${colors.primary.text} font-bold mb-2`}>ID Document</Text>
              <Text className={`${colors.primary.subtext} text-sm mb-3`}>
                Passport, Driver's License, or National ID
              </Text>
              
              {idImage ? (
                <View className="mb-3">
                  <Image source={{ uri: idImage }} className="w-full h-48 rounded-xl" />
                  <Pressable 
                    onPress={() => pickImage('id')}
                    className="mt-2"
                  >
                    <Text className="text-blue-600 text-center">Change ID</Text>
                  </Pressable>
                </View>
              ) : (
                <View className="flex-row space-x-3">
                  <Pressable 
                    onPress={() => pickImage('id')}
                    className="flex-1 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 items-center"
                  >
                    <Text className="text-3xl mb-2">📁</Text>
                    <Text className="text-blue-600 font-bold">Upload</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => takePhoto('id')}
                    className="flex-1 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 items-center"
                  >
                    <Text className="text-3xl mb-2">📷</Text>
                    <Text className="text-blue-600 font-bold">Take Photo</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Selfie Upload */}
            <View className="mb-8">
              <Text className={`${colors.primary.text} font-bold mb-2`}>Selfie</Text>
              <Text className={`${colors.primary.subtext} text-sm mb-3`}>
                Take a clear photo of your face
              </Text>
              
              {selfieImage ? (
                <View className="mb-3">
                  <Image source={{ uri: selfieImage }} className="w-32 h-32 rounded-full self-center" />
                  <Pressable 
                    onPress={() => takePhoto('selfie')}
                    className="mt-2"
                  >
                    <Text className="text-blue-600 text-center">Retake</Text>
                  </Pressable>
                </View>
              ) : (
                <View className="flex-row space-x-3">
                  <Pressable 
                    onPress={() => pickImage('selfie')}
                    className="flex-1 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 items-center"
                  >
                    <Text className="text-3xl mb-2">📁</Text>
                    <Text className="text-blue-600 font-bold">Upload</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => takePhoto('selfie')}
                    className="flex-1 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 items-center"
                  >
                    <Text className="text-3xl mb-2">📷</Text>
                    <Text className="text-blue-600 font-bold">Take Photo</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <Pressable 
              onPress={submitForVerification}
              disabled={isLoading || kycData.status === 'submitted'}
              className={`bg-blue-600 py-4 rounded-xl active:bg-blue-700 mb-4 ${
                isLoading || kycData.status === 'submitted' ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-white font-bold text-lg text-center">
                {isLoading ? 'Submitting...' : 
                 kycData.status === 'submitted' ? 'Pending Review' : 
                 'Submit for Verification'}
              </Text>
            </Pressable>

            {kycData.status === 'submitted' && (
              <Text className={`${colors.primary.subtext} text-center mb-8`}>
                Your submission is being reviewed. This usually takes 1-2 minutes.
              </Text>
            )}
          </>
        )}

        {/* Info Box */}
        <View className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl mb-8">
          <Text className="text-blue-800 dark:text-blue-300 font-bold mb-2">🔐 Privacy First</Text>
          <Text className="text-blue-700 dark:text-blue-400 text-sm">
            • Your images are processed locally{'\n'}
            • No data is permanently stored{'\n'}
            • Only verification status is saved{'\n'}
            • For demo: verification is simulated
          </Text>
        </View>
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  )
}