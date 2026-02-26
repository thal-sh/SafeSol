import { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { PixelIcon } from '../../components/PixelIcon'

type IncomeProof = {
  id: string
  employer: string
  amount: number
  startDate: string
  status: 'active' | 'past'
}

// Proof Card Component
const ProofCard = ({ proof }: { proof: IncomeProof }) => (
  <View className="bg-[#1a1a2f] p-3 mb-2">
    <View className="flex-row justify-between items-center">
      <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-[8px] flex-1">
        {proof.employer}
      </Text>
      <View className="bg-[#00ff9d] px-2 py-1">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#0a0a1f] text-[4px]">
          VERIFIED
        </Text>
      </View>
    </View>
    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px] mt-1">
      SINCE: {proof.startDate}
    </Text>
  </View>
)

// Contract Item Component
const ContractItem = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <Pressable className="bg-[#1a1a2f] p-3 mb-2 flex-row items-center">
    <View className="mr-3">
      <PixelIcon name="document" color="#8a2be2" size={16} />
    </View>
    <View className="flex-1">
      <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-[8px]">
        {title}
      </Text>
      <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px] mt-1">
        {subtitle}
      </Text>
    </View>
  </Pressable>
)

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
    <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1">
      {/* Header */}
      <View className="pt-12 px-4 pb-4 border-b border-[#2a2a3f]">
        <View className="flex-row items-center">
          <View className="mr-2">
            <PixelIcon name="finance" color="#00ff9d" size={24} />
          </View>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-lg">
            FINANCE
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Income Proofs Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs">
              INCOME PROOFS
            </Text>
            <Pressable onPress={() => router.push('/attestations/receive')}>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[8px]">
                + ADD
              </Text>
            </Pressable>
          </View>

          {incomeProofs.length === 0 ? (
            <View className="bg-[#1a1a2f] p-6 items-center">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[8px]">
                NO INCOME PROOFS
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a4a6a] text-[6px] mt-2">
                ASK YOUR EMPLOYER TO ISSUE ONE
              </Text>
            </View>
          ) : (
            incomeProofs.map((proof) => (
              <ProofCard key={proof.id} proof={proof} />
            ))
          )}
        </View>

        {/* Contracts Section */}
        <View className="mb-6">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs mb-3">
            CONTRACTS
          </Text>

          <ContractItem
            title="EMPLOYMENT CONTRACT"
            subtitle="Acme Corp • Signed 2024"
          />

          <ContractItem
            title="LOAN AGREEMENT"
            subtitle="Bank • 5 years remaining"
          />
        </View>

        {/* Request Proofs Section */}
        <View className="mb-8">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs mb-3">
            REQUEST PROOFS
          </Text>

          <Pressable 
            onPress={() => router.push('/attestations/scan')}
            className="bg-[#1a1a2f] p-4 items-center"
          >
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-xs mb-2">
              SCAN EMPLOYER QR
            </Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px] text-center">
              HAVE YOUR EMPLOYER GENERATE A PROOF QR
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}