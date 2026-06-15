import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Switch, Text, TouchableOpacity, Vibration, View } from 'react-native';
import i18n from '../utils/i18n';

type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export default function BreathingScreen() {
  const router = useRouter();

  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [phase, setPhase] = useState<Phase>('inhale');

  const circleAnim = useRef(new Animated.Value(1)).current;
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const phaseDuration = 4000; // 4 seconds

  // Start the breathing cycle on mount
  useEffect(() => {
    startCycle();
    return () => {
      // Clear all timeouts and cancel any vibration on unmount
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
      Vibration.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop vibrations immediately when user disables the switch
  useEffect(() => {
    if (!vibrationEnabled) {
      Vibration.cancel();
    }
  }, [vibrationEnabled]);

  const clearAllTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  function startCycle() {
    clearAllTimers();

    // helper to schedule a phase change
    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      timersRef.current.push(id);
      return id;
    };

    // Kick off the repeating cycle
    const loop = () => {
      setPhase('inhale');
      Animated.timing(circleAnim, {
        toValue: 2.5,
        duration: phaseDuration,
        useNativeDriver: true,
      }).start();

      schedule(() => {
        setPhase('hold1');

        schedule(() => {
          setPhase('exhale');
          Animated.timing(circleAnim, {
            toValue: 1,
            duration: phaseDuration,
            useNativeDriver: true,
          }).start();

          schedule(() => {
            setPhase('hold2');
            // schedule next cycle
            schedule(loop, phaseDuration);
          }, phaseDuration);
        }, phaseDuration);
      }, phaseDuration);
    };

    loop();
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return i18n.t('breathe_in');
      case 'exhale': return i18n.t('breathe_out');
      case 'hold1':
      case 'hold2': return i18n.t('hold');
    }
  };

  // Vibrate only at phase changes and only when enabled
  const previousPhaseRef = useRef<Phase>(phase);
  useEffect(() => {
    const prev = previousPhaseRef.current;
    if (phase !== prev) {
      // Only vibrate on transitions (e.g., inhale -> hold1)
      if (vibrationEnabled) {
        // Use Haptics for a short, deterministic pulse
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } else {
        Vibration.cancel();
      }
      previousPhaseRef.current = phase;
    }
  }, [phase, vibrationEnabled]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('relax_breathing')}</Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{i18n.t('vibration')}</Text>
          <Switch
            value={vibrationEnabled}
            onValueChange={setVibrationEnabled}
            trackColor={{ false: '#333', true: '#007AFF' }}
          />
        </View>
      </View>

      <View style={styles.animationContainer}>
        <Animated.View style={[styles.circle, { transform: [{ scale: circleAnim }] }]} />
        <Text style={styles.phaseText}>{getPhaseText()}</Text>
      </View>

      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.buttonText}>{i18n.t('close')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 40,
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 16,
  },
  switchRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  title: {
    color: '#E0E0E0',
    fontSize: 20,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    color: '#A0A0A0',
    marginRight: 10,
    fontSize: 16,
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  phaseText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    zIndex: 10,
  },
  closeButton: {
    backgroundColor: '#333',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
