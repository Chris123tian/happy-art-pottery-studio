import React, { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/services/dataService';
import createContextHook from '@nkzw/create-context-hook';

export const [DataProvider, useData] = createContextHook(() => {
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => dataService.getSettings(),
    staleTime: 0,
    refetchOnMount: true,
  });

  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: () => dataService.getClasses(),
    staleTime: 0,
    refetchOnMount: true,
  });

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: () => dataService.getBookings(),
    staleTime: 0,
    refetchOnMount: true,
  });

  const messagesQuery = useQuery({
    queryKey: ['messages'],
    queryFn: () => dataService.getMessages(),
    staleTime: 0,
    refetchOnMount: true,
  });

  const instructorsQuery = useQuery({
    queryKey: ['instructors'],
    queryFn: () => dataService.getInstructors(),
    staleTime: 0,
    refetchOnMount: true,
  });

  const galleryQuery = useQuery({
    queryKey: ['gallery'],
    queryFn: () => dataService.getGallery(),
    staleTime: 0,
    refetchOnMount: true,
  });

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: () => dataService.getEvents(),
    staleTime: 0,
    refetchOnMount: true,
  });

  const testimonialsQuery = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => dataService.getTestimonials(),
    staleTime: 0,
    refetchOnMount: true,
  });

  const isAnyLoading = 
    settingsQuery.isLoading ||
    classesQuery.isLoading ||
    galleryQuery.isLoading ||
    instructorsQuery.isLoading ||
    testimonialsQuery.isLoading;

  return {
    settings: settingsQuery.data ?? null,
    classes: classesQuery.data ?? [],
    bookings: bookingsQuery.data ?? [],
    messages: messagesQuery.data ?? [],
    instructors: instructorsQuery.data ?? [],
    gallery: galleryQuery.data ?? [],
    events: eventsQuery.data ?? [],
    testimonials: testimonialsQuery.data ?? [],
    isLoading: isAnyLoading,
  };
});

export const DataContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <DataProvider>{children}</DataProvider>;
};
