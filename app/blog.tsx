import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, ExternalLink } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { theme } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface BlogPost {
  id: string;
  title: string;
  published: string;
  content: string;
  url: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const blogId = '3200822550075316870';
      const apiKey = 'AIzaSyBk7_VGQCwnvOvD0_EXAMPLE';
      const url = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?key=${apiKey}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      const data = await response.json();
      
      const formattedPosts: BlogPost[] = data.items?.map((item: any) => ({
        id: item.id,
        title: item.title,
        published: item.published,
        content: item.content,
        url: item.url,
      })) || [];

      setPosts(formattedPosts);
    } catch (err) {
      console.error('Error fetching blog:', err);
      setError('Unable to load blog posts. Please visit our blog directly.');
      setPosts([
        {
          id: '1',
          title: 'Welcome to Happy Art Blog',
          published: new Date().toISOString(),
          content: 'Stay tuned for updates, pottery tips, and studio news!',
          url: 'https://www.blogger.com/blog/posts/3200822550075316870',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const stripHTML = (html: string) => {
    return html.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
  };

  const openPost = (url: string) => {
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading blog posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Happy Art Blog</Text>
          <Text style={styles.heroSubtitle}>
            Discover pottery tips, studio updates, and creative inspiration
          </Text>
        </View>

        <View style={styles.content}>
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.visitBlogButton}
                onPress={() =>
                  Linking.openURL('https://www.blogger.com/blog/posts/3200822550075316870')
                }
              >
                <Text style={styles.visitBlogText}>Visit Blog</Text>
                <ExternalLink color={theme.colors.white} size={16} />
              </TouchableOpacity>
            </View>
          )}

          {posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.postCard}
              onPress={() => openPost(post.url)}
            >
              <View style={styles.postHeader}>
                <View style={styles.dateRow}>
                  <Calendar color={theme.colors.primary} size={18} />
                  <Text style={styles.dateText}>{formatDate(post.published)}</Text>
                </View>
              </View>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postExcerpt}>{stripHTML(post.content)}</Text>
              <View style={styles.readMoreRow}>
                <Text style={styles.readMoreText}>Read More</Text>
                <ExternalLink color={theme.colors.primary} size={18} />
              </View>
            </TouchableOpacity>
          ))}

          {posts.length === 0 && !error && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Blog Posts Yet</Text>
              <Text style={styles.emptyText}>Check back soon for pottery tips and updates!</Text>
            </View>
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() =>
                Linking.openURL('https://www.blogger.com/blog/posts/3200822550075316870')
              }
            >
              <Text style={styles.viewAllText}>View All Posts on Blogger</Text>
              <ExternalLink color={theme.colors.white} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <FloatingWhatsApp />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  hero: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: width > 768 ? 36 : 28,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
    maxWidth: 600,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  errorBanner: {
    backgroundColor: '#FEF3C7',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    gap: theme.spacing.md,
  },
  errorText: {
    color: '#92400E',
    fontSize: 14,
    lineHeight: 20,
  },
  visitBlogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  visitBlogText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  postCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.lg,
  },
  postHeader: {
    marginBottom: theme.spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  postTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 28,
  },
  postExcerpt: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  readMoreText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.primary,
  },
  footer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    minWidth: width > 768 ? 300 : '100%',
  },
  viewAllText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  emptyState: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});
