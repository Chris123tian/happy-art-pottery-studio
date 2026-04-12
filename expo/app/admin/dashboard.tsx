import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  Calendar,
  Image as ImageIcon,
  Mail,
  Settings,
  Users,
  TrendingUp,
  Clock,
  Star,
  DollarSign,
  MessageSquare,
  ShoppingBag,
} from 'lucide-react-native';
import { AdminHeader } from '@/components/AdminHeader';
import { theme } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';

const { width } = Dimensions.get('window');
const cardWidth = width > 768 ? (width - theme.spacing.lg * 4) / 3 : (width - theme.spacing.lg * 3) / 2;

export default function AdminDashboard() {
  console.log('[AdminDashboard] Screen rendered');
  const router = useRouter();
  const { bookings, events, gallery, messages, classes, instructors, reviews, shopItems } = useData();

  const stats = useMemo(() => ({
    bookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    events: events.length,
    gallery: gallery.length,
    messages: messages.length,
    unreadMessages: messages.filter((m) => !m.read).length,
    classes: classes.length,
    instructors: instructors.length,
    reviews: reviews.length,
    pendingReviews: reviews.filter((r) => r.status === 'pending').length,
    shopItems: shopItems.length,
  }), [bookings, events, gallery, messages, classes, instructors, reviews, shopItems]);

  const handleNavigate = useCallback((route: string) => {
    router.push(route as any);
  }, [router]);

  const statsCards = useMemo(() => [
    {
      title: 'Total Bookings',
      count: stats.bookings,
      icon: BookOpen,
      color: theme.colors.primary,
      gradient: ['#FF6B35', '#FF8C5A'],
      subtitle: `${stats.pendingBookings} pending`,
    },
    {
      title: 'Unread Messages',
      count: stats.unreadMessages,
      icon: Mail,
      color: '#F44336',
      gradient: ['#F44336', '#E91E63'],
      subtitle: `${stats.messages} total`,
    },
    {
      title: 'Upcoming Events',
      count: stats.events,
      icon: Calendar,
      color: '#9C27B0',
      gradient: ['#9C27B0', '#BA68C8'],
      subtitle: 'This month',
    },
    {
      title: 'Gallery Images',
      count: stats.gallery,
      icon: ImageIcon,
      color: '#2196F3',
      gradient: ['#2196F3', '#42A5F5'],
      subtitle: 'Total images',
    },
  ], [stats]);

  const managementCards = useMemo(() => [
    {
      title: 'Classes',
      count: stats.classes,
      icon: BookOpen,
      color: '#4CAF50',
      route: '/admin/classes',
    },
    {
      title: 'Instructors',
      count: stats.instructors,
      icon: Users,
      color: '#FF9800',
      route: '/admin/instructors',
    },
    {
      title: 'Bookings',
      count: stats.bookings,
      icon: Calendar,
      color: theme.colors.primary,
      route: '/admin/bookings',
    },
    {
      title: 'Events',
      count: stats.events,
      icon: Star,
      color: '#9C27B0',
      route: '/admin/events',
    },
    {
      title: 'Gallery',
      count: stats.gallery,
      icon: ImageIcon,
      color: '#2196F3',
      route: '/admin/gallery',
    },
    {
      title: 'Messages',
      count: stats.messages,
      icon: Mail,
      color: '#F44336',
      route: '/admin/messages',
    },
    {
      title: 'Reviews',
      count: stats.reviews,
      icon: MessageSquare,
      color: '#FF9800',
      route: '/admin/reviews',
    },
    {
      title: 'Shop',
      count: stats.shopItems,
      icon: ShoppingBag,
      color: '#795548',
      route: '/admin/shop',
    },
    {
      title: 'Prices',
      count: 0,
      icon: DollarSign,
      color: '#009688',
      route: '/admin/prices',
    },
  ], [stats]);

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="admin-dashboard-screen">
      <AdminHeader />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back, Admin</Text>
          </View>
          <View style={styles.timeContainer}>
            <Clock color={theme.colors.textLight} size={16} />
            <Text style={styles.timeText}>
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {statsCards.map((card, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: card.color }]}>
                <card.icon color={theme.colors.white} size={24} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statCount}>{card.count}</Text>
                <Text style={styles.statTitle}>{card.title}</Text>
                <Text style={styles.statSubtitle}>{card.subtitle}</Text>
              </View>
              <View style={styles.statTrend}>
                <TrendingUp color={card.color} size={20} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Management</Text>
          <Text style={styles.sectionSubtitle}>Tap to manage</Text>
        </View>

        <View style={styles.managementGrid}>
          {managementCards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={styles.managementCard}
              onPress={() => handleNavigate(card.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.managementIcon, { backgroundColor: card.color }]}>
                <card.icon color={theme.colors.white} size={28} />
              </View>
              <Text style={styles.managementCount}>{card.count}</Text>
              <Text style={styles.managementTitle}>{card.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.settingsCard}
          onPress={() => handleNavigate('/admin/settings')}
          activeOpacity={0.9}
        >
          <View style={styles.settingsContent}>
            <View style={styles.settingsIcon}>
              <Settings color={theme.colors.white} size={32} />
            </View>
            <View style={styles.settingsTextContainer}>
              <Text style={styles.settingsTitle}>Website Settings</Text>
              <Text style={styles.settingsDescription}>
                Update studio info, social media, hours, and images
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleNavigate('/admin/events')}
            >
              <Calendar color={theme.colors.white} size={20} />
              <Text style={styles.actionText}>Add Event</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              onPress={() => handleNavigate('/admin/gallery')}
            >
              <ImageIcon color={theme.colors.white} size={20} />
              <Text style={styles.actionText}>Add Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleNavigate('/admin/classes')}
            >
              <BookOpen color={theme.colors.white} size={20} />
              <Text style={styles.actionText}>Add Class</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
              onPress={() => handleNavigate('/admin/reviews')}
            >
              <MessageSquare color={theme.colors.white} size={20} />
              <Text style={styles.actionText}>
                Reviews{stats.pendingReviews > 0 ? ` (${stats.pendingReviews})` : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#795548' }]}
              onPress={() => handleNavigate('/admin/shop')}
            >
              <ShoppingBag color={theme.colors.white} size={20} />
              <Text style={styles.actionText}>Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#009688' }]}
              onPress={() => handleNavigate('/admin/prices')}
            >
              <DollarSign color={theme.colors.white} size={20} />
              <Text style={styles.actionText}>Prices</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  statCard: {
    width: cardWidth,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.lg,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  statCount: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: theme.colors.text,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 13,
    color: theme.colors.textLight,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 11,
    color: theme.colors.textLight,
  },
  statTrend: {
    opacity: 0.3,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: theme.colors.textLight,
  },
  managementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  managementCard: {
    width: (width - theme.spacing.lg * 4) / 3,
    minWidth: 100,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  managementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  managementCount: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: theme.colors.text,
  },
  managementTitle: {
    fontSize: 13,
    color: theme.colors.textLight,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  settingsCard: {
    margin: theme.spacing.lg,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  settingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  settingsIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  settingsDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  actionsContainer: {
    padding: theme.spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  actionText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '700' as const,
  },
});
