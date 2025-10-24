export interface DatabaseConfig {
  sql?: {
    path: string;
    type: 'sqlite' | 'postgres';
  };
  graph: {
    uri: string;
    user: string;
    password: string;
    database: string;
  };
}
