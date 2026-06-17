export type TrackingStatus = 'WAITING' | 'CALIBRATING' | 'MEASURING' | 'MOTION_WARNING' | 'DONE';

export class PPGProcessor {
  private isRunning: boolean = false;
  private onUpdate: (bpm: number, status: TrackingStatus, pulsePhase: number) => void;

  private redChannelBuffer: number[] = [];
  private readonly BUFFER_SIZE = 150; 
  private lastPeakTime: number = 0;
  private rrIntervals: number[] = [];

  constructor(onUpdate: (bpm: number, status: TrackingStatus, pulsePhase: number) => void) {
    this.onUpdate = onUpdate;
  }

  public processFrame(redChannelMean: number, greenChannelMean: number, blueChannelMean: number, timestamp: number) {
    if (!this.isRunning) return;

    // Жёсткий фильтр: значения нормализованы под стандартные форматы камер (0-255)
    // Палец на вспышке даёт очень много красного цвета, а остальные каналы гаснут
    if (redChannelMean < 140 || greenChannelMean > 70 || blueChannelMean > 70) {
      this.redChannelBuffer = [];
      this.rrIntervals = [];
      this.lastPeakTime = 0;
      this.onUpdate(0, 'WAITING', 0);
      return;
    }

    this.redChannelBuffer.push(redChannelMean);
    if (this.redChannelBuffer.length > this.BUFFER_SIZE) {
      this.redChannelBuffer.shift();
    }

    if (this.redChannelBuffer.length < 30) {
      this.onUpdate(0, 'CALIBRATING', 0);
      return;
    }

    const currentFrame = this.redChannelBuffer[this.redChannelBuffer.length - 1];
    const prevFrame = this.redChannelBuffer[this.redChannelBuffer.length - 2];

    if (Math.abs(currentFrame - prevFrame) > 40) { 
      this.onUpdate(0, 'MOTION_WARNING', 0);
      return; 
    }

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

      if (isPeak) {
        if (this.lastPeakTime > 0 && (timestamp - this.lastPeakTime) > 340) {
          const rrInterval = timestamp - this.lastPeakTime;
          this.rrIntervals.push(rrInterval);

          if (this.rrIntervals.length > 5) {
            this.rrIntervals.shift();
          }

          const avgRR = this.rrIntervals.reduce((a, b) => a + b, 0) / this.rrIntervals.length;
          const calculatedBpm = Math.round(60000 / avgRR);

          // Отправляем pulsePhase = 1.15 для запуска анимации кольца в момент удара
          this.onUpdate(calculatedBpm, 'MEASURING', 1.15);
        } else {
          const currentAvg = this.rrIntervals.length > 0 
            ? Math.round(60000 / (this.rrIntervals.reduce((a, b) => a + b, 0) / this.rrIntervals.length)) 
            : 0;
          this.onUpdate(currentAvg, 'MEASURING', 1.0);
        }

        this.lastPeakTime = timestamp;
      }
    }
  }

  start() {
    this.isRunning = true;
    this.redChannelBuffer = [];
    this.rrIntervals = [];
    this.lastPeakTime = 0;
    // Просто переводим в режим ожидания реального пальца на камере
    this.onUpdate(0, 'WAITING', 0);
  }

  stop() {
    this.isRunning = false;
  }
}