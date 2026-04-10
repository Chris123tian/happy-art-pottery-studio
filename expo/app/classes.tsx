import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { OptimizedImage } from '@/components/OptimizedImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { theme } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { Class } from '@/types';

export default function Classes() {
  console.log('[Classes] Screen rendered');
  const router = useRouter();
  const { classes } = useData();
  const { width: screenWidth } = useWindowDimensions();
  const isLargeScreen = screenWidth > 768;
  const isMediumScreen = screenWidth > 480;
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const filteredClasses = useMemo(
    () => filter === 'all' ? classes : classes.filter((c: Class) => c.level === filter),
    [classes, filter]
  );

  const handleBookingPress = useCallback(() => {
    router.push('/booking' as any);
  }, [router]);

  const cardWidth = isLargeScreen
    ? '31%'
    : isMediumScreen
      ? '48%'
      : '100%';

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="classes-screen">
      <Header />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Our Classes</Text>
          <Text style={styles.subtitle}>
            Perfect for individuals, groups, parties, schools, and organizations
          </Text>
        </View>

        <View style={styles.filters}>
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.filterButton, filter === level && styles.filterButtonActive]}
              onPress={() => setFilter(level)}
            >
              <Text style={[styles.filterText, filter === level && styles.filterTextActive]}>
                {level === 'all' ? 'All Classes' : level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.classList, isLargeScreen && styles.classListLarge]}>
          {filteredClasses.map((classItem: Class) => (
            <View
              key={classItem.id}
              style={[
                styles.classCard,
                { width: cardWidth as any },
              ]}
            >
              {classItem.image && (
                <OptimizedImage
                  uri={classItem.image}
                  style={[styles.classImage, !isMediumScreen && { height: 180 }]}
                  contentFit="cover"
                  priority="normal"
                  recyclingKey={`class-${classItem.id}`}
                />
              )}
              <View style={styles.classContent}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>
                    {classItem.level.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.classTitle}>{classItem.title}</Text>
                <Text style={styles.classDescription} numberOfLines={isMediumScreen ? 3 : 4}>
                  {classItem.description}
                </Text>
                <Button
                  title="Book Now"
                  onPress={handleBookingPress}
                  style={styles.bookButton}
                />
              </View>
            </View>
          ))}
        </View>

        {filteredClasses.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No classes found for this level</Text>
          </View>
        )}
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
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    maxWidth: 600,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  filterButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  filterTextActive: {
    color: theme.colors.white,
  },
  classList: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  classListLarge: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'flex-start',
  },
  classCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  classImage: {
    width: '100%',
    height: 160,
    backgroundColor: theme.colors.surface,
  },
  classContent: {
    padding: theme.spacing.md,
  },
  levelBadge: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  levelText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  classTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  classDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
  },
  bookButton: {
    marginTop: theme.spacing.xs,
  },
  emptyState: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
});
