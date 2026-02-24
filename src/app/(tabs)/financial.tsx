import { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

type IncomeProof = {
  id: string
  employer: string
  amount: number
  startDate: string
  status: 'active' | 'past'
}

export default function FinancialTab() {
  const { account } = useMobileWallet()
  const [incomeProofs, setIncomeProofs] = useState<IncomeProof[]>([])

  useEffect(() => {
    if (account) {
      loadProofs()
    }
  }, [account])

  const loadProofs = async () => {
    const proofs = await AsyncStorage.getItem(`income_${account!.address}`)
    if (proofs) setIncomeProofs(JSON.parse(proofs))
  }

  return (
    <LinearGradient colors={['#0a0a1f', '#1a0f2e', '#000000']} className="flex-1">
      <View className="pt-12 px-4 pb-4 border-b-2 border-[#6a0dad]">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-lg">
          💼 FINANCIAL
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Income Proofs */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs">
              INCOME PROOFS
            </Text>
            <Pressable onPress={() => router.push('/attestations/receive')}>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[8px]">
                + ADD
              </Text>
            </Pressable>
          </View>

          {incomeProofs.length === 0 ? (
            <View className="border-2 border-[#6a0dad] p-4 items-center">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px]">
                NO INCOME PROOFS
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a2c5a] text-[6px] mt-2">
                ASK YOUR EMPLOYER TO ISSUE ONE
              </Text>
            </View>
          ) : (
            incomeProofs.map((proof) => (
              <View key={proof.id} className="border-2 border-[#00ff9d] p-3 mb-2">
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-[8px]">
                  {proof.employer}
                </Text>
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px] mt-1">
                  SINCE: {proof.startDate}
                </Text>
                <View className="absolute top-2 right-2">
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[6px]">
                    ✓ VERIFIED
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Contracts */}
        <View className="mb-4">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs mb-2">
            CONTRACTS
          </Text>

          <Pressable className="border-2 border-[#8a2be2] p-3 mb-2 flex-row items-center">
            <Text className="text-xl mr-3">📄</Text>
            <View className="flex-1">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-[8px]">
                EMPLOYMENT CONTRACT
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px]">
                Acme Corp • Signed 2024
              </Text>
            </View>
          </Pressable>

          <Pressable className="border-2 border-[#8a2be2] p-3 mb-2 flex-row items-center">
            <Text className="text-xl mr-3">📄</Text>
            <View className="flex-1">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-[8px]">
                LOAN AGREEMENT
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px]">
                Bank • 5 years remaining
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs mb-3">
          REQUEST PROOFS
        </Text>

        <Pressable className="border-2 border-[#ff6f61] p-4 mb-8">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-xs text-center">
            SCAN EMPLOYER QR
          </Text>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px] text-center mt-2">
            HAVE YOUR EMPLOYER GENERATE A PROOF QR
          </Text>
        </Pressable>
      </ScrollView>

      <StatusBar style="auto" />
    </LinearGradient>
  )
}