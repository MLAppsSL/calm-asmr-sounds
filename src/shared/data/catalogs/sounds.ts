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
    title: 'Gentle Rain',
    category: 'rain',
    storageRef: 'sounds/rain-01.mp3',
    isPremium: false,
    defaultTimerSeconds: 60,
    thumbnailUrl: null,
  },
  {
    id: 'rain-02',
    title: 'Heavy Rain',
    category: 'rain',
    storageRef: 'sounds/rain-02.mp3',
    isPremium: false,
    defaultTimerSeconds: 60,
    thumbnailUrl: null,
  },
  {
    id: 'fire-01',
    title: 'Crackling Fire',
    category: 'fire',
    storageRef: 'sounds/fire-01.mp3',
    isPremium: false,
    defaultTimerSeconds: 60,
    thumbnailUrl: null,
  },
  {
    id: 'fire-02',
    title: 'Campfire',
    category: 'fire',
    storageRef: 'sounds/fire-02.mp3',
    isPremium: false,
    defaultTimerSeconds: 60,
    thumbnailUrl: null,
  },
  {
    id: 'forest-01',
    title: 'Forest Birds',
    category: 'forest',
    storageRef: 'sounds/forest-01.mp3',
    isPremium: false,
    defaultTimerSeconds: 60,
    thumbnailUrl: null,
  },
  {
    id: 'forest-02',
    title: 'Deep Forest',
    category: 'forest',
    storageRef: 'sounds/forest-02.mp3',
    isPremium: false,
    defaultTimerSeconds: 60,
    thumbnailUrl: null,
  },
  {
    id: 'ocean-01',
    title: 'Ocean Waves',
    category: 'ocean',
    storageRef: 'sounds/ocean-01.mp3',
    isPremium: false,
    defaultTimerSeconds: 60,
    thumbnailUrl: null,
  },
  {
    id: 'wind-01',
    title: 'Gentle Wind',
    category: 'wind',
    storageRef: 'sounds/wind-01.mp3',
    isPremium: false,
    defaultTimerSeconds: 60,
    thumbnailUrl: null,
  },
  {
    id: 'white-noise-01',
    title: 'White Noise',
    category: 'white-noise',
    storageRef: 'sounds/white-noise-01.mp3',
    isPremium: false,
    defaultTimerSeconds: 60,
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
  ocean: SOUNDS.filter((sound) => sound.category === 'ocean'),
  wind: SOUNDS.filter((sound) => sound.category === 'wind'),
  'white-noise': SOUNDS.filter((sound) => sound.category === 'white-noise'),
};
