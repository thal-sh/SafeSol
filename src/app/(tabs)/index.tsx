import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { View, ScrollView, Pressable, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { WalletButton } from '../../components/WalletButton'
import { Header } from '../../components/Header'
import { PixelIcon } from '../../components/PixelIcon'
import { CategoryCard } from '../../components/CategoryCard'
import { QuickAction } from '../../components/QuickAction'
import { ActivityItem } from '../../components/ActivityItem'
import { PS2PText } from '../../components/PS2PText'
import { useAccountStatus } from '../../hooks/useAccountStatus'
import { useMobileWallet } from '@wallet-ui/react-native-kit'

export default function Home() {
  const {
    account,
    medicalData,
    savedMedical,
    kycVerified,
    attestationsCount,
    reload,
  } = useAccountStatus()
  const walletAny = useMobileWallet() as any
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await reload()
    setRefreshing(false)
  }

  const handleDisconnect = async () => {
    try {
      if (walletAny.disconnect) {
        await walletAny.disconnect()
      }
    } catch (e) {
      console.log('disconnect error', e)
    }
  }

  // Calculate percentages based on status hook
  const medicalPercent = savedMedical ? 100 : 0
  const kycPercent = kycVerified ? 100 : medicalData ? 50 : 0
  const financialPercent = attestationsCount > 0 ? Math.min(attestationsCount * 20, 100) : 0
  const propertyPercent = 90 // mock data
  const profilePercent = Math.round((medicalPercent + kycPercent + financialPercent + propertyPercent) / 4)

  if (!account) {
    return (
      <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1 items-center justify-center px-8">
        <PS2PText className="text-4xl text-white mb-3">SAFESOL</PS2PText>
        <PS2PText className="text-sm text-[#a0a0b0] mb-8 text-center">
          YOUR PRIVATE LIFE VAULT
        </PS2PText>
        <WalletButton />
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1">
      <Header address={account.address.toString()} onDisconnect={handleDisconnect} />

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />}
      >
        {/* Header */}
        <View className="mb-4">
          <PS2PText className="text-white text-sm">
            YOUR LIFE AT A GLANCE
          </PS2PText>
          <PS2PText className="text-[#00ff9d] text-xs mt-1">
            PROFILE COMPLETE: {profilePercent}%
          </PS2PText>
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
        <PS2PText className="text-white text-xs mt-6 mb-3">
          QUICK ACTIONS
        </PS2PText>

        <View className="flex-row justify-between mb-6">
          <QuickAction 
            icon={<PixelIcon name="health" color="#ff6f61" size={20} />} 
            label="EMERGENCY" 
            onPress={() => router.push('/qr')} 
          />
          <QuickAction 
            icon={<PS2PText className="text-xl">📋</PS2PText>} 
            label="REQUEST" 
            onPress={() => router.push('/proof-request')} 
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
        <PS2PText className="text-white text-xs mb-3">
          RECENT ACTIVITY
        </PS2PText>

        <View className="mb-8">
          <ActivityItem text="INCOME VERIFIED BY ACME CORP" time="2 HOURS AGO" />
          <ActivityItem text="RENT VERIFIED BY BOB PROPERTIES" time="YESTERDAY" />
          <ActivityItem text="KYC VERIFICATION COMPLETED" time="2 DAYS AGO" />
        </View>

        {/* Emergency Button */}
        <Pressable onPress={() => router.push('/qr')} className="bg-[#ff6f61] p-4 mb-8">
          <PS2PText className="text-white text-xs text-center">
            🚑 EMERGENCY QR
          </PS2PText>
        </Pressable>
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}