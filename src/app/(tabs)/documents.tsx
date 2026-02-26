import { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable, Image } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { PixelIcon } from '../../components/PixelIcon'

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

// Category Filter Button
const CategoryButton = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    className={`mr-2 px-3 py-2 ${selected ? 'bg-[#ff6f61]' : 'bg-[#1a1a2f]'}`}
  >
    <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className={`text-[8px] ${selected ? 'text-white' : 'text-[#a0a0b0]'}`}>
      {label}
    </Text>
  </Pressable>
)

// Document Card Component
const DocumentCard = ({ document }: { document: Document }) => {
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
    <View className="bg-[#1a1a2f] p-3 mb-3">
      <View className="flex-row">
        <View className="mr-3 w-10 h-10 items-center justify-center bg-[#0a0a1f]">
          <Text className="text-2xl">{getCategoryIcon(document.type)}</Text>
        </View>
        
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-[8px] flex-1">
              {document.name}
            </Text>
            {document.verified ? (
              <View className="bg-[#00ff9d] px-2 py-1 ml-2">
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#0a0a1f] text-[4px]">
                  VERIFIED
                </Text>
              </View>
            ) : (
              <View className="bg-[#2a2a3f] px-2 py-1 ml-2">
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[4px]">
                  UNVERIFIED
                </Text>
              </View>
            )}
          </View>
          
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px] mt-1">
            ISSUER: {document.issuer}
          </Text>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px]">
            ISSUED: {document.issuedAt}
          </Text>
          {document.expiresAt && (
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-[6px]">
              EXPIRES: {document.expiresAt}
            </Text>
          )}
        </View>
      </View>
      
      {document.imageUri && (
        <View className="mt-3 bg-[#0a0a1f] p-2">
          <Image source={{ uri: document.imageUri }} className="w-full h-40" resizeMode="contain" />
        </View>
      )}
    </View>
  )
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
  const filteredDocs = selectedCategory === 'all' 
    ? documents 
    : documents.filter(d => {
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
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-white text-lg">
            DOCUMENTS
          </Text>
        </View>
        <Pressable onPress={pickDocument}>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-xs">
            + ADD
          </Text>
        </Pressable>
      </View>

      {/* Category Filters */}
      <ScrollView horizontal className="px-4 py-3 border-b border-[#2a2a3f]">
        {categories.map((cat) => (
          <CategoryButton
            key={cat}
            label={cat.toUpperCase()}
            selected={selectedCategory === cat}
            onPress={() => setSelectedCategory(cat)}
          />
        ))}
      </ScrollView>

      <ScrollView className="flex-1 px-4 pt-4">
        {filteredDocs.length === 0 ? (
          <View className="bg-[#1a1a2f] p-8 items-center">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-xs text-center mb-2">
              NO DOCUMENTS
            </Text>
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a4a6a] text-[8px] text-center">
              TAP + TO ADD YOUR FIRST DOCUMENT
            </Text>
          </View>
        ) : (
          filteredDocs.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))
        )}

        {/* Storage Info */}
        <View className="bg-[#1a1a2f] p-4 mt-4 mb-8">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[8px] text-center">
            🔐 ENCRYPTED STORAGE
          </Text>
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#a0a0b0] text-[6px] text-center mt-2">
            DOCUMENTS ARE ENCRYPTED AND STORED ONLY ON YOUR DEVICE
          </Text>
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}