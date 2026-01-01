import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Edit, Trash2, X, Star, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { AdminHeader } from '@/components/AdminHeader';
import { theme } from '@/constants/theme';
import { dataService } from '@/services/dataService';
import { Instructor } from '@/types';
import { seedInstructors } from '@/services/seedData';
import { queryClient } from '@/contexts/DataContext';

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    image: '',
    experience: '',
    specialties: '',
    featured: false,
  });

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    let data = await dataService.getInstructors();
    if (data.length === 0) {
      await dataService.setInstructors(seedInstructors);
      data = seedInstructors;
    }
    setInstructors(data);
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Not Supported',
        'Image upload from device is only available on mobile devices'
      );
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const openModal = (instructor?: Instructor) => {
    if (instructor) {
      setEditingInstructor(instructor);
      setFormData({
        name: instructor.name,
        title: instructor.title,
        bio: instructor.bio,
        image: instructor.image,
        experience: instructor.experience,
        specialties: instructor.specialties.join(', '),
        featured: instructor.featured,
      });
    } else {
      setEditingInstructor(null);
      setFormData({
        name: '',
        title: '',
        bio: '',
        image: '',
        experience: '',
        specialties: '',
        featured: false,
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingInstructor(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.title) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const specialtiesArray = formData.specialties
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);

    const instructorData: Instructor = {
      id: editingInstructor?.id || Date.now().toString(),
      name: formData.name,
      title: formData.title,
      bio: formData.bio,
      image: formData.image || 'https://via.placeholder.com/400',
      experience: formData.experience,
      specialties: specialtiesArray,
      featured: formData.featured,
    };

    let updatedInstructors: Instructor[];
    if (editingInstructor) {
      updatedInstructors = instructors.map((i) =>
        i.id === editingInstructor.id ? instructorData : i
      );
    } else {
      updatedInstructors = [...instructors, instructorData];
    }

    await dataService.setInstructors(updatedInstructors);
    await queryClient.invalidateQueries({ queryKey: ['instructors'] });
    setInstructors(updatedInstructors);
    closeModal();
  };

  const handleDelete = (instructor: Instructor) => {
    Alert.alert(
      'Delete Instructor',
      `Are you sure you want to delete ${instructor.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = instructors.filter((i) => i.id !== instructor.id);
            await dataService.setInstructors(updated);
            await queryClient.invalidateQueries({ queryKey: ['instructors'] });
            setInstructors(updated);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminHeader />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Instructors</Text>
            <Text style={styles.subtitle}>{instructors.length} instructors</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
            <Plus color={theme.colors.white} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {instructors.map((instructor) => (
            <View key={instructor.id} style={styles.card}>
              <Image source={{ uri: instructor.image }} style={styles.image} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardName}>{instructor.name}</Text>
                    {instructor.featured && (
                      <Star color={theme.colors.primary} size={18} fill={theme.colors.primary} />
                    )}
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => openModal(instructor)}
                    >
                      <Edit color={theme.colors.primary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleDelete(instructor)}
                    >
                      <Trash2 color="#F44336" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.cardTitle}>{instructor.title}</Text>
                <Text style={styles.cardExperience}>{instructor.experience} experience</Text>
                <Text style={styles.cardBio} numberOfLines={2}>
                  {instructor.bio}
                </Text>
                <View style={styles.specialtiesContainer}>
                  {instructor.specialties.map((specialty, index) => (
                    <View key={index} style={styles.specialtyTag}>
                      <Text style={styles.specialtyText}>{specialty}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingInstructor ? 'Edit Instructor' : 'Add Instructor'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <X color={theme.colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter instructor name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="e.g., Master Potter"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.bio}
                  onChangeText={(text) => setFormData({ ...formData, bio: text })}
                  placeholder="Enter bio"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Instructor Photo</Text>
                {formData.image ? (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: formData.image }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.changeImageButton}
                      onPress={pickImage}
                    >
                      <Upload color={theme.colors.white} size={16} />
                      <Text style={styles.changeImageText}>Change Photo</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Upload color={theme.colors.primary} size={24} />
                    <Text style={styles.uploadButtonText}>Upload Photo</Text>
                    <Text style={styles.uploadHint}>Tap to select from device</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Experience</Text>
                <TextInput
                  style={styles.input}
                  value={formData.experience}
                  onChangeText={(text) => setFormData({ ...formData, experience: text })}
                  placeholder="e.g., 10 years"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Specialties (comma-separated)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.specialties}
                  onChangeText={(text) => setFormData({ ...formData, specialties: text })}
                  placeholder="e.g., Wheel Throwing, Hand Building"
                />
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setFormData({ ...formData, featured: !formData.featured })}
              >
                <View style={[styles.checkbox, formData.featured && styles.checkboxChecked]}>
                  {formData.featured && <Star color={theme.colors.white} size={16} fill={theme.colors.white} />}
                </View>
                <Text style={styles.checkboxLabel}>Featured Instructor</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editingInstructor ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.surface,
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
  },
  cardName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  cardTitle: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.xs,
  },
  cardExperience: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  cardBio: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    padding: theme.spacing.xs,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  specialtyTag: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  specialtyText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
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
    height: 100,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  saveButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.colors.white,
  },
  imagePreview: {
    gap: theme.spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  changeImageText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.accent,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.primary,
  },
  uploadHint: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
});
