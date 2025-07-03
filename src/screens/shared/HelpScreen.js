import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme/theme';
import Button from '../../components/common/Button';

const HelpScreen = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const faqData = [
    {
      id: '1',
      question: 'How do I create a new booking?',
      answer: 'To create a new booking, go to the Customer Home screen and tap "New Booking". Fill in the pickup and delivery details, select your service type, and confirm your booking.',
    },
    {
      id: '2',
      question: 'How can I track my shipment?',
      answer: 'You can track your shipment in real-time by going to "My Bookings" and selecting the active booking. The tracking screen will show the current location of your driver and estimated arrival time.',
    },
    {
      id: '3',
      question: 'How do I update my profile information?',
      answer: 'Go to the Profile section in your role-specific menu. You can update your personal information, contact details, and preferences from there.',
    },
    {
      id: '4',
      question: 'What payment methods are accepted?',
      answer: 'We accept credit cards, debit cards, and corporate accounts. You can manage your payment methods in the Profile section under Payment Methods.',
    },
    {
      id: '5',
      question: 'How do I report an issue with a driver or service?',
      answer: 'You can report issues through the Support section or by contacting our customer service directly. For urgent issues, use the emergency contact feature.',
    },
    {
      id: '6',
      question: 'How do drivers accept and complete jobs?',
      answer: 'Drivers receive job notifications and can accept them from the Jobs screen. Once accepted, they can navigate to pickup/delivery locations and update job status in real-time.',
    },
    {
      id: '7',
      question: 'How do dispatchers assign jobs to drivers?',
      answer: 'Dispatchers can view all available jobs in the Job Queue and assign them to available drivers based on location, capacity, and driver preferences.',
    },
    {
      id: '8',
      question: 'How do I reset my password?',
      answer: 'On the login screen, tap "Forgot Password" and enter your email address. You\'ll receive instructions to reset your password via email.',
    },
  ];

  const contactOptions = [
    {
      title: 'Call Customer Service',
      subtitle: '1-800-ENERGY-1',
      icon: 'call',
      action: () => Linking.openURL('tel:1-800-363-7491'),
    },
    {
      title: 'Email Support',
      subtitle: 'support@energymobile.com',
      icon: 'mail',
      action: () => Linking.openURL('mailto:support@energymobile.com'),
    },
    {
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      icon: 'chatbubble',
      action: () => {
        // TODO: Implement live chat functionality
        Alert.alert('Live Chat', 'Live chat feature coming soon!');
      },
    },
    {
      title: 'Emergency Contact',
      subtitle: '24/7 Emergency Line',
      icon: 'warning',
      action: () => Linking.openURL('tel:911'),
    },
  ];

  const quickLinks = [
    {
      title: 'Terms of Service',
      icon: 'document-text',
      action: () => Linking.openURL('https://energymobile.com/terms'),
    },
    {
      title: 'Privacy Policy',
      icon: 'shield-checkmark',
      action: () => Linking.openURL('https://energymobile.com/privacy'),
    },
    {
      title: 'User Guide',
      icon: 'book',
      action: () => Linking.openURL('https://energymobile.com/guide'),
    },
    {
      title: 'Report a Bug',
      icon: 'bug',
      action: () => Linking.openURL('mailto:bugs@energymobile.com?subject=Bug Report'),
    },
  ];

  const toggleFAQ = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const renderFAQItem = (item) => (
    <View key={item.id} style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => toggleFAQ(item.id)}
      >
        <Text style={styles.faqQuestionText}>{item.question}</Text>
        <Ionicons
          name={expandedSection === item.id ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.primary}
        />
      </TouchableOpacity>
      {expandedSection === item.id && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );

  const renderContactOption = (option) => (
    <TouchableOpacity
      key={option.title}
      style={styles.contactOption}
      onPress={option.action}
    >
      <View style={styles.contactIcon}>
        <Ionicons name={option.icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{option.title}</Text>
        <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderQuickLink = (link) => (
    <TouchableOpacity
      key={link.title}
      style={styles.quickLink}
      onPress={link.action}
    >
      <Ionicons name={link.icon} size={20} color={colors.primary} />
      <Text style={styles.quickLinkText}>{link.title}</Text>
      <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>Get help and find answers to common questions</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Need Immediate Help?</Text>
        <View style={styles.quickActions}>
          <Button
            title="Call Support"
            onPress={() => Linking.openURL('tel:1-800-363-7491')}
            variant="primary"
            style={styles.quickActionButton}
          />
          <Button
            title="Email Us"
            onPress={() => Linking.openURL('mailto:support@energymobile.com')}
            variant="outline"
            style={styles.quickActionButton}
          />
        </View>
      </View>

      {/* FAQ Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqContainer}>
          {faqData.map(renderFAQItem)}
        </View>
      </View>

      {/* Contact Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <View style={styles.contactContainer}>
          {contactOptions.map(renderContactOption)}
        </View>
      </View>

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resources</Text>
        <View style={styles.quickLinksContainer}>
          {quickLinks.map(renderQuickLink)}
        </View>
      </View>

      {/* App Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.appInfo}>
          <View style={styles.appInfoItem}>
            <Text style={styles.appInfoLabel}>Version</Text>
            <Text style={styles.appInfoValue}>1.0.0</Text>
          </View>
          <View style={styles.appInfoItem}>
            <Text style={styles.appInfoLabel}>Build</Text>
            <Text style={styles.appInfoValue}>1.0.0 (100)</Text>
          </View>
          <View style={styles.appInfoItem}>
            <Text style={styles.appInfoLabel}>Last Updated</Text>
            <Text style={styles.appInfoValue}>December 2023</Text>
          </View>
        </View>
      </View>

      {/* Feedback Section */}
      <View style={styles.section}>
        <View style={styles.feedbackContainer}>
          <Ionicons name="star" size={24} color={colors.warning} />
          <View style={styles.feedbackContent}>
            <Text style={styles.feedbackTitle}>Enjoying the app?</Text>
            <Text style={styles.feedbackText}>
              Help us improve by rating the app or sending feedback
            </Text>
          </View>
        </View>
        <View style={styles.feedbackActions}>
          <Button
            title="Rate App"
            onPress={() => {
              // TODO: Implement app store rating
              Alert.alert('Rate App', 'This will redirect to the app store for rating.');
            }}
            variant="outline"
            style={styles.feedbackButton}
          />
          <Button
            title="Send Feedback"
            onPress={() => Linking.openURL('mailto:feedback@energymobile.com?subject=App Feedback')}
            variant="primary"
            style={styles.feedbackButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.large,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.small,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.surface,
    marginBottom: spacing.medium,
    padding: spacing.large,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.medium,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.medium,
  },
  quickActionButton: {
    flex: 1,
  },
  faqContainer: {
    gap: spacing.small,
  },
  faqItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.medium,
    backgroundColor: colors.background,
  },
  faqQuestionText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  faqAnswer: {
    padding: spacing.medium,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  faqAnswerText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contactContainer: {
    gap: spacing.small,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.medium,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  contactSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  quickLinksContainer: {
    gap: spacing.small,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickLinkText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.medium,
  },
  appInfo: {
    gap: spacing.small,
  },
  appInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.small,
  },
  appInfoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  appInfoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  feedbackContent: {
    flex: 1,
    marginLeft: spacing.medium,
  },
  feedbackTitle: {
    ...typography.subtitle,
    color: colors.text,
    fontWeight: '600',
  },
  feedbackText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: spacing.medium,
  },
  feedbackButton: {
    flex: 1,
  },
});

export default HelpScreen;
