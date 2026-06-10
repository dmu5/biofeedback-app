import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: { backgroundColor: '#1a1a1a', borderTopColor: '#333' },
        headerStyle: { backgroundColor: '#1a1a1a' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#888',
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
