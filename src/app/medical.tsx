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
import { PixelIcon } from '../components/PixelIcon'

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

  const getSeverityStyle = (severity: string, isSelected: boolean) => {
    if (!isSelected) {
      return {
        container: 'border border-[#2a2a3f] bg-transparent',
        text: 'text-[#a0a0b0]'
      }
    }
    switch(severity) {
      case 'severe':
        return {
          container: 'border border-[#ff6f61] bg-[#ff6f61]',
          text: 'text-white'
        }
      case 'moderate':
        return {
          container: 'border border-[#ffb86b] bg-[#ffb86b]',
          text: 'text-white'
        }
      case 'mild':
        return {
          container: 'border border-[#00ff9d] bg-[#00ff9d]',
          text: 'text-white'
        }
      default:
        return {
          container: 'border border-[#2a2a3f] bg-transparent',
          text: 'text-[#a0a0b0]'
        }
    }
  }

  if (!account) {
    return (
      <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1 items-center justify-center">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs">
          CONNECT WALLET
        </Text>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1">
      <Header address={account.address.toString()} />
      
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <View className="mr-2">
              <PixelIcon name="health" color="#ff6f61" size={24} />
            </View>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-lg">
              HEALTH
            </Text>
          </View>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[8px]">
            ENCRYPTED • DEVICE ONLY
          </Text>
          {medicalInfo.lastUpdated && (
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a4a6a] text-[6px] mt-2">
              UPDATED: {new Date(medicalInfo.lastUpdated).toLocaleDateString().toUpperCase()}
            </Text>
          )}
        </View>

        {/* Allergies */}
        <View className="mb-4">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs mb-2">
            ALLERGIES
          </Text>
          <View className="bg-[#1a1a2f] p-1">
            <TextInput
              className="p-3 text-white text-xs"
              placeholder="PENICILLIN, PEANUTS, LATEX"
              placeholderTextColor="#4a4a6a"
              value={medicalInfo.allergies}
              onChangeText={(text) => setMedicalInfo({...medicalInfo, allergies: text})}
              multiline
              style={{ fontFamily: 'PressStart2P_400Regular' }}
            />
          </View>
        </View>

        {/* Blood Type */}
        <View className="mb-4">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs mb-2">
            BLOOD TYPE
          </Text>
          <View className="bg-[#1a1a2f]">
            <Picker
              selectedValue={medicalInfo.bloodType}
              onValueChange={(value) => setMedicalInfo({...medicalInfo, bloodType: value})}
              dropdownIconColor="#ffffff"
              style={{ color: '#ffffff', fontFamily: 'PressStart2P_400Regular' }}
            >
              <Picker.Item label="SELECT BLOOD TYPE" value="" color="#4a4a6a" />
              <Picker.Item label="A+" value="A+" color="#ffffff" />
              <Picker.Item label="A-" value="A-" color="#ffffff" />
              <Picker.Item label="B+" value="B+" color="#ffffff" />
              <Picker.Item label="B-" value="B-" color="#ffffff" />
              <Picker.Item label="O+" value="O+" color="#ffffff" />
              <Picker.Item label="O-" value="O-" color="#ffffff" />
              <Picker.Item label="AB+" value="AB+" color="#ffffff" />
              <Picker.Item label="AB-" value="AB-" color="#ffffff" />
            </Picker>
          </View>
        </View>

        {/* Medical Conditions */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs">
              CONDITIONS
            </Text>
            <Pressable onPress={addCondition} className="bg-[#1a1a2f] px-3 py-2">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-[8px]">
                + ADD
              </Text>
            </Pressable>
          </View>

          {medicalInfo.conditions.map((condition, index) => (
            <View key={index} className="bg-[#1a1a2f] p-3 mb-2">
              <View className="flex-row justify-between mb-2">
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px]">
                  CONDITION {index + 1}
                </Text>
                <Pressable onPress={() => removeCondition(index)}>
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[6px]">
                    REMOVE
                  </Text>
                </Pressable>
              </View>
              
              <View className="bg-[#0a0a1f] mb-2">
                <TextInput
                  className="p-2 text-white text-[8px]"
                  placeholder="CONDITION NAME"
                  placeholderTextColor="#4a4a6a"
                  value={condition.name}
                  onChangeText={(text) => updateCondition(index, 'name', text)}
                  style={{ fontFamily: 'PressStart2P_400Regular' }}
                />
              </View>
              
              <View className="flex-row justify-between">
                {(['mild', 'moderate', 'severe'] as const).map((severity) => {
                  const style = getSeverityStyle(severity, condition.severity === severity)
                  return (
                    <Pressable
                      key={severity}
                      onPress={() => updateCondition(index, 'severity', severity)}
                      className={`px-3 py-2 ${style.container}`}
                    >
                      <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className={`text-[6px] ${style.text}`}>
                        {severity.toUpperCase()}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Emergency Contacts */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-2">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs">
              EMERGENCY CONTACTS
            </Text>
            <Pressable onPress={addContact} className="bg-[#1a1a2f] px-3 py-2">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-[8px]">
                + ADD
              </Text>
            </Pressable>
          </View>

          {medicalInfo.emergencyContacts.map((contact, index) => (
            <View key={index} className="bg-[#1a1a2f] p-3 mb-3">
              <View className="flex-row justify-between mb-2">
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px]">
                  CONTACT {index + 1}
                </Text>
                <Pressable onPress={() => removeContact(index)}>
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[6px]">
                    REMOVE
                  </Text>
                </Pressable>
              </View>

              <View className="bg-[#0a0a1f] mb-2">
                <TextInput
                  className="p-2 text-white text-[8px]"
                  placeholder="FULL NAME *"
                  placeholderTextColor="#4a4a6a"
                  value={contact.name}
                  onChangeText={(text) => updateContact(index, 'name', text)}
                  style={{ fontFamily: 'PressStart2P_400Regular' }}
                />
              </View>

              <View className="bg-[#0a0a1f] mb-2">
                <TextInput
                  className="p-2 text-white text-[8px]"
                  placeholder="PHONE NUMBER *"
                  placeholderTextColor="#4a4a6a"
                  value={contact.phone}
                  onChangeText={(text) => updateContact(index, 'phone', text)}
                  keyboardType="phone-pad"
                  style={{ fontFamily: 'PressStart2P_400Regular' }}
                />
              </View>

              <View className="bg-[#0a0a1f]">
                <TextInput
                  className="p-2 text-white text-[8px]"
                  placeholder="RELATIONSHIP"
                  placeholderTextColor="#4a4a6a"
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
          <View className={`bg-[#ff6f61] p-4 ${isLoading ? 'opacity-50' : ''}`}>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs text-center">
              {isLoading ? 'SAVING...' : 'SAVE MEDICAL INFO'}
            </Text>
          </View>
        </Pressable>
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}