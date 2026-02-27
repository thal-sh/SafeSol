import { useState, useEffect } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { Header } from '../components/Header'
import { PixelIcon } from '../components/PixelIcon'
import { PS2PText } from '../components/PS2PText'
import PS2PTextInput from '../components/PS2PTextInput'

type Contact = {
  name: string
  phone: string
  relationship: string
}

type MedicalInfo = {
  allergies: string
  bloodType: string
  conditions: Array<{ name: string; severity: string }>
  emergencyContacts: Contact[]
  lastUpdated?: number
}

export default function EmergencyContactsScreen() {
  const { account } = useMobileWallet()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newContact, setNewContact] = useState<Contact>({ name: '', phone: '', relationship: '' })

  useEffect(() => {
    if (account) {
      loadContacts()
    }
  }, [account])

  const loadContacts = async () => {
    if (!account) return
    try {
      const encrypted = await AsyncStorage.getItem(`medical_${account.address.toString()}`)
      if (encrypted) {
        const decoded = atob(encrypted)
        const data: MedicalInfo = JSON.parse(decoded)
        setContacts(data.emergencyContacts || [])
      }
    } catch (error) {
      console.log('Error loading contacts')
    }
  }

  const saveMedicalData = async (updatedContacts: Contact[]) => {
    if (!account) return
    try {
      const encrypted = await AsyncStorage.getItem(`medical_${account.address.toString()}`)
      let medicalData: MedicalInfo = {
        allergies: '',
        bloodType: '',
        conditions: [],
        emergencyContacts: updatedContacts,
        lastUpdated: Date.now()
      }
      
      if (encrypted) {
        const decoded = atob(encrypted)
        medicalData = { ...JSON.parse(decoded), emergencyContacts: updatedContacts, lastUpdated: Date.now() }
      }

      const jsonString = JSON.stringify(medicalData)
      const encrypted_new = btoa(jsonString)
      await AsyncStorage.setItem(`medical_${account.address.toString()}`, encrypted_new)
    } catch (error) {
      console.error('Error saving contacts:', error)
    }
  }

  const validateContact = (contact: Contact): boolean => {
    if (!contact.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'NAME REQUIRED',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    if (!contact.phone.trim()) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'PHONE REQUIRED',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,3}[-\s\.]?[0-9]{4,6}$/
    if (!phoneRegex.test(contact.phone)) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'INVALID PHONE FORMAT',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    return true
  }

  const addContact = async () => {
    if (!validateContact(newContact)) return
    
    setIsLoading(true)
    try {
      const updated = [...contacts, newContact]
      await saveMedicalData(updated)
      setContacts(updated)
      setNewContact({ name: '', phone: '', relationship: '' })
      Toast.show({
        type: 'success',
        text1: 'SUCCESS',
        text2: 'CONTACT ADDED',
        position: 'top',
        visibilityTime: 2000,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FAILED TO ADD CONTACT',
        position: 'top',
        visibilityTime: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateContact = async () => {
    if (editingIndex === null) return
    if (!validateContact(newContact)) return
    
    setIsLoading(true)
    try {
      const updated = [...contacts]
      updated[editingIndex] = newContact
      await saveMedicalData(updated)
      setContacts(updated)
      setEditingIndex(null)
      setNewContact({ name: '', phone: '', relationship: '' })
      Toast.show({
        type: 'success',
        text1: 'SUCCESS',
        text2: 'CONTACT UPDATED',
        position: 'top',
        visibilityTime: 2000,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FAILED TO UPDATE CONTACT',
        position: 'top',
        visibilityTime: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteContact = async (index: number) => {
    if (contacts.length <= 1) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'KEEP AT LEAST ONE CONTACT',
        position: 'top',
        visibilityTime: 2000,
      })
      return
    }

    setIsLoading(true)
    try {
      const updated = contacts.filter((_, i) => i !== index)
      await saveMedicalData(updated)
      setContacts(updated)
      Toast.show({
        type: 'success',
        text1: 'SUCCESS',
        text2: 'CONTACT REMOVED',
        position: 'top',
        visibilityTime: 2000,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FAILED TO REMOVE CONTACT',
        position: 'top',
        visibilityTime: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!account) {
    return (
      <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1 items-center justify-center">
        <PS2PText className="text-white text-xs">CONNECT WALLET</PS2PText>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1">
      <Header address={account.address.toString()} />
      
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <View className="mr-2">
              <PixelIcon name="health" color="#ff6f61" size={24} />
            </View>
            <PS2PText className="text-white text-lg">
              EMERGENCY CONTACTS
            </PS2PText>
          </View>
          <PS2PText className="text-[#a0a0b0] text-[8px]">
            QUICK ACCESS IN EMERGENCIES
          </PS2PText>
        </View>

        {/* Form to add/edit contact */}
        <View className="bg-[#1a1a2f] p-4 mb-6 border border-[#2a2a3f]">
          <PS2PText className="text-white text-xs mb-3">
            {editingIndex !== null ? 'EDIT CONTACT' : 'ADD NEW CONTACT'}
          </PS2PText>

          <View className="mb-3">
            <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">NAME *</PS2PText>
            <View className="bg-[#0a0a1f]">
              <PS2PTextInput
                className="p-3 text-white text-xs"
                placeholder="FULL NAME"
                placeholderTextColor="#4a4a6a"
                value={newContact.name}
                onChangeText={(text) => setNewContact({...newContact, name: text})}
              />
            </View>
          </View>

          <View className="mb-3">
            <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">PHONE *</PS2PText>
            <View className="bg-[#0a0a1f]">
              <PS2PTextInput
                className="p-3 text-white text-xs"
                placeholder="+1 555 123 4567"
                placeholderTextColor="#4a4a6a"
                value={newContact.phone}
                onChangeText={(text) => setNewContact({...newContact, phone: text})}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View className="mb-4">
            <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">RELATIONSHIP</PS2PText>
            <View className="bg-[#0a0a1f]">
              <PS2PTextInput
                className="p-3 text-white text-xs"
                placeholder="MOTHER, SPOUSE, ETC"
                placeholderTextColor="#4a4a6a"
                value={newContact.relationship}
                onChangeText={(text) => setNewContact({...newContact, relationship: text})}
              />
            </View>
          </View>

          <Pressable 
            onPress={editingIndex !== null ? updateContact : addContact}
            disabled={isLoading}
            className="bg-[#00ff9d]"
          >
            <PS2PText className="text-[#0a0a1f] text-xs text-center p-3 font-bold">
              {isLoading ? 'SAVING...' : editingIndex !== null ? 'UPDATE CONTACT' : 'ADD CONTACT'}
            </PS2PText>
          </Pressable>

          {editingIndex !== null && (
            <Pressable 
              onPress={() => {
                setEditingIndex(null)
                setNewContact({ name: '', phone: '', relationship: '' })
              }}
              className="bg-[#2a2a3f] mt-2"
            >
              <PS2PText className="text-white text-xs text-center p-3">
                CANCEL
              </PS2PText>
            </Pressable>
          )}
        </View>

        {/* Contacts List */}
        <PS2PText className="text-white text-xs mb-3">
          YOUR CONTACTS ({contacts.length})
        </PS2PText>

        {contacts.length === 0 ? (
          <View className="bg-[#1a1a2f] p-4 mb-8 border border-[#2a2a3f]">
            <PS2PText className="text-[#a0a0b0] text-[8px] text-center">
              NO EMERGENCY CONTACTS YET
            </PS2PText>
          </View>
        ) : (
          contacts.map((contact, index) => (
            <View key={index} className="bg-[#1a1a2f] p-4 mb-3 border border-[#2a2a3f]">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <PS2PText className="text-white text-xs">
                    {contact.name.toUpperCase()}
                  </PS2PText>
                  <PS2PText className="text-[#00ff9d] text-[7px] mt-1">
                    {contact.relationship.toUpperCase()}
                  </PS2PText>
                </View>
                <Pressable onPress={() => {
                  setEditingIndex(index)
                  setNewContact(contact)
                }}>
                  <PS2PText className="text-[#ffb86b] text-[7px]">
                    EDIT
                  </PS2PText>
                </Pressable>
              </View>
              
              <PS2PText className="text-[#a0a0b0] text-[7px] mb-2">
                📞 {contact.phone}
              </PS2PText>

              <Pressable 
                onPress={() => deleteContact(index)}
                className="bg-[#ff6f61] opacity-70"
              >
                <PS2PText className="text-white text-[7px] text-center p-2">
                  DELETE
                </PS2PText>
              </Pressable>
            </View>
          ))
        )}

        <View className="h-8" />
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}
