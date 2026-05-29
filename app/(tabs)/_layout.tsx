import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { useAudioStore } from '@/shared/domain/stores/audioStore';

export default function TabsLayout() {
  const { currentSoundId, isPlaying } = useAudioStore(
    useShallow((state) => ({
      currentSoundId: state.currentSoundId,
      isPlaying: state.isPlaying,
    })),
  );
  const hasActiveSound = Boolean(currentSoundId && isPlaying);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarShowLabel: false,
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
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
    backgroundColor: 'rgba(26,28,34,0.8)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    bottom: 24,
    height: 64,
    left: 24,
    paddingBottom: Platform.OS === 'ios' ? 18 : 12,
    paddingTop: 6,
    position: 'absolute',
    right: 24,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,28,34,0.92)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    borderWidth: 1,
  },
});
