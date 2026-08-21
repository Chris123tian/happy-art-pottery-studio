import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet } from 'react-native';
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
  fallbackUri?: string;
}

const DEFAULT_POTTERY_FALLBACK = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80';

export function getProxyUrl(url: string, width?: number): string {
  if (!url) return '';
  if (!url.startsWith('http')) return url;
  if (url.includes('wsrv.nl')) return url;
  if (url.includes('cloudinary.com')) return url;
  if (url.includes('unsplash.com')) return url;
  if (url.startsWith('data:image/')) return url;
  // Firebase Storage has its own CDN — proxy is counterproductive and slow
  if (url.includes('firebasestorage.googleapis.com')) return url;
  if (url.includes('firebasestorage.app')) return url;

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
  recyclingKey,
  onLoad,
  onError,
  fallbackUri = DEFAULT_POTTERY_FALLBACK,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useRawUri, setUseRawUri] = useState(false);
  const [useFallbackImage, setUseFallbackImage] = useState(false);

  // Reset component state when uri or recyclingKey changes so updated images display immediately
  React.useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
    setUseRawUri(false);
    setUseFallbackImage(false);
  }, [uri, recyclingKey]);

  const fixedUri = fixFirebaseStorageUrl(uri || '');
  const isBase64 = fixedUri.startsWith('data:image/');
  const isCloudinary = fixedUri.includes('cloudinary.com');
  const isUnsplash = fixedUri.includes('unsplash.com');

  const activeUri = useFallbackImage ? fallbackUri : fixedUri;

  const finalUri = (targetWidth && !useRawUri && !isBase64 && !isCloudinary && !isUnsplash)
    ? getProxyUrl(activeUri, targetWidth)
    : activeUri;

  const handleError = useCallback(() => {
    console.warn('[OptimizedImage] Image load failed:', finalUri);
    if (finalUri !== activeUri && !useRawUri) {
      console.log('[OptimizedImage] Retrying with raw URI:', activeUri);
      setUseRawUri(true);
    } else if (!useFallbackImage && fallbackUri && activeUri !== fallbackUri) {
      console.log('[OptimizedImage] Falling back to default studio fallback image.');
      setUseFallbackImage(true);
      setUseRawUri(true);
    } else {
      setHasError(true);
      if (onError) onError();
    }
  }, [finalUri, activeUri, useRawUri, useFallbackImage, fallbackUri, onError]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  }, [onLoad]);

  const containerStyle = [
    style,
    { overflow: 'hidden' as const },
    aspectRatio ? { aspectRatio } : undefined,
  ];

  if ((!fixedUri && !fallbackUri) || (hasError && !fallbackUri)) {
    return (
      <View style={[...containerStyle, innerStyles.placeholderContainer]} />
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
        key={finalUri || fallbackUri}
        source={{ uri: finalUri || fallbackUri }}
        style={{ width: '100%', height: '100%' }}
        contentFit={contentFit}
        recyclingKey={recyclingKey}
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
  placeholderContainer: {
    backgroundColor: '#F5F0EB',
  },
});

export const OptimizedImage = memo(OptimizedImageComponent);

