import { useState, useEffect } from 'react'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { storage } from '../utils/storage'
import { MedicalInfo } from '../types'

export function useMedical() {
  const { account } = useMobileWallet()
  const [medical, setMedical] = useState<MedicalInfo | null>(null)

  useEffect(() => {
    if (account) load()
  }, [account])

  const load = async () => {
    if (!account) return
    const data = await storage.getMedical(account.address.toString())
    setMedical(data)
  }

  return { medical, reload: load }
}
