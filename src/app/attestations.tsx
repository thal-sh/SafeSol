import { useState, useEffect } from 'react'
import { Text, View, ScrollView, Pressable, TextInput } from 'react-native'
import { router } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { Header } from '../components/Header'
import { PixelIcon } from '../components/PixelIcon'
import { Attestation, AttestationType } from '../types'

export default function AttestationsScreen() {
  const { account } = useMobileWallet()
  const [activeTab, setActiveTab] = useState<'received' | 'issued'>('received')
  const [attestations, setAttestations] = useState<Attestation[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [issueForm, setIssueForm] = useState({
    subjectWallet: '',
    type: 'employment' as AttestationType,
    predicate: '',
  })

  useEffect(() => {
    if (account) {
      loadData()
    }
  }, [account])

  const loadData = async () => {
    if (!account) return
    
    // Load attestations about me (received)
    const received = await AsyncStorage.getItem(`attestations_received_${account.address}`)
    if (received) setAttestations(JSON.parse(received))

    // Load attestations I've issued (as employer/landlord)
    const issued = await AsyncStorage.getItem(`attestations_issued_${account.address}`)
    if (issued) setPendingRequests(JSON.parse(issued))
  }

  const issueAttestation = async () => {
    if (!account) return

    const newAttestation: Attestation = {
      id: Date.now().toString(),
      type: issueForm.type,
      issuer: {
        name: account.address.slice(0, 8) + '...',
        wallet: account.address,
        trusted: true,
      },
      subject: issueForm.subjectWallet,
      predicate: issueForm.predicate,
      value: true,
      issuedAt: Date.now(),
    }

    // Save to my issued list
    const issued = await AsyncStorage.getItem(`attestations_issued_${account.address}`)
    const issuedList = issued ? JSON.parse(issued) : []
    issuedList.push(newAttestation)
    await AsyncStorage.setItem(`attestations_issued_${account.address}`, JSON.stringify(issuedList))

    // Add to recipient's received list
    const received = await AsyncStorage.getItem(`attestations_received_${issueForm.subjectWallet}`)
    const receivedList = received ? JSON.parse(received) : []
    receivedList.push(newAttestation)
    await AsyncStorage.setItem(`attestations_received_${issueForm.subjectWallet}`, JSON.stringify(receivedList))

    Toast.show({
      type: 'success',
      text1: 'ATTESTATION ISSUED',
      text2: `${issueForm.type.toUpperCase()} proof added for wallet`,
      position: 'top',
    })

    setShowIssueForm(false)
    setIssueForm({ subjectWallet: '', type: 'employment', predicate: '' })
    loadData()
  }

  const verifyAttestation = (attestation: Attestation) => {
    // In a real app, this would verify cryptographic signatures
    // For demo, we just show the proof
    Toast.show({
      type: 'info',
      text1: 'VERIFICATION',
      text2: `${attestation.predicate} - VERIFIED`,
      position: 'top',
    })
  }

  if (!account) {
    return (
      <LinearGradient colors={['#0a0a1f', '#1a0f2e', '#000000']} className="flex-1 items-center justify-center">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3]">CONNECT WALLET</Text>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#0a0a1f', '#1a0f2e', '#000000']} className="flex-1">
      <Header address={account.address} />
      
      <View className="flex-1 px-4 pt-4">
        {/* Tabs */}
        <View className="flex-row mb-4">
          <Pressable 
            onPress={() => setActiveTab('received')}
            className={`flex-1 py-2 border-b-2 ${activeTab === 'received' ? 'border-[#ff6f61]' : 'border-[#6a0dad]'}`}
          >
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className={`text-center text-xs ${activeTab === 'received' ? 'text-[#ff6f61]' : 'text-[#b39eb5]'}`}>
              RECEIVED
            </Text>
          </Pressable>
          <Pressable 
            onPress={() => setActiveTab('issued')}
            className={`flex-1 py-2 border-b-2 ${activeTab === 'issued' ? 'border-[#ff6f61]' : 'border-[#6a0dad]'}`}
          >
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className={`text-center text-xs ${activeTab === 'issued' ? 'text-[#ff6f61]' : 'text-[#b39eb5]'}`}>
              ISSUED
            </Text>
          </Pressable>
        </View>

        {activeTab === 'issued' && (
          <Pressable 
            onPress={() => setShowIssueForm(true)}
            className="border-2 border-[#00ff9d] p-3 mb-4 flex-row items-center justify-center"
          >
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-xs mr-2">
              + ISSUE NEW
            </Text>
          </Pressable>
        )}

        {showIssueForm && (
          <View className="border-2 border-[#6a0dad] p-4 mb-4">
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-xs mb-3">
              ISSUE ATTESTATION
            </Text>
            
            <TextInput
              className="border border-[#6a0dad] p-3 mb-3 text-[#ffd9b3] text-xs"
              placeholder="SUBJECT WALLET ADDRESS"
              placeholderTextColor="#4a2c5a"
              value={issueForm.subjectWallet}
              onChangeText={(text) => setIssueForm({...issueForm, subjectWallet: text})}
              style={{ fontFamily: 'PressStart2P_400Regular' }}
            />

            <View className="flex-row mb-3">
              <Pressable 
                onPress={() => setIssueForm({...issueForm, type: 'employment'})}
                className={`flex-1 p-2 border ${issueForm.type === 'employment' ? 'border-[#ff6f61] bg-[#ff6f61]/20' : 'border-[#6a0dad]'} mr-1`}
              >
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className={`text-center text-[8px] ${issueForm.type === 'employment' ? 'text-[#ff6f61]' : 'text-[#b39eb5]'}`}>
                  EMPLOYMENT
                </Text>
              </Pressable>
              <Pressable 
                onPress={() => setIssueForm({...issueForm, type: 'rental'})}
                className={`flex-1 p-2 border ${issueForm.type === 'rental' ? 'border-[#ff6f61] bg-[#ff6f61]/20' : 'border-[#6a0dad]'} mx-1`}
              >
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className={`text-center text-[8px] ${issueForm.type === 'rental' ? 'text-[#ff6f61]' : 'text-[#b39eb5]'}`}>
                  RENTAL
                </Text>
              </Pressable>
              <Pressable 
                onPress={() => setIssueForm({...issueForm, type: 'income'})}
                className={`flex-1 p-2 border ${issueForm.type === 'income' ? 'border-[#ff6f61] bg-[#ff6f61]/20' : 'border-[#6a0dad]'} ml-1`}
              >
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className={`text-center text-[8px] ${issueForm.type === 'income' ? 'text-[#ff6f61]' : 'text-[#b39eb5]'}`}>
                  INCOME
                </Text>
              </Pressable>
            </View>

            <TextInput
              className="border border-[#6a0dad] p-3 mb-3 text-[#ffd9b3] text-xs"
              placeholder="PREDICATE (e.g., income > 5000)"
              placeholderTextColor="#4a2c5a"
              value={issueForm.predicate}
              onChangeText={(text) => setIssueForm({...issueForm, predicate: text})}
              style={{ fontFamily: 'PressStart2P_400Regular' }}
            />

            <View className="flex-row">
              <Pressable 
                onPress={() => setShowIssueForm(false)}
                className="flex-1 border-2 border-[#ff6f61] p-3 mr-2"
              >
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ff6f61] text-xs text-center">
                  CANCEL
                </Text>
              </Pressable>
              <Pressable 
                onPress={issueAttestation}
                className="flex-1 border-2 border-[#00ff9d] p-3 ml-2"
              >
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-xs text-center">
                  ISSUE
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <ScrollView className="flex-1">
          {activeTab === 'received' && attestations.length === 0 && (
            <View className="border-2 border-[#6a0dad] p-6 items-center">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-xs text-center">
                NO ATTESTATIONS YET
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a2c5a] text-[8px] text-center mt-2">
                EMPLOYERS AND LANDLORDS CAN ISSUE THEM TO YOU
              </Text>
            </View>
          )}

          {activeTab === 'received' && attestations.map((att) => (
            <Pressable 
              key={att.id}
              onPress={() => verifyAttestation(att)}
              className="border-2 border-[#00ff9d] p-4 mb-3"
              style={{ shadowColor: '#00ff9d', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 5 }}
            >
              <View className="flex-row justify-between mb-2">
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-[8px]">
                  {att.type.toUpperCase()}
                </Text>
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#00ff9d] text-[8px]">
                  ✓ VERIFIED
                </Text>
              </View>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[10px] mb-2">
                {att.predicate}
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a2c5a] text-[6px]">
                ISSUED BY: {att.issuer.name} • {new Date(att.issuedAt).toLocaleDateString()}
              </Text>
            </Pressable>
          ))}

          {activeTab === 'issued' && pendingRequests.length === 0 && (
            <View className="border-2 border-[#6a0dad] p-6 items-center">
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-xs text-center">
                NO ISSUED ATTESTATIONS
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a2c5a] text-[8px] text-center mt-2">
                ISSUE VERIFIABLE PROOFS TO YOUR EMPLOYEES OR TENANTS
              </Text>
            </View>
          )}

          {activeTab === 'issued' && pendingRequests.map((att) => (
            <View key={att.id} className="border-2 border-[#8a2be2] p-4 mb-3">
              <View className="flex-row justify-between mb-2">
                <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#ffd9b3] text-[8px]">
                  {att.type.toUpperCase()} • ISSUED
                </Text>
              </View>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mb-1">
                TO: {att.subject.slice(0, 8)}...
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[10px] mb-2">
                {att.predicate}
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#4a2c5a] text-[6px]">
                {new Date(att.issuedAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <View className="bg-[#0a0a1f] border-t-2 border-[#6a0dad] flex-row justify-around py-3">
          <Pressable onPress={() => router.push('/')} className="items-center">
            <PixelIcon name="heart" color="#ff6f61" size={20} />
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mt-1">HOME</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/attestations')} className="items-center">
            <PixelIcon name="shield" color="#00ff9d" size={20} />
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mt-1">PROOFS</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/qr')} className="items-center">
            <PixelIcon name="qr" color="#8a2be2" size={20} />
            <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[#b39eb5] text-[8px] mt-1">QR</Text>
          </Pressable>
        </View>
      </View>
      <StatusBar style="auto" />
    </LinearGradient>
  )
}