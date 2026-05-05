export const SEVERITIES = {
    WARNING: 'WARNING',
    ERROR: 'ERROR',
} as const;

export type Severity = (typeof SEVERITIES)[keyof typeof SEVERITIES];