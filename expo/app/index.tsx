import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  Platform,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Star, HelpCircle, Palette, Users, Heart, Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Award, Sparkles, BookOpen, ArrowRight, X, Send } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { theme } from '@/constants/theme';
import { seedSettings, seedServices } from '@/services/seedData';
import { useData } from '@/contexts/DataContext';
import { dataService } from '@/services/dataService';
import { Review, ServiceItem } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BlogPost {
  id: string;
  title: string;
  published: string;
  content: string;
  url: string;
}

export default function Home() {
  const router = useRouter();
  const { settings, instructors, gallery, testimonials, reviews } = useData();
  
  useEffect(() => {
    console.log('[Home] Instructors count:', instructors.length);
    if (instructors.length > 0) {
      console.log('[Home] First instructor:', instructors[0]);
      console.log('[Home] First instructor image URL:', instructors[0].image);
    }
  }, [instructors]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [heroIndexA, setHeroIndexA] = useState(0);
  const [heroIndexB, setHeroIndexB] = useState(1);
  const [_activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const heroOpacityA = useRef(new Animated.Value(1)).current;
  const heroOpacityB = useRef(new Animated.Value(0)).current;
  const [instructorIndex, setInstructorIndex] = useState(0);
  const instructorOpacity = useRef(new Animated.Value(1)).current;

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', text: '', rating: 5 });
  const [submittingReview, setSubmittingReview] = useState(false);

  const approvedReviews = useMemo(
    () => reviews.filter((r) => r.status === 'approved'),
    [reviews]
  );

  const displayGallery = useMemo(
    () => gallery.slice(0, 6),
    [gallery]
  );

  const displaySettings = settings || seedSettings;
  const settingsReady = settings !== null;
  const heroImages = useMemo(
    () => settingsReady ? (displaySettings.heroImages || [displaySettings.heroImage]) : [],
    [settingsReady, displaySettings.heroImages, displaySettings.heroImage]
  );

  const services: ServiceItem[] = useMemo(
    () => displaySettings.services && displaySettings.services.length > 0 ? displaySettings.services : seedServices,
    [displaySettings.services]
  );

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const blogId = '3200822550075316870';
        const apiKey = 'AIzaSyBk7_VGQCwnvOvD0_EXAMPLE';
        const url = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?maxResults=3&key=${apiKey}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const formattedPosts: BlogPost[] = data.items?.map((item: any) => ({
            id: item.id,
            title: item.title,
            published: item.published,
            content: item.content,
            url: item.url,
          })) || [];
          setBlogPosts(formattedPosts);
        }
      } catch (error) {
        console.log('[Home] Blog fetch failed:', error);
      }
    };
    fetchBlogPosts();
  }, []);

  const transitioningRef = useRef(false);
  const activeLayerRef = useRef<'A' | 'B'>('A');
  const heroIndexARef = useRef(0);
  const heroIndexBRef = useRef(1);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    setHeroIndexA(0);
    setHeroIndexB(heroImages.length > 1 ? 1 : 0);
    heroIndexARef.current = 0;
    heroIndexBRef.current = heroImages.length > 1 ? 1 : 0;
    setActiveLayer('A');
    activeLayerRef.current = 'A';
    heroOpacityA.setValue(1);
    heroOpacityB.setValue(0);
    transitioningRef.current = false;
  }, [heroImages.length]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      if (transitioningRef.current) return;
      transitioningRef.current = true;

      const currentActive = activeLayerRef.current;
      if (currentActive === 'A') {
        const nextIdx = (heroIndexARef.current + 1) % heroImages.length;
        heroIndexBRef.current = nextIdx;
        setHeroIndexB(nextIdx);
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(heroOpacityB, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(heroOpacityA, { toValue: 0, duration: 900, useNativeDriver: true }),
          ]).start(() => {
            activeLayerRef.current = 'B';
            setActiveLayer('B');
            transitioningRef.current = false;
          });
        }, 50);
      } else {
        const nextIdx = (heroIndexBRef.current + 1) % heroImages.length;
        heroIndexARef.current = nextIdx;
        setHeroIndexA(nextIdx);
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(heroOpacityA, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(heroOpacityB, { toValue: 0, duration: 900, useNativeDriver: true }),
          ]).start(() => {
            activeLayerRef.current = 'A';
            setActiveLayer('A');
            transitioningRef.current = false;
          });
        }, 50);
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [heroImages.length, heroOpacityA, heroOpacityB]);

  useEffect(() => {
    if (instructors.length <= 1) return;
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(instructorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(instructorOpacity, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setInstructorIndex((prev) => (prev + 1) % instructors.length);
        Animated.timing(instructorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [instructors.length, instructorOpacity]);

  const openSocialMedia = useCallback((url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  }, []);

  const handleBookingPress = useCallback(() => {
    router.push('/booking' as any);
  }, [router]);

  const handleGalleryPress = useCallback(() => {
    router.push('/gallery' as any);
  }, [router]);

  const handleClassesPress = useCallback(() => {
    router.push('/classes' as any);
  }, [router]);

  const handleBlogPress = useCallback(() => {
    router.push('/blog' as any);
  }, [router]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const stripHTML = useCallback((html: string) => {
    return html.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
  }, []);

  const handleSubmitReview = useCallback(async () => {
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) {
      if (Platform.OS === 'web') {
        alert('Please fill in your name and review');
      } else {
        Alert.alert('Error', 'Please fill in your name and review');
      }
      return;
    }
    setSubmittingReview(true);
    try {
      const newReview: Omit<Review, 'id'> = {
        name: reviewForm.name.trim(),
        text: reviewForm.text.trim(),
        rating: reviewForm.rating,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      await dataService.createReview(newReview);
      setReviewModalVisible(false);
      setReviewForm({ name: '', text: '', rating: 5 });
      if (Platform.OS === 'web') {
        alert('Thank you! Your review has been submitted and will appear after approval.');
      } else {
        Alert.alert('Thank You!', 'Your review has been submitted and will appear after approval.');
      }
    } catch (error) {
      console.error('[Home] Error submitting review:', error);
      if (Platform.OS === 'web') {
        alert('Failed to submit review. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to submit review. Please try again.');
      }
    } finally {
      setSubmittingReview(false);
    }
  }, [reviewForm]);

  const renderStarSelector = useCallback(() => {
    return (
      <View style={styles.starSelector}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
            style={styles.starButton}
          >
            <Star
              color={star <= reviewForm.rating ? '#F5A623' : theme.colors.border}
              size={32}
              fill={star <= reviewForm.rating ? '#F5A623' : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [reviewForm.rating]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroImageContainer}>
            {heroImages.length > 0 ? (
              <>
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: heroOpacityA }]}>
                  <Image
                    source={{ uri: heroImages[heroIndexA] }}
                    style={styles.heroImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={0}
                    placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
                    recyclingKey={`hero-a-${heroIndexA}`}
                  />
                </Animated.View>
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: heroOpacityB }]}>
                  <Image
                    source={{ uri: heroImages[heroIndexB] }}
                    style={styles.heroImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={0}
                    placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
                    recyclingKey={`hero-b-${heroIndexB}`}
                  />
                </Animated.View>
              </>
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.heroPlaceholder]} />
            )}
          </View>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{displaySettings.studioName}</Text>
            <Text style={styles.heroSubtitle}>{displaySettings.tagline}</Text>
            <Button
              title="Book a Class"
              onPress={handleBookingPress}
              style={styles.heroButton}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About {displaySettings.studioName}</Text>
          <View style={styles.aboutContent}>
            <Image
              source={{ uri: displaySettings.aboutImage }}
              style={styles.aboutImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
              placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
            />
            <View style={styles.aboutText}>
              <Text style={styles.paragraph}>{displaySettings.description}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.servicesSection]}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <Image
                  source={{ uri: service.image }}
                  style={styles.serviceImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={200}
                  placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
                  recyclingKey={`service-${service.id}`}
                />
                <View style={styles.serviceCardContent}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDescription}>
                    {service.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {instructors.length > 0 && (
          <View style={[styles.section, styles.instructorSection]}>
            <View style={styles.instructorHeader}>
              <Sparkles color={theme.colors.primary} size={28} />
              <Text style={styles.sectionTitle}>Meet Our Expert Instructors</Text>
              <Sparkles color={theme.colors.primary} size={28} />
            </View>
            <Text style={styles.instructorSubtitle}>
              Learn from experienced artists passionate about pottery
            </Text>
            <View style={styles.instructorSlideshow}>
              <View style={styles.modernInstructorCard}>
                <Animated.View style={{ opacity: instructorOpacity }}>
                    <View style={styles.instructorImageContainer}>
                      <View style={styles.instructorImageBorder}>
                        <Image
                          source={{ uri: instructors[instructorIndex].image }}
                          style={styles.instructorImage}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          transition={0}
                          placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
                          recyclingKey={`instructor-${instructorIndex}`}
                        />
                      </View>
                      <View style={styles.instructorBadge}>
                        <Award color={theme.colors.white} size={16} />
                      </View>
                    </View>
                    <View style={styles.instructorContent}>
                      <Text style={styles.instructorName}>{instructors[instructorIndex].name}</Text>
                      <View style={styles.instructorTitleContainer}>
                        <View style={styles.titleDivider} />
                        <Text style={styles.instructorTitle}>{instructors[instructorIndex].title}</Text>
                        <View style={styles.titleDivider} />
                      </View>
                      <Text style={styles.instructorExperience}>{instructors[instructorIndex].experience}</Text>
                      <Text style={styles.instructorBio}>{instructors[instructorIndex].bio}</Text>
                      {instructors[instructorIndex].specialties?.length > 0 && (
                        <View style={styles.specialtiesContainer}>
                          {instructors[instructorIndex].specialties.map((specialty, idx) => (
                            <View key={idx} style={styles.specialtyTag}>
                              <Text style={styles.specialtyText}>{specialty}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </Animated.View>
              </View>
            </View>
            {instructors.length > 1 && (
              <View style={styles.modernInstructorIndicators}>
                {instructors.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setInstructorIndex(index)}
                    style={[
                      styles.modernInstructorIndicator,
                      index === instructorIndex && styles.modernInstructorIndicatorActive,
                    ]}
                  >
                    {index === instructorIndex && (
                      <View style={styles.indicatorInner} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {displayGallery.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Gallery</Text>
            <Text style={styles.sectionSubtitle}>
              Explore beautiful pottery creations from our students and instructors
            </Text>
            <View style={styles.galleryGrid}>
              {displayGallery.map((image) => (
                <TouchableOpacity
                  key={image.id}
                  onPress={handleGalleryPress}
                  style={styles.galleryGridItem}
                >
                  <Image
                    source={{ uri: image.source }}
                    style={styles.galleryGridImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                    placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
                    recyclingKey={`gallery-${image.id}`}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title="View Full Gallery"
              onPress={handleGalleryPress}
              variant="outline"
              style={styles.galleryButton}
            />
          </View>
        )}

        {blogPosts.length > 0 && (
          <View style={[styles.section, styles.blogSection]}>
            <Text style={styles.sectionTitle}>Latest from Our Blog</Text>
            <View style={styles.blogGrid}>
              {blogPosts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.blogCard}
                  onPress={() => Linking.openURL(post.url)}
                >
                  <Text style={styles.blogDate}>{formatDate(post.published)}</Text>
                  <Text style={styles.blogTitle}>{post.title}</Text>
                  <Text style={styles.blogExcerpt}>{stripHTML(post.content)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title="Read More on Blog"
              onPress={handleBlogPress}
              variant="outline"
              style={styles.blogButton}
            />
          </View>
        )}

        <View style={[styles.section, styles.classesCtaSection]}>
          <View style={styles.classesCtaInner}>
            <BookOpen color={theme.colors.primary} size={36} />
            <Text style={styles.classesCtaTitle}>Explore Our Classes</Text>
            <Text style={styles.classesCtaText}>
              From beginner wheel throwing to advanced pot painting, find the perfect class for you.
            </Text>
            <TouchableOpacity style={styles.classesCtaButton} onPress={handleClassesPress} activeOpacity={0.8}>
              <Text style={styles.classesCtaButtonText}>View All Classes</Text>
              <ArrowRight color={theme.colors.white} size={18} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, styles.processSection]}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.processSteps}
          >
            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepIcon}>
                <Palette color={theme.colors.primary} size={32} />
              </View>
              <Text style={styles.stepTitle}>Choose Your Class</Text>
              <Text style={styles.stepDescription}>
                Select from Wheel Throwing or Pot Painting classes
              </Text>
            </View>
            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepIcon}>
                <Users color={theme.colors.primary} size={32} />
              </View>
              <Text style={styles.stepTitle}>Book Your Session</Text>
              <Text style={styles.stepDescription}>
                Reserve your spot for individuals, groups, or parties
              </Text>
            </View>
            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepIcon}>
                <Heart color={theme.colors.primary} size={32} />
              </View>
              <Text style={styles.stepTitle}>Create & Enjoy</Text>
              <Text style={styles.stepDescription}>
                Learn pottery techniques and take home your masterpiece
              </Text>
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Our Students Say</Text>
          {(testimonials.length > 0 || approvedReviews.length > 0) && (
            <View style={styles.testimonialsGrid}>
              {testimonials.map((testimonial) => (
                <View key={testimonial.id} style={styles.testimonialCard}>
                  <View style={styles.starsRow}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        color="#F5A623"
                        size={16}
                        fill="#F5A623"
                      />
                    ))}
                  </View>
                  <Text style={styles.testimonialText}>&ldquo;{testimonial.text}&rdquo;</Text>
                  <Text style={styles.testimonialAuthor}>- {testimonial.name}</Text>
                </View>
              ))}
              {approvedReviews.map((review) => (
                <View key={review.id} style={styles.testimonialCard}>
                  <View style={styles.starsRow}>
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        color="#F5A623"
                        size={16}
                        fill="#F5A623"
                      />
                    ))}
                  </View>
                  <Text style={styles.testimonialText}>&ldquo;{review.text}&rdquo;</Text>
                  <Text style={styles.testimonialAuthor}>- {review.name}</Text>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={styles.leaveReviewButton}
            onPress={() => setReviewModalVisible(true)}
            activeOpacity={0.8}
          >
            <Star color={theme.colors.white} size={20} fill={theme.colors.white} />
            <Text style={styles.leaveReviewText}>Leave a Review</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, styles.faqSection]}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            <View style={styles.faqItem}>
              <View style={styles.faqQuestion}>
                <HelpCircle color={theme.colors.primary} size={20} />
                <Text style={styles.faqQuestionText}>What should I wear to class?</Text>
              </View>
              <Text style={styles.faqAnswer}>
                Wear comfortable clothes that you don&apos;t mind getting a little dirty. We provide aprons, but clay can be messy!
              </Text>
            </View>
            <View style={styles.faqItem}>
              <View style={styles.faqQuestion}>
                <HelpCircle color={theme.colors.primary} size={20} />
                <Text style={styles.faqQuestionText}>Do I need prior experience?</Text>
              </View>
              <Text style={styles.faqAnswer}>
                Not at all! Our classes welcome beginners and experienced potters alike. Our instructors guide you every step of the way.
              </Text>
            </View>
            <View style={styles.faqItem}>
              <View style={styles.faqQuestion}>
                <HelpCircle color={theme.colors.primary} size={20} />
                <Text style={styles.faqQuestionText}>How many people can attend?</Text>
              </View>
              <Text style={styles.faqAnswer}>
                We can accommodate 1 to 100 people! Perfect for individuals, couples, groups, parties, schools, and corporate events.
              </Text>
            </View>
            <View style={styles.faqItem}>
              <View style={styles.faqQuestion}>
                <HelpCircle color={theme.colors.primary} size={20} />
                <Text style={styles.faqQuestionText}>Can I purchase pottery pieces?</Text>
              </View>
              <Text style={styles.faqAnswer}>
                Yes! We have beautiful handmade pots and ceramic pieces for sale at the studio.
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.contactSection]}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactInfo}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL(`tel:${displaySettings.phone}`)}
            >
              <Phone color={theme.colors.primary} size={24} />
              <Text style={styles.contactText}>{displaySettings.phone}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL(`mailto:${displaySettings.email}`)}
            >
              <Mail color={theme.colors.primary} size={24} />
              <Text style={styles.contactText}>{displaySettings.email}</Text>
            </TouchableOpacity>
            <View style={styles.contactItem}>
              <MapPin color={theme.colors.primary} size={24} />
              <Text style={styles.contactText}>{displaySettings.address}</Text>
            </View>
            <View style={styles.contactItem}>
              <Clock color={theme.colors.primary} size={24} />
              <View>
                <Text style={styles.contactText}>
                  Mon-Tue: {displaySettings.openingHours.monday}
                </Text>
                <Text style={styles.contactText}>
                  Wed: {displaySettings.openingHours.wednesday}
                </Text>
                <Text style={styles.contactText}>
                  Thu-Sat: {displaySettings.openingHours.thursday}
                </Text>
                <Text style={styles.contactText}>
                  Sun: {displaySettings.openingHours.sunday}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.mapContainer}>
            <Text style={styles.mapTitle}>Visit Us</Text>
            <View style={styles.mapWrapper}>
              {Platform.OS === 'web' ? (
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.5894634776437!2d-0.18566552603040923!3d5.627459532929082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9b473890b8fd%3A0x831efdb91c838cfa!2sHappy%20Art!5e0!3m2!1sen!2sgh!4v1768613314968!5m2!1sen!2sgh"
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: 12 } as any}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <View style={styles.map}>
                  <TouchableOpacity
                    style={styles.mapFallback}
                    onPress={() => Linking.openURL('https://maps.google.com/?q=5.627459532929082,-0.18566552603040923')}
                  >
                    <MapPin color={theme.colors.primary} size={32} />
                    <Text style={styles.mapFallbackText}>Open in Google Maps</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.socialMediaContainer}>
            <Text style={styles.socialTitle}>Follow Us</Text>
            <View style={styles.socialIcons}>
              {displaySettings.socialMedia.facebook && (
                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
                  onPress={() => openSocialMedia(displaySettings.socialMedia.facebook)}
                >
                  <Facebook color={theme.colors.white} size={24} />
                </TouchableOpacity>
              )}
              {displaySettings.socialMedia.instagram && (
                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: '#E4405F' }]}
                  onPress={() => openSocialMedia(displaySettings.socialMedia.instagram)}
                >
                  <Instagram color={theme.colors.white} size={24} />
                </TouchableOpacity>
              )}
              {displaySettings.socialMedia.twitter && (
                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
                  onPress={() => openSocialMedia(displaySettings.socialMedia.twitter)}
                >
                  <Twitter color={theme.colors.white} size={24} />
                </TouchableOpacity>
              )}

            </View>
          </View>
        </View>
      </ScrollView>
      <FloatingWhatsApp />

      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.reviewModalOverlay}>
          <View style={styles.reviewModalContent}>
            <View style={styles.reviewModalHeader}>
              <Text style={styles.reviewModalTitle}>Leave a Review</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <X color={theme.colors.text} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.reviewModalBody}>
              <View style={styles.reviewFormGroup}>
                <Text style={styles.reviewFormLabel}>Your Name *</Text>
                <TextInput
                  style={styles.reviewFormInput}
                  value={reviewForm.name}
                  onChangeText={(text) => setReviewForm((prev) => ({ ...prev, name: text }))}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>
              <View style={styles.reviewFormGroup}>
                <Text style={styles.reviewFormLabel}>Rating *</Text>
                {renderStarSelector()}
              </View>
              <View style={styles.reviewFormGroup}>
                <Text style={styles.reviewFormLabel}>Your Review *</Text>
                <TextInput
                  style={[styles.reviewFormInput, styles.reviewFormTextArea]}
                  value={reviewForm.text}
                  onChangeText={(text) => setReviewForm((prev) => ({ ...prev, text }))}
                  placeholder="Share your experience at Happy Art..."
                  placeholderTextColor={theme.colors.textLight}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
            <View style={styles.reviewModalFooter}>
              <TouchableOpacity
                style={styles.reviewCancelButton}
                onPress={() => setReviewModalVisible(false)}
              >
                <Text style={styles.reviewCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reviewSubmitButton, submittingReview && { opacity: 0.6 }]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                <Send color={theme.colors.white} size={18} />
                <Text style={styles.reviewSubmitText}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollView: {
    flex: 1,
  },
  hero: {
    height: 280,
    position: 'relative',
  },
  heroImageContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2c2c2c',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    backgroundColor: '#2c2c2c',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: 14,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  heroButton: {
    minWidth: 200,
  },
  section: {
    padding: theme.spacing.md,
  },
  servicesSection: {
    backgroundColor: theme.colors.surface,
  },
  contactSection: {
    backgroundColor: theme.colors.accent,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  aboutContent: {
    flexDirection: 'column',
    gap: theme.spacing.lg,
    alignItems: 'center',
  },
  aboutImage: {
    width: '100%',
    height: 220,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  aboutText: {
    flex: 1,
    gap: theme.spacing.md,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.text,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  serviceCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    width: SCREEN_WIDTH > 500 ? '48%' : '100%',
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  serviceImage: {
    width: '100%',
    height: 140,
    backgroundColor: theme.colors.surface,
  },
  serviceCardContent: {
    padding: theme.spacing.md,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textLight,
  },
  instructorSection: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.xl,
  },
  instructorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  instructorSubtitle: {
    fontSize: 15,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontStyle: 'italic',
  },
  instructorSlideshow: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  modernInstructorCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  instructorImageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    position: 'relative',
  },
  instructorImageBorder: {
    padding: 6,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    ...theme.shadows.md,
  },
  instructorImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: theme.colors.white,
    backgroundColor: theme.colors.surface,
  },
  instructorBadge: {
    position: 'absolute',
    bottom: 10,
    right: '30%',
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.white,
    ...theme.shadows.md,
  },
  instructorContent: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  instructorName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  instructorTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  titleDivider: {
    width: 30,
    height: 1,
    backgroundColor: theme.colors.primary,
  },
  instructorTitle: {
    fontSize: 15,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  instructorExperience: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: '600' as const,
    marginTop: theme.spacing.xs,
  },
  instructorBio: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  specialtyTag: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  specialtyText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  modernInstructorIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
  },
  modernInstructorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernInstructorIndicatorActive: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  indicatorInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  galleryButton: {
    marginHorizontal: theme.spacing.lg,
  },
  contactInfo: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  contactText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  socialMediaContainer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.md,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  mapContainer: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  mapWrapper: {
    height: 300,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  map: {
    flex: 1,
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    gap: 8,
  },
  mapFallbackText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600' as const,
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  galleryGridItem: {
    width: '48%',
    height: 150,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  galleryGridImage: {
    width: '100%',
    height: '100%',
  },
  processSection: {
    backgroundColor: theme.colors.surface,
  },
  processSteps: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  processStep: {
    width: SCREEN_WIDTH > 500 ? (SCREEN_WIDTH - 96) / 3 : SCREEN_WIDTH * 0.7,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
    position: 'relative',
  },
  stepNumber: {
    position: 'absolute',
    top: -15,
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  stepNumberText: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: '700' as const,
  },
  stepIcon: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  testimonialsGrid: {
    flexDirection: 'column',
    gap: theme.spacing.md,
  },
  testimonialCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  testimonialText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.colors.primary,
  },
  faqSection: {
    backgroundColor: theme.colors.accent,
  },
  faqList: {
    gap: theme.spacing.lg,
  },
  faqItem: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textLight,
    marginLeft: 28,
  },
  blogSection: {
    backgroundColor: theme.colors.surface,
  },
  blogGrid: {
    gap: theme.spacing.md,
  },
  blogCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  blogDate: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
  },
  blogExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text,
  },
  blogButton: {
    marginTop: theme.spacing.md,
  },
  classesCtaSection: {
    backgroundColor: theme.colors.accent,
  },
  classesCtaInner: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
    gap: theme.spacing.md,
  },
  classesCtaTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    textAlign: 'center',
  },
  classesCtaText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  classesCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.md,
  },
  classesCtaButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.colors.white,
  },
  leaveReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.lg,
    alignSelf: 'center',
    ...theme.shadows.md,
  },
  leaveReviewText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.colors.white,
  },
  reviewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  reviewModalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '85%',
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  reviewModalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  reviewModalBody: {
    padding: theme.spacing.lg,
  },
  reviewFormGroup: {
    marginBottom: theme.spacing.lg,
  },
  reviewFormLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  reviewFormInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
  },
  reviewFormTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  starSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  starButton: {
    padding: 4,
  },
  reviewModalFooter: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  reviewCancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  reviewCancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  reviewSubmitButton: {
    flex: 1,
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  reviewSubmitText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.colors.white,
  },
});
