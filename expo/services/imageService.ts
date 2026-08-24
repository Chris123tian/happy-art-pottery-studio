import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getApp } from 'firebase/app';
import { Platform } from 'react-native';
import { database } from './database';

const DEFAULT_MAX_SIZE_BYTES = 2.5 * 1024 * 1024; // 2.5MB target limit

/**
 * Safely converts any URI (blob:, file:, data:, http:) into a permanent Data URI string.
 */
async function readAsDataUrl(uri: string): Promise<string> {
  if (!uri) return '';
  if (uri.startsWith('data:image/')) return uri;
  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || uri);
      reader.onerror = () => resolve(uri);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('[ImageService] readAsDataUrl fetch failed, returning raw uri:', err);
    return uri;
  }
}

/**
 * Resizes and compresses an image URI into a high-quality JPEG Blob and Data URI.
 * Supports image sizes up to ~2.5MB with high resolution (up to 2560px).
 */
async function compressImageUri(
  uri: string,
  maxWidth = 2560,
  quality = 0.85,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES
): Promise<{ blob: Blob; dataUrl: string }> {
  const baseDataUrl = await readAsDataUrl(uri);

  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const compressed = await new Promise<{ blob: Blob; dataUrl: string }>((resolve, reject) => {
        const img = new window.Image();
        // Avoid setting crossOrigin for blob: or data: URIs to prevent browser security blocks
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
          img.crossOrigin = 'anonymous';
        }

        img.onload = () => {
          try {
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxWidth) {
              if (width > height) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxWidth) / height);
                height = maxWidth;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Canvas context unavailable'));
              return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            
            let currentQuality = quality;
            let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);

            let byteString = atob(dataUrl.split(',')[1]);
            let mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
            let ab = new ArrayBuffer(byteString.length);
            let ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            let blob = new Blob([ab], { type: mimeString });

            // If blob size exceeds maxSizeBytes (e.g. 2.5MB), incrementally adjust quality to fit under 2.5MB
            let attempts = 0;
            while (blob.size > maxSizeBytes && currentQuality > 0.4 && attempts < 4) {
              attempts++;
              currentQuality -= 0.1;
              dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
              byteString = atob(dataUrl.split(',')[1]);
              mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
              ab = new ArrayBuffer(byteString.length);
              ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              blob = new Blob([ab], { type: mimeString });
            }

            // Create safe inline dataUrl fallback for Firestore (< 850KB to stay safely under Firestore 1MB doc limit)
            let safeDataUrl = dataUrl;
            if (safeDataUrl.length > 850000) {
              try {
                let fbWidth = width;
                let fbHeight = height;
                const maxFbDim = 1000;
                if (fbWidth > maxFbDim || fbHeight > maxFbDim) {
                  if (fbWidth > fbHeight) {
                    fbHeight = Math.round((fbHeight * maxFbDim) / fbWidth);
                    fbWidth = maxFbDim;
                  } else {
                    fbWidth = Math.round((fbWidth * maxFbDim) / fbHeight);
                    fbHeight = maxFbDim;
                  }
                }
                const fbCanvas = document.createElement('canvas');
                fbCanvas.width = fbWidth;
                fbCanvas.height = fbHeight;
                const fbCtx = fbCanvas.getContext('2d');
                if (fbCtx) {
                  fbCtx.drawImage(img, 0, 0, fbWidth, fbHeight);
                  safeDataUrl = fbCanvas.toDataURL('image/jpeg', 0.7);
                }
              } catch (e) {
                console.warn('[ImageService] Safe Data URI resize fallback error:', e);
              }
            }

            resolve({ blob, dataUrl: safeDataUrl });
          } catch (err) {
            reject(err);
          }
        };

        img.onerror = (err) => reject(err);
        img.src = uri;
      });

      return compressed;
    } catch (err) {
      console.warn('[ImageService] Canvas compression skipped, using base data URL:', err);
    }
  }

  try {
    if (baseDataUrl.startsWith('data:image/')) {
      const byteString = atob(baseDataUrl.split(',')[1]);
      const mimeString = baseDataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      return { blob, dataUrl: baseDataUrl };
    }
    const response = await fetch(uri);
    const blob = await response.blob();
    return { blob, dataUrl: baseDataUrl };
  } catch (e) {
    return { blob: new Blob([]), dataUrl: baseDataUrl };
  }
}

async function uploadToCloudinary(
  blob: Blob,
  cloudName: string,
  uploadPreset: string
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'happy-art-pottery');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.warn('[ImageService] Cloudinary response not ok:', errorData);
      return null;
    }

    const data = await res.json();
    return data.secure_url || null;
  } catch (err) {
    console.warn('[ImageService] Cloudinary fetch error:', err);
    return null;
  }
}

