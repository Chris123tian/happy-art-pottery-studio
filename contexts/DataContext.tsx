import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { dataService } from '@/services/dataService';
import createContextHook from '@nkzw/create-context-hook';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },
});

export const [DataProvider, useData] = createContextHook(() => {
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => dataService.getSettings(),
  });

  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: () => dataService.getClasses(),
  });

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: () => dataService.getBookings(),
  });

  const messagesQuery = useQuery({
    queryKey: ['messages'],
    queryFn: () => dataService.getMessages(),
  });

  const instructorsQuery = useQuery({
    queryKey: ['instructors'],
    queryFn: () => dataService.getInstructors(),
  });

  const galleryQuery = useQuery({
    queryKey: ['gallery'],
    queryFn: () => dataService.getGallery(),
  });

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: () => dataService.getEvents(),
  });

  const testimonialsQuery = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => dataService.getTestimonials(),
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
  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>{children}</DataProvider>
    </QueryClientProvider>
  );
};
