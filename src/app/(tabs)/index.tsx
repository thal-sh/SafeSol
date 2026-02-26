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
  <View className="h-4 border-2 border-[#6a0dad] w-full bg-[#0a0a1f] mt-1">
    <View 
      className="h-full" 
      style={{ 
        width: `${percent}%`, 
        backgroundColor: color,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8
      }} 
    />
  </View>
)

// Category Card Component
const CategoryCard = ({ 
  icon, 
  title, 
  percent, 
  color, 
  details, 
  onPress,
  verified 
}: { 
  icon: React.ReactNode
  title: string
  percent: number
  color: string
  details: string
  onPress: () => void
  verified: boolean
}) => (
  <Pressable onPress={onPress} className="mb-4 active:opacity-80">
    <LinearGradient
      colors={['#1a0f2e', '#0f0a1f']}
      className="p-4 border-2 border-[#6a0dad]"
    >
      <View className="flex-row items-center mb-2">
        <View className="mr-3">
          {icon}
        </View>
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-sm flex-1">
          {title}
        </Text>
        {verified && (
          <View className="border border-[#00ff9d] px-2 py-1">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[8px]">
              ✓ VERIFIED
            </Text>
          </View>
        )}
      </View>
      
      <ProgressBar percent={percent} color={color} />
      
      <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[10px] mt-2">
        {details}
      </Text>
    </LinearGradient>
  </Pressable>
)

// Quick Action Button Component
const QuickAction = ({ icon, label, onPress, color }: { icon: React.ReactNode; label: string; onPress: () => void; color: string }) => (
  <Pressable 
    onPress={onPress}
    className="items-center active:opacity-50 flex-1"
  >
    <View className={`w-14 h-14 border-2 border-[${color}] items-center justify-center mb-2`}
      style={{ shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8 }}
    >
      {icon}
    </View>
    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className={`text-[${color}] text-[8px]`}>
      {label}
    </Text>
  </Pressable>
)

