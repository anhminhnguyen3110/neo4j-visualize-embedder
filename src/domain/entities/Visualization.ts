import { UUID, Timestamp, BaseEntity } from '@models/types';
import { VisualizationType } from '@models/enums';

/**
 * Visualization Domain Entity
 */
export class Visualization implements BaseEntity {
  constructor(
    public id: UUID,
    public userId: UUID,
    public name: string,
    public description: string | null,
    public cypherQuery: string,
    public visualizationType: VisualizationType,
    public config: Record<string, unknown>,
    public isPublic: boolean,
    public createdAt: Timestamp,
    public updatedAt: Timestamp
  ) {}

  /**
   * Check if visualization can be accessed by user
   */
  public canBeAccessedBy(userId: UUID): boolean {
    return this.isPublic || this.userId === userId;
  }

  /**
   * Check if visualization can be edited by user
   */
  public canBeEditedBy(userId: UUID): boolean {
    return this.userId === userId;
  }
}
