import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, Mail, MailOpen } from 'lucide-react-native';
import { AdminHeader } from '@/components/AdminHeader';
import { theme } from '@/constants/theme';
import { dataService } from '@/services/dataService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useData } from '@/contexts/DataContext';
import { database } from '@/services/database';
import { Message } from '@/types';

export default function AdminMessages() {
  console.log('[AdminMessages] Screen rendered');
  const queryClient = useQueryClient();
  const { messages: rawMessages } = useData();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    console.log('[Messages] Setting up real-time listener...');
    const unsubscribe = database.subscribeToCollection<Message>(
      'messages',
      (newMessages) => {
        console.log('[Messages] Real-time update received:', newMessages.length);
        queryClient.setQueryData(['messages'], newMessages);
        
        const unread = newMessages.filter(m => !m.read).length;
        setUnreadCount(unread);
        
        if (unread > unreadCount) {
          console.log('[Messages] New unread message!');
        }
      },
      (error) => {
        console.error('[Messages] Real-time listener error:', error);
      }
    );

    return () => {
      console.log('[Messages] Cleaning up real-time listener');
      unsubscribe();
    };
  }, [queryClient, unreadCount]);

  const messages = useMemo(() => {
    return [...rawMessages].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [rawMessages]);

  const updateMessageMutation = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) => 
      dataService.updateMessage(id, { read }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error) => {
      console.error('Error updating message:', error);
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id: string) => dataService.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error) => {
      console.error('Error deleting message:', error);
    },
  });

  const toggleRead = (id: string) => {
    const message = messages.find((m) => m.id === id);
    if (message) {
      updateMessageMutation.mutate({ id, read: !message.read });
    }
  };

  const handleDelete = (id: string) => {
    deleteMessageMutation.mutate(id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="admin-messages-screen">
      <AdminHeader />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.subtitle}>
              {messages.filter((m) => !m.read).length} unread messages
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.messagesList}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageCard,
                !message.read && styles.messageCardUnread,
              ]}
            >
              <View style={styles.messageHeader}>
                <View style={styles.messageInfo}>
                  <Text style={styles.messageName}>{message.name}</Text>
                  <Text style={styles.messageSubject}>{message.subject}</Text>
                </View>
                <View style={styles.messageActions}>
                  <TouchableOpacity onPress={() => toggleRead(message.id)}>
                    {message.read ? (
                      <Mail color={theme.colors.textLight} size={20} />
                    ) : (
                      <MailOpen color={theme.colors.primary} size={20} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(message.id)}>
                    <Trash2 color={theme.colors.error} size={20} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.messageText}>{message.message}</Text>

              <View style={styles.messageContact}>
                <Text style={styles.contactItem}>📧 {message.email}</Text>
                <Text style={styles.contactItem}>📞 {message.phone}</Text>
                <Text style={styles.messageDate}>
                  {new Date(message.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        )}
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
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  messagesList: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  messageCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  messageCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  messageInfo: {
    flex: 1,
  },
  messageName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  messageSubject: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600' as const,
    marginTop: theme.spacing.xs,
  },
  messageActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  messageText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  messageContact: {
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  contactItem: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  messageDate: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  emptyState: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  badge: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.full,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '700' as const,
  },
});
