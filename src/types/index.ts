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

export type AttestationType = 'employment' | 'rental' | 'income' | 'education'

export type Attestation = {
  id: string
  type: AttestationType
  issuer: {
    name: string
    wallet: string
    trusted: boolean
  }
  subject: string // wallet address of person being attested about
  predicate: string // e.g., "income > 5000", "rent_paid_12_months"
  value: boolean
  issuedAt: number
  expiresAt?: number
  signature?: string // For verification
}

export type AttestationRequest = {
  id: string
  type: AttestationType
  requester: string // wallet address
  issuer: string // wallet address of company/landlord
  predicate: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: number
  respondedAt?: number
}

export type RentalHistory = {
  id: string
  address: string
  landlord: string
  landlordWallet: string
  startDate: string
  endDate?: string
  monthlyRent: number
  paymentsMade: number
  totalMonths: number
  attested: boolean
}

export type PropertyAttestation = {
  id: string
  type: 'rental' | 'ownership' | 'payment'
  predicate: string
  issuer: string
  issuerWallet: string
  issuedAt: number
  validUntil: number
}

export type Document = {
  id: string
  type: 'passport' | 'drivers_license' | 'birth_certificate' | 'diploma' | 'other'
  name: string
  issuer: string
  issuedAt: string
  expiresAt?: string
  imageUri?: string
  verified: boolean
}
