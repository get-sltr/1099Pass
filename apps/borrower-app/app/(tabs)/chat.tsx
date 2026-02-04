/**
 * Chat Screen
 * Individual conversation view with real-time messaging
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Card, Badge, useToast } from '../../src/components/ui';
import { useMessagingStore } from '../../src/store/messaging-store';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';
import type { Message } from '../../src/store/messaging-store';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const [messageText, setMessageText] = useState('');
  const [showShareOptions, setShowShareOptions] = useState(false);

  const {
    conversations,
    messages,
    isLoading,
    isLoadingMore,
    hasMoreMessages,
    connectionStatus,
    loadMessages,
    sendMessage,
    shareReport,
    setActiveConversation,
  } = useMessagingStore();

  const conversation = conversations.find((c) => c.id === conversationId);
  const conversationMessages = messages[conversationId || ''] || [];

  // Set active conversation on mount
  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
      loadMessages(conversationId);
    }

    return () => {
      setActiveConversation(null);
    };
  }, [conversationId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversationMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversationMessages.length]);

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || !conversationId) return;

    const text = messageText.trim();
    setMessageText('');
    Keyboard.dismiss();

    await sendMessage(conversationId, text);
  }, [messageText, conversationId, sendMessage]);

  const handleLoadMore = useCallback(() => {
    if (!conversationId || isLoadingMore || !hasMoreMessages[conversationId]) return;

    const oldestMessage = conversationMessages[0];
    if (oldestMessage) {
      loadMessages(conversationId, oldestMessage.id);
    }
  }, [conversationId, isLoadingMore, hasMoreMessages, conversationMessages, loadMessages]);

  const handleShareReport = useCallback(async () => {
    if (!conversationId) return;

    setShowShareOptions(false);
    // TODO: Show report selector modal
    showToast({
      type: 'info',
      title: 'Coming soon',
      message: 'Report sharing from chat will be available soon',
    });
  }, [conversationId, showToast]);

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = useCallback(({ item: message, index }: { item: Message; index: number }) => {
    const isFromUser = message.senderType === 'borrower';
    const isSystem = message.senderType === 'system';
    const showTimestamp = index === 0 ||
      new Date(message.createdAt).getTime() - new Date(conversationMessages[index - 1]?.createdAt).getTime() > 5 * 60 * 1000;

    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          {showTimestamp && (
            <Text style={styles.timestamp}>{formatMessageTime(message.createdAt)}</Text>
          )}
          <View style={styles.systemMessage}>
            <Ionicons name="information-circle-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.systemMessageText}>{message.content}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.messageWrapper}>
        {showTimestamp && (
          <Text style={styles.timestamp}>{formatMessageTime(message.createdAt)}</Text>
        )}
        <View
          style={[
            styles.messageContainer,
            isFromUser ? styles.messageContainerUser : styles.messageContainerOther,
          ]}
        >
          {message.contentType === 'report_share' ? (
            <View style={[styles.messageBubble, styles.reportShareBubble]}>
              <View style={styles.reportShareHeader}>
                <Ionicons name="document-text" size={20} color={colors.primary} />
                <Text style={styles.reportShareTitle}>Income Verification Report</Text>
              </View>
              <Text style={styles.reportShareText}>Shared report for review</Text>
              <TouchableOpacity style={styles.reportShareButton}>
                <Text style={styles.reportShareButtonText}>View Report</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={[
                styles.messageBubble,
                isFromUser ? styles.messageBubbleUser : styles.messageBubbleOther,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isFromUser ? styles.messageTextUser : styles.messageTextOther,
                ]}
              >
                {message.content}
              </Text>
            </View>
          )}

          {/* Message status indicator for user messages */}
          {isFromUser && (
            <View style={styles.messageStatus}>
              {message.status === 'sending' && (
                <ActivityIndicator size="small" color={colors.textTertiary} />
              )}
              {message.status === 'sent' && (
                <Ionicons name="checkmark" size={12} color={colors.textTertiary} />
              )}
              {message.status === 'delivered' && (
                <Ionicons name="checkmark-done" size={12} color={colors.textTertiary} />
              )}
              {message.status === 'read' && (
                <Ionicons name="checkmark-done" size={12} color={colors.primary} />
              )}
              {message.status === 'failed' && (
                <TouchableOpacity>
                  <Ionicons name="alert-circle" size={14} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    );
  }, [conversationMessages]);

  const renderHeader = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingMoreText}>Loading older messages...</Text>
      </View>
    );
  };

  if (!conversation) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>Conversation not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerProfile} activeOpacity={0.7}>
          <View style={styles.avatarContainer}>
            <Avatar name={conversation.participantName} size="sm" />
            {conversation.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {conversation.participantName}
            </Text>
            <Text style={styles.headerStatus}>
              {conversation.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          {connectionStatus !== 'connected' && (
            <View style={styles.connectionBadge}>
              <Ionicons
                name={connectionStatus === 'connecting' ? 'sync' : 'cloud-offline'}
                size={14}
                color={colors.warning}
              />
            </View>
          )}
          <TouchableOpacity style={styles.headerAction} accessibilityLabel="More options">
            <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : conversationMessages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Send a message to start the conversation
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={conversationMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          ListHeaderComponent={renderHeader}
          inverted={false}
        />
      )}

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing[2] }]}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={() => setShowShareOptions(!showShareOptions)}
          accessibilityLabel="Attach file"
        >
          <Ionicons
            name={showShareOptions ? 'close' : 'add-circle-outline'}
            size={28}
            color={colors.primary}
          />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textTertiary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            !messageText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!messageText.trim()}
          accessibilityLabel="Send message"
        >
          <Ionicons
            name="send"
            size={20}
            color={messageText.trim() ? colors.textInverse : colors.textTertiary}
          />
        </TouchableOpacity>
      </View>

      {/* Share options */}
      {showShareOptions && (
        <View style={[styles.shareOptions, { bottom: insets.bottom + 70 }]}>
          <TouchableOpacity
            style={styles.shareOption}
            onPress={handleShareReport}
          >
            <View style={styles.shareOptionIcon}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
            </View>
            <Text style={styles.shareOptionText}>Share Report</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingBottom: spacing[3],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  headerBack: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarContainer: {
    position: 'relative',
  },

  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },

  headerInfo: {
    marginLeft: spacing[3],
    flex: 1,
  },

  headerName: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  headerStatus: {
    ...textStyles.caption,
    color: colors.textTertiary,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  connectionBadge: {
    padding: spacing[2],
  },

  headerAction: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing[2],
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },

  emptyTitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginTop: spacing[3],
  },

  emptySubtitle: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[1],
    textAlign: 'center',
  },

  backButton: {
    marginTop: spacing[4],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },

  backButtonText: {
    ...textStyles.bodySmall,
    color: colors.textInverse,
    fontWeight: '600',
  },

  messagesList: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },

  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
  },

  loadingMoreText: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginLeft: spacing[2],
  },

  messageWrapper: {
    marginBottom: spacing[2],
  },

  timestamp: {
    ...textStyles.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginVertical: spacing[2],
  },

  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: spacing[2],
  },

  systemMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
  },

  systemMessageText: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginLeft: spacing[1],
  },

  messageContainer: {
    maxWidth: '80%',
  },

  messageContainerUser: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },

  messageContainerOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },

  messageBubble: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
  },

  messageBubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing[1],
  },

  messageBubbleOther: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: spacing[1],
    borderWidth: 1,
    borderColor: colors.border,
  },

  messageText: {
    ...textStyles.body,
    lineHeight: 22,
  },

  messageTextUser: {
    color: colors.textInverse,
  },

  messageTextOther: {
    color: colors.textPrimary,
  },

  reportShareBubble: {
    backgroundColor: colors.mintSoft,
    borderWidth: 1,
    borderColor: colors.mint,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
  },

  reportShareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },

  reportShareTitle: {
    ...textStyles.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing[2],
  },

  reportShareText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginBottom: spacing[3],
  },

  reportShareButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },

  reportShareButtonText: {
    ...textStyles.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },

  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
    marginRight: spacing[1],
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[2],
    paddingTop: spacing[2],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  attachButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputContainer: {
    flex: 1,
    marginHorizontal: spacing[2],
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 120,
  },

  input: {
    ...textStyles.body,
    color: colors.textPrimary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    minHeight: 44,
  },

  sendButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },

  sendButtonDisabled: {
    backgroundColor: colors.border,
  },

  shareOptions: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: borderRadius.md,
  },

  shareOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  shareOptionText: {
    ...textStyles.body,
    color: colors.textPrimary,
  },
});
