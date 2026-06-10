import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();

  const handleStartSession = () => {
    router.push('/tracking');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Ready to measure your heart rate?</Text>

      <TouchableOpacity style={styles.button} onPress={handleStartSession}>
        <Text style={styles.buttonText}>Start Session</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
