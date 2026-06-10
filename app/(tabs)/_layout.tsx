import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#1E1E1E', shadowColor: 'transparent', elevation: 0 },
        headerTintColor: '#E0E0E0',
        headerTitleStyle: { fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#333',
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        sceneStyle: {
          backgroundColor: '#121212',
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarLabel: 'History',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tabs>
  );
}
