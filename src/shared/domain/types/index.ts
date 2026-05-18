export type SoundCategory = 'rain' | 'fire' | 'forest' | 'ocean' | 'wind' | 'white-noise';

export type TimerDuration = 60 | 120 | 180;

export interface Sound {
  id: string;
  title: string;
  category: SoundCategory;
  durationSeconds: TimerDuration;
  isPremium: boolean;
  storageUrl: string | null;
  thumbnailUrl: string | null;
}

export interface User {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
}
