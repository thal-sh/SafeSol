import { StatusBar } from 'expo-status-bar'
import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable, RefreshControl } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { WalletButton } from '../components/WalletButton'
import { Header } from '../components/Header'
import { StatusCard } from '../components/StatusCard'
import { PixelIcon } from '../components/PixelIcon'
import { storage } from '../utils/storage'
import { colors } from '../constants/colors'
import Toast from 'react-native-toast-message'
import { MedicalInfo } from '../types'
import attestations from './attestations'

export default function Home() {
  const { account } = useMobileWallet()
  const [savedMedical, setSavedMedical] = useState(false)
  const [kycVerified, setKycVerified] = useState(false)
  const [medicalData, setMedicalData] = useState<MedicalInfo | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (account) {
      loadStatus()
    }
  }, [account])

  const loadStatus = async () => {
    if (!account) return

    const medical = await storage.getMedical(account.address.toString())
    setSavedMedical(!!medical)
    setMedicalData(medical)

    const kyc = await storage.getKYC(account.address.toString())
    setKycVerified(kyc)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadStatus()
    setRefreshing(false)
  }

  const getMedicalSummary = () => {
    if (!medicalData) return null

    const items = []
    if (medicalData.allergies) items.push(`🌿 ALLERGIES: ${medicalData.allergies}`)
    if (medicalData.bloodType) items.push(`🩸 BLOOD: ${medicalData.bloodType}`)
    if (medicalData.conditions?.length) items.push(`🏥 ${medicalData.conditions.length} CONDITIONS`)
    if (medicalData.emergencyContacts?.length) items.push(`📞 ${medicalData.emergencyContacts.length} CONTACTS`)

    return items.slice(0, 2).join('  •  ')
  }

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
          className="text-sm text-[#b39eb5] mb-8 text-center leading-6"
        >
          YOUR SECURE MEDICAL ID{'\n'}ON SOLANA MOBILE
        </Text>

        {/* Feature preview for non-connected users */}
        <View className="w-full mb-8 border-2 border-[#6a0dad] p-4">
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl mr-3">🏥</Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[10px] flex-1">
              STORE MEDICAL INFO SECURELY
            </Text>
          </View>
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl mr-3">✅</Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[10px] flex-1">
              VERIFY YOUR IDENTITY
            </Text>
          </View>
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl mr-3">🚑</Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[10px] flex-1">
              EMERGENCY QR FOR FIRST RESPONDERS
            </Text>
          </View>
        </View>

        <WalletButton />
        <StatusBar style="auto" />
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={['#0a0a1f', '#1a0f2e', '#000000']}
      className="flex-1"
    >
      <View className="flex-1">
        <Header address={account.address.toString()} />

        <ScrollView
          className="flex-1 px-4 pt-4 pb-2"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ff6f61"
              colors={['#ff6f61']}
            />
          }
        >
          {/* Welcome Section with Stats */}
          <View className="mb-4">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-base mb-1">
              WELCOME BACK
            </Text>
            <View className="flex-row items-center">
              <View className={`w-1.5 h-1.5 ${kycVerified ? 'bg-[#00ff9d]' : 'bg-[#ff6f61]'} mr-2`} />
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px]">
                {kycVerified ? 'IDENTITY VERIFIED' : 'VERIFICATION PENDING'}
              </Text>
            </View>
          </View>

          <View className="flex-row mb-6">
            <View className="flex-1 border-2 border-[#6a0dad] p-3 mr-1">
              <Text className="text-2xl mb-1">🏥</Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-xs">
                {savedMedical ? 'ACTIVE' : 'NOT SET'}
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px] mt-1">
                MEDICAL
              </Text>
            </View>

            <View className="flex-1 border-2 border-[#6a0dad] p-3 mx-1">
              <Text className="text-2xl mb-1">✅</Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-xs">
                {kycVerified ? 'VERIFIED' : 'PENDIN'}
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px] mt-1">
                KYC
              </Text>
            </View>

            <View className="flex-1 border-2 border-[#6a0dad] p-3 ml-1">
              <Text className="text-2xl mb-1">📱</Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-xs">
                {savedMedical ? 'READY' : 'LOCKED'}
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px] mt-1">
                QR
              </Text>
            </View>
          </View>

          {/* Medical Summary (if data exists) */}
          {savedMedical && medicalData && (
            <Pressable
              onPress={() => router.push('/medical')}
              className="mb-6 border-2 border-[#00ff9d] p-3"
              style={{ shadowColor: '#00ff9d', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8 }}
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-[10px]">
                  MEDICAL SUMMARY
                </Text>
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
                  EDIT →
                </Text>
              </View>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] leading-4">
                {getMedicalSummary() || 'NO MEDICAL DATA'}
              </Text>
              {medicalData.lastUpdated && (
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a2c5a] text-[6px] mt-2">
                  UPDATED: {new Date(medicalData.lastUpdated).toLocaleDateString().toUpperCase()}
                </Text>
              )}
            </Pressable>
          )}

          {/* Main Action Cards */}
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs mb-3">
            QUICK ACTIONS
          </Text>

          <StatusCard
            title="MEDICAL INFO"
            description={savedMedical
              ? medicalData?.bloodType
                ? `BLOOD: ${medicalData.bloodType}  •  ${medicalData.emergencyContacts?.length || 0} CONTACTS`
                : 'YOUR MEDICAL INFO IS STORED'
              : 'ADD ALLERGIES, BLOOD TYPE, AND EMERGENCY CONTACTS'}
            status={savedMedical ? 'saved' : 'not set'}
            isComplete={savedMedical}
            onPress={() => router.push('/medical')}
            actionText={savedMedical ? "UPDATE →" : "SET UP NOW →"}
          />

          <StatusCard
            title="KYC VERIF."
            description={kycVerified
              ? 'IDENTITY VERIFIED • NO DATA STORED'
              : 'VERIFY YOUR IDENTITY ONCE'}
            status={kycVerified ? 'verified' : 'pending'}
            isComplete={kycVerified}
            onPress={() => router.push('/kyc')}
            actionText={kycVerified ? "VIEW STATUS →" : "VERIFY NOW →"}
          />

          <StatusCard
            title="EMERGENCY QR"
            description={savedMedical
              ? 'GENERATE QR FOR FIRST RESPONDERS'
              : 'COMPLETE MEDICAL INFO FIRST'}
            status={savedMedical ? 'ready' : 'locked'}
            isComplete={savedMedical}
            onPress={() => {
              if (savedMedical) {
                router.push('/qr')
              } else {
                Toast.show({
                  type: 'info',
                  text1: 'MEDICAL INFO REQUIRED',
                  text2: 'PLEASE ADD YOUR MEDICAL INFORMATION FIRST',
                  position: 'top',
                  visibilityTime: 3000,
                })
              }
            }}
            actionText={savedMedical ? "GENERATE →" : "COMPLETE MEDICAL FIRST"}
          />

          <StatusCard
            title="VERIFIED PROOFS"
            description={attestations.length > 0
              ? `${attestations.length} VERIFIED ATTRIBUTES`
              : 'GET VERIFIED BY EMPLOYERS & LANDLORDS'}
            status={attestations.length > 0 ? 'verified' : 'pending'}
            isComplete={attestations.length > 0}
            onPress={() => router.push('/attestations')}
            actionText={attestations.length > 0 ? "VIEW PROOFS →" : "GET VERIFIED →"}
          />

          {/* Quick Tips Section - Pixel Style */}
          <View className="border-2 border-[#8a2be2] p-3 mt-4 mb-8">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[10px] mb-2">
              💡 QUICK TIPS
            </Text>
            <View>
              {!savedMedical && (
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mb-2">
                  • ADD MEDICAL INFO TO ENABLE QR
                </Text>
              )}
              {savedMedical && !kycVerified && (
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mb-2">
                  • VERIFY IDENTITY TO BUILD TRUST
                </Text>
              )}
              {savedMedical && kycVerified && (
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mb-2">
                  • QR READY FOR LOCK SCREEN
                </Text>
              )}
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px]">
                • ALL DATA ENCRYPTED ON DEVICE
              </Text>
            </View>
          </View>

          {/* Extra space for bottom nav */}
          <View className="h-20" />
        </ScrollView>

        {/* Bottom Navigation Bar */}
        <View className="bg-[#0a0a1f] border-t-2 border-[#6a0dad] flex-row justify-around py-3">
          <Pressable
            onPress={() => router.push('/medical')}
            className="items-center active:opacity-50"
          >
            <PixelIcon name="heart" color="#ff6f61" size={20} />
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mt-1">
              MEDICAL
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/kyc')}
            className="items-center active:opacity-50"
          >
            <PixelIcon name="shield" color="#8a2be2" size={20} />
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mt-1">
              KYC
            </Text>
          </Pressable>

          <Pressable
            onPress={() => savedMedical ? router.push('/qr') : null}
            className="items-center active:opacity-50"
          >
            <PixelIcon name="qr" color={savedMedical ? '#00ff9d' : '#4a2c5a'} size={20} />
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mt-1">
              QR
            </Text>
          </Pressable>

          <Pressable className="items-center active:opacity-50">
            <View className="w-5 h-5 border border-[#ff6f61] items-center justify-center">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
                ?
              </Text>
            </View>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mt-1">
              HELP
            </Text>
          </Pressable>
        </View>
      </View>

      <StatusBar style="auto" />
    </LinearGradient>
  )
}