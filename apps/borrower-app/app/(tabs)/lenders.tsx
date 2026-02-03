/**
 * Lenders Screen
 * Browse and connect with lenders who work with gig workers
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button, Input, useToast } from '../../src/components/ui';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';

type LenderCategory = 'mortgage' | 'auto' | 'personal' | 'business';

interface Lender {
  id: string;
  name: string;
  category: LenderCategory;
  description: string;
  minScore: number;
  rating: number;
  reviewCount: number;
  features: string[];
  isPartner: boolean;
}

const MOCK_LENDERS: Lender[] = [
  {
    id: '1',
    name: 'Quick Mortgage Co.',
    category: 'mortgage',
    description: 'Specializing in self-employed and gig worker home loans',
    minScore: 600,
    rating: 4.8,
    reviewCount: 234,
    features: ['No W-2 required', 'Fast approval', '1099 friendly'],
    isPartner: true,
  },
  {
    id: '2',
    name: 'Drive Finance',
    category: 'auto',
    description: 'Auto loans designed for rideshare and delivery drivers',
    minScore: 550,
    rating: 4.5,
    reviewCount: 156,
    features: ['Vehicle for work', 'Flexible terms', 'Same-day approval'],
    isPartner: true,
  },
  {
    id: '3',
    name: 'Freelancer Credit Union',
    category: 'personal',
    description: 'Personal loans and lines of credit for independent workers',
    minScore: 580,
    rating: 4.6,
    reviewCount: 89,
    features: ['Low rates', 'No prepayment penalty', 'Income flexibility'],
    isPartner: false,
  },
  {
    id: '4',
    name: 'Gig Business Loans',
    category: 'business',
    description: 'Small business loans for gig economy entrepreneurs',
    minScore: 620,
    rating: 4.3,
    reviewCount: 67,
    features: ['Equipment financing', 'Working capital', 'Quick funding'],
    isPartner: true,
  },
  {
    id: '5',
    name: 'Self-Employed Mortgages',
    category: 'mortgage',
    description: 'Home loans that understand variable income',
    minScore: 640,
    rating: 4.7,
    reviewCount: 198,
    features: ['Bank statement loans', 'Asset-based lending', 'Jumbo loans'],
    isPartner: false,
  },
];

const CATEGORIES: { value: LenderCategory | 'all'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'all', label: 'All', icon: 'apps-outline' },
  { value: 'mortgage', label: 'Mortgage', icon: 'home-outline' },
  { value: 'auto', label: 'Auto', icon: 'car-outline' },
  { value: 'personal', label: 'Personal', icon: 'person-outline' },
  { value: 'business', label: 'Business', icon: 'briefcase-outline' },
];

export default function LendersScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LenderCategory | 'all'>('all');
  const userScore = 682; // Mock user score

  const filteredLenders = MOCK_LENDERS.filter((lender) => {
    const matchesCategory = selectedCategory === 'all' || lender.category === selectedCategory;
    const matchesSearch = lender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lender.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: LenderCategory): keyof typeof Ionicons.glyphMap => {
    return CATEGORIES.find((c) => c.value === category)?.icon || 'ellipse-outline';
  };

  const handleContactLender = (lender: Lender) => {
    if (userScore < lender.minScore) {
      showToast({
        type: 'warning',
        title: 'Score too low',
        message: `You need a score of ${lender.minScore}+ to apply with ${lender.name}`,
      });
      return;
    }

    showToast({
      type: 'success',
      title: 'Request sent',
      message: `${lender.name} will contact you within 24 hours`,
    });
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < fullStars ? 'star' : i === fullStars && hasHalfStar ? 'star-half' : 'star-outline'}
            size={14}
            color={colors.secondary}
          />
        ))}
      </View>
    );
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
          <Text style={styles.title}>Find Lenders</Text>
          <Text style={styles.subtitle}>
            Lenders who understand gig worker income
          </Text>
        </View>

        {/* Search */}
        <Input
          placeholder="Search lenders..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search-outline"
          style={styles.searchInput}
        />

        {/* Category filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryChip,
                selectedCategory === cat.value && styles.categoryChipSelected,
              ]}
              onPress={() => setSelectedCategory(cat.value)}
            >
              <Ionicons
                name={cat.icon}
                size={16}
                color={selectedCategory === cat.value ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat.value && styles.categoryChipTextSelected,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Your score card */}
        <Card variant="mint" style={styles.scoreCard}>
          <View style={styles.scoreCardContent}>
            <View>
              <Text style={styles.scoreCardLabel}>Your Score</Text>
              <Text style={styles.scoreCardValue}>{userScore}</Text>
            </View>
            <View style={styles.scoreCardInfo}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.scoreCardInfoText}>
                Eligible for {filteredLenders.filter((l) => l.minScore <= userScore).length} lenders
              </Text>
            </View>
          </View>
        </Card>

        {/* Lenders list */}
        <View style={styles.lendersSection}>
          <Text style={styles.sectionTitle}>
            {filteredLenders.length} Lender{filteredLenders.length !== 1 ? 's' : ''} Found
          </Text>

          {filteredLenders.map((lender) => {
            const isEligible = userScore >= lender.minScore;

            return (
              <Card
                key={lender.id}
                variant="outlined"
                style={[styles.lenderCard, !isEligible && styles.lenderCardIneligible]}
              >
                <View style={styles.lenderHeader}>
                  <View style={styles.lenderIcon}>
                    <Ionicons name={getCategoryIcon(lender.category)} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.lenderInfo}>
                    <View style={styles.lenderNameRow}>
                      <Text style={styles.lenderName}>{lender.name}</Text>
                      {lender.isPartner && (
                        <Badge variant="primary" size="small">Partner</Badge>
                      )}
                    </View>
                    <View style={styles.lenderRating}>
                      {renderStars(lender.rating)}
                      <Text style={styles.ratingText}>
                        {lender.rating} ({lender.reviewCount})
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.lenderDescription}>{lender.description}</Text>

                <View style={styles.lenderFeatures}>
                  {lender.features.map((feature, index) => (
                    <View key={index} style={styles.featureTag}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.lenderFooter}>
                  <View style={styles.minScoreContainer}>
                    <Text style={styles.minScoreLabel}>Min Score:</Text>
                    <Text
                      style={[
                        styles.minScoreValue,
                        { color: isEligible ? colors.success : colors.error },
                      ]}
                    >
                      {lender.minScore}
                    </Text>
                    {isEligible ? (
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    ) : (
                      <Ionicons name="close-circle" size={16} color={colors.error} />
                    )}
                  </View>

                  <Button
                    title={isEligible ? 'Contact' : 'Not Eligible'}
                    onPress={() => handleContactLender(lender)}
                    variant={isEligible ? 'primary' : 'ghost'}
                    size="small"
                    disabled={!isEligible}
                  />
                </View>
              </Card>
            );
          })}

          {filteredLenders.length === 0 && (
            <Card variant="outlined" style={styles.emptyCard}>
              <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No lenders found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filters
              </Text>
            </Card>
          )}
        </View>

        {/* Info banner */}
        <Card variant="default" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.infoTitle}>How it works</Text>
          </View>
          <Text style={styles.infoText}>
            When you contact a lender, we share your verified income report with them.
            They'll review your profile and reach out within 24 hours.
          </Text>
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
    paddingHorizontal: spacing[2],
    marginBottom: spacing[4],
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

  searchInput: {
    marginBottom: spacing[4],
  },

  categoriesScroll: {
    marginHorizontal: -spacing[4],
    marginBottom: spacing[4],
  },

  categoriesContent: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
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
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing[1],
  },

  categoryChipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  scoreCard: {
    marginBottom: spacing[6],
  },

  scoreCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  scoreCardLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },

  scoreCardValue: {
    ...textStyles.h2,
    color: colors.textPrimary,
  },

  scoreCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  scoreCardInfoText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing[1],
  },

  lendersSection: {
    marginBottom: spacing[6],
  },

  sectionTitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing[3],
    paddingHorizontal: spacing[2],
  },

  lenderCard: {
    marginBottom: spacing[3],
  },

  lenderCardIneligible: {
    opacity: 0.7,
  },

  lenderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },

  lenderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  lenderInfo: {
    flex: 1,
  },

  lenderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },

  lenderName: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  lenderRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  starsContainer: {
    flexDirection: 'row',
    marginRight: spacing[2],
  },

  ratingText: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },

  lenderDescription: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing[3],
  },

  lenderFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },

  featureTag: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
  },

  featureText: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },

  lenderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing[3],
  },

  minScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  minScoreLabel: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginRight: spacing[1],
  },

  minScoreValue: {
    ...textStyles.bodySmall,
    fontWeight: '600',
    marginRight: spacing[1],
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
  },

  infoCard: {
    marginBottom: spacing[4],
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },

  infoTitle: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginLeft: spacing[2],
  },

  infoText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
