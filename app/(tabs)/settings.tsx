import { StyleSheet, Text, View } from 'react-native';
import i18n from '../../utils/i18n';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.surface}>
        <Text style={styles.title}>{i18n.t('settings')}</Text>
        <Text style={styles.subtitle}>{i18n.t('configure_application')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  surface: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
  },
});
