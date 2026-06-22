import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ToastProvider } from "@/components/ui/NetrilensToast";
import { initializeNotifications  } from '@/src/services/notifications/notificationService';
import { useEffect } from 'react';

const queryClient = new QueryClient();
useEffect(() => {

   initializeNotifications();

}, []);
export default function RootLayout() {

  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>

      <ThemeProvider
        value={
          colorScheme === 'dark'
            ? DarkTheme
            : DefaultTheme
        }>
        <ToastProvider>
           <Stack
          screenOptions={{
            headerShown: false,
          }}>
        
          <Stack.Screen name="index" />

          <Stack.Screen name="onboarding" />

          <Stack.Screen name="(auth)" />

          <Stack.Screen name="(tabs)" />

          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
            }}
          />

        </Stack>
        </ToastProvider>

        <StatusBar style="auto" />

      </ThemeProvider>

    </QueryClientProvider>
  );
}