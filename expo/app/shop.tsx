import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag, Filter, MessageCircle, Tag, Check, X } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { OptimizedImage } from '@/components/OptimizedImage';
import { theme } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { ShopItem } from '@/types';

export default function Shop() {
  const { width: screenWidth } = useWindowDimensions();
  const isLargeScreen = screenWidth > 768;
  const isMediumScreen = screenWidth > 480;
  const { shopItems, settings } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<ShopItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const availableItems = useMemo(
    () => shopItems.filter((item) => item.inStock),
    [shopItems]
  );

  const categories = useMemo(() => {
    const cats = new Set(availableItems.map((item) => item.category));
    return ['All', ...Array.from(cats).sort()];
  }, [availableItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return availableItems;
    return availableItems.filter((item) => item.category === selectedCategory);
  }, [availableItems, selectedCategory]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price, 0),
    [cart]
  );

  const addToCart = useCallback((item: ShopItem) => {
    setCart((prev) => [...prev, item]);
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const sendWhatsAppOrder = useCallback(() => {
    if (cart.length === 0) return;

    const phoneNumber = settings?.whatsapp || '0244311110';
    let formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '233' + formattedNumber.substring(1);
    }

    let message = 'Hello! I would like to order the following items from Happy Art:\n\n';
    cart.forEach((item, idx) => {
      message += `${idx + 1}. ${item.name} - GH₵${item.price.toFixed(2)}\n`;
    });
    message += `\nTotal: GH₵${cartTotal.toFixed(2)}`;
    message += '\n\nPlease let me know if these items are available. Thank you!';

    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl).catch(() => {
      console.log('[Shop] Failed to open WhatsApp');
    });
  }, [cart, cartTotal, settings?.whatsapp]);

  const itemWidth = isLargeScreen
    ? (screenWidth - theme.spacing.lg * 5) / 4
    : isMediumScreen
    ? (screenWidth - theme.spacing.lg * 3) / 2
    : screenWidth - theme.spacing.lg * 2;

  const isInCart = useCallback(
    (itemId: string) => cart.some((c) => c.id === itemId),
    [cart]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="shop-screen">
      <Header />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBanner}>
          <ShoppingBag color={theme.colors.white} size={40} />
          <Text style={styles.heroTitle}>Our Shop</Text>
          <Text style={styles.heroSubtitle}>
            Browse handmade pottery and ceramics — order via WhatsApp
          </Text>
        </View>

        {categories.length > 2 && (
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Filter color={theme.colors.textLight} size={16} />
              <Text style={styles.filterLabel}>Categories</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    selectedCategory === cat && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedCategory === cat && styles.filterChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {filteredItems.length > 0 ? (
          <View style={styles.grid}>
            {filteredItems.map((item) => {
              const inCart = isInCart(item.id);
              return (
                <View key={item.id} style={[styles.card, { width: itemWidth }]}>
                  <View style={styles.imageWrapper}>
                    <OptimizedImage
                      uri={item.image}
                      style={styles.itemImage}
                      contentFit="cover"
                      priority="normal"
                      targetWidth={isLargeScreen ? 400 : 300}
                      recyclingKey={`shop-${item.id}`}
                    />
                    {item.featured && (
                      <View style={styles.featuredBadge}>
                        <Tag color={theme.colors.white} size={12} />
                        <Text style={styles.featuredText}>Featured</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.categoryTag}>{item.category}</Text>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.cardFooter}>
                      <Text style={styles.price}>GH₵{item.price.toFixed(2)}</Text>
                      <TouchableOpacity
                        style={[styles.addButton, inCart && styles.addButtonInCart]}
                        onPress={() => {
                          if (!inCart) addToCart(item);
                        }}
                        activeOpacity={0.7}
                      >
                        {inCart ? (
                          <>
                            <Check color={theme.colors.white} size={16} />
                            <Text style={styles.addButtonText}>Added</Text>
                          </>
                        ) : (
                          <>
                            <ShoppingBag color={theme.colors.white} size={16} />
                            <Text style={styles.addButtonText}>Add</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <ShoppingBag color={theme.colors.border} size={64} />
            <Text style={styles.emptyTitle}>No items available</Text>
            <Text style={styles.emptySubtitle}>
              Check back soon for new handmade pottery and ceramics!
            </Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {cart.length > 0 && (
        <View style={styles.cartBar}>
          <TouchableOpacity
            style={styles.cartSummary}
            onPress={() => setShowCart(!showCart)}
            activeOpacity={0.8}
          >
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
            <View style={styles.cartTextWrap}>
              <Text style={styles.cartLabel}>Your Selection</Text>
              <Text style={styles.cartTotal}>GH₵{cartTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={sendWhatsAppOrder}
              activeOpacity={0.8}
            >
              <MessageCircle color={theme.colors.white} size={20} />
              <Text style={styles.whatsappButtonText}>Order via WhatsApp</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {showCart && (
            <View style={styles.cartDetails}>
              {cart.map((item, index) => (
                <View key={`${item.id}-${index}`} style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>GH₵{item.price.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeFromCart(index)}
                    style={styles.cartRemove}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X color={theme.colors.error} size={18} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <FloatingWhatsApp />
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
  heroBanner: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 40,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: theme.colors.white,
    marginTop: theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 22,
  },
  filterSection: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.colors.textLight,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  filterScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: theme.colors.text,
  },
  filterChipTextActive: {
    color: theme.colors.white,
    fontWeight: '600' as const,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  imageWrapper: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: theme.colors.white,
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: theme.colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: theme.colors.textLight,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  price: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: theme.colors.secondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonInCart: {
    backgroundColor: theme.colors.success,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: theme.colors.white,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.colors.textLight,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.lg,
    zIndex: 999,
  },
  cartSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  cartBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: theme.colors.white,
  },
  cartTextWrap: {
    flex: 1,
  },
  cartLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontWeight: '500' as const,
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: theme.colors.secondary,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.whatsapp,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  whatsappButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: theme.colors.white,
  },
  cartDetails: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    maxHeight: 200,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  cartItemInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: theme.spacing.sm,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
  },
  cartRemove: {
    padding: 4,
  },
});
