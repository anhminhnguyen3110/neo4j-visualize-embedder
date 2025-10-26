export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Neovis Embed Service API',
    version: '1.0.0',
    description: 'API for generating embeddable Neo4j graph visualizations with signed tokens',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Service health and status endpoints',
    },
    {
      name: 'Tokens',
      description: 'JWT token generation for embed authentication',
    },
    {
      name: 'Embed',
      description: 'Embedded visualization endpoints',
    },
    {
      name: 'Proxy',
      description: 'Neo4j proxy for executing Cypher queries',
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        description: 'Returns the health status of the service and its dependencies',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'healthy',
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                    },
                    database: {
                      type: 'object',
                      properties: {
                        sqlite: {
                          type: 'string',
                          example: 'connected',
                        },
                        neo4j: {
                          type: 'string',
                          example: 'connected',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/token/generate': {
      post: {
        tags: ['Tokens'],
        summary: 'Generate JWT token',
        description: 'Creates a JWT token for API authentication (no body required)',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {},
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Token created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: {
                      type: 'string',
                      description: 'JWT token for API authentication',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    },
                    expiresAt: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid request',
          },
        },
      },
    },
    '/api/embed': {
      post: {
        tags: ['Embed'],
        summary: 'Create embed URL',
        description: 'Creates an embed token and URL for a Cypher query',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['cypherQuery'],
                properties: {
                  cypherQuery: {
                    type: 'string',
                    description: 'Cypher query to execute in the visualization',
                    example: 'MATCH (p:Person)-[r:ACTED_IN]->(m:Movie) RETURN p,r,m LIMIT 25',
                  },
                  expiresInDays: {
                    type: 'number',
                    description: 'Token expiration in days (default: 7)',
                    example: 7,
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Embed URL created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    embedUrl: {
                      type: 'string',
                      description: 'Complete embed URL with token',
                      example: 'http://localhost:3000/view/abc123def456',
                    },
                    embedToken: {
                      type: 'string',
                      description: 'Embed token (extracted from URL)',
                    },
                    expiresAt: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Invalid JWT token',
          },
          '400': {
            description: 'Invalid request',
          },
        },
      },
    },
    '/view/:token': {
      get: {
        tags: ['Embed'],
        summary: 'Render embedded visualization',
        description: 'Returns HTML page with Neovis.js visualization',
        parameters: [
          {
            name: 'token',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'JWT embed token',
          },
        ],
        responses: {
          '200': {
            description: 'Visualization page',
            content: {
              'text/html': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
          '401': {
            description: 'Invalid or expired token',
          },
        },
      },
    },
    '/api/proxy/query': {
      post: {
        tags: ['Proxy'],
        summary: 'Execute Cypher query',
        description: 'Proxies Cypher query to Neo4j database',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: {
                    type: 'string',
                    description: 'Cypher query to execute',
                  },
                  parameters: {
                    type: 'object',
                    description: 'Query parameters',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Query executed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    records: {
                      type: 'array',
                      items: {
                        type: 'object',
                      },
                    },
                    summary: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
          },
          '500': {
            description: 'Query execution failed',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
          statusCode: {
            type: 'number',
          },
        },
      },
    },
  },
};
