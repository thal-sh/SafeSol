import React from 'react'
import { View } from 'react-native'
import Svg, { Rect } from 'react-native-svg'

type Props = {
  name: 'home' | 'health' | 'finance' | 'property' | 'identity' | 'document' | 'heart' | 'shield' | 'qr' | 'user' | 'keyboard'
  color?: string
  size?: number
}

export function PixelIcon({ name, color = '#ff6f61', size = 24 }: Props) {
  const renderIcon = () => {
    switch (name) {
      case 'home':
      case 'heart':
        return (
          <Svg width={size} height={size} viewBox="0 0 16 16">
            <Rect x="2" y="6" width="12" height="8" fill={color} />
            <Rect x="4" y="2" width="8" height="4" fill={color} />
            <Rect x="6" y="8" width="4" height="4" fill={color} />
          </Svg>
        )
      
      case 'health':
        return (
          <Svg width={size} height={size} viewBox="0 0 16 16">
            <Rect x="2" y="2" width="12" height="12" fill={color} />
            <Rect x="6" y="4" width="4" height="8" fill="#0a0a1f" />
            <Rect x="4" y="6" width="8" height="4" fill="#0a0a1f" />
          </Svg>
        )
      
      case 'shield':
      case 'finance':
        return (
          <Svg width={size} height={size} viewBox="0 0 16 16">
            <Rect x="3" y="2" width="10" height="3" fill={color} />
            <Rect x="2" y="5" width="12" height="3" fill={color} />
            <Rect x="2" y="8" width="3" height="6" fill={color} />
            <Rect x="11" y="8" width="3" height="6" fill={color} />
            <Rect x="5" y="11" width="6" height="3" fill={color} />
          </Svg>
        )
      
      case 'qr':
      case 'property':
        return (
          <Svg width={size} height={size} viewBox="0 0 16 16">
            <Rect x="2" y="2" width="5" height="5" fill={color} />
            <Rect x="9" y="2" width="5" height="5" fill={color} />
            <Rect x="2" y="9" width="5" height="5" fill={color} />
            <Rect x="9" y="9" width="2" height="2" fill={color} />
            <Rect x="12" y="9" width="2" height="2" fill={color} />
            <Rect x="9" y="12" width="2" height="2" fill={color} />
          </Svg>
        )
      
      case 'user':
      case 'identity':
        return (
          <Svg width={size} height={size} viewBox="0 0 16 16">
            <Rect x="4" y="2" width="8" height="6" fill={color} />
            <Rect x="2" y="8" width="12" height="2" fill={color} />
            <Rect x="2" y="10" width="3" height="4" fill={color} />
            <Rect x="11" y="10" width="3" height="4" fill={color} />
          </Svg>
        )
      
      case 'keyboard':
      case 'document':
        return (
          <Svg width={size} height={size} viewBox="0 0 16 16">
            <Rect x="2" y="2" width="12" height="12" fill={color} />
            <Rect x="4" y="4" width="8" height="1" fill="#0a0a1f" />
            <Rect x="4" y="6" width="6" height="1" fill="#0a0a1f" />
            <Rect x="4" y="8" width="8" height="1" fill="#0a0a1f" />
            <Rect x="4" y="10" width="4" height="1" fill="#0a0a1f" />
          </Svg>
        )
      
      default:
        return (
          <Svg width={size} height={size} viewBox="0 0 16 16">
            <Rect x="2" y="2" width="12" height="12" fill={color} />
          </Svg>
        )
    }
  }

  return renderIcon()
}