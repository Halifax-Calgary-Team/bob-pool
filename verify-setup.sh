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

# Check 1: Podman Installation
print_section "Checking Podman Installation"
if command -v podman &> /dev/null; then
    PODMAN_VERSION=$(podman --version)
    print_success "Podman is installed: $PODMAN_VERSION"
else
    print_error "Podman is not installed"
    print_info "Install Podman from: https://podman.io/getting-started/installation"
fi

# Check 2: Podman Running
print_section "Checking Podman"
if podman info &> /dev/null; then
    print_success "Podman is running"
else
    print_error "Podman is not running properly"
    print_info "On Mac/Windows: Start Podman machine with: podman machine start"
    print_info "On Linux: Podman should work without a daemon"
fi

# Check 3: Podman Compose
print_section "Checking Podman Compose"
if command -v podman-compose &> /dev/null; then
    COMPOSE_VERSION=$(podman-compose --version)
    print_success "Podman Compose is available: $COMPOSE_VERSION"
else
    print_error "Podman Compose is not available"
    print_info "Install from: https://github.com/containers/podman-compose#installation"
fi

# Check 4: Required Files
print_section "Checking Required Files"

REQUIRED_FILES=(
    "podman-compose.yml"
    "backend/Containerfile"
    "backend/package.json"
    "backend/server.js"
    "backend/db.js"
    "backend/.env.example"
    "frontend/Containerfile"
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
            print_info "Stop the service using this port or change the port in podman-compose.yml"
        else
            print_success "Port $port ($service) is available"
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tuln | grep -q ":$port "; then
            print_warning "Port $port ($service) is already in use"
            print_info "Stop the service using this port or change the port in podman-compose.yml"
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
    echo "     podman-compose up --build"
    echo ""
    echo "  3. Access the application:"
    echo "     Frontend: http://localhost:3000"
    echo "     Backend:  http://localhost:3001"
    echo ""
    echo "  4. Check the logs:"
    echo "     podman-compose logs -f"
    echo ""
    echo "For more details, see QUICKSTART.md or README.md"
    echo "=========================================="
    exit 0
else
    echo -e "${RED}${WRENCH} Some checks failed. Please fix the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  • Install Podman: https://podman.io/getting-started/installation"
    echo "  • Install Podman Compose: https://github.com/containers/podman-compose"
    echo "  • Start Podman machine (Mac/Windows): podman machine start"
    echo "  • Stop services using required ports"
    echo "  • Ensure you're in the bob-pool directory"
    echo ""
    echo "Need help? Check QUICKSTART.md or README.md"
    echo "=========================================="
    exit 1
fi

# Made with Bob
