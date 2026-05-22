.PHONY: up down build test clean

# Detect whether to use 'podman compose' or 'podman-compose'
# Windows-compatible: uses NUL and proper command quoting
PODMAN_COMPOSE := $(shell podman compose version >NUL 2>&1 && echo podman compose || echo podman-compose)

up:
	$(PODMAN_COMPOSE) up -d

down:
	$(PODMAN_COMPOSE) down

build:
	$(PODMAN_COMPOSE) down
	$(PODMAN_COMPOSE) up -d --build

test:
	cd backend && npm test

clean:
	$(PODMAN_COMPOSE) down -v

# Made with Bob
