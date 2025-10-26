import { Context } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { EmbedTokenRepository } from '@infrastructure/repositories';
import { AppConfig } from '@infrastructure/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface CreateEmbedRequest {
  cypherQuery: string;
  expiresInDays?: number;
}

export class EmbedController {
  static async create(c: Context): Promise<Response> {
    try {
      const body = await c.req.json<CreateEmbedRequest>();

      if (!body.cypherQuery || typeof body.cypherQuery !== 'string' || body.cypherQuery.trim() === '') {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Cypher query is required',
            },
          },
          400
        );
      }

      const expiresInDays = body.expiresInDays ?? 1;
      const expiresIn = expiresInDays * 24 * 60 * 60;
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

      const embedToken = uuidv4();
      const id = uuidv4();

      EmbedTokenRepository.create({
        id,
        embedToken,
        cypherQuery: body.cypherQuery.trim(),
        expiresAt,
      });

      const baseUrl = AppConfig.embed.baseUrl || `http://${AppConfig.app.host}:${AppConfig.app.port}`;
      const embedUrl = `${baseUrl}/view/${embedToken}`;

      return c.json({
        success: true,
        data: {
          embedUrl,
          embedToken,
          expiresAt: expiresAt.toISOString(),
          expiresIn,
        },
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'EMBED_CREATION_FAILED',
            message: error instanceof Error ? error.message : 'Failed to create embed',
          },
        },
        500
      );
    }
  }

  static view(c: Context): Response {
    try {
      const token = c.req.param('token');
      const embedToken = EmbedTokenRepository.findByToken(token);

      if (!embedToken) {
        const notFoundHtml = readFileSync(join(process.cwd(), 'public', 'embed-not-found.html'), 'utf-8');
        return c.html(notFoundHtml, 404);
      }

      if (embedToken.isExpired()) {
        let expiredHtml = readFileSync(join(process.cwd(), 'public', 'embed-expired.html'), 'utf-8');
        expiredHtml = expiredHtml.replace('{{EXPIRES_AT}}', embedToken.expiresAt.toISOString());
        return c.html(expiredHtml, 410);
      }

      // Read and serve the embed.html template
      try {
        const embedHtmlPath = join(process.cwd(), 'public', 'embed.html');
        let htmlContent = readFileSync(embedHtmlPath, 'utf-8');
        
        // Replace the token placeholder in the HTML
        htmlContent = htmlContent.replace(
          /const token = urlParams\.get\('token'\) \|\| globalThis\.location\.pathname\.split\('\/'\)\.pop\(\);/,
          `const token = '${token}';`
        );
        
        // Update API calls to use the correct endpoints
        htmlContent = htmlContent.replaceAll(
          '/api/embed/config/${token}',
          '/api/proxy/query'
        );
        
        htmlContent = htmlContent.replaceAll(
          '/api/proxy/neo4j',
          '/api/proxy/query'
        );

        return c.html(htmlContent);
      } catch (fileError) {
        console.error('Failed to read embed.html:', fileError);
        let errorHtml = readFileSync(join(process.cwd(), 'public', 'embed-error.html'), 'utf-8');
        errorHtml = errorHtml.replace('{{ERROR_TITLE}}', 'Template Loading Error');
        errorHtml = errorHtml.replace('{{ERROR_MESSAGE}}', 'Failed to load the visualization template. Please check server configuration.');
        errorHtml = errorHtml.replace('{{ERROR_DETAILS}}', fileError instanceof Error ? fileError.message : 'Unknown error');
        return c.html(errorHtml);
      }
    } catch (error) {
      let errorHtml = readFileSync(join(process.cwd(), 'public', 'embed-error.html'), 'utf-8');
      errorHtml = errorHtml.replace('{{ERROR_TITLE}}', 'Error');
      errorHtml = errorHtml.replace('{{ERROR_MESSAGE}}', error instanceof Error ? error.message : 'An unexpected error occurred');
      errorHtml = errorHtml.replace('{{ERROR_DETAILS}}', '');
      return c.html(errorHtml, 500);
    }
  }
}
