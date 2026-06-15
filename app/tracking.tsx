import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useBioStore } from '../store/useBioStore';
import i18n from '../utils/i18n';
import { PPGProcessor, TrackingStatus } from '../utils/ppgProcessor';

export default function TrackingScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState(false);

  // Tracking State
  const [status, setStatus] = useState<TrackingStatus>('WAITING');
  const [currentBpm, setCurrentBpm] = useState<number>(0);
  const pulseScaleAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacityAnim = useRef(new Animated.Value(0.9)).current;

  const setHeartRate = useBioStore(state => state.setHeartRate);
  const simulatorRef = useRef<PPGProcessor | null>(null);

  useEffect(() => {
    if (permission?.granted) {
      // Activate the torch after a short delay to ensure camera readiness
      const timer = setTimeout(() => {
        setIsActive(true);
        startSimulation();
      }, 500);

      return () => {
        clearTimeout(timer);
        // Ensure torch goes off when navigating away or unmounting
        setIsActive(false);
        if (simulatorRef.current) {
          simulatorRef.current.stop();
        }
      };
    }
  }, [permission]);

  // Turn off the torch specifically if the measurement is done,
  // or if we fall back into a waiting state (no finger detected).
  useEffect(() => {
    if (status === 'DONE') {
      setIsActive(false);
    } else if (status === 'WAITING') {
      // Still need torch to see if finger comes back
      setIsActive(true);
    }
  }, [status]);

  const startSimulation = () => {

    simulatorRef.current = new PPGProcessor((bpm, newStatus, phase) => {
      setStatus(newStatus);
      if (bpm > 0) setCurrentBpm(bpm);

      // Pulse animation: phase > 1 indicates a detected pulse peak
      if (newStatus === 'MEASURING' && phase && phase > 1) {
        // stop any current animation and perform a quick pulse
        pulseScaleAnim.stopAnimation();
        pulseOpacityAnim.stopAnimation();

        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseScaleAnim, { toValue: Math.min(1.15, phase), duration: 120, useNativeDriver: true }),
            Animated.timing(pulseScaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(pulseOpacityAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
            Animated.timing(pulseOpacityAnim, { toValue: 0.9, duration: 200, useNativeDriver: true }),
          ])
        ]).start();
      }

      // Save result and exit when done
      if (newStatus === 'DONE') {
        setHeartRate(bpm);
        setTimeout(() => router.back(), 2000);
      }
    });

    simulatorRef.current.start();
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'WAITING': return i18n.t('status_waiting');
      case 'CALIBRATING': return i18n.t('status_calibrating');
      case 'MEASURING': return i18n.t('status_measuring');
      case 'MOTION_WARNING': return i18n.t('status_motion');
      case 'DONE': return i18n.t('status_done');
      default: return "";
    }
  };

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
        <View style={styles.surface}>
          <Text style={styles.message}>{i18n.t('need_permission')}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.buttonText}>{i18n.t('grant_permission')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.buttonText}>{i18n.t('cancel')}</Text>
          </TouchableOpacity>
        </View>
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
          <View style={styles.header}>
            <Text style={styles.statusText}>{getStatusMessage()}</Text>
          </View>

          <View style={styles.centerContent}>
            <View style={styles.targetBox} />

            {(status === 'MEASURING' || status === 'DONE') && (
              <Animated.View style={[styles.bpmContainer, { transform: [{ scale: pulseScaleAnim }], opacity: pulseOpacityAnim }]}>
                <Text style={styles.bpmValue}>{currentBpm}</Text>
                <Text style={styles.bpmLabel}>BPM</Text>
              </Animated.View>
            )}
          </View>

          <TouchableOpacity style={styles.closeButtonOverlay} onPress={() => router.back()}>
            <Text style={styles.buttonText}>{i18n.t('cancel')}</Text>
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
  surface: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 20,
    color: '#E0E0E0',
    fontSize: 18,
    fontWeight: '500',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
  },
  statusText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetBox: {
    width: 120,
    height: 120,
    borderWidth: 3,
    borderColor: '#FF2D55',
    borderRadius: 60,
    backgroundColor: 'rgba(255, 45, 85, 0.1)',
    marginBottom: 40,
  },
  bpmContainer: {
    alignItems: 'center',
  },
  bpmValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FF2D55',
  },
  bpmLabel: {
    fontSize: 20,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  closeButtonOverlay: {
    backgroundColor: '#333',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 40,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
