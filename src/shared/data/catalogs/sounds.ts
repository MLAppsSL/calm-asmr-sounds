import type { SoundCategory, TimerDuration } from '../../domain/types';

export interface SoundConfig {
  id: string;
  title: string;
  category: SoundCategory;
  storageRef: string;
  isPremium: boolean;
  defaultTimerSeconds: TimerDuration;
  thumbnailUrl: string | null;
}

export const SOUNDS: SoundConfig[] = [
  {
    id: 'rain-01',
    title: 'Heavy Rain',
    category: 'rain',
    storageRef: 'sounds/rain-01.mp3',
    isPremium: false,
    defaultTimerSeconds: 120,
    thumbnailUrl: null,
  },
  {
    id: 'rain-02',
    title: 'Light Drizzle',
    category: 'rain',
    storageRef: 'sounds/rain-02.mp3',
    isPremium: false,
    defaultTimerSeconds: 90,
    thumbnailUrl: null,
  },
  {
    id: 'rain-03',
    title: 'Storm Thunder',
    category: 'rain',
    storageRef: 'sounds/rain-03.mp3',
    isPremium: true,
    defaultTimerSeconds: 180,
    thumbnailUrl: null,
  },
  {
    id: 'rain-04',
    title: 'Rain on Glass',
    category: 'rain',
    storageRef: 'sounds/rain-04.mp3',
    isPremium: true,
    defaultTimerSeconds: 150,
    thumbnailUrl: null,
  },
  {
    id: 'fire-01',
    title: 'Campfire',
    category: 'fire',
    storageRef: 'sounds/fire-01.mp3',
    isPremium: false,
    defaultTimerSeconds: 120,
    thumbnailUrl: null,
  },
  {
    id: 'fire-02',
    title: 'Fireplace',
    category: 'fire',
    storageRef: 'sounds/fire-02.mp3',
    isPremium: false,
    defaultTimerSeconds: 180,
    thumbnailUrl: null,
  },
  {
    id: 'fire-03',
    title: 'Bonfire',
    category: 'fire',
    storageRef: 'sounds/fire-03.mp3',
    isPremium: true,
    defaultTimerSeconds: 150,
    thumbnailUrl: null,
  },
  {
    id: 'fire-04',
    title: 'Ember Glow',
    category: 'fire',
    storageRef: 'sounds/fire-04.mp3',
    isPremium: true,
    defaultTimerSeconds: 90,
    thumbnailUrl: null,
  },
  {
    id: 'forest-01',
    title: 'Morning Birds',
    category: 'forest',
    storageRef: 'sounds/forest-01.mp3',
    isPremium: false,
    defaultTimerSeconds: 120,
    thumbnailUrl: null,
  },
  {
    id: 'forest-02',
    title: 'Deep Forest',
    category: 'forest',
    storageRef: 'sounds/forest-02.mp3',
    isPremium: false,
    defaultTimerSeconds: 180,
    thumbnailUrl: null,
  },
  {
    id: 'forest-03',
    title: 'Creek Flow',
    category: 'forest',
    storageRef: 'sounds/forest-03.mp3',
    isPremium: true,
    defaultTimerSeconds: 150,
    thumbnailUrl: null,
  },
  {
    id: 'forest-04',
    title: 'Wind in Pines',
    category: 'forest',
    storageRef: 'sounds/forest-04.mp3',
    isPremium: true,
    defaultTimerSeconds: 120,
    thumbnailUrl: null,
  },
  {
    id: 'forest-05',
    title: 'Hidden Grove',
    category: 'forest',
    storageRef: 'sounds/forest-05.mp3',
    isPremium: false,
    defaultTimerSeconds: 130,
    thumbnailUrl: null,
  },
  {
    id: 'wave-01',
    title: 'Ocean Waves',
    category: 'wave',
    storageRef: 'sounds/ocean-01.mp3',
    isPremium: false,
    defaultTimerSeconds: 120,
    thumbnailUrl: null,
  },
  {
    id: 'wave-02',
    title: 'Beach Shore',
    category: 'wave',
    storageRef: 'sounds/ocean-02.mp3',
    isPremium: false,
    defaultTimerSeconds: 90,
    thumbnailUrl: null,
  },
  {
    id: 'wave-03',
    title: 'Deep Sea',
    category: 'wave',
    storageRef: 'sounds/ocean-03.mp3',
    isPremium: true,
    defaultTimerSeconds: 180,
    thumbnailUrl: null,
  },
  {
    id: 'wave-04',
    title: 'Storm Surge',
    category: 'wave',
    storageRef: 'sounds/ocean-04.mp3',
    isPremium: true,
    defaultTimerSeconds: 150,
    thumbnailUrl: null,
  },
];

export const SOUNDS_BY_ID: Record<string, SoundConfig> = Object.fromEntries(
  SOUNDS.map((sound) => [sound.id, sound]),
);

export const SOUNDS_BY_CATEGORY: Record<SoundCategory, SoundConfig[]> = {
  rain: SOUNDS.filter((sound) => sound.category === 'rain'),
  fire: SOUNDS.filter((sound) => sound.category === 'fire'),
  forest: SOUNDS.filter((sound) => sound.category === 'forest'),
  wave: SOUNDS.filter((sound) => sound.category === 'wave'),
};
