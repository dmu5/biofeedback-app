import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

export default function TrackingScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (permission?.granted) {
      // Activate the torch after a short delay to ensure the camera is ready
      const timer = setTimeout(() => setIsActive(true), 500);
      return () => clearTimeout(timer);
    }
  }, [permission]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={isActive}
      >
        <View style={styles.overlay}>
          <Text style={styles.instructionText}>Place your finger over the camera lens</Text>
          <View style={styles.targetBox} />

          <TouchableOpacity style={styles.closeButtonOverlay} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instructionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  targetBox: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#ff3b30',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#333',
  },
  closeButtonOverlay: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#333',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
