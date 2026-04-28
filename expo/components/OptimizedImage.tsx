import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Palette } from 'lucide-react-native';
import { Skeleton } from './Skeleton';
import { Image } from 'expo-image';

interface OptimizedImageProps {
  uri: string | undefined;
  style: any;
  contentFit?: 'cover' | 'contain';
  priority?: 'low' | 'normal' | 'high';
  recyclingKey?: string;
  placeholderColor?: string;
  blurhash?: string;
  aspectRatio?: number;
  targetWidth?: number;
  showSkeleton?: boolean;
  transitionDuration?: number;
  onLoad?: () => void;
}

function fixFirebaseStorageUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.includes('firebasestorage.googleapis.com') || trimmed.includes('firebasestorage.app')) {
    if (!trimmed.includes('alt=media')) {
      const separator = trimmed.includes('?') ? '&' : '?';
      return `${trimmed}${separator}alt=media`;
    }
  }
  return trimmed;
}

function OptimizedImageComponent({
  uri,
  style,
  contentFit = 'cover',
  aspectRatio,
  blurhash,
  showSkeleton = true,
  transitionDuration,
  priority,
  onLoad,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const fixedUri = fixFirebaseStorageUrl(uri || '');

  const handleError = useCallback(() => {
    console.log('[OptimizedImage] Image failed to load:', uri);
    setHasError(true);
  }, [uri]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  }, [onLoad]);

  const containerStyle = [
    style,
    { overflow: 'hidden' as const },
    aspectRatio ? { aspectRatio } : undefined,
  ];

  if (!fixedUri || hasError) {
    return (
      <View style={[...containerStyle, { backgroundColor: 'transparent' }]}>
        <View style={innerStyles.placeholder}>
          <Palette color="#C4A882" size={32} />
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {!isLoaded && showSkeleton && (
        <Skeleton 
          width="100%" 
          height="100%" 
          style={StyleSheet.absoluteFillObject} 
        />
      )}
      <Image
        source={{ uri: fixedUri }}
        style={{ width: '100%', height: '100%' }}
        contentFit={contentFit}
        {...(blurhash ? { placeholder: blurhash } : {})}
        cachePolicy="memory-disk"
        transition={transitionDuration !== undefined ? transitionDuration : 0}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
      />
    </View>
  );
}

const innerStyles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
});

export const OptimizedImage = memo(OptimizedImageComponent);
