import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { theme } from '@/constants/theme';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendViaWhatsApp = () => {
    if (!name || !message) {
      if (Platform.OS === 'web') {
        alert('Please fill in at least your name and message');
      } else {
        Alert.alert('Error', 'Please fill in at least your name and message');
      }
      return;
    }

    const whatsappMessage = `Hello Happy Art!\n\nName: ${name}${email ? `\nEmail: ${email}` : ''}${phone ? `\nPhone: ${phone}` : ''}${subject ? `\nSubject: ${subject}` : ''}\n\nMessage: ${message}`;

    const formattedNumber = '233244311110';
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    Linking.openURL(whatsappUrl).catch(() => {
      console.log('[Contact] Failed to open WhatsApp');
      if (Platform.OS === 'web') {
        alert('Could not open WhatsApp. Please try email instead.');
      } else {
        Alert.alert('Error', 'Could not open WhatsApp. Please try email instead.');
      }
    });
  };

  const handleSendViaEmail = () => {
    if (!name || !message) {
      if (Platform.OS === 'web') {
        alert('Please fill in at least your name and message');
      } else {
        Alert.alert('Error', 'Please fill in at least your name and message');
      }
      return;
    }

    const emailSubject = subject || 'Message from Website';
    const emailBody = `Name: ${name}${email ? `\nEmail: ${email}` : ''}${phone ? `\nPhone: ${phone}` : ''}\n\n${message}`;

    const mailtoUrl = `mailto:happyartghana@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    Linking.openURL(mailtoUrl).catch(() => {
      console.log('[Contact] Failed to open email client');
      if (Platform.OS === 'web') {
        alert('Could not open email client. Please email happyartghana@gmail.com directly.');
      } else {
        Alert.alert('Error', 'Could not open email client. Please email happyartghana@gmail.com directly.');
      }
    });
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
              <Text style={styles.infoText}>happyartgh@gmail.com</Text>
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

            <View style={styles.sendButtons}>
              <TouchableOpacity
                style={styles.whatsappButton}
                onPress={handleSendViaWhatsApp}
              >
                <MessageCircle color={theme.colors.white} size={20} />
                <Text style={styles.sendButtonText}>Send via WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.emailButton}
                onPress={handleSendViaEmail}
              >
                <Mail color={theme.colors.white} size={20} />
                <Text style={styles.sendButtonText}>Send via Email</Text>
              </TouchableOpacity>
            </View>
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
  sendButtons: {
    gap: theme.spacing.md,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  emailButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  sendButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
