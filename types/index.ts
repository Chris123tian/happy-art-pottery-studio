export interface Class {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  featured: boolean;
}

export interface Booking {
  id: string;
  name: string;
  phone: string;
  numberOfPersons: number;
  date: string;
  day: string;
  classType: 'Wheel Throwing' | 'Pot Painting';
  bookingMethod: 'whatsapp' | 'email' | 'message';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  experience: string;
  specialties: string[];
  featured: boolean;
}

export interface GalleryImage {
  id: string;
  source: string;
  alt: string;
  category: 'pottery' | 'painting' | 'finished';
  featured: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  image: string;
  instructor: string;
  category: string;
}

export interface SiteSettings {
  studioName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  openingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
  };
  heroImage: string;
  aboutImage: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  date: string;
  image?: string;
}
