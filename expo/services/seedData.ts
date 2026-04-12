import { Class, Instructor, GalleryImage, Event, SiteSettings, Testimonial, PriceList, ServiceItem } from '@/types';

export const seedClasses: Class[] = [
  {
    id: '1',
    title: 'Wheel Throwing',
    description:
      'Learn the art of shaping clay on the pottery wheel. Perfect for individuals, groups, parties, schools, and organizations. Includes wheel throwing and free hand modeling.',
    level: 'beginner',
    category: 'pottery',
    featured: true,
  },
  {
    id: '2',
    title: 'Pot Painting',
    description:
      'Express your creativity through ceramic painting. Decorate pre-made pottery pieces with glazes and colors. Great for all skill levels and group activities.',
    level: 'beginner',
    category: 'painting',
    featured: true,
  },
];

export const seedInstructors: Instructor[] = [];

export const seedGallery: GalleryImage[] = [];

export const seedEvents: Event[] = [];

export const seedPriceList: PriceList = {
  potMaking: {
    title: 'POT MAKING',
    subcategories: [
      {
        label: 'Weekdays (Mon-Fri, except Wed)',
        items: [
          { label: 'Small group', persons: '1-7 persons', duration: '2 hrs', amount: 'GHS 320/person' },
          { label: 'Large group', persons: '8+ persons', duration: '2 hrs', amount: 'GHS 290/person' },
        ],
      },
      {
        label: 'Weekends (Sat) & Holidays',
        items: [
          { label: 'Small group', persons: '1-7 persons', duration: '2 hrs', amount: 'GHS 370/person' },
          { label: 'Large group', persons: '8+ persons', duration: '2 hrs', amount: 'GHS 340/person' },
        ],
      },
    ],
  },
  potPainting: {
    title: 'POT PAINTING',
    items: [
      { label: 'Painting a pot (depends on pot size)', amount: 'GHS 150 and above' },
      { label: 'Painting your own pots (made at Happy Art)', amount: 'GHS 120' },
    ],
  },
  notes: [
    'Groups of 20+ may request a customized class',
    'Payment: Cash or Momo (0243418149)',
    '30% non-refundable deposit required with booking',
  ],
};

export const seedServices: ServiceItem[] = [];

export const seedSettings: SiteSettings = {
  studioName: 'Happy Art Pottery Studio',
  tagline: 'Creating Beautiful Pottery Together',
  phone: '0244311110',
  whatsapp: '0244311110',
  email: 'happyart@gmail.com',
  address: 'Shiashie, Accra, Ghana',
  openingHours: {
    monday: '1:00 PM - 5:30 PM',
    tuesday: '1:00 PM - 5:30 PM',
    wednesday: 'Closed',
    thursday: '1:00 PM - 5:30 PM',
    friday: '1:00 PM - 5:30 PM',
    saturday: '1:00 PM - 5:30 PM',
    sunday: 'Closed',
  },
  socialMedia: {
    facebook: 'https://facebook.com/happyartstudio',
    instagram: 'https://instagram.com/happyartstudio',
    twitter: 'https://twitter.com/happyartstudio',
    tiktok: 'https://tiktok.com/@happyartstudio',
  },
  heroImage: '',
  heroImages: [],
  aboutImage: '',
  description:
    'Happy Art is a family-run pottery studio located in Shiashie, Accra. We offer pottery classes for individuals, groups, parties, schools, and organizations. Our experienced instructors teach wheel throwing, hand building, and pot painting. We also have beautiful handmade pots and ceramic pieces for sale.',
  priceList: seedPriceList,
  services: seedServices,
};

export const seedTestimonials: Testimonial[] = [];
