import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import i18n from '../../utils/i18n';

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
          paddingTop: 0,
          paddingBottom: 0,
          height: 65,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '500',
          marginTop: 0,
          marginBottom: 0,
        },
        sceneStyle: {
          backgroundColor: '#121212',
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t('dashboard'),
          tabBarLabel: i18n.t('dashboard'),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: i18n.t('history'),
          tabBarLabel: i18n.t('history'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: i18n.t('settings'),
          tabBarLabel: i18n.t('settings'),
        }}
      />
    </Tabs>
  );
}
