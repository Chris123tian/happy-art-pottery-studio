import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataContextProvider } from '@/contexts/DataContext';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="classes" />
      <Stack.Screen name="gallery" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="admin/login" />
      <Stack.Screen name="admin/dashboard" />
      <Stack.Screen name="admin/classes" />
      <Stack.Screen name="admin/bookings" />
      <Stack.Screen name="admin/gallery" />
      <Stack.Screen name="admin/events" />
      <Stack.Screen name="admin/messages" />
      <Stack.Screen name="admin/settings" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <DataContextProvider>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </AuthProvider>
    </DataContextProvider>
  );
}
