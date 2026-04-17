/**
 * Tilt/Gyroscope hook.
 * Returns normalized tilt values (-1 to 1) for x and y axes.
 * Works: Android Chrome/Brave (auto), iOS Safari (needs requestPermission)
 */
import { useEffect, useState, useCallback } from 'react';

interface TiltData {
  x: number; // -1 (left) to 1 (right) — gamma
  y: number; // -1 (forward) to 1 (backward) — beta
}

export function useTilt(enabled = true) {
  const [tilt, setTilt] = useState<TiltData>({ x: 0, y: 0 });
  const [supported, setSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = useCallback(async () => {
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const result = await (DeviceOrientationEvent as any).requestPermission();
        if (result === 'granted') {
          setPermissionGranted(true);
          return true;
        }
        return false;
      }
      setPermissionGranted(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (typeof DeviceOrientationEvent === 'undefined') return;
    setSupported(true);
    if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
      setPermissionGranted(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !supported || !permissionGranted) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma || 0; // -90 to 90 (left-right tilt)
      const beta = e.beta || 0;   // -180 to 180 (front-back tilt)

      setTilt({
        x: Math.max(-1, Math.min(1, gamma / 45)), // normalize to -1..1
        y: Math.max(-1, Math.min(1, (beta - 45) / 45)), // 0 = holding upright at 45deg
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [enabled, supported, permissionGranted]);

  return { tilt, supported, permissionGranted, requestPermission };
}
