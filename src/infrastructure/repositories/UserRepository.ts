import { v4 as uuidv4 } from 'uuid';
import { neo4jClient } from '../database';
import { User } from '@domain/entities';
import { UserRole } from '@models/enums';
import { NotFoundError, ConflictError } from '@models/errors';

interface CreateUserDTO {
  email: string;
  passwordHash: string;
  role?: UserRole;
}

interface Neo4jUserNode {
  identity?: string;
  labels?: string[];
  properties?: {
    id: string;
    email: string;
    passwordHash: string;
    role: string;
    apiKey: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * User Repository - Neo4j implementation
 */
export class UserRepository {
  /**
   * Create a new user
   */
  async create(dto: CreateUserDTO): Promise<User> {
    // Check if user already exists
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    const result = await neo4jClient.write<{ u: Neo4jUserNode }>(
      `CREATE (u:User {
        id: $id,
        email: $email,
        passwordHash: $passwordHash,
        role: $role,
        apiKey: null,
        isActive: true,
        createdAt: $createdAt,
        updatedAt: $updatedAt
      })
      RETURN u`,
      {
        id,
        email: dto.email,
        passwordHash: dto.passwordHash,
        role: dto.role || UserRole.USER,
        createdAt: now,
        updatedAt: now,
      }
    );

    const node = result[0]?.u;
    if (!node?.properties) {
      throw new Error('Failed to create user');
    }

    return this.mapToEntity(node);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await neo4jClient.read<{ u: Neo4jUserNode }>(
      `MATCH (u:User {email: $email}) RETURN u`,
      { email }
    );

    const node = result[0]?.u;
    if (!node?.properties) {
      return null;
    }

    return this.mapToEntity(node);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const result = await neo4jClient.read<{ u: Neo4jUserNode }>(
      `MATCH (u:User {id: $id}) RETURN u`,
      { id }
    );

    const node = result[0]?.u;
    if (!node?.properties) {
      return null;
    }

    return this.mapToEntity(node);
  }

  /**
   * Find user by API key hash
   */
  async findByApiKey(apiKeyHash: string): Promise<User | null> {
    const result = await neo4jClient.read<{ u: Neo4jUserNode }>(
      `MATCH (u:User {apiKey: $apiKeyHash}) RETURN u`,
      { apiKeyHash }
    );

    const node = result[0]?.u;
    if (!node?.properties) {
      return null;
    }

    return this.mapToEntity(node);
  }

  /**
   * Update user API key
   */
  async updateApiKey(userId: string, apiKeyHash: string): Promise<User> {
    const result = await neo4jClient.write<{ u: Neo4jUserNode }>(
      `MATCH (u:User {id: $userId})
       SET u.apiKey = $apiKeyHash, u.updatedAt = $updatedAt
       RETURN u`,
      {
        userId,
        apiKeyHash,
        updatedAt: new Date().toISOString(),
      }
    );

    const node = result[0]?.u;
    if (!node) {
      throw new NotFoundError('User not found');
    }

    return this.mapToEntity(node);
  }

  /**
   * Update user
   */
  async update(userId: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
    const updates: string[] = [];
    const params: Record<string, unknown> = { userId };

    if (data.email) {
      updates.push('u.email = $email');
      params.email = data.email;
    }
    if (data.passwordHash) {
      updates.push('u.passwordHash = $passwordHash');
      params.passwordHash = data.passwordHash;
    }
    if (data.role) {
      updates.push('u.role = $role');
      params.role = data.role;
    }
    if (data.isActive !== undefined) {
      updates.push('u.isActive = $isActive');
      params.isActive = data.isActive;
    }

    updates.push('u.updatedAt = $updatedAt');
    params.updatedAt = new Date().toISOString();

    const result = await neo4jClient.write<{ u: Neo4jUserNode }>(
      `MATCH (u:User {id: $userId})
       SET ${updates.join(', ')}
       RETURN u`,
      params
    );

    const node = result[0]?.u;
    if (!node) {
      throw new NotFoundError('User not found');
    }

    return this.mapToEntity(node);
  }

  /**
   * Map Neo4j node to User entity
   */
  private mapToEntity(node: Neo4jUserNode): User {
    const props = node.properties;
    if (!props) {
      throw new Error('Invalid Neo4j node: missing properties');
    }

    return new User(
      props.id,
      props.email,
      props.passwordHash,
      props.role as UserRole,
      props.apiKey,
      props.isActive,
      new Date(props.createdAt),
      new Date(props.updatedAt)
    );
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
