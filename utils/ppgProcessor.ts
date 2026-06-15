export type TrackingStatus = 'WAITING' | 'CALIBRATING' | 'MEASURING' | 'MOTION_WARNING' | 'DONE';

export class PPGProcessor {
  private isRunning: boolean = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private onUpdate: (bpm: number, status: TrackingStatus, pulsePhase: number) => void;

  // Rolling buffer and PPG logic variables
  private redChannelBuffer: number[] = [];
  private readonly BUFFER_SIZE = 150; // Approximates 5 seconds at 30fps
  private lastPeakTime: number = 0;
  private rrIntervals: number[] = [];

  // Variables for simulation to drive the algorithm
  private simulatedTime: number = 0;

  constructor(onUpdate: (bpm: number, status: TrackingStatus, pulsePhase: number) => void) {
    this.onUpdate = onUpdate;
  }

  // --- Core Algorithm: Peak Detection and RR Interval Calculation ---
  // Accepts mean channel values for RGB and a timestamp
  public processFrame(redChannelMean: number, greenChannelMean: number, blueChannelMean: number, timestamp: number) {
    if (!this.isRunning) return;

    // 0. Finger Placement / Ghost Detection
    // Real finger under torch typically produces high red (>150) and low green/blue (<60).
    // If the frame doesn't look like a finger, immediately reset and wait for a proper placement.
    if (redChannelMean < 150 || greenChannelMean > 60 || blueChannelMean > 60) {
      // Immediate hard reset: clear buffers and intervals so no old data lingers
      this.redChannelBuffer = [];
      this.rrIntervals = [];
      this.lastPeakTime = 0;
      this.onUpdate(0, 'WAITING', 0);
      return;
    }

    // 1. Maintain Rolling Buffer (only red channel is used for PPG detection)
    this.redChannelBuffer.push(redChannelMean);
    if (this.redChannelBuffer.length > this.BUFFER_SIZE) {
      this.redChannelBuffer.shift();
    }

    // Need enough data to detect peaks
    if (this.redChannelBuffer.length < 30) {
      this.onUpdate(0, 'CALIBRATING', 0);
      return;
    }

    // 2. Simple Noise/Motion Detection
    // If the variance in the signal is too extreme, flag as motion artifact
    const currentFrame = this.redChannelBuffer[this.redChannelBuffer.length - 1];
    const prevFrame = this.redChannelBuffer[this.redChannelBuffer.length - 2];

    if (Math.abs(currentFrame - prevFrame) > 30) { // Arbitrary motion threshold
      this.onUpdate(0, 'MOTION_WARNING', 0);
      return; // Skip peak detection for this noisy frame
    }

    // 3. Peak Detection Algorithm
    // Look for a local maximum in a small sliding window
    const windowSize = 5;
    if (this.redChannelBuffer.length >= windowSize * 2 + 1) {
      const centerIndex = this.redChannelBuffer.length - 1 - windowSize;
      const centerValue = this.redChannelBuffer[centerIndex];

      let isPeak = true;
      for (let i = centerIndex - windowSize; i <= centerIndex + windowSize; i++) {
        if (i !== centerIndex && this.redChannelBuffer[i] >= centerValue) {
          isPeak = false;
          break;
        }
      }

      // 4. Calculate BPM if peak is found
      if (isPeak) {
        // Enforce a minimum time between peaks (e.g., 300ms, max 200 BPM)
        if (this.lastPeakTime > 0 && (timestamp - this.lastPeakTime) > 300) {
          const rrInterval = timestamp - this.lastPeakTime;
          this.rrIntervals.push(rrInterval);

          // Keep only the last 5 intervals for a stable moving average
          if (this.rrIntervals.length > 5) {
            this.rrIntervals.shift();
          }

          const avgRR = this.rrIntervals.reduce((a, b) => a + b, 0) / this.rrIntervals.length;
          // Calculate BPM: 60,000 ms per minute / avg interval
          const calculatedBpm = Math.round(60000 / avgRR);

          // Update UI with new BPM and emit a pulse phase value > 1 to trigger animation
          this.onUpdate(calculatedBpm, 'MEASURING', 1.15);
        } else {
          // Just a normal frame during measuring
          this.onUpdate(this.rrIntervals.length > 0 ? Math.round(60000 / (this.rrIntervals.reduce((a, b) => a + b, 0) / this.rrIntervals.length)) : 0, 'MEASURING', 1.0);
        }

        this.lastPeakTime = timestamp;
      }
    }
  }

  // --- Runner ---
  // Since we lack native frame buffers, we feed simulated red channel data into the real algorithm
  start() {
    this.isRunning = true;
    this.simulatedTime = Date.now();
    this.redChannelBuffer = [];
    this.rrIntervals = [];
    this.lastPeakTime = 0;

    this.onUpdate(0, 'WAITING', 0);

    let framesSimulated = 0;

    this.timer = setInterval(() => {
      if (!this.isRunning) return;

      this.simulatedTime += 33; // ~30 FPS
      framesSimulated++;

      // Simulate a user placing their finger after 1 second
      if (framesSimulated < 30) {
        // Feed dark data to trigger ghost detection
        this.processFrame(10, 10, 10, this.simulatedTime);
        return;
      }

      // Simulate a motion artifact roughly 3 seconds in
      if (framesSimulated > 90 && framesSimulated < 100) {
        // Feed extreme noise into the algorithm to trigger MOTION_WARNING
        this.processFrame(Math.random() * 200, Math.random() * 200, Math.random() * 200, this.simulatedTime);
        return;
      }

      // Simulate real photoplethysmography (PPG) waveform data
      // A typical PPG wave consists of a DC component (baseline) and an AC component (pulse)
      // We simulate a heart rate of ~75 BPM (which is a peak every 800ms)
      const baseIntensity = 170;
      const heartbeatFreq = 75 / 60; // Hz
      const acComponent = 15 * Math.sin(2 * Math.PI * heartbeatFreq * (this.simulatedTime / 1000));

      // Add slight noise
      const noise = (Math.random() * 4) - 2;

      const simulatedRedMean = baseIntensity + acComponent + noise;
      const simulatedGreenMean = 20 + (Math.random() * 5 - 2.5);
      const simulatedBlueMean = 18 + (Math.random() * 5 - 2.5);

      // Feed the synthetic RGB data into the REAL algorithm
      this.processFrame(simulatedRedMean, simulatedGreenMean, simulatedBlueMean, this.simulatedTime);

      // Finish after ~10 seconds of processing
      if (framesSimulated >= 300) {
        const finalBpm = this.rrIntervals.length > 0 ? Math.round(60000 / (this.rrIntervals.reduce((a, b) => a + b, 0) / this.rrIntervals.length)) : 0;
        this.onUpdate(finalBpm, 'DONE', 1.0);
        this.stop();
      }

    }, 33);
  }

  stop() {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
