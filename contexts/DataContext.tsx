import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { dataService } from '@/services/dataService';
import createContextHook from '@nkzw/create-context-hook';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

export const [DataProvider, useData] = createContextHook(() => {
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

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => dataService.getSettings(),
  });

  const testimonialsQuery = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => dataService.getTestimonials(),
  });

  return {
    classes: classesQuery.data ?? [],
    bookings: bookingsQuery.data ?? [],
    messages: messagesQuery.data ?? [],
    instructors: instructorsQuery.data ?? [],
    gallery: galleryQuery.data ?? [],
    events: eventsQuery.data ?? [],
    settings: settingsQuery.data ?? null,
    testimonials: testimonialsQuery.data ?? [],
    isLoading:
      classesQuery.isLoading ||
      bookingsQuery.isLoading ||
      messagesQuery.isLoading ||
      instructorsQuery.isLoading ||
      galleryQuery.isLoading ||
      eventsQuery.isLoading ||
      settingsQuery.isLoading ||
      testimonialsQuery.isLoading,
    refetchAll: () => {
      classesQuery.refetch();
      bookingsQuery.refetch();
      messagesQuery.refetch();
      instructorsQuery.refetch();
      galleryQuery.refetch();
      eventsQuery.refetch();
      settingsQuery.refetch();
      testimonialsQuery.refetch();
    },
  };
});

export const DataContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>{children}</DataProvider>
    </QueryClientProvider>
  );
};
