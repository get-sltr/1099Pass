/**
 * Connect Accounts Screen
 * Plaid integration for linking bank and gig platform accounts
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Badge, useToast } from '../../src/components/ui';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';

type AccountStatus = 'connected' | 'pending' | 'error' | 'not_connected';

interface ConnectedAccount {
  id: string;
  name: string;
  type: 'bank' | 'gig_platform';
  icon: keyof typeof Ionicons.glyphMap;
  status: AccountStatus;
  lastSync?: string;
}

// Popular platforms to connect
const SUGGESTED_PLATFORMS = [
  { id: 'uber', name: 'Uber', icon: 'car-outline' as const, type: 'gig_platform' as const },
  { id: 'lyft', name: 'Lyft', icon: 'car-sport-outline' as const, type: 'gig_platform' as const },
  { id: 'doordash', name: 'DoorDash', icon: 'fast-food-outline' as const, type: 'gig_platform' as const },
  { id: 'instacart', name: 'Instacart', icon: 'cart-outline' as const, type: 'gig_platform' as const },
  { id: 'amazon_flex', name: 'Amazon Flex', icon: 'cube-outline' as const, type: 'gig_platform' as const },
  { id: 'grubhub', name: 'Grubhub', icon: 'restaurant-outline' as const, type: 'gig_platform' as const },
];

export default function ConnectAccountsScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleConnectBank = async () => {
    setIsConnecting(true);

    try {
      // TODO: Initialize Plaid Link
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock connected bank
      const newAccount: ConnectedAccount = {
        id: `bank_${Date.now()}`,
        name: 'Chase Checking ••••4521',
        type: 'bank',
        icon: 'card-outline',
        status: 'connected',
        lastSync: 'Just now',
      };

      setConnectedAccounts((prev) => [...prev, newAccount]);

      showToast({
        type: 'success',
        title: 'Bank connected!',
        message: 'Your bank account has been linked successfully',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Connection failed',
        message: 'Unable to connect your bank. Please try again.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectPlatform = async (platform: typeof SUGGESTED_PLATFORMS[0]) => {
    setIsConnecting(true);

    try {
      // TODO: Initialize platform OAuth
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newAccount: ConnectedAccount = {
        id: platform.id,
        name: platform.name,
        type: 'gig_platform',
        icon: platform.icon,
        status: 'connected',
        lastSync: 'Just now',
      };

      setConnectedAccounts((prev) => [...prev, newAccount]);

      showToast({
        type: 'success',
        title: `${platform.name} connected!`,
        message: 'We\'re now syncing your earnings data',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Connection failed',
        message: `Unable to connect ${platform.name}. Please try again.`,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRemoveAccount = (accountId: string) => {
    setConnectedAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
    showToast({
      type: 'info',
      title: 'Account removed',
      message: 'The account has been disconnected',
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Refresh account sync status
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success">Connected</Badge>;
      case 'pending':
        return <Badge variant="warning">Syncing</Badge>;
      case 'error':
        return <Badge variant="error">Error</Badge>;
      default:
        return null;
    }
  };

  const connectedPlatformIds = connectedAccounts
    .filter((acc) => acc.type === 'gig_platform')
    .map((acc) => acc.id);

  const availablePlatforms = SUGGESTED_PLATFORMS.filter(
    (p) => !connectedPlatformIds.includes(p.id)
  );

  const hasConnectedAccounts = connectedAccounts.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[4] },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 1 of 3</Text>
        <Text style={styles.title}>Connect Your Accounts</Text>
        <Text style={styles.subtitle}>
          Link your bank and gig platform accounts to automatically track your income
        </Text>
      </View>

      {/* Connected accounts */}
      {hasConnectedAccounts && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Accounts</Text>
          {connectedAccounts.map((account) => (
            <Card key={account.id} variant="outlined" style={styles.accountCard}>
              <View style={styles.accountRow}>
                <View style={[styles.accountIcon, account.type === 'bank' && styles.bankIcon]}>
                  <Ionicons
                    name={account.icon}
                    size={20}
                    color={account.type === 'bank' ? colors.secondary : colors.primary}
                  />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  {account.lastSync && (
                    <Text style={styles.accountSync}>Last sync: {account.lastSync}</Text>
                  )}
                </View>
                {getStatusBadge(account.status)}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveAccount(account.id)}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Connect bank */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {connectedAccounts.some((a) => a.type === 'bank')
            ? 'Add Another Bank'
            : 'Connect Your Bank'}
        </Text>
        <Card variant="default" style={styles.connectCard} onPress={handleConnectBank}>
          <View style={styles.connectCardContent}>
            <View style={styles.connectIconContainer}>
              <Ionicons name="business-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.connectInfo}>
              <Text style={styles.connectTitle}>Link Bank Account</Text>
              <Text style={styles.connectSubtitle}>
                Securely connect via Plaid to verify deposits
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
          </View>
        </Card>
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
          <Text style={styles.securityText}>
            Your data is encrypted and secure. We never store your login credentials.
          </Text>
        </View>
      </View>

      {/* Connect gig platforms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gig Platforms</Text>
        <Text style={styles.sectionSubtitle}>
          Connect your earning platforms to import income automatically
        </Text>

        <View style={styles.platformGrid}>
          {availablePlatforms.map((platform) => (
            <TouchableOpacity
              key={platform.id}
              style={styles.platformCard}
              onPress={() => handleConnectPlatform(platform)}
              disabled={isConnecting}
            >
              <View style={styles.platformIcon}>
                <Ionicons name={platform.icon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.platformName}>{platform.name}</Text>
              <View style={styles.connectBadge}>
                <Ionicons name="add" size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          ))}

          {/* Other platform option */}
          <TouchableOpacity
            style={[styles.platformCard, styles.otherPlatform]}
            onPress={() => {
              showToast({
                type: 'info',
                title: 'More platforms coming soon',
                message: 'We\'re adding more platforms regularly',
              });
            }}
          >
            <View style={[styles.platformIcon, styles.otherIcon]}>
              <Ionicons name="add-circle-outline" size={24} color={colors.textSecondary} />
            </View>
            <Text style={[styles.platformName, styles.otherText]}>Other</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Manual entry option */}
      <Card variant="mint" style={styles.manualCard}>
        <View style={styles.manualContent}>
          <Ionicons name="document-text-outline" size={24} color={colors.primary} />
          <View style={styles.manualInfo}>
            <Text style={styles.manualTitle}>Upload Documents Manually</Text>
            <Text style={styles.manualSubtitle}>
              Can't connect? Upload tax returns or 1099s instead
            </Text>
          </View>
        </View>
        <Button
          title="Upload"
          onPress={() => router.push('/(tabs)/documents')}
          variant="ghost"
          size="small"
        />
      </Card>

      {/* Continue button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={() => router.push('/(onboarding)/income-sources')}
          variant="primary"
          size="large"
          fullWidth
          disabled={!hasConnectedAccounts}
        />
        {!hasConnectedAccounts && (
          <TouchableOpacity
            style={styles.skipLink}
            onPress={() => router.push('/(onboarding)/income-sources')}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing[6],
  },

  header: {
    marginBottom: spacing[6],
  },

  stepLabel: {
    ...textStyles.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing[2],
  },

  title: {
    ...textStyles.h2,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },

  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
  },

  section: {
    marginBottom: spacing[6],
  },

  sectionTitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  sectionSubtitle: {
    ...textStyles.bodySmall,
    color: colors.textTertiary,
    marginTop: -spacing[2],
    marginBottom: spacing[4],
  },

  accountCard: {
    marginBottom: spacing[2],
  },

  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  bankIcon: {
    backgroundColor: colors.amberSoft,
  },

  accountInfo: {
    flex: 1,
  },

  accountName: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  accountSync: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[0.5],
  },

  removeButton: {
    padding: spacing[2],
    marginLeft: spacing[2],
  },

  connectCard: {
    marginBottom: spacing[2],
  },

  connectCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  connectIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  connectInfo: {
    flex: 1,
  },

  connectTitle: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  connectSubtitle: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing[0.5],
  },

  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
  },

  securityText: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginLeft: spacing[2],
    flex: 1,
  },

  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing[1.5],
  },

  platformCard: {
    width: '31%',
    marginHorizontal: '1.16%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[3],
    alignItems: 'center',
    marginBottom: spacing[3],
    position: 'relative',
  },

  platformIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },

  platformName: {
    ...textStyles.caption,
    color: colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
  },

  connectBadge: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  otherPlatform: {
    borderStyle: 'dashed',
  },

  otherIcon: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },

  otherText: {
    color: colors.textSecondary,
  },

  manualCard: {
    marginBottom: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  manualContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  manualInfo: {
    marginLeft: spacing[3],
    flex: 1,
  },

  manualTitle: {
    ...textStyles.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  manualSubtitle: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing[0.5],
  },

  buttonContainer: {
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },

  skipLink: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },

  skipText: {
    ...textStyles.body,
    color: colors.primary,
    fontWeight: '500',
  },
});
