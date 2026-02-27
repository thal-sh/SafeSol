# SafeSol 🔐

A privacy-first LIFE DATA VAULT app built for Solana Mobile. Store your critical medical, finance, property and identity information securely on your device and access it instantly in emergencies.

### 🏥 **HEALTH VAULT**
- Store allergies, blood type, medical conditions
- Add/edit emergency contacts (phone call from QR)
- Track condition severity (mild/moderate/severe)
- Emergency QR mode for paramedics
- Medication reminders & prescriptions (future)
- Vaccination records (future)
- Insurance cards & doctor visits (future)

### 💼 **FINANCIAL VAULT**
- Request proofs from employers, landlords, schools, etc.
- Scan or receive attestations and store locally
- View verified income proofs with expiration
- Export all proofs to share externally
- Review pending requests and issue attestations
- Manage employment contracts, loan agreements

### 🏠 **PROPERTY VAULT**
- Manually log rental history
- Request landlord verification via proof flow
- Lease agreements and payment tracking
- Proofs like “paid 12 months rent” for credit apps
- Future: deeds, utility bills, maintenance docs

### 🆔 **IDENTITY VAULT**
- KYC status (pending/verified)
- Age proofs without revealing DOB
- Store credentials & professional licenses
- Link to document vault for secure storage

### 📜 **DOCUMENT VAULT**
- Store scanned documents (passport, ID, diploma, etc.)
- Metadata: issuer, issue/expiry dates
- Expiry warnings and share/delete controls
- All files encrypted and device‑only


### 🚑 **EMERGENCY QR**
- Generate QR with medical data
- Paramedic mode with large, readable text
- One-tap calling to emergency contacts
- Lock screen setup instructions
- Works without unlocking phone

### 🔐 **VERIFIABLE PROOFS**
- Employers can issue income attestations
- Landlords can verify rental history
- Zero-knowledge proofs (simulated for demo)
- Prove "Income > $5,000" without revealing actual salary
- Prove "Rent paid 12 months" without sharing bank statements
- All proofs stored on YOUR device only

---

## 🚀 Getting Started

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SafeSol.git
   cd SafeSol
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm start
   ```

4. **Run on Android**
   ```bash
   pnpm android
   ```

The app will open on your connected Android device or emulator.

## 🎯 Usage

1. **Connect Wallet** - Tap "Connect Wallet" to connect your Solana Mobile wallet
2. **Add Medical Info** - Navigate to Medical screen and enter your:
   - Allergies
   - Blood type
   - Medical conditions (with severity)
   - Emergency contacts (name, phone, relationship)
3. **Verify Identity** (Optional) - Go to KYC screen to:
   - Upload ID document (from gallery or camera)
   - Take a selfie
   - Submit for verification (simulated)
4. **Build Out Your Vaults**
   - Use **Finance** tab to request income/lease proofs, scan or receive attestations, and export them.
   - Use **Property** tab for rental history and send verification requests to landlords.
   - Use **Identity** tab to view KYC/age status and open the Document Vault for secure file storage.
5. **Check Your Profile** - Home screen shows a completion percentage so you know which sections still need setup.
6. **Generate QR** - Once medical info is saved, go to QR screen to:
   - Generate your emergency QR code
   - Follow instructions to set as lock screen wallpaper
   - Test emergency mode with "Emergency Mode" button
7. **Emergency Access** - In an emergency, first responders can:
   - Scan QR from lock screen
   - View critical medical information in large text
   - Tap to call emergency contacts

## 🔒 Privacy First

- ✅ All medical data stored **encrypted on your device only**
- ✅ KYC images **never permanently stored**
- ✅ No cloud databases
- ✅ No third-party tracking
- ✅ You control your data
- ✅ Verification proofs on-chain, data off-chain

## 🧪 Demo Notes

This app is built for the MONOLITH Hackathon. Some features are simulated for demo purposes:

## 🏆 Hackathon Submission

Built for the **MONOLITH Hackathon** by Solana Mobile and RadiantsDAO.

- **Track:** Solana Mobile
- **Theme:** Mobile-first Solana apps
- **Goal:** Real utility for Seeker community
- **Timeline:** February - March 2026

## 🤝 Contributing

This project is open for hackathon submission. Feel free to fork and improve!
