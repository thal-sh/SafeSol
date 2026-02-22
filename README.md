# SafeSol 🔐

A privacy-first medical ID and identity verification app built for Solana Mobile. Store your critical medical information securely on your device and access it instantly in emergencies.

## ✨ Features

### 🏥 Medical Information
- Store allergies, blood type, and medical conditions
- Add multiple emergency contacts with phone numbers
- Track condition severity (mild/moderate/severe)
- Encrypted storage on your device only
- Last updated timestamps

### ✅ KYC Verification
- Upload ID documents (passport, driver's license)
- Take selfie for verification
- Simulated verification flow for demo
- Privacy-first: no data permanently stored
- Clear status tracking (pending/submitted/verified/rejected)

### 🚑 Emergency QR
- Generate QR code with your medical data
- Paramedic mode with large, readable text
- One-tap calling to emergency contacts
- Lock screen setup instructions
- Works without unlocking phone

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
4. **Generate QR** - Once medical info is saved, go to QR screen to:
   - Generate your emergency QR code
   - Follow instructions to set as lock screen wallpaper
   - Test emergency mode with "Emergency Mode" button
5. **Emergency Access** - In an emergency, first responders can:
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
