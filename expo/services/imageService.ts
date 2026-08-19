import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getApp } from 'firebase/app';
import { Platform } from 'react-native';

/**
 * Resizes and compresses an image URI into a smaller JPEG Blob and Data URI.
 * Reduces 5-10MB camera pictures down to ~50-100KB.
 */
async function fallbackFetch(uri: string): Promise<{ blob: Blob; dataUrl: string }> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return { blob, dataUrl };
  } catch (e) {
    console.error('[ImageService] Fallback fetch failed:', e);
    throw e;
  }
}

/**
 * Resizes and compresses an image URI into a smaller JPEG Blob and permanent Base64 Data URI.
 * Reduces 5-10MB camera pictures down to ~50-100KB.
 */
async function compressImageUri(
  uri: string,
  maxWidth = 1000,
  quality = 0.75
): Promise<{ blob: Blob; dataUrl: string }> {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
    return new Promise((resolve) => {
      const img = new window.Image();
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
            fallbackFetch(uri).then(resolve).catch(() => resolve({ blob: new Blob([]), dataUrl: uri }));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);

          const byteString = atob(dataUrl.split(',')[1]);
          const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          resolve({ blob, dataUrl });
        } catch (err) {
          console.warn('[ImageService] Canvas compression failed, trying FileReader:', err);
          fallbackFetch(uri).then(resolve).catch(() => resolve({ blob: new Blob([]), dataUrl: uri }));
        }
      };

      img.onerror = (err) => {
        console.warn('[ImageService] Image load error in canvas compression, trying FileReader:', err);
        fallbackFetch(uri).then(resolve).catch(() => resolve({ blob: new Blob([]), dataUrl: uri }));
      };

      img.src = uri;
    });
  } else {
    return fallbackFetch(uri);
  }
}

async function uploadToCloudinary(
  blob: Blob,
  cloudName: string,
  uploadPreset: string
): Promise<string> {
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
    throw new Error(errorData?.error?.message || `Cloudinary upload failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.secure_url;
}

export const imageService = {
  async uploadImageToStorage(uri: string, path: string): Promise<string> {
    try {
      console.log('[ImageService] Compressing image before upload:', path);
      const { blob, dataUrl } = await compressImageUri(uri, 1000, 0.75);

      const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
      console.log(`[ImageService] Compressed image size: ${sizeMB}MB (${blob.size} bytes)`);

      // 1. Try Cloudinary if environment variables are configured
      const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (cloudName && uploadPreset) {
        try {
          console.log('[ImageService] Uploading image directly to Cloudinary CDN...');
          const cloudinaryUrl = await uploadToCloudinary(blob, cloudName, uploadPreset);
          console.log('[ImageService] Cloudinary upload successful:', cloudinaryUrl);
          return cloudinaryUrl;
        } catch (cloudinaryError: any) {
          console.warn('[ImageService] Cloudinary upload failed, falling back:', cloudinaryError?.message || cloudinaryError);
        }
      }

      // 2. Try Firebase Storage if Cloudinary is not active or fails
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

        // 3. Fallback to compressed Data URI in Firestore if quota exceeded or offline
        if (dataUrl && dataUrl.startsWith('data:image/')) {
          console.warn('[ImageService] Storage quota or upload issue. Falling back to compressed Data URI in Firestore.');
          return dataUrl;
        }
        throw storageError;
      }
    } catch (error: any) {
      console.error('[ImageService] Upload error:', error.message);
      throw error;
    }
  },

  async pickAndUploadImage(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    storagePath?: string;
  }): Promise<string | null> {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        throw new Error('Permission to access media library is required');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect ?? [1, 1],
        quality: options?.quality ?? 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const timestamp = Date.now();
        const fileName = `image_${timestamp}.jpg`;
        const storagePath = options?.storagePath || `gallery/${fileName}`;

        console.log('[ImageService] Image selected, compressing and uploading...');
        const downloadURL = await this.uploadImageToStorage(result.assets[0].uri, storagePath);
        console.log('[ImageService] Image ready');
        return downloadURL;
      }

      return null;
    } catch (error) {
      console.error('[ImageService] Error picking/uploading image:', error);
      throw error;
    }
  },

  async pickImage(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
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
          console.log('[ImageService] ✓ Storage object deleted successfully from Firebase Storage');
        } catch (storageError: any) {
          console.warn('[ImageService] Could not delete file from Firebase Storage:', storageError?.message || storageError);
        }
      }
    } catch (error: any) {
      console.warn('[ImageService] Error in deleteImageFromStorage:', error?.message);
    }
  },
};

