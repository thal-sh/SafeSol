import React from 'react'
import { View } from 'react-native'
import Svg, { Rect } from 'react-native-svg'

type Props = {
  name: 'clock' | 'keyboard' | 'user' | 'heart' | 'qr' | 'shield'
  color?: string
  size?: number
}

export function PixelIcon({ name, color = '#ff6f61', size = 24 }: Props) {
  const renderIcon = () => {
    switch (name) {
      case 'clock':
        return (
          <Svg width={size} height={size} viewBox="0 0 16 16">
            <Rect x="2" y="2" width="12" height="12" fill={color} />
            <Rect x="7" y="3" width="2" height="5" fill="#0a0a1f" />
            <Rect x="10" y="7" width="2" height="2" fill="#0a0a1f" />
          </Svg>
        )
      case 'heart':
        return (
          <Svg width={size} height={size} viewBox="0 0 16 16">
            <Rect x="2" y="4" width="3" height="3" fill={color} />
            <Rect x="5" y="2" width="3" height="3" fill={color} />
            <Rect x="8" y="2" width="3" height="3" fill={color} />
            <Rect x="11" y="4" width="3" height="3" fill={color} />
            <Rect x="5" y="7" width="3" height="3" fill={color} />
            <Rect x="8" y="7" width="3" height="3" fill={color} />
            <Rect x="2" y="10" width="3" height="3" fill={color} />
            <Rect x="11" y="10" width="3" height="3" fill={color} />
          </Svg>
        )
      case 'shield':
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
      default:
        return null
    }
  }

  return renderIcon()
}