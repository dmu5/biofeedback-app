import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import i18n from '../utils/i18n';

type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export default function BreathingScreen() {
  const router = useRouter();

  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [phase, setPhase] = useState<Phase>('inhale');

  const circleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const phaseDuration = 4000; // 4 seconds

  useEffect(() => {
    runCycle();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [vibrationEnabled]); // Dependency on vibrationEnabled so that closure binds current state

  const runCycle = () => {
    // 1. Inhale
    setPhase('inhale');
    if (vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(circleAnim, {
      toValue: 2.5,
      duration: phaseDuration,
      useNativeDriver: true,
    }).start();

    // 2. Hold
    timerRef.current = setTimeout(() => {
      setPhase('hold1');
      if (vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // 3. Exhale
      timerRef.current = setTimeout(() => {
        setPhase('exhale');
        if (vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Animated.timing(circleAnim, {
          toValue: 1,
          duration: phaseDuration,
          useNativeDriver: true,
        }).start();

        // 4. Hold
        timerRef.current = setTimeout(() => {
          setPhase('hold2');
          if (vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

          // Loop
          timerRef.current = setTimeout(runCycle, phaseDuration);
        }, phaseDuration);
      }, phaseDuration);
    }, phaseDuration);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return i18n.t('breathe_in');
      case 'exhale': return i18n.t('breathe_out');
      case 'hold1':
      case 'hold2': return i18n.t('hold');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('relax_breathing')}</Text>

        <View style={styles.switchContainer}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 16,
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
