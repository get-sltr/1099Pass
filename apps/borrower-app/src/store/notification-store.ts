/**
 * Notification Store
 * Manages push notifications and in-app notifications
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from '../services/api';

// Types
export type NotificationType =
  | 'new_message'
  | 'report_viewed'
  | 'score_updated'
  | 'income_detected'
  | 'subscription_expiring'
  | 'document_verified'
  | 'lender_match'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  newMessages: boolean;
  reportViews: boolean;
  scoreUpdates: boolean;
  incomeAlerts: boolean;
  subscriptionReminders: boolean;
  marketingEmails: boolean;
}

interface NotificationState {
  // State
  notifications: AppNotification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  pushToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  // Push notification management
  registerPushToken: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  loadPreferences: () => Promise<void>;

  // Real-time handlers
  handlePushNotification: (notification: Notifications.Notification) => void;
  handleNotificationResponse: (response: Notifications.NotificationResponse) => void;

  // Utilities
  getUnreadNotifications: () => AppNotification[];
  clearError: () => void;
  reset: () => void;
}

const NOTIFICATIONS_KEY = '1099pass_notifications';
const PREFERENCES_KEY = '1099pass_notification_prefs';
const PUSH_TOKEN_KEY = '1099pass_push_token';

// Default preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  emailEnabled: true,
  newMessages: true,
  reportViews: true,
  scoreUpdates: true,
  incomeAlerts: true,
  subscriptionReminders: true,
  marketingEmails: false,
};

// Mock notifications for development
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    type: 'report_viewed',
    title: 'Report Viewed',
    body: 'Quick Mortgage Co. viewed your income verification report',
    data: { reportId: 'rpt_1', lenderId: 'lnd_1' },
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_2',
    type: 'new_message',
    title: 'New Message',
    body: 'You have a new message from Quick Mortgage Co.',
    data: { conversationId: 'conv_1' },
    read: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_3',
    type: 'score_updated',
    title: 'Score Updated',
    body: 'Your loan readiness score increased to 87!',
    data: { newScore: 87, previousScore: 82 },
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_4',
    type: 'income_detected',
    title: 'New Income Detected',
    body: '$1,250 from Uber has been added to your profile',
    data: { source: 'uber', amount: 1250 },
    read: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_5',
    type: 'lender_match',
    title: 'New Lender Match',
    body: 'Drive Finance matches your profile with a 88% score',
    data: { lenderId: 'lnd_2', matchScore: 88 },
    read: true,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  preferences: DEFAULT_PREFERENCES,
  pushToken: null,
  isLoading: false,
  error: null,

  loadNotifications: async () => {
    set({ isLoading: true, error: null });

    try {
      // Load from cache first
      const cached = await SecureStore.getItemAsync(NOTIFICATIONS_KEY);
      if (cached) {
        const notifications = JSON.parse(cached);
        const unreadCount = notifications.filter((n: AppNotification) => !n.read).length;
        set({ notifications, unreadCount });
      }

      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
        set({
          notifications: MOCK_NOTIFICATIONS,
          unreadCount,
          isLoading: false,
        });
        return;
      }

      const notifications = await api.get<AppNotification[]>('/notifications');
      const unreadCount = notifications.filter((n) => !n.read).length;

      set({ notifications, unreadCount, isLoading: false });

      // Update cache
      await SecureStore.setItemAsync(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to load notifications:', error);
      set({
        isLoading: false,
        error: 'Failed to load notifications',
      });
    }
  },

  markAsRead: async (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    try {
      const isDev = process.env.NODE_ENV === 'development';
      if (!isDev) {
        await api.post(`/notifications/${notificationId}/read`);
      }

      // Update cache
      const { notifications } = get();
      await SecureStore.setItemAsync(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));

    try {
      const isDev = process.env.NODE_ENV === 'development';
      if (!isDev) {
        await api.post('/notifications/read-all');
      }

      // Update cache
      const { notifications } = get();
      await SecureStore.setItemAsync(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  deleteNotification: async (notificationId) => {
    const notification = get().notifications.find((n) => n.id === notificationId);

    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== notificationId),
      unreadCount: notification && !notification.read
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount,
    }));

    try {
      const isDev = process.env.NODE_ENV === 'development';
      if (!isDev) {
        await api.delete(`/notifications/${notificationId}`);
      }

      // Update cache
      const { notifications } = get();
      await SecureStore.setItemAsync(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  },

  clearAllNotifications: async () => {
    set({ notifications: [], unreadCount: 0 });

    try {
      const isDev = process.env.NODE_ENV === 'development';
      if (!isDev) {
        await api.delete('/notifications/all');
      }

      await SecureStore.deleteItemAsync(NOTIFICATIONS_KEY);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  },

  registerPushToken: async () => {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      const pushToken = tokenData.data;
      set({ pushToken });

      // Store locally
      await SecureStore.setItemAsync(PUSH_TOKEN_KEY, pushToken);

      // Register with backend
      const isDev = process.env.NODE_ENV === 'development';
      if (!isDev) {
        await api.post('/notifications/register-device', {
          token: pushToken,
          platform: Platform.OS,
        });
      }

      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  },

  updatePreferences: async (prefs) => {
    const newPreferences = { ...get().preferences, ...prefs };
    set({ preferences: newPreferences });

    try {
      await SecureStore.setItemAsync(PREFERENCES_KEY, JSON.stringify(newPreferences));

      const isDev = process.env.NODE_ENV === 'development';
      if (!isDev) {
        await api.put('/notifications/preferences', newPreferences);
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  },

  loadPreferences: async () => {
    try {
      const stored = await SecureStore.getItemAsync(PREFERENCES_KEY);
      if (stored) {
        set({ preferences: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  },

  handlePushNotification: (notification) => {
    const { title, body, data } = notification.request.content;

    const newNotification: AppNotification = {
      id: `notif_${Date.now()}`,
      type: (data?.type as NotificationType) || 'system',
      title: title || '',
      body: body || '',
      data: data as Record<string, any>,
      read: false,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  handleNotificationResponse: (response) => {
    const { data } = response.notification.request.content;

    // Handle deep linking based on notification type
    const type = data?.type as NotificationType;

    switch (type) {
      case 'new_message':
        // Navigate to chat screen
        // router.push({ pathname: '/(tabs)/chat', params: { conversationId: data?.conversationId } });
        break;
      case 'report_viewed':
        // Navigate to report details
        // router.push({ pathname: '/(tabs)/reports', params: { reportId: data?.reportId } });
        break;
      case 'lender_match':
        // Navigate to lender details
        // router.push({ pathname: '/(tabs)/lenders', params: { lenderId: data?.lenderId } });
        break;
      default:
        // Navigate to notifications or dashboard
        break;
    }
  },

  getUnreadNotifications: () => {
    return get().notifications.filter((n) => !n.read);
  },

  clearError: () => set({ error: null }),

  reset: () => {
    set({
      notifications: [],
      unreadCount: 0,
      preferences: DEFAULT_PREFERENCES,
      pushToken: null,
      isLoading: false,
      error: null,
    });
    SecureStore.deleteItemAsync(NOTIFICATIONS_KEY);
    SecureStore.deleteItemAsync(PREFERENCES_KEY);
    SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
  },
}));

export default useNotificationStore;
