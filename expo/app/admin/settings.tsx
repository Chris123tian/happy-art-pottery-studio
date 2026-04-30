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
} from 'react-native';
import { Image } from 'expo-image';
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

  const currentServices = [...(settings.services || [])];
  seedServices.forEach(seedService => {
    if (!currentServices.find(s => s.id === seedService.id)) {
      currentServices.push(seedService);
    }
  });

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

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#EBF5FF' }]}>
              <Globe color="#007AFF" size={22} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Studio Information</Text>
              <Text style={styles.sectionSubtitle}>General branding and contact details</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Studio Name</Text>
              <TextInput
                style={styles.input}
                value={settings.studioName}
                onChangeText={(value) => updateField('studioName', value)}
                placeholder="e.g. Happy Art Studio"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Tagline</Text>
              <TextInput
                style={styles.input}
                value={settings.tagline}
                onChangeText={(value) => updateField('tagline', value)}
                placeholder="e.g. Create with Love"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={settings.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="Enter studio description..."
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={settings.phone}
                onChangeText={(value) => updateField('phone', value)}
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>WhatsApp</Text>
              <TextInput
                style={styles.input}
                value={settings.whatsapp}
                onChangeText={(value) => updateField('whatsapp', value)}
                placeholder="WhatsApp number"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={settings.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="studio@example.com"
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
              placeholder="Street address, City"
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
              <Clock color="#16A34A" size={22} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Opening Hours</Text>
              <Text style={styles.sectionSubtitle}>When are you open for business?</Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            {Object.entries(settings.openingHours).map(([day, hours]) => (
              <View key={day} style={styles.gridItem}>
                <Text style={styles.label}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Text>
                <TextInput
                  style={styles.input}
                  value={hours}
                  onChangeText={(value) =>
                    updateOpeningHours(day as keyof SiteSettings['openingHours'], value)
                  }
                  placeholder="e.g. 9am - 5pm"
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FDF2F8' }]}>
              <Music color="#DB2777" size={22} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Social Media</Text>
              <Text style={styles.sectionSubtitle}>Link your profiles for visitors</Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <View style={styles.socialLabel}>
                <Facebook color="#1877F2" size={16} />
                <Text style={styles.label}>Facebook</Text>
              </View>
              <TextInput
                style={styles.input}
                value={settings.socialMedia.facebook}
                onChangeText={(value) => updateSocialMedia('facebook', value)}
                placeholder="Username/URL"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.gridItem}>
              <View style={styles.socialLabel}>
                <Instagram color="#E4405F" size={16} />
                <Text style={styles.label}>Instagram</Text>
              </View>
              <TextInput
                style={styles.input}
                value={settings.socialMedia.instagram}
                onChangeText={(value) => updateSocialMedia('instagram', value)}
                placeholder="Username/URL"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.gridItem}>
              <View style={styles.socialLabel}>
                <Twitter color="#1DA1F2" size={16} />
                <Text style={styles.label}>Twitter</Text>
              </View>
              <TextInput
                style={styles.input}
                value={settings.socialMedia.twitter}
                onChangeText={(value) => updateSocialMedia('twitter', value)}
                placeholder="Username/URL"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.gridItem}>
              <View style={styles.socialLabel}>
                <Music color="#000000" size={16} />
                <Text style={styles.label}>TikTok</Text>
              </View>
              <TextInput
                style={styles.input}
                value={settings.socialMedia.tiktok}
                onChangeText={(value) => updateSocialMedia('tiktok', value)}
                placeholder="Username/URL"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
              <Upload color="#EA580C" size={22} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Visual Assets</Text>
              <Text style={styles.sectionSubtitle}>Hero slideshow and about images</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hero Slideshow (Max 3)</Text>
            <View style={styles.heroGrid}>
              {[0, 1, 2].map((index) => (
                <View key={index} style={styles.heroGridItem}>
                  {settings.heroImages?.[index] ? (
                    <View style={styles.imageCard}>
                      <Image
                        source={{ uri: settings.heroImages[index] }}
                        style={styles.heroPreview}
                        contentFit="cover"
                      />
                      <View style={styles.imageOverlay}>
                        <TouchableOpacity
                          style={styles.miniButton}
                          onPress={() => pickHeroSlideImage(index)}
                        >
                          <Upload color={theme.colors.white} size={14} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.miniButton, { backgroundColor: theme.colors.error }]}
                          onPress={() => removeHeroSlideImage(index)}
                        >
                          <Trash2 color={theme.colors.white} size={14} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.placeholderBox}
                      onPress={() => pickHeroSlideImage(index)}
                    >
                      <Upload color={theme.colors.textLight} size={24} />
                      <Text style={styles.placeholderText}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>About Image</Text>
            <View style={styles.aboutImageRow}>
              {settings.aboutImage ? (
                <View style={[styles.imageCard, { flex: 1, height: 120 }]}>
                  <Image
                    source={{ uri: settings.aboutImage }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={() => pickImage('about')}
                  >
                    <Upload color={theme.colors.white} size={16} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.placeholderBox, { flex: 1, height: 120 }]}
                  onPress={() => pickImage('about')}
                >
                  <Upload color={theme.colors.textLight} size={24} />
                  <Text style={styles.placeholderText}>Upload About Image</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
              <Paintbrush color="#7C3AED" size={22} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Home Page Services</Text>
              <Text style={styles.sectionSubtitle}>Customize titles and photos for services</Text>
            </View>
          </View>

          {currentServices.map((service) => (
            <View key={service.id} style={styles.serviceItem}>
              <View style={styles.serviceMeta}>
                <View style={styles.serviceFields}>
                  <TextInput
                    style={styles.miniInput}
                    value={service.title}
                    onChangeText={(v) => updateServiceField(service.id, 'title', v)}
                    placeholder="Title"
                  />
                  <TextInput
                    style={[styles.miniInput, { marginTop: 4, height: 60 }]}
                    value={service.description}
                    onChangeText={(v) => updateServiceField(service.id, 'description', v)}
                    placeholder="Description"
                    multiline
                  />
                </View>
                <TouchableOpacity
                  style={styles.serviceImageCard}
                  onPress={() => pickServiceImage(service.id)}
                >
                  {service.image ? (
                    <Image
                      source={{ uri: service.image }}
                      style={StyleSheet.absoluteFill}
                      contentFit="contain"
                    />
                  ) : (
                    <View style={styles.centered}>
                      <Upload color={theme.colors.textLight} size={20} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
    backgroundColor: '#F8FAFC',
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
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  sectionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: 20,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  gridItem: {
    width: '47%',
    marginBottom: theme.spacing.sm,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: 6,
  },
  socialLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: '#F8FAFC',
  },
  miniInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    color: theme.colors.text,
    backgroundColor: '#F8FAFC',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  heroGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: 8,
  },
  heroGridItem: {
    flex: 1,
    aspectRatio: 1,
  },
  imageCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
    height: '100%',
  },
  heroPreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    gap: 4,
  },
  miniButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  placeholderBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  placeholderText: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 4,
    fontWeight: '600' as const,
  },
  serviceItem: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
  },
  serviceMeta: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  serviceFields: {
    flex: 1,
  },
  serviceImageCard: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: 16,
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
});
