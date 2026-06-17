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

  const phaseDuration = 4000; // 4 секунды

  useEffect(() => {
    startCycle();
    return () => {
      clearAllTimers();
      Vibration.cancel();
    };
  }, []);

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

    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      timersRef.current.push(id);
      return id;
    };

    const loop = () => {
      setPhase('inhale');
      Animated.timing(circleAnim, {
        toValue: 2.2,
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
            schedule(loop, phaseDuration);
          }, phaseDuration);
        }, phaseDuration);
      }, phaseDuration);
    };

    loop();
  }

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return i18n.t('breathe_in') || 'Вдох';
      case 'exhale': return i18n.t('breathe_out') || 'Выдох';
      case 'hold1':
      case 'hold2': return i18n.t('hold') || 'Задержка';
    }
  };

  // Железная вибрация через родной модуль Android
  const previousPhaseRef = useRef<Phase>(phase);
  useEffect(() => {
    const prev = previousPhaseRef.current;
    if (phase !== prev) {
      if (vibrationEnabled) {
        Vibration.vibrate(70); // Чёткий короткий виброимпульс 70мс
      }
      previousPhaseRef.current = phase;
    }
  }, [phase, vibrationEnabled]);

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>{i18n.t('relax_breathing') || 'Дыхательная гимнастика'}</Text>
        <View style={styles.divider} />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{i18n.t('vibration') || 'Вибрация'}</Text>
          <Switch
            value={vibrationEnabled}
            onValueChange={setVibrationEnabled}
            trackColor={{ false: '#333', true: '#007AFF' }}
            thumbColor={vibrationEnabled ? '#FFF' : '#AAA'}
          />
        </View>
      </View>

      <View style={styles.animationContainer}>
        <Animated.View style={[styles.circle, { transform: [{ scale: circleAnim }] }]} />
        <Text style={styles.phaseText}>{getPhaseText()}</Text>
      </View>

      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.buttonText}>{i18n.t('close') || 'Закрыть'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCard: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#2C2C2C',
    marginVertical: 14,
  },
  switchRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    color: '#E0E0E0',
    fontSize: 16,
    fontWeight: '500',
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  circle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  phaseText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  closeButton: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: 'bold',
  },
});