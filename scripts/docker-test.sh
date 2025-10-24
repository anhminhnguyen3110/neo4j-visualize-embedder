#!/bin/bash
# Docker Test Script - Run E2E tests with Docker Compose
set -e

echo "🐳 Starting Docker Test Environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    docker-compose --profile test down -v
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Start Neo4j test database
echo -e "${YELLOW}📦 Starting Neo4j test database...${NC}"
docker-compose --profile test up -d neo4j-test

# Wait for Neo4j to be ready
echo -e "${YELLOW}⏳ Waiting for Neo4j to be ready...${NC}"
timeout 60 bash -c '
    until docker-compose exec -T neo4j-test wget --spider -q http://localhost:7474 2>/dev/null; do
        echo "Waiting for Neo4j..."
        sleep 2
    done
'

echo -e "${GREEN}✅ Neo4j test database is ready!${NC}"

# Run tests
echo -e "${YELLOW}🧪 Running E2E tests...${NC}"
docker-compose --profile test run --rm test

# Check exit code
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Tests failed!${NC}"
    exit 1
fi
