import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { storage } from '../utils/storage'
import { colors } from '../constants/colors'
import { MedicalInfo } from '../types'

export default function Medical() {
  const { account } = useMobileWallet()
  const [form, setForm] = useState<MedicalInfo>({
    allergies: '',
    bloodType: '',
    conditions: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  })

  useEffect(() => {
    if (account) {
      load()
    }
  }, [account])

  const load = async () => {
    const data = await storage.getMedical(account.address.toString())
    if (data) setForm(data)
  }

  const save = async () => {
    await storage.saveMedical(account.address.toString(), form)
    // navigate back or show success
  }

  return (
    <View className={`flex-1 ${colors.primary.bg} px-6 pt-12`}>
      <Text className={`text-2xl font-bold ${colors.primary.text} mb-4`}>Medical Information</Text>

      <Text className={`${colors.primary.subtext} mb-1`}>Allergies</Text>
      <TextInput value={form.allergies} onChangeText={(t) => setForm({ ...form, allergies: t })} className="border p-3 mb-3 rounded" />

      <Text className={`${colors.primary.subtext} mb-1`}>Blood Type</Text>
      <TextInput value={form.bloodType} onChangeText={(t) => setForm({ ...form, bloodType: t })} className="border p-3 mb-3 rounded" />

      <Text className={`${colors.primary.subtext} mb-1`}>Conditions</Text>
      <TextInput value={form.conditions} onChangeText={(t) => setForm({ ...form, conditions: t })} className="border p-3 mb-3 rounded" />

      <Text className={`${colors.primary.subtext} mb-1`}>Emergency Contact Name</Text>
      <TextInput value={form.emergencyContactName} onChangeText={(t) => setForm({ ...form, emergencyContactName: t })} className="border p-3 mb-3 rounded" />

      <Text className={`${colors.primary.subtext} mb-1`}>Emergency Contact Phone</Text>
      <TextInput value={form.emergencyContactPhone} onChangeText={(t) => setForm({ ...form, emergencyContactPhone: t })} className="border p-3 mb-6 rounded" />

      <Pressable onPress={save} className="bg-blue-600 px-6 py-3 rounded-xl">
        <Text className="text-white font-bold">Save</Text>
      </Pressable>
    </View>
  )
}
