import { useRef, useState, useCallback } from 'react';

export function useReactionCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const startCamera = useCallback(async () => {
    if (streamRef.current || permissionDenied) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 640 } },
      });
      streamRef.current = stream;

      // Create hidden video element if not provided
      if (!videoRef.current) {
        const video = document.createElement('video');
        video.setAttribute('playsinline', '');
        video.setAttribute('autoplay', '');
        video.muted = true;
        video.style.position = 'fixed';
        video.style.top = '-9999px';
        video.style.left = '-9999px';
        video.style.width = '1px';
        video.style.height = '1px';
        document.body.appendChild(video);
        videoRef.current = video;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraReady(true);
      return true;
    } catch {
      setPermissionDenied(true);
      return false;
    }
  }, [permissionDenied]);

  const capturePhoto = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !cameraReady) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Mirror the image (selfie mode)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    return dataUrl;
  }, [cameraReady]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current && videoRef.current.parentNode) {
      videoRef.current.parentNode.removeChild(videoRef.current);
    }
    videoRef.current = null;
    setCameraReady(false);
  }, []);

  const reset = useCallback(() => {
    setCapturedPhoto(null);
  }, []);

  return {
    cameraReady,
    capturedPhoto,
    permissionDenied,
    startCamera,
    capturePhoto,
    stopCamera,
    reset,
  };
}
