import React from 'react';
import { TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { theme } from '@/constants/theme';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  phoneNumber = '0244311110',
}) => {
  const openWhatsApp = () => {
    let formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '233' + formattedNumber.substring(1);
    }

    const message = 'Hello! I would like to inquire about Happy Art Pottery Studio.';
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;

    Linking.openURL(whatsappUrl).catch(() => {
      console.log('WhatsApp is not installed');
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={openWhatsApp}
      activeOpacity={0.8}
    >
      <MessageCircle color={theme.colors.white} size={28} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.whatsapp,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
    zIndex: 1000,
  },
});
