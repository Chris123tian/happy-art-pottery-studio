import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Image, ImageContentFit } from 'expo-image';

interface OptimizedImageProps {
  uri: string | undefined;
  style: any;
  contentFit?: ImageContentFit;
  priority?: 'low' | 'normal' | 'high';
  recyclingKey?: string;
  placeholderColor?: string;
  blurhash?: string;
  aspectRatio?: number;
  targetWidth?: number;
}

const DEFAULT_BLURHASH = 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH';

function getOptimizedFirebaseUrl(uri: string, width?: number): string {
  if (!uri) return '';

  if (uri.includes('firebasestorage.googleapis.com') && width && width > 0) {
    const separator = uri.includes('?') ? '&' : '?';
    return `${uri}${separator}w=${width}&q=75`;
  }

  return uri;
}

function OptimizedImageComponent({
  uri,
  style,
  contentFit = 'cover',
  priority = 'normal',
  recyclingKey,
  placeholderColor = '#E8E0D8',
  blurhash = DEFAULT_BLURHASH,
  aspectRatio,
  targetWidth,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    console.log('[OptimizedImage] Failed to load:', uri?.substring(0, 80));
    setHasError(true);
  }, [uri]);

  if (!uri || hasError) {
    return (
      <View
        style={[
          style,
          { backgroundColor: placeholderColor },
          aspectRatio ? { aspectRatio } : undefined,
        ]}
      />
    );
  }

  const flatStyle = StyleSheet.flatten(style);
  const displayWidth = targetWidth || (typeof flatStyle?.width === 'number' ? flatStyle.width : undefined);
  const pixelRatio = Platform.OS === 'web' ? 1 : 2;
  const optimizedUri = getOptimizedFirebaseUrl(uri, displayWidth ? Math.round(displayWidth * pixelRatio) : undefined);

  return (
    <View style={[style, { backgroundColor: placeholderColor, overflow: 'hidden' as const }, aspectRatio ? { aspectRatio } : undefined]}>
      <Image
        source={{ uri: optimizedUri }}
        style={innerStyles.fill}
        contentFit={contentFit}
        cachePolicy="memory-disk"
        priority={priority}
        transition={200}
        placeholder={{ blurhash }}
        recyclingKey={recyclingKey}
        onError={handleError}
      />
    </View>
  );
}

const innerStyles = StyleSheet.create({
  fill: {
    width: '100%',
    height: '100%',
  },
});

export const OptimizedImage = memo(OptimizedImageComponent);
