import React from 'react'
import { TextInput, TextInputProps } from 'react-native'

/**
 * A thin wrapper around TextInput which applies the PressStart2P font by default.
 * Props are passed through so you can still override style, keyboardType, etc.
 */
export default function PS2PTextInput(props: TextInputProps) {
  const { style, ...rest } = props
  return <TextInput {...rest} style={[{ fontFamily: 'PressStart2P_400Regular' }, style]} />
}
