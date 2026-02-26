import React from 'react'
import { View } from 'react-native'
import { PS2PText } from './PS2PText'

export type IncomeProof = {
  id: string
  employer: string
  amount: number
  startDate: string
  status: 'active' | 'past'
}

interface Props {
  proof: IncomeProof
}

export const ProofCard: React.FC<Props> = ({ proof }) => (
  <View className="bg-[#1a1a2f] p-3 mb-2">
    <View className="flex-row justify-between items-center">
      <PS2PText className="text-white text-[8px] flex-1">
        {proof.employer}
      </PS2PText>
      <View className="bg-[#00ff9d] px-2 py-1">
        <PS2PText className="text-[#0a0a1f] text-[4px]">VERIFIED</PS2PText>
      </View>
    </View>
    <PS2PText className="text-[#a0a0b0] text-[6px] mt-1">
      SINCE: {proof.startDate}
    </PS2PText>
  </View>
)
