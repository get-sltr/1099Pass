/**
 * Messages Screen
 * Communication with lenders and support
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Avatar } from '../../src/components/ui';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';

interface Conversation {
  id: string;
  participantName: string;
  participantType: 'lender' | 'support';
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    participantName: 'Quick Mortgage Co.',
    participantType: 'lender',
    lastMessage: 'Thanks for sending your income report. I\'ve reviewed it and have a few questions...',
    timestamp: '10:32 AM',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    participantName: '1099Pass Support',
    participantType: 'support',
    lastMessage: 'Your verification is complete! Let us know if you have any questions.',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '3',
    participantName: 'Drive Finance',
    participantType: 'lender',
    lastMessage: 'We\'d love to help you with your auto loan. When would be a good time to chat?',
    timestamp: 'Jan 18',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '4',
    participantName: 'Freelancer Credit Union',
    participantType: 'lender',
    lastMessage: 'Your pre-approval letter is ready. Check your documents.',
    timestamp: 'Jan 15',
    unreadCount: 0,
    isOnline: false,
  },
];

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const handleOpenConversation = (conversation: Conversation) => {
    // TODO: Navigate to conversation detail
    console.log('Open conversation:', conversation.id);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[4] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Messages</Text>
            {totalUnread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{totalUnread}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.composeButton}>
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick help card */}
        <Card variant="mint" style={styles.helpCard}>
          <View style={styles.helpContent}>
            <View style={styles.helpIcon}>
              <Ionicons name="help-buoy-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.helpInfo}>
              <Text style={styles.helpTitle}>Need help?</Text>
              <Text style={styles.helpSubtitle}>Our support team is available 24/7</Text>
            </View>
            <TouchableOpacity style={styles.helpButton}>
              <Text style={styles.helpButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Conversations list */}
        <View style={styles.conversationsSection}>
          <Text style={styles.sectionTitle}>Conversations</Text>

          {conversations.length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                Connect with lenders to start conversations
              </Text>
            </Card>
          ) : (
            <Card variant="outlined" style={styles.conversationsCard}>
              {conversations.map((conversation, index) => (
                <TouchableOpacity
                  key={conversation.id}
                  style={[
                    styles.conversationItem,
                    index < conversations.length - 1 && styles.conversationItemBorder,
                  ]}
                  onPress={() => handleOpenConversation(conversation)}
                >
                  <View style={styles.avatarContainer}>
                    <Avatar
                      name={conversation.participantName}
                      size="md"
                    />
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
                      <Text style={styles.timestamp}>{conversation.timestamp}</Text>
                    </View>

                    <View style={styles.messageRow}>
                      <Text
                        style={[
                          styles.lastMessage,
                          conversation.unreadCount > 0 && styles.lastMessageUnread,
                        ]}
                        numberOfLines={2}
                      >
                        {conversation.lastMessage}
                      </Text>
                      {conversation.unreadCount > 0 && (
                        <View style={styles.unreadCount}>
                          <Text style={styles.unreadCountText}>
                            {conversation.unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>

                    {conversation.participantType === 'lender' && (
                      <Badge variant="primary" size="small" style={styles.typeBadge}>
                        Lender
                      </Badge>
                    )}
                    {conversation.participantType === 'support' && (
                      <Badge variant="mint" size="small" style={styles.typeBadge}>
                        Support
                      </Badge>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          )}
        </View>

        {/* Tips */}
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
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.tipText}>Ask questions about loan terms</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: spacing[4],
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[2],
    marginBottom: spacing[6],
  },

  headerLeft: {
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
  },

  composeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  helpCard: {
    marginBottom: spacing[6],
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

  conversationsSection: {
    marginBottom: spacing[6],
  },

  sectionTitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[3],
    paddingHorizontal: spacing[2],
  },

  conversationsCard: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },

  conversationItem: {
    flexDirection: 'row',
    padding: spacing[4],
  },

  conversationItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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

  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing[8],
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

  tipsCard: {
    marginBottom: spacing[4],
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
