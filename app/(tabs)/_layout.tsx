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
        tabBarActiveTintColor: '#f8fafc',
        tabBarInactiveTintColor: 'rgba(226,232,240,0.68)',
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
    backgroundColor: 'transparent',
    borderTopColor: 'rgba(255,255,255,0.08)',
    height: 78,
    paddingBottom: Platform.OS === 'ios' ? 18 : 12,
    paddingTop: 10,
    position: 'absolute',
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.92)',
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
