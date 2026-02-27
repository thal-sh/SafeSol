import { useState, useEffect } from 'react'
import { View, ScrollView, Pressable, Share } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router, useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { PixelIcon } from '../../components/PixelIcon'
import { PS2PText } from '../../components/PS2PText'
import { ProofCard, IncomeProof } from '../../components/ProofCard'
import { ContractItem } from '../../components/ContractItem'
import { useCallback } from 'react'

type ProofRequest = {
  id: string
  type: 'employment' | 'rental' | 'income' | 'education' | 'other'
  issuerWallet: string
  issuerName: string
  predicate: string
  details: string
  createdAt: number
  status: 'pending' | 'sent' | 'approved' | 'rejected'
}

export default function FinancialTab() {
  const { account } = useMobileWallet()
  const [incomeProofs, setIncomeProofs] = useState<IncomeProof[]>([])
  const [pendingRequests, setPendingRequests] = useState<ProofRequest[]>([])

  const loadData = useCallback(async () => {
    if (!account) return
    const proofs = await AsyncStorage.getItem(`income_${account.address}`)
    if (proofs) setIncomeProofs(JSON.parse(proofs))

    const requests = await AsyncStorage.getItem(`proof_requests_${account.address.toString()}`)
    if (requests) {
      const allRequests: ProofRequest[] = JSON.parse(requests)
      setPendingRequests(allRequests.filter(r => r.status === 'pending'))
    }
  }, [account])

  useEffect(() => {
    loadData()
  }, [account, loadData])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData])
  )

  const exportProofs = async () => {
    if (!account) return
    try {
      const income = await AsyncStorage.getItem(`income_${account.address}`)
      const property = await AsyncStorage.getItem(`property_atts_${account.address}`)
      const exports = {
        income: income ? JSON.parse(income) : [],
        property: property ? JSON.parse(property) : []
      }
      const text = JSON.stringify(exports, null, 2)
      await Share.share({ message: text, title: 'My Proofs' })
    } catch (err) {
      console.log('export error', err)
      Toast.show({ type: 'error', text1: 'EXPORT FAILED' })
    }
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
        {/* Pending Requests Alert */}
        {pendingRequests.length > 0 && (
          <View className="bg-[#ffb86b] p-3 mb-4 border-l-4 border-[#ff6f61]">
            <PS2PText className="text-[#0a0a1f] text-xs font-bold">
              {pendingRequests.length} PENDING REQUEST{pendingRequests.length !== 1 ? 'S' : ''}
            </PS2PText>
            <PS2PText className="text-[#0a0a1f] text-[7px] mt-1">
              WAITING FOR ISSUER RESPONSE
            </PS2PText>
          </View>
        )}

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

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <View className="mb-6">
            <PS2PText className="text-white text-xs mb-3">
              PENDING REQUESTS ({pendingRequests.length})
            </PS2PText>
            {pendingRequests.map((request) => (
              <View key={request.id} className="bg-[#1a1a2f] p-3 mb-2 border border-[#2a2a3f]">
                <View className="flex-row justify-between mb-1">
                  <PS2PText className="text-white text-[8px] font-bold">
                    {request.issuerName.toUpperCase()}
                  </PS2PText>
                  <PS2PText className="text-[#ffb86b] text-[7px]">
                    ⏳ PENDING
                  </PS2PText>
                </View>
                <PS2PText className="text-[#a0a0b0] text-[7px]">
                  {request.predicate.toUpperCase()}
                </PS2PText>
                {request.details && (
                  <PS2PText className="text-[#4a4a6a] text-[6px] mt-1">
                    {request.details}
                  </PS2PText>
                )}
                <PS2PText className="text-[#4a4a6a] text-[6px] mt-2">
                  SENT: {new Date(request.createdAt).toLocaleDateString().toUpperCase()}
                </PS2PText>
              </View>
            ))}
          </View>
        )}

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
            onPress={() => router.push('/proof-request')}
            className="bg-[#00ff9d] p-4 mb-3"
          >
            <PS2PText className="text-[#0a0a1f] text-xs font-bold text-center">
              REQUEST NEW PROOF
            </PS2PText>
          </Pressable>

          <Pressable             onPress={() => router.push('/attestation-issue')}
            className="bg-[#ffb86b] p-4 mb-3"
          >
            <PS2PText className="text-[#0a0a1f] text-xs text-center font-bold">
              ISSUE ATTESTATIONS
            </PS2PText>
          </Pressable>

          <Pressable             onPress={() => router.push('/attestations/scan')}
            className="bg-[#1a1a2f] p-4 items-center border border-[#2a2a3f]"
          >
            <PS2PText className="text-[#00ff9d] text-xs mb-2">
              SCAN EMPLOYER QR
            </PS2PText>
            <PS2PText className="text-[#a0a0b0] text-[6px] text-center">
              OR HAVE YOUR EMPLOYER GENERATE A PROOF QR
            </PS2PText>
          </Pressable>

          <Pressable
            onPress={exportProofs}
            className="bg-[#00ff9d] p-4 mt-4"
          >
            <PS2PText className="text-[#0a0a1f] text-xs text-center font-bold">
              EXPORT ALL PROOFS
            </PS2PText>
          </Pressable>
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}