export default function handleDiscordApiResponse<T>(
  errorMessage: string,
): ((result: T | null) => Promise<T>) {
  return async (result) => (result === null ? Promise.reject(new Error(errorMessage)) : result);
}
