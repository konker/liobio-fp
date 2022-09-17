export type LibError = {
  readonly message: string;
  readonly cause: unknown;
};

export function toLibError(x: unknown): LibError {
  return {
    message: typeof x === 'object' && x && 'message' in x ? (x as any).message : String(x),
    cause: x,
  };
}
