import { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable, TextInput } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { PixelIcon } from '../../components/PixelIcon'

type RentalHistory = {
  id: string
  address: string
  landlord: string
  landlordWallet: string
  startDate: string
  endDate?: string
  monthlyRent: number
  paymentsMade: number
  totalMonths: number
  attested: boolean
}

type PropertyAttestation = {
  id: string
  type: 'rental' | 'ownership' | 'payment'
  predicate: string
  issuer: string
  issuerWallet: string
  issuedAt: number
  validUntil: number
}

// Rental Card Component
const RentalCard = ({ rental, onVerify }: { rental: RentalHistory; onVerify: () => void }) => (
  <View className="bg-[#1a1a2f] p-3 mb-2">
    <View className="flex-row justify-between items-start">
      <View className="flex-1">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-[8px]">
          {rental.address}
        </Text>
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px] mt-1">
          LANDLORD: {rental.landlord}
        </Text>
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px]">
          SINCE: {rental.startDate} • ${rental.monthlyRent}/mo
        </Text>
      </View>
      
      {rental.attested ? (
        <View className="bg-[#00ff9d] px-2 py-1 ml-2">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#0a0a1f] text-[4px]">
            VERIFIED
          </Text>
        </View>
      ) : (
        <Pressable onPress={onVerify} className="bg-[#0a0a1f] px-2 py-1 ml-2">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#8a2be2] text-[4px]">
            VERIFY
          </Text>
        </Pressable>
      )}
    </View>
  </View>
)

// Attestation Card Component
const AttestationCard = ({ attestation }: { attestation: PropertyAttestation }) => (
  <View className="bg-[#1a1a2f] p-3 mb-2">
    <View className="flex-row justify-between items-center">
      <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-[8px] flex-1">
        {attestation.predicate}
      </Text>
      <View className="bg-[#00ff9d] px-2 py-1 ml-2">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#0a0a1f] text-[4px]">
          READY
        </Text>
      </View>
    </View>
    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px] mt-1">
      BY: {attestation.issuer}
    </Text>
  </View>
)

