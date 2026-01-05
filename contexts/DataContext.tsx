import React, { ReactNode, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/dataService';
import { database } from '@/services/database';
import createContextHook from '@nkzw/create-context-hook';
import { SiteSettings, Class, Booking, Message, Instructor, GalleryImage, Event, Testimonial } from '@/types';

export const [DataProvider, useData] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [realtimeSettings, setRealtimeSettings] = useState<SiteSettings | null>(null);
  const [realtimeClasses, setRealtimeClasses] = useState<Class[]>([]);
  const [realtimeBookings, setRealtimeBookings] = useState<Booking[]>([]);
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);
  const [realtimeInstructors, setRealtimeInstructors] = useState<Instructor[]>([]);
  const [realtimeGallery, setRealtimeGallery] = useState<GalleryImage[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<Event[]>([]);
  const [realtimeTestimonials, setRealtimeTestimonials] = useState<Testimonial[]>([]);

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const result = await dataService.getSettings();
        return result;
      } catch (error) {
        console.error('[DataContext] Failed to fetch settings:', error);
        throw error;
      }
    },
    staleTime: 0,
    gcTime: 300000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      try {
        const result = await dataService.getClasses();
        return result;
      } catch (error) {
        console.error('[DataContext] Failed to fetch classes:', error);
        throw error;
      }
    },
    staleTime: 0,
    gcTime: 300000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      try {
        const result = await dataService.getBookings();
        return result;
      } catch (error) {
        console.error('[DataContext] Failed to fetch bookings:', error);
        return [];
      }
    },
    staleTime: 0,
    gcTime: 300000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const messagesQuery = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      try {
        const result = await dataService.getMessages();
        return result;
      } catch (error) {
        console.error('[DataContext] Failed to fetch messages:', error);
        return [];
      }
    },
    staleTime: 0,
    gcTime: 300000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const instructorsQuery = useQuery({
    queryKey: ['instructors'],
    queryFn: async () => {
      try {
        const result = await dataService.getInstructors();
        return result;
      } catch (error) {
        console.error('[DataContext] Failed to fetch instructors:', error);
        throw error;
      }
    },
    staleTime: 0,
    gcTime: 300000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const galleryQuery = useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      try {
        const result = await dataService.getGallery();
        return result;
      } catch (error) {
        console.error('[DataContext] Failed to fetch gallery:', error);
        throw error;
      }
    },
    staleTime: 0,
    gcTime: 300000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        const result = await dataService.getEvents();
        return result;
      } catch (error) {
        console.error('[DataContext] Failed to fetch events:', error);
        throw error;
      }
    },
    staleTime: 0,
    gcTime: 300000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const testimonialsQuery = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      try {
        const result = await dataService.getTestimonials();
        return result;
      } catch (error) {
        console.error('[DataContext] Failed to fetch testimonials:', error);
        throw error;
      }
    },
    staleTime: 0,
    gcTime: 300000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  useEffect(() => {
    console.log('[DataContext] Setting up real-time listeners...');
    
    const unsubSettings = database.subscribeToCollection<SiteSettings>(
      'settings',
      (data) => {
        if (data.length > 0) {
          setRealtimeSettings(data[0]);
          queryClient.setQueryData(['settings'], data[0]);
        }
      }
    );

    const unsubClasses = database.subscribeToCollection<Class>(
      'classes',
      (data) => {
        setRealtimeClasses(data);
        queryClient.setQueryData(['classes'], data);
      }
    );

    const unsubBookings = database.subscribeToCollection<Booking>(
      'bookings',
      (data) => {
        setRealtimeBookings(data);
        queryClient.setQueryData(['bookings'], data);
      }
    );

    const unsubMessages = database.subscribeToCollection<Message>(
      'messages',
      (data) => {
        setRealtimeMessages(data);
        queryClient.setQueryData(['messages'], data);
      }
    );

    const unsubInstructors = database.subscribeToCollection<Instructor>(
      'instructors',
      (data) => {
        setRealtimeInstructors(data);
        queryClient.setQueryData(['instructors'], data);
      }
    );

    const unsubGallery = database.subscribeToCollection<GalleryImage>(
      'gallery',
      (data) => {
        setRealtimeGallery(data);
        queryClient.setQueryData(['gallery'], data);
      }
    );

    const unsubEvents = database.subscribeToCollection<Event>(
      'events',
      (data) => {
        setRealtimeEvents(data);
        queryClient.setQueryData(['events'], data);
      }
    );

    const unsubTestimonials = database.subscribeToCollection<Testimonial>(
      'testimonials',
      (data) => {
        setRealtimeTestimonials(data);
        queryClient.setQueryData(['testimonials'], data);
      }
    );

    return () => {
      console.log('[DataContext] Cleaning up real-time listeners');
      unsubSettings();
      unsubClasses();
      unsubBookings();
      unsubMessages();
      unsubInstructors();
      unsubGallery();
      unsubEvents();
      unsubTestimonials();
    };
  }, [queryClient]);

  const isAnyLoading = 
    settingsQuery.isLoading ||
    classesQuery.isLoading ||
    galleryQuery.isLoading ||
    instructorsQuery.isLoading ||
    testimonialsQuery.isLoading;

  const settings = realtimeSettings || settingsQuery.data || null;
  const classes = realtimeClasses.length > 0 ? realtimeClasses : (classesQuery.data || []);
  const bookings = realtimeBookings.length > 0 ? realtimeBookings : (bookingsQuery.data || []);
  const messages = realtimeMessages.length > 0 ? realtimeMessages : (messagesQuery.data || []);
  const instructors = realtimeInstructors.length > 0 ? realtimeInstructors : (instructorsQuery.data || []);
  const gallery = realtimeGallery.length > 0 ? realtimeGallery : (galleryQuery.data || []);
  const events = realtimeEvents.length > 0 ? realtimeEvents : (eventsQuery.data || []);
  const testimonials = realtimeTestimonials.length > 0 ? realtimeTestimonials : (testimonialsQuery.data || []);

  return {
    settings,
    classes,
    bookings,
    messages,
    instructors,
    gallery,
    events,
    testimonials,
    isLoading: isAnyLoading,
    isError: settingsQuery.isError || classesQuery.isError,
  };
});

export const DataContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <DataProvider>{children}</DataProvider>;
};
