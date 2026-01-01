import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Class,
  Booking,
  Message,
  Instructor,
  GalleryImage,
  Event,
  SiteSettings,
  Testimonial,
} from '@/types';

const KEYS = {
  CLASSES: 'happy_art_classes',
  BOOKINGS: 'happy_art_bookings',
  MESSAGES: 'happy_art_messages',
  INSTRUCTORS: 'happy_art_instructors',
  GALLERY: 'happy_art_gallery',
  EVENTS: 'happy_art_events',
  SETTINGS: 'happy_art_settings',
  TESTIMONIALS: 'happy_art_testimonials',
};

export const dataService = {
  async getClasses(): Promise<Class[]> {
    const data = await AsyncStorage.getItem(KEYS.CLASSES);
    return data ? JSON.parse(data) : [];
  },

  async setClasses(classes: Class[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.CLASSES, JSON.stringify(classes));
  },

  async getBookings(): Promise<Booking[]> {
    const data = await AsyncStorage.getItem(KEYS.BOOKINGS);
    return data ? JSON.parse(data) : [];
  },

  async setBookings(bookings: Booking[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
  },

  async getMessages(): Promise<Message[]> {
    const data = await AsyncStorage.getItem(KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  },

  async setMessages(messages: Message[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
  },

  async getInstructors(): Promise<Instructor[]> {
    const data = await AsyncStorage.getItem(KEYS.INSTRUCTORS);
    return data ? JSON.parse(data) : [];
  },

  async setInstructors(instructors: Instructor[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.INSTRUCTORS, JSON.stringify(instructors));
  },

  async getGallery(): Promise<GalleryImage[]> {
    const data = await AsyncStorage.getItem(KEYS.GALLERY);
    return data ? JSON.parse(data) : [];
  },

  async setGallery(gallery: GalleryImage[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.GALLERY, JSON.stringify(gallery));
  },

  async getEvents(): Promise<Event[]> {
    const data = await AsyncStorage.getItem(KEYS.EVENTS);
    return data ? JSON.parse(data) : [];
  },

  async setEvents(events: Event[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
  },

  async getSettings(): Promise<SiteSettings | null> {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  },

  async setSettings(settings: SiteSettings): Promise<void> {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  async getTestimonials(): Promise<Testimonial[]> {
    const data = await AsyncStorage.getItem(KEYS.TESTIMONIALS);
    return data ? JSON.parse(data) : [];
  },

  async setTestimonials(testimonials: Testimonial[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.TESTIMONIALS, JSON.stringify(testimonials));
  },
};
