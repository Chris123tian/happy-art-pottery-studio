import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminHeader } from '@/components/AdminHeader';
import { theme } from '@/constants/theme';
import { dataService } from '@/services/dataService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useData } from '@/contexts/DataContext';
import { database } from '@/services/database';
import { Booking } from '@/types';

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const { bookings: rawBookings } = useData();
  const [newBookingsCount, setNewBookingsCount] = useState(0);

  useEffect(() => {
    console.log('[Bookings] Setting up real-time listener...');
    const unsubscribe = database.subscribeToCollection<Booking>(
      'bookings',
      (newBookings) => {
        console.log('[Bookings] Real-time update received:', newBookings.length);
        queryClient.setQueryData(['bookings'], newBookings);
        
        const pending = newBookings.filter(b => b.status === 'pending').length;
        setNewBookingsCount(pending);
        
        if (pending > newBookingsCount) {
          console.log('[Bookings] New booking received!');
        }
      },
      (error) => {
        console.error('[Bookings] Real-time listener error:', error);
      }
    );

    return () => {
      console.log('[Bookings] Cleaning up real-time listener');
      unsubscribe();
    };
  }, [queryClient, newBookingsCount]);

  const bookings = useMemo(() => {
    return [...rawBookings].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [rawBookings]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'pending' | 'confirmed' | 'completed' | 'cancelled' }) => 
      dataService.updateBooking(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      console.error('Error updating booking:', error);
    },
  });

  const updateStatus = (id: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    updateStatusMutation.mutate({ id, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.success;
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.warning;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminHeader />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Bookings</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.subtitle}>{bookings.length} total bookings</Text>
            {newBookingsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{newBookingsCount} pending</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bookingsList}>
          {bookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingName}>{booking.name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(booking.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {booking.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <Text style={styles.detail}>Phone: {booking.phone}</Text>
                <Text style={styles.detail}>
                  Number of Persons: {booking.numberOfPersons}
                </Text>
                <Text style={styles.detail}>
                  Date: {booking.date} ({booking.day})
                </Text>
                <Text style={styles.detail}>Class: {booking.classType}</Text>
                <Text style={styles.detailSmall}>
                  Booked: {new Date(booking.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                  onPress={() => updateStatus(booking.id, 'confirmed')}
                >
                  <Text style={styles.actionText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                  onPress={() => updateStatus(booking.id, 'completed')}
                >
                  <Text style={styles.actionText}>Complete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                  onPress={() => updateStatus(booking.id, 'cancelled')}
                >
                  <Text style={styles.actionText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {bookings.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No bookings yet</Text>
          </View>
        )}
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  bookingsList: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  bookingCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  bookingName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  statusBadge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  bookingDetails: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  detail: {
    fontSize: 14,
    color: theme.colors.text,
  },
  detailSmall: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  actionText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  emptyState: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  badge: {
    backgroundColor: theme.colors.warning,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '700' as const,
  },
});
