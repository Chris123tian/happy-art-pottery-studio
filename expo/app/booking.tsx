import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Linking,
  Platform,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, Clock, Users, Paintbrush, Info, CreditCard } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { theme } from '@/constants/theme';

export default function Booking() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [numberOfPersons, setNumberOfPersons] = useState('1');
  const [date, setDate] = useState('');
  const [day, setDay] = useState('');
  const [classType, setClassType] = useState<'Pot Making' | 'Pot Painting'>(
    'Pot Making'
  );
  const [time, setTime] = useState('');
  const [classModalVisible, setClassModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPriceList, setShowPriceList] = useState(true);

  const timeSlots = [
    '1:00 PM',
    '1:30 PM',
    '2:00 PM',
    '2:30 PM',
    '3:00 PM',
    '3:30 PM',
  ];

  const classOptions = ['Pot Making', 'Pot Painting'];

  const handleSubmit = async () => {
    if (!name || !phone || !numberOfPersons || !date || !day || !time) {
      if (Platform.OS === 'web') {
        alert('Please fill in all fields');
      } else {
        Alert.alert('Error', 'Please fill in all fields');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const message = `Hello! I would like to book a pottery class at Happy Art.\n\nName: ${name}\nPhone: ${phone}\nNumber of Persons: ${numberOfPersons}\nDate: ${date}\nDay: ${day}\nTime: ${time}\nClass Type: ${classType}\n\nPlease confirm my booking. Thank you!`;

      let formattedNumber = '0244311110'.replace(/[^0-9]/g, '');
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '233' + formattedNumber.substring(1);
      }

      const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;

      await Linking.openURL(whatsappUrl);

      setName('');
      setPhone('');
      setNumberOfPersons('1');
      setDate('');
      setDay('');
      setTime('');
    } catch (error) {
      console.error('Error submitting booking:', error);
      if (Platform.OS === 'web') {
        alert('Failed to submit booking. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to submit booking. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Book a Class</Text>
          <Text style={styles.subtitle}>
            Fill in the form below and we&apos;ll contact you via WhatsApp
          </Text>
        </View>

        <View style={styles.priceListContainer}>
          <TouchableOpacity
            style={styles.priceListToggle}
            onPress={() => setShowPriceList(!showPriceList)}
            activeOpacity={0.7}
          >
            <View style={styles.priceListToggleLeft}>
              <CreditCard color={theme.colors.primary} size={20} />
              <Text style={styles.priceListToggleText}>View Price List</Text>
            </View>
            <ChevronDown
              color={theme.colors.primary}
              size={20}
              style={showPriceList ? { transform: [{ rotate: '180deg' }] } : undefined}
            />
          </TouchableOpacity>

          {showPriceList && (
            <View style={styles.priceListContent}>
              <View style={styles.priceCategory}>
                <View style={styles.priceCategoryHeader}>
                  <Paintbrush color={theme.colors.secondary} size={18} />
                  <Text style={styles.priceCategoryTitle}>POT MAKING</Text>
                </View>

                <Text style={styles.priceSubHeader}>Weekdays (Mon-Fri, except Wed)</Text>
                <View style={styles.priceRow}>
                  <View style={styles.priceRowLeft}>
                    <Users color={theme.colors.textLight} size={14} />
                    <Text style={styles.priceRowText}>1-7 persons</Text>
                  </View>
                  <View style={styles.priceRowRight}>
                    <Text style={styles.priceDuration}>2 hrs</Text>
                    <Text style={styles.priceAmount}>GHS 320/person</Text>
                  </View>
                </View>
                <View style={styles.priceRow}>
                  <View style={styles.priceRowLeft}>
                    <Users color={theme.colors.textLight} size={14} />
                    <Text style={styles.priceRowText}>8+ persons</Text>
                  </View>
                  <View style={styles.priceRowRight}>
                    <Text style={styles.priceDuration}>2 hrs</Text>
                    <Text style={styles.priceAmount}>GHS 290/person</Text>
                  </View>
                </View>

                <Text style={styles.priceSubHeader}>Weekends (Sat) &amp; Holidays</Text>
                <View style={styles.priceRow}>
                  <View style={styles.priceRowLeft}>
                    <Users color={theme.colors.textLight} size={14} />
                    <Text style={styles.priceRowText}>1-7 persons</Text>
                  </View>
                  <View style={styles.priceRowRight}>
                    <Text style={styles.priceDuration}>2 hrs</Text>
                    <Text style={styles.priceAmount}>GHS 370/person</Text>
                  </View>
                </View>
                <View style={styles.priceRow}>
                  <View style={styles.priceRowLeft}>
                    <Users color={theme.colors.textLight} size={14} />
                    <Text style={styles.priceRowText}>8+ persons</Text>
                  </View>
                  <View style={styles.priceRowRight}>
                    <Text style={styles.priceDuration}>2 hrs</Text>
                    <Text style={styles.priceAmount}>GHS 340/person</Text>
                  </View>
                </View>
              </View>

              <View style={styles.priceDivider} />

              <View style={styles.priceCategory}>
                <View style={styles.priceCategoryHeader}>
                  <Paintbrush color={theme.colors.secondary} size={18} />
                  <Text style={styles.priceCategoryTitle}>POT PAINTING</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceRowText}>GHS 150 and above (depends on pot size)</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceRowText}>Painting your own pots (made at Happy Art): GHS 120</Text>
                </View>
              </View>

              <View style={styles.priceDivider} />

              <View style={styles.priceNotes}>
                <View style={styles.noteRow}>
                  <Info color={theme.colors.primary} size={14} />
                  <Text style={styles.noteText}>Groups of 20+ may request a customized class</Text>
                </View>
                <View style={styles.noteRow}>
                  <Info color={theme.colors.primary} size={14} />
                  <Text style={styles.noteText}>Payment: Cash or Momo (0243418149)</Text>
                </View>
                <View style={styles.noteRow}>
                  <Info color={theme.colors.primary} size={14} />
                  <Text style={styles.noteText}>30% non-refundable deposit required with booking</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={theme.colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder=""
              keyboardType="phone-pad"
              placeholderTextColor={theme.colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Persons *</Text>
            <TextInput
              style={styles.input}
              value={numberOfPersons}
              onChangeText={setNumberOfPersons}
              placeholder="1 to 100"
              keyboardType="number-pad"
              placeholderTextColor={theme.colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="e.g., November 25, 2025"
              placeholderTextColor={theme.colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Day *</Text>
            <TextInput
              style={styles.input}
              value={day}
              onChangeText={setDay}
              placeholder="e.g., Monday"
              placeholderTextColor={theme.colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Time *</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setTimeModalVisible(true)}
            >
              <View style={styles.selectButtonInner}>
                <Clock color={time ? theme.colors.text : theme.colors.textLight} size={18} />
                <Text style={[styles.selectButtonText, !time && { color: theme.colors.textLight }]}>
                  {time || 'Select a time slot'}
                </Text>
              </View>
              <ChevronDown color={theme.colors.textLight} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Class *</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setClassModalVisible(true)}
            >
              <Text style={styles.selectButtonText}>{classType}</Text>
              <ChevronDown color={theme.colors.textLight} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Studio Hours</Text>
            <Text style={styles.infoText}>Monday - Saturday: 1:00 PM - 5:30 PM</Text>
            <Text style={styles.infoText}>(Closed Wednesdays & Sundays)</Text>
          </View>

          <Button 
            title={isSubmitting ? 'Submitting...' : 'Submit Booking via WhatsApp'} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>
      <FloatingWhatsApp />

      <Modal
        visible={timeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTimeModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
            </View>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.optionButton,
                  time === slot && styles.optionButtonSelected,
                ]}
                onPress={() => {
                  setTime(slot);
                  setTimeModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    time === slot && styles.optionTextSelected,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={classModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setClassModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setClassModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Class Type</Text>
            </View>
            {classOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  classType === option && styles.optionButtonSelected,
                ]}
                onPress={() => {
                  setClassType(option as 'Pot Making' | 'Pot Painting');
                  setClassModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    classType === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
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
  form: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  inputGroup: {
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  selectButtonText: {
    fontSize: 16,
    color: theme.colors.text,
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
    paddingBottom: 40,
  },
  modalHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.text,
    textAlign: 'center',
  },
  optionButton: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionButtonSelected: {
    backgroundColor: theme.colors.accent,
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700' as const,
  },
  infoBox: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
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
  selectButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  priceListContainer: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  priceListToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.accent,
  },
  priceListToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  priceListToggleText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.colors.primary,
  },
  priceListContent: {
    padding: theme.spacing.md,
  },
  priceCategory: {
    gap: theme.spacing.sm,
  },
  priceCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  priceCategoryTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    letterSpacing: 0.5,
  },
  priceSubHeader: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 4,
  },
  priceRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
  },
  priceRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  priceRowText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  priceDuration: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  priceAmount: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: theme.colors.primary,
  },
  priceDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  priceNotes: {
    gap: theme.spacing.sm,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  noteText: {
    fontSize: 13,
    color: theme.colors.textLight,
    flex: 1,
    lineHeight: 18,
  },
});
