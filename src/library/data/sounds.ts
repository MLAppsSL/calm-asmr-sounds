export type LibrarySoundCategory = 'rain' | 'fire' | 'forest' | 'wave';

export type LibrarySound = {
  id: string;
  name: string;
  subtitle: string;
  category: LibrarySoundCategory;
  duration: string;
  durationSeconds: number;
  isPremium: boolean;
  imageAsset: string;
};

export const SOUNDS: LibrarySound[] = [
  {
    id: 'rain-01',
    name: 'Heavy Rain',
    subtitle: 'Steady downpour',
    category: 'rain',
    duration: '2:00',
    durationSeconds: 120,
    isPremium: false,
    imageAsset: '#1a2535',
  },
  {
    id: 'rain-02',
    name: 'Light Drizzle',
    subtitle: 'Soft patter',
    category: 'rain',
    duration: '1:30',
    durationSeconds: 90,
    isPremium: false,
    imageAsset: '#1a2535',
  },
  {
    id: 'rain-03',
    name: 'Storm Thunder',
    subtitle: 'Rolling thunder',
    category: 'rain',
    duration: '3:00',
    durationSeconds: 180,
    isPremium: true,
    imageAsset: '#1a2535',
  },
  {
    id: 'rain-04',
    name: 'Rain on Glass',
    subtitle: 'Window tapping',
    category: 'rain',
    duration: '2:30',
    durationSeconds: 150,
    isPremium: true,
    imageAsset: '#1a2535',
  },
  {
    id: 'fire-01',
    name: 'Campfire',
    subtitle: 'Crackling logs',
    category: 'fire',
    duration: '2:00',
    durationSeconds: 120,
    isPremium: false,
    imageAsset: '#2a1a0e',
  },
  {
    id: 'fire-02',
    name: 'Fireplace',
    subtitle: 'Gentle hearth',
    category: 'fire',
    duration: '3:00',
    durationSeconds: 180,
    isPremium: false,
    imageAsset: '#2a1a0e',
  },
  {
    id: 'fire-03',
    name: 'Bonfire',
    subtitle: 'Open flame',
    category: 'fire',
    duration: '2:30',
    durationSeconds: 150,
    isPremium: true,
    imageAsset: '#2a1a0e',
  },
  {
    id: 'fire-04',
    name: 'Ember Glow',
    subtitle: 'Dying embers',
    category: 'fire',
    duration: '1:30',
    durationSeconds: 90,
    isPremium: true,
    imageAsset: '#2a1a0e',
  },
  {
    id: 'forest-01',
    name: 'Morning Birds',
    subtitle: 'Dawn chorus',
    category: 'forest',
    duration: '2:00',
    durationSeconds: 120,
    isPremium: false,
    imageAsset: '#0e1f10',
  },
  {
    id: 'forest-02',
    name: 'Deep Forest',
    subtitle: 'Rustling leaves',
    category: 'forest',
    duration: '3:00',
    durationSeconds: 180,
    isPremium: false,
    imageAsset: '#0e1f10',
  },
  {
    id: 'forest-03',
    name: 'Creek Flow',
    subtitle: 'Stream over rocks',
    category: 'forest',
    duration: '2:30',
    durationSeconds: 150,
    isPremium: true,
    imageAsset: '#0e1f10',
  },
  {
    id: 'forest-04',
    name: 'Wind in Pines',
    subtitle: 'Swaying canopy',
    category: 'forest',
    duration: '2:00',
    durationSeconds: 120,
    isPremium: true,
    imageAsset: '#0e1f10',
  },
  {
    id: 'forest-05',
    name: 'Hidden Grove',
    subtitle: 'Quiet woodland',
    category: 'forest',
    duration: '2:10',
    durationSeconds: 130,
    isPremium: false,
    imageAsset: '#0e1f10',
  },
  {
    id: 'wave-01',
    name: 'Ocean Waves',
    subtitle: 'Rhythmic surf',
    category: 'wave',
    duration: '2:00',
    durationSeconds: 120,
    isPremium: false,
    imageAsset: '#0e1a2a',
  },
  {
    id: 'wave-02',
    name: 'Beach Shore',
    subtitle: 'Gentle lapping',
    category: 'wave',
    duration: '1:30',
    durationSeconds: 90,
    isPremium: false,
    imageAsset: '#0e1a2a',
  },
  {
    id: 'wave-03',
    name: 'Deep Sea',
    subtitle: 'Underwater calm',
    category: 'wave',
    duration: '3:00',
    durationSeconds: 180,
    isPremium: true,
    imageAsset: '#0e1a2a',
  },
  {
    id: 'wave-04',
    name: 'Storm Surge',
    subtitle: 'Crashing swells',
    category: 'wave',
    duration: '2:30',
    durationSeconds: 150,
    isPremium: true,
    imageAsset: '#0e1a2a',
  },
];

export const CATEGORIES: { id: LibrarySoundCategory; label: string }[] = [
  { id: 'rain', label: 'Rain' },
  { id: 'fire', label: 'Fire' },
  { id: 'forest', label: 'Forest' },
  { id: 'wave', label: 'Ocean' },
];

export function getSoundsByCategory(category: LibrarySoundCategory): LibrarySound[] {
  return SOUNDS.filter((sound) => sound.category === category);
}
