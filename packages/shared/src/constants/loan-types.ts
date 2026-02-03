/** Loan type definition */
export interface LoanType {
  id: string;
  name: string;
  description: string;
  typical_requirements: string[];
}

/** All supported loan types */
export const LOAN_TYPES: readonly LoanType[] = [
  {
    id: 'CONVENTIONAL_MORTGAGE',
    name: 'Conventional Mortgage',
    description: 'Standard home loan not insured by the federal government.',
    typical_requirements: ['Credit score 620+', 'DTI below 43%', 'Down payment 3-20%', '2 years income history'],
  },
  {
    id: 'FHA_MORTGAGE',
    name: 'FHA Mortgage',
    description: 'Federal Housing Administration insured loan with flexible requirements.',
    typical_requirements: ['Credit score 580+', 'DTI below 50%', 'Down payment 3.5%+', 'Steady income 2 years'],
  },
  {
    id: 'VA_MORTGAGE',
    name: 'VA Mortgage',
    description: 'Veterans Affairs guaranteed loan for eligible veterans and active military.',
    typical_requirements: ['Valid COE', 'Credit score 620+', 'DTI below 41%', 'No down payment required'],
  },
  {
    id: 'JUMBO_MORTGAGE',
    name: 'Jumbo Mortgage',
    description: 'Loan exceeding conforming limits for high-value properties.',
    typical_requirements: ['Credit score 700+', 'DTI below 38%', 'Down payment 10-20%+', 'Cash reserves 6-12 months'],
  },
  {
    id: 'AUTO_LOAN',
    name: 'Auto Loan',
    description: 'Financing for vehicle purchase, secured by the vehicle.',
    typical_requirements: ['Credit score 600+', 'Proof of income', 'Down payment 10-20%', 'Valid license and insurance'],
  },
  {
    id: 'PERSONAL_LOAN',
    name: 'Personal Loan',
    description: 'Unsecured loan for various personal expenses.',
    typical_requirements: ['Credit score 600+', 'Steady income', 'DTI below 40-50%', 'Bank account required'],
  },
] as const;

/** Get loan type by ID */
export function getLoanTypeById(id: string): LoanType | undefined {
  return LOAN_TYPES.find((lt) => lt.id === id);
}

/** Get all loan type IDs */
export function getAllLoanTypeIds(): string[] {
  return LOAN_TYPES.map((lt) => lt.id);
}
