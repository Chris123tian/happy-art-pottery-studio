import React, { useState, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Save, Plus, Trash2, DollarSign, FileText } from 'lucide-react-native';
import { AdminHeader } from '@/components/AdminHeader';
import { theme } from '@/constants/theme';
import { dataService } from '@/services/dataService';
import { useData } from '@/contexts/DataContext';
import { seedPriceList } from '@/services/seedData';
import { PriceList } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function AdminPrices() {
  const queryClient = useQueryClient();
  const { settings } = useData();
  const [priceList, setPriceList] = useState<PriceList>(seedPriceList);

  useEffect(() => {
    if (settings?.priceList) {
      setPriceList(settings.priceList);
    }
  }, [settings?.priceList]);

  const saveMutation = useMutation({
    mutationFn: async (data: PriceList) => {
      if (!settings) return;
      console.log('[AdminPrices] Saving price list...');
      return await dataService.updateSettings({ ...settings, priceList: data });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
      if (Platform.OS === 'web') {
        alert('Price list saved successfully!');
      } else {
        Alert.alert('Success', 'Price list saved successfully!');
      }
    },
    onError: (error) => {
      console.error('[AdminPrices] Error saving:', error);
      if (Platform.OS === 'web') {
        alert('Failed to save price list. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to save price list. Please try again.');
      }
    },
  });

  const updateSubcategoryItem = (subIdx: number, itemIdx: number, field: string, value: string) => {
    const updated = { ...priceList };
    const subs = [...updated.potMaking.subcategories];
    const items = [...subs[subIdx].items];
    items[itemIdx] = { ...items[itemIdx], [field]: value };
    subs[subIdx] = { ...subs[subIdx], items };
    updated.potMaking = { ...updated.potMaking, subcategories: subs };
    setPriceList(updated);
  };

  const updateSubcategoryLabel = (subIdx: number, value: string) => {
    const updated = { ...priceList };
    const subs = [...updated.potMaking.subcategories];
    subs[subIdx] = { ...subs[subIdx], label: value };
    updated.potMaking = { ...updated.potMaking, subcategories: subs };
    setPriceList(updated);
  };

  const addSubcategoryItem = (subIdx: number) => {
    const updated = { ...priceList };
    const subs = [...updated.potMaking.subcategories];
    const items = [...subs[subIdx].items, { label: '', persons: '', duration: '', amount: '' }];
    subs[subIdx] = { ...subs[subIdx], items };
    updated.potMaking = { ...updated.potMaking, subcategories: subs };
    setPriceList(updated);
  };

  const removeSubcategoryItem = (subIdx: number, itemIdx: number) => {
    const updated = { ...priceList };
    const subs = [...updated.potMaking.subcategories];
    const items = subs[subIdx].items.filter((_, i) => i !== itemIdx);
    subs[subIdx] = { ...subs[subIdx], items };
    updated.potMaking = { ...updated.potMaking, subcategories: subs };
    setPriceList(updated);
  };

  const updatePaintingItem = (idx: number, field: 'label' | 'amount', value: string) => {
    const updated = { ...priceList };
    const items = [...updated.potPainting.items];
    items[idx] = { ...items[idx], [field]: value };
    updated.potPainting = { ...updated.potPainting, items };
    setPriceList(updated);
  };

  const addPaintingItem = () => {
    const updated = { ...priceList };
    updated.potPainting = {
      ...updated.potPainting,
      items: [...updated.potPainting.items, { label: '', amount: '' }],
    };
    setPriceList(updated);
  };

  const removePaintingItem = (idx: number) => {
    const updated = { ...priceList };
    updated.potPainting = {
      ...updated.potPainting,
      items: updated.potPainting.items.filter((_, i) => i !== idx),
    };
    setPriceList(updated);
  };

  const updateNote = (idx: number, value: string) => {
    const updated = { ...priceList };
    const notes = [...updated.notes];
    notes[idx] = value;
    updated.notes = notes;
    setPriceList(updated);
  };

  const addNote = () => {
    setPriceList({ ...priceList, notes: [...priceList.notes, ''] });
  };

  const removeNote = (idx: number) => {
    setPriceList({ ...priceList, notes: priceList.notes.filter((_, i) => i !== idx) });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminHeader />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Price List</Text>
          <Text style={styles.subtitle}>
            Update prices shown to customers on the booking page
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign color={theme.colors.primary} size={22} />
            <Text style={styles.sectionTitle}>Pot Making Prices</Text>
          </View>

          {priceList.potMaking.subcategories.map((sub, subIdx) => (
            <View key={subIdx} style={styles.subcategoryBlock}>
              <TextInput
                style={styles.subcategoryLabel}
                value={sub.label}
                onChangeText={(v) => updateSubcategoryLabel(subIdx, v)}
                placeholder="Category label (e.g., Weekdays)"
                placeholderTextColor={theme.colors.textLight}
              />
              {sub.items.map((item, itemIdx) => (
                <View key={itemIdx} style={styles.priceItemRow}>
                  <View style={styles.priceItemFields}>
                    <TextInput
                      style={[styles.fieldInput, { flex: 1 }]}
                      value={item.persons}
                      onChangeText={(v) => updateSubcategoryItem(subIdx, itemIdx, 'persons', v)}
                      placeholder="Persons"
                      placeholderTextColor={theme.colors.textLight}
                    />
                    <TextInput
                      style={[styles.fieldInput, { flex: 0.6 }]}
                      value={item.duration}
                      onChangeText={(v) => updateSubcategoryItem(subIdx, itemIdx, 'duration', v)}
                      placeholder="Duration"
                      placeholderTextColor={theme.colors.textLight}
                    />
                    <TextInput
                      style={[styles.fieldInput, { flex: 1 }]}
                      value={item.amount}
                      onChangeText={(v) => updateSubcategoryItem(subIdx, itemIdx, 'amount', v)}
                      placeholder="Amount"
                      placeholderTextColor={theme.colors.textLight}
                    />
                    <TouchableOpacity
                      onPress={() => removeSubcategoryItem(subIdx, itemIdx)}
                      style={styles.removeItemButton}
                    >
                      <Trash2 color={theme.colors.error} size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={() => addSubcategoryItem(subIdx)}
              >
                <Plus color={theme.colors.primary} size={16} />
                <Text style={styles.addItemText}>Add Price Row</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign color={theme.colors.primary} size={22} />
            <Text style={styles.sectionTitle}>Pot Painting Prices</Text>
          </View>

          {priceList.potPainting.items.map((item, idx) => (
            <View key={idx} style={styles.paintingItemRow}>
              <TextInput
                style={[styles.fieldInput, { flex: 2 }]}
                value={item.label}
                onChangeText={(v) => updatePaintingItem(idx, 'label', v)}
                placeholder="Description"
                placeholderTextColor={theme.colors.textLight}
              />
              <TextInput
                style={[styles.fieldInput, { flex: 1 }]}
                value={item.amount}
                onChangeText={(v) => updatePaintingItem(idx, 'amount', v)}
                placeholder="Amount"
                placeholderTextColor={theme.colors.textLight}
              />
              <TouchableOpacity
                onPress={() => removePaintingItem(idx)}
                style={styles.removeItemButton}
              >
                <Trash2 color={theme.colors.error} size={16} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addItemButton} onPress={addPaintingItem}>
            <Plus color={theme.colors.primary} size={16} />
            <Text style={styles.addItemText}>Add Painting Price</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText color={theme.colors.primary} size={22} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>

          {priceList.notes.map((note, idx) => (
            <View key={idx} style={styles.noteRow}>
              <TextInput
                style={[styles.fieldInput, { flex: 1 }]}
                value={note}
                onChangeText={(v) => updateNote(idx, v)}
                placeholder="Note text"
                placeholderTextColor={theme.colors.textLight}
              />
              <TouchableOpacity
                onPress={() => removeNote(idx)}
                style={styles.removeItemButton}
              >
                <Trash2 color={theme.colors.error} size={16} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addItemButton} onPress={addNote}>
            <Plus color={theme.colors.primary} size={16} />
            <Text style={styles.addItemText}>Add Note</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saveMutation.isPending && styles.saveButtonDisabled]}
          onPress={() => saveMutation.mutate(priceList)}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <>
              <Save color={theme.colors.white} size={20} />
              <Text style={styles.saveButtonText}>Save Price List</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  section: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
  },
  subcategoryBlock: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  subcategoryLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  priceItemRow: {
    marginBottom: theme.spacing.sm,
  },
  priceItemFields: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
  },
  removeItemButton: {
    padding: theme.spacing.sm,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  addItemText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  paintingItemRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  noteRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    margin: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
});
