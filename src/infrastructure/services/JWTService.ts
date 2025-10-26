import jwt, { SignOptions, Algorithm } from 'jsonwebtoken';
import { AppConfig } from '../config';
import { UnauthorizedError } from '@models/errors';

interface JWTPayload {
  userId?: string;
  email?: string;
  role?: string;
  tokenId?: string;
  visualizationId?: string;
  type?: string;
  [key: string]: unknown;
}

export class JWTService {
  static generateToken(payload: JWTPayload): string {
    const options: SignOptions = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      expiresIn: AppConfig.auth.jwtExpiration as any,
      algorithm: AppConfig.auth.jwtAlgorithm as Algorithm,
    };
    return jwt.sign(payload, AppConfig.auth.jwtSecret, options);
  }

  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, AppConfig.auth.jwtSecret, {
        algorithms: [AppConfig.auth.jwtAlgorithm as Algorithm],
      });

      return decoded as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }
}