export default function PropertyTab() {
  const { account } = useMobileWallet()
  const [rentalHistory, setRentalHistory] = useState<RentalHistory[]>([])
  const [attestations, setAttestations] = useState<PropertyAttestation[]>([])
  const [showAddRental, setShowAddRental] = useState(false)
  const [newRental, setNewRental] = useState({
    address: '',
    landlord: '',
    landlordWallet: '',
    monthlyRent: '',
    startDate: '',
  })

  useEffect(() => {
    if (account) {
      loadData()
    }
  }, [account])

  const loadData = async () => {
    try {
      const rentals = await AsyncStorage.getItem(`rentals_${account!.address}`)
      if (rentals) setRentalHistory(JSON.parse(rentals))

      const atts = await AsyncStorage.getItem(`property_atts_${account!.address}`)
      if (atts) setAttestations(JSON.parse(atts))
    } catch (error) {
      console.log('Error loading property data')
    }
  }

  const addRental = async () => {
    if (!newRental.address || !newRental.landlord || !newRental.monthlyRent) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FILL ALL FIELDS',
        position: 'top',
      })
      return
    }

    const rental: RentalHistory = {
      id: Date.now().toString(),
      address: newRental.address,
      landlord: newRental.landlord,
      landlordWallet: newRental.landlordWallet || 'pending',
      startDate: newRental.startDate || new Date().toISOString().split('T')[0],
      monthlyRent: parseInt(newRental.monthlyRent),
      paymentsMade: 0,
      totalMonths: 0,
      attested: false,
    }

    const updated = [...rentalHistory, rental]
    await AsyncStorage.setItem(`rentals_${account!.address}`, JSON.stringify(updated))
    setRentalHistory(updated)
    setShowAddRental(false)
    setNewRental({ address: '', landlord: '', landlordWallet: '', monthlyRent: '', startDate: '' })

    Toast.show({
      type: 'success',
      text1: 'RENTAL ADDED',
      text2: 'ASK LANDLORD TO VERIFY',
      position: 'top',
    })
  }

  const requestLandlordVerification = (rental: RentalHistory) => {
    router.push({
      pathname: '/attestations/issue',
      params: {
        type: 'rental',
        subject: account!.address,
        predicate: `rented_at_${rental.address}`,
        data: JSON.stringify(rental)
      }
    })
  }

  return (
    <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1">
      {/* Header */}
      <View className="pt-12 px-4 pb-4 border-b border-[#2a2a3f] flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="mr-2">
            <PixelIcon name="property" color="#8a2be2" size={24} />
          </View>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-lg">
            PROPERTY
          </Text>
        </View>
        <Pressable onPress={() => setShowAddRental(!showAddRental)}>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#8a2be2] text-xs">
            + ADD
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Add Rental Form */}
        {showAddRental && (
          <View className="bg-[#1a1a2f] p-4 mb-4">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs mb-3">
              ADD RENTAL HISTORY
            </Text>
            
            <TextInput
              className="bg-[#0a0a1f] p-3 mb-3 text-white text-[8px]"
              placeholder="ADDRESS"
              placeholderTextColor="#4a4a6a"
              value={newRental.address}
              onChangeText={(text) => setNewRental({...newRental, address: text})}
              style={{ fontFamily: 'PressStart2P_400Regular' }}
            />
            
            <TextInput
              className="bg-[#0a0a1f] p-3 mb-3 text-white text-[8px]"
              placeholder="LANDLORD NAME"
              placeholderTextColor="#4a4a6a"
              value={newRental.landlord}
              onChangeText={(text) => setNewRental({...newRental, landlord: text})}
              style={{ fontFamily: 'PressStart2P_400Regular' }}
            />
            
            <TextInput
              className="bg-[#0a0a1f] p-3 mb-3 text-white text-[8px]"
              placeholder="LANDLORD WALLET (OPTIONAL)"
              placeholderTextColor="#4a4a6a"
              value={newRental.landlordWallet}
              onChangeText={(text) => setNewRental({...newRental, landlordWallet: text})}
              style={{ fontFamily: 'PressStart2P_400Regular' }}
            />
            
            <TextInput
              className="bg-[#0a0a1f] p-3 mb-3 text-white text-[8px]"
              placeholder="MONTHLY RENT"
              placeholderTextColor="#4a4a6a"
              value={newRental.monthlyRent}
              onChangeText={(text) => setNewRental({...newRental, monthlyRent: text})}
              keyboardType="numeric"
              style={{ fontFamily: 'PressStart2P_400Regular' }}
            />
            
            <TextInput
              className="bg-[#0a0a1f] p-3 mb-4 text-white text-[8px]"
              placeholder="START DATE (YYYY-MM-DD)"
              placeholderTextColor="#4a4a6a"
              value={newRental.startDate}
              onChangeText={(text) => setNewRental({...newRental, startDate: text})}
              style={{ fontFamily: 'PressStart2P_400Regular' }}
            />

            <Pressable onPress={addRental} className="bg-[#8a2be2] p-3">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs text-center">
                SAVE RENTAL
              </Text>
            </Pressable>
          </View>
        )}

        {/* Current Rentals */}
        <View className="mb-6">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs mb-3">
            CURRENT RENTALS
          </Text>

          {rentalHistory.length === 0 ? (
            <View className="bg-[#1a1a2f] p-6 items-center">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-xs text-center">
                NO RENTALS YET
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a4a6a] text-[8px] text-center mt-2">
                ADD YOUR RENTAL HISTORY
              </Text>
            </View>
          ) : (
            rentalHistory.map((rental) => (
              <RentalCard 
                key={rental.id} 
                rental={rental} 
                onVerify={() => requestLandlordVerification(rental)}
              />
            ))
          )}
        </View>

        {/* Rental Attestations */}
        {attestations.length > 0 && (
          <View className="mb-6">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs mb-3">
              VERIFIABLE PROOFS
            </Text>

            {attestations.map((att) => (
              <AttestationCard key={att.id} attestation={att} />
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-xs mb-3">
          QUICK ACTIONS
        </Text>

        <Pressable 
          onPress={() => router.push('/attestations/scan')}
          className="bg-[#1a1a2f] p-4 mb-8"
        >
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#8a2be2] text-xs text-center">
            SCAN LANDLORD QR
          </Text>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px] text-center mt-2">
            HAVE YOUR LANDLORD VERIFY YOUR RENTAL HISTORY
          </Text>
        </Pressable>
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}