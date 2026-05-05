export declare const ISSUE_CODES: {
    readonly OUT_OF_PERIOD: {
        readonly reason: "OUT_OF_PERIOD";
        readonly message: "Movement date is out of period";
        readonly severity: "WARNING";
    };
};
export type IssueCode = typeof ISSUE_CODES[keyof typeof ISSUE_CODES]['reason'];
