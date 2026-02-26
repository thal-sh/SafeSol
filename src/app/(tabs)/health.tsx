import { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { storage } from '../../utils/storage'
import { MedicalInfo } from '../../types'
import { PixelIcon } from '../../components/PixelIcon'

// Quick Action Component
const QuickAction = ({ icon, title, subtitle, onPress }: { icon: React.ReactNode; title: string; subtitle: string; onPress: () => void }) => (
  <Pressable onPress={onPress} className="mb-2">
    <View className="bg-[#1a1a2f] p-4 flex-row items-center">
      <View className="mr-3 w-8 h-8 items-center justify-center">
        <Text>{icon}</Text>
      </View>
      <View className="flex-1">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs">
          {title}
        </Text>
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px] mt-1">
          {subtitle}
        </Text>
      </View>
    </View>
  </Pressable>
)

// Info Row Component
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row mb-1">
    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[8px] w-24">
      {label}:
    </Text>
    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-[8px] flex-1">
      {value}
    </Text>
  </View>
)

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
    <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1">
      {/* Header */}
      <View className="pt-12 px-4 pb-4 border-b border-[#2a2a3f]">
        <View className="flex-row items-center">
          <View className="mr-2">
            <PixelIcon name="health" color="#ff6f61" size={24} />
          </View>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-lg">
            HEALTH
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Medical Info Card */}
        <Pressable 
          onPress={() => router.push('/medical')}
          className="bg-[#1a1a2f] p-4 mb-6"
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs">
              MEDICAL INFO
            </Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
              EDIT →
            </Text>
          </View>
          
          {medicalData ? (
            <View>
              <InfoRow label="BLOOD" value={medicalData.bloodType || 'NOT SET'} />
              <InfoRow label="ALLERGIES" value={medicalData.allergies || 'NONE'} />
              <InfoRow label="CONDITIONS" value={`${medicalData.conditions?.length || 0}`} />
              <InfoRow label="CONTACTS" value={`${medicalData.emergencyContacts?.length || 0}`} />
              {medicalData.lastUpdated && (
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a4a6a] text-[6px] mt-2">
                  UPDATED: {new Date(medicalData.lastUpdated).toLocaleDateString().toUpperCase()}
                </Text>
              )}
            </View>
          ) : (
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[8px]">
              No medical info yet. Tap to add.
            </Text>
          )}
        </Pressable>

        {/* Quick Actions */}
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs mb-3">
          QUICK ACTIONS
        </Text>

        <QuickAction
          icon={<Text className="text-2xl">💊</Text>}
          title="MEDICATIONS"
          subtitle="Add prescriptions & reminders"
          onPress={() => {}}
        />

        <QuickAction
          icon={<Text className="text-2xl">💉</Text>}
          title="VACCINATIONS"
          subtitle="Store COVID, flu, etc."
          onPress={() => {}}
        />

        <QuickAction
          icon={<Text className="text-2xl">🏥</Text>}
          title="DOCTOR VISITS"
          subtitle="Appointment history"
          onPress={() => {}}
        />

        <QuickAction
          icon={<Text className="text-2xl">🩺</Text>}
          title="INSURANCE"
          subtitle="Cards & policies"
          onPress={() => {}}
        />

        {/* Coming Soon Note */}
        <View className="mt-4 mb-8">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a4a6a] text-[6px] text-center">
            MORE HEALTH FEATURES COMING SOON
          </Text>
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}