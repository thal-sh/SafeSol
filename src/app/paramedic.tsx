import { View } from 'react-native'
import { colors } from '../constants/colors'
import { ParamedicView } from '../components/ParamedicView'
import { useMedical } from '../hooks/useMedical'

export default function Paramedic() {
  const { medical: info } = useMedical()

  return (
    <View className={`flex-1 ${colors.primary.bg}`}>
      <ParamedicView info={info} />
    </View>
  )
}
