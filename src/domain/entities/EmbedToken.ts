import { UUID, Timestamp, BaseEntity } from '@models/types';
import { TokenStatus } from '@models/enums';

/**
 * EmbedToken Domain Entity
 */
export class EmbedToken implements BaseEntity {
  constructor(
    public id: UUID,
    public visualizationId: UUID,
    public token: string,
    public allowedDomains: string[],
    public expiresAt: Timestamp | null,
    public status: TokenStatus,
    public createdAt: Timestamp,
    public updatedAt: Timestamp
  ) {}

  /**
   * Check if token is valid
   */
  public isValid(): boolean {
    if (this.status !== TokenStatus.ACTIVE) {
      return false;
    }

    if (this.expiresAt && new Date() > this.expiresAt) {
      return false;
    }

    return true;
  }

  /**
   * Check if domain is allowed
   */
  public isDomainAllowed(domain: string): boolean {
    if (this.allowedDomains.length === 0) {
      return true; // No restrictions
    }

    return this.allowedDomains.some((allowed) => {
      // Support wildcard domains
      if (allowed.startsWith('*.')) {
        const pattern = allowed.substring(2);
        return domain.endsWith(pattern);
      }
      return domain === allowed;
    });
  }

  /**
   * Revoke the token
   */
  public revoke(): void {
    this.status = TokenStatus.REVOKED;
    this.updatedAt = new Date();
  }
}
