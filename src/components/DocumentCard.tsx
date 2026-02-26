import React from 'react'
import { View, Text, Image } from 'react-native'
import PS2PText from './PS2PText'
import { Document } from '../types'

interface Props {
  document: Document
}

export default function DocumentCard({ document }: Props) {
  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'passport':
        return '🛂'
      case 'drivers_license':
        return '🪪'
      case 'birth_certificate':
        return '👶'
      case 'diploma':
        return '🎓'
      default:
        return '📄'
    }
  }

  return (
    <View className="bg-[#1a1a2f] p-3 mb-3">
      <View className="flex-row">
        <View className="mr-3 w-10 h-10 items-center justify-center bg-[#0a0a1f]">
          <Text className="text-2xl">{getCategoryIcon(document.type)}</Text>
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <PS2PText className="text-white text-[8px] flex-1">
              {document.name}
            </PS2PText>
            {document.verified ? (
              <View className="bg-[#00ff9d] px-2 py-1 ml-2">
                <PS2PText className="text-[#0a0a1f] text-[4px]">VERIFIED</PS2PText>
              </View>
            ) : (
              <View className="bg-[#2a2a3f] px-2 py-1 ml-2">
                <PS2PText className="text-[#a0a0b0] text-[4px]">UNVERIFIED</PS2PText>
              </View>
            )}
          </View>

          <PS2PText className="text-[#a0a0b0] text-[6px] mt-1">
            ISSUER: {document.issuer}
          </PS2PText>
          <PS2PText className="text-[#a0a0b0] text-[6px]">
            ISSUED: {document.issuedAt}
          </PS2PText>
          {document.expiresAt && (
            <PS2PText className="text-[#ff6f61] text-[6px]">
              EXPIRES: {document.expiresAt}
            </PS2PText>
          )}
        </View>
      </View>

      {document.imageUri && (
        <View className="mt-3 bg-[#0a0a1f] p-2">
          <Image
            source={{ uri: document.imageUri }}
            className="w-full h-40"
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  )
}
