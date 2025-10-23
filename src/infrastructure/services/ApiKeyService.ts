import crypto from 'crypto';

/**
 * API Key Service for generating and validating API keys
 */
export class ApiKeyService {
  /**
   * Generate a random API key
   */
  static generateApiKey(): string {
    return `sk_${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Hash API key for storage
   */
  static hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Verify API key against hash
   */
  static verifyApiKey(apiKey: string, hash: string): boolean {
    const computedHash = this.hashApiKey(apiKey);
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
  }
}
