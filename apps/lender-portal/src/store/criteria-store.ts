import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LendingCriteria {
  // Score requirements
  minScore: number;

  // Income requirements
  minIncome: number;
  maxIncome: number;

  // Loan types
  loanTypes: string[];

  // Accepted income sources
  acceptedIncomeSources: string[];

  // Geographic coverage
  targetStates: string[];

  // Stability requirements
  minYearsActive: number;
  minIncomeSources: number;

  // Verification
  verifiedOnly: boolean;

  // Legacy fields for compatibility
  mortgageEnabled: boolean;
  autoEnabled: boolean;
  minAnnualIncome: number;
  minLoanScore: number;
  maxDTIRatio: number;
  minAccountHistory: number;
  acceptedSources: string[];
  coveredStates: string[];
  minIncomeDiversity: number;
  incomeTrendPreference: 'growing' | 'stable_or_growing' | 'any';
}

interface CriteriaState {
  criteria: LendingCriteria;
  matchingCount: number | null;
  isLoading: boolean;
  lastUpdated: string | null;

  // Actions
  setCriteria: (criteria: Partial<LendingCriteria>) => void;
  updateCriteria: (criteria: Partial<LendingCriteria>) => void;
  resetCriteria: () => void;
  fetchMatchingCount: () => Promise<void>;
}

const defaultCriteria: LendingCriteria = {
  // New fields
  minScore: 60,
  minIncome: 30000,
  maxIncome: 200000,
  loanTypes: ['mortgage', 'auto'],
  acceptedIncomeSources: [
    'Uber', 'Lyft', 'DoorDash', 'Instacart', 'Grubhub',
    'Amazon Flex', 'Upwork', 'Fiverr', 'Freelance', 'Etsy'
  ],
  targetStates: [],
  minYearsActive: 1,
  minIncomeSources: 1,
  verifiedOnly: false,

  // Legacy fields
  mortgageEnabled: true,
  autoEnabled: false,
  minAnnualIncome: 30000,
  minLoanScore: 50,
  maxDTIRatio: 0.43,
  minAccountHistory: 6,
  acceptedSources: [
    'uber', 'lyft', 'doordash', 'instacart', 'grubhub',
    'amazon_flex', 'upwork', 'fiverr', 'freelance', 'etsy'
  ],
  coveredStates: [],
  minIncomeDiversity: 1,
  incomeTrendPreference: 'any',
};

export const useCriteriaStore = create<CriteriaState>()(
  persist(
    (set, get) => ({
      criteria: defaultCriteria,
      matchingCount: null,
      isLoading: false,
      lastUpdated: null,

      setCriteria: (newCriteria) => {
        set((state) => ({
          criteria: { ...state.criteria, ...newCriteria },
          lastUpdated: new Date().toISOString(),
        }));
      },

      updateCriteria: (newCriteria) => {
        set((state) => ({
          criteria: { ...state.criteria, ...newCriteria },
          lastUpdated: new Date().toISOString(),
        }));
      },

      resetCriteria: () => {
        set({
          criteria: defaultCriteria,
          matchingCount: null,
          lastUpdated: null,
        });
      },

      fetchMatchingCount: async () => {
        set({ isLoading: true });

        try {
          // TODO: Replace with actual API call
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Mock count based on criteria strictness
          const { criteria } = get();
          let count = 1000;

          if (criteria.minScore > 70) count -= 400;
          if (criteria.minIncome > 50000) count -= 300;
          if (criteria.targetStates.length > 0 && criteria.targetStates.length < 10) {
            count -= 200;
          }

          set({ matchingCount: Math.max(count, 50), isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'lender-criteria',
    }
  )
);

// Income source options
export const INCOME_SOURCE_OPTIONS = [
  { value: 'uber', label: 'Uber' },
  { value: 'lyft', label: 'Lyft' },
  { value: 'doordash', label: 'DoorDash' },
  { value: 'instacart', label: 'Instacart' },
  { value: 'grubhub', label: 'Grubhub' },
  { value: 'amazon_flex', label: 'Amazon Flex' },
  { value: 'upwork', label: 'Upwork' },
  { value: 'fiverr', label: 'Fiverr' },
  { value: 'freelance', label: 'Freelance/Consulting' },
  { value: 'etsy', label: 'Etsy' },
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'taskrabbit', label: 'TaskRabbit' },
  { value: 'shipt', label: 'Shipt' },
  { value: 'postmates', label: 'Postmates' },
  { value: 'other', label: 'Other Gig Income' },
];

// Alias exports for backward compatibility
export const incomeSourceOptions = INCOME_SOURCE_OPTIONS;

// US States
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

// Alias export for backward compatibility
export const usStates = US_STATES;
