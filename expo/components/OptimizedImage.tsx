import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, Platform, Image as RNImage } from 'react-native';
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
  const [expoImageFailed, setExpoImageFailed] = useState(false);
  const [webImageFailed, setWebImageFailed] = useState(false);

  const handleExpoError = useCallback(() => {
    console.log('[OptimizedImage] expo-image failed, trying web fallback:', uri?.substring(0, 80));
    setExpoImageFailed(true);
  }, [uri]);

  const handleWebError = useCallback(() => {
    console.log('[OptimizedImage] Web fallback also failed:', uri?.substring(0, 80));
    setWebImageFailed(true);
  }, [uri]);

  if (!uri || (expoImageFailed && webImageFailed)) {
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

  const containerStyle = [
    style,
    { backgroundColor: placeholderColor, overflow: 'hidden' as const },
    aspectRatio ? { aspectRatio } : undefined,
  ];

  if (Platform.OS === 'web' && expoImageFailed) {
    const flatStyle = StyleSheet.flatten(style);
    const resizeMode = contentFit === 'cover' ? 'cover' : contentFit === 'contain' ? 'contain' : 'cover';
    return (
      <View style={containerStyle}>
        <RNImage
          source={{ uri }}
          style={[innerStyles.fill, { resizeMode }] as any}
          onError={handleWebError}
        />
      </View>
    );
  }

  const isHighPriority = priority === 'high';

  return (
    <View style={containerStyle}>
      <Image
        source={{ uri }}
        style={innerStyles.fill}
        contentFit={contentFit}
        cachePolicy={Platform.OS === 'web' ? 'memory' : 'memory-disk'}
        priority={priority}
        transition={isHighPriority ? 0 : 200}
        placeholder={isHighPriority ? undefined : { blurhash }}
        recyclingKey={recyclingKey}
        onError={handleExpoError}
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
