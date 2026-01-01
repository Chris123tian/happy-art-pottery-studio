import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Linking,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Users, MapPin, X } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { theme } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { Event } from '@/types';

const { width } = Dimensions.get('window');

export default function Events() {
  const { events: rawEvents } = useData();
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    numberOfPersons: '1',
  });

  const events = useMemo(
    () => [...rawEvents].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
    [rawEvents]
  );

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const openBookingModal = useCallback((event: Event) => {
    setSelectedEvent(event);
    setBookingForm({ name: '', phone: '', numberOfPersons: '1' });
    setBookingModalVisible(true);
  }, []);

  const closeBookingModal = useCallback(() => {
    setBookingModalVisible(false);
    setSelectedEvent(null);
  }, []);

  const handleBookEvent = () => {
    if (!bookingForm.name || !bookingForm.phone || !bookingForm.numberOfPersons) {
      if (Platform.OS === 'web') {
        alert('Please fill in all fields');
      } else {
        Alert.alert('Error', 'Please fill in all fields');
      }
      return;
    }

    if (!selectedEvent) return;

    const message = `Hello! I would like to book for the event at Happy Art.

Event: ${selectedEvent.title}
Date: ${formatDate(selectedEvent.date)}
Time: ${selectedEvent.time}

Name: ${bookingForm.name}
Phone: ${bookingForm.phone}
Number of Persons: ${bookingForm.numberOfPersons}

Please confirm my booking. Thank you!`;

    let formattedNumber = '0244311110'.replace(/[^0-9]/g, '');
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '233' + formattedNumber.substring(1);
    }

    const whatsappUrl =
      Platform.OS === 'web'
        ? `https://web.whatsapp.com/send?phone=${formattedNumber}&text=${encodeURIComponent(message)}`
        : `whatsapp://send?phone=${formattedNumber}&text=${encodeURIComponent(message)}`;

    Linking.openURL(whatsappUrl).catch(() => {
      if (Platform.OS === 'web') {
        alert('Could not open WhatsApp');
      } else {
        Alert.alert('Error', 'Could not open WhatsApp');
      }
    });

    closeBookingModal();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Upcoming Events</Text>
          <Text style={styles.heroSubtitle}>
            Join us for special workshops, classes, and pottery experiences
          </Text>
        </View>

        <View style={styles.content}>
          {events.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Events Yet</Text>
              <Text style={styles.emptyText}>
                Check back soon for upcoming pottery workshops and events!
              </Text>
            </View>
          ) : (
            events.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <Image
                  source={{ uri: event.image }}
                  style={styles.eventImage}
                  resizeMode="cover"
                />
                <View style={styles.eventContent}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{event.category}</Text>
                  </View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDescription}>{event.description}</Text>

                  <View style={styles.eventDetails}>
                    <View style={styles.detailRow}>
                      <Calendar color={theme.colors.primary} size={20} />
                      <Text style={styles.detailText}>{formatDate(event.date)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Clock color={theme.colors.primary} size={20} />
                      <Text style={styles.detailText}>
                        {event.time} ({event.duration})
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Users color={theme.colors.primary} size={20} />
                      <Text style={styles.detailText}>
                        {event.currentParticipants}/{event.maxParticipants} enrolled
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MapPin color={theme.colors.primary} size={20} />
                      <Text style={styles.detailText}>
                        Instructor: {event.instructor}
                      </Text>
                    </View>
                  </View>

                  {event.currentParticipants >= event.maxParticipants ? (
                    <View style={styles.fullBadge}>
                      <Text style={styles.fullText}>Event Full</Text>
                    </View>
                  ) : (
                    <Button
                      title="Book This Event"
                      onPress={() => openBookingModal(event)}
                      style={styles.bookButton}
                    />
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <FloatingWhatsApp />

      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeBookingModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Event</Text>
              <TouchableOpacity onPress={closeBookingModal}>
                <X color={theme.colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedEvent && (
                <View style={styles.eventSummary}>
                  <Text style={styles.eventSummaryTitle}>{selectedEvent.title}</Text>
                  <Text style={styles.eventSummaryDetail}>
                    {formatDate(selectedEvent.date)} at {selectedEvent.time}
                  </Text>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={bookingForm.name}
                  onChangeText={(text) => setBookingForm({ ...bookingForm, name: text })}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.formInput}
                  value={bookingForm.phone}
                  onChangeText={(text) => setBookingForm({ ...bookingForm, phone: text })}
                  placeholder=""
                  keyboardType="phone-pad"
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Number of Persons *</Text>
                <TextInput
                  style={styles.formInput}
                  value={bookingForm.numberOfPersons}
                  onChangeText={(text) =>
                    setBookingForm({ ...bookingForm, numberOfPersons: text })
                  }
                  placeholder="1 to 100"
                  keyboardType="number-pad"
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Studio Hours</Text>
                <Text style={styles.infoText}>Monday - Saturday: 1:00 PM - 5:30 PM</Text>
                <Text style={styles.infoText}>(Closed Wednesdays & Sundays)</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeBookingModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleBookEvent}>
                <Text style={styles.submitButtonText}>Submit via WhatsApp</Text>
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
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: width > 768 ? 36 : 26,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    maxWidth: 600,
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  eventCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  eventImage: {
    width: '100%',
    height: width > 768 ? 300 : 200,
  },
  eventContent: {
    padding: theme.spacing.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.md,
  },
  categoryText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
  },
  eventDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  eventDetails: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  bookButton: {
    marginTop: theme.spacing.md,
  },
  fullBadge: {
    backgroundColor: theme.colors.textLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  fullText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  emptyState: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
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
    maxHeight: '90%',
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
  eventSummary: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  eventSummaryTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  eventSummaryDetail: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
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
  infoBox: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textLight,
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
  cancelButtonText: {
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
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.colors.white,
  },
});
