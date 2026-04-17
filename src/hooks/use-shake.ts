/**
 * Shake detection hook.
 * Works: Android Chrome/Brave (auto), iOS Safari (needs requestPermission)
 * Fallback: returns { supported: false } on desktop
 */
import { useEffect, useRef, useState, useCallback } from 'react';

const SHAKE_THRESHOLD = 15; // acceleration magnitude to count as shake
const SHAKE_COUNT_NEEDED = 3; // consecutive shakes to trigger
const SHAKE_TIMEOUT = 800; // ms — reset count if no shake in this window

interface UseShakeOptions {
  onShake: () => void;
  enabled?: boolean;
}

export function useShake({ onShake, enabled = true }: UseShakeOptions) {
  const [supported, setSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const shakeCount = useRef(0);
  const lastShake = useRef(0);
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  // Request permission (needed on iOS Safari)
  const requestPermission = useCallback(async () => {
    try {
      // iOS Safari requires explicit permission
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const result = await (DeviceMotionEvent as any).requestPermission();
        if (result === 'granted') {
          setPermissionGranted(true);
          return true;
        }
        return false;
      }
      // Chrome/Brave auto-grant
      setPermissionGranted(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    // Check if DeviceMotionEvent exists
    if (typeof DeviceMotionEvent === 'undefined') return;
    setSupported(true);

    // Auto-grant on non-iOS
    if (typeof (DeviceMotionEvent as any).requestPermission !== 'function') {
      setPermissionGranted(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !supported || !permissionGranted) return;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
      const now = Date.now();

      if (magnitude > SHAKE_THRESHOLD) {
        if (now - lastShake.current < SHAKE_TIMEOUT) {
          shakeCount.current++;
        } else {
          shakeCount.current = 1;
        }
        lastShake.current = now;

        if (shakeCount.current >= SHAKE_COUNT_NEEDED) {
          shakeCount.current = 0;
          onShakeRef.current();
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [enabled, supported, permissionGranted]);

  return { supported, permissionGranted, requestPermission };
}
