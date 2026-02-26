import React from 'react'
import { Text, TextProps, StyleProp, TextStyle } from 'react-native'

// Wraps the native Text component and applies the PressStart2P font by default.
// Consumers can still override or extend the style via the usual props.
export const PS2PText: React.FC<TextProps> = ({ style, children, ...props }) => {
  const combinedStyle: StyleProp<TextStyle> = [
    { fontFamily: 'PressStart2P_400Regular' },
    style,
  ]

  return (
    <Text {...props} style={combinedStyle}>
      {children}
    </Text>
  )
}

// also provide a default export for convenience
export default PS2PText
