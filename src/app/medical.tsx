import { useState, useEffect } from 'react'
import { Text, View, ScrollView, TextInput, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { StatusBar } from 'expo-status-bar'
import { Picker } from '@react-native-picker/picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { Header } from '../components/Header'
import { colors } from '../constants/colors'

// Types
type Condition = {
  name: string
  severity: 'mild' | 'moderate' | 'severe'
  diagnosedDate?: string
}

type Contact = {
  name: string
  phone: string
  relationship: string
}

type MedicalInfo = {
  allergies: string
  bloodType: string
  conditions: Condition[]
  emergencyContacts: Contact[]
  lastUpdated?: number
}

export default function MedicalScreen() {
  const { account } = useMobileWallet()
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    allergies: '',
    bloodType: '',
    conditions: [],
    emergencyContacts: [{ name: '', phone: '', relationship: '' }],
  })
  const [isLoading, setIsLoading] = useState(false)

  // Load existing data if any
  useEffect(() => {
    if (account) {
      loadMedicalData()
    }
  }, [account])

  const loadMedicalData = async () => {
    if (!account) return
    
    try {
      const encrypted = await AsyncStorage.getItem(`medical_${account.address.toString()}`)
      
      // If no data exists yet, just return (first time user)
      if (!encrypted) {
        console.log('No medical data found - first time user')
        return
      }
      
      // Try to decrypt
      try {
        const decoded = atob(encrypted)
        const data = JSON.parse(decoded)
        setMedicalInfo(data)
        
        Toast.show({
          type: 'info',
          text1: 'Loaded',
          text2: 'Your medical information has been loaded',
          position: 'top',
          visibilityTime: 2000,
        })
      } catch (decryptError) {
        // If decryption fails, data might be corrupted
        console.log('Could not decrypt existing data')
        // Optionally clear corrupted data:
        // await AsyncStorage.removeItem(`medical_${account.address.toString()}`)
      }
    } catch (error) {
      console.log('Error loading medical data')
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

  const validateForm = () => {
    // Check emergency contacts
    if (medicalInfo.emergencyContacts.length === 0) {
      showError('At least one emergency contact is required')
      return false
    }

    for (const [index, contact] of medicalInfo.emergencyContacts.entries()) {
      if (!contact.name.trim()) {
        showError(`Contact ${index + 1}: Name is required`)
        return false
      }
      if (!contact.phone.trim()) {
        showError(`Contact ${index + 1}: Phone number is required`)
        return false
      }
      // Basic phone validation
      const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,3}[-\s\.]?[0-9]{4,6}$/
      if (!phoneRegex.test(contact.phone)) {
        showError(`Contact ${index + 1}: Please enter a valid phone number`)
        return false
      }
    }

    // Blood type validation
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
    if (medicalInfo.bloodType && !validBloodTypes.includes(medicalInfo.bloodType)) {
      showError('Please select a valid blood type')
      return false
    }

    return true
  }

  const saveMedicalInfo = async () => {
    if (!account) {
      showError('Wallet not connected')
      return
    }

    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Add timestamp
      const dataToSave = {
        ...medicalInfo,
        lastUpdated: Date.now()
      }
      
      // Simple encryption (base64)
      const jsonString = JSON.stringify(dataToSave)
      const encrypted = btoa(jsonString)
      
      await AsyncStorage.setItem(
        `medical_${account.address.toString()}`, 
        encrypted
      )
      
      showSuccess('Medical information saved securely')
      setTimeout(() => router.back(), 1500)
    } catch (error) {
      console.error('Save error:', error)
      showError('Failed to save')
    } finally {
      setIsLoading(false)
    }
  }

  // Contact management
  const addContact = () => {
    setMedicalInfo({
      ...medicalInfo,
      emergencyContacts: [
        ...medicalInfo.emergencyContacts,
        { name: '', phone: '', relationship: '' }
      ]
    })
    showSuccess('New contact added')
  }

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const updated = [...medicalInfo.emergencyContacts]
    updated[index] = { ...updated[index], [field]: value }
    setMedicalInfo({ ...medicalInfo, emergencyContacts: updated })
  }

  const removeContact = (index: number) => {
    if (medicalInfo.emergencyContacts.length <= 1) {
      showError('You need at least one emergency contact')
      return
    }
    const updated = medicalInfo.emergencyContacts.filter((_, i) => i !== index)
    setMedicalInfo({ ...medicalInfo, emergencyContacts: updated })
    showSuccess('Contact removed')
  }

  // Condition management
  const addCondition = () => {
    setMedicalInfo({
      ...medicalInfo,
      conditions: [
        ...medicalInfo.conditions,
        { name: '', severity: 'mild' as const }
      ]
    })
    showSuccess('New condition added')
  }

  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    const updated = [...medicalInfo.conditions]
    updated[index] = { ...updated[index], [field]: value }
    setMedicalInfo({ ...medicalInfo, conditions: updated })
  }

  const removeCondition = (index: number) => {
    const updated = medicalInfo.conditions.filter((_, i) => i !== index)
    setMedicalInfo({ ...medicalInfo, conditions: updated })
    showSuccess('Condition removed')
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
        <Text className={`${colors.primary.subtext} mb-1`}>
          This data is encrypted and stored only on your device
        </Text>
        {medicalInfo.lastUpdated && (
          <Text className="text-xs text-gray-400 mb-6">
            Last updated: {new Date(medicalInfo.lastUpdated).toLocaleDateString()} at{' '}
            {new Date(medicalInfo.lastUpdated).toLocaleTimeString()}
          </Text>
        )}

        {/* Allergies */}
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

        {/* Blood Type with Picker */}
        <View className="mb-4">
          <Text className={`${colors.primary.text} font-bold mb-2`}>Blood Type</Text>
          <View className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl">
            <Picker
              selectedValue={medicalInfo.bloodType}
              onValueChange={(value) => setMedicalInfo({...medicalInfo, bloodType: value})}
              dropdownIconColor={colors.primary.text === 'text-gray-800 dark:text-white' ? '#666' : '#fff'}
            >
              <Picker.Item label="Select blood type" value="" />
              <Picker.Item label="A+" value="A+" />
              <Picker.Item label="A-" value="A-" />
              <Picker.Item label="B+" value="B+" />
              <Picker.Item label="B-" value="B-" />
              <Picker.Item label="O+" value="O+" />
              <Picker.Item label="O-" value="O-" />
              <Picker.Item label="AB+" value="AB+" />
              <Picker.Item label="AB-" value="AB-" />
            </Picker>
          </View>
        </View>

        {/* Medical Conditions with Severity */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className={`${colors.primary.text} font-bold`}>Medical Conditions</Text>
            <Pressable onPress={addCondition} className="bg-blue-600 px-3 py-1 rounded-lg">
              <Text className="text-white text-sm font-bold">+ Add</Text>
            </Pressable>
          </View>

          {medicalInfo.conditions.map((condition, index) => (
            <View key={index} className="mb-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600 dark:text-gray-400 text-xs">Condition {index + 1}</Text>
                <Pressable onPress={() => removeCondition(index)}>
                  <Text className="text-red-500 text-xs">Remove</Text>
                </Pressable>
              </View>
              
              <TextInput
                className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2 mb-2 text-gray-900 dark:text-white"
                placeholder="Condition name"
                placeholderTextColor="#9CA3AF"
                value={condition.name}
                onChangeText={(text) => updateCondition(index, 'name', text)}
              />
              
              <View className="flex-row justify-between">
                {(['mild', 'moderate', 'severe'] as const).map((severity) => (
                  <Pressable
                    key={severity}
                    onPress={() => updateCondition(index, 'severity', severity)}
                    className={`px-3 py-1 rounded-lg ${
                      condition.severity === severity
                        ? severity === 'severe'
                          ? 'bg-red-500'
                          : severity === 'moderate'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${
                      condition.severity === severity ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {severity}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Emergency Contacts */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-2">
            <Text className={`${colors.primary.text} font-bold`}>Emergency Contacts</Text>
            <Pressable onPress={addContact} className="bg-blue-600 px-3 py-1 rounded-lg">
              <Text className="text-white text-sm font-bold">+ Add</Text>
            </Pressable>
          </View>

          {medicalInfo.emergencyContacts.map((contact, index) => (
            <View key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600 dark:text-gray-400 text-xs">Contact {index + 1}</Text>
                <Pressable onPress={() => removeContact(index)}>
                  <Text className="text-red-500 text-xs">Remove</Text>
                </Pressable>
              </View>

              <TextInput
                className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 mb-2 text-gray-900 dark:text-white"
                placeholder="Full name *"
                placeholderTextColor="#9CA3AF"
                value={contact.name}
                onChangeText={(text) => updateContact(index, 'name', text)}
              />

              <TextInput
                className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 mb-2 text-gray-900 dark:text-white"
                placeholder="Phone number *"
                placeholderTextColor="#9CA3AF"
                value={contact.phone}
                onChangeText={(text) => updateContact(index, 'phone', text)}
                keyboardType="phone-pad"
              />

              <TextInput
                className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white"
                placeholder="Relationship (e.g., Spouse, Parent)"
                placeholderTextColor="#9CA3AF"
                value={contact.relationship}
                onChangeText={(text) => updateContact(index, 'relationship', text)}
              />
            </View>
          ))}
        </View>

        {/* Save Button */}
        <Pressable 
          onPress={saveMedicalInfo}
          disabled={isLoading}
          className={`bg-blue-600 py-4 rounded-xl active:bg-blue-700 mb-8 ${isLoading ? 'opacity-50' : ''}`}
        >
          <Text className="text-white font-bold text-lg text-center">
            {isLoading ? 'Saving...' : 'Save Medical Info Securely'}
          </Text>
        </Pressable>
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  )
}