import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { theme } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { Class } from '@/types';

export default function Classes() {
  const router = useRouter();
  const { classes } = useData();
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const filteredClasses = useMemo(
    () => filter === 'all' ? classes : classes.filter((c: Class) => c.level === filter),
    [classes, filter]
  );

  const handleBookingPress = useCallback(() => {
    router.push('/booking' as any);
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Our Classes</Text>
          <Text style={styles.subtitle}>
            Perfect for individuals, groups, parties, schools, and organizations
          </Text>
        </View>

        <View style={styles.filters}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[styles.filterText, filter === 'all' && styles.filterTextActive]}
            >
              All Classes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'beginner' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('beginner')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'beginner' && styles.filterTextActive,
              ]}
            >
              Beginner
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'intermediate' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('intermediate')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'intermediate' && styles.filterTextActive,
              ]}
            >
              Intermediate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'advanced' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('advanced')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'advanced' && styles.filterTextActive,
              ]}
            >
              Advanced
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.classList}>
          {filteredClasses.map((classItem: Class) => (
            <View key={classItem.id} style={styles.classCard}>
              {classItem.image && (
                <Image
                  source={{ uri: classItem.image }}
                  style={styles.classImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.classContent}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>
                    {classItem.level.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.classTitle}>{classItem.title}</Text>
                <Text style={styles.classDescription}>{classItem.description}</Text>
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
    padding: theme.spacing.md,
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
    gap: theme.spacing.md,
  },
  classCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  classImage: {
    width: '100%',
    height: 200,
  },
  classContent: {
    padding: theme.spacing.lg,
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
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  classDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
  },
  bookButton: {
    marginTop: theme.spacing.sm,
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
