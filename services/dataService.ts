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
import { database } from './database';
import { seedClasses, seedInstructors, seedGallery, seedEvents, seedSettings, seedTestimonials } from './seedData';

export const dataService = {
  async getClasses(): Promise<Class[]> {
    try {
      const data = await database.select<Class>('classes');
      if (data.length === 0) {
        console.log('[DataService] No classes found, seeding initial data');
        await this.seedClasses();
        return await database.select<Class>('classes');
      }
      return data;
    } catch (error) {
      console.error('[DataService] Error getting classes:', error);
      throw error;
    }
  },

  async seedClasses(): Promise<void> {
    for (const cls of seedClasses) {
      await database.upsert('classes', cls.id, cls);
    }
  },

  async createClass(classData: Omit<Class, 'id'>): Promise<Class> {
    const id = Date.now().toString();
    return await database.create('classes', { ...classData, id });
  },

  async updateClass(id: string, classData: Partial<Class>): Promise<Class> {
    return await database.update(`classes:${id}`, classData);
  },

  async deleteClass(id: string): Promise<void> {
    await database.delete(`classes:${id}`);
  },

  async getBookings(): Promise<Booking[]> {
    try {
      return await database.select<Booking>('bookings');
    } catch (error) {
      console.error('Error getting bookings:', error);
      return [];
    }
  },

  async createBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
    const id = Date.now().toString();
    return await database.create('bookings', { ...booking, id });
  },

  async updateBooking(id: string, booking: Partial<Booking>): Promise<Booking> {
    return await database.update(`bookings:${id}`, booking);
  },

  async deleteBooking(id: string): Promise<void> {
    await database.delete(`bookings:${id}`);
  },

  async getMessages(): Promise<Message[]> {
    try {
      return await database.select<Message>('messages');
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },

  async createMessage(message: Omit<Message, 'id'>): Promise<Message> {
    const id = Date.now().toString();
    return await database.create('messages', { ...message, id });
  },

  async updateMessage(id: string, message: Partial<Message>): Promise<Message> {
    return await database.update(`messages:${id}`, message);
  },

  async deleteMessage(id: string): Promise<void> {
    await database.delete(`messages:${id}`);
  },

  async getInstructors(): Promise<Instructor[]> {
    try {
      const data = await database.select<Instructor>('instructors');
      if (data.length === 0) {
        console.log('[DataService] No instructors found, seeding initial data');
        await this.seedInstructors();
        return await database.select<Instructor>('instructors');
      }
      return data;
    } catch (error) {
      console.error('[DataService] Error getting instructors:', error);
      throw error;
    }
  },

  async seedInstructors(): Promise<void> {
    for (const instructor of seedInstructors) {
      await database.upsert('instructors', instructor.id, instructor);
    }
  },

  async createInstructor(instructor: Omit<Instructor, 'id'>): Promise<Instructor> {
    const id = Date.now().toString();
    return await database.create('instructors', { ...instructor, id });
  },

  async updateInstructor(id: string, instructor: Partial<Instructor>): Promise<Instructor> {
    return await database.update(`instructors:${id}`, instructor);
  },

  async deleteInstructor(id: string): Promise<void> {
    await database.delete(`instructors:${id}`);
  },

  async getGallery(): Promise<GalleryImage[]> {
    try {
      const data = await database.select<GalleryImage>('gallery');
      if (data.length === 0) {
        console.log('[DataService] No gallery images found, seeding initial data');
        await this.seedGallery();
        return await database.select<GalleryImage>('gallery');
      }
      return data;
    } catch (error) {
      console.error('[DataService] Error getting gallery:', error);
      throw error;
    }
  },

  async seedGallery(): Promise<void> {
    for (const image of seedGallery) {
      await database.upsert('gallery', image.id, image);
    }
  },

  async createGalleryImage(image: Omit<GalleryImage, 'id'>): Promise<GalleryImage> {
    const id = Date.now().toString();
    return await database.create('gallery', { ...image, id });
  },

  async updateGalleryImage(id: string, image: Partial<GalleryImage>): Promise<GalleryImage> {
    return await database.update(`gallery:${id}`, image);
  },

  async deleteGalleryImage(id: string): Promise<void> {
    await database.delete(`gallery:${id}`);
  },

  async getEvents(): Promise<Event[]> {
    try {
      const data = await database.select<Event>('events');
      if (data.length === 0) {
        console.log('[DataService] No events found, seeding initial data');
        await this.seedEvents();
        return await database.select<Event>('events');
      }
      return data;
    } catch (error) {
      console.error('[DataService] Error getting events:', error);
      throw error;
    }
  },

  async seedEvents(): Promise<void> {
    for (const event of seedEvents) {
      await database.upsert('events', event.id, event);
    }
  },

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    const id = Date.now().toString();
    return await database.create('events', { ...event, id });
  },

  async updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    return await database.update(`events:${id}`, event);
  },

  async deleteEvent(id: string): Promise<void> {
    await database.delete(`events:${id}`);
  },

  async getSettings(): Promise<SiteSettings | null> {
    try {
      const data = await database.select<SiteSettings>('settings');
      if (data.length === 0) {
        console.log('[DataService] No settings found, seeding initial data');
        await this.seedSettings();
        const newData = await database.select<SiteSettings>('settings');
        return newData[0] || null;
      }
      return data[0];
    } catch (error) {
      console.error('[DataService] Error getting settings:', error);
      throw error;
    }
  },

  async seedSettings(): Promise<void> {
    await database.upsert('settings', 'main', seedSettings);
  },

  async updateSettings(settings: SiteSettings): Promise<SiteSettings> {
    return await database.update('settings:main', settings);
  },

  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const data = await database.select<Testimonial>('testimonials');
      if (data.length === 0) {
        console.log('[DataService] No testimonials found, seeding initial data');
        await this.seedTestimonials();
        return await database.select<Testimonial>('testimonials');
      }
      return data;
    } catch (error) {
      console.error('[DataService] Error getting testimonials:', error);
      throw error;
    }
  },

  async seedTestimonials(): Promise<void> {
    for (const testimonial of seedTestimonials) {
      await database.upsert('testimonials', testimonial.id, testimonial);
    }
  },

  async createTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial> {
    const id = Date.now().toString();
    return await database.create('testimonials', { ...testimonial, id });
  },

  async updateTestimonial(id: string, testimonial: Partial<Testimonial>): Promise<Testimonial> {
    return await database.update(`testimonials:${id}`, testimonial);
  },

  async deleteTestimonial(id: string): Promise<void> {
    await database.delete(`testimonials:${id}`);
  },
};
