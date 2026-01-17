import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Star, HelpCircle, Palette, Users, Heart, Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Music } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { theme } from '@/constants/theme';
import { seedSettings } from '@/services/seedData';
import { useData } from '@/contexts/DataContext';

interface BlogPost {
  id: string;
  title: string;
  published: string;
  content: string;
  url: string;
}

export default function Home() {
  const router = useRouter();
  const { settings, instructors, gallery, testimonials } = useData();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [instructorIndex, setInstructorIndex] = useState(0);
  const heroFadeAnim = useRef(new Animated.Value(1)).current;
  const instructorFadeAnim = useRef(new Animated.Value(1)).current;

  const displayGallery = useMemo(
    () => gallery.slice(0, 6),
    [gallery]
  );

  const displaySettings = settings || seedSettings;
  const heroImages = displaySettings.heroImages || [displaySettings.heroImage];

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

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      Animated.timing(heroFadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setHeroIndex((prev) => (prev + 1) % heroImages.length);
        Animated.timing(heroFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length, heroFadeAnim]);

  useEffect(() => {
    if (instructors.length <= 1) return;
    const interval = setInterval(() => {
      Animated.timing(instructorFadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setInstructorIndex((prev) => (prev + 1) % instructors.length);
        Animated.timing(instructorFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [instructors.length, instructorFadeAnim]);

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Animated.View style={[styles.heroImageContainer, { opacity: heroFadeAnim }]}>
            <Image
              source={{ uri: heroImages[heroIndex] }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </Animated.View>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{displaySettings.studioName}</Text>
            <Text style={styles.heroSubtitle}>{displaySettings.tagline}</Text>
            <Button
              title="Book a Class"
              onPress={handleBookingPress}
              style={styles.heroButton}
            />
            {heroImages.length > 1 && (
              <View style={styles.heroIndicators}>
                {heroImages.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.heroIndicator,
                      index === heroIndex && styles.heroIndicatorActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About {displaySettings.studioName}</Text>
          <View style={styles.aboutContent}>
            <Image
              source={{ uri: displaySettings.aboutImage }}
              style={styles.aboutImage}
              resizeMode="cover"
            />
            <View style={styles.aboutText}>
              <Text style={styles.paragraph}>{displaySettings.description}</Text>
              <Text style={styles.paragraph}>
                Join us {displaySettings.openingHours.monday}. We welcome 1 to 100 people!
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.servicesSection]}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.servicesGrid}>
            <View style={styles.serviceCard}>
              <Text style={styles.serviceTitle}>Wheel Throwing</Text>
              <Text style={styles.serviceDescription}>
                Learn the art of shaping clay on the pottery wheel. Perfect for all skill levels.
              </Text>
            </View>
            <View style={styles.serviceCard}>
              <Text style={styles.serviceTitle}>Pot Painting</Text>
              <Text style={styles.serviceDescription}>
                Express your creativity by painting and decorating ceramic pieces.
              </Text>
            </View>
            <View style={styles.serviceCard}>
              <Text style={styles.serviceTitle}>Free Hand Modeling</Text>
              <Text style={styles.serviceDescription}>
                Create unique pottery pieces using traditional hand-building techniques.
              </Text>
            </View>
            <View style={styles.serviceCard}>
              <Text style={styles.serviceTitle}>Pottery & Ceramics Sales</Text>
              <Text style={styles.serviceDescription}>
                Browse our collection of handmade pots and ceramic pieces for purchase.
              </Text>
            </View>
          </View>
        </View>

        {instructors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Instructors</Text>
            <Animated.View style={[styles.instructorSlideshow, { opacity: instructorFadeAnim }]}>
              <View style={styles.instructorCard}>
                <Image
                  source={{ uri: instructors[instructorIndex].image }}
                  style={styles.instructorImage}
                  resizeMode="cover"
                />
                <Text style={styles.instructorName}>{instructors[instructorIndex].name}</Text>
                <Text style={styles.instructorTitle}>{instructors[instructorIndex].title}</Text>
                <Text style={styles.instructorBio}>{instructors[instructorIndex].bio}</Text>
              </View>
            </Animated.View>
            {instructors.length > 1 && (
              <View style={styles.instructorIndicators}>
                {instructors.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.instructorIndicator,
                      index === instructorIndex && styles.instructorIndicatorActive,
                    ]}
                  />
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
                    resizeMode="cover"
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

        <View style={[styles.section, styles.processSection]}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.processSteps}>
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
          </View>
        </View>

        {testimonials.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What Our Students Say</Text>
            <View style={styles.testimonialsGrid}>
              {testimonials.map((testimonial) => (
                <View key={testimonial.id} style={styles.testimonialCard}>
                  <View style={styles.starsRow}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        color={theme.colors.primary}
                        size={16}
                        fill={theme.colors.primary}
                      />
                    ))}
                  </View>
                  <Text style={styles.testimonialText}>&ldquo;{testimonial.text}&rdquo;</Text>
                  <Text style={styles.testimonialAuthor}>- {testimonial.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

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
              {displaySettings.socialMedia.tiktok && (
                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: '#000000' }]}
                  onPress={() => openSocialMedia(displaySettings.socialMedia.tiktok)}
                >
                  <Music color={theme.colors.white} size={24} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      <FloatingWhatsApp />
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
  },
  heroImage: {
    width: '100%',
    height: '100%',
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
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  heroIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  heroIndicatorActive: {
    backgroundColor: theme.colors.white,
    width: 24,
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
    gap: theme.spacing.md,
  },
  serviceCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    ...theme.shadows.md,
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
  instructorSlideshow: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  instructorCard: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
    maxWidth: 350,
  },
  instructorImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: theme.spacing.sm,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: theme.colors.text,
    textAlign: 'center',
  },
  instructorTitle: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  instructorBio: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  instructorIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  instructorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.surface,
  },
  instructorIndicatorActive: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
  galleryScroll: {
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  galleryItem: {
    width: 200,
    height: 200,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
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
  },
  galleryGridImage: {
    width: '100%',
    height: '100%',
  },
  processSection: {
    backgroundColor: theme.colors.surface,
  },
  processSteps: {
    flexDirection: 'column',
    gap: theme.spacing.lg,
    justifyContent: 'center',
  },
  processStep: {
    flex: 1,
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
});
