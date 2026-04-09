// Admin Classes Management
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Edit2, Trash2, Upload } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { AdminHeader } from '@/components/AdminHeader';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { dataService } from '@/services/dataService';
import { imageService } from '@/services/imageService';
import { Class } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useData } from '@/contexts/DataContext';

export default function AdminClasses() {
  const queryClient = useQueryClient();
  const { classes } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category: '',
    image: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Class, 'id'>) => dataService.createClass(data),
    onMutate: async (newClass) => {
      await queryClient.cancelQueries({ queryKey: ['classes'] });
      const previousClasses = queryClient.getQueryData(['classes']);
      const tempId = `temp-${Date.now()}`;
      queryClient.setQueryData(['classes'], (old: any) => 
        [...(old || []), { ...newClass, id: tempId }]
      );
      return { previousClasses };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['classes'] });
      if (Platform.OS === 'web') {
        alert('Class created successfully!');
      } else {
        Alert.alert('Success', 'Class created successfully!');
      }
      resetForm();
    },
    onError: (error, _, context) => {
      if (context?.previousClasses) {
        queryClient.setQueryData(['classes'], context.previousClasses);
      }
      console.error('[AdminClasses] Error creating class:', error);
      if (Platform.OS === 'web') {
        alert('Failed to create class. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to create class. Please try again.');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Class> }) => 
      dataService.updateClass(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['classes'] });
      const previousClasses = queryClient.getQueryData(['classes']);
      queryClient.setQueryData(['classes'], (old: any) => 
        (old || []).map((cls: Class) => 
          cls.id === id ? { ...cls, ...data } : cls
        )
      );
      return { previousClasses };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['classes'] });
      if (Platform.OS === 'web') {
        alert('Class updated successfully!');
      } else {
        Alert.alert('Success', 'Class updated successfully!');
      }
      resetForm();
    },
    onError: (error, _, context) => {
      if (context?.previousClasses) {
        queryClient.setQueryData(['classes'], context.previousClasses);
      }
      console.error('[AdminClasses] Error updating class:', error);
      if (Platform.OS === 'web') {
        alert('Failed to update class. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to update class. Please try again.');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataService.deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error) => {
      console.error('[AdminClasses] Error deleting class:', error);
      Alert.alert('Error', 'Failed to delete class');
    },
  });

  const handleSubmit = async () => {
    if (!formData.title) {
      if (Platform.OS === 'web') {
        alert('Please enter a title');
      } else {
        Alert.alert('Error', 'Please enter a title');
      }
      return;
    }

    const classData = {
      title: formData.title,
      description: formData.description,
      level: formData.level,
      category: formData.category,
      image: formData.image || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
      featured: false,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: classData });
    } else {
      createMutation.mutate(classData);
    }
  };

  const handleImageUpload = async () => {
    try {
      setUploadingImage(true);
      const imageUrl = await imageService.pickAndUploadImage({
        storagePath: `classes/class_${Date.now()}.jpg`,
        quality: 0.8,
      });
      
      if (imageUrl) {
        setFormData({ ...formData, image: imageUrl });
        if (Platform.OS === 'web') {
          alert('Image uploaded successfully!');
        } else {
          Alert.alert('Success', 'Image uploaded successfully!');
        }
      }
    } catch (error) {
      console.error('[AdminClasses] Error uploading image:', error);
      if (Platform.OS === 'web') {
        alert('Failed to upload image. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (classItem: Class) => {
    setEditingId(classItem.id);
    setFormData({
      title: classItem.title,
      description: classItem.description,
      level: classItem.level,
      category: classItem.category,
      image: classItem.image || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this class?')) {
        deleteMutation.mutate(id);
      }
    } else {
      Alert.alert(
        'Delete Class',
        'Are you sure you want to delete this class?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
        ]
      );
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      level: 'beginner',
      category: '',
      image: '',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="admin-classes-screen">
      <AdminHeader />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Classes</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(!showForm)}
          >
            <Plus color={theme.colors.white} size={24} />
            <Text style={styles.addButtonText}>
              {showForm ? 'Cancel' : 'Add Class'}
            </Text>
          </TouchableOpacity>
        </View>

        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>
              {editingId ? 'Edit Class' : 'Add New Class'}
            </Text>

            <View style={styles.imageUploadSection}>
              {formData.image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: formData.image }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={handleImageUpload}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <ActivityIndicator size="small" color={theme.colors.white} />
                    ) : (
                      <>
                        <Upload color={theme.colors.white} size={16} />
                        <Text style={styles.changeImageText}>Change Image</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleImageUpload}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                  ) : (
                    <>
                      <Upload color={theme.colors.primary} size={32} />
                      <Text style={styles.uploadButtonText}>Upload Class Image</Text>
                      <Text style={styles.uploadButtonSubtext}>Tap to select image</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Class Title *"
              placeholderTextColor={theme.colors.textLight}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              placeholder="Description"
              multiline
              numberOfLines={4}
              placeholderTextColor={theme.colors.textLight}
            />

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.level}
                onValueChange={(value: string) =>
                  setFormData({
                    ...formData,
                    level: value as 'beginner' | 'intermediate' | 'advanced',
                  })
                }
                style={styles.picker}
              >
                <Picker.Item label="Beginner" value="beginner" />
                <Picker.Item label="Intermediate" value="intermediate" />
                <Picker.Item label="Advanced" value="advanced" />
              </Picker>
            </View>

            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
              placeholder="Category"
              placeholderTextColor={theme.colors.textLight}
            />

            <Button
              title={editingId ? 'Update Class' : 'Create Class'}
              onPress={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            />
            {(createMutation.isPending || updateMutation.isPending) && (
              <Text style={styles.loadingText}>Saving...</Text>
            )}
          </View>
        )}

        <View style={styles.classesList}>
          {classes.map((classItem) => (
            <View key={classItem.id} style={styles.classCard}>
              <View style={styles.classHeader}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>
                    {classItem.level.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.classActions}>
                  <TouchableOpacity onPress={() => handleEdit(classItem)}>
                    <Edit2 color={theme.colors.primary} size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(classItem.id)}>
                    <Trash2 color={theme.colors.error} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.classTitle}>{classItem.title}</Text>
              <Text style={styles.classDescription}>{classItem.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    color: theme.colors.white,
    fontWeight: '600' as const,
  },
  form: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
    ...theme.shadows.md,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  classesList: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  classCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  levelBadge: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  levelText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  classActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  classTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  classDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  loadingText: {
    textAlign: 'center' as const,
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  imageUploadSection: {
    marginBottom: theme.spacing.md,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed' as const,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.primary,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  imagePreviewContainer: {
    position: 'relative' as const,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
  },
  changeImageButton: {
    position: 'absolute' as const,
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  changeImageText: {
    color: theme.colors.white,
    fontWeight: '600' as const,
    fontSize: 14,
  },
});
