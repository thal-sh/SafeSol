import { Tabs } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { PixelIcon } from '../../components/PixelIcon'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a1f',
          borderTopWidth: 2,
          borderTopColor: '#6a0dad',
          height: 70,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['#1a0f2e', '#0a0a1f']}
            style={{ flex: 1 }}
          />
        ),
        tabBarActiveTintColor: '#ff6f61',
        tabBarInactiveTintColor: '#4a2c5a',
        tabBarLabelStyle: {
          fontFamily: 'PressStart2P_400Regular',
          fontSize: 8,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color }) => (
            <PixelIcon name="home" color={color} size={20} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="health"
        options={{
          title: 'HLTH',
          tabBarIcon: ({ color }) => (
            <PixelIcon name="health" color={color} size={20} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="financial"
        options={{
          title: 'FIN',
          tabBarIcon: ({ color }) => (
            <PixelIcon name="finance" color={color} size={20} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="property"
        options={{
          title: 'PROP',
          tabBarIcon: ({ color }) => (
            <PixelIcon name="property" color={color} size={20} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="identity"
        options={{
          title: 'ID',
          tabBarIcon: ({ color }) => (
            <PixelIcon name="identity" color={color} size={20} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="documents"
        options={{
          title: 'DOCS',
          tabBarIcon: ({ color }) => (
            <PixelIcon name="document" color={color} size={20} />
          ),
        }}
      />
    </Tabs>
  )
}