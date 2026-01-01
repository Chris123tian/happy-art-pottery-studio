import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Edit2, Trash2 } from 'lucide-react-native';
import { AdminHeader } from '@/components/AdminHeader';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { dataService } from '@/services/dataService';
import { Event } from '@/types';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminEvents() {
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const data = await dataService.getEvents();
    setEvents(data);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date) {
      if (Platform.OS === 'web') {
        alert('Please fill in required fields');
      } else {
        Alert.alert('Error', 'Please fill in required fields');
      }
      return;
    }

    const eventData = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      price: parseFloat(formData.price) || 0,
      maxParticipants: parseInt(formData.maxParticipants) || 20,
      currentParticipants: 0,
      image: formData.image || 'https://images.unsplash.com/photo-1593118247619-cb00ea46c309?w=800',
      instructor: formData.instructor,
      category: formData.category,
    };

    try {
      if (editingId) {
        await dataService.updateEvent(editingId, eventData);
      } else {
        await dataService.createEvent(eventData);
      }
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      await loadEvents();
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
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

  const handleDelete = async (id: string) => {
    try {
      await dataService.deleteEvent(id);
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
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
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminHeader />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Events</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(!showForm)}
          >
            <Plus color={theme.colors.white} size={24} />
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

            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Event Title *"
              placeholderTextColor={theme.colors.textLight}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Description"
              multiline
              numberOfLines={4}
              placeholderTextColor={theme.colors.textLight}
            />

            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
              placeholder="Date (e.g., 2025-11-25) *"
              placeholderTextColor={theme.colors.textLight}
            />

            <TextInput
              style={styles.input}
              value={formData.time}
              onChangeText={(text) => setFormData({ ...formData, time: text })}
              placeholder="Time (e.g., 2:00 PM)"
              placeholderTextColor={theme.colors.textLight}
            />

            <TextInput
              style={styles.input}
              value={formData.duration}
              onChangeText={(text) => setFormData({ ...formData, duration: text })}
              placeholder="Duration (e.g., 3 hours)"
              placeholderTextColor={theme.colors.textLight}
            />

            <TextInput
              style={styles.input}
              value={formData.maxParticipants}
              onChangeText={(text) => setFormData({ ...formData, maxParticipants: text })}
              placeholder="Max Participants"
              keyboardType="number-pad"
              placeholderTextColor={theme.colors.textLight}
            />

            <TextInput
              style={styles.input}
              value={formData.instructor}
              onChangeText={(text) => setFormData({ ...formData, instructor: text })}
              placeholder="Instructor Name"
              placeholderTextColor={theme.colors.textLight}
            />

            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
              placeholder="Category (e.g., workshop, party)"
              placeholderTextColor={theme.colors.textLight}
            />

            <Button
              title={editingId ? 'Update Event' : 'Create Event'}
              onPress={handleSubmit}
            />
          </View>
        )}

        <View style={styles.eventsList}>
          {events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventActions}>
                  <TouchableOpacity onPress={() => handleEdit(event)}>
                    <Edit2 color={theme.colors.primary} size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(event.id)}>
                    <Trash2 color={theme.colors.error} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.eventDescription}>{event.description}</Text>
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
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
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
});
