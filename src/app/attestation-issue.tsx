import { useState, useEffect } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router, useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { Header } from '../components/Header'
import { PixelIcon } from '../components/PixelIcon'
import { PS2PText } from '../components/PS2PText'
import { useCallback } from 'react'

type ReceivedAttestation = {
  id: string
  type: 'employment' | 'rental' | 'income' | 'education' | 'other'
  requesterWallet: string
  requesterName: string
  predicate: string
  details: string
  createdAt: number
  status: 'pending' | 'approved' | 'rejected'
  approvedAt?: number
  rejectionReason?: string
}

export default function AttestationIssueScreen() {
  const { account } = useMobileWallet()
  const [receivedRequests, setReceivedRequests] = useState<ReceivedAttestation[]>([])
  const [issuedAttestations, setIssuedAttestations] = useState<ReceivedAttestation[]>([])
  const [activeTab, setActiveTab] = useState<'pending' | 'issued'>('pending')
  const [isLoading, setIsLoading] = useState(false)

  const loadData = useCallback(async () => {
    if (!account) return
    try {
      // Load received requests (requests FROM others TO me)
      const received = await AsyncStorage.getItem(`attestation_requests_${account.address.toString()}`)
      if (received) {
        const reqs: ReceivedAttestation[] = JSON.parse(received)
        setReceivedRequests(reqs.filter(r => r.status === 'pending').sort((a, b) => b.createdAt - a.createdAt))
        setIssuedAttestations(reqs.filter(r => r.status === 'approved').sort((a, b) => b.approvedAt! - a.approvedAt!))
      }
    } catch (error) {
      console.log('Error loading attestation data')
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

  const approveAttestation = async (request: ReceivedAttestation, daysValid: number = 365) => {
    if (!account) return
    
    setIsLoading(true)
    try {
      const approved: ReceivedAttestation = {
        ...request,
        status: 'approved',
        approvedAt: Date.now()
      }

      const key = `attestation_requests_${account.address.toString()}`
      const existing = await AsyncStorage.getItem(key)
      let allRequests: ReceivedAttestation[] = existing ? JSON.parse(existing) : []
      
      allRequests = allRequests.map(r => r.id === request.id ? approved : r)
      await AsyncStorage.setItem(key, JSON.stringify(allRequests))

      // Update local state
      setReceivedRequests(receivedRequests.filter(r => r.id !== request.id))
      setIssuedAttestations([approved, ...issuedAttestations])

      Toast.show({
        type: 'success',
        text1: 'APPROVED',
        text2: `VERIFIED BY ${account.address.toString().substring(0, 8)}...`,
        position: 'top',
        visibilityTime: 2000,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FAILED TO APPROVE',
        position: 'top',
        visibilityTime: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const rejectAttestation = async (request: ReceivedAttestation, reason: string) => {
    if (!account) return

    setIsLoading(true)
    try {
      const rejected: ReceivedAttestation = {
        ...request,
        status: 'rejected',
        rejectionReason: reason
      }

      const key = `attestation_requests_${account.address.toString()}`
      const existing = await AsyncStorage.getItem(key)
      let allRequests: ReceivedAttestation[] = existing ? JSON.parse(existing) : []
      
      allRequests = allRequests.map(r => r.id === request.id ? rejected : r)
      await AsyncStorage.setItem(key, JSON.stringify(allRequests))

      setReceivedRequests(receivedRequests.filter(r => r.id !== request.id))

      Toast.show({
        type: 'success',
        text1: 'REJECTED',
        text2: 'REQUEST DECLINED',
        position: 'top',
        visibilityTime: 2000,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FAILED TO REJECT',
        position: 'top',
        visibilityTime: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeEmoji = (type: string): string => {
    const emojis: Record<string, string> = {
      employment: '💼',
      rental: '🏠',
      income: '💰',
      education: '🎓',
      other: '📋'
    }
    return emojis[type] || '📄'
  }

  if (!account) {
    return (
      <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1 items-center justify-center">
        <PS2PText className="text-white text-xs">CONNECT WALLET</PS2PText>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1">
      <Header address={account.address.toString()} />
      
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <View className="mr-2">
              <PixelIcon name="shield" color="#ffb86b" size={24} />
            </View>
            <PS2PText className="text-white text-lg">
              ISSUE ATTESTATIONS
            </PS2PText>
          </View>
          <PS2PText className="text-[#a0a0b0] text-[8px]">
            VERIFY CLAIMS FROM OTHERS
          </PS2PText>
        </View>

        {/* Tab Selector */}
        <View className="flex-row gap-2 mb-6">
          <Pressable
            onPress={() => setActiveTab('pending')}
            className={`flex-1 py-2 border-b-2 ${activeTab === 'pending' ? 'border-[#ffb86b] bg-[#1a1a2f]' : 'border-[#2a2a3f] bg-transparent'}`}
          >
            <PS2PText className={`text-xs text-center ${activeTab === 'pending' ? 'text-[#ffb86b]' : 'text-[#a0a0b0]'}`}>
              PENDING ({receivedRequests.length})
            </PS2PText>
          </Pressable>
          
          <Pressable
            onPress={() => setActiveTab('issued')}
            className={`flex-1 py-2 border-b-2 ${activeTab === 'issued' ? 'border-[#00ff9d] bg-[#1a1a2f]' : 'border-[#2a2a3f] bg-transparent'}`}
          >
            <PS2PText className={`text-xs text-center ${activeTab === 'issued' ? 'text-[#00ff9d]' : 'text-[#a0a0b0]'}`}>
              ISSUED ({issuedAttestations.length})
            </PS2PText>
          </Pressable>
        </View>

        {/* Pending Requests */}
        {activeTab === 'pending' && (
          <>
            {receivedRequests.length === 0 ? (
              <View className="bg-[#1a1a2f] p-6 mb-8 border border-[#2a2a3f]">
                <PS2PText className="text-[#a0a0b0] text-[8px] text-center">
                  NO PENDING REQUESTS
                </PS2PText>
                <PS2PText className="text-[#4a4a6a] text-[6px] text-center mt-2">
                  WHEN USERS REQUEST YOUR VERIFICATION, IT WILL APPEAR HERE
                </PS2PText>
              </View>
            ) : (
              receivedRequests.map((request) => (
                <View key={request.id} className="bg-[#1a1a2f] p-4 mb-4 border-2 border-[#ffb86b]">
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <PS2PText className="text-2xl mb-1">
                        {getTypeEmoji(request.type)}
                      </PS2PText>
                      <PS2PText className="text-white text-xs font-bold">
                        {request.predicate.toUpperCase()}
                      </PS2PText>
                    </View>
                    <PS2PText className="text-[#ffb86b] text-[6px]">
                      ⏳ PENDING
                    </PS2PText>
                  </View>

                  <View className="bg-[#0a0a1f] p-2 mb-3 border border-[#2a2a3f]">
                    <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">
                      FROM:
                    </PS2PText>
                    <PS2PText className="text-white text-[7px] font-bold">
                      {request.requesterName.toUpperCase()}
                    </PS2PText>
                    <PS2PText className="text-[#4a4a6a] text-[6px] mt-1">
                      {request.requesterWallet.substring(0, 12)}...
                    </PS2PText>
                  </View>

                  {request.details && (
                    <View className="mb-3">
                      <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">
                        DETAILS:
                      </PS2PText>
                      <PS2PText className="text-[#d0d0d0] text-[7px]">
                        {request.details}
                      </PS2PText>
                    </View>
                  )}

                  <PS2PText className="text-[#4a4a6a] text-[6px] mb-3">
                    REQUESTED: {new Date(request.createdAt).toLocaleDateString().toUpperCase()}
                  </PS2PText>

                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => approveAttestation(request)}
                      disabled={isLoading}
                      className="flex-1 bg-[#00ff9d]"
                    >
                      <PS2PText className="text-[#0a0a1f] text-[7px] text-center p-2 font-bold">
                        ✓ APPROVE
                      </PS2PText>
                    </Pressable>
                    <Pressable
                      onPress={() => rejectAttestation(request, 'Cannot verify')}
                      disabled={isLoading}
                      className="flex-1 bg-[#ff6f61] opacity-70"
                    >
                      <PS2PText className="text-white text-[7px] text-center p-2 font-bold">
                        ✕ REJECT
                      </PS2PText>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* Issued Attestations */}
        {activeTab === 'issued' && (
          <>
            {issuedAttestations.length === 0 ? (
              <View className="bg-[#1a1a2f] p-6 mb-8 border border-[#2a2a3f]">
                <PS2PText className="text-[#a0a0b0] text-[8px] text-center">
                  NO ISSUED ATTESTATIONS
                </PS2PText>
                <PS2PText className="text-[#4a4a6a] text-[6px] text-center mt-2">
                  APPROVE PENDING REQUESTS TO ISSUE ATTESTATIONS
                </PS2PText>
              </View>
            ) : (
              issuedAttestations.map((attestation) => (
                <View key={attestation.id} className="bg-[#1a1a2f] p-4 mb-3 border-2 border-[#00ff9d]">
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <PS2PText className="text-xl mb-1">
                        {getTypeEmoji(attestation.type)}
                      </PS2PText>
                      <PS2PText className="text-white text-xs font-bold">
                        {attestation.predicate.toUpperCase()}
                      </PS2PText>
                    </View>
                    <PS2PText className="text-[#00ff9d] text-[6px]">
                      ✓ VERIFIED
                    </PS2PText>
                  </View>

                  <View className="bg-[#0a0a1f] p-2 mb-3 border border-[#2a2a3f]">
                    <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">
                      FOR:
                    </PS2PText>
                    <PS2PText className="text-white text-[7px] font-bold">
                      {attestation.requesterName.toUpperCase()}
                    </PS2PText>
                    <PS2PText className="text-[#4a4a6a] text-[6px] mt-1">
                      {attestation.requesterWallet.substring(0, 12)}...
                    </PS2PText>
                  </View>

                  <View className="flex-row justify-between text-[6px] text-[#4a4a6a]">
                    <PS2PText className="text-[#4a4a6a] text-[6px]">
                      ISSUED: {new Date(attestation.approvedAt!).toLocaleDateString().toUpperCase()}
                    </PS2PText>
                    <PS2PText className="text-[#4a4a6a] text-[6px]">
                      VALID: 365 DAYS
                    </PS2PText>
                  </View>

                  <View className="mt-3 bg-[#0a0a1f] p-2 border border-[#2a2a3f]">
                    <PS2PText className="text-[#8a2be2] text-[6px]">
                      SIGNATURE BY: {account.address.toString().substring(0, 10)}...
                    </PS2PText>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        <View className="h-8" />
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}