// Activity Item Component
const ActivityItem = ({ icon, text, time, verified }: { icon: React.ReactNode; text: string; time: string; verified: boolean }) => (
  <View className="flex-row items-center mb-3 border-b border-[#4a2c5a] pb-2">
    <View className="mr-3 w-8 h-8 items-center justify-center">
     <Text> {icon} </Text>
    </View>
    <View className="flex-1">
      <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-[10px]">
        {text}
      </Text>
      <View className="flex-row items-center mt-1">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a2c5a] text-[8px] mr-2">
          {time}
        </Text>
        {verified && (
          <View className="border border-[#00ff9d] px-1">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[6px]">
              ✓ VERIFIED
            </Text>
          </View>
        )}
      </View>
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
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    if (account) {
      loadStatus()
      loadRecentActivity()
    }
  }, [account])

  const loadStatus = async () => {
    if (!account) return

    const medical = await storage.getMedical(account.address.toString())
    setSavedMedical(!!medical)
    setMedicalData(medical)

    const kyc = await storage.getKYC(account.address.toString())
    setKycVerified(kyc)
    
    // Load attestations count
    try {
      const rentals = await AsyncStorage.getItem(`rentals_${account.address}`)
      const income = await AsyncStorage.getItem(`income_${account.address}`)
      const ageProofs = await AsyncStorage.getItem(`age_proofs_${account.address}`)
      
      const count = (rentals ? JSON.parse(rentals).length : 0) +
                    (income ? JSON.parse(income).length : 0) +
                    (ageProofs ? JSON.parse(ageProofs).length : 0)
      setAttestationsCount(count)
    } catch (error) {
      console.log('Error loading attestations count')
    }
  }

  const loadRecentActivity = async () => {
    if (!account) return
    
    // Mock recent activity - in real app, load from storage
    const activities = [
      { icon: <PixelIcon name="finance" color="#00ff9d" size={16} />, text: 'INCOME VERIFIED BY ACME CORP', time: '2 HOURS AGO', verified: true },
      { icon: <PixelIcon name="property" color="#8a2be2" size={16} />, text: 'RENT VERIFIED BY BOB PROPERTIES', time: 'YESTERDAY', verified: true },
      { icon: <PixelIcon name="identity" color="#ffb86b" size={16} />, text: 'KYC VERIFICATION COMPLETED', time: '2 DAYS AGO', verified: true },
      { icon: <PixelIcon name="health" color="#ff6f61" size={16} />, text: 'MEDICAL INFO UPDATED', time: '1 WEEK AGO', verified: false },
    ]
    setRecentActivity(activities)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadStatus()
    await loadRecentActivity()
    setRefreshing(false)
  }

  const getMedicalSummary = () => {
    if (!medicalData) return 'No medical data'
    const items = []
    if (medicalData.allergies) items.push(`🌿 ${medicalData.allergies}`)
    if (medicalData.bloodType) items.push(`🩸 ${medicalData.bloodType}`)
    if (medicalData.conditions?.length) items.push(`🏥 ${medicalData.conditions.length} conditions`)
    if (medicalData.emergencyContacts?.length) items.push(`📞 ${medicalData.emergencyContacts.length} contacts`)
    return items.slice(0, 2).join(' • ') || 'Medical info saved'
  }

  // Calculate completion percentages
  const medicalPercent = savedMedical ? 100 : 0
  const kycPercent = kycVerified ? 100 : medicalData ? 50 : 0
  const financialPercent = attestationsCount > 0 ? Math.min(attestationsCount * 20, 100) : 0
  const propertyPercent = 90 // Mock data

  if (!account) {
    return (
      <LinearGradient
        colors={['#0a0a1f', '#1a0f2e', '#000000']}
        className="flex-1 items-center justify-center px-8"
      >
        <Text
          style={{ fontFamily: 'PressStart2P_400Regular' }}
          className="text-4xl text-[#ffd9b3] mb-3 text-center"
        >
          SAFESOL
        </Text>
        <Text
          style={{ fontFamily: 'PressStart2P_400Regular' }}
          className="text-lg text-[#b39eb5] mb-8 text-center leading-7"
        >
          YOUR PRIVATE LIFE VAULT{'\n'}ON SOLANA MOBILE
        </Text>

        <View className="w-full mb-8 border-2 border-[#6a0dad] p-4">
          <View className="flex-row items-center mb-4">
            <PixelIcon name="health" color="#ff6f61" size={24} />
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-xs ml-3 flex-1">
              MEDICAL • FINANCE • PROPERTY • ID
            </Text>
          </View>
        </View>

        <WalletButton />
        <StatusBar style="auto" />
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#0a0a1f', '#1a0f2e', '#000000']} className="flex-1">
      <Header address={account.address.toString()} />

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff6f61"
            colors={['#ff6f61']}
          />
        }
      >
        {/* Header with quote */}
        <View className="mb-6 border-2 border-[#8a2be2] p-3">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-sm text-center">
            YOUR LIFE AT A GLANCE
          </Text>
        </View>

        {/* Category Cards */}
        <CategoryCard
          icon={<PixelIcon name="health" color="#ff6f61" size={24} />}
          title="HEALTH"
          percent={medicalPercent}
          color="#ff6f61"
          details={getMedicalSummary()}
          onPress={() => router.push('/health')}
          verified={savedMedical}
        />

        <CategoryCard
          icon={<PixelIcon name="finance" color="#00ff9d" size={24} />}
          title="FINANCE"
          percent={financialPercent}
          color="#00ff9d"
          details={`${attestationsCount} income proofs • 1 contract`}
          onPress={() => router.push('/financial')}
          verified={attestationsCount > 0}
        />

        <CategoryCard
          icon={<PixelIcon name="property" color="#8a2be2" size={24} />}
          title="PROPERTY"
          percent={propertyPercent}
          color="#8a2be2"
          details="12 months verified • Active lease"
          onPress={() => router.push('/property')}
          verified={true}
        />

        <CategoryCard
          icon={<PixelIcon name="identity" color="#ffb86b" size={24} />}
          title="IDENTITY"
          percent={kycPercent}
          color="#ffb86b"
          details={kycVerified ? 'KYC verified • Age 21+ proof' : 'Verification pending'}
          onPress={() => router.push('/identity')}
          verified={kycVerified}
        />

        {/* Quick Actions Grid */}
        <View className="mb-6 mt-2">
          <View className="border-2 border-[#6a0dad] p-2 mb-4">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-sm text-center">
              ⚡ QUICK ACTIONS
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <QuickAction 
              icon={<PixelIcon name="qr" color="#ff6f61" size={24} />}
              label="EMERGENCY" 
              onPress={() => router.push('/qr')}
              color="#ff6f61"
            />
            <QuickAction 
              icon={<PixelIcon name="qr" color="#00ff9d" size={24} />}
              label="SCAN" 
              onPress={() => router.push('/attestations/verify')}
              color="#00ff9d"
            />
            <QuickAction 
              icon={<PixelIcon name="document" color="#8a2be2" size={24} />}
              label="PROOF" 
              onPress={() => router.push('/attestations/receive')}
              color="#8a2be2"
            />
            <QuickAction 
              icon={<PixelIcon name="shield" color="#ffb86b" size={24} />}
              label="VERIFY" 
              onPress={() => router.push('/attestations/verify')}
              color="#ffb86b"
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mb-8">
          <View className="border-2 border-[#00ff9d] p-2 mb-4">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-sm text-center">
              📋 RECENT ACTIVITY
            </Text>
          </View>
          
          {recentActivity.map((activity, index) => (
            <ActivityItem key={index} {...activity} />
          ))}
        </View>

        {/* Emergency QR Button */}
        <Pressable 
          onPress={() => router.push('/qr')}
          className="border-4 border-[#ff6f61] p-4 mb-8"
          style={{ shadowColor: '#ff6f61', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 15 }}
        >
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-base text-center">
            🚑 EMERGENCY QR
          </Text>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-xs text-center mt-2">
            FIRST RESPONDERS SCAN FROM LOCK SCREEN
          </Text>
        </Pressable>
      </ScrollView>

      <StatusBar style="auto" />
    </LinearGradient>
  )
}