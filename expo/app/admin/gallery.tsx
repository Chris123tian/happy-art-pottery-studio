import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Plus, Trash2 } from 'lucide-react-native';
import { AdminHeader } from '@/components/AdminHeader';
import { theme } from '@/constants/theme';
import { dataService } from '@/services/dataService';
import { GalleryImage } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useData } from '@/contexts/DataContext';
import { imageService } from '@/services/imageService';

const { width } = Dimensions.get('window');
const imageSize = width > 768 ? 300 : Math.min((width - theme.spacing.lg * 3) / 2, 250);

export default function AdminGallery() {
  console.log('[AdminGallery] Screen rendered');
  const queryClient = useQueryClient();
  const { gallery: images } = useData();

  const createImageMutation = useMutation({
    mutationFn: (image: Omit<GalleryImage, 'id'>) => dataService.createGalleryImage(image),
    onMutate: async (newImage) => {
      await queryClient.cancelQueries({ queryKey: ['gallery'] });
      const previousGallery = queryClient.getQueryData(['gallery']);
      const tempId = `temp-${Date.now()}`;
      queryClient.setQueryData(['gallery'], (old: any) => 
        [...(old || []), { ...newImage, id: tempId }]
      );
      return { previousGallery };
    },
    onSuccess: async () => {
      console.log('Image created successfully');
      await queryClient.invalidateQueries({ queryKey: ['gallery'] });
      if (Platform.OS === 'web') {
        alert('Image added successfully!');
      } else {
        Alert.alert('Success', 'Image added successfully!');
      }
    },
    onError: (error, _, context) => {
      if (context?.previousGallery) {
        queryClient.setQueryData(['gallery'], context.previousGallery);
      }
      console.error('Error adding image:', error);
      if (Platform.OS === 'web') {
        alert('Failed to add image. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to add image. Please try again.');
      }
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id: string) => dataService.deleteGalleryImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
    onError: (error) => {
      console.error('Error deleting image:', error);
      Alert.alert('Error', 'Failed to delete image');
    },
  });

  const handleAddImage = async () => {
    if (createImageMutation.isPending) {
      console.log('Upload already in progress');
      return;
    }

    try {
      console.log('[Gallery] Starting image picker...');
      const base64Image = await imageService.pickImage({
        allowsEditing: true,
        quality: 0.3,
      });

      if (base64Image) {
        console.log('[Gallery] Image selected, creating gallery entry...');
        
        const newImage: Omit<GalleryImage, 'id'> = {
          source: base64Image,
          alt: `Gallery image ${Date.now()}`,
          category: 'pottery' as const,
          featured: false,
        };

        createImageMutation.mutate(newImage);
      } else {
        console.log('Image selection cancelled');
      }
    } catch (error: any) {
      console.error('[Gallery] Error adding image:', error);
      const message = error?.message || 'Failed to add image. Please try again.';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this image?')) {
        deleteImageMutation.mutate(id);
      }
    } else {
      Alert.alert(
        'Delete Image',
        'Are you sure you want to delete this image?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteImageMutation.mutate(id) },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="admin-gallery-screen">
      <AdminHeader />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Gallery</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddImage}>
            <Plus color={theme.colors.white} size={24} />
            <Text style={styles.addButtonText}>Add Image</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gallery}>
          {images.map((image) => (
            <View key={image.id} style={styles.imageItem}>
              {image.source ? (
                <Image
                  source={{ uri: image.source }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error('Image load error for', image.id, error.nativeEvent?.error);
                  }}
                  onLoadStart={() => console.log('Loading image:', image.id)}
                  onLoadEnd={() => console.log('Image loaded:', image.id)}
                />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                  <Text style={styles.placeholderText}>No Image</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(image.id)}
              >
                <Trash2 color={theme.colors.white} size={20} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {images.length === 0 && !createImageMutation.isPending && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No images yet. Add your first image!</Text>
          </View>
        )}


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
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  imageItem: {
    width: imageSize,
    height: imageSize,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  emptyState: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  loadingSubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  imagePlaceholder: {
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: theme.colors.textLight,
    fontSize: 12,
  },
});
