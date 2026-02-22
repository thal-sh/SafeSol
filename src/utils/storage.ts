import AsyncStorage from '@react-native-async-storage/async-storage'
import { MedicalInfo } from '../types'

const KEYS = {
  MEDICAL: (wallet: string) => `medical_${wallet}`,
  KYC: (wallet: string) => `kyc_${wallet}`,
}

export const storage = {
  // Medical
  saveMedical: async (wallet: string, data: MedicalInfo) => {
    await AsyncStorage.setItem(KEYS.MEDICAL(wallet), JSON.stringify(data))
  },
  
  getMedical: async (wallet: string): Promise<MedicalInfo | null> => {
    const data = await AsyncStorage.getItem(KEYS.MEDICAL(wallet))
    return data ? JSON.parse(data) : null
  },

  // KYC
  saveKYC: async (wallet: string, verified: boolean) => {
    await AsyncStorage.setItem(KEYS.KYC(wallet), verified ? 'verified' : 'pending')
  },
  
  getKYC: async (wallet: string): Promise<boolean> => {
    const status = await AsyncStorage.getItem(KEYS.KYC(wallet))
    return status === 'verified'
  },
}
