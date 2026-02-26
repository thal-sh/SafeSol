import { useState, useEffect } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { PixelIcon } from '../../components/PixelIcon'
import { PS2PText } from '../../components/PS2PText'
import { ProofCard, IncomeProof } from '../../components/ProofCard'
import { ContractItem } from '../../components/ContractItem'

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
          <PS2PText className="text-white text-lg">
            FINANCE
          </PS2PText>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Income Proofs Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <PS2PText className="text-white text-xs">
              INCOME PROOFS
            </PS2PText>
            <Pressable onPress={() => router.push('/attestations/receive')}>
              <PS2PText className="text-[#00ff9d] text-[8px]">
                + ADD
              </PS2PText>
            </Pressable>
          </View>

          {incomeProofs.length === 0 ? (
            <View className="bg-[#1a1a2f] p-6 items-center">
              <PS2PText className="text-[#a0a0b0] text-[8px]">
                NO INCOME PROOFS
              </PS2PText>
              <PS2PText className="text-[#4a4a6a] text-[6px] mt-2">
                ASK YOUR EMPLOYER TO ISSUE ONE
              </PS2PText>
            </View>
          ) : (
            incomeProofs.map((proof) => (
              <ProofCard key={proof.id} proof={proof} />
            ))
          )}
        </View>

        {/* Contracts Section */}
        <View className="mb-6">
          <PS2PText className="text-white text-xs mb-3">
            CONTRACTS
          </PS2PText>

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
          <PS2PText className="text-white text-xs mb-3">
            REQUEST PROOFS
          </PS2PText>

          <Pressable 
            onPress={() => router.push('/attestations/scan')}
            className="bg-[#1a1a2f] p-4 items-center"
          >
            <PS2PText className="text-[#00ff9d] text-xs mb-2">
              SCAN EMPLOYER QR
            </PS2PText>
            <PS2PText className="text-[#a0a0b0] text-[6px] text-center">
              HAVE YOUR EMPLOYER GENERATE A PROOF QR
            </PS2PText>
          </Pressable>
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}