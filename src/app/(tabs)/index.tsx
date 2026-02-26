import { StatusBar } from 'expo-status-bar'
import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable, RefreshControl } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { WalletButton } from '../../components/WalletButton'
import { Header } from '../../components/Header'
import { PixelIcon } from '../../components/PixelIcon'
import { storage } from '../../utils/storage'
import Toast from 'react-native-toast-message'
import { MedicalInfo } from '../../types'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Progress Bar Component
const ProgressBar = ({ percent, color }: { percent: number; color: string }) => (
  <View className="h-2 bg-[#2a2a3f] w-full mt-2">
    <View 
      className="h-full" 
      style={{ 
        width: `${percent}%`, 
        backgroundColor: color,
      }} 
    />
  </View>
)

// Category Card with Progress
const CategoryCard = ({ 
  title, 
  percent, 
  subtitle, 
  color,
  onPress 
}: { 
  title: string
  percent: number
  subtitle: string
  color: string
  onPress: () => void
}) => (
  <Pressable onPress={onPress} className="mb-3">
    <View className="bg-[#1a1a2f] p-4">
      <View className="flex-row justify-between items-center">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs">
          {title}
        </Text>
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[8px]">
          {percent}%
        </Text>
      </View>
      <ProgressBar percent={percent} color={color} />
      <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[8px] mt-2">
        {subtitle}
      </Text>
    </View>
  </Pressable>
)

// Quick Action with Pixel Icon
const QuickAction = ({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) => (
  <Pressable onPress={onPress} className="items-center flex-1">
    <View className="w-12 h-12 bg-[#1a1a2f] items-center justify-center mb-1">
      <Text>{icon}</Text>
    </View>
    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px]">
      {label}
    </Text>
  </Pressable>
)

// Simple Activity Item
const ActivityItem = ({ text, time }: { text: string; time: string }) => (
  <View className="flex-row items-center mb-3 border-b border-[#2a2a3f] pb-2">
    <View className="w-2 h-2 bg-[#00ff9d] mr-3" />
    <View className="flex-1">
      <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-[8px]">
        {text}
      </Text>
      <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px] mt-1">
        {time}
      </Text>
    </View>
  </View>
)

export default function Home() {
  const { account } = useMobileWallet()
  const [savedMedical, setSavedMedical] = useState(false)
  const [kycVerified, setKycVerified] = useState(false)
  const [medicalData, setMedicalData] = useState<MedicalInfo | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [attestationsCount, setAttestationsCount] = useState(0)

  useEffect(() => {
    if (account) loadStatus()
  }, [account])

  const loadStatus = async () => {
    if (!account) return

    const medical = await storage.getMedical(account.address.toString())
    setSavedMedical(!!medical)
    setMedicalData(medical)
    setKycVerified(await storage.getKYC(account.address.toString()))
    
    try {
      const rentals = await AsyncStorage.getItem(`rentals_${account.address}`)
      const income = await AsyncStorage.getItem(`income_${account.address}`)
      const count = (rentals ? JSON.parse(rentals).length : 0) + (income ? JSON.parse(income).length : 0)
      setAttestationsCount(count)
    } catch (error) {
      console.log('Error loading attestations')
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadStatus()
    setRefreshing(false)
  }

  // Calculate percentages
  const medicalPercent = savedMedical ? 100 : 0
  const kycPercent = kycVerified ? 100 : medicalData ? 50 : 0
  const financialPercent = attestationsCount > 0 ? Math.min(attestationsCount * 20, 100) : 0
  const propertyPercent = 90 // Mock data

  if (!account) {
    return (
      <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1 items-center justify-center px-8">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-4xl text-white mb-3">
          SAFESOL
        </Text>
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-sm text-[#a0a0b0] mb-8 text-center">
          YOUR PRIVATE LIFE VAULT
        </Text>
        <WalletButton />
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1">
      <Header address={account.address.toString()} />

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />}
      >
        {/* Header */}
        <View className="mb-4">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-sm">
            YOUR LIFE AT A GLANCE
          </Text>
        </View>

        {/* Progress Cards */}
        <CategoryCard
          title="HEALTH"
          percent={medicalPercent}
          subtitle={medicalData?.bloodType ? `${medicalData.bloodType} • ${medicalData.emergencyContacts?.length || 0} contacts` : 'Not set up'}
          color="#ff6f61"
          onPress={() => router.push('/health')}
        />

        <CategoryCard
          title="FINANCE"
          percent={financialPercent}
          subtitle={`${attestationsCount} verified proofs`}
          color="#00ff9d"
          onPress={() => router.push('/financial')}
        />

        <CategoryCard
          title="PROPERTY"
          percent={propertyPercent}
          subtitle="12 months rent history"
          color="#8a2be2"
          onPress={() => router.push('/property')}
        />

        <CategoryCard
          title="IDENTITY"
          percent={kycPercent}
          subtitle={kycVerified ? 'KYC verified' : 'Verification pending'}
          color="#ffb86b"
          onPress={() => router.push('/identity')}
        />

        {/* Quick Actions with Pixel Icons */}
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs mt-6 mb-3">
          QUICK ACTIONS
        </Text>

        <View className="flex-row justify-between mb-6">
          <QuickAction 
            icon={<PixelIcon name="qr" color="#ff6f61" size={20} />} 
            label="EMERGENCY" 
            onPress={() => router.push('/qr')} 
          />
          <QuickAction 
            icon={<PixelIcon name="qr" color="#00ff9d" size={20} />} 
            label="SCAN" 
            onPress={() => router.push('/attestations/scan')} 
          />
          <QuickAction 
            icon={<PixelIcon name="document" color="#8a2be2" size={20} />} 
            label="PROOF" 
            onPress={() => router.push('/attestations/receive')} 
          />
          <QuickAction 
            icon={<PixelIcon name="shield" color="#ffb86b" size={20} />} 
            label="VERIFY" 
            onPress={() => router.push('/attestations/verify')} 
          />
        </View>

        {/* Recent Activity */}
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs mb-3">
          RECENT ACTIVITY
        </Text>

        <View className="mb-8">
          <ActivityItem text="INCOME VERIFIED BY ACME CORP" time="2 HOURS AGO" />
          <ActivityItem text="RENT VERIFIED BY BOB PROPERTIES" time="YESTERDAY" />
          <ActivityItem text="KYC VERIFICATION COMPLETED" time="2 DAYS AGO" />
        </View>

        {/* Emergency Button */}
        <Pressable onPress={() => router.push('/qr')} className="bg-[#ff6f61] p-4 mb-8">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs text-center">
            🚑 EMERGENCY QR
          </Text>
        </Pressable>
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}