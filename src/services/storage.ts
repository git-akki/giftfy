import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { nanoid } from 'nanoid';
import { isDemoMode } from '@/lib/demo-mode';
import { demoUploadAsDataUrl } from '@/lib/demo-store';

async function uploadFile(folder: string, file: File | Blob, subfolder: string): Promise<string> {
  if (isDemoMode()) return demoUploadAsDataUrl(file);
  const ext = file instanceof File ? file.name.split('.').pop() : 'webm';
  const path = `${folder}/${subfolder}/${nanoid(12)}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadPhoto(celebrationId: string, file: File): Promise<string> {
  return uploadFile('photos', file, celebrationId);
}

export async function uploadVoiceNote(celebrationId: string, blob: Blob): Promise<string> {
  return uploadFile('voice-notes', blob, celebrationId);
}

export async function uploadThankYouVoice(celebrationId: string, blob: Blob): Promise<string> {
  return uploadFile('thank-you', blob, celebrationId);
}

export async function uploadMusic(celebrationId: string, file: File): Promise<string> {
  return uploadFile('music', file, celebrationId);
}

export async function uploadVideo(celebrationId: string, file: File): Promise<string> {
  if (isDemoMode()) return demoUploadAsDataUrl(file);
  const path = `videos/${celebrationId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteFile(path: string): Promise<void> {
  if (isDemoMode()) return;
  await deleteObject(ref(storage, path));
}
