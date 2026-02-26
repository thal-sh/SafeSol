import { View } from 'react-native'
import Toast, { ToastConfig } from 'react-native-toast-message'
import { LinearGradient } from 'expo-linear-gradient'
import { PS2PText } from './PS2PText'

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }: any) => (
    <LinearGradient
      colors={['#00ff9d', '#00cc7a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="px-4 py-3 rounded-none border-2 border-[#00ff9d] mx-4"
      style={{ shadowColor: '#00ff9d', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }}
    >
      <PS2PText className="text-[#0a0a1f] text-xs">{text1}</PS2PText>
      {text2 && <PS2PText className="text-[#0a0a1f] text-[10px] mt-1">{text2}</PS2PText>}
    </LinearGradient>
  ),
  
  error: ({ text1, text2 }: any) => (
    <LinearGradient
      colors={['#ff1493', '#b80c6b']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="px-4 py-3 rounded-none border-2 border-[#ff1493] mx-4"
      style={{ shadowColor: '#ff1493', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }}
    >
      <PS2PText className="text-white text-xs">{text1}</PS2PText>
      {text2 && <PS2PText className="text-white text-[10px] mt-1">{text2}</PS2PText>}
    </LinearGradient>
  ),
  
  info: ({ text1, text2 }: any) => (
    <LinearGradient
      colors={['#8a2be2', '#4a1a7a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="px-4 py-3 rounded-none border-2 border-[#8a2be2] mx-4"
      style={{ shadowColor: '#8a2be2', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }}
    >
      <PS2PText className="text-[#ffd9b3] text-xs">{text1}</PS2PText>
      {text2 && <PS2PText className="text-[#ffd9b3] text-[10px] mt-1">{text2}</PS2PText>}
    </LinearGradient>
  ),
}