export const imageService = {
  async uploadImageToStorage(
    uri: string,
    path: string,
    options?: { maxWidth?: number; quality?: number; maxSizeBytes?: number }
  ): Promise<string> {
    try {
      const maxWidth = options?.maxWidth ?? 2560;
      const quality = options?.quality ?? 0.85;
      const maxSizeBytes = options?.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;

      console.log('[ImageService] Processing image before upload:', path, { maxWidth, quality, maxSizeBytes });
      const { blob, dataUrl } = await compressImageUri(uri, maxWidth, quality, maxSizeBytes);

      const sizeMB = blob.size ? (blob.size / (1024 * 1024)).toFixed(2) : '0';
      console.log(`[ImageService] Image size for upload: ${sizeMB}MB (${blob.size} bytes)`);

      // Ensure anonymous auth is initialized for permissions
      try {
        await database.ensureAnonymousAuth();
      } catch (authErr) {
        console.warn('[ImageService] Auth check note:', authErr);
      }

      // 1. Try Cloudinary if environment variables are configured
      const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (cloudName && uploadPreset && blob.size > 0) {
        try {
          console.log('[ImageService] Uploading image directly to Cloudinary CDN...');
          const cloudinaryUrl = await uploadToCloudinary(blob, cloudName, uploadPreset);
          if (cloudinaryUrl) {
            console.log('[ImageService] Cloudinary upload successful:', cloudinaryUrl);
            return cloudinaryUrl;
          }
        } catch (cloudinaryError: any) {
          console.warn('[ImageService] Cloudinary upload error:', cloudinaryError?.message || cloudinaryError);
        }
      }

      // 2. Try Firebase Storage if Cloudinary is not active or fails
      if (blob.size > 0) {
        try {
          const app = getApp();
          const storage = getStorage(app);
          const storageRef = ref(storage, path);

          console.log('[ImageService] Uploading blob to Firebase Storage...');
          await uploadBytes(storageRef, blob, {
            cacheControl: 'public, max-age=31536000',
          });

          console.log('[ImageService] Getting download URL...');
          const downloadURL = await getDownloadURL(storageRef);
          console.log('[ImageService] Upload complete:', downloadURL);
          return downloadURL;
        } catch (storageError: any) {
          console.warn('[ImageService] Firebase Storage upload error:', storageError?.message || storageError);
        }
      }

      // 3. Fallback to Data URI so saving NEVER fails
      if (dataUrl && (dataUrl.startsWith('data:image/') || dataUrl.startsWith('http'))) {
        console.log('[ImageService] Using direct Data URI fallback to guarantee save success.');
        return dataUrl;
      }

      return uri;
    } catch (error: any) {
      console.warn('[ImageService] Upload process fallback to raw uri:', error?.message);
      return uri;
    }
  },

  async pickAndUploadImage(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    storagePath?: string;
    maxWidth?: number;
    maxSizeBytes?: number;
  }): Promise<string | null> {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        throw new Error('Permission to access media library is required. Please enable permissions.');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect ?? [1, 1],
        quality: options?.quality ?? 0.9,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];

        // Check if selected raw file is excessively large (e.g. > 25MB) before processing
        if (selectedAsset.fileSize && selectedAsset.fileSize > 25 * 1024 * 1024) {
          throw new Error('The selected image is larger than 25MB. Please select an image under 25MB.');
        }

        const timestamp = Date.now();
        const fileName = `image_${timestamp}.jpg`;
        const storagePath = options?.storagePath || `gallery/${fileName}`;

        console.log('[ImageService] Image selected, processing high-quality image up to ~2.5MB...');
        const finalURL = await this.uploadImageToStorage(selectedAsset.uri, storagePath, {
          maxWidth: options?.maxWidth,
          quality: options?.quality,
          maxSizeBytes: options?.maxSizeBytes,
        });
        console.log('[ImageService] Image ready:', finalURL);
        return finalURL;
      }

      return null;
    } catch (error: any) {
      console.error('[ImageService] Error picking/uploading image:', error);
      throw error;
    }
  },

  async pickImage(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    storagePath?: string;
    maxWidth?: number;
    maxSizeBytes?: number;
  }): Promise<string | null> {
    return this.pickAndUploadImage(options);
  },

  async deleteImageFromStorage(imageUrl: string): Promise<void> {
    try {
      if (!imageUrl || typeof imageUrl !== 'string') return;

      if (imageUrl.includes('firebasestorage.googleapis.com') || imageUrl.includes('firebasestorage.app')) {
        try {
          console.log('[ImageService] Deleting storage object from Firebase Storage:', imageUrl);
          const app = getApp();
          const storage = getStorage(app);
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
          console.log('[ImageService] ✓ Storage object deleted successfully');
        } catch (storageError: any) {
          console.warn('[ImageService] Could not delete file from Firebase Storage:', storageError?.message || storageError);
        }
      }
    } catch (error: any) {
      console.warn('[ImageService] Error in deleteImageFromStorage:', error?.message);
    }
  },
};

