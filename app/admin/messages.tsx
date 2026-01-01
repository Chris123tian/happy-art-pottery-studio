import React, { useEffect, useState } from 'react';
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
import { Message } from '@/types';
import { queryClient } from '@/contexts/DataContext';

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const data = await dataService.getMessages();
    setMessages(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const toggleRead = async (id: string) => {
    const updatedMessages = messages.map((m) =>
      m.id === id ? { ...m, read: !m.read } : m
    );
    await dataService.setMessages(updatedMessages);
    await queryClient.invalidateQueries({ queryKey: ['messages'] });
    setMessages(updatedMessages);
  };

  const handleDelete = async (id: string) => {
    const updatedMessages = messages.filter((m) => m.id !== id);
    await dataService.setMessages(updatedMessages);
    await queryClient.invalidateQueries({ queryKey: ['messages'] });
    setMessages(updatedMessages);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminHeader />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>
            {messages.filter((m) => !m.read).length} unread
          </Text>
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
});
