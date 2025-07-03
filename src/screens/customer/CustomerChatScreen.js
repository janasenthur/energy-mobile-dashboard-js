import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/theme';

const CustomerChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  const quickSuggestions = [
    {
      id: 1,
      text: 'Check the real time status of my fleet',
      icon: 'speedometer-outline',
    },
    {
      id: 2,
      text: 'Find the fastest route to reach destination',
      icon: 'navigate-outline',
    },
    {
      id: 3,
      text: 'How to reschedule my booking made on yesterday?',
      icon: 'calendar-outline',
    },
    {
      id: 4,
      text: 'How can I reduce the operation cost?',
      icon: 'trending-down-outline',
    },
  ];

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: 1,
        text: 'Hi, John 👋\n\nHow can I help you today',
        isBot: true,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSend = (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(text.trim());
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userText) => {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('status') || lowerText.includes('fleet')) {
      return 'Here is the current status of your truck.\n\n🚛 Western Star 49\n📍 Illinois, IL USA\n⚡ 60 km/hr • 50% • Arrival in 1 hr\n\n🚛 Peterbilt 589\n📍 Texas, TX USA\n⚡ 0 km/hr • 50% • 30 minutes • Arrival in 2 hr';
    } else if (lowerText.includes('route') || lowerText.includes('destination')) {
      return 'I can help you find the optimal route! Please share your pickup and destination locations, and I\'ll calculate the fastest route with real-time traffic updates.';
    } else if (lowerText.includes('reschedule') || lowerText.includes('booking')) {
      return 'To reschedule your booking from yesterday:\n\n1. Go to "Bookings" tab\n2. Select your active booking\n3. Tap "Reschedule"\n4. Choose new date & time\n\nWould you like me to guide you through this process?';
    } else if (lowerText.includes('cost') || lowerText.includes('reduce')) {
      return 'Here are some ways to reduce operation costs:\n\n• Optimize routes to reduce fuel consumption\n• Schedule deliveries during off-peak hours\n• Use bulk booking discounts\n• Track fuel efficiency metrics\n• Regular vehicle maintenance\n\nWould you like detailed information on any of these strategies?';
    } else {
      return 'I understand your query. Let me help you with that. Can you provide more specific details about what you\'re looking for?';
    }
  };

  const renderMessage = (message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isBot ? styles.botMessage : styles.userMessage,
      ]}
    >
      {message.isBot && (
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>🤖</Text>
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          message.isBot ? styles.botBubble : styles.userBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isBot ? styles.botText : styles.userText,
          ]}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );

  const renderQuickSuggestion = (suggestion) => (
    <TouchableOpacity
      key={suggestion.id}
      style={styles.suggestionCard}
      onPress={() => handleSend(suggestion.text)}
    >
      <Ionicons name={suggestion.icon} size={20} color={colors.primary} />
      <Text style={styles.suggestionText}>{suggestion.text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chaatie</Text>
        <TouchableOpacity style={styles.languageButton}>
          <Text style={styles.languageText}>🌐 English</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 1 && (
            <View style={styles.suggestionsContainer}>
              {quickSuggestions.map(renderQuickSuggestion)}
            </View>
          )}

          {messages.map(renderMessage)}

          {isTyping && (
            <View style={styles.typingContainer}>
              <View style={styles.botAvatar}>
                <Text style={styles.botAvatarText}>🤖</Text>
              </View>
              <View style={styles.typingBubble}>
                <Text style={styles.typingText}>Typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask anything about the truck..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.voiceButton}>
            <Ionicons name="mic" size={24} color={colors.gray[600]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark,
  },
  languageButton: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  languageText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  messagesContent: {
    paddingVertical: spacing.lg,
  },
  suggestionsContainer: {
    marginBottom: spacing.xl,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  suggestionText: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: 16,
    color: colors.dark,
    lineHeight: 22,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    alignItems: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  botAvatarText: {
    fontSize: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  botBubble: {
    backgroundColor: colors.gray[100],
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    marginLeft: spacing.sm,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  botText: {
    color: colors.dark,
  },
  userText: {
    color: colors.white,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  typingBubble: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: 4,
  },
  typingText: {
    fontSize: 16,
    color: colors.gray[600],
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    maxHeight: 100,
    marginRight: spacing.sm,
  },
  voiceButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
});

export default CustomerChatScreen;
