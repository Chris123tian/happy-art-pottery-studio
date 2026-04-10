import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
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
}

const DEFAULT_BLURHASH = 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH';

function getOptimizedFirebaseUrl(uri: string, width?: number): string {
  if (!uri) return '';

  if (uri.includes('firebasestorage.googleapis.com') && width) {
    const separator = uri.includes('?') ? '&' : '?';
    return `${uri}${separator}w=${width}`;
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
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const fadeAnim = useState(() => new Animated.Value(0))[0];

  const handleLoad = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleError = useCallback(() => {
    console.log('[OptimizedImage] Failed to load:', uri?.substring(0, 80));
    setHasError(true);
    fadeAnim.setValue(1);
  }, [uri, fadeAnim]);

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
  const displayWidth = typeof flatStyle?.width === 'number' ? flatStyle.width : undefined;
  const optimizedUri = getOptimizedFirebaseUrl(uri, displayWidth ? displayWidth * 2 : undefined);

  return (
    <View style={[style, { backgroundColor: placeholderColor, overflow: 'hidden' as const }, aspectRatio ? { aspectRatio } : undefined]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        <Image
          source={{ uri: optimizedUri }}
          style={innerStyles.fill}
          contentFit={contentFit}
          cachePolicy="memory-disk"
          priority={priority}
          transition={0}
          placeholder={{ blurhash }}
          recyclingKey={recyclingKey}
          onLoad={handleLoad}
          onError={handleError}
        />
      </Animated.View>
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
