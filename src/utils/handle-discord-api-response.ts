export default function handleDiscordApiResponse<T>(
  errorMessage: string,
): ((result: T | null) => Promise<T>) {
  return async (result) => result || Promise.reject(new Error(errorMessage));
}
