import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { OptimizedImage } from '@/components/OptimizedImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { theme } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { GalleryImage } from '@/types';

export default function Gallery() {
  console.log('[Gallery] Screen rendered');
  const { gallery: images } = useData();
  const { width: screenWidth } = useWindowDimensions();
  const isLargeScreen = screenWidth > 768;
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const handleImagePress = useCallback((image: GalleryImage) => {
    setSelectedImage(image);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="gallery-screen">
      <Header />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Gallery</Text>
          <Text style={styles.subtitle}>View our beautiful pottery creations</Text>
        </View>

        <View style={[styles.gallery, isLargeScreen && styles.galleryLarge]}>
          {images.map((image) => (
            <TouchableOpacity
              key={image.id}
              style={[styles.imageItem, isLargeScreen && styles.imageItemLarge]}
              onPress={() => handleImagePress(image)}
            >
              <OptimizedImage
                uri={image.source}
                style={styles.image}
                contentFit="cover"
                priority="normal"
                targetWidth={isLargeScreen ? 400 : 300}
                recyclingKey={`gallery-${image.id}`}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={selectedImage !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modal}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseModal}
          >
            <X color={theme.colors.white} size={32} />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage.source }}
              style={styles.modalImage}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={150}
              placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
            />
          )}
        </View>
      </Modal>

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
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  galleryLarge: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  imageItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  imageItemLarge: {
    width: '31%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: theme.spacing.sm,
  },
  modalImage: {
    width: '90%',
    height: '80%',
  },
});
