import { useState, useEffect } from 'react'
import { Text, View, ScrollView, TextInput, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { StatusBar } from 'expo-status-bar'
import { Picker } from '@react-native-picker/picker'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { Header } from '../components/Header'

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
      
      if (!encrypted) {
        console.log('No medical data found - first time user')
        return
      }
      
      try {
        const decoded = atob(encrypted)
        const data = JSON.parse(decoded)
        setMedicalInfo(data)
        
        Toast.show({
          type: 'success',
          text1: 'LOADED',
          text2: 'MEDICAL INFO LOADED',
          position: 'top',
          visibilityTime: 2000,
        })
      } catch (decryptError) {
        console.log('Could not decrypt existing data')
      }
    } catch (error) {
      console.log('Error loading medical data')
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

  const validateForm = () => {
    if (medicalInfo.emergencyContacts.length === 0) {
      showError('AT LEAST ONE CONTACT REQUIRED')
      return false
    }

    for (const [index, contact] of medicalInfo.emergencyContacts.entries()) {
      if (!contact.name.trim()) {
        showError(`CONTACT ${index + 1}: NAME REQUIRED`)
        return false
      }
      if (!contact.phone.trim()) {
        showError(`CONTACT ${index + 1}: PHONE REQUIRED`)
        return false
      }
      const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,3}[-\s\.]?[0-9]{4,6}$/
      if (!phoneRegex.test(contact.phone)) {
        showError(`CONTACT ${index + 1}: INVALID PHONE`)
        return false
      }
    }

    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
    if (medicalInfo.bloodType && !validBloodTypes.includes(medicalInfo.bloodType)) {
      showError('SELECT VALID BLOOD TYPE')
      return false
    }

    return true
  }

  const saveMedicalInfo = async () => {
    if (!account) {
      showError('WALLET NOT CONNECTED')
      return
    }

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const dataToSave = {
        ...medicalInfo,
        lastUpdated: Date.now()
      }
      
      const jsonString = JSON.stringify(dataToSave)
      const encrypted = btoa(jsonString)
      
      await AsyncStorage.setItem(
        `medical_${account.address.toString()}`, 
        encrypted
      )
      
      showSuccess('MEDICAL INFO SAVED')
      setTimeout(() => router.back(), 1500)
    } catch (error) {
      console.error('Save error:', error)
      showError('FAILED TO SAVE')
    } finally {
      setIsLoading(false)
    }
  }

  const addContact = () => {
    setMedicalInfo({
      ...medicalInfo,
      emergencyContacts: [
        ...medicalInfo.emergencyContacts,
        { name: '', phone: '', relationship: '' }
      ]
    })
    showSuccess('CONTACT ADDED')
  }

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const updated = [...medicalInfo.emergencyContacts]
    updated[index] = { ...updated[index], [field]: value }
    setMedicalInfo({ ...medicalInfo, emergencyContacts: updated })
  }

  const removeContact = (index: number) => {
    if (medicalInfo.emergencyContacts.length <= 1) {
      showError('MINIMUM ONE CONTACT')
      return
    }
    const updated = medicalInfo.emergencyContacts.filter((_, i) => i !== index)
    setMedicalInfo({ ...medicalInfo, emergencyContacts: updated })
    showSuccess('CONTACT REMOVED')
  }

  const addCondition = () => {
    setMedicalInfo({
      ...medicalInfo,
      conditions: [
        ...medicalInfo.conditions,
        { name: '', severity: 'mild' as const }
      ]
    })
    showSuccess('CONDITION ADDED')
  }

  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    const updated = [...medicalInfo.conditions]
    updated[index] = { ...updated[index], [field]: value }
    setMedicalInfo({ ...medicalInfo, conditions: updated })
  }

  const removeCondition = (index: number) => {
    const updated = medicalInfo.conditions.filter((_, i) => i !== index)
    setMedicalInfo({ ...medicalInfo, conditions: updated })
    showSuccess('CONDITION REMOVED')
  }

  const getSeverityColor = (severity: string, isSelected: boolean) => {
    if (!isSelected) return 'border-[#4a2c5a] bg-transparent'
    switch(severity) {
      case 'severe': return 'border-[#ff6f61] bg-[#ff6f61]'
      case 'moderate': return 'border-[#ffb86b] bg-[#ffb86b]'
      case 'mild': return 'border-[#00ff9d] bg-[#00ff9d]'
      default: return 'border-[#4a2c5a]'
    }
  }

  const getSeverityTextColor = (severity: string, isSelected: boolean) => {
    if (!isSelected) return 'text-[#b39eb5]'
    return 'text-[#0a0a1f]'
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
        {/* Header */}
        <View className="mb-4">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-lg mb-1">
            🏥 MEDICAL INFO
          </Text>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px]">
            ENCRYPTED • DEVICE ONLY
          </Text>
          {medicalInfo.lastUpdated && (
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a2c5a] text-[6px] mt-2">
              UPDATED: {new Date(medicalInfo.lastUpdated).toLocaleDateString().toUpperCase()}
            </Text>
          )}
        </View>

        {/* Allergies */}
        <View className="mb-4">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs mb-2">
            ALLERGIES
          </Text>
          <View className="border-2 border-[#6a0dad] p-1">
            <TextInput
              className="p-3 text-[#ffd9b3] text-[10px]"
              placeholder="PENICILLIN, PEANUTS, LATEX"
              placeholderTextColor="#4a2c5a"
              value={medicalInfo.allergies}
              onChangeText={(text) => setMedicalInfo({...medicalInfo, allergies: text})}
              multiline
              style={{ fontFamily: 'PressStart2P_400Regular' }}
            />
          </View>
        </View>

        {/* Blood Type */}
        <View className="mb-4">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs mb-2">
            BLOOD TYPE
          </Text>
          <View className="border-2 border-[#6a0dad]">
            <Picker
              selectedValue={medicalInfo.bloodType}
              onValueChange={(value) => setMedicalInfo({...medicalInfo, bloodType: value})}
              dropdownIconColor="#ff6f61"
              style={{ color: '#ffd9b3', fontFamily: 'PressStart2P_400Regular' }}
            >
              <Picker.Item label="SELECT BLOOD TYPE" value="" color="#4a2c5a" />
              <Picker.Item label="A+" value="A+" color="#ffd9b3" />
              <Picker.Item label="A-" value="A-" color="#ffd9b3" />
              <Picker.Item label="B+" value="B+" color="#ffd9b3" />
              <Picker.Item label="B-" value="B-" color="#ffd9b3" />
              <Picker.Item label="O+" value="O+" color="#ffd9b3" />
              <Picker.Item label="O-" value="O-" color="#ffd9b3" />
              <Picker.Item label="AB+" value="AB+" color="#ffd9b3" />
              <Picker.Item label="AB-" value="AB-" color="#ffd9b3" />
            </Picker>
          </View>
        </View>

        {/* Medical Conditions */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs">
              CONDITIONS
            </Text>
            <Pressable onPress={addCondition} className="border border-[#ff6f61] px-2 py-1">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
                + ADD
              </Text>
            </Pressable>
          </View>

          {medicalInfo.conditions.map((condition, index) => (
            <View key={index} className="border-2 border-[#8a2be2] p-3 mb-2">
              <View className="flex-row justify-between mb-2">
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px]">
                  CONDITION {index + 1}
                </Text>
                <Pressable onPress={() => removeCondition(index)}>
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[6px]">
                    REMOVE
                  </Text>
                </Pressable>
              </View>
              
              <View className="border border-[#6a0dad] mb-2">
                <TextInput
                  className="p-2 text-[#ffd9b3] text-[8px]"
                  placeholder="CONDITION NAME"
                  placeholderTextColor="#4a2c5a"
                  value={condition.name}
                  onChangeText={(text) => updateCondition(index, 'name', text)}
                  style={{ fontFamily: 'PressStart2P_400Regular' }}
                />
              </View>
              
              <View className="flex-row justify-between">
                {(['mild', 'moderate', 'severe'] as const).map((severity) => (
                  <Pressable
                    key={severity}
                    onPress={() => updateCondition(index, 'severity', severity)}
                    className={`px-2 py-1 border-2 ${getSeverityColor(severity, condition.severity === severity)}`}
                  >
                    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className={`text-[6px] ${getSeverityTextColor(severity, condition.severity === severity)}`}>
                      {severity.toUpperCase()}
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
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs">
              EMERGENCY CONTACTS
            </Text>
            <Pressable onPress={addContact} className="border border-[#ff6f61] px-2 py-1">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
                + ADD
              </Text>
            </Pressable>
          </View>

          {medicalInfo.emergencyContacts.map((contact, index) => (
            <View key={index} className="border-2 border-[#00ff9d] p-3 mb-3">
              <View className="flex-row justify-between mb-2">
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px]">
                  CONTACT {index + 1}
                </Text>
                <Pressable onPress={() => removeContact(index)}>
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[6px]">
                    REMOVE
                  </Text>
                </Pressable>
              </View>

              <View className="border border-[#6a0dad] mb-2">
                <TextInput
                  className="p-2 text-[#ffd9b3] text-[8px]"
                  placeholder="FULL NAME *"
                  placeholderTextColor="#4a2c5a"
                  value={contact.name}
                  onChangeText={(text) => updateContact(index, 'name', text)}
                  style={{ fontFamily: 'PressStart2P_400Regular' }}
                />
              </View>

              <View className="border border-[#6a0dad] mb-2">
                <TextInput
                  className="p-2 text-[#ffd9b3] text-[8px]"
                  placeholder="PHONE NUMBER *"
                  placeholderTextColor="#4a2c5a"
                  value={contact.phone}
                  onChangeText={(text) => updateContact(index, 'phone', text)}
                  keyboardType="phone-pad"
                  style={{ fontFamily: 'PressStart2P_400Regular' }}
                />
              </View>

              <View className="border border-[#6a0dad]">
                <TextInput
                  className="p-2 text-[#ffd9b3] text-[8px]"
                  placeholder="RELATIONSHIP"
                  placeholderTextColor="#4a2c5a"
                  value={contact.relationship}
                  onChangeText={(text) => updateContact(index, 'relationship', text)}
                  style={{ fontFamily: 'PressStart2P_400Regular' }}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Save Button */}
        <Pressable 
          onPress={saveMedicalInfo}
          disabled={isLoading}
          className="mb-8"
        >
          <LinearGradient
            colors={isLoading ? ['#4a2c5a', '#2a1a3a'] : ['#ff6f61', '#8a2be2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className={`p-4 border-2 border-[#ff6f61] ${isLoading ? 'opacity-50' : ''}`}
            style={{ shadowColor: '#ff6f61', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }}
          >
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs text-center">
              {isLoading ? 'SAVING...' : 'SAVE MEDICAL INFO'}
            </Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>

      <StatusBar style="auto" />
    </LinearGradient>
  )
}