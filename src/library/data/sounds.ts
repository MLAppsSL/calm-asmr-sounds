export type LibrarySoundCategory = 'nature' | 'ambient';
export type LibrarySoundBadge = 'pro' | 'lock' | 'equalizer' | null;
export type LibrarySoundArtwork =
  | 'rain'
  | 'forest'
  | 'ocean'
  | 'vinyl'
  | 'white'
  | 'cafe'
  | 'train';
export type LibrarySoundCardVariant = 'wide' | 'square';

export type LibrarySound = {
  id: string;
  name: string;
  subtitle: string;
  category: LibrarySoundCategory;
  duration: string;
  durationSeconds: number;
  isPremium: boolean;
  imageAsset: string;
  badge: LibrarySoundBadge;
  artwork: LibrarySoundArtwork;
  cardVariant: LibrarySoundCardVariant;
  accentColor: string;
};

export const SOUNDS: LibrarySound[] = [
  {
    id: 'rain-01',
    name: 'Heavy Rain',
    subtitle: 'Tropical storm',
    category: 'nature',
    duration: '2:00',
    durationSeconds: 120,
    isPremium: false,
    imageAsset: '#11141b',
    badge: 'equalizer',
    artwork: 'rain',
    cardVariant: 'wide',
    accentColor: '#8f5bff',
  },
  {
    id: 'forest-02',
    name: 'Evergreen',
    subtitle: 'Morning birds',
    category: 'nature',
    duration: '3:00',
    durationSeconds: 180,
    isPremium: true,
    imageAsset: '#172018',
    badge: 'pro',
    artwork: 'forest',
    cardVariant: 'wide',
    accentColor: '#7b50ff',
  },
  {
    id: 'wave-03',
    name: 'Deep Ocean',
    subtitle: 'Rolling waves',
    category: 'nature',
    duration: '3:00',
    durationSeconds: 180,
    isPremium: false,
    imageAsset: '#1f657f',
    badge: null,
    artwork: 'ocean',
    cardVariant: 'wide',
    accentColor: '#57c6ff',
  },
  {
    id: 'rain-04',
    name: 'Vinyl Static',
    subtitle: 'Analog warmth',
    category: 'ambient',
    duration: '2:30',
    durationSeconds: 150,
    isPremium: true,
    imageAsset: '#c8c5c4',
    badge: 'lock',
    artwork: 'vinyl',
    cardVariant: 'square',
    accentColor: '#b78cff',
  },
  {
    id: 'fire-02',
    name: 'Pure White',
    subtitle: 'Static focus',
    category: 'ambient',
    duration: '3:00',
    durationSeconds: 180,
    isPremium: false,
    imageAsset: '#c9c9c9',
    badge: null,
    artwork: 'white',
    cardVariant: 'square',
    accentColor: '#dddddd',
  },
  {
    id: 'fire-01',
    name: 'Paris Cafe',
    subtitle: 'Gentle chatter',
    category: 'ambient',
    duration: '2:00',
    durationSeconds: 120,
    isPremium: true,
    imageAsset: '#b28e6f',
    badge: 'lock',
    artwork: 'cafe',
    cardVariant: 'square',
    accentColor: '#ffbe43',
  },
  {
    id: 'forest-03',
    name: 'Night Train',
    subtitle: 'Rhythmic tracks',
    category: 'ambient',
    duration: '2:30',
    durationSeconds: 150,
    isPremium: true,
    imageAsset: '#8aa6d0',
    badge: 'pro',
    artwork: 'train',
    cardVariant: 'square',
    accentColor: '#8f7bff',
  },
];

export function getSoundsByCategory(category: LibrarySoundCategory): LibrarySound[] {
  return SOUNDS.filter((sound) => sound.category === category);
}
