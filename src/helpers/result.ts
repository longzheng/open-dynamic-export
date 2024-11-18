export type Result<T, E = Error> =
    | {
          success: true;
          value: T;
      }
    | {
          success: false;
          error: E;
      };

export async function tryCatchResult<T>(
    fn: () => T | Promise<T>,
): Promise<Result<T>> {
    try {
        const value = await fn();
        return {
            success: true,
            value,
        };
    } catch (error) {
        return {
            success: false,
            error: error as Error,
        };
    }
}
