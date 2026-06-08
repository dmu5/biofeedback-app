import { StyleSheet, Text, View } from 'react-native';
import { useBioStore } from '../store/useBioStore';

export default function HomeScreen() {
  const isTracking = useBioStore((state) => state.isTracking);
  const toggleTracking = useBioStore((state) => state.toggleTracking);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Biofeedback</Text>
      <Text style={styles.subtitle}>Your personal biometric assistant</Text>

      <View style={styles.card}>
        <Text style={styles.status}>
          Status: {isTracking ? 'Tracking Active 🟢' : 'Tracking Inactive 🔴'}
        </Text>
        <Text style={styles.button} onPress={toggleTracking}>
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    color: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
    overflow: 'hidden', // Ensures border radius is applied on text
  },
});
