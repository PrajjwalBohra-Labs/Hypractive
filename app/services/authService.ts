import * as Crypto from 'expo-crypto';

/**
 * Hashes a password locally with SHA-256. This is NOT a real security
 * boundary — there is no backend, so anyone with physical access to the
 * device already has full access to the app's data regardless of this
 * hash. It exists only so a password isn't sitting in plain text in the
 * local database, not to provide real account protection. This is
 * documented in the app's About screen too, so it's never misleading.
 */
export async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const candidate = await hashPassword(password);
  return candidate === hash;
}
