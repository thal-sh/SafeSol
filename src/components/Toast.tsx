import { View, Text } from 'react-native'
import Toast from 'react-native-toast-message'

export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View className="bg-green-50 dark:bg-green-900 px-4 py-3 rounded-xl border border-green-200 dark:border-green-800 mx-4">
      <Text className="text-green-800 dark:text-green-200 font-bold text-base">{text1}</Text>
      {text2 && <Text className="text-green-600 dark:text-green-400 text-sm">{text2}</Text>}
    </View>
  ),
  
  error: ({ text1, text2 }: any) => (
    <View className="bg-red-50 dark:bg-red-900 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800 mx-4">
      <Text className="text-red-800 dark:text-red-200 font-bold text-base">{text1}</Text>
      {text2 && <Text className="text-red-600 dark:text-red-400 text-sm">{text2}</Text>}
    </View>
  ),
  
  info: ({ text1, text2 }: any) => (
    <View className="bg-blue-50 dark:bg-blue-900 px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800 mx-4">
      <Text className="text-blue-800 dark:text-blue-200 font-bold text-base">{text1}</Text>
      {text2 && <Text className="text-blue-600 dark:text-blue-400 text-sm">{text2}</Text>}
    </View>
  ),
}