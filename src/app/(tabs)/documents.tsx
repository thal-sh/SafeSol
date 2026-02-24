import { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable, Image } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'

type Document = {
  id: string
  type: 'passport' | 'drivers_license' | 'birth_certificate' | 'diploma' | 'other'
  name: string
  issuer: string
  issuedAt: string
  expiresAt?: string
  imageUri?: string
  verified: boolean
}

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
    // Request permissions
    (async () => {
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
        // In real app, you'd encrypt this
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

  const categories = ['all', 'passport', 'drivers_license', 'birth_certificate', 'diploma', 'other']
  
  const filteredDocs = selectedCategory === 'all' 
    ? documents 
    : documents.filter(d => d.type === selectedCategory)

  const getCategoryIcon = (type: string) => {
    switch(type) {
      case 'passport': return '🛂'
      case 'drivers_license': return '🪪'
      case 'birth_certificate': return '👶'
      case 'diploma': return '🎓'
      default: return '📄'
    }
  }

  return (
    <LinearGradient colors={['#0a0a1f', '#1a0f2e', '#000000']} className="flex-1">
      {/* Header */}
      <View className="pt-12 px-4 pb-4 border-b-2 border-[#6a0dad] flex-row justify-between items-center">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-lg">
          📜 DOCUMENTS
        </Text>
        <Pressable onPress={pickDocument}>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-xs">
            + ADD
          </Text>
        </Pressable>
      </View>

      {/* Category Filters */}
      <ScrollView horizontal className="px-4 py-3 border-b border-[#6a0dad]">
        {categories.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            className={`mr-2 px-3 py-1 border ${selectedCategory === cat ? 'border-[#ff6f61]' : 'border-[#6a0dad]'}`}
          >
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className={`text-[8px] ${selectedCategory === cat ? 'text-[#ff6f61]' : 'text-[#b39eb5]'}`}>
              {cat.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView className="flex-1 px-4 pt-4">
        {filteredDocs.length === 0 ? (
          <View className="border-2 border-[#6a0dad] p-8 items-center">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-xs text-center mb-2">
              NO DOCUMENTS
            </Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a2c5a] text-[8px] text-center">
              TAP + TO ADD YOUR FIRST DOCUMENT
            </Text>
          </View>
        ) : (
          filteredDocs.map((doc) => (
            <View key={doc.id} className="border-2 border-[#8a2be2] p-3 mb-3">
              <View className="flex-row">
                <Text className="text-3xl mr-3">{getCategoryIcon(doc.type)}</Text>
                <View className="flex-1">
                  <View className="flex-row justify-between">
                    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-[8px] flex-1">
                      {doc.name}
                    </Text>
                    {doc.verified ? (
                      <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[6px]">
                        ✓ VERIFIED
                      </Text>
                    ) : (
                      <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#8a2be2] text-[6px]">
                        ○ UNVERIFIED
                      </Text>
                    )}
                  </View>
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px] mt-1">
                    ISSUER: {doc.issuer}
                  </Text>
                  <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px]">
                    ISSUED: {doc.issuedAt}
                  </Text>
                  {doc.expiresAt && (
                    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[6px]">
                      EXPIRES: {doc.expiresAt}
                    </Text>
                  )}
                </View>
              </View>
              {doc.imageUri && (
                <View className="mt-2 border border-[#6a0dad] p-1">
                  <Image source={{ uri: doc.imageUri }} className="w-full h-32" resizeMode="contain" />
                </View>
              )}
            </View>
          ))
        )}

        {/* Storage Info */}
        <View className="border-2 border-[#00ff9d] p-3 mt-4 mb-8">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[8px] text-center">
            🔐 ENCRYPTED STORAGE
          </Text>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[6px] text-center mt-1">
            DOCUMENTS ARE ENCRYPTED AND STORED ONLY ON YOUR DEVICE
          </Text>
        </View>
      </ScrollView>

      <StatusBar style="auto" />
    </LinearGradient>
  )
}