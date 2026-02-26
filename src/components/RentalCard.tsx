import React from 'react'
import { View, Pressable } from 'react-native'
import PS2PText from './PS2PText'
import { RentalHistory } from '../types'

interface Props {
  rental: RentalHistory
  onVerify: () => void
}

export default function RentalCard({ rental, onVerify }: Props) {
  return (
    <View className="bg-[#1a1a2f] p-3 mb-2">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <PS2PText className="text-white text-[8px]">{rental.address}</PS2PText>
          <PS2PText className="text-[#a0a0b0] text-[6px] mt-1">
            LANDLORD: {rental.landlord}
          </PS2PText>
          <PS2PText className="text-[#a0a0b0] text-[6px]">
            SINCE: {rental.startDate} • ${rental.monthlyRent}/mo
          </PS2PText>
        </View>

        {rental.attested ? (
          <View className="bg-[#00ff9d] px-2 py-1 ml-2">
            <PS2PText className="text-[#0a0a1f] text-[4px]">VERIFIED</PS2PText>
          </View>
        ) : (
          <Pressable onPress={onVerify} className="bg-[#0a0a1f] px-2 py-1 ml-2">
            <PS2PText className="text-[#8a2be2] text-[4px]">VERIFY</PS2PText>
          </Pressable>
        )}
      </View>
    </View>
  )
}
