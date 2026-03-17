/** Loan type definition */
export interface LoanType {
    id: string;
    name: string;
    description: string;
    typical_requirements: string[];
}
/** All supported loan types */
export declare const LOAN_TYPES: readonly LoanType[];
/** Get loan type by ID */
export declare function getLoanTypeById(id: string): LoanType | undefined;
/** Get all loan type IDs */
export declare function getAllLoanTypeIds(): string[];
//# sourceMappingURL=loan-types.d.ts.map