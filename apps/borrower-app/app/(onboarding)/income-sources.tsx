/**
 * Income Sources Screen
 * Configure and categorize income sources
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
import { Button, Card, Input, Badge, Modal, useToast } from '../../src/components/ui';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';

type IncomeCategory = 'rideshare' | 'delivery' | 'freelance' | 'rental' | 'retail' | 'other';

interface IncomeSource {
  id: string;
  name: string;
  category: IncomeCategory;
  estimatedMonthly: number;
  isVerified: boolean;
}

const INCOME_CATEGORIES: { category: IncomeCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { category: 'rideshare', label: 'Rideshare', icon: 'car-outline' },
  { category: 'delivery', label: 'Delivery', icon: 'bicycle-outline' },
  { category: 'freelance', label: 'Freelance', icon: 'laptop-outline' },
  { category: 'rental', label: 'Rental', icon: 'home-outline' },
  { category: 'retail', label: 'Retail/Resale', icon: 'pricetag-outline' },
  { category: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export default function IncomeSourcesScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([
    // Mock data from connected accounts
    {
      id: 'uber_1',
      name: 'Uber',
      category: 'rideshare',
      estimatedMonthly: 2400,
      isVerified: true,
    },
    {
      id: 'doordash_1',
      name: 'DoorDash',
      category: 'delivery',
      estimatedMonthly: 1200,
      isVerified: true,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    category: null as IncomeCategory | null,
    estimatedMonthly: '',
  });
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);

  const totalMonthlyIncome = incomeSources.reduce((sum, source) => sum + source.estimatedMonthly, 0);
  const verifiedSources = incomeSources.filter((s) => s.isVerified).length;

  const handleAddSource = () => {
    if (!newSource.name.trim() || !newSource.category || !newSource.estimatedMonthly) {
      showToast({
        type: 'error',
        title: 'Missing information',
        message: 'Please fill in all fields',
      });
      return;
    }

    const source: IncomeSource = {
      id: `manual_${Date.now()}`,
      name: newSource.name.trim(),
      category: newSource.category,
      estimatedMonthly: parseFloat(newSource.estimatedMonthly) || 0,
      isVerified: false,
    };

    setIncomeSources((prev) => [...prev, source]);
    setShowAddModal(false);
    setNewSource({ name: '', category: null, estimatedMonthly: '' });

    showToast({
      type: 'success',
      title: 'Income source added',
      message: 'You can verify this later by connecting the platform',
    });
  };

  const handleUpdateSource = () => {
    if (!editingSource) return;

    setIncomeSources((prev) =>
      prev.map((s) =>
        s.id === editingSource.id ? editingSource : s
      )
    );
    setEditingSource(null);

    showToast({
      type: 'success',
      title: 'Income source updated',
    });
  };

  const handleRemoveSource = (sourceId: string) => {
    setIncomeSources((prev) => prev.filter((s) => s.id !== sourceId));
    showToast({
      type: 'info',
      title: 'Income source removed',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category: IncomeCategory): keyof typeof Ionicons.glyphMap => {
    return INCOME_CATEGORIES.find((c) => c.category === category)?.icon || 'cash-outline';
  };

  const getCategoryLabel = (category: IncomeCategory): string => {
    return INCOME_CATEGORIES.find((c) => c.category === category)?.label || 'Other';
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.stepLabel}>Step 2 of 3</Text>
          <Text style={styles.title}>Your Income Sources</Text>
          <Text style={styles.subtitle}>
            Review and add all your income sources. The more complete, the better your score.
          </Text>
        </View>

        {/* Summary card */}
        <Card variant="mint" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Monthly</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalMonthlyIncome)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Verified</Text>
              <Text style={styles.summaryValue}>
                {verifiedSources}/{incomeSources.length}
              </Text>
            </View>
          </View>
        </Card>

        {/* Income sources list */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Income Sources</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {incomeSources.map((source) => (
            <Card key={source.id} variant="outlined" style={styles.sourceCard}>
              <TouchableOpacity
                style={styles.sourceContent}
                onPress={() => setEditingSource(source)}
              >
                <View style={styles.sourceIcon}>
                  <Ionicons
                    name={getCategoryIcon(source.category)}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.sourceInfo}>
                  <View style={styles.sourceNameRow}>
                    <Text style={styles.sourceName}>{source.name}</Text>
                    {source.isVerified && (
                      <Badge variant="success" size="small">Verified</Badge>
                    )}
                  </View>
                  <Text style={styles.sourceCategory}>
                    {getCategoryLabel(source.category)}
                  </Text>
                </View>
                <View style={styles.sourceAmount}>
                  <Text style={styles.amountValue}>
                    {formatCurrency(source.estimatedMonthly)}
                  </Text>
                  <Text style={styles.amountLabel}>/month</Text>
                </View>
              </TouchableOpacity>
            </Card>
          ))}

          {incomeSources.length === 0 && (
            <Card variant="outlined" style={styles.emptyCard}>
              <Ionicons name="wallet-outline" size={40} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No income sources yet</Text>
              <Text style={styles.emptySubtext}>
                Add your income sources to build your profile
              </Text>
            </Card>
          )}
        </View>

        {/* Tips */}
        <Card variant="default" style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for a stronger profile</Text>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.tipText}>Add all your active income sources</Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.tipText}>Connect platforms for automatic verification</Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.tipText}>Keep estimates accurate and conservative</Text>
          </View>
        </Card>

        {/* Continue button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
            onPress={() => router.push('/(onboarding)/profile-complete')}
            variant="primary"
            size="large"
            fullWidth
            disabled={incomeSources.length === 0}
          />
        </View>
      </ScrollView>

      {/* Add income modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Income Source"
      >
        <View style={styles.modalContent}>
          <Input
            label="Source Name"
            placeholder="e.g., Etsy, Consulting, Airbnb"
            value={newSource.name}
            onChangeText={(v) => setNewSource((prev) => ({ ...prev, name: v }))}
          />

          <Text style={styles.modalLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {INCOME_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.category}
                style={[
                  styles.categoryChip,
                  newSource.category === cat.category && styles.categoryChipSelected,
                ]}
                onPress={() => setNewSource((prev) => ({ ...prev, category: cat.category }))}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={newSource.category === cat.category ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    newSource.category === cat.category && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Estimated Monthly Income"
            placeholder="0"
            value={newSource.estimatedMonthly}
            onChangeText={(v) => setNewSource((prev) => ({ ...prev, estimatedMonthly: v.replace(/[^0-9.]/g, '') }))}
            keyboardType="numeric"
            leftIcon="cash-outline"
          />

          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              onPress={() => setShowAddModal(false)}
              variant="ghost"
              size="medium"
              style={styles.modalButton}
            />
            <Button
              title="Add Source"
              onPress={handleAddSource}
              variant="primary"
              size="medium"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Edit income modal */}
      <Modal
        visible={!!editingSource}
        onClose={() => setEditingSource(null)}
        title="Edit Income Source"
      >
        {editingSource && (
          <View style={styles.modalContent}>
            <Input
              label="Source Name"
              value={editingSource.name}
              onChangeText={(v) => setEditingSource((prev) => prev ? { ...prev, name: v } : null)}
            />

            <Input
              label="Estimated Monthly Income"
              value={editingSource.estimatedMonthly.toString()}
              onChangeText={(v) =>
                setEditingSource((prev) =>
                  prev ? { ...prev, estimatedMonthly: parseFloat(v) || 0 } : null
                )
              }
              keyboardType="numeric"
              leftIcon="cash-outline"
            />

            {editingSource.isVerified && (
              <View style={styles.verifiedNote}>
                <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                <Text style={styles.verifiedNoteText}>
                  This source is verified through a connected account
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <Button
                title="Remove"
                onPress={() => {
                  handleRemoveSource(editingSource.id);
                  setEditingSource(null);
                }}
                variant="danger"
                size="medium"
                style={styles.modalButton}
              />
              <Button
                title="Save"
                onPress={handleUpdateSource}
                variant="primary"
                size="medium"
                style={styles.modalButton}
              />
            </View>
          </View>
        )}
      </Modal>
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
    paddingHorizontal: spacing[6],
  },

  header: {
    marginBottom: spacing[6],
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing[2],
    marginBottom: spacing[2],
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

  summaryCard: {
    marginBottom: spacing[6],
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },

  summaryValue: {
    ...textStyles.h3,
    color: colors.textPrimary,
  },

  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing[4],
  },

  section: {
    marginBottom: spacing[6],
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },

  sectionTitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
  },

  addButtonText: {
    ...textStyles.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing[1],
  },

  sourceCard: {
    marginBottom: spacing[2],
  },

  sourceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  sourceInfo: {
    flex: 1,
  },

  sourceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },

  sourceName: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  sourceCategory: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[0.5],
  },

  sourceAmount: {
    alignItems: 'flex-end',
  },

  amountValue: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  amountLabel: {
    ...textStyles.caption,
    color: colors.textTertiary,
  },

  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },

  emptyText: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginTop: spacing[3],
  },

  emptySubtext: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[1],
  },

  tipsCard: {
    marginBottom: spacing[6],
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

  buttonContainer: {
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },

  modalContent: {
    paddingTop: spacing[2],
  },

  modalLabel: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing[2],
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },

  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  categoryChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.mintSoft,
  },

  categoryChipText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginLeft: spacing[1],
  },

  categoryChipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },

  modalButton: {
    flex: 1,
  },

  verifiedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mintSoft,
    padding: spacing[3],
    borderRadius: borderRadius.md,
    marginTop: spacing[2],
  },

  verifiedNoteText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginLeft: spacing[2],
    flex: 1,
  },
});
