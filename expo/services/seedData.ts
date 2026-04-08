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

export const seedInstructors: Instructor[] = [
  {
    id: '1',
    name: 'Sarah Mensah',
    title: 'Master Potter & Founder',
    bio: 'With over 15 years of experience in pottery and ceramic arts, Sarah founded Happy Art to share her passion for pottery with the community of Accra.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    experience: '15 years',
    specialties: ['Wheel Throwing', 'Hand Building', 'Glazing'],
    featured: true,
  },
  {
    id: '2',
    name: 'Kwame Osei',
    title: 'Senior Pottery Instructor',
    bio: 'Kwame specializes in traditional African pottery techniques combined with modern approaches. He loves teaching beginners and advanced students alike.',
    image: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/nrkphw4hb8npuaic1h2vf',
    experience: '10 years',
    specialties: ['Traditional Techniques', 'Pot Painting', 'Sculpture'],
    featured: true,
  },
  {
    id: '3',
    name: 'Ama Boateng',
    title: 'Pottery Instructor',
    bio: 'Ama brings a vibrant energy to her classes, making pottery accessible and fun for everyone from kids to adults.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    experience: '7 years',
    specialties: ['Kids Classes', 'Beginners', 'Decorative Pottery'],
    featured: false,
  },
];

export const seedGallery: GalleryImage[] = [
  {
    id: '1',
    source: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/hk198e22k4hoq20n0pd18',
    alt: 'Young student crafting a beautiful clay pottery basket with intricate details',
    category: 'pottery',
    featured: true,
  },
  {
    id: '2',
    source: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/nrkphw4hb8npuaic1h2vf',
    alt: 'Master instructor demonstrating pottery wheel throwing technique to student',
    category: 'pottery',
    featured: true,
  },
  {
    id: '3',
    source: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/njyc6lvxqzlewbhdv9hkz',
    alt: 'Artist creating detailed traditional African patterns on pottery',
    category: 'pottery',
    featured: true,
  },
  {
    id: '4',
    source: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/vy18x4drtp4l16sza2lm6',
    alt: 'Young student working on decorative pottery piece',
    category: 'pottery',
    featured: true,
  },
  {
    id: '5',
    source: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800',
    alt: 'Colorful painted ceramic bowls',
    category: 'painting',
    featured: false,
  },
  {
    id: '6',
    source: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
    alt: 'Handmade pottery vases',
    category: 'finished',
    featured: false,
  },
];

export const seedEvents: Event[] = [
  {
    id: '1',
    title: 'Family Pottery Day',
    description:
      'Bring the whole family for a fun day of pottery! Learn wheel throwing and hand building together.',
    date: '2025-11-15',
    time: '2:00 PM',
    duration: '3 hours',
    price: 150,
    maxParticipants: 20,
    currentParticipants: 8,
    image: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/hk198e22k4hoq20n0pd18',
    instructor: 'Sarah Mensah',
    category: 'workshop',
  },
  {
    id: '2',
    title: 'Advanced Pottery Workshop',
    description:
      'Explore advanced pottery techniques and create stunning pieces with expert guidance.',
    date: '2025-11-22',
    time: '1:00 PM',
    duration: '4 hours',
    price: 200,
    maxParticipants: 12,
    currentParticipants: 5,
    image: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/njyc6lvxqzlewbhdv9hkz',
    instructor: 'Kwame Osei',
    category: 'workshop',
  },
  {
    id: '3',
    title: 'Kids Pottery Party',
    description:
      'Perfect for birthday parties and school groups! Kids will love creating their own pottery.',
    date: '2025-11-29',
    time: '3:00 PM',
    duration: '2 hours',
    price: 100,
    maxParticipants: 15,
    currentParticipants: 12,
    image: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/vy18x4drtp4l16sza2lm6',
    instructor: 'Ama Boateng',
    category: 'party',
  },
];

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

export const seedServices: ServiceItem[] = [
  {
    id: 'service-1',
    title: 'Wheel Throwing',
    description: 'Learn the art of shaping clay on the pottery wheel. Perfect for all skill levels.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
  },
  {
    id: 'service-2',
    title: 'Pot Painting',
    description: 'Express your creativity by painting and decorating ceramic pieces.',
    image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400',
  },
  {
    id: 'service-3',
    title: 'Free Hand Modeling',
    description: 'Create unique pottery pieces using traditional hand-building techniques.',
    image: 'https://images.unsplash.com/photo-1590422749897-47036da0b0ff?w=400',
  },
  {
    id: 'service-4',
    title: 'Pottery & Ceramics Sales',
    description: 'Browse our collection of handmade pots and ceramic pieces for purchase.',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400',
  },
];

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
  heroImage: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/nrkphw4hb8npuaic1h2vf',
  heroImages: [
    'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/nrkphw4hb8npuaic1h2vf',
    'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/hk198e22k4hoq20n0pd18',
    'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/njyc6lvxqzlewbhdv9hkz',
  ],
  aboutImage: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/hk198e22k4hoq20n0pd18',
  description:
    'Happy Art is a family-run pottery studio located in Shiashie, Accra. We offer pottery classes for individuals, groups, parties, schools, and organizations. Our experienced instructors teach wheel throwing, hand building, and pot painting. We also have beautiful handmade pots and ceramic pieces for sale.',
  priceList: seedPriceList,
  services: seedServices,
};

export const seedTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Akosua Mensah',
    text: 'Amazing experience! The instructors are patient and skilled. My kids had so much fun learning pottery.',
    rating: 5,
    date: '2024-10-15',
  },
  {
    id: '2',
    name: 'David Ofosu',
    text: 'I brought my team here for a team building event. It was fantastic! Everyone loved it.',
    rating: 5,
    date: '2024-10-20',
  },
  {
    id: '3',
    name: 'Grace Asante',
    text: 'The pottery classes are wonderful. I have learned so much and created beautiful pieces.',
    rating: 5,
    date: '2024-10-25',
  },
];
