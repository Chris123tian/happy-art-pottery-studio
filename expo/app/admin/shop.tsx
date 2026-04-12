import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Modal,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, Edit3, X, Package, Tag } from 'lucide-react-native';
import { AdminHeader } from '@/components/AdminHeader';
import { OptimizedImage } from '@/components/OptimizedImage';
import { theme } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { dataService } from '@/services/dataService';
import { imageService } from '@/services/imageService';
import { ShopItem } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const { width } = Dimensions.get('window');
const cardWidth = width > 768 ? (width - theme.spacing.lg * 4) / 3 : width - theme.spacing.lg * 2;

interface ShopFormData {
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  inStock: boolean;
  featured: boolean;
}

const emptyForm: ShopFormData = {
  name: '',
  description: '',
  price: '',
  image: '',
  category: '',
  inStock: true,
  featured: false,
};

export default function AdminShop() {
  const queryClient = useQueryClient();
  const { shopItems } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [form, setForm] = useState<ShopFormData>(emptyForm);
  const [uploading, setUploading] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(shopItems.map((item) => item.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [shopItems]);

  const stats = useMemo(() => ({
    total: shopItems.length,
    inStock: shopItems.filter((i) => i.inStock).length,
    outOfStock: shopItems.filter((i) => !i.inStock).length,
    featured: shopItems.filter((i) => i.featured).length,
  }), [shopItems]);

  const createMutation = useMutation({
    mutationFn: (item: Omit<ShopItem, 'id'>) => dataService.createShopItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      setModalVisible(false);
      setForm(emptyForm);
      setEditingItem(null);
      if (Platform.OS === 'web') {
        alert('Item added successfully!');
      } else {
        Alert.alert('Success', 'Item added successfully!');
      }
    },
    onError: (error) => {
      console.error('[AdminShop] Create error:', error);
      if (Platform.OS === 'web') {
        alert('Failed to add item. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to add item. Please try again.');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ShopItem> }) =>
      dataService.updateShopItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      setModalVisible(false);
      setForm(emptyForm);
      setEditingItem(null);
      if (Platform.OS === 'web') {
        alert('Item updated successfully!');
      } else {
        Alert.alert('Success', 'Item updated successfully!');
      }
    },
    onError: (error) => {
      console.error('[AdminShop] Update error:', error);
      if (Platform.OS === 'web') {
        alert('Failed to update item.');
      } else {
        Alert.alert('Error', 'Failed to update item.');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataService.deleteShopItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
    },
    onError: (error) => {
      console.error('[AdminShop] Delete error:', error);
      if (Platform.OS === 'web') {
        alert('Failed to delete item.');
      } else {
        Alert.alert('Error', 'Failed to delete item.');
      }
    },
  });

  const handleOpenCreate = useCallback(() => {
    setEditingItem(null);
    setForm(emptyForm);
    setModalVisible(true);
  }, []);

  const handleOpenEdit = useCallback((item: ShopItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image,
      category: item.category,
      inStock: item.inStock,
      featured: item.featured,
    });
    setModalVisible(true);
  }, []);

  const handlePickImage = useCallback(async () => {
    try {
      setUploading(true);
      const url = await imageService.pickAndUploadImage({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        storagePath: `shop/item_${Date.now()}.jpg`,
      });
      if (url) {
        setForm((prev) => ({ ...prev, image: url }));
      }
    } catch (error: any) {
      console.error('[AdminShop] Image pick error:', error);
      if (Platform.OS === 'web') {
        alert(error?.message || 'Failed to upload image.');
      } else {
        Alert.alert('Error', error?.message || 'Failed to upload image.');
      }
    } finally {
      setUploading(false);
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!form.name.trim()) {
      if (Platform.OS === 'web') alert('Please enter a name.');
      else Alert.alert('Error', 'Please enter a name.');
      return;
    }
    if (!form.price.trim() || isNaN(Number(form.price))) {
      if (Platform.OS === 'web') alert('Please enter a valid price.');
      else Alert.alert('Error', 'Please enter a valid price.');
      return;
    }
    if (!form.category.trim()) {
      if (Platform.OS === 'web') alert('Please enter a category.');
      else Alert.alert('Error', 'Please enter a category.');
      return;
    }

    const itemData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      image: form.image,
      category: form.category.trim(),
      inStock: form.inStock,
      featured: form.featured,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: itemData });
    } else {
      createMutation.mutate(itemData);
    }
  }, [form, editingItem, createMutation, updateMutation]);

  const handleDelete = useCallback((id: string) => {
    if (Platform.OS === 'web') {
      if (confirm('Delete this item?')) {
        deleteMutation.mutate(id);
      }
    } else {
      Alert.alert('Delete Item', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
      ]);
    }
  }, [deleteMutation]);

  const handleToggleStock = useCallback((item: ShopItem) => {
    updateMutation.mutate({ id: item.id, data: { inStock: !item.inStock } });
  }, [updateMutation]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="admin-shop-screen">
      <AdminHeader />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Manage Shop</Text>
            <Text style={styles.subtitle}>
              {stats.total} items · {stats.inStock} in stock
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenCreate} activeOpacity={0.8}>
            <Plus color={theme.colors.white} size={20} />
            <Text style={styles.addBtnText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: '#E8F5E9' }]}>
            <Text style={[styles.statChipNum, { color: '#2E7D32' }]}>{stats.inStock}</Text>
            <Text style={[styles.statChipLabel, { color: '#2E7D32' }]}>In Stock</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: '#FFEBEE' }]}>
            <Text style={[styles.statChipNum, { color: '#C62828' }]}>{stats.outOfStock}</Text>
            <Text style={[styles.statChipLabel, { color: '#C62828' }]}>Out of Stock</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: '#FFF3E0' }]}>
            <Text style={[styles.statChipNum, { color: '#E65100' }]}>{stats.featured}</Text>
            <Text style={[styles.statChipLabel, { color: '#E65100' }]}>Featured</Text>
          </View>
        </View>

        {shopItems.length > 0 ? (
          <View style={styles.itemsList}>
            {shopItems.map((item) => (
              <View key={item.id} style={[styles.itemCard, { width: cardWidth }]}>
                <View style={styles.itemImageWrap}>
                  {item.image ? (
                    <OptimizedImage
                      uri={item.image}
                      style={styles.itemImage}
                      contentFit="cover"
                      priority="normal"
                      targetWidth={300}
                      recyclingKey={`admin-shop-${item.id}`}
                    />
                  ) : (
                    <View style={[styles.itemImage, styles.noImage]}>
                      <Package color={theme.colors.border} size={32} />
                    </View>
                  )}
                  {!item.inStock && (
                    <View style={styles.outOfStockOverlay}>
                      <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemPrice}>GH₵{item.price.toFixed(2)}</Text>
                  </View>
                  <View style={styles.itemMeta}>
                    <View style={styles.catBadge}>
                      <Tag color={theme.colors.primary} size={12} />
                      <Text style={styles.catBadgeText}>{item.category}</Text>
                    </View>
                    {item.featured && (
                      <View style={styles.featBadge}>
                        <Text style={styles.featBadgeText}>Featured</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.itemActions}>
                    <View style={styles.stockToggle}>
                      <Text style={styles.stockLabel}>In Stock</Text>
                      <Switch
                        value={item.inStock}
                        onValueChange={() => handleToggleStock(item)}
                        trackColor={{ false: theme.colors.border, true: '#81C784' }}
                        thumbColor={item.inStock ? theme.colors.success : '#f4f3f4'}
                      />
                    </View>
                    <View style={styles.actionBtns}>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => handleOpenEdit(item)}
                        activeOpacity={0.7}
                      >
                        <Edit3 color={theme.colors.primary} size={18} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(item.id)}
                        activeOpacity={0.7}
                      >
                        <Trash2 color={theme.colors.error} size={18} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Package color={theme.colors.border} size={64} />
            <Text style={styles.emptyTitle}>No shop items yet</Text>
            <Text style={styles.emptySubtitle}>Add your first item to start selling</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={theme.colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Item Name *</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="e.g. Handmade Ceramic Vase"
                placeholderTextColor={theme.colors.border}
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={form.description}
                onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
                placeholder="Describe the item..."
                placeholderTextColor={theme.colors.border}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.fieldLabel}>Price (GH₵) *</Text>
              <TextInput
                style={styles.input}
                value={form.price}
                onChangeText={(v) => setForm((p) => ({ ...p, price: v }))}
                placeholder="0.00"
                placeholderTextColor={theme.colors.border}
                keyboardType="decimal-pad"
              />

              <Text style={styles.fieldLabel}>Category *</Text>
              {categories.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.catSuggestions}
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catSuggest,
                        form.category === cat && styles.catSuggestActive,
                      ]}
                      onPress={() => setForm((p) => ({ ...p, category: cat }))}
                    >
                      <Text
                        style={[
                          styles.catSuggestText,
                          form.category === cat && styles.catSuggestTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              <TextInput
                style={styles.input}
                value={form.category}
                onChangeText={(v) => setForm((p) => ({ ...p, category: v }))}
                placeholder="e.g. Vases, Bowls, Mugs"
                placeholderTextColor={theme.colors.border}
              />

              <Text style={styles.fieldLabel}>Image</Text>
              <TouchableOpacity
                style={styles.imagePickerBtn}
                onPress={handlePickImage}
                disabled={uploading}
                activeOpacity={0.7}
              >
                {form.image ? (
                  <OptimizedImage
                    uri={form.image}
                    style={styles.previewImage}
                    contentFit="cover"
                    priority="high"
                    targetWidth={300}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Package color={theme.colors.border} size={40} />
                    <Text style={styles.imagePlaceholderText}>
                      {uploading ? 'Uploading...' : 'Tap to upload image'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>In Stock</Text>
                <Switch
                  value={form.inStock}
                  onValueChange={(v) => setForm((p) => ({ ...p, inStock: v }))}
                  trackColor={{ false: theme.colors.border, true: '#81C784' }}
                  thumbColor={form.inStock ? theme.colors.success : '#f4f3f4'}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Featured</Text>
                <Switch
                  value={form.featured}
                  onValueChange={(v) => setForm((p) => ({ ...p, featured: v }))}
                  trackColor={{ false: theme.colors.border, true: '#FFB74D' }}
                  thumbColor={form.featured ? theme.colors.primary : '#f4f3f4'}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>
                    {isSaving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: theme.colors.secondary,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: theme.colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    paddingBottom: 0,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  statChipNum: {
    fontSize: 22,
    fontWeight: '800' as const,
  },
  statChipLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  itemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  itemCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  itemImageWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  itemInfo: {
    padding: theme.spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: theme.colors.primary,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: theme.colors.primary,
  },
  featBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  featBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#E65100',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
    paddingTop: theme.spacing.sm,
  },
  stockToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  stockLabel: {
    fontSize: 13,
    color: theme.colors.textLight,
    fontWeight: '500' as const,
  },
  actionBtns: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  editBtn: {
    padding: 8,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: theme.borderRadius.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
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
    color: theme.colors.secondary,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: 6,
    marginTop: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  catSuggestions: {
    marginBottom: theme.spacing.sm,
  },
  catSuggest: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  catSuggestActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  catSuggestText: {
    fontSize: 13,
    color: theme.colors.text,
  },
  catSuggestTextActive: {
    color: theme.colors.white,
    fontWeight: '600' as const,
  },
  imagePickerBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderStyle: 'dashed',
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: theme.colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.colors.textLight,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: theme.colors.white,
  },
});
