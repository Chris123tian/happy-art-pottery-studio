import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { database } from '@/services/database';
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
  const [isError] = useState(false);
  const unsubscribeRef = useRef<(() => void)[]>([]);
  const listenersSetup = useRef(false);

  useEffect(() => {
    if (listenersSetup.current) {
      console.log('[DataContext] Listeners already set up, skipping');
      return;
    }
    
    listenersSetup.current = true;
    console.log('[DataContext] Setting up real-time listeners...');

    let dataReceived = 0;
    const totalCollections = 8;
    
    const unsubSettings = database.subscribeToCollection<SiteSettings>(
      'settings',
      (data) => {
        if (data.length > 0) {
          setSettings(data[0]);
        }
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('[DataContext] Settings subscription error:', error);
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      }
    );

    const unsubClasses = database.subscribeToCollection<Class>(
      'classes',
      (data) => {
        setClasses(data);
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('[DataContext] Classes subscription error:', error);
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      }
    );

    const unsubBookings = database.subscribeToCollection<Booking>(
      'bookings',
      (data) => {
        setBookings(data);
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('[DataContext] Bookings subscription error:', error);
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      }
    );

    const unsubMessages = database.subscribeToCollection<Message>(
      'messages',
      (data) => {
        setMessages(data);
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('[DataContext] Messages subscription error:', error);
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      }
    );

    const unsubInstructors = database.subscribeToCollection<Instructor>(
      'instructors',
      (data) => {
        setInstructors(data);
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('[DataContext] Instructors subscription error:', error);
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      }
    );

    const unsubGallery = database.subscribeToCollection<GalleryImage>(
      'gallery',
      (data) => {
        setGallery(data);
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('[DataContext] Gallery subscription error:', error);
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      }
    );

    const unsubEvents = database.subscribeToCollection<Event>(
      'events',
      (data) => {
        setEvents(data);
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('[DataContext] Events subscription error:', error);
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      }
    );

    const unsubTestimonials = database.subscribeToCollection<Testimonial>(
      'testimonials',
      (data) => {
        setTestimonials(data);
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('[DataContext] Testimonials subscription error:', error);
        dataReceived++;
        if (dataReceived === totalCollections) {
          setIsLoading(false);
        }
      }
    );

    unsubscribeRef.current = [
      unsubSettings,
      unsubClasses,
      unsubBookings,
      unsubMessages,
      unsubInstructors,
      unsubGallery,
      unsubEvents,
      unsubTestimonials,
    ];

    return () => {
      console.log('[DataContext] Cleaning up real-time listeners');
      listenersSetup.current = false;
      unsubscribeRef.current.forEach((unsub) => {
        try {
          unsub();
        } catch (error) {
          console.error('[DataContext] Error during cleanup:', error);
        }
      });
      unsubscribeRef.current = [];
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
