import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Edit2, Trash2 } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { AdminHeader } from '@/components/AdminHeader';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { dataService } from '@/services/dataService';
import { Class } from '@/types';
import { queryClient } from '@/contexts/DataContext';

export default function AdminClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category: '',
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const data = await dataService.getClasses();
    setClasses(data);
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      if (Platform.OS === 'web') {
        alert('Please enter a title');
      } else {
        Alert.alert('Error', 'Please enter a title');
      }
      return;
    }

    const classData: Class = {
      id: editingId || Date.now().toString(),
      ...formData,
      featured: false,
    };

    let updatedClasses: Class[];
    if (editingId) {
      updatedClasses = classes.map((c) => (c.id === editingId ? classData : c));
    } else {
      updatedClasses = [...classes, classData];
    }

    await dataService.setClasses(updatedClasses);
    await queryClient.invalidateQueries({ queryKey: ['classes'] });
    setClasses(updatedClasses);
    resetForm();
  };

  const handleEdit = (classItem: Class) => {
    setEditingId(classItem.id);
    setFormData({
      title: classItem.title,
      description: classItem.description,
      level: classItem.level,
      category: classItem.category,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const updatedClasses = classes.filter((c) => c.id !== id);
    await dataService.setClasses(updatedClasses);
    await queryClient.invalidateQueries({ queryKey: ['classes'] });
    setClasses(updatedClasses);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      level: 'beginner',
      category: '',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
            />
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
});
