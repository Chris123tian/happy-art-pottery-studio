import React, { ReactNode, useEffect, useState, useRef, useCallback } from 'react';
import { database } from '@/services/database';
import createContextHook from '@nkzw/create-context-hook';
import { SiteSettings, Class, Booking, Message, Instructor, GalleryImage, Event, Testimonial, Review } from '@/types';
import { useAuth } from './AuthContext';

export const [DataProvider, useData] = createContextHook(() => {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError] = useState(false);
  const unsubscribeRef = useRef<(() => void)[]>([]);
  const prevAuthRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (prevAuthRef.current !== null) {
      console.log('[DataContext] Cleaning up previous listeners before re-setup');
      unsubscribeRef.current.forEach((unsub) => {
        try { unsub(); } catch (e) { console.error('[DataContext] Cleanup error:', e); }
      });
      unsubscribeRef.current = [];
      database.unsubscribeAll();
    }
    prevAuthRef.current = isAuthenticated;

    console.log('[DataContext] Setting up real-time listeners...');
    console.log('[DataContext] Admin authenticated:', isAuthenticated);
    setIsLoading(true);

    let loadedCount = 0;
    const totalCollections = isAuthenticated ? 9 : 7;

    const markLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalCollections) {
        setIsLoading(false);
      }
    };

    const unsubSettings = database.subscribeToCollection<SiteSettings>(
      'settings',
      (data) => {
        if (data.length > 0) {
          const s = data[0];
          console.log('[DataContext] Settings loaded - heroImage:', s.heroImage ? s.heroImage.substring(0, 80) + '...' : 'EMPTY');
          console.log('[DataContext] Settings loaded - heroImages count:', s.heroImages?.length || 0);
          console.log('[DataContext] Settings loaded - aboutImage:', s.aboutImage ? s.aboutImage.substring(0, 80) + '...' : 'EMPTY');
          console.log('[DataContext] Settings loaded - services count:', s.services?.length || 0);
          if (s.services?.length) {
            s.services.forEach((svc, i) => {
              console.log(`[DataContext] Service[${i}] "${svc.title}" image:`, svc.image ? svc.image.substring(0, 80) + '...' : 'EMPTY');
            });
          }
          setSettings(s);
        }
        markLoaded();
      },
      (error) => {
        console.error('[DataContext] Settings subscription error:', error);
        markLoaded();
      }
    );

    const unsubClasses = database.subscribeToCollection<Class>(
      'classes',
      (data) => { setClasses(data); markLoaded(); },
      (error) => { console.error('[DataContext] Classes error:', error); markLoaded(); }
    );

    let unsubBookings: () => void = () => {};
    let unsubMessages: () => void = () => {};

    if (isAuthenticated) {
      unsubBookings = database.subscribeToCollection<Booking>(
        'bookings',
        (data) => { setBookings(data); markLoaded(); },
        (error) => { console.error('[DataContext] Bookings error:', error); markLoaded(); }
      );
      unsubMessages = database.subscribeToCollection<Message>(
        'messages',
        (data) => { setMessages(data); markLoaded(); },
        (error) => { console.error('[DataContext] Messages error:', error); markLoaded(); }
      );
    } else {
      setBookings([]);
      setMessages([]);
    }

    const unsubInstructors = database.subscribeToCollection<Instructor>(
      'instructors',
      (data) => {
        console.log('[DataContext] Instructors loaded:', data.length);
        setInstructors(data);
        markLoaded();
      },
      (error) => { console.error('[DataContext] Instructors error:', error); markLoaded(); }
    );

    const unsubGallery = database.subscribeToCollection<GalleryImage>(
      'gallery',
      (data) => { setGallery(data); markLoaded(); },
      (error) => { console.error('[DataContext] Gallery error:', error); markLoaded(); }
    );

    const unsubEvents = database.subscribeToCollection<Event>(
      'events',
      (data) => {
        console.log('[DataContext] Events updated:', data.length, 'events');
        setEvents(data);
        markLoaded();
      },
      (error) => { console.error('[DataContext] Events error:', error); markLoaded(); }
    );

    const unsubTestimonials = database.subscribeToCollection<Testimonial>(
      'testimonials',
      (data) => { setTestimonials(data); markLoaded(); },
      (error) => { console.error('[DataContext] Testimonials error:', error); markLoaded(); }
    );

    const unsubReviews = database.subscribeToCollection<Review>(
      'reviews',
      (data) => {
        console.log('[DataContext] Reviews updated:', data.length, 'reviews');
        setReviews(data);
        markLoaded();
      },
      (error) => { console.error('[DataContext] Reviews error:', error); markLoaded(); }
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
      unsubReviews,
    ];

    return () => {
      console.log('[DataContext] Cleaning up real-time listeners');
      unsubscribeRef.current.forEach((unsub) => {
        try { unsub(); } catch (error) { console.error('[DataContext] Cleanup error:', error); }
      });
      unsubscribeRef.current = [];
    };
  }, [isAuthenticated]);

  return {
    settings,
    classes,
    bookings,
    messages,
    instructors,
    gallery,
    events,
    testimonials,
    reviews,
    isLoading,
    isError,
  };
});

export const DataContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <DataProvider>{children}</DataProvider>;
};
