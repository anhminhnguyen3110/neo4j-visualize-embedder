import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { AppConfig } from '../config';
import { ITransaction } from './IRepository';

class SQLiteTransaction implements ITransaction {
  constructor(private readonly db: Database.Database) {}

  commit(): Promise<void> {
    this.db.prepare('COMMIT').run();
    return Promise.resolve();
  }

  rollback(): Promise<void> {
    this.db.prepare('ROLLBACK').run();
    return Promise.resolve();
  }
}

export class SQLiteClient {
  private static instance: SQLiteClient;
  private readonly db: Database.Database;

  private constructor() {
    const dbPath = AppConfig.sql.path;
    
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    this.db = new Database(dbPath);
    
    const journalMode = process.env.NODE_ENV === 'production' ? 'DELETE' : 'WAL';
    this.db.pragma(`journal_mode = ${journalMode}`);
    this.db.pragma('foreign_keys = ON');
    this.initializeSchema();
  }

  public static getInstance(): SQLiteClient {
    if (!SQLiteClient.instance) {
      SQLiteClient.instance = new SQLiteClient();
    }
    return SQLiteClient.instance;
  }

  public getDb(): Database.Database {
    return this.db;
  }

  public beginTransaction(): ITransaction {
    this.db.prepare('BEGIN').run();
    return new SQLiteTransaction(this.db);
  }

  private initializeSchema(): void {
    this.migrateToSimplifiedSchema();

    // Simplified schema - only embed_tokens table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS embed_tokens (
        id TEXT PRIMARY KEY,
        embed_token TEXT UNIQUE NOT NULL,
        cypher_query TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_embed_token ON embed_tokens(embed_token);
      CREATE INDEX IF NOT EXISTS idx_expires_at ON embed_tokens(expires_at);
    `);
  }

  private migrateToSimplifiedSchema(): void {
    try {
      const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
      const hasOldSchema = tables.some(t => t.name === 'users' || t.name === 'visualizations');
      
      if (hasOldSchema) {
        // eslint-disable-next-line no-console
        console.log('🔧 Migrating to simplified schema...');
        
        this.db.pragma('foreign_keys = OFF');
        
        this.db.exec('DROP TABLE IF EXISTS users');
        this.db.exec('DROP TABLE IF EXISTS visualizations');
        this.db.exec('DROP TABLE IF EXISTS embed_tokens');
        
        this.db.pragma('foreign_keys = ON');
        
        // eslint-disable-next-line no-console
        console.log('✅ Schema migration completed');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Migration error (continuing with new schema):', error);
    }
  }

  public verifyConnectivity(): boolean {
    try {
      this.db.prepare('SELECT 1').get();
      return true;
    } catch (error) {
      console.error('SQLite connectivity check failed:', error);
      return false;
    }
  }

  public close(): void {
    this.db.close();
  }
}

export const sqliteClient = SQLiteClient.getInstance();
