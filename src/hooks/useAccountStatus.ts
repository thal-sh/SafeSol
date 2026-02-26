import { useState, useEffect } from 'react'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { storage } from '../utils/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MedicalInfo } from '../types'

export function useAccountStatus() {
  const { account } = useMobileWallet()
  const [medicalData, setMedicalData] = useState<MedicalInfo | null>(null)
  const [savedMedical, setSavedMedical] = useState(false)
  const [kycVerified, setKycVerified] = useState(false)
  const [attestationsCount, setAttestationsCount] = useState(0)

  useEffect(() => {
    if (account) load()
  }, [account])

  const load = async () => {
    if (!account) return
    const medical = await storage.getMedical(account.address.toString())
    setSavedMedical(!!medical)
    setMedicalData(medical)
    setKycVerified(await storage.getKYC(account.address.toString()))

    try {
      const rentals = await AsyncStorage.getItem(`rentals_${account.address}`)
      const income = await AsyncStorage.getItem(`income_${account.address}`)
      const count =
        (rentals ? JSON.parse(rentals).length : 0) +
        (income ? JSON.parse(income).length : 0)
      setAttestationsCount(count)
    } catch (error) {
      console.log('Error loading attestations', error)
    }
  }

  return {
    account,
    medicalData,
    savedMedical,
    kycVerified,
    attestationsCount,
    reload: load,
  }
}
