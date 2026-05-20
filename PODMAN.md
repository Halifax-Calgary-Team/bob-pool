# Podman Migration Guide

This document explains the migration from Docker to Podman for the Bob Pool project and provides Podman-specific information.

## 🔄 What Changed

The Bob Pool project has been migrated from Docker to Podman. Here's what changed:

### File Renames
- `docker-compose.yml` → `podman-compose.yml`
- `backend/Dockerfile` → `backend/Containerfile`
- `frontend/Dockerfile` → `frontend/Containerfile`

### Command Changes
All Docker commands have been replaced with Podman equivalents:

| Docker Command | Podman Command |
|----------------|----------------|
| `docker-compose up` | `podman-compose up` |
| `docker-compose down` | `podman-compose down` |
| `docker-compose logs` | `podman-compose logs` |
| `docker ps` | `podman ps` |
| `docker exec` | `podman exec` |
| `docker build` | `podman build` |

## 🆚 Podman vs Docker: Key Differences

### 1. **No Daemon Required**
- **Docker**: Requires a background daemon process running as root
- **Podman**: Runs containers directly without a daemon (daemonless architecture)

**Benefit**: Simpler architecture, no single point of failure

### 2. **Rootless by Default**
- **Docker**: Typically runs as root, requires sudo or docker group membership
- **Podman**: Runs rootless by default, improving security

**Benefit**: Better security, no need for elevated privileges

### 3. **Drop-in Replacement**
- Podman is designed to be compatible with Docker CLI
- Most Docker commands work with Podman by simply replacing `docker` with `podman`
- Containerfiles are compatible with Dockerfiles

### 4. **Podman Machine (Mac/Windows)**
- On Mac and Windows, Podman uses a lightweight VM (similar to Docker Desktop)
- Managed with `podman machine` commands

### 5. **No Docker Desktop**
- Podman doesn't require Docker Desktop
- Lighter weight and open source

## 📦 Installation

### Linux

**Fedora/RHEL/CentOS:**
```bash
sudo dnf install podman podman-compose
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install podman podman-compose
```

**Arch Linux:**
```bash
sudo pacman -S podman podman-compose
```

### macOS

**Using Homebrew:**
```bash
brew install podman podman-compose

# Initialize and start the Podman machine
podman machine init
podman machine start
```

### Windows

**Using Chocolatey:**
```powershell
choco install podman podman-compose
```

