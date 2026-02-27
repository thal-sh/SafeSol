import { useState } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { Header } from '../components/Header'
import { PixelIcon } from '../components/PixelIcon'
import { PS2PText } from '../components/PS2PText'
import PS2PTextInput from '../components/PS2PTextInput'

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

const PROOF_TYPES = [
  { id: 'employment', label: 'Employment Verification', emoji: '💼' },
  { id: 'rental', label: 'Rental History', emoji: '🏠' },
  { id: 'income', label: 'Income Proof', emoji: '💰' },
  { id: 'education', label: 'Education Certificate', emoji: '🎓' },
  { id: 'other', label: 'Other', emoji: '📋' },
]

export default function ProofRequestScreen() {
  const { account } = useMobileWallet()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [issuerName, setIssuerName] = useState('')
  const [issuerWallet, setIssuerWallet] = useState('')
  const [predicate, setPredicate] = useState('')
  const [details, setDetails] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    if (!selectedType) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'SELECT PROOF TYPE',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    if (!issuerName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'ISSUER NAME REQUIRED',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    if (!issuerWallet.trim()) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'ISSUER WALLET REQUIRED',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    if (!predicate.trim()) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'PREDICATE/CLAIM REQUIRED',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    return true
  }

  const sendRequest = async () => {
    if (!account || !validateForm()) return

    setIsLoading(true)
    try {
      const request: ProofRequest = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: selectedType as ProofRequest['type'],
        issuerWallet: issuerWallet.trim(),
        issuerName: issuerName.trim(),
        predicate: predicate.trim(),
        details: details.trim(),
        createdAt: Date.now(),
        status: 'pending',
      }

      // Store locally
      const key = `proof_requests_${account.address.toString()}`
      const existing = await AsyncStorage.getItem(key)
      const requests: ProofRequest[] = existing ? JSON.parse(existing) : []
      requests.push(request)
      await AsyncStorage.setItem(key, JSON.stringify(requests))

      Toast.show({
        type: 'success',
        text1: 'SUCCESS',
        text2: 'REQUEST SENT TO ' + issuerName.toUpperCase(),
        position: 'top',
        visibilityTime: 2000,
      })

      // Reset form
      setSelectedType(null)
      setIssuerName('')
      setIssuerWallet('')
      setPredicate('')
      setDetails('')

      // Navigate to financial to show requests
      setTimeout(() => {
        router.back()
      }, 1500)
    } catch (error) {
      console.error('Error sending request:', error)
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FAILED TO SEND REQUEST',
        position: 'top',
        visibilityTime: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!account) {
    return (
      <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1 items-center justify-center">
        <PS2PText className="text-white text-xs">CONNECT WALLET</PS2PText>
      </LinearGradient>
    )
  }

  const selectedTypeData = PROOF_TYPES.find(t => t.id === selectedType)

  return (
    <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1">
      <Header address={account.address.toString()} />
      
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <View className="mr-2">
              <PixelIcon name="finance" color="#00ff9d" size={24} />
            </View>
            <PS2PText className="text-white text-lg">
              REQUEST PROOF
            </PS2PText>
          </View>
          <PS2PText className="text-[#a0a0b0] text-[8px]">
            REQUEST VERIFIED ATTESTATION FROM AN ISSUER
          </PS2PText>
        </View>

        {/* Step 1: Select Proof Type */}
        <View className="mb-6">
          <PS2PText className="text-white text-xs mb-3">
            WHAT DO YOU NEED?
          </PS2PText>
          
          <View>
            {PROOF_TYPES.map((type) => (
              <Pressable
                key={type.id}
                onPress={() => setSelectedType(type.id)}
                className={`p-4 mb-2 border ${
                  selectedType === type.id
                    ? 'border-[#00ff9d] bg-[#1a1a2f]'
                    : 'border-[#2a2a3f] bg-[#0a0a1f]'
                }`}
              >
                <PS2PText className={`text-lg mb-1 ${
                  selectedType === type.id ? 'text-[#00ff9d]' : 'text-white'
                }`}>
                  {type.emoji}
                </PS2PText>
                <PS2PText className={`text-xs ${
                  selectedType === type.id ? 'text-[#00ff9d]' : 'text-[#a0a0b0]'
                }`}>
                  {type.label.toUpperCase()}
                </PS2PText>
              </Pressable>
            ))}
          </View>
        </View>

        {selectedType && (
          <>
            {/* Step 2: Issuer Details */}
            <View className="mb-6">
              <PS2PText className="text-white text-xs mb-3">
                ISSUER DETAILS
              </PS2PText>

              <View className="mb-3">
                <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">
                  ISSUER NAME (COMPANY/PERSON) *
                </PS2PText>
                <View className="bg-[#1a1a2f] border border-[#2a2a3f]">
                  <PS2PTextInput
                    className="p-3 text-white text-xs"
                    placeholder="ACME CORP, BOB PROPERTIES, ETC"
                    placeholderTextColor="#4a4a6a"
                    value={issuerName}
                    onChangeText={setIssuerName}
                  />
                </View>
              </View>

              <View className="mb-3">
                <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">
                  ISSUER WALLET ADDRESS *
                </PS2PText>
                <View className="bg-[#1a1a2f] border border-[#2a2a3f]">
                  <PS2PTextInput
                    className="p-3 text-white text-xs"
                    placeholder="0x..."
                    placeholderTextColor="#4a4a6a"
                    value={issuerWallet}
                    onChangeText={text => setIssuerWallet(text.toLowerCase())}
                  />
                </View>
              </View>
            </View>

            {/* Step 3: Proof Claim */}
            <View className="mb-6">
              <PS2PText className="text-white text-xs mb-3">
                WHAT SHOULD THEY VERIFY?
              </PS2PText>

              <View className="mb-3">
                <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">
                  CLAIM/PREDICATE *
                </PS2PText>
                <View className="bg-[#1a1a2f] border border-[#2a2a3f]">
                  <PS2PTextInput
                    className="p-3 text-white text-xs"
                    placeholder={selectedType === 'employment' 
                      ? 'EMPLOYED AT ACME CORP' 
                      : selectedType === 'income'
                      ? 'MONTHLY INCOME > $5000'
                      : selectedType === 'rental'
                      ? 'PAID 12 MONTHS RENT'
                      : 'YOUR CLAIM HERE'}
                    placeholderTextColor="#4a4a6a"
                    value={predicate}
                    onChangeText={setPredicate}
                  />
                </View>
              </View>

              <View className="mb-6">
                <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">
                  ADDITIONAL DETAILS (OPTIONAL)
                </PS2PText>
                <View className="bg-[#1a1a2f] border border-[#2a2a3f]">
                  <PS2PTextInput
                    className="p-3 text-white text-xs"
                    placeholder="JAN 2025 - DEC 2025, DEPARTMENT: ENGINEERING, ETC"
                    placeholderTextColor="#4a4a6a"
                    value={details}
                    onChangeText={setDetails}
                    multiline
                  />
                </View>
              </View>
            </View>

            {/* Summary */}
            <View className="bg-[#1a1a2f] p-4 mb-6 border border-[#2a2a3f]">
              <PS2PText className="text-white text-xs mb-3">
                SUMMARY
              </PS2PText>
              
              <View className="mb-2">
                <PS2PText className="text-[#00ff9d] text-[7px]">
                  {selectedTypeData?.emoji} {selectedTypeData?.label.toUpperCase()}
                </PS2PText>
              </View>
              
              <View className="mb-2">
                <PS2PText className="text-[#a0a0b0] text-[6px]">
                  TO: {issuerName || 'SELECT ISSUER'}
                </PS2PText>
              </View>

              <View className="mb-2">
                <PS2PText className="text-[#a0a0b0] text-[6px]">
                  CLAIM: {predicate || 'ENTER YOUR CLAIM'}
                </PS2PText>
              </View>

              <View className="border-t border-[#2a2a3f] pt-2 mt-2">
                <PS2PText className="text-[#8a2be2] text-[6px]">
                  FROM: {account.address.toString().substring(0, 10)}...
                </PS2PText>
              </View>
            </View>

            {/* Send Button */}
            <Pressable
              onPress={sendRequest}
              disabled={isLoading}
              className="bg-[#00ff9d] mb-8"
            >
              <PS2PText className="text-[#0a0a1f] text-xs text-center p-4 font-bold">
                {isLoading ? 'SENDING...' : 'SEND REQUEST'}
              </PS2PText>
            </Pressable>
          </>
        )}

        <View className="h-4" />
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}
