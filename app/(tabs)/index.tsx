import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useBioStore } from '../../store/useBioStore';
import i18n from '../../utils/i18n';

export default function DashboardScreen() {
  const router = useRouter();
  const heartRate = useBioStore(state => state.heartRate);

  const handleStartSession = () => {
    router.push('/tracking');
  };

  return (
    <View style={styles.container}>
      <View style={styles.surface}>
        <Text style={styles.title}>{i18n.t('dashboard')}</Text>
        <Text style={styles.subtitle}>{i18n.t('ready_to_measure')}</Text>

        {heartRate !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>{i18n.t('last_reading')}</Text>
            <Text style={styles.resultValue}>{heartRate} <Text style={styles.resultUnit}>BPM</Text></Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleStartSession}>
          <Text style={styles.buttonText}>{i18n.t('start_session')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
    justifyContent: 'center',
  },
  surface: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 32,
    textAlign: 'center',
  },
  resultBox: {
    backgroundColor: '#121212',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  resultLabel: {
    color: '#888',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  resultValue: {
    color: '#FF2D55',
    fontSize: 48,
    fontWeight: 'bold',
  },
  resultUnit: {
    fontSize: 20,
    color: '#E0E0E0',
    fontWeight: 'normal',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
