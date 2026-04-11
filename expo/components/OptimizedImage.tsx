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
  const [nativeFailed, setNativeFailed] = useState(false);

  const handleNativeError = useCallback(() => {
    console.log('[OptimizedImage] Native image failed:', uri?.substring(0, 80));
    setNativeFailed(true);
  }, [uri]);

  if (!uri) {
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

  if (Platform.OS === 'web') {
    const flatStyle = StyleSheet.flatten([style, aspectRatio ? { aspectRatio } : undefined]);
    const imgStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: contentFit === 'contain' ? 'contain' : 'cover',
      display: 'block',
    };

    return (
      <View style={containerStyle}>
        <img
          src={uri}
          style={imgStyle}
          loading={priority === 'high' ? 'eager' : 'lazy'}
          decoding="async"
          onError={(e) => {
            console.log('[OptimizedImage] Web img failed:', uri?.substring(0, 80));
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </View>
    );
  }

  if (nativeFailed) {
    return (
      <View style={containerStyle}>
        <RNImage
          source={{ uri }}
          style={innerStyles.fill}
          resizeMode={contentFit === 'contain' ? 'contain' : 'cover'}
          onError={() => {
            console.log('[OptimizedImage] RNImage fallback also failed:', uri?.substring(0, 80));
          }}
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
        cachePolicy="memory-disk"
        priority={priority}
        transition={isHighPriority ? 0 : 200}
        placeholder={isHighPriority ? undefined : { blurhash }}
        recyclingKey={recyclingKey}
        onError={handleNativeError}
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
