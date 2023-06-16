export declare type LibError = {
    readonly message: string;
    readonly cause: unknown;
};
export declare function toLibError(x: unknown): LibError;
