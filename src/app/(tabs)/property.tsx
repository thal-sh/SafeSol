import { useState, useEffect } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { PixelIcon } from '../../components/PixelIcon'
import PS2PText from '../../components/PS2PText'
import PS2PTextInput from '../../components/PS2PTextInput'
import RentalCard from '../../components/RentalCard'
import AttestationCard from '../../components/AttestationCard'
import { RentalHistory, PropertyAttestation } from '../../types'

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
          <PS2PText className="text-white text-lg">PROPERTY</PS2PText>
        </View>
        <Pressable onPress={() => setShowAddRental(!showAddRental)}>
          <PS2PText className="text-[#8a2be2] text-xs">+ ADD</PS2PText>
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Add Rental Form */}
        {showAddRental && (
          <View className="bg-[#1a1a2f] p-4 mb-4">
            <PS2PText className="text-white text-xs mb-3">ADD RENTAL HISTORY</PS2PText>
            <PS2PTextInput
              className="bg-[#0a0a1f] p-3 mb-3 text-white text-[8px]"
              placeholder="ADDRESS"
              placeholderTextColor="#4a4a6a"
              value={newRental.address}
              onChangeText={(text) => setNewRental({ ...newRental, address: text })}
            />
            <PS2PTextInput
              className="bg-[#0a0a1f] p-3 mb-3 text-white text-[8px]"
              placeholder="LANDLORD"
              placeholderTextColor="#4a4a6a"
              value={newRental.landlord}
              onChangeText={(text) => setNewRental({ ...newRental, landlord: text })}
            />
            <PS2PTextInput
              className="bg-[#0a0a1f] p-3 mb-3 text-white text-[8px]"
              placeholder="LANDLORD WALLET (OPTIONAL)"
              placeholderTextColor="#4a4a6a"
              value={newRental.landlordWallet}
              onChangeText={(text) => setNewRental({ ...newRental, landlordWallet: text })}
            />
            <PS2PTextInput
              className="bg-[#0a0a1f] p-3 mb-3 text-white text-[8px]"
              placeholder="MONTHLY RENT"
              placeholderTextColor="#4a4a6a"
              value={newRental.monthlyRent}
              onChangeText={(text) => setNewRental({ ...newRental, monthlyRent: text })}
              keyboardType="numeric"
            />
            <PS2PTextInput
              className="bg-[#0a0a1f] p-3 mb-3 text-white text-[8px]"
              placeholder="START DATE (YYYY-MM-DD)"
              placeholderTextColor="#4a4a6a"
              value={newRental.startDate}
              onChangeText={(text) => setNewRental({ ...newRental, startDate: text })}
            />
            <View className="flex-row justify-between">
              <Pressable onPress={() => setShowAddRental(false)} className="flex-1 bg-[#0a0a1f] p-3 mr-2">
                <PS2PText className="text-white text-xs text-center">CANCEL</PS2PText>
              </Pressable>
              <Pressable onPress={addRental} className="flex-1 bg-[#8a2be2] p-3 ml-2">
                <PS2PText className="text-white text-xs text-center">SAVE</PS2PText>
              </Pressable>
            </View>
          </View>
        )}

        {/* Rental History Section */}
        <View className="mb-4">
          <PS2PText className="text-white text-xs mb-3">CURRENT RENTALS</PS2PText>
          
          {rentalHistory.length === 0 ? (
            <View className="bg-[#1a1a2f] p-8 items-center">
              <PS2PText className="text-[#a0a0b0] text-xs text-center mb-2">
                NO RENTALS YET
              </PS2PText>
              <PS2PText className="text-[#4a4a6a] text-[8px] text-center">
                TAP + TO ADD YOUR FIRST RENTAL
              </PS2PText>
            </View>
          ) : (
            rentalHistory.map((rental) => (
              <RentalCard key={rental.id} rental={rental} onVerify={() => requestLandlordVerification(rental)} />
            ))
          )}
        </View>

        {/* Attestations Section */}
        {attestations.length > 0 && (
          <View className="mb-4">
            <PS2PText className="text-white text-xs mb-3">VERIFIABLE PROOFS</PS2PText>
            {attestations.map((att) => (
              <AttestationCard key={att.id} attestation={att} />
            ))}
          </View>
        )}

        {/* Quick Action */}
        <Pressable 
          onPress={() => router.push('/attestations/scan')}
          className="bg-[#1a1a2f] p-4 mt-2 mb-8"
        >
          <PS2PText className="text-[#8a2be2] text-xs text-center">SCAN LANDLORD QR</PS2PText>
          <PS2PText className="text-[#a0a0b0] text-[6px] text-center mt-2">
            HAVE YOUR LANDLORD VERIFY YOUR RENTAL HISTORY
          </PS2PText>
        </Pressable>
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}