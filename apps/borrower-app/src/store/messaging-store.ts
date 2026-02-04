/**
 * Messaging Store
 * Manages conversations, messages, and WebSocket connection
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

// Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'borrower' | 'lender' | 'support' | 'system';
  content: string;
  contentType: 'text' | 'report_share' | 'document' | 'system';
  reportId?: string;
  documentId?: string;
  createdAt: string;
  readAt?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantType: 'lender' | 'support';
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

interface MessagingState {
  // State
  conversations: Conversation[];
  messages: Record<string, Message[]>; // keyed by conversationId
  activeConversationId: string | null;
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMoreMessages: Record<string, boolean>;
  error: string | null;
  totalUnreadCount: number;

  // WebSocket
  ws: WebSocket | null;
  reconnectAttempts: number;

  // Actions
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string, cursor?: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, contentType?: Message['contentType'], metadata?: { reportId?: string; documentId?: string }) => Promise<void>;
  shareReport: (conversationId: string, reportId: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;

  // WebSocket management
  connect: () => void;
  disconnect: () => void;

  // Real-time handlers
  handleIncomingMessage: (message: Message) => void;
  handleMessageStatus: (messageId: string, status: Message['status']) => void;
  handlePresenceUpdate: (participantId: string, isOnline: boolean) => void;

  // Utilities
  clearError: () => void;
  reset: () => void;
}

const STORAGE_KEY = '1099pass_messaging_cache';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000];

// Mock data for development
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    participantId: 'lender_1',
    participantName: 'Quick Mortgage Co.',
    participantType: 'lender',
    lastMessage: "Thanks for sending your income report. I've reviewed it and have a few questions about your Uber income consistency.",
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: 2,
    isOnline: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'conv_2',
    participantId: 'support_1',
    participantName: '1099Pass Support',
    participantType: 'support',
    lastMessage: 'Your verification is complete! Let us know if you have any questions.',
    lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    isOnline: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'conv_3',
    participantId: 'lender_2',
    participantName: 'Drive Finance',
    participantType: 'lender',
    lastMessage: "We'd love to help you with your auto loan. When would be a good time to chat?",
    lastMessageAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    isOnline: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  conv_1: [
    {
      id: 'msg_1',
      conversationId: 'conv_1',
      senderId: 'lender_1',
      senderType: 'lender',
      content: 'Hello! Thank you for sharing your income report with us.',
      contentType: 'text',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'read',
    },
    {
      id: 'msg_2',
      conversationId: 'conv_1',
      senderId: 'user',
      senderType: 'borrower',
      content: "Hi! Happy to help with any questions you have.",
      contentType: 'text',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'read',
    },
    {
      id: 'msg_3',
      conversationId: 'conv_1',
      senderId: 'lender_1',
      senderType: 'lender',
      content: "Thanks for sending your income report. I've reviewed it and have a few questions about your Uber income consistency.",
      contentType: 'text',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'delivered',
    },
    {
      id: 'msg_4',
      conversationId: 'conv_1',
      senderId: 'lender_1',
      senderType: 'lender',
      content: "Could you tell me more about the seasonal fluctuations?",
      contentType: 'text',
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      status: 'delivered',
    },
  ],
  conv_2: [
    {
      id: 'msg_5',
      conversationId: 'conv_2',
      senderId: 'system',
      senderType: 'system',
      content: 'Welcome to 1099Pass! Our support team is here to help.',
      contentType: 'system',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'read',
    },
    {
      id: 'msg_6',
      conversationId: 'conv_2',
      senderId: 'support_1',
      senderType: 'support',
      content: 'Your verification is complete! Let us know if you have any questions.',
      contentType: 'text',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      status: 'read',
    },
  ],
};

export const useMessagingStore = create<MessagingState>((set, get) => ({
  // Initial state
  conversations: [],
  messages: {},
  activeConversationId: null,
  connectionStatus: 'disconnected',
  isLoading: false,
  isLoadingMore: false,
  hasMoreMessages: {},
  error: null,
  totalUnreadCount: 0,
  ws: null,
  reconnectAttempts: 0,

  loadConversations: async () => {
    set({ isLoading: true, error: null });

    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        const totalUnread = MOCK_CONVERSATIONS.reduce((sum, c) => sum + c.unreadCount, 0);
        set({
          conversations: MOCK_CONVERSATIONS,
          totalUnreadCount: totalUnread,
          isLoading: false,
        });
        return;
      }

      const conversations = await api.get<Conversation[]>('/messaging/conversations');
      const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

      set({
        conversations,
        totalUnreadCount: totalUnread,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load conversations:', error);
      set({
        isLoading: false,
        error: 'Failed to load conversations',
      });
    }
  },

  loadMessages: async (conversationId: string, cursor?: string) => {
    const isLoadingMore = !!cursor;
    set(isLoadingMore ? { isLoadingMore: true } : { isLoading: true });

    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const mockMessages = MOCK_MESSAGES[conversationId] || [];

        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: mockMessages,
          },
          hasMoreMessages: {
            ...state.hasMoreMessages,
            [conversationId]: false,
          },
          isLoading: false,
          isLoadingMore: false,
        }));
        return;
      }

      const params = cursor ? `?cursor=${cursor}` : '';
      const response = await api.get<{ messages: Message[]; hasMore: boolean }>(
        `/messaging/conversations/${conversationId}/messages${params}`
      );

      set((state) => {
        const existingMessages = state.messages[conversationId] || [];
        const newMessages = cursor
          ? [...response.messages, ...existingMessages]
          : response.messages;

        return {
          messages: {
            ...state.messages,
            [conversationId]: newMessages,
          },
          hasMoreMessages: {
            ...state.hasMoreMessages,
            [conversationId]: response.hasMore,
          },
          isLoading: false,
          isLoadingMore: false,
        };
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
      set({
        isLoading: false,
        isLoadingMore: false,
        error: 'Failed to load messages',
      });
    }
  },

  sendMessage: async (conversationId, content, contentType = 'text', metadata) => {
    const optimisticId = `temp_${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      conversationId,
      senderId: 'user',
      senderType: 'borrower',
      content,
      contentType,
      reportId: metadata?.reportId,
      documentId: metadata?.documentId,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    // Optimistic update
    set((state) => {
      const existingMessages = state.messages[conversationId] || [];
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existingMessages, optimisticMessage],
        },
      };
    });

    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update the optimistic message to sent status
        set((state) => {
          const messages = state.messages[conversationId] || [];
          return {
            messages: {
              ...state.messages,
              [conversationId]: messages.map((m) =>
                m.id === optimisticId
                  ? { ...m, id: `msg_${Date.now()}`, status: 'sent' as const }
                  : m
              ),
            },
          };
        });

        // Update conversation's last message
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: content,
                  lastMessageAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }));
        return;
      }

      const response = await api.post<Message>(`/messaging/conversations/${conversationId}/messages`, {
        content,
        contentType,
        ...metadata,
      });

      // Replace optimistic message with real one
      set((state) => {
        const messages = state.messages[conversationId] || [];
        return {
          messages: {
            ...state.messages,
            [conversationId]: messages.map((m) =>
              m.id === optimisticId ? response : m
            ),
          },
        };
      });
    } catch (error) {
      console.error('Failed to send message:', error);

      // Mark message as failed
      set((state) => {
        const messages = state.messages[conversationId] || [];
        return {
          messages: {
            ...state.messages,
            [conversationId]: messages.map((m) =>
              m.id === optimisticId ? { ...m, status: 'failed' as const } : m
            ),
          },
          error: 'Failed to send message',
        };
      });
    }
  },

  shareReport: async (conversationId, reportId) => {
    await get().sendMessage(
      conversationId,
      `Shared income verification report`,
      'report_share',
      { reportId }
    );
  },

  markAsRead: async (conversationId) => {
    set((state) => {
      const conversation = state.conversations.find((c) => c.id === conversationId);
      const unreadDelta = conversation?.unreadCount || 0;

      return {
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        ),
        totalUnreadCount: Math.max(0, state.totalUnreadCount - unreadDelta),
      };
    });

    try {
      const isDev = process.env.NODE_ENV === 'development';
      if (!isDev) {
        await api.post(`/messaging/conversations/${conversationId}/read`);
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  setActiveConversation: (conversationId) => {
    set({ activeConversationId: conversationId });
    if (conversationId) {
      get().markAsRead(conversationId);
    }
  },

  connect: () => {
    const { ws, reconnectAttempts } = get();

    if (ws?.readyState === WebSocket.OPEN) {
      return;
    }

    set({ connectionStatus: reconnectAttempts > 0 ? 'reconnecting' : 'connecting' });

    const wsUrl = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3001/ws';

    try {
      const newWs = new WebSocket(wsUrl);

      newWs.onopen = () => {
        console.log('WebSocket connected');
        set({
          ws: newWs,
          connectionStatus: 'connected',
          reconnectAttempts: 0,
        });
      };

      newWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'new_message':
              get().handleIncomingMessage(data.message);
              break;
            case 'message_status':
              get().handleMessageStatus(data.messageId, data.status);
              break;
            case 'presence':
              get().handlePresenceUpdate(data.participantId, data.isOnline);
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      newWs.onclose = () => {
        console.log('WebSocket disconnected');
        set({ connectionStatus: 'disconnected', ws: null });

        // Attempt to reconnect
        const attempts = get().reconnectAttempts;
        if (attempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_DELAYS[attempts] || RECONNECT_DELAYS[RECONNECT_DELAYS.length - 1];
          set({ reconnectAttempts: attempts + 1 });
          setTimeout(() => get().connect(), delay);
        }
      };

      newWs.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      set({ ws: newWs });
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      set({ connectionStatus: 'disconnected' });
    }
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null, connectionStatus: 'disconnected', reconnectAttempts: MAX_RECONNECT_ATTEMPTS });
    }
  },

  handleIncomingMessage: (message) => {
    set((state) => {
      const existingMessages = state.messages[message.conversationId] || [];

      // Avoid duplicates
      if (existingMessages.some((m) => m.id === message.id)) {
        return state;
      }

      // Update conversations list
      const updatedConversations = state.conversations.map((c) => {
        if (c.id === message.conversationId) {
          const isActive = state.activeConversationId === message.conversationId;
          return {
            ...c,
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            updatedAt: message.createdAt,
            unreadCount: isActive ? c.unreadCount : c.unreadCount + 1,
          };
        }
        return c;
      });

      const isActive = state.activeConversationId === message.conversationId;
      const newUnreadTotal = isActive
        ? state.totalUnreadCount
        : state.totalUnreadCount + 1;

      return {
        messages: {
          ...state.messages,
          [message.conversationId]: [...existingMessages, message],
        },
        conversations: updatedConversations,
        totalUnreadCount: newUnreadTotal,
      };
    });
  },

  handleMessageStatus: (messageId, status) => {
    set((state) => {
      const newMessages: Record<string, Message[]> = {};

      for (const [convId, messages] of Object.entries(state.messages)) {
        newMessages[convId] = messages.map((m) =>
          m.id === messageId ? { ...m, status } : m
        );
      }

      return { messages: newMessages };
    });
  },

  handlePresenceUpdate: (participantId, isOnline) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.participantId === participantId ? { ...c, isOnline } : c
      ),
    }));
  },

  clearError: () => set({ error: null }),

  reset: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
    }

    set({
      conversations: [],
      messages: {},
      activeConversationId: null,
      connectionStatus: 'disconnected',
      isLoading: false,
      isLoadingMore: false,
      hasMoreMessages: {},
      error: null,
      totalUnreadCount: 0,
      ws: null,
      reconnectAttempts: 0,
    });
  },
}));

export default useMessagingStore;
