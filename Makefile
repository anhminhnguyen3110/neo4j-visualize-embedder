.PHONY: help install dev build start test docker-up docker-down docker-test seed clean

# Default target
help:
	@echo "🚀 Hono + Neo4j Embed Application"
	@echo "================================="
	@echo ""
	@echo "Available commands:"
	@echo "  make install       - Install dependencies"
	@echo "  make dev           - Start development server"
	@echo "  make build         - Build TypeScript"
	@echo "  make start         - Start production server"
	@echo "  make test          - Run all tests"
	@echo "  make test-e2e      - Run E2E tests"
	@echo "  make docker-up     - Start Docker services"
	@echo "  make docker-down   - Stop Docker services"
	@echo "  make docker-test   - Run tests in Docker"
	@echo "  make docker-clean  - Clean Docker volumes"
	@echo "  make seed          - Seed sample data"
	@echo "  make clean         - Clean build artifacts"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	pnpm install

# Development
dev:
	@echo "🚀 Starting development server..."
	pnpm dev

# Build
build:
	@echo "🔨 Building TypeScript..."
	pnpm build

# Start production
start:
	@echo "▶️  Starting production server..."
	pnpm start

# Testing
test:
	@echo "🧪 Running tests..."
	pnpm test

test-e2e:
	@echo "🧪 Running E2E tests..."
	pnpm test:e2e

test-coverage:
	@echo "📊 Running tests with coverage..."
	pnpm test:coverage

# Docker commands
docker-up:
	@echo "🐳 Starting Docker services..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "   Application:   http://localhost:3000"
	@echo "   Neo4j Browser: http://localhost:7474"

docker-down:
	@echo "🛑 Stopping Docker services..."
	docker-compose down

docker-build:
	@echo "🔨 Building Docker images..."
	docker-compose build

docker-logs:
	@echo "📋 Showing logs..."
	docker-compose logs -f app

docker-test:
	@echo "🧪 Running tests in Docker..."
	bash scripts/docker-test.sh

docker-clean:
	@echo "🗑️  Cleaning Docker volumes..."
	docker-compose down -v
	docker system prune -f

# Database
seed:
	@echo "🌱 Seeding sample data..."
	pnpm seed

seed-clean:
	@echo "🗑️  Cleaning test data..."
	pnpm seed:clean

# Cleanup
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist coverage .next out node_modules/.cache

# Lint and format
lint:
	@echo "🔍 Linting code..."
	pnpm lint

lint-fix:
	@echo "🔧 Fixing lint errors..."
	pnpm lint:fix

format:
	@echo "✨ Formatting code..."
	pnpm format

# Quick start (interactive)
quick-start:
	@bash scripts/quick-start.sh

# Setup environment
setup:
	@if [ ! -f .env ]; then \
		echo "📝 Creating .env file..."; \
		cp .env.example .env; \
		echo "✅ .env created! Please edit it with your configuration."; \
	else \
		echo "✅ .env already exists"; \
	fi

# Full setup and run
init: setup install docker-up
	@echo ""
	@echo "✅ Initialization complete!"
	@echo ""
	@echo "To seed data:"
	@echo "  make seed"
	@echo ""
	@echo "To start development:"
	@echo "  make dev"
