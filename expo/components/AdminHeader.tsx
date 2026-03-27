import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, Home, ArrowLeft } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export const AdminHeader: React.FC = () => {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftActions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.canGoBack() && router.back()}
        >
          <ArrowLeft color={theme.colors.white} size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/admin/dashboard' as any)}
        >
          <Home color={theme.colors.white} size={20} />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Admin</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <LogOut color={theme.colors.white} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.white,
  },
  leftActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  button: {
    padding: theme.spacing.sm,
  },
});
