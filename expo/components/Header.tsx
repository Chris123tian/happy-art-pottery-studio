import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Menu, X } from 'lucide-react-native';
import { theme } from '@/constants/theme';

const HeaderComponent: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const isDesktop = screenWidth >= 768;



  const navigate = useCallback((path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  }, [router]);

  const isActive = useCallback((path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  }, [pathname]);

  const navItems = useMemo(() => [
    { label: 'Home', path: '/' },
    { label: 'Classes', path: '/classes' },
    { label: 'Shop', path: '/shop' },
    { label: 'Events', path: '/events' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Blog', path: '/blog' },
    { label: 'Booking', path: '/booking' },
    { label: 'Contact', path: '/contact' },
  ], []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('/')}>
          <View>
            <Text style={styles.logo}>Happy Art</Text>
            <Text style={styles.tagline}>Pottery Studio</Text>
          </View>
        </TouchableOpacity>

        {isDesktop ? (
          <View style={styles.navDesktop}>
            {navItems.map((item) => (
              <TouchableOpacity
                key={item.path}
                onPress={() => navigate(item.path)}
                style={[
                  styles.navItem,
                  isActive(item.path) && styles.navItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.navText,
                    isActive(item.path) && styles.navTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <X color={theme.colors.primary} size={28} />
            ) : (
              <Menu color={theme.colors.primary} size={28} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {menuOpen && !isDesktop && (
        <View style={styles.mobileMenu}>
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.path}
              onPress={() => navigate(item.path)}
              style={[
                styles.mobileMenuItem,
                isActive(item.path) && styles.mobileMenuItemActive,
              ]}
            >
              <Text
                style={[
                  styles.mobileMenuText,
                  isActive(item.path) && styles.mobileMenuTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export const Header = React.memo(HeaderComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.colors.primary,
  },
  tagline: {
    fontSize: 12,
    color: theme.colors.secondary,
    marginTop: -2,
  },
  navDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  navItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  navItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  navText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500' as const,
  },
  navTextActive: {
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },

  mobileMenu: {
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: theme.spacing.md,
  },
  mobileMenuItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  mobileMenuItemActive: {
    backgroundColor: theme.colors.accent,
  },
  mobileMenuText: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '500' as const,
  },
  mobileMenuTextActive: {
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },

});
