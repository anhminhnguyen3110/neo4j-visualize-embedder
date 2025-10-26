import { sqliteClient } from '../database/SQLiteClient';
import { EmbedToken } from '../../domain/entities/EmbedToken';

export interface CreateEmbedTokenDto {
  id: string;
  embedToken: string;
  cypherQuery: string;
  expiresAt: Date;
}

export class EmbedTokenRepository {
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

    return new EmbedToken(
      dto.id,
      dto.embedToken,
      dto.cypherQuery,
      dto.expiresAt,
      new Date()
    );
  }

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

    return new EmbedToken(
      row.id,
      row.embed_token,
      row.cypher_query,
      new Date(row.expires_at),
      new Date(row.created_at)
    );
  }
}
