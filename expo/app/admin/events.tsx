import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Edit2, Trash2, Upload, X } from 'lucide-react-native';
import { AdminHeader } from '@/components/AdminHeader';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { dataService } from '@/services/dataService';
import { imageService } from '@/services/imageService';
import { Event } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useData } from '@/contexts/DataContext';

const INITIAL_FORM = {
  title: '',
  description: '',
  date: '',
  time: '',
  duration: '',
  price: '0',
  maxParticipants: '20',
  instructor: '',
  category: '',
  image: '',
};

export default function AdminEvents() {
  console.log('[AdminEvents] Screen rendered');
  const queryClient = useQueryClient();
  const { events } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const formRef = useRef(formData);
  formRef.current = formData;

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert(title, message);
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: Omit<Event, 'id'>) => dataService.createEvent(data),
    onMutate: async (newEvent) => {
      await queryClient.cancelQueries({ queryKey: ['events'] });
      const previousEvents = queryClient.getQueryData(['events']);
      const tempId = `temp-${Date.now()}`;
      queryClient.setQueryData(['events'], (old: any) => 
        [...(old || []), { ...newEvent, id: tempId }]
      );
      return { previousEvents };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      showAlert('Success', 'Event created successfully!');
      resetForm();
    },
    onError: (error, _, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
      }
      console.error('Error creating event:', error);
      showAlert('Error', 'Failed to create event. Please check your connection and try again.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) => 
      dataService.updateEvent(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['events'] });
      const previousEvents = queryClient.getQueryData(['events']);
      queryClient.setQueryData(['events'], (old: any) => 
        (old || []).map((event: Event) => 
          event.id === id ? { ...event, ...data } : event
        )
      );
      return { previousEvents };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      showAlert('Success', 'Event updated successfully!');
      resetForm();
    },
    onError: (error, _, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
      }
      console.error('Error updating event:', error);
      showAlert('Error', 'Failed to update event. Please check your connection and try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      showAlert('Error', 'Failed to delete event. Please try again.');
    },
  });

  const handleSubmit = () => {
    const current = formRef.current;
    if (!current.title || !current.date) {
      showAlert('Error', 'Please fill in the event title and date.');
      return;
    }

    const eventData = {
      title: current.title,
      description: current.description,
      date: current.date,
      time: current.time,
      duration: current.duration,
      price: parseFloat(current.price) || 0,
      maxParticipants: parseInt(current.maxParticipants) || 20,
      currentParticipants: 0,
      image: current.image || 'https://images.unsplash.com/photo-1593118247619-cb00ea46c309?w=800',
      instructor: current.instructor,
      category: current.category,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: eventData });
    } else {
      createMutation.mutate(eventData);
    }
  };

  const handleImageUpload = async () => {
    if (uploadingImage) return;
    try {
      setUploadingImage(true);
      console.log('[AdminEvents] Starting image upload...');
      const imageUrl = await imageService.pickAndUploadImage({
        storagePath: `events/event_${Date.now()}.jpg`,
        quality: 0.8,
        aspect: [16, 9],
      });
      
      if (imageUrl) {
        console.log('[AdminEvents] Image uploaded:', imageUrl);
        setFormData((prev) => ({ ...prev, image: imageUrl }));
        showAlert('Success', 'Image uploaded successfully!');
      }
    } catch (error: any) {
      console.error('[AdminEvents] Error uploading image:', error);
      const message = error?.message?.includes('permission')
        ? 'Please allow access to your photo library in settings.'
        : error?.message?.includes('too large')
        ? 'Image is too large. Please use an image smaller than 10MB.'
        : 'Failed to upload image. Please check your internet connection and try again.';
      showAlert('Upload Failed', message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      duration: event.duration,
      price: event.price.toString(),
      maxParticipants: event.maxParticipants.toString(),
      instructor: event.instructor,
      category: event.category,
      image: event.image,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this event?')) {
        deleteMutation.mutate(id);
      }
    } else {
      Alert.alert(
        'Delete Event',
        'Are you sure you want to delete this event?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
        ]
      );
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...INITIAL_FORM });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="admin-events-screen">
      <AdminHeader />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Events</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm ? (
              <X color={theme.colors.white} size={20} />
            ) : (
              <Plus color={theme.colors.white} size={20} />
            )}
            <Text style={styles.addButtonText}>
              {showForm ? 'Cancel' : 'Add Event'}
            </Text>
          </TouchableOpacity>
        </View>

        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>
              {editingId ? 'Edit Event' : 'Add New Event'}
            </Text>

            <View style={styles.imageUploadSection}>
              {formData.image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: formData.image }} style={styles.imagePreview} contentFit="cover" />
                  <TouchableOpacity
                    style={[styles.changeImageButton, uploadingImage && { opacity: 0.6 }]}
                    onPress={handleImageUpload}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <ActivityIndicator size="small" color={theme.colors.white} />
                    ) : (
                      <>
                        <Upload color={theme.colors.white} size={16} />
                        <Text style={styles.changeImageText}>Change Image</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.uploadButton, uploadingImage && { opacity: 0.6 }]}
                  onPress={handleImageUpload}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <>
                      <ActivityIndicator size="large" color={theme.colors.primary} />
                      <Text style={styles.uploadButtonText}>Uploading...</Text>
                    </>
                  ) : (
                    <>
                      <Upload color={theme.colors.primary} size={32} />
                      <Text style={styles.uploadButtonText}>Upload Event Image</Text>
                      <Text style={styles.uploadButtonSubtext}>Tap to select image (max 10MB)</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, title: text }))}
              placeholder="Event Title *"
              placeholderTextColor={theme.colors.textLight}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
              placeholder="Description"
              multiline
              numberOfLines={4}
              placeholderTextColor={theme.colors.textLight}
            />

            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, date: text }))}
              placeholder="Date (e.g., 2025-11-25) *"
              placeholderTextColor={theme.colors.textLight}
            />

            <TextInput
              style={styles.input}
              value={formData.time}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, time: text }))}
              placeholder="Time (e.g., 2:00 PM)"
              placeholderTextColor={theme.colors.textLight}
            />

            <TextInput
              style={styles.input}
              value={formData.duration}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, duration: text }))}
              placeholder="Duration (e.g., 3 hours)"
              placeholderTextColor={theme.colors.textLight}
            />

            <TextInput
              style={styles.input}
              value={formData.maxParticipants}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, maxParticipants: text }))}
              placeholder="Max Participants"
              keyboardType="number-pad"
              placeholderTextColor={theme.colors.textLight}
            />

            <TextInput
              style={styles.input}
              value={formData.instructor}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, instructor: text }))}
              placeholder="Instructor Name"
              placeholderTextColor={theme.colors.textLight}
            />

            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, category: text }))}
              placeholder="Category (e.g., workshop, party)"
              placeholderTextColor={theme.colors.textLight}
            />

            <Button
              title={isSaving ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
              onPress={handleSubmit}
              disabled={isSaving || uploadingImage}
            />
          </View>
        )}

        <View style={styles.eventsList}>
          {events.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No events yet. Tap "Add Event" to create one.</Text>
            </View>
          )}
          {events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              {event.image && (
                <Image source={{ uri: event.image }} style={styles.eventImage} contentFit="cover" />
              )}
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventActions}>
                    <TouchableOpacity onPress={() => handleEdit(event)} style={styles.actionButton}>
                      <Edit2 color={theme.colors.primary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(event.id)} style={styles.actionButton}>
                      <Trash2 color={theme.colors.error} size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.eventDescription} numberOfLines={2}>{event.description}</Text>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventDetail}>Date: {event.date}</Text>
                  <Text style={styles.eventDetail}>Time: {event.time}</Text>
                  <Text style={styles.eventDetail}>Duration: {event.duration}</Text>
                  <Text style={styles.eventDetail}>
                    Capacity: {event.currentParticipants}/{event.maxParticipants}
                  </Text>
                  {event.instructor && (
                    <Text style={styles.eventDetail}>Instructor: {event.instructor}</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
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
  },
  form: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
    ...theme.shadows.md,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  eventsList: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  eventCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventContent: {
    padding: theme.spacing.lg,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  eventTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  eventActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    padding: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  eventDetails: {
    gap: theme.spacing.xs,
  },
  eventDetail: {
    fontSize: 14,
    color: theme.colors.text,
  },
  emptyState: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  imageUploadSection: {
    marginBottom: theme.spacing.sm,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed' as const,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.primary,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  imagePreviewContainer: {
    position: 'relative' as const,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
  },
  changeImageButton: {
    position: 'absolute' as const,
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  changeImageText: {
    color: theme.colors.white,
    fontWeight: '600' as const,
    fontSize: 14,
  },
});
