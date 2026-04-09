import React, { useState, useEffect } from 'react';
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
import { Save, Facebook, Instagram, Twitter, Music, Globe, Clock, Upload, Paintbrush, Trash2 } from 'lucide-react-native';
import { AdminHeader } from '@/components/AdminHeader';
import { theme } from '@/constants/theme';
import { dataService } from '@/services/dataService';
import { SiteSettings, ServiceItem } from '@/types';
import { seedSettings, seedServices } from '@/services/seedData';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useData } from '@/contexts/DataContext';

export default function AdminSettings() {
  console.log('[AdminSettings] Screen rendered');
  const queryClient = useQueryClient();
  const { settings: contextSettings, isLoading } = useData();
  const [settings, setSettings] = useState<SiteSettings>(seedSettings);

  useEffect(() => {
    if (contextSettings) {
      setSettings(contextSettings);
    }
  }, [contextSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SiteSettings) => {
      console.log('[Settings] Saving settings...');
      const result = await dataService.updateSettings(data);
      console.log('[Settings] Settings saved successfully');
      return result;
    },
    onSuccess: async () => {
      console.log('[Settings] Invalidating queries...');
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
      await queryClient.refetchQueries({ queryKey: ['settings'] });
      Alert.alert('Success', 'Settings saved successfully!');
    },
    onError: (error) => {
      console.error('[Settings] Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    },
  });

  const handleSave = () => {
    const cleanSettings: SiteSettings = {
      studioName: settings.studioName || '',
      tagline: settings.tagline || '',
      phone: settings.phone || '',
      whatsapp: settings.whatsapp || '',
      email: settings.email || '',
      address: settings.address || '',
      description: settings.description || '',
      openingHours: {
        monday: settings.openingHours?.monday || '',
        tuesday: settings.openingHours?.tuesday || '',
        wednesday: settings.openingHours?.wednesday || '',
        thursday: settings.openingHours?.thursday || '',
        friday: settings.openingHours?.friday || '',
        saturday: settings.openingHours?.saturday || '',
        sunday: settings.openingHours?.sunday || '',
      },
      socialMedia: {
        facebook: settings.socialMedia?.facebook || '',
        instagram: settings.socialMedia?.instagram || '',
        twitter: settings.socialMedia?.twitter || '',
        tiktok: settings.socialMedia?.tiktok || '',
      },
      heroImage: settings.heroImage || '',
      heroImages: (settings.heroImages || []).filter((img): img is string => typeof img === 'string' && img !== ''),
      aboutImage: settings.aboutImage || '',
      priceList: settings.priceList,
      services: settings.services || currentServices,
    };
    console.log('[Settings] Clean settings to save:', JSON.stringify(cleanSettings, null, 2));
    updateSettingsMutation.mutate(cleanSettings);
  };

  const pickImage = async (type: 'hero' | 'about') => {
    try {
      console.log(`[Settings] Picking ${type} image...`);
      const { imageService } = await import('@/services/imageService');
      
      const imageUrl = await imageService.pickAndUploadImage({
        allowsEditing: true,
        aspect: type === 'hero' ? [16, 9] : [4, 3],
        quality: 0.8,
        storagePath: `settings/${type}_${Date.now()}.jpg`,
      });

      if (imageUrl) {
        console.log(`[Settings] ${type} image uploaded successfully`);
        const updatedSettings = {
          ...settings,
          [type === 'hero' ? 'heroImage' : 'aboutImage']: imageUrl,
        };
        setSettings(updatedSettings);
      }
    } catch (error: any) {
      console.error('[Settings] Error picking image:', error);
      Alert.alert('Error', error?.message || 'Failed to upload image. Please try again.');
    }
  };

  const pickHeroSlideImage = async (index: number) => {
    try {
      console.log(`[Settings] Picking hero slide image ${index}...`);
      const { imageService } = await import('@/services/imageService');
      
      const imageUrl = await imageService.pickAndUploadImage({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        storagePath: `settings/hero_slide_${index}_${Date.now()}.jpg`,
      });

      if (imageUrl) {
        console.log(`[Settings] Hero slide image ${index} uploaded successfully`);
        const updatedHeroImages = [...(settings.heroImages || [])];
        updatedHeroImages[index] = imageUrl;
        setSettings({
          ...settings,
          heroImages: updatedHeroImages,
        });
      }
    } catch (error: any) {
      console.error('[Settings] Error picking hero slide image:', error);
      Alert.alert('Error', error?.message || 'Failed to upload image. Please try again.');
    }
  };

  const removeHeroSlideImage = (index: number) => {
    const updatedHeroImages = settings.heroImages?.filter((_, i) => i !== index) || [];
    setSettings({
      ...settings,
      heroImages: updatedHeroImages,
    });
  };

  const currentServices: ServiceItem[] = settings.services && settings.services.length > 0 ? settings.services : seedServices;

  const pickServiceImage = async (serviceId: string) => {
    try {
      const { imageService } = await import('@/services/imageService');
      const imageUrl = await imageService.pickAndUploadImage({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        storagePath: `services/${serviceId}_${Date.now()}.jpg`,
      });
      if (imageUrl) {
        const updatedServices = currentServices.map((s) =>
          s.id === serviceId ? { ...s, image: imageUrl } : s
        );
        setSettings({ ...settings, services: updatedServices });
      }
    } catch (error: any) {
      console.error('[Settings] Error picking service image:', error);
      Alert.alert('Error', error?.message || 'Failed to upload image.');
    }
  };

  const updateServiceField = (serviceId: string, field: 'title' | 'description', value: string) => {
    const updatedServices = currentServices.map((s) =>
      s.id === serviceId ? { ...s, [field]: value } : s
    );
    setSettings({ ...settings, services: updatedServices });
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

  if (isLoading && !contextSettings) {
    return (
      <SafeAreaView style={styles.container} edges={['top']} testID="admin-settings-screen">
        <AdminHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="admin-settings-screen">
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
            Upload images from your device for hero slideshow and about sections
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hero Slideshow (Max 3 Images)</Text>
            <Text style={styles.helpText}>
              Add up to 3 images for the hero slideshow. Images will automatically rotate.
            </Text>
            {[0, 1, 2].map((index) => (
              <View key={index} style={styles.heroSlideItem}>
                <Text style={styles.slideLabel}>Image {index + 1}</Text>
                {settings.heroImages?.[index] ? (
                  <View style={styles.imageWithControls}>
                    <Image
                      source={{ uri: settings.heroImages[index] }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <View style={styles.imageControls}>
                      <TouchableOpacity
                        style={styles.changeButton}
                        onPress={() => pickHeroSlideImage(index)}
                      >
                        <Upload color={theme.colors.white} size={18} />
                        <Text style={styles.changeButtonText}>Change</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeHeroSlideImage(index)}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => pickHeroSlideImage(index)}
                  >
                    <Upload color={theme.colors.white} size={20} />
                    <Text style={styles.uploadButtonText}>Upload Image {index + 1}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Images</Text>
            <Text style={styles.helpText}>
              Upload custom images for each service displayed on the home page
            </Text>
            {currentServices.map((service) => (
              <View key={service.id} style={styles.serviceItem}>
                <Text style={styles.slideLabel}>{service.title}</Text>
                <TextInput
                  style={[styles.input, { marginBottom: theme.spacing.sm }]}
                  value={service.title}
                  onChangeText={(v) => updateServiceField(service.id, 'title', v)}
                  placeholder="Service title"
                />
                <TextInput
                  style={[styles.input, styles.textArea, { marginBottom: theme.spacing.sm }]}
                  value={service.description}
                  onChangeText={(v) => updateServiceField(service.id, 'description', v)}
                  placeholder="Service description"
                  multiline
                  numberOfLines={2}
                />
                {service.image ? (
                  <View style={styles.imageWithControls}>
                    <Image
                      source={{ uri: service.image }}
                      style={styles.serviceImagePreview}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.changeButton}
                      onPress={() => pickServiceImage(service.id)}
                    >
                      <Upload color={theme.colors.white} size={18} />
                      <Text style={styles.changeButtonText}>Change Image</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => pickServiceImage(service.id)}
                  >
                    <Upload color={theme.colors.white} size={20} />
                    <Text style={styles.uploadButtonText}>Upload Image</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
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
          style={[styles.saveButton, updateSettingsMutation.isPending && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending ? (
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
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textLight,
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
  heroSlideItem: {
    marginBottom: theme.spacing.lg,
  },
  slideLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  imageWithControls: {
    gap: theme.spacing.sm,
  },
  imageControls: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  changeButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  changeButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  removeButton: {
    flex: 1,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  removeButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  serviceItem: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  serviceImagePreview: {
    width: '100%',
    height: 150,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
});
