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
  useWindowDimensions,
  FlatList,
} from 'react-native';
import { OptimizedImage } from '@/components/OptimizedImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Star, HelpCircle, Palette, Users, Heart, Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Award, Sparkles, BookOpen, ArrowRight, X, Send, Calendar, ChevronLeft, ChevronRight, Store, PartyPopper, School } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { theme } from '@/constants/theme';

import { useData } from '@/contexts/DataContext';
import { database } from '@/services/database';
import { ServiceItem } from '@/types';

interface BlogPost {
  id: string;
  title: string;
  published: string;
  content: string;
  url: string;
}

const REVIEW_CARD_WIDTH = 300;

export default function Home() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const isLargeScreen = screenWidth > 768;
  const { settings, instructors, gallery, testimonials, reviews, events } = useData();

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [heroIndexA, setHeroIndexA] = useState(0);
  const [heroIndexB, setHeroIndexB] = useState(1);
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const heroOpacityA = useRef(new Animated.Value(1)).current;
  const heroOpacityB = useRef(new Animated.Value(0)).current;
  const [instructorIndex, setInstructorIndex] = useState(0);
  const instructorOpacity = useRef(new Animated.Value(1)).current;

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', text: '', rating: 5 });
  const [submittingReview, setSubmittingReview] = useState(false);

  const reviewScrollRef = useRef<FlatList>(null);
  const [reviewScrollIndex, setReviewScrollIndex] = useState(0);

  const approvedReviews = useMemo(
    () => reviews.filter((r) => r.status === 'approved'),
    [reviews]
  );

  const allReviewItems = useMemo(() => {
    const items = [
      ...testimonials.map((t) => ({ ...t, source: 'testimonial' as const })),
      ...approvedReviews.map((r) => ({ ...r, source: 'review' as const })),
    ];
    return items;
  }, [testimonials, approvedReviews]);

  const upcomingEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [events]);

  const displayGallery = useMemo(
    () => gallery.slice(0, 6),
    [gallery]
  );

  const displaySettings = settings;
  const heroImages = useMemo(
    () => {
      if (!settings) return [];
      const imgs = settings.heroImages && settings.heroImages.length > 0
        ? settings.heroImages
        : settings.heroImage
          ? [settings.heroImage]
          : [];
      return imgs.filter((url): url is string => typeof url === 'string' && url.length > 0);
    },
    [settings]
  );

  const services: ServiceItem[] = useMemo(
    () => settings?.services && settings.services.length > 0 ? settings.services : [],
    [settings?.services]
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

  useEffect(() => {
    if (allReviewItems.length <= 1) return;
    const interval = setInterval(() => {
      setReviewScrollIndex((prev) => {
        const next = (prev + 1) % allReviewItems.length;
        reviewScrollRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [allReviewItems.length]);

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

  const handleEventsPress = useCallback(() => {
    router.push('/events' as any);
  }, [router]);

  const formatDate = useCallback((dateString: string | any) => {
    try {
      if (!dateString) return 'Date TBD';
      if (typeof dateString === 'object' && dateString.seconds) {
        const d = new Date(dateString.seconds * 1000);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }
      }
      if (typeof dateString === 'object' && dateString.toDate) {
        const d = dateString.toDate();
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }
      }
      const str = String(dateString);
      const parts = str.split('-');
      if (parts.length === 3) {
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }
      }
      const date = new Date(str);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      }
      return str;
    } catch {
      return String(dateString) || 'Date TBD';
    }
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
      const id = Date.now().toString();
      const newReview = {
        id,
        name: reviewForm.name.trim(),
        text: reviewForm.text.trim(),
        rating: reviewForm.rating,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      console.log('[Home] Submitting review directly via database.create...', { name: reviewForm.name.trim(), rating: reviewForm.rating });
      await database.ensureAnonymousAuth();
      await database.create('reviews', newReview);
      console.log('[Home] Review submitted successfully');
      setReviewModalVisible(false);
      setReviewForm({ name: '', text: '', rating: 5 });
      if (Platform.OS === 'web') {
        alert('Thank you! Your review has been submitted and will appear after approval.');
      } else {
        Alert.alert('Thank You!', 'Your review has been submitted and will appear after approval.');
      }
    } catch (error: any) {
      console.error('[Home] Error submitting review:', error);
      console.error('[Home] Error code:', error?.code);
      console.error('[Home] Error message:', error?.message);
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

  const scrollReviewLeft = useCallback(() => {
    if (allReviewItems.length === 0) return;
    const newIdx = reviewScrollIndex > 0 ? reviewScrollIndex - 1 : allReviewItems.length - 1;
    setReviewScrollIndex(newIdx);
    reviewScrollRef.current?.scrollToIndex({ index: newIdx, animated: true });
  }, [reviewScrollIndex, allReviewItems.length]);

  const scrollReviewRight = useCallback(() => {
    if (allReviewItems.length === 0) return;
    const newIdx = (reviewScrollIndex + 1) % allReviewItems.length;
    setReviewScrollIndex(newIdx);
    reviewScrollRef.current?.scrollToIndex({ index: newIdx, animated: true });
  }, [reviewScrollIndex, allReviewItems.length]);

  const renderReviewItem = useCallback(({ item }: { item: typeof allReviewItems[0] }) => (
    <View style={[styles.reviewSlideCard, { width: REVIEW_CARD_WIDTH }]}>
      <View style={styles.starsRow}>
        {[...Array(item.rating)].map((_, i) => (
          <Star key={i} color="#F5A623" size={16} fill="#F5A623" />
        ))}
      </View>
      <Text style={styles.testimonialText} numberOfLines={4}>&ldquo;{item.text}&rdquo;</Text>
      <Text style={styles.testimonialAuthor}>- {item.name}</Text>
    </View>
  ), []);

  const isMediumScreen = screenWidth > 480;
  const isExtraLarge = screenWidth > 1200;
  const isSmallScreen = screenWidth <= 380;
  const currentHeroIndex = activeLayer === 'A' ? heroIndexA : heroIndexB;
  const heroHeight = isExtraLarge ? 520 : isLargeScreen ? 440 : isMediumScreen ? 360 : isSmallScreen ? 240 : 300;
  const heroTargetWidth = isExtraLarge ? 1920 : isLargeScreen ? 1280 : isMediumScreen ? 960 : 640;

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="home-screen">
      <Header />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* HERO - larger on big screens */}
        {/* testID for hero section */}
        <View style={[styles.hero, { height: heroHeight }]}>
          <View style={styles.heroImageContainer}>
            {heroImages.length > 0 ? (
              <>
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: heroOpacityA }]}>
                  <OptimizedImage
                    uri={heroImages[heroIndexA]}
                    style={styles.heroImage}
                    contentFit="cover"
                    priority="high"
                    targetWidth={heroTargetWidth}
                    recyclingKey={`hero-a-${heroIndexA}`}
                  />
                </Animated.View>
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: heroOpacityB }]}>
                  <OptimizedImage
                    uri={heroImages[heroIndexB]}
                    style={styles.heroImage}
                    contentFit="cover"
                    priority="high"
                    targetWidth={heroTargetWidth}
                    recyclingKey={`hero-b-${heroIndexB}`}
                  />
                </Animated.View>
              </>
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.heroPlaceholder]} />
            )}
          </View>
          <View style={styles.heroOverlay}>
            <Text style={[styles.heroTitle, isLargeScreen && { fontSize: 40 }, isExtraLarge && { fontSize: 48 }]}>{displaySettings?.studioName || 'Happy Art Pottery Studio'}</Text>
            <Text style={[styles.heroSubtitle, isLargeScreen && { fontSize: 18, maxWidth: 600 }]}>{displaySettings?.tagline || 'Creating Beautiful Pottery Together'}</Text>
            <Button
              title="Book a Class"
              onPress={handleBookingPress}
              style={styles.heroButton}
            />
          </View>
          {heroImages.length > 1 && (
            <View style={styles.heroIndicators}>
              {heroImages.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.heroDot,
                    idx === currentHeroIndex && styles.heroDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* STATS BANNER */}
        <View style={styles.statsBanner}>
          <View style={[styles.statsInner, isExtraLarge && { maxWidth: 1000, alignSelf: 'center' as const, width: '100%' as any }]}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>39+</Text>
              <Text style={styles.statLabel}>YEARS OF CRAFT</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3+</Text>
              <Text style={styles.statLabel}>AGES WELCOME</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100</Text>
              <Text style={styles.statLabel}>MAX GROUP SIZE</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statRatingRow}>
                <Text style={styles.statNumber}>4.8</Text>
                <Star color="#FFFFFF" size={16} fill="#FFFFFF" />
              </View>
              <Text style={styles.statLabel}>GOOGLE RATING</Text>
            </View>
          </View>
        </View>

        {/* ABOUT - side by side on large screens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About {displaySettings?.studioName || 'Happy Art Pottery Studio'}</Text>
          <View style={[styles.aboutContent, isLargeScreen && styles.aboutContentLarge]}>
            <OptimizedImage
              uri={displaySettings?.aboutImage}
              style={[styles.aboutImage, isLargeScreen && styles.aboutImageLarge, isExtraLarge && styles.aboutImageExtraLarge]}
              contentFit="cover"
              priority="high"
              targetWidth={isLargeScreen ? 640 : 480}
            />
            <View style={[styles.aboutText, isLargeScreen && styles.aboutTextLarge]}>
              <Text style={styles.paragraph}>{displaySettings?.description || ''}</Text>
            </View>
          </View>
        </View>

        {/* SERVICES */}
        {services.length > 0 && (
        <View style={[styles.section, styles.servicesSection]}>
          <View style={[isExtraLarge && styles.maxWidthContainer]}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <View style={[styles.servicesGrid, isLargeScreen && styles.servicesGridLarge]}>
              {services.map((service) => (
                <View key={service.id} style={[styles.serviceCard, styles.serviceCardGrid, isMediumScreen && !isLargeScreen && styles.serviceCardGridMedium, isLargeScreen && styles.serviceCardGridLarge]}>
                  <OptimizedImage
                    uri={service.image}
                    style={[styles.serviceImage, isLargeScreen && styles.serviceImageLarge]}
                    contentFit="cover"
                    priority="normal"
                    targetWidth={isLargeScreen ? 400 : 300}
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
        </View>
        )}

        {/* UPCOMING EVENTS */}
        <View style={[styles.section, styles.eventsSection]}>
          <View style={[isExtraLarge && styles.maxWidthContainer]}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <Text style={styles.sectionSubtitle}>
              Join us for special workshops and pottery experiences
            </Text>
            {upcomingEvents.length > 0 ? (
              <>
                <View style={[styles.eventsGrid, isLargeScreen && { flexDirection: 'row' as const }]}>
                  {upcomingEvents.map((event) => (
                    <View key={event.id} style={[styles.eventHomeCard, isLargeScreen && { flex: 1 }]}>
                      <OptimizedImage
                        uri={event.image}
                        style={[styles.eventHomeImage, isSmallScreen && { height: 160 }]}
                        contentFit="cover"
                        priority="normal"
                        targetWidth={isLargeScreen ? 500 : 400}
                        recyclingKey={`event-home-${event.id}`}
                      />
                      <View style={styles.eventHomeContent}>
                        <View style={styles.eventHomeDateBadge}>
                          <Calendar color={theme.colors.white} size={14} />
                          <Text style={styles.eventHomeDateText}>{formatDate(event.date)}</Text>
                        </View>
                        <Text style={styles.eventHomeTitle}>{event.title}</Text>
                        <Text style={styles.eventHomeDesc} numberOfLines={2}>{event.description}</Text>
                        <View style={styles.eventHomeDetailRow}>
                          <Clock color={theme.colors.primary} size={14} />
                          <Text style={styles.eventHomeDetailText}>{event.time}</Text>
                          <Users color={theme.colors.primary} size={14} />
                          <Text style={styles.eventHomeDetailText}>
                            {event.currentParticipants}/{event.maxParticipants}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={styles.viewAllEventsButton} onPress={handleEventsPress} activeOpacity={0.8}>
                  <Text style={styles.viewAllEventsText}>View All Events</Text>
                  <ArrowRight color={theme.colors.primary} size={18} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.viewAllEventsButton} onPress={handleEventsPress} activeOpacity={0.8}>
                <Text style={styles.viewAllEventsText}>View All Events</Text>
                <ArrowRight color={theme.colors.primary} size={18} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* INSTRUCTORS */}
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
                        <OptimizedImage
                          uri={instructors[instructorIndex]?.image}
                          style={styles.instructorImage}
                          contentFit="cover"
                          priority="normal"
                          targetWidth={320}
                          recyclingKey={`instructor-img-${instructorIndex}-${instructors[instructorIndex]?.id}`}
                        />
                      </View>
                      <View style={styles.instructorBadge}>
                        <Award color={theme.colors.white} size={16} />
                      </View>
                    </View>
                    <View style={styles.instructorContent}>
                      <Text style={styles.instructorName}>{instructors[instructorIndex]?.name}</Text>
                      <View style={styles.instructorTitleContainer}>
                        <View style={styles.titleDivider} />
                        <Text style={styles.instructorTitle}>{instructors[instructorIndex]?.title}</Text>
                        <View style={styles.titleDivider} />
                      </View>
                      <Text style={styles.instructorExperience}>{instructors[instructorIndex]?.experience}</Text>
                      <Text style={styles.instructorBio}>{instructors[instructorIndex]?.bio}</Text>
                      {(instructors[instructorIndex]?.specialties?.length ?? 0) > 0 && (
                        <View style={styles.specialtiesContainer}>
                          {instructors[instructorIndex].specialties.map((specialty: string, idx: number) => (
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

        {/* GALLERY */}
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
                  style={[styles.galleryGridItem, isLargeScreen && { width: '31%' as any, height: 200 }]}
                >
                  <OptimizedImage
                    uri={image.source}
                    style={styles.galleryGridImage}
                    contentFit="cover"
                    priority="low"
                    targetWidth={isLargeScreen ? 400 : 300}
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

        {/* BLOG */}
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

        {/* CLASSES CTA */}
        <View style={[styles.section, styles.classesCtaSection]}>
          <View style={styles.classesCtaInner}>
            <BookOpen color={theme.colors.primary} size={36} />
            <Text style={styles.classesCtaTitle}>Explore Our Classes</Text>
            <Text style={styles.classesCtaText}>
              From beginner wheel throwing and pot painting to advanced wheel throwing and pot painting, find the perfect class for you.
            </Text>
            <TouchableOpacity style={styles.classesCtaButton} onPress={handleClassesPress} activeOpacity={0.8}>
              <Text style={styles.classesCtaButtonText}>View All Classes</Text>
              <ArrowRight color={theme.colors.white} size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* OFFERINGS - Ceramics Sales, Birthday Parties, Schools & Corporates */}
        <View style={[styles.section, styles.offeringsSection]}>
          <View style={[isExtraLarge && styles.maxWidthContainer]}>
            <Text style={styles.sectionTitle}>More at Happy Art</Text>
            <View style={[styles.offeringsGrid, isLargeScreen && styles.offeringsGridLarge]}>
              <View style={styles.offeringCard}>
                <View style={[styles.offeringIconWrap, { backgroundColor: '#FFF5EE' }]}>
                  <Store color="#C4704B" size={36} />
                </View>
                <Text style={styles.offeringLabel}>SHOP</Text>
                <Text style={styles.offeringTitle}>Ceramics Sales</Text>
                <Text style={styles.offeringDesc}>
                  Browse our collection of beautiful handmade pots and ceramic pieces — perfect gifts or home décor.
                </Text>
                <TouchableOpacity onPress={handleBookingPress}>
                  <Text style={styles.offeringLink}>Visit the studio</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.offeringCard}>
                <View style={[styles.offeringIconWrap, { backgroundColor: '#FFF0F5' }]}>
                  <PartyPopper color="#C4704B" size={36} />
                </View>
                <Text style={styles.offeringLabel}>PRIVATE HIRE</Text>
                <Text style={styles.offeringTitle}>Birthday Parties</Text>
                <Text style={styles.offeringDesc}>
                  Host your birthday at Happy Art! Every guest makes a piece to take home as a unique souvenir. 1–100 guests.
                </Text>
                <TouchableOpacity onPress={handleBookingPress}>
                  <Text style={styles.offeringLink}>Group rates apply</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.offeringCard}>
                <View style={[styles.offeringIconWrap, { backgroundColor: '#F0F8FF' }]}>
                  <School color="#C4704B" size={36} />
                </View>
                <Text style={styles.offeringLabel}>GROUPS</Text>
                <Text style={styles.offeringTitle}>Schools & Corporates</Text>
                <Text style={styles.offeringDesc}>
                  Team-building, school trips, and organisation visits. We accommodate groups of any size with advance booking.
                </Text>
                <TouchableOpacity onPress={handleBookingPress}>
                  <Text style={styles.offeringLink}>Quote on request</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* HOW IT WORKS */}
        <View style={[styles.section, styles.processSection]}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={[styles.processStepsRow, isLargeScreen && { justifyContent: 'center' as const }]}>
            <View style={[styles.processStep, isLargeScreen && { width: '30%' as any }]}>
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
            <View style={[styles.processStep, isLargeScreen && { width: '30%' as any }]}>
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
            <View style={[styles.processStep, isLargeScreen && { width: '30%' as any }]}>
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
          </View>
        </View>

        {/* REVIEWS - Horizontal Slideshow */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Our Students Say</Text>
          {allReviewItems.length > 0 && (
            <View style={styles.reviewSliderContainer}>
              {allReviewItems.length > 1 && (
                <TouchableOpacity style={styles.reviewArrow} onPress={scrollReviewLeft} activeOpacity={0.7}>
                  <ChevronLeft color={theme.colors.secondary} size={24} />
                </TouchableOpacity>
              )}
              <FlatList
                ref={reviewScrollRef}
                data={allReviewItems}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={REVIEW_CARD_WIDTH + 16}
                decelerationRate="fast"
                keyExtractor={(item, index) => `${item.source}-${item.id}-${index}`}
                renderItem={renderReviewItem}
                contentContainerStyle={styles.reviewListContent}
                getItemLayout={(_data, index) => ({
                  length: REVIEW_CARD_WIDTH + 16,
                  offset: (REVIEW_CARD_WIDTH + 16) * index,
                  index,
                })}
                onScrollToIndexFailed={(info) => {
                  console.log('[Home] Review scroll failed:', info);
                }}
              />
              {allReviewItems.length > 1 && (
                <TouchableOpacity style={styles.reviewArrow} onPress={scrollReviewRight} activeOpacity={0.7}>
                  <ChevronRight color={theme.colors.secondary} size={24} />
                </TouchableOpacity>
              )}
            </View>
          )}
          {allReviewItems.length > 1 && (
            <View style={styles.reviewDots}>
              {allReviewItems.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.reviewDot, idx === reviewScrollIndex && styles.reviewDotActive]}
                />
              ))}
            </View>
          )}
          <TouchableOpacity
            style={styles.leaveReviewButton}
            onPress={() => setReviewModalVisible(true)}
            testID="leave-review-button"
            activeOpacity={0.8}
          >
            <Star color={theme.colors.white} size={20} fill={theme.colors.white} />
            <Text style={styles.leaveReviewText}>Leave a Review</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <View style={[styles.section, styles.faqSection]}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={[styles.faqList, isLargeScreen && { flexDirection: 'row' as const, flexWrap: 'wrap' as const }]}>
            <View style={[styles.faqItem, isLargeScreen && { width: '48%' as any }]}>
              <View style={styles.faqQuestion}>
                <HelpCircle color={theme.colors.primary} size={20} />
                <Text style={styles.faqQuestionText}>What should I wear to class?</Text>
              </View>
              <Text style={styles.faqAnswer}>
                Wear comfortable clothes that you don&apos;t mind getting a little dirty. We provide aprons, but clay can be messy!
              </Text>
            </View>
            <View style={[styles.faqItem, isLargeScreen && { width: '48%' as any }]}>
              <View style={styles.faqQuestion}>
                <HelpCircle color={theme.colors.primary} size={20} />
                <Text style={styles.faqQuestionText}>Do I need prior experience?</Text>
              </View>
              <Text style={styles.faqAnswer}>
                Not at all! Our classes welcome beginners and experienced potters alike. Our instructors guide you every step of the way.
              </Text>
            </View>
            <View style={[styles.faqItem, isLargeScreen && { width: '48%' as any }]}>
              <View style={styles.faqQuestion}>
                <HelpCircle color={theme.colors.primary} size={20} />
                <Text style={styles.faqQuestionText}>How many people can attend?</Text>
              </View>
              <Text style={styles.faqAnswer}>
                We can accommodate 1 to 100 people! Perfect for individuals, couples, groups, parties, schools, and corporate events.
              </Text>
            </View>
            <View style={[styles.faqItem, isLargeScreen && { width: '48%' as any }]}>
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

        {/* CONTACT */}
        <View style={[styles.section, styles.contactSection]}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={[styles.contactInfo, isLargeScreen && { flexDirection: 'row' as const, flexWrap: 'wrap' as const }]}>
            <TouchableOpacity
              style={[styles.contactItem, isLargeScreen && { width: '48%' as any }]}
              onPress={() => Linking.openURL(`tel:${displaySettings?.phone || ''}`)}
            >
              <Phone color={theme.colors.primary} size={24} />
              <Text style={styles.contactText}>{displaySettings?.phone || ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactItem, isLargeScreen && { width: '48%' as any }]}
              onPress={() => Linking.openURL(`mailto:${displaySettings?.email || ''}`)}
            >
              <Mail color={theme.colors.primary} size={24} />
              <Text style={styles.contactText}>{displaySettings?.email || ''}</Text>
            </TouchableOpacity>
            <View style={[styles.contactItem, isLargeScreen && { width: '48%' as any }]}>
              <MapPin color={theme.colors.primary} size={24} />
              <Text style={styles.contactText}>{displaySettings?.address || ''}</Text>
            </View>
            <View style={[styles.contactItem, isLargeScreen && { width: '48%' as any }]}>
              <Clock color={theme.colors.primary} size={24} />
              <View>
                <Text style={styles.contactText}>
                  Mon-Tue: {displaySettings?.openingHours?.monday || ''}
                </Text>
                <Text style={styles.contactText}>
                  Wed: {displaySettings?.openingHours?.wednesday || ''}
                </Text>
                <Text style={styles.contactText}>
                  Thu-Sat: {displaySettings?.openingHours?.thursday || ''}
                </Text>
                <Text style={styles.contactText}>
                  Sun: {displaySettings?.openingHours?.sunday || ''}
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
              {displaySettings?.socialMedia?.facebook ? (
                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
                  onPress={() => openSocialMedia(displaySettings.socialMedia.facebook)}
                >
                  <Facebook color={theme.colors.white} size={24} />
                </TouchableOpacity>
              ) : null}
              {displaySettings?.socialMedia?.instagram ? (
                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: '#E4405F' }]}
                  onPress={() => openSocialMedia(displaySettings.socialMedia.instagram)}
                >
                  <Instagram color={theme.colors.white} size={24} />
                </TouchableOpacity>
              ) : null}
              {displaySettings?.socialMedia?.twitter ? (
                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
                  onPress={() => openSocialMedia(displaySettings.socialMedia.twitter)}
                >
                  <Twitter color={theme.colors.white} size={24} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>
      <FloatingWhatsApp />

      {/* Review Modal */}
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
                testID="submit-review-button"
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

  heroIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  heroDotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
    borderRadius: 4,
  },
  statsBanner: {
    backgroundColor: '#6B3A2A',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  statsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  section: {
    padding: theme.spacing.md,
  },
  servicesSection: {
    backgroundColor: theme.colors.surface,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  servicesGridLarge: {
    gap: theme.spacing.md,
  },
  maxWidthContainer: {
    maxWidth: 1200,
    alignSelf: 'center' as const,
    width: '100%' as any,
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
  aboutContentLarge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 32,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  aboutImage: {
    width: '100%',
    height: 240,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  aboutImageLarge: {
    width: '45%',
    height: 340,
  },
  aboutImageExtraLarge: {
    height: 400,
  },
  aboutText: {
    flex: 1,
    gap: theme.spacing.md,
  },
  aboutTextLarge: {
    flex: 1,
    paddingTop: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.text,
  },
  serviceCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  serviceCardGrid: {
    width: '48%' as any,
    marginBottom: theme.spacing.sm,
  },
  serviceCardGridMedium: {
    width: '48%' as any,
  },
  serviceCardGridLarge: {
    width: '23.5%' as any,
  },
  serviceImage: {
    width: '100%',
    height: 130,
    backgroundColor: theme.colors.surface,
  },
  serviceImageLarge: {
    height: 160,
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

  eventsSection: {
    backgroundColor: theme.colors.accent,
  },
  noEventsContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  noEventsTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
  },
  noEventsText: {
    fontSize: 15,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  eventsGrid: {
    gap: theme.spacing.md,
  },
  eventHomeCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  eventHomeImage: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.surface,
  },
  eventHomeContent: {
    padding: theme.spacing.md,
  },
  eventHomeDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  eventHomeDateText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  eventHomeTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: 4,
  },
  eventHomeDesc: {
    fontSize: 13,
    color: theme.colors.textLight,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  eventHomeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventHomeDetailText: {
    fontSize: 13,
    color: theme.colors.text,
    marginRight: 12,
  },
  viewAllEventsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  viewAllEventsText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.primary,
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
  processStepsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    flexWrap: 'wrap',
  },
  processStep: {
    flex: 1,
    minWidth: 200,
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

  reviewSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewArrow: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  reviewListContent: {
    paddingHorizontal: 8,
    gap: 16,
  },
  reviewSlideCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  reviewDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: theme.spacing.md,
  },
  reviewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  reviewDotActive: {
    backgroundColor: theme.colors.primary,
    width: 20,
    borderRadius: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  testimonialText: {
    fontSize: 15,
    lineHeight: 22,
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
  offeringsSection: {
    backgroundColor: '#FBF8F5',
  },
  offeringsGrid: {
    flexDirection: 'column' as const,
    gap: theme.spacing.md,
  },
  offeringsGridLarge: {
    flexDirection: 'row' as const,
  },
  offeringCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: theme.spacing.lg,
    alignItems: 'center' as const,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  offeringIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  offeringLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#C4704B',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  offeringTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center' as const,
  },
  offeringDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textLight,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  offeringLink: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#C4704B',
    textDecorationLine: 'underline' as const,
  },
});
