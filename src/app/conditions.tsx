import { useState, useEffect } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { Header } from '../components/Header'
import { PixelIcon } from '../components/PixelIcon'
import { PS2PText } from '../components/PS2PText'
import PS2PTextInput from '../components/PS2PTextInput'

type Condition = {
  name: string
  severity: 'mild' | 'moderate' | 'severe'
  diagnosedDate?: string
}

type MedicalInfo = {
  allergies: string
  bloodType: string
  conditions: Condition[]
  emergencyContacts: Array<{ name: string; phone: string; relationship: string }>
  lastUpdated?: number
}

export default function ConditionsScreen() {
  const { account } = useMobileWallet()
  const [conditions, setConditions] = useState<Condition[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newCondition, setNewCondition] = useState<Condition>({ name: '', severity: 'mild' })

  useEffect(() => {
    if (account) {
      loadConditions()
    }
  }, [account])

  const loadConditions = async () => {
    if (!account) return
    try {
      const encrypted = await AsyncStorage.getItem(`medical_${account.address.toString()}`)
      if (encrypted) {
        const decoded = atob(encrypted)
        const data: MedicalInfo = JSON.parse(decoded)
        setConditions(data.conditions || [])
      }
    } catch (error) {
      console.log('Error loading conditions')
    }
  }

  const saveMedicalData = async (updatedConditions: Condition[]) => {
    if (!account) return
    try {
      const encrypted = await AsyncStorage.getItem(`medical_${account.address.toString()}`)
      let medicalData: MedicalInfo = {
        allergies: '',
        bloodType: '',
        conditions: updatedConditions,
        emergencyContacts: [],
        lastUpdated: Date.now()
      }
      
      if (encrypted) {
        const decoded = atob(encrypted)
        medicalData = { ...JSON.parse(decoded), conditions: updatedConditions, lastUpdated: Date.now() }
      }

      const jsonString = JSON.stringify(medicalData)
      const encrypted_new = btoa(jsonString)
      await AsyncStorage.setItem(`medical_${account.address.toString()}`, encrypted_new)
    } catch (error) {
      console.error('Error saving conditions:', error)
    }
  }

  const validateCondition = (condition: Condition): boolean => {
    if (!condition.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'CONDITION NAME REQUIRED',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    return true
  }

  const addCondition = async () => {
    if (!validateCondition(newCondition)) return
    
    setIsLoading(true)
    try {
      const updated = [...conditions, newCondition]
      await saveMedicalData(updated)
      setConditions(updated)
      setNewCondition({ name: '', severity: 'mild' })
      Toast.show({
        type: 'success',
        text1: 'SUCCESS',
        text2: 'CONDITION ADDED',
        position: 'top',
        visibilityTime: 2000,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FAILED TO ADD CONDITION',
        position: 'top',
        visibilityTime: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateCondition = async () => {
    if (editingIndex === null) return
    if (!validateCondition(newCondition)) return
    
    setIsLoading(true)
    try {
      const updated = [...conditions]
      updated[editingIndex] = newCondition
      await saveMedicalData(updated)
      setConditions(updated)
      setEditingIndex(null)
      setNewCondition({ name: '', severity: 'mild' })
      Toast.show({
        type: 'success',
        text1: 'SUCCESS',
        text2: 'CONDITION UPDATED',
        position: 'top',
        visibilityTime: 2000,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FAILED TO UPDATE CONDITION',
        position: 'top',
        visibilityTime: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCondition = async (index: number) => {
    setIsLoading(true)
    try {
      const updated = conditions.filter((_, i) => i !== index)
      await saveMedicalData(updated)
      setConditions(updated)
      Toast.show({
        type: 'success',
        text1: 'SUCCESS',
        text2: 'CONDITION REMOVED',
        position: 'top',
        visibilityTime: 2000,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FAILED TO REMOVE CONDITION',
        position: 'top',
        visibilityTime: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityColor = (severity: string): string => {
    switch(severity) {
      case 'severe':
        return '#ff6f61'
      case 'moderate':
        return '#ffb86b'
      case 'mild':
        return '#00ff9d'
      default:
        return '#a0a0b0'
    }
  }

  const getSeverityEmoji = (severity: string): string => {
    switch(severity) {
      case 'severe':
        return '🔴'
      case 'moderate':
        return '🟠'
      case 'mild':
        return '🟢'
      default:
        return '⚪'
    }
  }

  if (!account) {
    return (
      <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1 items-center justify-center">
        <PS2PText className="text-white text-xs">CONNECT WALLET</PS2PText>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1">
      <Header address={account.address.toString()} />
      
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <View className="mr-2">
              <PixelIcon name="health" color="#ff6f61" size={24} />
            </View>
            <PS2PText className="text-white text-lg">
              MEDICAL CONDITIONS
            </PS2PText>
          </View>
          <PS2PText className="text-[#a0a0b0] text-[8px]">
            TRACK YOUR HEALTH STATUS
          </PS2PText>
        </View>

        {/* Form to add/edit condition */}
        <View className="bg-[#1a1a2f] p-4 mb-6 border border-[#2a2a3f]">
          <PS2PText className="text-white text-xs mb-3">
            {editingIndex !== null ? 'EDIT CONDITION' : 'ADD NEW CONDITION'}
          </PS2PText>

          <View className="mb-3">
            <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">CONDITION NAME *</PS2PText>
            <View className="bg-[#0a0a1f]">
              <PS2PTextInput
                className="p-3 text-white text-xs"
                placeholder="DIABETES, ASTHMA, ETC"
                placeholderTextColor="#4a4a6a"
                value={newCondition.name}
                onChangeText={(text) => setNewCondition({...newCondition, name: text})}
              />
            </View>
          </View>

          <View className="mb-4">
            <PS2PText className="text-[#a0a0b0] text-[6px] mb-2">SEVERITY</PS2PText>
            <View className="flex-row justify-between gap-2">
              {(['mild', 'moderate', 'severe'] as const).map((severity) => (
                <Pressable
                  key={severity}
                  onPress={() => setNewCondition({...newCondition, severity})}
                  className={`flex-1 p-3 border ${
                    newCondition.severity === severity
                      ? `border-[${getSeverityColor(severity)}] bg-[${getSeverityColor(severity)}]`
                      : 'border-[#2a2a3f] bg-transparent'
                  }`}
                >
                  <PS2PText className={`text-center text-xs ${
                    newCondition.severity === severity ? 'text-white' : 'text-[#a0a0b0]'
                  }`}>
                    {getSeverityEmoji(severity)} {severity.toUpperCase()}
                  </PS2PText>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable 
            onPress={editingIndex !== null ? updateCondition : addCondition}
            disabled={isLoading}
            className="bg-[#00ff9d]"
          >
            <PS2PText className="text-[#0a0a1f] text-xs text-center p-3 font-bold">
              {isLoading ? 'SAVING...' : editingIndex !== null ? 'UPDATE CONDITION' : 'ADD CONDITION'}
            </PS2PText>
          </Pressable>

          {editingIndex !== null && (
            <Pressable 
              onPress={() => {
                setEditingIndex(null)
                setNewCondition({ name: '', severity: 'mild' })
              }}
              className="bg-[#2a2a3f] mt-2"
            >
              <PS2PText className="text-white text-xs text-center p-3">
                CANCEL
              </PS2PText>
            </Pressable>
          )}
        </View>

        {/* Conditions List */}
        <PS2PText className="text-white text-xs mb-3">
          YOUR CONDITIONS ({conditions.length})
        </PS2PText>

        {conditions.length === 0 ? (
          <View className="bg-[#1a1a2f] p-4 mb-8 border border-[#2a2a3f]">
            <PS2PText className="text-[#a0a0b0] text-[8px] text-center">
              NO CONDITIONS RECORDED YET
            </PS2PText>
          </View>
        ) : (
          conditions.map((condition, index) => (
            <View key={index} className="bg-[#1a1a2f] p-4 mb-3 border border-[#2a2a3f]" style={{ borderLeftColor: getSeverityColor(condition.severity), borderLeftWidth: 4 }}>
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <PS2PText className="text-white text-xs">
                    {condition.name.toUpperCase()}
                  </PS2PText>
                  <PS2PText className="text-[#a0a0b0] text-[7px] mt-1">
                    {getSeverityEmoji(condition.severity)} {condition.severity.toUpperCase()}
                  </PS2PText>
                </View>
                <Pressable onPress={() => {
                  setEditingIndex(index)
                  setNewCondition(condition)
                }}>
                  <PS2PText className="text-[#ffb86b] text-[7px]">
                    EDIT
                  </PS2PText>
                </Pressable>
              </View>

              <Pressable 
                onPress={() => deleteCondition(index)}
                className="bg-[#ff6f61] opacity-70"
              >
                <PS2PText className="text-white text-[7px] text-center p-2">
                  DELETE
                </PS2PText>
              </Pressable>
            </View>
          ))
        )}

        <View className="h-8" />
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}
