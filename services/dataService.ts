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
import { seedClasses, seedInstructors, seedGallery, seedEvents, seedSettings, seedTestimonials } from './seedData';

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
    try {
      const data = await AsyncStorage.getItem(KEYS.CLASSES);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.length > 0 ? parsed : seedClasses;
      }
      await this.setClasses(seedClasses);
      return seedClasses;
    } catch (error) {
      console.error('Error getting classes:', error);
      return seedClasses;
    }
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
    try {
      const data = await AsyncStorage.getItem(KEYS.INSTRUCTORS);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.length > 0 ? parsed : seedInstructors;
      }
      await this.setInstructors(seedInstructors);
      return seedInstructors;
    } catch (error) {
      console.error('Error getting instructors:', error);
      return seedInstructors;
    }
  },

  async setInstructors(instructors: Instructor[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.INSTRUCTORS, JSON.stringify(instructors));
  },

  async getGallery(): Promise<GalleryImage[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.GALLERY);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.length > 0 ? parsed : seedGallery;
      }
      await this.setGallery(seedGallery);
      return seedGallery;
    } catch (error) {
      console.error('Error getting gallery:', error);
      return seedGallery;
    }
  },

  async setGallery(gallery: GalleryImage[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.GALLERY, JSON.stringify(gallery));
  },

  async getEvents(): Promise<Event[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.EVENTS);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.length > 0 ? parsed : seedEvents;
      }
      await this.setEvents(seedEvents);
      return seedEvents;
    } catch (error) {
      console.error('Error getting events:', error);
      return seedEvents;
    }
  },

  async setEvents(events: Event[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
  },

  async getSettings(): Promise<SiteSettings | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
      await this.setSettings(seedSettings);
      return seedSettings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return seedSettings;
    }
  },

  async setSettings(settings: SiteSettings): Promise<void> {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.TESTIMONIALS);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.length > 0 ? parsed : seedTestimonials;
      }
      await this.setTestimonials(seedTestimonials);
      return seedTestimonials;
    } catch (error) {
      console.error('Error getting testimonials:', error);
      return seedTestimonials;
    }
  },

  async setTestimonials(testimonials: Testimonial[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.TESTIMONIALS, JSON.stringify(testimonials));
  },
};
