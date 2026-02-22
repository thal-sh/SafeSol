export type Condition = {
  name: string
  severity: 'mild' | 'moderate' | 'severe'
  diagnosedDate?: string
}

export type Contact = {
  name: string
  phone: string
  relationship: string
}

export type MedicalInfo = {
  allergies: string
  bloodType: string
  conditions: Condition[]  // Array of conditions with severity
  emergencyContacts: Contact[]  // Array of contacts
  lastUpdated?: number
}

export type KYCData = {
  status: 'pending' | 'submitted' | 'verified' | 'rejected'
  idDocument?: {
    uri: string
    type: 'passport' | 'drivers_license' | 'national_id'
    verifiedAt?: number
  }
  selfie?: {
    uri: string
    verifiedAt?: number
  }
  submittedAt?: number
  verifiedAt?: number
  rejectionReason?: string
}

export type UserStatus = {
  savedMedical: boolean
  kycVerified: boolean
}
