import { Context } from 'hono';
import { JWTService } from '@infrastructure/services';

/**
 * Token Controller
 * Handles JWT token generation for testing
 */
export class TokenController {
  /**
   * Generate a new JWT token
   * POST /api/token/generate
   */
  static generate(c: Context): Response {
    try {
      // Generate token with default expiration (24h)
      const token = JWTService.generateToken({
        purpose: 'embed_api_access',
        createdAt: new Date().toISOString(),
      });

      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      return c.json({
        success: true,
        data: {
          token,
          expiresAt: expiresAt.toISOString(),
          expiresIn: 86400, // 24 hours in seconds
        },
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'TOKEN_GENERATION_FAILED',
            message: error instanceof Error ? error.message : 'Failed to generate token',
          },
        },
        500
      );
    }
  }
}
