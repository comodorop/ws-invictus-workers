export declare const SEVERITIES: {
    readonly WARNING: "WARNING";
    readonly ERROR: "ERROR";
};
export type Severity = (typeof SEVERITIES)[keyof typeof SEVERITIES];
