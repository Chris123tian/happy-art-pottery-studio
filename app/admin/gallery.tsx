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
import * as ImagePicker from 'expo-image-picker';
import { Plus, Trash2 } from 'lucide-react-native';
import { AdminHeader } from '@/components/AdminHeader';
import { theme } from '@/constants/theme';
import { dataService } from '@/services/dataService';
import { GalleryImage } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useData } from '@/contexts/DataContext';

const { width } = Dimensions.get('window');
const imageSize = width > 768 ? 200 : (width - theme.spacing.lg * 3) / 2;

export default function AdminGallery() {
  const queryClient = useQueryClient();
  const { gallery: images } = useData();

  const createImageMutation = useMutation({
    mutationFn: (image: Omit<GalleryImage, 'id'>) => dataService.createGalleryImage(image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      if (Platform.OS === 'web') {
        alert('Image added successfully!');
      } else {
        Alert.alert('Success', 'Image added successfully!');
      }
    },
    onError: (error) => {
      console.error('Error adding image:', error);
      Alert.alert('Error', 'Failed to add image');
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
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImage = {
          source: result.assets[0].uri,
          alt: 'Gallery image',
          category: 'pottery' as const,
          featured: false,
        };

        createImageMutation.mutate(newImage);
      }
    } catch (error) {
      console.error('Error adding image:', error);
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
    <SafeAreaView style={styles.container} edges={['top']}>
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
              <Image
                source={{ uri: image.source }}
                style={styles.image}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(image.id)}
              >
                <Trash2 color={theme.colors.white} size={20} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {images.length === 0 && (
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
});
