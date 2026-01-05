import * as ImagePicker from 'expo-image-picker';

export const imageService = {
  async compressImage(uri: string, maxSizeMB: number = 10): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const sizeMB = (reader.result.length / (1024 * 1024)).toFixed(2);
            console.log(`[ImageService] Image size: ${sizeMB}MB`);
            
            if (reader.result.length > maxSizeMB * 1024 * 1024) {
              reject(new Error(`Image too large. Please use a smaller image (max ${maxSizeMB}MB).`));
              return;
            }
            
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert image'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('[ImageService] Error processing image:', error);
      throw error;
    }
  },

  async convertImageToBase64(uri: string): Promise<string> {
    return this.compressImage(uri, 10);
  },

  async pickImage(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
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
        console.log('[ImageService] Converting image to base64...');
        const base64 = await this.convertImageToBase64(result.assets[0].uri);
        console.log('[ImageService] Image ready');
        return base64;
      }

      return null;
    } catch (error) {
      console.error('[ImageService] Error picking image:', error);
      throw error;
    }
  },
};
