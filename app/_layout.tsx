import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useGameStore } from '../src/stores/gameStore';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
  const loadGames = useGameStore((state) => state.loadGames);

  useEffect(() => {
    loadGames();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: 'Basketball Stats' }}
        />
      </Stack>
    </>
  );
}
