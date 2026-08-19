import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Palette, ImageOff } from 'lucide-react-native';
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
  onError?: () => void;
}

export function getProxyUrl(url: string, width?: number): string {
  if (!url) return '';
  if (!url.startsWith('http')) return url;
  if (url.includes('wsrv.nl')) return url;
  if (url.includes('cloudinary.com')) return url;
  if (url.startsWith('data:image/')) return url;

  const encodedUrl = encodeURIComponent(url);
  let proxyUrl = `https://wsrv.nl/?url=${encodedUrl}&output=webp&q=80`;
  
  if (width) {
    proxyUrl += `&w=${Math.round(width)}`;
  }
  
  return proxyUrl;
}

export function fixFirebaseStorageUrl(url: string): string {
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
  transitionDuration = 200,
  priority,
  targetWidth,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useRawUri, setUseRawUri] = useState(false);
  
  const fixedUri = fixFirebaseStorageUrl(uri || '');
  const isBase64 = fixedUri.startsWith('data:image/');
  const isCloudinary = fixedUri.includes('cloudinary.com');

  const finalUri = (targetWidth && !useRawUri && !isBase64 && !isCloudinary)
    ? getProxyUrl(fixedUri, targetWidth)
    : fixedUri;

  const handleError = useCallback(() => {
    console.warn('[OptimizedImage] Failed to load image:', finalUri);
    if (finalUri !== fixedUri && !useRawUri) {
      console.log('[OptimizedImage] Retrying with raw URI:', fixedUri);
      setUseRawUri(true);
    } else {
      setHasError(true);
      if (onError) onError();
    }
  }, [finalUri, fixedUri, useRawUri, onError]);

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
    const isFirebase = fixedUri.includes('firebasestorage');
    return (
      <View style={[...containerStyle, innerStyles.errorContainer]}>
        <ImageOff color="#C4A882" size={24} />
        {isFirebase ? (
          <Text style={innerStyles.errorText} numberOfLines={1}>
            Storage Quota Exceeded
          </Text>
        ) : (
          <Text style={innerStyles.errorText} numberOfLines={1}>
            Image Unavailable
          </Text>
        )}
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
        source={{ uri: finalUri }}
        style={{ width: '100%', height: '100%' }}
        contentFit={contentFit}
        {...(blurhash ? { placeholder: blurhash } : {})}
        cachePolicy="memory-disk"
        transition={transitionDuration}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
      />
    </View>
  );
}

const innerStyles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#F5F0EB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 8,
  },
  errorText: {
    fontSize: 10,
    color: '#8C7A6B',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export const OptimizedImage = memo(OptimizedImageComponent);

