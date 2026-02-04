/**
 * Error Boundary Component
 * Catches unhandled errors and displays a friendly error screen
 */

import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, textStyles, borderRadius } from '../theme';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // TODO: Send to error reporting service (e.g., Sentry)
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  handleReportIssue = () => {
    // TODO: Open issue reporter or support chat
    console.log('Report issue clicked');
  };

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === 'development';

      return (
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Error icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="warning-outline" size={64} color={colors.error} />
            </View>

            {/* Error message */}
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              We apologize for the inconvenience. The app encountered an unexpected error.
            </Text>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={this.handleReset}
                accessibilityRole="button"
                accessibilityLabel="Try again"
              >
                <Ionicons name="refresh-outline" size={20} color={colors.textInverse} />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={this.handleReportIssue}
                accessibilityRole="button"
                accessibilityLabel="Report issue"
              >
                <Ionicons name="bug-outline" size={20} color={colors.primary} />
                <Text style={styles.secondaryButtonText}>Report Issue</Text>
              </TouchableOpacity>
            </View>

            {/* Dev-only: Show error details */}
            {isDev && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Error Details (Dev Only)</Text>
                <View style={styles.errorBox}>
                  <Text style={styles.errorName}>{this.state.error.name}</Text>
                  <Text style={styles.errorMessage}>{this.state.error.message}</Text>
                  {this.state.errorInfo?.componentStack && (
                    <Text style={styles.errorStack}>
                      {this.state.errorInfo.componentStack.slice(0, 500)}...
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Help text */}
            <View style={styles.helpText}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textTertiary} />
              <Text style={styles.helpTextContent}>
                If this problem persists, please contact support at support@1099pass.com
              </Text>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[8],
  },

  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.error}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },

  title: {
    ...textStyles.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },

  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing[8],
  },

  actions: {
    width: '100%',
    gap: spacing[3],
    marginBottom: spacing[8],
  },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.full,
    gap: spacing[2],
  },

  primaryButtonText: {
    ...textStyles.body,
    color: colors.textInverse,
    fontWeight: '600',
  },

  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: spacing[2],
  },

  secondaryButtonText: {
    ...textStyles.body,
    color: colors.primary,
    fontWeight: '600',
  },

  errorDetails: {
    width: '100%',
    marginBottom: spacing[6],
  },

  errorDetailsTitle: {
    ...textStyles.bodySmall,
    color: colors.textTertiary,
    fontWeight: '600',
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  errorBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },

  errorName: {
    ...textStyles.body,
    color: colors.error,
    fontWeight: '600',
    marginBottom: spacing[1],
  },

  errorMessage: {
    ...textStyles.bodySmall,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },

  errorStack: {
    ...textStyles.caption,
    color: colors.textTertiary,
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 14,
  },

  helpText: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing[4],
  },

  helpTextContent: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginLeft: spacing[2],
    flex: 1,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
