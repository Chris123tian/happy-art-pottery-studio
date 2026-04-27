import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { OptimizedImage } from '@/components/OptimizedImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { theme } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { GalleryImage } from '@/types';

export default function Gallery() {
  const { gallery: images } = useData();
  const { width: screenWidth } = useWindowDimensions();
  const isLargeScreen = screenWidth > 768;
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const numColumns = isLargeScreen ? 3 : 2;
  const itemSize = (screenWidth - (numColumns + 1) * 8) / numColumns;

  const handleImagePress = useCallback((image: GalleryImage) => {
    setSelectedImage(image);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const renderItem = useCallback(({ item }: { item: GalleryImage }) => (
    <TouchableOpacity
      style={[styles.imageItem, { width: itemSize, height: itemSize }]}
      onPress={() => handleImagePress(item)}
      activeOpacity={0.9}
    >
      <OptimizedImage
        uri={item.source}
        style={styles.image}
        contentFit="cover"
        priority="normal"
        recyclingKey={`gallery-${item.id}`}
        showSkeleton={true}
      />
    </TouchableOpacity>
  ), [itemSize, handleImagePress]);

  const HeaderComponent = useMemo(() => (
    <View style={styles.header}>
      <Text style={styles.title}>Gallery</Text>
      <Text style={styles.subtitle}>View our beautiful pottery creations</Text>
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="gallery-screen">
      <Header />
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={`cols-${numColumns}`}
        ListHeaderComponent={HeaderComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={11}
        removeClippedSubviews={Platform.OS !== 'web'}
        getItemLayout={(_, index) => ({
          length: itemSize + 8,
          offset: (itemSize + 8) * Math.floor(index / numColumns),
          index,
        })}
      />

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
            <OptimizedImage
              uri={selectedImage.source}
              style={styles.modalImage}
              contentFit="contain"
              priority="high"
              showSkeleton={false}
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
  listContent: {
    padding: 4,
  },
  imageItem: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    margin: 4,
    backgroundColor: '#F5E9DA',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 24,
  },
  modalImage: {
    width: '90%',
    height: '80%',
  },
});
