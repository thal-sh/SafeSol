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
import PS2PTextInput from '../components/PS2PTextInput'
import { useCallback } from 'react'

type RentalHistory = {
  id: string
  address: string
  landlordName: string
  landlordWallet: string
  startDate: string
  endDate?: string
  monthlyRent: number
  paymentsMade: number
  totalMonths: number
  verified: boolean
  verifiedAt?: number
}

export default function RentalHistoryScreen() {
  const { account } = useMobileWallet()
  const [rentals, setRentals] = useState<RentalHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newRental, setNewRental] = useState<Partial<RentalHistory>>({
    address: '',
    landlordName: '',
    landlordWallet: '',
    startDate: '',
    endDate: '',
    monthlyRent: 0,
    paymentsMade: 0,
    totalMonths: 0
  })

  const loadRentals = useCallback(async () => {
    if (!account) return
    try {
      const data = await AsyncStorage.getItem(`rentals_${account.address.toString()}`)
      if (data) {
        setRentals(JSON.parse(data).sort((a: RentalHistory, b: RentalHistory) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        ))
      }
    } catch (error) {
      console.log('Error loading rentals')
    }
  }, [account])

  useEffect(() => {
    loadRentals()
  }, [account, loadRentals])

  useFocusEffect(
    useCallback(() => {
      loadRentals()
    }, [loadRentals])
  )

  const validateRental = (): boolean => {
    if (!newRental.address?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'ADDRESS REQUIRED',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    if (!newRental.landlordName?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'LANDLORD NAME REQUIRED',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    if (!newRental.landlordWallet?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'LANDLORD WALLET REQUIRED',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    if (!newRental.startDate?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'START DATE REQUIRED (MM/DD/YYYY)',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    if (!newRental.monthlyRent || newRental.monthlyRent <= 0) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'VALID MONTHLY RENT REQUIRED',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    if (newRental.paymentsMade === undefined || newRental.paymentsMade < 0) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'VALID PAYMENTS MADE REQUIRED',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    if (!newRental.totalMonths || newRental.totalMonths <= 0) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'VALID TOTAL MONTHS REQUIRED',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    return true
  }

  const addRental = async () => {
    if (!account || !validateRental()) return

    setIsLoading(true)
    try {
      const rental: RentalHistory = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        address: newRental.address!,
        landlordName: newRental.landlordName!,
        landlordWallet: newRental.landlordWallet!.toLowerCase(),
        startDate: newRental.startDate!,
        endDate: newRental.endDate || undefined,
        monthlyRent: newRental.monthlyRent!,
        paymentsMade: newRental.paymentsMade!,
        totalMonths: newRental.totalMonths!,
        verified: false
      }

      const key = `rentals_${account.address.toString()}`
      const existing = await AsyncStorage.getItem(key)
      const allRentals: RentalHistory[] = existing ? JSON.parse(existing) : []
      allRentals.push(rental)
      await AsyncStorage.setItem(key, JSON.stringify(allRentals))

      setRentals(allRentals.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      ))
      
      setIsAddingNew(false)
      setNewRental({
        address: '',
        landlordName: '',
        landlordWallet: '',
        startDate: '',
        endDate: '',
        monthlyRent: 0,
        paymentsMade: 0,
        totalMonths: 0
      })

      Toast.show({
        type: 'success',
        text1: 'SUCCESS',
        text2: 'RENTAL ADDED',
        position: 'top',
        visibilityTime: 2000,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FAILED TO ADD RENTAL',
        position: 'top',
        visibilityTime: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const requestVerification = async (rental: RentalHistory) => {
    // Store as proof request TO the landlord
    if (!account) return
    
    setIsLoading(true)
    try {
      const request = {
        id: `rent-${rental.id}`,
        type: 'rental',
        issuerWallet: rental.landlordWallet,
        issuerName: rental.landlordName,
        predicate: `PAID ${rental.paymentsMade} MONTHS RENT AT ${rental.address}`,
        details: `$${rental.monthlyRent}/month from ${rental.startDate} to ${rental.endDate || 'PRESENT'}`,
        createdAt: Date.now(),
        status: 'pending',
      }

      const key = `proof_requests_${account.address.toString()}`
      const existing = await AsyncStorage.getItem(key)
      const requests = existing ? JSON.parse(existing) : []
      requests.push(request)
      await AsyncStorage.setItem(key, JSON.stringify(requests))

      Toast.show({
        type: 'success',
        text1: 'REQUESTED',
        text2: `VERIFICATION SENT TO ${rental.landlordName.toUpperCase()}`,
        position: 'top',
        visibilityTime: 2000,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FAILED TO REQUEST',
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

  return (
    <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1">
      <Header address={account.address.toString()} />
      
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <View className="mr-2">
              <PixelIcon name="health" color="#8a2be2" size={24} />
            </View>
            <PS2PText className="text-white text-lg">
              RENTAL HISTORY
            </PS2PText>
          </View>
          <PS2PText className="text-[#a0a0b0] text-[8px]">
            TRACK YOUR RESIDENCE PAYMENTS
          </PS2PText>
        </View>

        {/* Add New Rental Form */}
        {!isAddingNew ? (
          <Pressable
            onPress={() => setIsAddingNew(true)}
            className="bg-[#00ff9d] p-4 mb-6"
          >
            <PS2PText className="text-[#0a0a1f] text-xs text-center font-bold">
              + ADD RENTAL PROPERTY
            </PS2PText>
          </Pressable>
        ) : (
          <View className="bg-[#1a1a2f] p-4 mb-6 border border-[#2a2a3f]">
            <PS2PText className="text-white text-xs mb-3">ADD NEW RENTAL</PS2PText>

            <View className="mb-3">
              <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">ADDRESS *</PS2PText>
              <View className="bg-[#0a0a1f]">
                <PS2PTextInput
                  className="p-3 text-white text-xs"
                  placeholder="123 MAIN ST, APT 4B"
                  placeholderTextColor="#4a4a6a"
                  value={newRental.address || ''}
                  onChangeText={(text) => setNewRental({...newRental, address: text})}
                />
              </View>
            </View>

            <View className="mb-3">
              <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">LANDLORD NAME *</PS2PText>
              <View className="bg-[#0a0a1f]">
                <PS2PTextInput
                  className="p-3 text-white text-xs"
                  placeholder="LANDLORD NAME"
                  placeholderTextColor="#4a4a6a"
                  value={newRental.landlordName || ''}
                  onChangeText={(text) => setNewRental({...newRental, landlordName: text})}
                />
              </View>
            </View>

            <View className="mb-3">
              <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">LANDLORD WALLET *</PS2PText>
              <View className="bg-[#0a0a1f]">
                <PS2PTextInput
                  className="p-3 text-white text-xs"
                  placeholder="0x..."
                  placeholderTextColor="#4a4a6a"
                  value={newRental.landlordWallet || ''}
                  onChangeText={(text) => setNewRental({...newRental, landlordWallet: text})}
                />
              </View>
            </View>

            <View className="flex-row gap-2 mb-3">
              <View className="flex-1">
                <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">START DATE *</PS2PText>
                <View className="bg-[#0a0a1f]">
                  <PS2PTextInput
                    className="p-3 text-white text-xs"
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor="#4a4a6a"
                    value={newRental.startDate || ''}
                    onChangeText={(text) => setNewRental({...newRental, startDate: text})}
                  />
                </View>
              </View>
              <View className="flex-1">
                <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">END DATE</PS2PText>
                <View className="bg-[#0a0a1f]">
                  <PS2PTextInput
                    className="p-3 text-white text-xs"
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor="#4a4a6a"
                    value={newRental.endDate || ''}
                    onChangeText={(text) => setNewRental({...newRental, endDate: text})}
                  />
                </View>
              </View>
            </View>

            <View className="flex-row gap-2 mb-3">
              <View className="flex-1">
                <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">MONTHLY RENT *</PS2PText>
                <View className="bg-[#0a0a1f]">
                  <PS2PTextInput
                    className="p-3 text-white text-xs"
                    placeholder="2500"
                    placeholderTextColor="#4a4a6a"
                    value={String(newRental.monthlyRent || '')}
                    onChangeText={(text) => setNewRental({...newRental, monthlyRent: parseInt(text) || 0})}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View className="flex-1">
                <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">PAYMENTS MADE *</PS2PText>
                <View className="bg-[#0a0a1f]">
                  <PS2PTextInput
                    className="p-3 text-white text-xs"
                    placeholder="12"
                    placeholderTextColor="#4a4a6a"
                    value={String(newRental.paymentsMade || '')}
                    onChangeText={(text) => setNewRental({...newRental, paymentsMade: parseInt(text) || 0})}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View className="mb-4">
              <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">TOTAL MONTHS *</PS2PText>
              <View className="bg-[#0a0a1f]">
                <PS2PTextInput
                  className="p-3 text-white text-xs"
                  placeholder="12"
                  placeholderTextColor="#4a4a6a"
                  value={String(newRental.totalMonths || '')}
                  onChangeText={(text) => setNewRental({...newRental, totalMonths: parseInt(text) || 0})}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View className="flex-row gap-2">
              <Pressable
                onPress={addRental}
                disabled={isLoading}
                className="flex-1 bg-[#00ff9d]"
              >
                <PS2PText className="text-[#0a0a1f] text-xs text-center p-3 font-bold">
                  {isLoading ? 'SAVING...' : 'ADD RENTAL'}
                </PS2PText>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsAddingNew(false)
                  setNewRental({
                    address: '',
                    landlordName: '',
                    landlordWallet: '',
                    startDate: '',
                    endDate: '',
                    monthlyRent: 0,
                    paymentsMade: 0,
                    totalMonths: 0
                  })
                }}
                className="flex-1 bg-[#2a2a3f]"
              >
                <PS2PText className="text-white text-xs text-center p-3">
                  CANCEL
                </PS2PText>
              </Pressable>
            </View>
          </View>
        )}

        {/* Rentals List */}
        <PS2PText className="text-white text-xs mb-3">
          PROPERTIES ({rentals.length})
        </PS2PText>

        {rentals.length === 0 ? (
          <View className="bg-[#1a1a2f] p-4 mb-8 border border-[#2a2a3f]">
            <PS2PText className="text-[#a0a0b0] text-[8px] text-center">
              NO RENTAL HISTORY
            </PS2PText>
          </View>
        ) : (
          rentals.map((rental) => (
            <View key={rental.id} className={`bg-[#1a1a2f] p-4 mb-3 border-l-4 ${rental.verified ? 'border-l-[#00ff9d]' : 'border-l-[#ffb86b]'}`}>
              <View className="flex-row justify-between mb-2">
                <PS2PText className="text-white text-xs font-bold flex-1">
                  {rental.address.toUpperCase()}
                </PS2PText>
                {rental.verified && (
                  <PS2PText className="text-[#00ff9d] text-[7px]">✓ VERIFIED</PS2PText>
                )}
              </View>

              <PS2PText className="text-[#a0a0b0] text-[7px] mb-2">
                {rental.landlordName} • ${rental.monthlyRent}/mo
              </PS2PText>

              <View className="bg-[#0a0a1f] p-2 mb-3 border border-[#2a2a3f]">
                <PS2PText className="text-[#00ff9d] text-[7px] font-bold">
                  {rental.paymentsMade}/{rental.totalMonths} MONTHS PAID
                </PS2PText>
                <PS2PText className="text-[#a0a0b0] text-[6px] mt-1">
                  {rental.startDate} to {rental.endDate || 'PRESENT'}
                </PS2PText>
              </View>

              {!rental.verified && (
                <Pressable
                  onPress={() => requestVerification(rental)}
                  disabled={isLoading}
                  className="bg-[#ffb86b]"
                >
                  <PS2PText className="text-[#0a0a1f] text-[7px] text-center p-2 font-bold">
                    REQUEST VERIFICATION
                  </PS2PText>
                </Pressable>
              )}
            </View>
          ))
        )}

        <View className="h-8" />
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}
