import React, { useState, useMemo, useCallback } from 'react';
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
import { ChevronDown, ChevronLeft, ChevronRight, Clock, Users, Paintbrush, Info, CreditCard, Calendar } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { theme } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { seedPriceList } from '@/services/seedData';
import { PriceList } from '@/types';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Booking() {
  console.log('[Booking] Screen rendered');
  const { settings } = useData();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [numberOfPersons, setNumberOfPersons] = useState('1');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [classType, setClassType] = useState<'Pot Making' | 'Pot Painting'>('Pot Making');
  const [time, setTime] = useState('');
  const [classModalVisible, setClassModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPriceList, setShowPriceList] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const priceList: PriceList = useMemo(
    () => settings?.priceList || seedPriceList,
    [settings?.priceList]
  );

  const timeSlots = [
    '1:00 PM',
    '1:30 PM',
    '2:00 PM',
    '2:30 PM',
    '3:00 PM',
    '3:30 PM',
  ];

  const classOptions = ['Pot Making', 'Pot Painting'];

  const formattedDate = useMemo(() => {
    if (!selectedDate) return '';
    return `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
  }, [selectedDate]);

  const formattedDay = useMemo(() => {
    if (!selectedDate) return '';
    return FULL_DAYS[selectedDate.getDay()];
  }, [selectedDate]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [calendarMonth, calendarYear]);

  const isDateDisabled = useCallback((day: number) => {
    const date = new Date(calendarYear, calendarMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 3) return true;
    return false;
  }, [calendarMonth, calendarYear]);

  const handleDateSelect = useCallback((day: number) => {
    if (isDateDisabled(day)) return;
    const date = new Date(calendarYear, calendarMonth, day);
    setSelectedDate(date);
    setDatePickerVisible(false);
  }, [calendarYear, calendarMonth, isDateDisabled]);

  const goToPrevMonth = useCallback(() => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  }, [calendarMonth]);

  const goToNextMonth = useCallback(() => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  }, [calendarMonth]);

  const handleSubmit = async () => {
    if (!name || !phone || !numberOfPersons || !selectedDate || !time) {
      if (Platform.OS === 'web') {
        alert('Please fill in all fields');
      } else {
        Alert.alert('Error', 'Please fill in all fields');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const message = `Hello! I would like to book a pottery class at Happy Art.\n\nName: ${name}\nPhone: ${phone}\nNumber of Persons: ${numberOfPersons}\nDate: ${formattedDate}\nDay: ${formattedDay}\nTime: ${time}\nClass Type: ${classType}\n\nPlease confirm my booking. Thank you!`;

      const formattedNumber = '233244311110';

      const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;

      await Linking.openURL(whatsappUrl);

      setName('');
      setPhone('');
      setNumberOfPersons('1');
      setSelectedDate(null);
      setTime('');
    } catch (error) {
      console.error('[Booking] Error submitting booking:', error);
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
    <SafeAreaView style={styles.container} edges={['top']} testID="booking-screen">
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
                  <Text style={styles.priceCategoryTitle}>{priceList.potMaking.title}</Text>
                </View>

                {priceList.potMaking.subcategories.map((sub, subIdx) => (
                  <View key={subIdx}>
                    <Text style={styles.priceSubHeader}>{sub.label}</Text>
                    {sub.items.map((item, itemIdx) => (
                      <View key={itemIdx} style={styles.priceRow}>
                        <View style={styles.priceRowLeft}>
                          <Users color={theme.colors.textLight} size={14} />
                          <Text style={styles.priceRowText}>{item.persons}</Text>
                        </View>
                        <View style={styles.priceRowRight}>
                          <Text style={styles.priceDuration}>{item.duration}</Text>
                          <Text style={styles.priceAmount}>{item.amount}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>

              <View style={styles.priceDivider} />

              <View style={styles.priceCategory}>
                <View style={styles.priceCategoryHeader}>
                  <Paintbrush color={theme.colors.secondary} size={18} />
                  <Text style={styles.priceCategoryTitle}>{priceList.potPainting.title}</Text>
                </View>
                {priceList.potPainting.items.map((item, idx) => (
                  <View key={idx} style={styles.priceRow}>
                    <Text style={styles.priceRowText}>{item.label}: {item.amount}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.priceDivider} />

              <View style={styles.priceNotes}>
                {priceList.notes.map((note, idx) => (
                  <View key={idx} style={styles.noteRow}>
                    <Info color={theme.colors.primary} size={14} />
                    <Text style={styles.noteText}>{note}</Text>
                  </View>
                ))}
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
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setDatePickerVisible(true)}
            >
              <View style={styles.selectButtonInner}>
                <Calendar color={selectedDate ? theme.colors.text : theme.colors.textLight} size={18} />
                <Text style={[styles.selectButtonText, !selectedDate && { color: theme.colors.textLight }]}>
                  {selectedDate ? `${formattedDate} (${formattedDay})` : 'Select a date'}
                </Text>
              </View>
              <ChevronDown color={theme.colors.textLight} size={20} />
            </TouchableOpacity>
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
        visible={datePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDatePickerVisible(false)}
        >
          <View style={styles.calendarModal} onStartShouldSetResponder={() => true}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={goToPrevMonth} style={styles.calendarNavButton}>
                <ChevronLeft color={theme.colors.text} size={24} />
              </TouchableOpacity>
              <Text style={styles.calendarMonthTitle}>
                {MONTHS[calendarMonth]} {calendarYear}
              </Text>
              <TouchableOpacity onPress={goToNextMonth} style={styles.calendarNavButton}>
                <ChevronRight color={theme.colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekHeader}>
              {DAYS_OF_WEEK.map((day) => (
                <Text key={day} style={styles.calendarWeekDay}>{day}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <View key={`empty-${index}`} style={styles.calendarDayEmpty} />;
                }
                const disabled = isDateDisabled(day);
                const isSelected = selectedDate &&
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === calendarMonth &&
                  selectedDate.getFullYear() === calendarYear;
                const today = new Date();
                const isToday = today.getDate() === day &&
                  today.getMonth() === calendarMonth &&
                  today.getFullYear() === calendarYear;

                return (
                  <TouchableOpacity
                    key={`day-${day}`}
                    style={[
                      styles.calendarDay,
                      disabled && styles.calendarDayDisabled,
                      isSelected && styles.calendarDaySelected,
                      isToday && !isSelected && styles.calendarDayToday,
                    ]}
                    onPress={() => handleDateSelect(day)}
                    disabled={disabled}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        disabled && styles.calendarDayTextDisabled,
                        isSelected && styles.calendarDayTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.border }]} />
                <Text style={styles.legendText}>Closed (Wed & Sun)</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

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
  selectButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: 40,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  calendarModal: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    width: '90%',
    maxWidth: 380,
    ...theme.shadows.lg,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  calendarNavButton: {
    padding: theme.spacing.sm,
  },
  calendarMonthTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
  },
  calendarWeekHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  calendarWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.colors.textLight,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayEmpty: {
    width: '14.28%',
    height: 40,
  },
  calendarDay: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDaySelected: {
    backgroundColor: theme.colors.primary,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  calendarDayText: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '500' as const,
  },
  calendarDayTextDisabled: {
    color: theme.colors.textLight,
  },
  calendarDayTextSelected: {
    color: theme.colors.white,
    fontWeight: '700' as const,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
});
