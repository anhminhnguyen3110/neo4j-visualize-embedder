import { Context } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { EmbedTokenRepository } from '@infrastructure/repositories';
import { AppConfig } from '@infrastructure/config';
import { html } from 'hono/html';

interface CreateEmbedRequest {
  cypherQuery: string;
  expiresInDays?: number; // in days, default 1 day
}

/**
 * Embed Controller
 * Handles embed URL creation and viewing
 */
export class EmbedController {
  /**
   * Create a new embed URL
   * POST /api/embed
   */
  static async create(c: Context): Promise<Response> {
    try {
      const body = await c.req.json<CreateEmbedRequest>();

      // Validate cypher query
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

      // Calculate expiration (default 1 day)
      const expiresInDays = body.expiresInDays ?? 1;
      const expiresIn = expiresInDays * 24 * 60 * 60; // Convert days to seconds
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

      // Generate embed token
      const embedToken = uuidv4();
      const id = uuidv4();

      // Save to SQLite
      EmbedTokenRepository.create({
        id,
        embedToken,
        cypherQuery: body.cypherQuery.trim(),
        expiresAt,
      });

      // Build embed URL
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

  /**
   * View embed visualization
   * GET /view/:token
   */
  static async view(c: Context): Promise<Response> {
    try {
      const token = c.req.param('token');

      // Find token in SQLite
      const embedToken = EmbedTokenRepository.findByToken(token);

      if (!embedToken) {
        return c.html(
          html`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Embed Not Found</title>
                <style>
                  body { font-family: Arial; text-align: center; padding: 50px; }
                  h1 { color: #e74c3c; }
                </style>
              </head>
              <body>
                <h1>Embed Not Found</h1>
                <p>The requested embed URL does not exist or has been deleted.</p>
              </body>
            </html>
          `,
          404
        );
      }

      // Check if expired
      if (embedToken.isExpired()) {
        return c.html(
          html`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Embed Expired</title>
                <style>
                  body { font-family: Arial; text-align: center; padding: 50px; }
                  h1 { color: #e67e22; }
                </style>
              </head>
              <body>
                <h1>Embed Expired</h1>
                <p>This embed URL has expired on ${embedToken.expiresAt.toISOString()}.</p>
              </body>
            </html>
          `,
          410
        );
      }

      // Serve visualization HTML
      return c.html(html`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Neo4j Graph Visualization</title>
            <script src="https://unpkg.com/vis-network@9.1.2/dist/vis-network.min.js"></script>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; overflow: hidden; }
              #viz { width: 100vw; height: 100vh; background: #2a2a2a; }
              #loading { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; z-index: 1000; }
              #loading.hidden { display: none; }
              .spinner { border: 4px solid rgba(255, 255, 255, 0.1); border-radius: 50%; border-top: 4px solid #4CAF50; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              #error { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #e74c3c; color: white; padding: 20px; border-radius: 8px; display: none; max-width: 80%; }
            </style>
          </head>
          <body>
            <div id="loading">
              <div class="spinner"></div>
              <div>Loading graph...</div>
            </div>
            <div id="error"></div>
            <div id="viz"></div>

            <script>
              const embedToken = '${token}';
              const apiUrl = '/api/proxy/query';

              async function loadGraph() {
                try {
                  const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: embedToken })
                  });

                  if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                  }

                  const result = await response.json();
                  if (!result.success) {
                    throw new Error(result.error?.message || 'Failed to load graph');
                  }

                  const graphData = result.data;
                  renderGraph(graphData);
                } catch (error) {
                  showError(error.message);
                } finally {
                  document.getElementById('loading').classList.add('hidden');
                }
              }

              function renderGraph(data) {
                const nodes = new vis.DataSet(
                  data.nodes.map(node => ({
                    id: node.id,
                    label: node.labels[0] || 'Node',
                    title: JSON.stringify(node.properties, null, 2),
                    color: { background: '#4CAF50', border: '#2E7D32' }
                  }))
                );

                const edges = new vis.DataSet(
                  data.relationships.map(rel => ({
                    id: rel.id,
                    from: rel.startNode,
                    to: rel.endNode,
                    label: rel.type,
                    title: JSON.stringify(rel.properties, null, 2),
                    arrows: 'to'
                  }))
                );

                const container = document.getElementById('viz');
                const graphData = { nodes, edges };
                const options = {
                  nodes: { shape: 'dot', size: 20, font: { color: '#fff' } },
                  edges: { color: { color: '#848484' }, font: { color: '#fff', size: 12 } },
                  physics: { stabilization: true }
                };

                new vis.Network(container, graphData, options);
              }

              function showError(message) {
                const errorDiv = document.getElementById('error');
                errorDiv.textContent = 'Error: ' + message;
                errorDiv.style.display = 'block';
              }

              loadGraph();
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      return c.html(
        html`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Error</title>
              <style>
                body { font-family: Arial; text-align: center; padding: 50px; }
                h1 { color: #e74c3c; }
              </style>
            </head>
            <body>
              <h1>Error</h1>
              <p>${error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
            </body>
          </html>
        `,
        500
      );
    }
  }
}
