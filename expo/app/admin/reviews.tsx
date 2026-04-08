import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Check, X, Trash2, Plus, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { AdminHeader } from '@/components/AdminHeader';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { dataService } from '@/services/dataService';
import { Review } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useData } from '@/contexts/DataContext';

type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const { reviews } = useData();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', text: '', rating: 5 });

  const filteredReviews = useMemo(
    () => filter === 'all' ? reviews : reviews.filter((r) => r.status === filter),
    [reviews, filter]
  );

  const counts = useMemo(() => ({
    all: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
  }), [reviews]);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert(title, message);
    }
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Review> }) =>
      dataService.updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error) => {
      console.error('[AdminReviews] Error updating review:', error);
      showAlert('Error', 'Failed to update review');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error) => {
      console.error('[AdminReviews] Error deleting review:', error);
      showAlert('Error', 'Failed to delete review');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Review, 'id'>) => dataService.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setShowAddModal(false);
      setAddForm({ name: '', text: '', rating: 5 });
      showAlert('Success', 'Review added and approved!');
    },
    onError: (error) => {
      console.error('[AdminReviews] Error creating review:', error);
      showAlert('Error', 'Failed to add review');
    },
  });

  const handleApprove = (id: string) => {
    updateMutation.mutate({ id, data: { status: 'approved' } });
  };

  const handleReject = (id: string) => {
    updateMutation.mutate({ id, data: { status: 'rejected' } });
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this review?')) {
        deleteMutation.mutate(id);
      }
    } else {
      Alert.alert('Delete Review', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
      ]);
    }
  };

  const handleAddReview = () => {
    if (!addForm.name.trim() || !addForm.text.trim()) {
      showAlert('Error', 'Please fill in name and review text');
      return;
    }
    createMutation.mutate({
      name: addForm.name.trim(),
      text: addForm.text.trim(),
      rating: addForm.rating,
      date: new Date().toISOString().split('T')[0],
      status: 'approved',
      createdAt: new Date().toISOString(),
    });
  };

  const getStatusIcon = (status: Review['status']) => {
    switch (status) {
      case 'pending': return <Clock color="#FFC107" size={16} />;
      case 'approved': return <CheckCircle color={theme.colors.success} size={16} />;
      case 'rejected': return <XCircle color={theme.colors.error} size={16} />;
    }
  };

  const getStatusColor = (status: Review['status']) => {
    switch (status) {
      case 'pending': return '#FFC107';
      case 'approved': return theme.colors.success;
      case 'rejected': return theme.colors.error;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminHeader />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Manage Reviews</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus color={theme.colors.white} size={20} />
              <Text style={styles.addButtonText}>Add Review</Text>
            </TouchableOpacity>
          </View>
          {counts.pending > 0 && (
            <View style={styles.pendingBanner}>
              <Clock color="#FFC107" size={18} />
              <Text style={styles.pendingText}>
                {counts.pending} review{counts.pending > 1 ? 's' : ''} awaiting approval
              </Text>
            </View>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <View style={styles.filters}>
            {(['all', 'pending', 'approved', 'rejected'] as FilterType[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterButton, filter === f && styles.filterButtonActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.reviewsList}>
          {filteredReviews.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No {filter === 'all' ? '' : filter} reviews found</Text>
            </View>
          )}
          {filteredReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewName}>{review.name}</Text>
                  <View style={styles.starsRow}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        color={i < review.rating ? '#F5A623' : theme.colors.border}
                        size={14}
                        fill={i < review.rating ? '#F5A623' : 'transparent'}
                      />
                    ))}
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(review.status) + '20' }]}>
                  {getStatusIcon(review.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(review.status) }]}>
                    {review.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.reviewText}>{review.text}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>

              <View style={styles.reviewActions}>
                {review.status !== 'approved' && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                    onPress={() => handleApprove(review.id)}
                  >
                    <Check color={theme.colors.white} size={16} />
                    <Text style={styles.actionText}>Approve</Text>
                  </TouchableOpacity>
                )}
                {review.status !== 'rejected' && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#FFC107' }]}
                    onPress={() => handleReject(review.id)}
                  >
                    <X color={theme.colors.white} size={16} />
                    <Text style={styles.actionText}>Reject</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                  onPress={() => handleDelete(review.id)}
                >
                  <Trash2 color={theme.colors.white} size={16} />
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Review</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X color={theme.colors.text} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Customer Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={addForm.name}
                  onChangeText={(t) => setAddForm((p) => ({ ...p, name: t }))}
                  placeholder="Enter customer name"
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Rating *</Text>
                <View style={styles.starSelector}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setAddForm((p) => ({ ...p, rating: star }))}
                      style={styles.starTouchable}
                    >
                      <Star
                        color={star <= addForm.rating ? '#F5A623' : theme.colors.border}
                        size={32}
                        fill={star <= addForm.rating ? '#F5A623' : 'transparent'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Review Text *</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  value={addForm.text}
                  onChangeText={(t) => setAddForm((p) => ({ ...p, text: t }))}
                  placeholder="Enter review text"
                  placeholderTextColor={theme.colors.textLight}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, createMutation.isPending && { opacity: 0.6 }]}
                onPress={handleAddReview}
                disabled={createMutation.isPending}
              >
                <Text style={styles.submitText}>
                  {createMutation.isPending ? 'Adding...' : 'Add Review'}
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
    backgroundColor: theme.colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    color: theme.colors.white,
    fontWeight: '600' as const,
    fontSize: 14,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: '#FFF8E1',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#F57F17',
  },
  filtersContainer: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filters: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  filterButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  filterTextActive: {
    color: theme.colors.white,
  },
  reviewsList: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  emptyState: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  reviewCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  reviewInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  reviewName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  reviewDate: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  actionText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  formInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
  },
  formTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  starSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  starTouchable: {
    padding: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  submitButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.colors.white,
  },
});
