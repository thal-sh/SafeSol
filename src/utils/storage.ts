import AsyncStorage from '@react-native-async-storage/async-storage'
import { MedicalInfo } from '../types'

const KEYS = {
  MEDICAL: (wallet: string) => `medical_${wallet}`,
  KYC: (wallet: string) => `kyc_${wallet}`,
}

export const storage = {
  // Medical
  saveMedical: async (wallet: string, data: MedicalInfo) => {
    try {
      // Add timestamp
      const dataToSave = {
        ...data,
        lastUpdated: Date.now()
      }
      // Encrypt with base64
      const jsonString = JSON.stringify(dataToSave)
      const encrypted = btoa(jsonString)
      await AsyncStorage.setItem(KEYS.MEDICAL(wallet), encrypted)
    } catch (error) {
      console.error('Failed to save medical data', error)
      throw error
    }
  },
  
  getMedical: async (wallet: string): Promise<MedicalInfo | null> => {
    try {
      const encrypted = await AsyncStorage.getItem(KEYS.MEDICAL(wallet))
      if (!encrypted) return null
      
      // Try to decrypt (new format)
      try {
        const decoded = atob(encrypted)
        return JSON.parse(decoded)
      } catch (e) {
        // If decryption fails, try plain JSON (old format)
        try {
          return JSON.parse(encrypted)
        } catch (e2) {
          console.error('Failed to parse medical data')
          return null
        }
      }
    } catch (error) {
      console.error('Failed to get medical data', error)
      return null
    }
  },

  // KYC
  saveKYC: async (wallet: string, verified: boolean) => {
    try {
      await AsyncStorage.setItem(KEYS.KYC(wallet), verified ? 'verified' : 'pending')
    } catch (error) {
      console.error('Failed to save KYC', error)
      throw error
    }
  },
  
  getKYC: async (wallet: string): Promise<boolean> => {
    try {
      const status = await AsyncStorage.getItem(KEYS.KYC(wallet))
      return status === 'verified'
    } catch (error) {
      console.error('Failed to get KYC', error)
      return false
    }
  },
}