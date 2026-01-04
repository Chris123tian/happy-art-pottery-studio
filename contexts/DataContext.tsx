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
    queryFn: () => dataService.getSettings(),
    staleTime: 30000,
    gcTime: 300000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: () => dataService.getClasses(),
    staleTime: 30000,
    gcTime: 300000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: () => dataService.getBookings(),
    staleTime: 30000,
    gcTime: 300000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const messagesQuery = useQuery({
    queryKey: ['messages'],
    queryFn: () => dataService.getMessages(),
    staleTime: 30000,
    gcTime: 300000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const instructorsQuery = useQuery({
    queryKey: ['instructors'],
    queryFn: () => dataService.getInstructors(),
    staleTime: 30000,
    gcTime: 300000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const galleryQuery = useQuery({
    queryKey: ['gallery'],
    queryFn: () => dataService.getGallery(),
    staleTime: 30000,
    gcTime: 300000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: () => dataService.getEvents(),
    staleTime: 30000,
    gcTime: 300000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const testimonialsQuery = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => dataService.getTestimonials(),
    staleTime: 30000,
    gcTime: 300000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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

  return {
    settings: realtimeSettings || settingsQuery.data || null,
    classes: realtimeClasses.length > 0 ? realtimeClasses : classesQuery.data || [],
    bookings: realtimeBookings.length > 0 ? realtimeBookings : bookingsQuery.data || [],
    messages: realtimeMessages.length > 0 ? realtimeMessages : messagesQuery.data || [],
    instructors: realtimeInstructors.length > 0 ? realtimeInstructors : instructorsQuery.data || [],
    gallery: realtimeGallery.length > 0 ? realtimeGallery : galleryQuery.data || [],
    events: realtimeEvents.length > 0 ? realtimeEvents : eventsQuery.data || [],
    testimonials: realtimeTestimonials.length > 0 ? realtimeTestimonials : testimonialsQuery.data || [],
    isLoading: isAnyLoading,
  };
});

export const DataContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <DataProvider>{children}</DataProvider>;
};
