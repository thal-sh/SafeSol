import { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { storage } from '../../utils/storage'
import { MedicalInfo } from '../../types'
import { StatusCard } from '../../components/StatusCard'

export default function HealthTab() {
  const { account } = useMobileWallet()
  const [medicalData, setMedicalData] = useState<MedicalInfo | null>(null)

  useEffect(() => {
    if (account) {
      loadData()
    }
  }, [account])

  const loadData = async () => {
    const data = await storage.getMedical(account!.address.toString())
    setMedicalData(data)
  }

  return (
    <LinearGradient colors={['#0a0a1f', '#1a0f2e', '#000000']} className="flex-1">
      <View className="pt-12 px-4 pb-4 border-b-2 border-[#6a0dad]">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-lg">
          🏥 HEALTH
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <Pressable 
          onPress={() => router.push('/medical')}
          className="border-2 border-[#6a0dad] p-4 mb-4"
        >
          <View className="flex-row justify-between">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs">
              MEDICAL INFO
            </Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
              EDIT →
            </Text>
          </View>
          {medicalData && (
            <View className="mt-2">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px]">
                BLOOD: {medicalData.bloodType || 'Not set'}
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mt-1">
                ALLERGIES: {medicalData.allergies || 'None'}
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mt-1">
                CONTACTS: {medicalData.emergencyContacts?.length || 0}
              </Text>
            </View>
          )}
        </Pressable>

        {/* Quick Actions */}
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs mb-3">
          QUICK ACTIONS
        </Text>

        <Pressable className="border-2 border-[#8a2be2] p-4 mb-3 flex-row items-center">
          <Text className="text-2xl mr-3">💊</Text>
          <View>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-[10px]">
              MEDICATIONS
            </Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px] mt-1">
              Add prescriptions & reminders
            </Text>
          </View>
        </Pressable>

        <Pressable className="border-2 border-[#8a2be2] p-4 mb-3 flex-row items-center">
          <Text className="text-2xl mr-3">💉</Text>
          <View>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-[10px]">
              VACCINATIONS
            </Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px] mt-1">
              Store COVID, flu, etc.
            </Text>
          </View>
        </Pressable>

        <Pressable className="border-2 border-[#8a2be2] p-4 mb-3 flex-row items-center">
          <Text className="text-2xl mr-3">🏥</Text>
          <View>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-[10px]">
              DOCTOR VISITS
            </Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px] mt-1">
              Appointment history
            </Text>
          </View>
        </Pressable>

        <Pressable className="border-2 border-[#8a2be2] p-4 mb-8 flex-row items-center">
          <Text className="text-2xl mr-3">🩺</Text>
          <View>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-[10px]">
              INSURANCE
            </Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px] mt-1">
              Cards & policies
            </Text>
          </View>
        </Pressable>
      </ScrollView>

      <StatusBar style="auto" />
    </LinearGradient>
  )
}