**Using Windows Installer:**
1. Download from [Podman Windows](https://github.com/containers/podman/releases)
2. Install Podman
3. Install Podman Compose: `pip install podman-compose`

**Initialize Podman machine:**
```powershell
podman machine init
podman machine start
```

## 🚀 Getting Started with Podman

### First-Time Setup

1. **Install Podman and Podman Compose** (see above)

2. **Initialize Podman machine** (Mac/Windows only):
   ```bash
   podman machine init
   podman machine start
   ```

3. **Verify installation**:
   ```bash
   podman --version
   podman-compose --version
   ```

4. **Run the verification script**:
   ```bash
   # Linux/Mac
   ./verify-setup.sh
   
   # Windows
   .\verify-setup.ps1
   ```

### Running Bob Pool with Podman

```bash
# Start all services
podman-compose up

# Start in detached mode
podman-compose up -d

# View logs
podman-compose logs -f

# Stop services
podman-compose down

# Stop and remove volumes
podman-compose down -v
```

## 🔧 Podman-Specific Commands

### Managing Podman Machine (Mac/Windows)

```bash
# Start the Podman machine
podman machine start

# Stop the Podman machine
podman machine stop

# Check machine status
podman machine list

# SSH into the machine
podman machine ssh

# Remove the machine
podman machine rm
```

### Container Management

```bash
# List running containers
podman ps

# List all containers
podman ps -a

# View container logs
podman logs <container-name>

# Execute command in container
podman exec -it <container-name> /bin/bash

# Inspect container
podman inspect <container-name>

# Remove container
podman rm <container-name>
```

### Image Management

```bash
# List images
podman images

# Build image
podman build -t myimage .

# Remove image
podman rmi <image-name>

# Pull image
podman pull <image-name>

# Prune unused images
podman image prune
```

### Volume Management

```bash
# List volumes
podman volume ls

# Inspect volume
podman volume inspect <volume-name>

# Remove volume
podman volume rm <volume-name>

# Prune unused volumes
podman volume prune
```

## 🐛 Troubleshooting

### Podman Machine Not Starting (Mac/Windows)

**Issue**: `podman machine start` fails

**Solutions**:
```bash
# Remove and recreate the machine
podman machine stop
podman machine rm
podman machine init
podman machine start

# Check machine status
podman machine list
```

### Permission Denied Errors

**Issue**: Permission errors when running Podman

**Solution**:
Podman runs rootless by default. If you encounter permission issues:
```bash
# Check if running rootless
podman info | grep rootless

# If needed, run with sudo (not recommended)
sudo podman <command>
```

### Port Already in Use

**Issue**: Ports 3000, 3001, or 5432 are already allocated

**Solution**:
```bash
# Find what's using the port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change ports in podman-compose.yml
```

### Podman Compose Not Found

**Issue**: `podman-compose: command not found`

**Solution**:
```bash
# Install podman-compose
pip3 install podman-compose

# Or using package manager
# Fedora/RHEL
sudo dnf install podman-compose

# Ubuntu/Debian
sudo apt-get install podman-compose

# macOS
brew install podman-compose
```

### Container Build Fails

**Issue**: Build fails with network or dependency errors

**Solution**:
```bash
# Clear cache and rebuild
podman system prune -a
podman-compose build --no-cache
podman-compose up
```

## 🔄 Migrating from Docker

If you previously used Docker for this project:

1. **Uninstall Docker** (optional):
   - You can keep Docker installed; Podman and Docker can coexist
   - Or remove Docker Desktop if you prefer

2. **Install Podman** (see Installation section above)

3. **Update your workflow**:
   - Replace `docker` with `podman` in your commands
   - Replace `docker-compose` with `podman-compose`

4. **Existing volumes and data**:
   - Podman uses different storage locations
   - You'll need to recreate your database (data won't transfer automatically)
   - Run `podman-compose up` to initialize fresh

## 📊 Performance Comparison

### Podman Advantages
- ✅ No daemon overhead
- ✅ Better security (rootless)
- ✅ Lighter resource usage
- ✅ Native systemd integration (Linux)
- ✅ Compatible with Kubernetes YAML

### Docker Advantages
- ✅ More mature ecosystem
- ✅ Better GUI tools (Docker Desktop)
- ✅ Wider community support

## 🔗 Additional Resources

- **Podman Official Documentation**: https://docs.podman.io/
- **Podman Compose**: https://github.com/containers/podman-compose
- **Podman vs Docker**: https://docs.podman.io/en/latest/Introduction.html
- **Podman Desktop**: https://podman-desktop.io/ (GUI alternative to Docker Desktop)
- **Migration Guide**: https://podman.io/getting-started/migration

## 💡 Tips and Best Practices

1. **Use Podman Desktop**: For a GUI experience similar to Docker Desktop
2. **Alias for compatibility**: Add `alias docker=podman` to your shell config
3. **Rootless is safer**: Stick with rootless mode unless you have specific needs
4. **Machine management**: On Mac/Windows, ensure the Podman machine is running
5. **Volume persistence**: Data persists in Podman volumes between restarts

## 🆘 Getting Help

If you encounter issues:

1. **Check Podman status**: `podman info`
2. **View logs**: `podman-compose logs -f`
3. **Run verification**: `./verify-setup.sh` or `.\verify-setup.ps1`
4. **Consult documentation**: See links in Additional Resources
5. **Check project docs**: README.md, QUICKSTART.md, DEVELOPMENT.md

---

**Made with Bob** 🚗