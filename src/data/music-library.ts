export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  mood: string;
  duration: string;
  url: string;
  emoji: string;
}

export const MUSIC_LIBRARY: MusicTrack[] = [
  { id: 'warm-1', title: 'Golden Hour', artist: 'Soft Piano', mood: 'warm', duration: '2:30', url: '/music/golden-hour.mp3', emoji: '🌅' },
  { id: 'warm-2', title: 'Sunday Morning', artist: 'Acoustic Guitar', mood: 'warm', duration: '3:00', url: '/music/sunday-morning.mp3', emoji: '☀️' },
  { id: 'playful-1', title: 'Confetti', artist: 'Upbeat Pop', mood: 'playful', duration: '2:45', url: '/music/confetti.mp3', emoji: '🎉' },
  { id: 'playful-2', title: 'Birthday Vibes', artist: 'Fun Beat', mood: 'playful', duration: '2:15', url: '/music/birthday-vibes.mp3', emoji: '🎂' },
  { id: 'romantic-1', title: 'Starlight', artist: 'Soft Strings', mood: 'romantic', duration: '3:15', url: '/music/starlight.mp3', emoji: '✨' },
  { id: 'romantic-2', title: 'Promise', artist: 'Piano & Cello', mood: 'romantic', duration: '2:50', url: '/music/promise.mp3', emoji: '💖' },
  { id: 'chill-1', title: 'Lo-Fi Dreams', artist: 'Chill Beats', mood: 'minimal', duration: '3:30', url: '/music/lofi-dreams.mp3', emoji: '🎧' },
  { id: 'chill-2', title: 'Rainy Day', artist: 'Ambient', mood: 'minimal', duration: '2:40', url: '/music/rainy-day.mp3', emoji: '🌧️' },
];

export function getTrackById(id: string): MusicTrack | undefined {
  return MUSIC_LIBRARY.find((t) => t.id === id);
}
