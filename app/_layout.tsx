import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataContextProvider } from '@/contexts/DataContext';
import { dataService } from '@/services/dataService';
import { seedClasses, seedInstructors, seedGallery, seedEvents, seedSettings, seedTestimonials } from '@/services/seedData';

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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const existingSettings = await dataService.getSettings();
        if (!existingSettings) {
          await Promise.all([
            dataService.setClasses(seedClasses),
            dataService.setInstructors(seedInstructors),
            dataService.setGallery(seedGallery),
            dataService.setEvents(seedEvents),
            dataService.setSettings(seedSettings),
            dataService.setTestimonials(seedTestimonials),
          ]);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    };
    initializeApp();
  }, []);

  if (!isReady) {
    return null;
  }

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
