import { Linking } from 'react-native';

export const emailService = {
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      const emailUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const canOpen = await Linking.canOpenURL(emailUrl);
      
      if (canOpen) {
        await Linking.openURL(emailUrl);
        console.log('[EmailService] Email client opened successfully');
        return true;
      } else {
        console.warn('[EmailService] Cannot open email client');
        return false;
      }
    } catch (error) {
      console.error('[EmailService] Error opening email client:', error);
      return false;
    }
  },

  async notifyAdminNewMessage(messageData: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const emailBody = `New Contact Message from Happy Art Website\n\nFrom: ${messageData.name}\nEmail: ${messageData.email}\nPhone: ${messageData.phone}\nSubject: ${messageData.subject}\n\nMessage:\n${messageData.message}\n\n---\nThis message was sent from the Happy Art contact form.\nPlease respond to the customer as soon as possible.`;
    
    await this.sendEmail(
      'happyartgh@gmail.com',
      `New Contact: ${messageData.subject}`,
      emailBody
    );
  },

  async notifyAdminNewBooking(bookingData: {
    name: string;
    phone: string;
    numberOfPersons: number;
    date: string;
    day: string;
    classType: string;
  }): Promise<void> {
    const emailBody = `New Booking Request from Happy Art Website\n\nCustomer Details:\nName: ${bookingData.name}\nPhone: ${bookingData.phone}\n\nBooking Details:\nClass Type: ${bookingData.classType}\nDate: ${bookingData.date}\nDay: ${bookingData.day}\nNumber of Persons: ${bookingData.numberOfPersons}\n\n---\nThis booking was submitted via the website dashboard.\nPlease contact the customer to confirm.`;
    
    await this.sendEmail(
      'happyartgh@gmail.com',
      `New Booking: ${bookingData.classType} - ${bookingData.name}`,
      emailBody
    );
  },
};
