import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs, router } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { useAudioStore } from '@/shared/domain/stores/audioStore';

export default function TabsLayout() {
  const currentSoundId = useAudioStore((state) => state.currentSoundId);
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const hasActiveSound = Boolean(currentSoundId && isPlaying);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8f5bff',
        tabBarInactiveTintColor: '#a5afbf',
        tabBarShowLabel: false,
        tabBarBackground: () => (
          <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
        ),
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="home" size={size} />,
        }}
      />
      <Tabs.Screen
        name="now-playing"
        listeners={{
          tabPress: (event) => {
            if (hasActiveSound) {
              event.preventDefault();
              router.push('/player');
            }
          },
        }}
        options={{
          title: 'Now Playing',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons color={color} name="graphic-eq" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="heart" size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="settings" size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(18,20,26,0.94)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    bottom: 18,
    height: 86,
    left: 20,
    paddingBottom: Platform.OS === 'ios' ? 18 : 12,
    paddingTop: 12,
    position: 'absolute',
    right: 20,
  },
});
