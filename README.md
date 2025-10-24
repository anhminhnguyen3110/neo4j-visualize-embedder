# 🚀 Hono + Neo4j Embed Application

Neovis.js embeddable iframe generation with signed tokens using Hono and Neo4j.

## ✨ Features

- 🔐 JWT-based embed token authentication
- 📊 Neo4j graph database integration
- 🎨 Neovis.js visualization support
- 🐳 Full Docker support with multi-stage builds
- 🧪 E2E testing with isolated test database
- 📦 Clean architecture with TypeScript

## 📋 Prerequisites

### Local Development
- Node.js 20+
- pnpm 8+
- Neo4j 5.14+ (or use Docker)

### Docker Deployment
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ RAM

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Start all services (app + Neo4j)
pnpm docker:up

# Seed sample data
docker-compose exec app pnpm seed

# View logs
pnpm docker:logs

# Stop services
pnpm docker:down
```

Access:
- Application: <http://localhost:3000>
- Neo4j Browser: <http://localhost:7474>
- Health Check: <http://localhost:3000/health>

### Option 2: Local Development

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start Neo4j (via Docker)
docker-compose up -d neo4j

# Run development server
pnpm dev

# Seed sample data
pnpm seed
```

## 🧪 Testing

### Local Testing

```bash
# Run all tests
pnpm test

# E2E tests
pnpm test:e2e

# With coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### Docker Testing

```bash
# Linux/Mac
pnpm docker:test

# Windows
pnpm docker:test:win
```

Tests automatically:
- ✅ Start isolated Neo4j test database
- ✅ Seed test data
- ✅ Run E2E tests
- ✅ Cleanup after completion

## 📁 Project Structure

```
hono-neo4j/
├── src/
│   ├── domain/              # Business entities
│   │   └── entities/        # User, Visualization, EmbedToken
│   ├── infrastructure/      # External services
│   │   ├── config/          # App configuration
│   │   ├── database/        # Neo4j client
│   │   ├── repositories/    # Data access layer
│   │   └── services/        # Auth, JWT, Password
│   ├── models/              # Types, enums, errors
│   ├── presentation/        # HTTP layer
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # CORS, error handling
│   │   └── routes/          # API routes
│   ├── scripts/             # Seed & cleanup scripts
│   └── index.ts             # Application entry
├── tests/
│   ├── e2e/                 # End-to-end tests
│   ├── helpers/             # Test utilities
│   └── README.md            # Testing guide
├── public/
│   └── embed.html           # Visualization embed page
├── docker-compose.yml       # Docker orchestration
├── Dockerfile               # Multi-stage build
└── DOCKER.md                # Docker documentation
```

## 🔧 Configuration

### Environment Variables

```env
# Application
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password
NEO4J_DATABASE=neo4j

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRATION=7d
JWT_ALGORITHM=HS256

# Security
BCRYPT_SALT_ROUNDS=12

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Embed
EMBED_BASE_URL=http://localhost:3000
MAX_TOKEN_EXPIRY_DAYS=90
DEFAULT_TOKEN_EXPIRY_DAYS=7
```

## 📚 API Documentation

### Health Check

```bash
GET /health
```

### Proxy Query

```bash
POST /api/proxy/query
Authorization: Bearer <embed-token>
Content-Type: application/json

{
  "query": "MATCH (n) RETURN n LIMIT 10"
}
```

## 🐳 Docker Commands

```bash
# Build images
pnpm docker:build

# Start services
pnpm docker:up

# View logs
pnpm docker:logs

# Stop services
pnpm docker:down

# Run tests in Docker
pnpm docker:test

# Full cleanup (removes volumes)
pnpm docker:clean
```

See [DOCKER.md](./DOCKER.md) for detailed Docker documentation.

## 📊 Database Scripts

```bash
# Seed sample movie data
pnpm seed

# Clean all test data
pnpm seed:clean
```

## 🏗️ Build & Deploy

### Local Build

```bash
# Build TypeScript
pnpm build

# Start production server
pnpm start
```

### Docker Production

```bash
# Build optimized image
docker build -t hono-neo4j:latest .

# Run container
docker run -p 3000:3000 \
  -e NEO4J_URI=bolt://neo4j:7687 \
  -e NEO4J_PASSWORD=your-password \
  -e JWT_SECRET=your-secret \
  hono-neo4j:latest
```

## 🔒 Security Best Practices

1. **Change default passwords** in production
2. **Use strong JWT secrets** (min 32 characters)
3. **Enable HTTPS** for production deployments
4. **Restrict CORS origins** to your domains
5. **Use environment variables** for sensitive data
6. **Run as non-root user** (handled in Docker)

## 🧰 Development Scripts

```bash
# Development
pnpm dev              # Start with hot reload
pnpm build            # Build TypeScript
pnpm start            # Start production

# Code Quality
pnpm lint             # Check code style
pnpm lint:fix         # Fix lint errors
pnpm format           # Format code
pnpm type-check       # TypeScript check

# Testing
pnpm test             # Run all tests
pnpm test:e2e         # E2E tests only
pnpm test:coverage    # With coverage
pnpm test:watch       # Watch mode

# Database
pnpm seed             # Seed sample data
pnpm seed:clean       # Clean test data

# Docker
pnpm docker:up        # Start services
pnpm docker:down      # Stop services
pnpm docker:test      # Run tests
pnpm docker:clean     # Full cleanup
```

## 📖 Documentation

- [Docker Guide](./DOCKER.md) - Complete Docker deployment guide
- [Testing Guide](./tests/README.md) - E2E testing documentation
- [API Reference](./docs/API.md) - API endpoints (coming soon)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](./LICENSE) file

## 🙏 Acknowledgments

- [Hono](https://hono.dev/) - Ultra-fast web framework
- [Neo4j](https://neo4j.com/) - Graph database
- [Neovis.js](https://github.com/neo4j-contrib/neovis.js/) - Graph visualization
