/**
 * Haptic feedback wrapper.
 * Works: Android Chrome, Android Brave
 * Fails silently: iOS Safari, Desktop — no vibration motor
 */

const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

export const haptics = {
  /** Soft tap — card flip, button press */
  tap: () => canVibrate && navigator.vibrate(10),

  /** Medium pulse — trait revealed, message appears */
  pulse: () => canVibrate && navigator.vibrate(25),

  /** Double tap — like a heartbeat */
  heartbeat: () => canVibrate && navigator.vibrate([80, 60, 80]),

  /** Success — candle blown, gift opened */
  success: () => canVibrate && navigator.vibrate([50, 30, 50, 30, 50, 30, 200]),

  /** Celebration — confetti moment */
  celebration: () => canVibrate && navigator.vibrate([200, 100, 200, 100, 500]),

  /** Gentle continuous — while recording voice */
  recording: () => canVibrate && navigator.vibrate([15, 50, 15, 50, 15, 50, 15]),

  /** Stop vibration */
  stop: () => canVibrate && navigator.vibrate(0),
};
