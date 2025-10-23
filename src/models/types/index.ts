/**
 * Common types used across the application
 */

export type UUID = string;

export type Timestamp = Date;

export interface BaseEntity {
  id: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
