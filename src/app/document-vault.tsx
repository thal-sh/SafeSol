import { useState, useEffect } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { router, useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { Header } from '../components/Header'
import { PixelIcon } from '../components/PixelIcon'
import { PS2PText } from '../components/PS2PText'
import PS2PTextInput from '../components/PS2PTextInput'
import { useCallback } from 'react'

type Document = {
  id: string
  type: 'passport' | 'drivers_license' | 'birth_certificate' | 'diploma' | 'contract' | 'other'
  name: string
  issuer: string
  issuedAt: string
  expiresAt?: string
  fileUri?: string
  uploadedAt: number
  shared: boolean
}

const DOCUMENT_TYPES = [
  { id: 'passport', label: 'Passport', emoji: '🛂' },
  { id: 'drivers_license', label: 'Driver License', emoji: '🎫' },
  { id: 'birth_certificate', label: 'Birth Certificate', emoji: '👶' },
  { id: 'diploma', label: 'Diploma/Certificate', emoji: '🎓' },
  { id: 'contract', label: 'Contract', emoji: '📄' },
  { id: 'other', label: 'Other', emoji: '📋' }
]

export default function DocumentVaultScreen() {
  const { account } = useMobileWallet()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newDocument, setNewDocument] = useState<Partial<Document>>({
    type: 'passport',
    name: '',
    issuer: '',
    issuedAt: '',
    expiresAt: '',
    shared: false
  })

  const loadDocuments = useCallback(async () => {
    if (!account) return
    try {
      const data = await AsyncStorage.getItem(`documents_vault_${account.address.toString()}`)
      if (data) {
        setDocuments(JSON.parse(data).sort((a: Document, b: Document) => b.uploadedAt - a.uploadedAt))
      }
    } catch (error) {
      console.log('Error loading documents')
    }
  }, [account])

  useEffect(() => {
    loadDocuments()
  }, [account, loadDocuments])

  useFocusEffect(
    useCallback(() => {
      loadDocuments()
    }, [loadDocuments])
  )

  const validateDocument = (): boolean => {
    if (!newDocument.name?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'DOCUMENT NAME REQUIRED',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    if (!newDocument.issuer?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'ISSUER REQUIRED',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    if (!newDocument.issuedAt?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'ISSUE DATE REQUIRED (MM/DD/YYYY)',
        position: 'top',
        visibilityTime: 2000,
      })
      return false
    }
    return true
  }

  const addDocument = async () => {
    if (!account || !validateDocument()) return

    try {
      const document: Document = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: (newDocument.type as Document['type']) || 'other',
        name: newDocument.name!,
        issuer: newDocument.issuer!,
        issuedAt: newDocument.issuedAt!,
        expiresAt: newDocument.expiresAt || undefined,
        uploadedAt: Date.now(),
        shared: false
      }

      const key = `documents_vault_${account.address.toString()}`
      const existing = await AsyncStorage.getItem(key)
      const allDocs: Document[] = existing ? JSON.parse(existing) : []
      allDocs.push(document)
      await AsyncStorage.setItem(key, JSON.stringify(allDocs))

      setDocuments(allDocs.sort((a, b) => b.uploadedAt - a.uploadedAt))
      
      setIsAddingNew(false)
      setNewDocument({
        type: 'passport',
        name: '',
        issuer: '',
        issuedAt: '',
        expiresAt: '',
        shared: false
      })

      Toast.show({
        type: 'success',
        text1: 'SUCCESS',
        text2: 'DOCUMENT ADDED',
        position: 'top',
        visibilityTime: 2000,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FAILED TO ADD DOCUMENT',
        position: 'top',
        visibilityTime: 2000,
      })
    }
  }

  const deleteDocument = async (docId: string) => {
    if (!account) return

    try {
      const key = `documents_vault_${account.address.toString()}`
      const existing = await AsyncStorage.getItem(key)
      if (!existing) return
      
      let allDocs: Document[] = JSON.parse(existing)
      allDocs = allDocs.filter(d => d.id !== docId)
      await AsyncStorage.setItem(key, JSON.stringify(allDocs))

      setDocuments(allDocs.sort((a, b) => b.uploadedAt - a.uploadedAt))

      Toast.show({
        type: 'success',
        text1: 'SUCCESS',
        text2: 'DOCUMENT DELETED',
        position: 'top',
        visibilityTime: 2000,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: 'FAILED TO DELETE',
        position: 'top',
        visibilityTime: 2000,
      })
    }
  }

  const getTypeInfo = (type: string): { label: string; emoji: string } | undefined => {
    return DOCUMENT_TYPES.find(t => t.id === type)
  }

  const isExpired = (expiresAt?: string): boolean => {
    if (!expiresAt) return false
    const expDate = new Date(expiresAt)
    return expDate < new Date()
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
              <PixelIcon name="document" color="#8a2be2" size={24} />
            </View>
            <PS2PText className="text-white text-lg">
              DOCUMENT VAULT
            </PS2PText>
          </View>
          <PS2PText className="text-[#a0a0b0] text-[8px]">
            SECURE STORAGE FOR YOUR DOCUMENTS
          </PS2PText>
        </View>

        {/* Add New Document Form */}
        {!isAddingNew ? (
          <Pressable
            onPress={() => setIsAddingNew(true)}
            className="bg-[#8a2be2] p-4 mb-6"
          >
            <PS2PText className="text-white text-xs text-center font-bold">
              + ADD DOCUMENT
            </PS2PText>
          </Pressable>
        ) : (
          <View className="bg-[#1a1a2f] p-4 mb-6 border border-[#2a2a3f]">
            <PS2PText className="text-white text-xs mb-3">ADD NEW DOCUMENT</PS2PText>

            <View className="mb-3">
              <PS2PText className="text-[#a0a0b0] text-[6px] mb-2">DOCUMENT TYPE</PS2PText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {DOCUMENT_TYPES.map((type) => (
                  <Pressable
                    key={type.id}
                    onPress={() => setNewDocument({...newDocument, type: type.id as Document['type']})}
                    className={`mr-2 px-3 py-2 border ${
                      newDocument.type === type.id
                        ? 'border-[#8a2be2] bg-[#8a2be2]'
                        : 'border-[#2a2a3f] bg-transparent'
                    }`}
                  >
                    <PS2PText className={`text-[7px] ${
                      newDocument.type === type.id ? 'text-white' : 'text-[#a0a0b0]'
                    }`}>
                      {type.emoji} {type.label.toUpperCase()}
                    </PS2PText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View className="mb-3">
              <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">DOCUMENT NAME *</PS2PText>
              <View className="bg-[#0a0a1f]">
                <PS2PTextInput
                  className="p-3 text-white text-xs"
                  placeholder="MY PASSPORT"
                  placeholderTextColor="#4a4a6a"
                  value={newDocument.name || ''}
                  onChangeText={(text) => setNewDocument({...newDocument, name: text})}
                />
              </View>
            </View>

            <View className="mb-3">
              <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">ISSUER *</PS2PText>
              <View className="bg-[#0a0a1f]">
                <PS2PTextInput
                  className="p-3 text-white text-xs"
                  placeholder="GOVERNMENT AGENCY, UNIVERSITY, ETC"
                  placeholderTextColor="#4a4a6a"
                  value={newDocument.issuer || ''}
                  onChangeText={(text) => setNewDocument({...newDocument, issuer: text})}
                />
              </View>
            </View>

            <View className="flex-row gap-2 mb-3">
              <View className="flex-1">
                <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">ISSUED DATE *</PS2PText>
                <View className="bg-[#0a0a1f]">
                  <PS2PTextInput
                    className="p-3 text-white text-xs"
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor="#4a4a6a"
                    value={newDocument.issuedAt || ''}
                    onChangeText={(text) => setNewDocument({...newDocument, issuedAt: text})}
                  />
                </View>
              </View>
              <View className="flex-1">
                <PS2PText className="text-[#a0a0b0] text-[6px] mb-1">EXPIRES</PS2PText>
                <View className="bg-[#0a0a1f]">
                  <PS2PTextInput
                    className="p-3 text-white text-xs"
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor="#4a4a6a"
                    value={newDocument.expiresAt || ''}
                    onChangeText={(text) => setNewDocument({...newDocument, expiresAt: text})}
                  />
                </View>
              </View>
            </View>

            <View className="flex-row gap-2">
              <Pressable
                onPress={addDocument}
                className="flex-1 bg-[#8a2be2]"
              >
                <PS2PText className="text-white text-xs text-center p-3 font-bold">
                  ADD DOCUMENT
                </PS2PText>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsAddingNew(false)
                  setNewDocument({
                    type: 'passport',
                    name: '',
                    issuer: '',
                    issuedAt: '',
                    expiresAt: '',
                    shared: false
                  })
                }}
                className="flex-1 bg-[#2a2a3f]"
              >
                <PS2PText className="text-white text-xs text-center p-3">
                  CANCEL
                </PS2PText>
              </Pressable>
            </View>
          </View>
        )}

        {/* Documents Grid */}
        <PS2PText className="text-white text-xs mb-3">
          DOCUMENTS ({documents.length})
        </PS2PText>

        {documents.length === 0 ? (
          <View className="bg-[#1a1a2f] p-6 mb-8 border border-[#2a2a3f]">
            <PS2PText className="text-[#a0a0b0] text-[8px] text-center">
              NO DOCUMENTS YET
            </PS2PText>
            <PS2PText className="text-[#4a4a6a] text-[6px] text-center mt-2">
              START BUILDING YOUR DOCUMENT VAULT
            </PS2PText>
          </View>
        ) : (
          documents.map((doc) => {
            const typeInfo = getTypeInfo(doc.type)
            const expired = isExpired(doc.expiresAt)
            
            return (
              <View key={doc.id} className={`bg-[#1a1a2f] p-4 mb-3 border ${expired ? 'border-[#ff6f61]' : 'border-[#2a2a3f]'}`}>
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <PS2PText className="text-2xl mb-1">
                      {typeInfo?.emoji}
                    </PS2PText>
                    <PS2PText className="text-white text-xs font-bold">
                      {doc.name.toUpperCase()}
                    </PS2PText>
                  </View>
                  {expired && (
                    <PS2PText className="text-[#ff6f61] text-[7px]">
                      ⚠️ EXPIRED
                    </PS2PText>
                  )}
                </View>

                <PS2PText className="text-[#a0a0b0] text-[7px] mb-2">
                  {typeInfo?.label.toUpperCase()} • {doc.issuer.toUpperCase()}
                </PS2PText>

                <View className="bg-[#0a0a1f] p-2 mb-3 border border-[#2a2a3f]">
                  <PS2PText className="text-[#8a2be2] text-[6px]">
                    ISSUED: {doc.issuedAt}
                  </PS2PText>
                  {doc.expiresAt && (
                    <PS2PText className={`text-[6px] mt-1 ${expired ? 'text-[#ff6f61]' : 'text-[#a0a0b0]'}`}>
                      EXPIRES: {doc.expiresAt}
                    </PS2PText>
                  )}
                </View>

                <View className="flex-row gap-2">
                  <Pressable className="flex-1 bg-[#2a2a3f]">
                    <PS2PText className="text-[#a0a0b0] text-[7px] text-center p-2">
                      🔗 SHARE
                    </PS2PText>
                  </Pressable>
                  <Pressable
                    onPress={() => deleteDocument(doc.id)}
                    className="flex-1 bg-[#ff6f61] opacity-70"
                  >
                    <PS2PText className="text-white text-[7px] text-center p-2">
                      🗑️ DELETE
                    </PS2PText>
                  </Pressable>
                </View>
              </View>
            )
          })
        )}

        <View className="h-8" />
      </ScrollView>

      <StatusBar style="light" />
    </LinearGradient>
  )
}
