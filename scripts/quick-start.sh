#!/bin/bash
# Quick Start Script - Setup and run the application
set -e

echo "🚀 Hono + Neo4j Quick Start Setup"
echo "=================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created!${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and update the configuration${NC}"
    echo ""
fi

# Ask user for deployment type
echo -e "${BLUE}Choose deployment type:${NC}"
echo "1) Docker (Recommended)"
echo "2) Local Development"
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}🐳 Starting Docker deployment...${NC}"
        
        # Check if Docker is running
        if ! docker info > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Docker is not running. Please start Docker first.${NC}"
            exit 1
        fi
        
        # Build and start
        echo -e "${YELLOW}📦 Building Docker images...${NC}"
        docker-compose build
        
        echo -e "${YELLOW}🚀 Starting services...${NC}"
        docker-compose up -d
        
        # Wait for services to be ready
        echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
        sleep 10
        
        # Seed data
        read -p "Seed sample data? [Y/n]: " seed_choice
        if [[ $seed_choice != "n" && $seed_choice != "N" ]]; then
            echo -e "${YELLOW}🌱 Seeding sample data...${NC}"
            docker-compose exec -T app pnpm seed
        fi
        
        echo ""
        echo -e "${GREEN}✅ Application is running!${NC}"
        echo ""
        echo "🌐 Access points:"
        echo "   Application:  http://localhost:3000"
        echo "   Neo4j Browser: http://localhost:7474"
        echo "   Health Check: http://localhost:3000/health"
        echo ""
        echo "📝 View logs:"
        echo "   docker-compose logs -f app"
        echo ""
        echo "🛑 Stop services:"
        echo "   docker-compose down"
        ;;
        
    2)
        echo ""
        echo -e "${YELLOW}💻 Starting local development...${NC}"
        
        # Check if pnpm is installed
        if ! command -v pnpm &> /dev/null; then
            echo -e "${YELLOW}⚠️  pnpm not found. Installing...${NC}"
            npm install -g pnpm
        fi
        
        # Install dependencies
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        pnpm install
        
        # Start Neo4j via Docker
        echo -e "${YELLOW}🗄️  Starting Neo4j database...${NC}"
        docker-compose up -d neo4j
        
        # Wait for Neo4j
        echo -e "${YELLOW}⏳ Waiting for Neo4j to be ready...${NC}"
        sleep 15
        
        # Seed data
        read -p "Seed sample data? [Y/n]: " seed_choice
        if [[ $seed_choice != "n" && $seed_choice != "N" ]]; then
            echo -e "${YELLOW}🌱 Seeding sample data...${NC}"
            pnpm seed
        fi
        
        echo ""
        echo -e "${GREEN}✅ Setup complete!${NC}"
        echo ""
        echo "🌐 Neo4j Browser: http://localhost:7474"
        echo ""
        echo "🚀 Start development server:"
        echo "   pnpm dev"
        echo ""
        echo "🧪 Run tests:"
        echo "   pnpm test"
        ;;
        
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Setup complete! Happy coding!${NC}"
