export function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true';
}

export const DEMO_USER = {
  uid: 'demo-user',
  email: 'demo@giftfy.local',
  displayName: 'Demo User',
  photoURL: null as string | null,
};
