/**
 * Messages Screen
 * Conversations list with lenders and support
 */

import { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Avatar } from '../../src/components/ui';
import { useMessagingStore, type Conversation } from '../../src/store/messaging-store';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();

  const {
    conversations,
    totalUnreadCount,
    isLoading,
    connectionStatus,
    error,
    loadConversations,
    connect,
    disconnect,
  } = useMessagingStore();

  // Load conversations and connect WebSocket on mount
  useEffect(() => {
    loadConversations();
    connect();

    return () => {
      disconnect();
    };
  }, []);

  const handleRefresh = useCallback(() => {
    loadConversations();
  }, [loadConversations]);

  const handleOpenConversation = useCallback((conversation: Conversation) => {
    router.push({
      pathname: '/(tabs)/chat',
      params: { conversationId: conversation.id },
    });
  }, []);

  const handleStartSupport = useCallback(() => {
    // Find or create support conversation
    const supportConversation = conversations.find((c) => c.participantType === 'support');
    if (supportConversation) {
      handleOpenConversation(supportConversation);
    } else {
      // TODO: Create new support conversation
      router.push({
        pathname: '/(tabs)/chat',
        params: { conversationId: 'conv_2' }, // Mock support conversation
      });
    }
  }, [conversations, handleOpenConversation]);

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderConversation = useCallback(({ item: conversation }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleOpenConversation(conversation)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Conversation with ${conversation.participantName}. ${conversation.unreadCount > 0 ? `${conversation.unreadCount} unread messages` : ''}`}
    >
      <View style={styles.avatarContainer}>
        <Avatar name={conversation.participantName} size="md" />
        {conversation.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text
            style={[
              styles.participantName,
              conversation.unreadCount > 0 && styles.participantNameUnread,
            ]}
            numberOfLines={1}
          >
            {conversation.participantName}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(conversation.lastMessageAt)}
          </Text>
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              conversation.unreadCount > 0 && styles.lastMessageUnread,
            ]}
            numberOfLines={2}
          >
            {conversation.lastMessage || 'No messages yet'}
          </Text>
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadCount}>
              <Text style={styles.unreadCountText}>
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>

        <Badge
          variant={conversation.participantType === 'lender' ? 'primary' : 'mint'}
          size="small"
          style={styles.typeBadge}
        >
          {conversation.participantType === 'lender' ? 'Lender' : 'Support'}
        </Badge>
      </View>
    </TouchableOpacity>
  ), [handleOpenConversation]);

  const renderSeparator = () => <View style={styles.separator} />;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptySubtitle}>
        Share your report with a lender to start a conversation
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="cloud-offline-outline" size={48} color={colors.error} />
      <Text style={styles.errorTitle}>Unable to load messages</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing[4] }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Messages</Text>
          {totalUnreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          {connectionStatus !== 'connected' && (
            <View style={styles.connectionStatus}>
              {connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? (
                <ActivityIndicator size="small" color={colors.warning} />
              ) : (
                <Ionicons name="cloud-offline" size={18} color={colors.warning} />
              )}
            </View>
          )}
          <TouchableOpacity
            style={styles.composeButton}
            accessibilityLabel="Start new conversation"
          >
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Help card */}
      <View style={styles.helpCardContainer}>
        <Card variant="mint" style={styles.helpCard}>
          <View style={styles.helpContent}>
            <View style={styles.helpIcon}>
              <Ionicons name="help-buoy-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.helpInfo}>
              <Text style={styles.helpTitle}>Need help?</Text>
              <Text style={styles.helpSubtitle}>Our support team is available 24/7</Text>
            </View>
            <TouchableOpacity style={styles.helpButton} onPress={handleStartSupport}>
              <Text style={styles.helpButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      {/* Conversations list */}
      {error && !isLoading ? (
        renderError()
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={isLoading ? null : renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            conversations.length === 0 && styles.listContentEmpty,
            { paddingBottom: insets.bottom + spacing[4] },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Tips card - shown only when there are conversations */}
      {conversations.length > 0 && (
        <View style={[styles.tipsContainer, { paddingBottom: insets.bottom + spacing[2] }]}>
          <Card variant="default" style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Communication tips</Text>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>Respond promptly to lender inquiries</Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>Share updated reports when requested</Text>
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    backgroundColor: colors.background,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    ...textStyles.h2,
    color: colors.textPrimary,
  },

  unreadBadge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing[2],
    paddingHorizontal: spacing[1.5],
  },

  unreadBadgeText: {
    ...textStyles.caption,
    color: colors.textInverse,
    fontWeight: '600',
    fontSize: 11,
  },

  connectionStatus: {
    marginRight: spacing[2],
  },

  composeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  helpCardContainer: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },

  helpCard: {
    marginBottom: 0,
  },

  helpContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  helpIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  helpInfo: {
    flex: 1,
  },

  helpTitle: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  helpSubtitle: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing[0.5],
  },

  helpButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },

  helpButtonText: {
    ...textStyles.bodySmall,
    color: colors.textInverse,
    fontWeight: '600',
  },

  listContent: {
    paddingHorizontal: spacing[4],
  },

  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },

  conversationItem: {
    flexDirection: 'row',
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
  },

  separator: {
    height: spacing[2],
  },

  avatarContainer: {
    position: 'relative',
    marginRight: spacing[3],
  },

  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },

  conversationContent: {
    flex: 1,
  },

  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },

  participantName: {
    ...textStyles.body,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing[2],
  },

  participantNameUnread: {
    fontWeight: '600',
  },

  timestamp: {
    ...textStyles.caption,
    color: colors.textTertiary,
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  lastMessage: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },

  lastMessageUnread: {
    color: colors.textPrimary,
  },

  unreadCount: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing[2],
    paddingHorizontal: spacing[1.5],
  },

  unreadCountText: {
    ...textStyles.caption,
    color: colors.textInverse,
    fontWeight: '600',
    fontSize: 11,
  },

  typeBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing[2],
  },

  emptyContainer: {
    alignItems: 'center',
    padding: spacing[8],
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
    maxWidth: 250,
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },

  errorTitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginTop: spacing[3],
  },

  errorSubtitle: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[1],
    textAlign: 'center',
  },

  retryButton: {
    marginTop: spacing[4],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },

  retryButtonText: {
    ...textStyles.bodySmall,
    color: colors.textInverse,
    fontWeight: '600',
  },

  tipsContainer: {
    paddingHorizontal: spacing[4],
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
  },

  tipsCard: {
    marginBottom: 0,
  },

  tipsTitle: {
    ...textStyles.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing[3],
  },

  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },

  tipText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing[2],
  },
});
