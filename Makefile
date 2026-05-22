.PHONY: help up down build test test-container clean

# Detect whether to use 'podman compose' or 'podman-compose'
# Windows-compatible: uses NUL and proper command quoting
PODMAN_COMPOSE := $(shell podman compose version >NUL 2>&1 && echo podman compose || echo podman-compose)

# Default target: show help
.DEFAULT_GOAL := help

help:
	@echo Available targets:
	@echo   help           - Show this help message
	@echo   up             - Start all services
	@echo   down           - Stop all services
	@echo   build          - Rebuild and restart all services
	@echo   test           - Run backend tests in container
	@echo   test-container - Build and test production container image
	@echo   clean          - Stop services and remove volumes

up:
	$(PODMAN_COMPOSE) up

down:
	$(PODMAN_COMPOSE) down

build:
	$(PODMAN_COMPOSE) down
	$(PODMAN_COMPOSE) up --build

test:
	@echo Running backend npm audit...
	$(PODMAN_COMPOSE) --project-name bobpool-test run --rm --no-deps backend npm audit --audit-level=high
	@echo Running frontend npm audit...
	$(PODMAN_COMPOSE) --project-name bobpool-test run --rm --no-deps frontend npm audit --audit-level=moderate
	@echo Running backend tests in isolated environment...
	$(PODMAN_COMPOSE) --project-name bobpool-test run --rm --no-deps -e AUTO_INIT_DB=false backend npm test
	$(PODMAN_COMPOSE) --project-name bobpool-test down --remove-orphans 2>NUL || echo Test cleanup complete

clean:
	$(PODMAN_COMPOSE) down -v

test-container:
	@echo "Building production container image..."
	podman build -t bob-pool-test -f Containerfile .
	@echo ""
	@echo "Starting test container on port 8081..."
	@podman rm -f bob-pool-test-instance 2>/dev/null || true
	podman run -d --name bob-pool-test-instance -p 8081:8080 -e DB_PASSWORD=testpass123 bob-pool-test
	@echo ""
	@echo "Waiting 30 seconds for container initialization..."
	@sleep 30
	@echo ""
	@echo "Running health check..."
	@podman exec bob-pool-test-instance /usr/local/bin/healthcheck.sh && (echo "" && echo "✅ Container test passed!" && echo "" && podman stop bob-pool-test-instance >/dev/null 2>&1 && podman rm bob-pool-test-instance >/dev/null 2>&1) || (echo "" && echo "❌ Container test failed!" && echo "" && echo "Container logs:" && podman logs bob-pool-test-instance && podman stop bob-pool-test-instance >/dev/null 2>&1 && podman rm bob-pool-test-instance >/dev/null 2>&1 && exit 1)

# Fallback for unknown targets
%:
	@echo Unknown target: $@
	@echo.
	@$(MAKE) help

# Made with Bob
