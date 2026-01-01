import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Save, Facebook, Instagram, Twitter, Music, Globe, Clock, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { AdminHeader } from '@/components/AdminHeader';
import { theme } from '@/constants/theme';
import { dataService } from '@/services/dataService';
import { SiteSettings } from '@/types';
import { seedSettings } from '@/services/seedData';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(seedSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await dataService.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dataService.updateSettings(settings);
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async (type: 'hero' | 'about') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'hero' ? [16, 9] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        const updatedSettings = {
          ...settings,
          [type === 'hero' ? 'heroImage' : 'aboutImage']: uri,
        };
        setSettings(updatedSettings);
        await dataService.updateSettings(updatedSettings);
        await queryClient.invalidateQueries({ queryKey: ['settings'] });
        Alert.alert('Success', 'Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  const updateField = (field: keyof SiteSettings, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  const updateSocialMedia = (platform: keyof SiteSettings['socialMedia'], value: string) => {
    setSettings({
      ...settings,
      socialMedia: { ...settings.socialMedia, [platform]: value },
    });
  };

  const updateOpeningHours = (
    day: keyof SiteSettings['openingHours'],
    value: string
  ) => {
    setSettings({
      ...settings,
      openingHours: { ...settings.openingHours, [day]: value },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AdminHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminHeader />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Website Settings</Text>
          <Text style={styles.subtitle}>
            Configure your studio information, hours, and social media
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe color={theme.colors.primary} size={24} />
            <Text style={styles.sectionTitle}>Studio Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Studio Name</Text>
            <TextInput
              style={styles.input}
              value={settings.studioName}
              onChangeText={(value) => updateField('studioName', value)}
              placeholder="Enter studio name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tagline</Text>
            <TextInput
              style={styles.input}
              value={settings.tagline}
              onChangeText={(value) => updateField('tagline', value)}
              placeholder="Enter tagline"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={settings.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="Enter studio description"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={settings.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>WhatsApp</Text>
            <TextInput
              style={styles.input}
              value={settings.whatsapp}
              onChangeText={(value) => updateField('whatsapp', value)}
              placeholder="Enter WhatsApp number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={settings.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={settings.address}
              onChangeText={(value) => updateField('address', value)}
              placeholder="Enter address"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock color={theme.colors.primary} size={24} />
            <Text style={styles.sectionTitle}>Opening Hours</Text>
          </View>

          {Object.entries(settings.openingHours).map(([day, hours]) => (
            <View key={day} style={styles.inputGroup}>
              <Text style={styles.label}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </Text>
              <TextInput
                style={styles.input}
                value={hours}
                onChangeText={(value) =>
                  updateOpeningHours(day as keyof SiteSettings['openingHours'], value)
                }
                placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Music color={theme.colors.primary} size={24} />
            <Text style={styles.sectionTitle}>Social Media Links</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.socialLabel}>
              <Facebook color="#1877F2" size={20} />
              <Text style={styles.label}>Facebook</Text>
            </View>
            <TextInput
              style={styles.input}
              value={settings.socialMedia.facebook}
              onChangeText={(value) => updateSocialMedia('facebook', value)}
              placeholder="https://facebook.com/yourpage"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.socialLabel}>
              <Instagram color="#E4405F" size={20} />
              <Text style={styles.label}>Instagram</Text>
            </View>
            <TextInput
              style={styles.input}
              value={settings.socialMedia.instagram}
              onChangeText={(value) => updateSocialMedia('instagram', value)}
              placeholder="https://instagram.com/yourpage"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.socialLabel}>
              <Twitter color="#1DA1F2" size={20} />
              <Text style={styles.label}>Twitter</Text>
            </View>
            <TextInput
              style={styles.input}
              value={settings.socialMedia.twitter}
              onChangeText={(value) => updateSocialMedia('twitter', value)}
              placeholder="https://twitter.com/yourpage"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.socialLabel}>
              <Music color="#000000" size={20} />
              <Text style={styles.label}>TikTok</Text>
            </View>
            <TextInput
              style={styles.input}
              value={settings.socialMedia.tiktok}
              onChangeText={(value) => updateSocialMedia('tiktok', value)}
              placeholder="https://tiktok.com/@yourpage"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Upload color={theme.colors.primary} size={24} />
            <Text style={styles.sectionTitle}>Site Images</Text>
          </View>
          <Text style={styles.helpText}>
            Upload images from your device for hero and about sections
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hero Image</Text>
            {settings.heroImage && (
              <Image
                source={{ uri: settings.heroImage }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage('hero')}
            >
              <Upload color={theme.colors.white} size={20} />
              <Text style={styles.uploadButtonText}>Upload Hero Image</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>About Image</Text>
            {settings.aboutImage && (
              <Image
                source={{ uri: settings.aboutImage }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage('about')}
            >
              <Upload color={theme.colors.white} size={20} />
              <Text style={styles.uploadButtonText}>Upload About Image</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <>
              <Save color={theme.colors.white} size={20} />
              <Text style={styles.saveButtonText}>Save All Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  section: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
  },
  helpText: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  socialLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    margin: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  uploadButton: {
    backgroundColor: theme.colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  uploadButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
