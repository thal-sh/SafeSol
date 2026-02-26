import React from 'react'
import { View } from 'react-native'
import PS2PText from './PS2PText'
import { MedicalInfo } from '../types'

type Props = {
  info?: MedicalInfo | null
}

export function ParamedicView({ info }: Props) {
  if (!info) {
    return (
      <View className="p-6">
        <PS2PText className="text-gray-600">No medical info available</PS2PText>
      </View>
    )
  }

  return (
    <View className="p-6">
      <PS2PText className="font-bold text-lg mb-2">Medical Information</PS2PText>
      <PS2PText className="mb-1">Allergies: {info.allergies}</PS2PText>
      <PS2PText className="mb-1">Blood Type: {info.bloodType}</PS2PText>
      <PS2PText className="mb-1">Conditions: {info.conditions}</PS2PText>
      <PS2PText className="mb-1">Emergency Contact: {info.emergencyContactName} — {info.emergencyContactPhone}</PS2PText>
    </View>
  )
}

export default ParamedicView
