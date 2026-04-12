import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataContextProvider } from '@/contexts/DataContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="classes" />
      <Stack.Screen name="events" />
      <Stack.Screen name="gallery" />
      <Stack.Screen name="blog" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="admin/login" />
      <Stack.Screen name="admin/dashboard" />
      <Stack.Screen name="admin/classes" />
      <Stack.Screen name="admin/bookings" />
      <Stack.Screen name="admin/gallery" />
      <Stack.Screen name="admin/events" />
      <Stack.Screen name="admin/messages" />
      <Stack.Screen name="admin/instructors" />
      <Stack.Screen name="admin/settings" />
      <Stack.Screen name="admin/reviews" />
      <Stack.Screen name="admin/prices" />
      <Stack.Screen name="shop" />
      <Stack.Screen name="admin/shop" />
    </Stack>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 2,
      },
    },
  }));

  useEffect(() => {
    console.log('[RootLayout] App initialized');
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DataContextProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <StatusBar style="dark" />
              <RootLayoutNav />
            </GestureHandlerRootView>
          </DataContextProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
