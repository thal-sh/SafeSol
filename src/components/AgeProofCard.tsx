import React from 'react'
import { View } from 'react-native'
import { PS2PText } from './PS2PText'

export type AgeProof = {
  id: string
  predicate: string // "over_18", "over_21", "over_65"
  issuer: string
  issuerWallet: string
  issuedAt: number
  validUntil: number
}

interface Props {
  proof: AgeProof
}

export const AgeProofCard: React.FC<Props> = ({ proof }) => (
  <View className="bg-[#1a1a2f] p-3 mb-2">
    <View className="flex-row justify-between items-center">
      <PS2PText className="text-white text-[8px]">
        {proof.predicate === 'over_18' ? 'OVER 18' : 
         proof.predicate === 'over_21' ? 'OVER 21' : 'OVER 65'}
      </PS2PText>
      <View className="bg-[#00ff9d] px-2 py-1">
        <PS2PText className="text-[#0a0a1f] text-[4px]">VERIFIED</PS2PText>
      </View>
    </View>
    <PS2PText className="text-[#a0a0b0] text-[6px] mt-1">
      BY: {proof.issuer}
    </PS2PText>
  </View>
)
