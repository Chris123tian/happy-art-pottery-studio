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
import { ChevronDown } from 'lucide-react-native';
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
  const [classType, setClassType] = useState<'Wheel Throwing' | 'Pot Painting'>(
    'Wheel Throwing'
  );
  const [classModalVisible, setClassModalVisible] = useState(false);

  const classOptions = ['Wheel Throwing', 'Pot Painting'];

  const handleSubmit = () => {
    if (!name || !phone || !numberOfPersons || !date || !day) {
      if (Platform.OS === 'web') {
        alert('Please fill in all fields');
      } else {
        Alert.alert('Error', 'Please fill in all fields');
      }
      return;
    }

    const message = `Hello! I would like to book a pottery class at Happy Art.

Name: ${name}
Phone: ${phone}
Number of Persons: ${numberOfPersons}
Date: ${date}
Day: ${day}
Class Type: ${classType}

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

          <Button title="Submit Booking via WhatsApp" onPress={handleSubmit} />
        </View>
      </ScrollView>
      <FloatingWhatsApp />

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
                  setClassType(option as 'Wheel Throwing' | 'Pot Painting');
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  form: {
    padding: theme.spacing.lg,
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
});
