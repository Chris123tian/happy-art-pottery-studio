import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { theme } from '@/constants/theme';
import { dataService } from '@/services/dataService';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!name || !email || !phone || !subject || !message) {
      if (Platform.OS === 'web') {
        alert('Please fill in all fields');
      } else {
        Alert.alert('Error', 'Please fill in all fields');
      }
      return;
    }

    try {
      await dataService.createMessage({
        name,
        email,
        phone,
        subject,
        message,
        read: false,
        createdAt: new Date().toISOString(),
      });

      if (Platform.OS === 'web') {
        alert('Message sent successfully! We will get back to you soon.');
      } else {
        Alert.alert('Success', 'Message sent successfully! We will get back to you soon.');
      }

      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      if (Platform.OS === 'web') {
        alert('Failed to send message. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.subtitle}>Get in touch with Happy Art</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.contactInfo}>
            <View style={styles.infoCard}>
              <Phone color={theme.colors.primary} size={24} />
              <Text style={styles.infoText}>0244311110</Text>
            </View>
            <View style={styles.infoCard}>
              <Mail color={theme.colors.primary} size={24} />
              <Text style={styles.infoText}>happyart@gmail.com</Text>
            </View>
            <View style={styles.infoCard}>
              <MapPin color={theme.colors.primary} size={24} />
              <Text style={styles.infoText}>Shiashie, Accra, Ghana</Text>
            </View>
            <View style={styles.infoCard}>
              <Clock color={theme.colors.primary} size={24} />
              <View>
                <Text style={styles.infoText}>Mon-Sat: 1:00 PM - 5:30 PM</Text>
                <Text style={styles.infoTextSmall}>(Closed Wed & Sun)</Text>
              </View>
            </View>

            <View style={styles.socialMedia}>
              <Text style={styles.socialTitle}>Follow Us</Text>
              <View style={styles.socialIcons}>
                <Facebook color={theme.colors.primary} size={28} />
                <Instagram color={theme.colors.primary} size={28} />
                <Twitter color={theme.colors.primary} size={28} />
              </View>
            </View>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Send us a message</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={theme.colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your.email@example.com"
                keyboardType="email-address"
                placeholderTextColor={theme.colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone *</Text>
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
              <Text style={styles.label}>Subject *</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="What is this about?"
                placeholderTextColor={theme.colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="Your message..."
                multiline
                numberOfLines={6}
                placeholderTextColor={theme.colors.textLight}
              />
            </View>

            <Button title="Send Message" onPress={handleSubmit} />
          </View>
        </View>
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
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  contactInfo: {
    gap: theme.spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  infoText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  infoTextSmall: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  socialMedia: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  form: {
    gap: theme.spacing.md,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
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
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
