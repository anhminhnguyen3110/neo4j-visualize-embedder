import { sqliteClient } from '../database/SQLiteClient';
import { EmbedToken } from '../../domain/entities/EmbedToken';

export interface CreateEmbedTokenDto {
  id: string;
  embedToken: string;
  cypherQuery: string;
  expiresAt: Date;
}

/**
 * Repository for EmbedToken operations (SQLite only)
 */
export class EmbedTokenRepository {
  /**
   * Create a new embed token
   */
  static create(dto: CreateEmbedTokenDto): EmbedToken {
    const db = sqliteClient.getDb();
    
    const stmt = db.prepare(`
      INSERT INTO embed_tokens (id, embed_token, cypher_query, expires_at, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      dto.id,
      dto.embedToken,
      dto.cypherQuery,
      dto.expiresAt.toISOString()
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return new EmbedToken(
      dto.id,
      dto.embedToken,
      dto.cypherQuery,
      dto.expiresAt,
      new Date()
    );
  }

  /**
   * Find embed token by token string
   */
  static findByToken(token: string): EmbedToken | null {
    const db = sqliteClient.getDb();
    
    const stmt = db.prepare(`
      SELECT id, embed_token, cypher_query, expires_at, created_at
      FROM embed_tokens
      WHERE embed_token = ?
    `);

    const row = stmt.get(token) as
      | {
          id: string;
          embed_token: string;
          cypher_query: string;
          expires_at: string;
          created_at: string;
        }
      | undefined;

    if (!row) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return new EmbedToken(
      row.id,
      row.embed_token,
      row.cypher_query,
      new Date(row.expires_at),
      new Date(row.created_at)
    );
  }

  /**
   * Delete expired tokens
   */
  static deleteExpired(): number {
    const db = sqliteClient.getDb();
    
    const stmt = db.prepare(`
      DELETE FROM embed_tokens
      WHERE datetime(expires_at) <= datetime('now')
    `);

    const result = stmt.run();
    return result.changes;
  }

  /**
   * Delete token by token string
   */
  static deleteByToken(token: string): boolean {
    const db = sqliteClient.getDb();
    
    const stmt = db.prepare(`
      DELETE FROM embed_tokens
      WHERE embed_token = ?
    `);

    const result = stmt.run(token);
    return result.changes > 0;
  }

  /**
   * Count all active tokens (not expired)
   */
  static countActive(): number {
    const db = sqliteClient.getDb();
    
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM embed_tokens
      WHERE datetime(expires_at) > datetime('now')
    `);

    const result = stmt.get() as { count: number };
    return result.count;
  }
}
