#!/bin/bash

# Bob Pool - Setup Verification Script
# This script checks if your environment is ready to run the bob-pool application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emojis
CHECK="✓"
CROSS="✗"
WARN="⚠️"
ROCKET="🚀"
WRENCH="🔧"

echo ""
echo "=========================================="
echo "  Bob Pool - Setup Verification"
echo "=========================================="
echo ""

# Track overall status
ALL_CHECKS_PASSED=true

# Function to print success
print_success() {
    echo -e "${GREEN}${CHECK}${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}${CROSS}${NC} $1"
    ALL_CHECKS_PASSED=false
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}${WARN}${NC} $1"
}

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Function to print section header
print_section() {
    echo ""
    echo -e "${BLUE}━━━ $1 ━━━${NC}"
}

# Check 1: Docker Installation
print_section "Checking Docker Installation"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker is installed: $DOCKER_VERSION"
else
    print_error "Docker is not installed"
    print_info "Install Docker from: https://docs.docker.com/get-docker/"
fi

# Check 2: Docker Daemon Running
print_section "Checking Docker Daemon"
if docker info &> /dev/null; then
    print_success "Docker daemon is running"
else
    print_error "Docker daemon is not running"
    print_info "Start Docker Desktop or run: sudo systemctl start docker"
fi

# Check 3: Docker Compose
print_section "Checking Docker Compose"
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
    else
        COMPOSE_VERSION=$(docker compose version)
    fi
    print_success "Docker Compose is available: $COMPOSE_VERSION"
else
    print_error "Docker Compose is not available"
    print_info "Docker Compose should come with Docker Desktop"
fi

# Check 4: Required Files
print_section "Checking Required Files"

REQUIRED_FILES=(
    "docker-compose.yml"
    "backend/Dockerfile"
    "backend/package.json"
    "backend/server.js"
    "backend/db.js"
    "backend/.env.example"
    "frontend/Dockerfile"
    "frontend/package.json"
    "frontend/vite.config.js"
    "frontend/index.html"
    "frontend/src/main.jsx"
    "frontend/src/App.jsx"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file"
    else
        print_error "$file is missing"
    fi
done

# Check 5: Port Availability
print_section "Checking Port Availability"

check_port() {
    local port=$1
    local service=$2
    
    if command -v lsof &> /dev/null; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $port ($service) is already in use"
            print_info "Stop the service using this port or change the port in docker-compose.yml"
        else
            print_success "Port $port ($service) is available"
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tuln | grep -q ":$port "; then
            print_warning "Port $port ($service) is already in use"
            print_info "Stop the service using this port or change the port in docker-compose.yml"
        else
            print_success "Port $port ($service) is available"
        fi
    else
        print_warning "Cannot check port $port - lsof/netstat not available"
    fi
}

check_port 3000 "Frontend"
check_port 3001 "Backend"
check_port 5432 "PostgreSQL"

# Check 6: Environment File
print_section "Checking Environment Configuration"
if [ -f "backend/.env" ]; then
    print_success "backend/.env exists"
else
    print_warning "backend/.env not found"
    print_info "Copy backend/.env.example to backend/.env before running"
    print_info "Command: cp backend/.env.example backend/.env"
fi

# Summary
echo ""
echo "=========================================="
if [ "$ALL_CHECKS_PASSED" = true ]; then
    echo -e "${GREEN}${ROCKET} All checks passed! You're ready to go!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Copy environment file (if not done):"
    echo "     cp backend/.env.example backend/.env"
    echo ""
    echo "  2. Start the application:"
    echo "     docker-compose up --build"
    echo ""
    echo "  3. Access the application:"
    echo "     Frontend: http://localhost:3000"
    echo "     Backend:  http://localhost:3001"
    echo ""
    echo "  4. Check the logs:"
    echo "     docker-compose logs -f"
    echo ""
    echo "For more details, see QUICKSTART.md or README.md"
    echo "=========================================="
    exit 0
else
    echo -e "${RED}${WRENCH} Some checks failed. Please fix the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  • Install Docker: https://docs.docker.com/get-docker/"
    echo "  • Start Docker Desktop or daemon"
    echo "  • Stop services using required ports"
    echo "  • Ensure you're in the bob-pool directory"
    echo ""
    echo "Need help? Check QUICKSTART.md or README.md"
    echo "=========================================="
    exit 1
fi

# Made with Bob
