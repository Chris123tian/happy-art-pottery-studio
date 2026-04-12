import React, { useState, useCallback, useEffect, memo } from 'react';
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

function OptimizedImageComponent({
  uri,
  style,
  contentFit = 'cover',
  placeholderColor = '#E8E0D8',
  aspectRatio,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [uri]);

  const handleError = useCallback(() => {
    console.log('[OptimizedImage] Image failed to load:', uri?.substring(0, 100));
    setHasError(true);
  }, [uri]);

  const containerStyle = [
    style,
    { backgroundColor: placeholderColor, overflow: 'hidden' as const },
    aspectRatio ? { aspectRatio } : undefined,
  ];

  const validUri = uri && typeof uri === 'string' && uri.trim().length > 0 ? uri.trim() : null;

  if (!validUri || hasError) {
    return (
      <View style={containerStyle}>
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
          src={validUri}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: contentFit === 'contain' ? 'contain' : 'cover',
            display: 'block',
          }}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleError}
        />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <RNImage
        source={{ uri: validUri }}
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
