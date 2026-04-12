import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, Platform, Image as RNImage } from 'react-native';
import { Palette } from 'lucide-react-native';

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
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  const fixedUri = fixFirebaseStorageUrl(uri || '');

  const handleError = useCallback(() => {
    console.log('[OptimizedImage] Image failed to load:', uri);
    setHasError(true);
  }, [uri]);

  const containerStyle = [
    style,
    { overflow: 'hidden' as const },
    aspectRatio ? { aspectRatio } : undefined,
  ];

  if (!fixedUri || hasError) {
    return (
      <View style={[...containerStyle, { backgroundColor: '#E8E0D8' }]}>
        <View style={innerStyles.placeholder}>
          <Palette color="#C4A882" size={32} />
        </View>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={containerStyle}>
        <img
          src={fixedUri}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: contentFit === 'contain' ? 'contain' : 'cover',
            display: 'block',
          }}
          loading="eager"
          referrerPolicy="no-referrer"
          onError={handleError}
        />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <RNImage
        source={{ uri: fixedUri }}
        style={innerStyles.fill}
        resizeMode={contentFit === 'contain' ? 'contain' : 'cover'}
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
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
});

export const OptimizedImage = memo(OptimizedImageComponent);
