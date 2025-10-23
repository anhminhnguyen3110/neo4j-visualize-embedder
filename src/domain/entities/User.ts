import { UUID, Timestamp, BaseEntity } from '@models/types';
import { UserRole } from '@models/enums';

/**
 * User Domain Entity
 */
export class User implements BaseEntity {
  constructor(
    public id: UUID,
    public email: string,
    public passwordHash: string,
    public role: UserRole,
    public apiKey: string | null,
    public isActive: boolean,
    public createdAt: Timestamp,
    public updatedAt: Timestamp
  ) {}

  /**
   * Check if user is admin
   */
  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Check if user can create visualizations
   */
  public canCreateVisualization(): boolean {
    return this.isActive && (this.role === UserRole.ADMIN || this.role === UserRole.USER);
  }
}
