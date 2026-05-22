.PHONY: help up down build test clean

# Detect whether to use 'podman compose' or 'podman-compose'
# Windows-compatible: uses NUL and proper command quoting
PODMAN_COMPOSE := $(shell podman compose version >NUL 2>&1 && echo podman compose || echo podman-compose)

# Default target: show help
.DEFAULT_GOAL := help

help:
	@echo Available targets:
	@echo   help   - Show this help message
	@echo   up     - Start all services
	@echo   down   - Stop all services
	@echo   build  - Rebuild and restart all services
	@echo   test   - Run backend tests in container
	@echo   clean  - Stop services and remove volumes

up:
	$(PODMAN_COMPOSE) up -d

down:
	$(PODMAN_COMPOSE) down

build:
	$(PODMAN_COMPOSE) down
	$(PODMAN_COMPOSE) up -d --build

test:
	@echo Running backend npm audit...
	$(PODMAN_COMPOSE) --project-name bobpool-test run --rm --no-deps backend npm audit --audit-level=high
	@echo Running backend tests in isolated environment...
	$(PODMAN_COMPOSE) --project-name bobpool-test run --rm --no-deps backend npm test
	$(PODMAN_COMPOSE) --project-name bobpool-test down --remove-orphans 2>NUL || echo Test cleanup complete

clean:
	$(PODMAN_COMPOSE) down -v

# Fallback for unknown targets
%:
	@echo Unknown target: $@
	@echo.
	@$(MAKE) help

# Made with Bob
