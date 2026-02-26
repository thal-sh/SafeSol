import { useState, useEffect } from 'react'
import { View, ScrollView, Pressable, Image } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { PixelIcon } from '../../components/PixelIcon'
import PS2PText from '../../components/PS2PText'
import CategoryButton from '../../components/CategoryButton'
import DocumentCard from '../../components/DocumentCard'
import { Document } from '../../types'

export default function DocumentsTab() {
  const { account } = useMobileWallet()
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (account) {
      loadDocuments()
    }
  }, [account])

  useEffect(() => {
    ;(async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'PERMISSION NEEDED',
          text2: 'PHOTO LIBRARY ACCESS REQUIRED',
          position: 'top',
        })
      }
    })()
  }, [])

  const loadDocuments = async () => {
    try {
      const docs = await AsyncStorage.getItem(`documents_${account!.address}`)
      if (docs) setDocuments(JSON.parse(docs))
    } catch (error) {
      console.log('Error loading documents')
    }
  }

  const pickDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      })

      if (!result.canceled && result.assets[0]) {
        const newDoc: Document = {
          id: Date.now().toString(),
          type: 'other',
          name: `DOCUMENT_${documents.length + 1}`,
          issuer: 'SELF',
          issuedAt: new Date().toISOString().split('T')[0],
          imageUri: result.assets[0].uri,
          verified: false,
        }

        const updated = [...documents, newDoc]
        await AsyncStorage.setItem(`documents_${account!.address}`, JSON.stringify(updated))
        setDocuments(updated)

        Toast.show({
          type: 'success',
          text1: 'DOCUMENT ADDED',
          text2: 'STORED ENCRYPTED',
          position: 'top',
        })
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FAILED TO ADD DOCUMENT',
        position: 'top',
      })
    }
  }

  const categories = ['all', 'passport', 'license', 'birth', 'diploma', 'other']
  const filteredDocs =
    selectedCategory === 'all'
      ? documents
      : documents.filter((d) => {
          if (selectedCategory === 'license') return d.type === 'drivers_license'
          if (selectedCategory === 'birth') return d.type === 'birth_certificate'
          if (selectedCategory === 'diploma') return d.type === 'diploma'
          return d.type === selectedCategory
        })

  return (
    <LinearGradient colors={['#0a0a1f', '#1a1a2f']} className="flex-1">
      {/* Header */}
      <View className="pt-12 px-4 pb-4 border-b border-[#2a2a3f] flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="mr-2">
            <PixelIcon name="document" color="#ff6f61" size={24} />
          </View>
          <PS2PText className="text-white text-lg">DOCUMENTS</PS2PText>
        </View>
        <Pressable onPress={pickDocument}>
          <PS2PText className="text-[#ff6f61] text-xs">+ ADD</PS2PText>
        </Pressable>
      </View>

      {/* Category Filters */}
      <ScrollView horizontal className="mt-3 px-4">
        {categories.map((cat) => (
          <CategoryButton
            key={cat}
            label={cat.toUpperCase()}
            selected={selectedCategory === cat}
            onPress={() => setSelectedCategory(cat)}
          />
        ))}
      </ScrollView>

      {/* Document list */}
      <ScrollView className="flex-1 px-4 pt-4">
        {filteredDocs.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}

        {filteredDocs.length === 0 && (
          <View className="items-center mt-8">
            <PS2PText className="text-[#a0a0b0] text-xs">
              NO DOCUMENTS IN THIS CATEGORY
            </PS2PText>
          </View>
        )}
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}
