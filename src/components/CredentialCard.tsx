import React from 'react'
import { View } from 'react-native'
import { PS2PText } from './PS2PText'

export type Credential = {
  id: string
  type: 'license' | 'certification' | 'membership' | 'education'
  title: string
  issuer: string
  issuedAt: string
  expiresAt?: string
  verified: boolean
}

interface Props {
  credential: Credential
}

export const CredentialCard: React.FC<Props> = ({ credential }) => (
  <View className="bg-[#1a1a2f] p-3 mb-2">
    <View className="flex-row justify-between items-center">
      <PS2PText className="text-white text-[8px] flex-1">
        {credential.title}
      </PS2PText>
      {credential.verified && (
        <View className="bg-[#00ff9d] px-2 py-1 ml-2">
          <PS2PText className="text-[#0a0a1f] text-[4px]">✓</PS2PText>
        </View>
      )}
    </View>
    <PS2PText className="text-[#a0a0b0] text-[6px] mt-1">
      {credential.issuer} • {credential.issuedAt}
    </PS2PText>
  </View>
)
