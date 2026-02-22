import React from 'react'
import { View, Text } from 'react-native'
import { MedicalInfo } from '../types'

type Props = {
  info?: MedicalInfo | null
}

export function ParamedicView({ info }: Props) {
  if (!info) {
    return (
      <View className="p-6">
        <Text className="text-gray-600">No medical info available</Text>
      </View>
    )
  }

  return (
    <View className="p-6">
      <Text className="font-bold text-lg mb-2">Medical Information</Text>
      <Text className="mb-1">Allergies: {info.allergies}</Text>
      <Text className="mb-1">Blood Type: {info.bloodType}</Text>
      <Text className="mb-1">Conditions: {info.conditions}</Text>
      <Text className="mb-1">Emergency Contact: {info.emergencyContactName} — {info.emergencyContactPhone}</Text>
    </View>
  )
}

export default ParamedicView
