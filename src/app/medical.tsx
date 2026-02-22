import { useState, useEffect } from 'react'
import { Text, View, ScrollView, TextInput, Pressable, Alert } from 'react-native'
import { router } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { StatusBar } from 'expo-status-bar'
import { Header } from '../components/Header'
import { storage } from '../utils/storage'
import { colors } from '../constants/colors'
import { MedicalInfo } from '../types'

export default function MedicalScreen() {
  const { account } = useMobileWallet()
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    allergies: '',
    bloodType: '',
    conditions: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  })

  // Load existing data if any
  useEffect(() => {
    if (account) {
      loadMedicalData()
    }
  }, [account])

  const loadMedicalData = async () => {
    if (!account) return
    const data = await storage.getMedical(account.address.toString())
    if (data) {
      setMedicalInfo(data)
    }
  }

  const saveMedicalInfo = async () => {
    if (!account) {
      Alert.alert('Error', 'Wallet not connected')
      return
    }

    try {
      await storage.saveMedical(account.address.toString(), medicalInfo)
      Alert.alert(
        'Success', 
        'Medical information saved',
        [{ text: 'OK', onPress: () => router.back() }]
      )
    } catch (error) {
      Alert.alert('Error', 'Failed to save')
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
          Medical Information
        </Text>
        <Text className={`${colors.primary.subtext} mb-6`}>
          This data is stored only on your device
        </Text>

        {/* Allergies - Now clearly visible */}
        <View className="mb-4">
          <Text className={`${colors.primary.text} font-bold mb-2`}>Allergies</Text>
          <TextInput
            className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white"
            placeholder="e.g., Penicillin, Peanuts, Latex"
            placeholderTextColor="#9CA3AF"
            value={medicalInfo.allergies}
            onChangeText={(text) => setMedicalInfo({...medicalInfo, allergies: text})}
            multiline
          />
        </View>

        {/* Blood Type */}
        <View className="mb-4">
          <Text className={`${colors.primary.text} font-bold mb-2`}>Blood Type</Text>
          <TextInput
            className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white"
            placeholder="e.g., A+, O-, AB-"
            placeholderTextColor="#9CA3AF"
            value={medicalInfo.bloodType}
            onChangeText={(text) => setMedicalInfo({...medicalInfo, bloodType: text})}
          />
        </View>

        {/* Medical Conditions */}
        <View className="mb-4">
          <Text className={`${colors.primary.text} font-bold mb-2`}>Medical Conditions</Text>
          <TextInput
            className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white"
            placeholder="e.g., Diabetes, Asthma, Hypertension"
            placeholderTextColor="#9CA3AF"
            value={medicalInfo.conditions}
            onChangeText={(text) => setMedicalInfo({...medicalInfo, conditions: text})}
            multiline
          />
        </View>

        {/* Emergency Contact Name */}
        <View className="mb-4">
          <Text className={`${colors.primary.text} font-bold mb-2`}>Emergency Contact Name</Text>
          <TextInput
            className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white"
            placeholder="Full name"
            placeholderTextColor="#9CA3AF"
            value={medicalInfo.emergencyContactName}
            onChangeText={(text) => setMedicalInfo({...medicalInfo, emergencyContactName: text})}
          />
        </View>

        {/* Emergency Contact Phone */}
        <View className="mb-8">
          <Text className={`${colors.primary.text} font-bold mb-2`}>Emergency Contact Phone</Text>
          <TextInput
            className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white"
            placeholder="+1 234 567 8900"
            placeholderTextColor="#9CA3AF"
            value={medicalInfo.emergencyContactPhone}
            onChangeText={(text) => setMedicalInfo({...medicalInfo, emergencyContactPhone: text})}
            keyboardType="phone-pad"
          />
        </View>

        {/* Save Button */}
        <Pressable 
          onPress={saveMedicalInfo}
          className="bg-blue-600 py-4 rounded-xl active:bg-blue-700 mb-8"
        >
          <Text className="text-white font-bold text-lg text-center">Save Medical Info</Text>
        </Pressable>
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  )
}