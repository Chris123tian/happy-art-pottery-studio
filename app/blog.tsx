import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExternalLink } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { theme } from '@/constants/theme';

const BLOG_URL = 'https://happyartacademy702.blogspot.com';

export default function Blog() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const openBlogExternal = () => {
    Linking.openURL(BLOG_URL);
  };

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header />
        <View style={styles.webFallback}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Happy Art Blog</Text>
            <Text style={styles.heroSubtitle}>
              Discover pottery tips, studio updates, and creative inspiration
            </Text>
          </View>
          <View style={styles.iframeContainer}>
            <iframe
              src={BLOG_URL}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title="Happy Art Blog"
            />
          </View>
          <View style={styles.footerBar}>
            <TouchableOpacity
              style={styles.openExternalButton}
              onPress={openBlogExternal}
            >
              <Text style={styles.openExternalText}>Open Blog in New Tab</Text>
              <ExternalLink color={theme.colors.white} size={18} />
            </TouchableOpacity>
          </View>
        </View>
        <FloatingWhatsApp />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <View style={styles.content}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading blog...</Text>
          </View>
        )}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Unable to load blog</Text>
            <Text style={styles.errorText}>Please visit our blog directly</Text>
            <TouchableOpacity
              style={styles.openExternalButton}
              onPress={openBlogExternal}
            >
              <Text style={styles.openExternalText}>Open Blog</Text>
              <ExternalLink color={theme.colors.white} size={18} />
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            source={{ uri: BLOG_URL }}
            style={styles.webview}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
          />
        )}
      </View>
      <View style={styles.footerBar}>
        <TouchableOpacity
          style={styles.openExternalButton}
          onPress={openBlogExternal}
        >
          <Text style={styles.openExternalText}>Open in Browser</Text>
          <ExternalLink color={theme.colors.white} size={18} />
        </TouchableOpacity>
      </View>
      <FloatingWhatsApp />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
  },
  hero: {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  heroSubtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  iframeContainer: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    zIndex: 10,
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  footerBar: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  openExternalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  openExternalText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
