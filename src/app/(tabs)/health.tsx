import { useEffect } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { PixelIcon } from '../../components/PixelIcon'
import { QuickAction } from '../../components/QuickAction'
import { InfoRow } from '../../components/InfoRow'
import { PS2PText } from '../../components/PS2PText'
import { useMedical } from '../../hooks/useMedical'

export default function HealthTab() {
  const { account } = useMobileWallet()
  const { medical: medicalData, reload: reloadMedical } = useMedical()

  // Show toast or alert for coming soon features
  const showComingSoon = () => {
    // You can add a toast here if you want
    console.log('Coming soon feature')
  }

  return (
    <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1">
      {/* Header */}
      <View className="pt-12 px-4 pb-4 border-b border-[#2a2a3f]">
        <View className="flex-row items-center">
          <View className="mr-2">
            <PixelIcon name="health" color="#ff6f61" size={24} />
          </View>
          <PS2PText className="text-white text-lg">
            HEALTH
          </PS2PText>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Medical Info Card */}
        <Pressable 
          onPress={() => router.push('/medical')}
          className="bg-[#1a1a2f] p-4 mb-6"
        >
          <View className="flex-row justify-between items-center mb-3">
            <PS2PText className="text-white text-xs">
              MEDICAL INFO
            </PS2PText>
            <PS2PText className="text-[#ff6f61] text-[8px]">
              EDIT →
            </PS2PText>
          </View>
          
          {medicalData ? (
            <View>
              <InfoRow label="BLOOD" value={medicalData.bloodType || 'NOT SET'} />
              <InfoRow label="ALLERGIES" value={medicalData.allergies || 'NONE'} />
              <InfoRow label="CONDITIONS" value={`${medicalData.conditions?.length || 0}`} />
              <InfoRow label="CONTACTS" value={`${medicalData.emergencyContacts?.length || 0}`} />
              {medicalData.lastUpdated && (
                <PS2PText className="text-[#4a4a6a] text-[6px] mt-2">
                  UPDATED: {new Date(medicalData.lastUpdated).toLocaleDateString().toUpperCase()}
                </PS2PText>
              )}
            </View>
          ) : (
            <PS2PText className="text-[#a0a0b0] text-[8px]">
              No medical info yet. Tap to add.
            </PS2PText>
          )}
        </Pressable>

        {/* Quick Actions */}
        <PS2PText className="text-white text-xs mb-3">
          QUICK ACTIONS
        </PS2PText>

        <QuickAction
          icon={<PS2PText className="text-2xl">💊</PS2PText>}
          title="MEDICATIONS"
          subtitle="Add prescriptions & reminders"
          onPress={() => router.push('/medications')} // Will navigate when screen exists
          layout="horizontal"
        />

        <QuickAction
          icon={<PS2PText className="text-2xl">💉</PS2PText>}
          title="VACCINATIONS"
          subtitle="Store COVID, flu, etc."
          onPress={() => router.push('/vaccinations')} // Will navigate when screen exists
          layout="horizontal"
        />

        <QuickAction
          icon={<PS2PText className="text-2xl">🏥</PS2PText>}
          title="DOCTOR VISITS"
          subtitle="Appointment history"
          onPress={() => router.push('/doctor-visits')} // Will navigate when screen exists
          layout="horizontal"
        />

        <QuickAction
          icon={<PS2PText className="text-2xl">🩺</PS2PText>}
          title="INSURANCE"
          subtitle="Cards & policies"
          onPress={() => router.push('/insurance')} // Will navigate when screen exists
          layout="horizontal"
        />

        {/* Coming Soon Note */}
        <View className="mt-4 mb-8">
          <PS2PText className="text-[#4a4a6a] text-[6px] text-center">
            MORE HEALTH FEATURES COMING SOON
          </PS2PText>
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}