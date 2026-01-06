import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { database } from '@/services/database';
import { dataService } from '@/services/dataService';
import createContextHook from '@nkzw/create-context-hook';
import { SiteSettings, Class, Booking, Message, Instructor, GalleryImage, Event, Testimonial } from '@/types';

export const [DataProvider, useData] = createContextHook(() => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const listenersSetup = useRef(false);

  useEffect(() => {
    if (listenersSetup.current) {
      console.log('[DataContext] Listeners already setup, skipping');
      return;
    }

    console.log('[DataContext] Setting up real-time listeners...');
    listenersSetup.current = true;

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [settingsData, classesData, instructorsData, galleryData, eventsData, testimonialsData] = await Promise.all([
          dataService.getSettings().catch(() => null),
          dataService.getClasses().catch(() => []),
          dataService.getInstructors().catch(() => []),
          dataService.getGallery().catch(() => []),
          dataService.getEvents().catch(() => []),
          dataService.getTestimonials().catch(() => []),
        ]);

        if (settingsData) setSettings(settingsData);
        setClasses(classesData);
        setInstructors(instructorsData);
        setGallery(galleryData);
        setEvents(eventsData);
        setTestimonials(testimonialsData);
        setIsLoading(false);
      } catch (error) {
        console.error('[DataContext] Failed to load initial data:', error);
        setIsError(true);
        setIsLoading(false);
      }
    };

    loadInitialData();
    
    const unsubSettings = database.subscribeToCollection<SiteSettings>(
      'settings',
      (data) => {
        if (data.length > 0) {
          setSettings(data[0]);
        }
      },
      (error) => {
        console.error('[DataContext] Settings subscription error:', error);
      }
    );

    const unsubClasses = database.subscribeToCollection<Class>(
      'classes',
      (data) => {
        setClasses(data);
      },
      (error) => {
        console.error('[DataContext] Classes subscription error:', error);
      }
    );

    const unsubBookings = database.subscribeToCollection<Booking>(
      'bookings',
      (data) => {
        setBookings(data);
      },
      (error) => {
        console.error('[DataContext] Bookings subscription error:', error);
      }
    );

    const unsubMessages = database.subscribeToCollection<Message>(
      'messages',
      (data) => {
        setMessages(data);
      },
      (error) => {
        console.error('[DataContext] Messages subscription error:', error);
      }
    );

    const unsubInstructors = database.subscribeToCollection<Instructor>(
      'instructors',
      (data) => {
        setInstructors(data);
      },
      (error) => {
        console.error('[DataContext] Instructors subscription error:', error);
      }
    );

    const unsubGallery = database.subscribeToCollection<GalleryImage>(
      'gallery',
      (data) => {
        setGallery(data);
      },
      (error) => {
        console.error('[DataContext] Gallery subscription error:', error);
      }
    );

    const unsubEvents = database.subscribeToCollection<Event>(
      'events',
      (data) => {
        setEvents(data);
      },
      (error) => {
        console.error('[DataContext] Events subscription error:', error);
      }
    );

    const unsubTestimonials = database.subscribeToCollection<Testimonial>(
      'testimonials',
      (data) => {
        setTestimonials(data);
      },
      (error) => {
        console.error('[DataContext] Testimonials subscription error:', error);
      }
    );

    return () => {
      console.log('[DataContext] Cleaning up real-time listeners');
      listenersSetup.current = false;
      unsubSettings();
      unsubClasses();
      unsubBookings();
      unsubMessages();
      unsubInstructors();
      unsubGallery();
      unsubEvents();
      unsubTestimonials();
    };
  }, []);

  return {
    settings,
    classes,
    bookings,
    messages,
    instructors,
    gallery,
    events,
    testimonials,
    isLoading,
    isError,
  };
});

export const DataContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <DataProvider>{children}</DataProvider>;
};
