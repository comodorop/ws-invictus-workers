export const ISSUE_CODES = {
    OUT_OF_PERIOD: {
        reason: 'OUT_OF_PERIOD',
        message: 'Movement date is out of period',
        severity: 'WARNING',
    },
} as const;

export type IssueCode = typeof ISSUE_CODES[keyof typeof ISSUE_CODES]['reason']; 


