export type SoundCategory = 'rain' | 'fire' | 'forest' | 'wave';

export type TimerDuration = 90 | 120 | 130 | 150 | 180;

// Shared descriptive fields that catalog and runtime sound models can both reuse.
export interface SoundMetadata {
  id: string;
  title: string;
  category: SoundCategory;
  isPremium: boolean;
  thumbnailUrl: string | null;
}

// Runtime sound state uses a resolved playback URL and a session timer duration.
// Catalog data should stay separate and provide storageRef/defaultTimerSeconds instead.
export interface Sound extends SoundMetadata {
  durationSeconds: TimerDuration;
  storageUrl: string | null;
}

export interface User {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
}
