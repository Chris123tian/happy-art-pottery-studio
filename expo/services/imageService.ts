import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp } from 'firebase/app';

export const imageService = {
  async uploadImageToStorage(uri: string, path: string): Promise<string> {
    try {
      console.log('[ImageService] Uploading to Firebase Storage:', path);
      
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
      console.log(`[ImageService] Image size: ${sizeMB}MB`);
      
      if (blob.size > 10 * 1024 * 1024) {
        throw new Error('Image too large. Please use an image smaller than 10MB.');
      }
      
      const app = getApp();
      const storage = getStorage(app);
      const storageRef = ref(storage, path);
      
      console.log('[ImageService] Uploading blob...');
      await uploadBytes(storageRef, blob, {
        cacheControl: 'public, max-age=31536000',
      });
      
      console.log('[ImageService] Getting download URL...');
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log('[ImageService] Upload complete:', downloadURL);
      return downloadURL;
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
        quality: options?.quality ?? 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const timestamp = Date.now();
        const fileName = `image_${timestamp}.jpg`;
        const storagePath = options?.storagePath || `gallery/${fileName}`;
        
        console.log('[ImageService] Image selected, uploading...');
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
};
