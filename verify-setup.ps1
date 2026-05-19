# Bob Pool - Setup Verification Script (PowerShell)
# This script checks if your environment is ready to run the bob-pool application

# Enable strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

# Track overall status
$script:AllChecksPassed = $true

# Function to print success
function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

# Function to print error
function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
    $script:AllChecksPassed = $false
}

# Function to print warning
function Print-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Function to print info
function Print-Info {
    param([string]$Message)
    Write-Host "ℹ  $Message" -ForegroundColor Cyan
}

# Function to print section header
function Print-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "━━━ $Title ━━━" -ForegroundColor Blue
}

# Header
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Bob Pool - Setup Verification" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: Docker Installation
Print-Section "Checking Docker Installation"
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Docker is installed: $dockerVersion"
    } else {
        Print-Error "Docker is not installed"
        Print-Info "Install Docker Desktop from: https://docs.docker.com/desktop/install/windows-install/"
    }
} catch {
    Print-Error "Docker is not installed"
    Print-Info "Install Docker Desktop from: https://docs.docker.com/desktop/install/windows-install/"
}

# Check 2: Docker Daemon Running
Print-Section "Checking Docker Daemon"
try {
    $dockerInfo = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Docker daemon is running"
    } else {
        Print-Error "Docker daemon is not running"
        Print-Info "Start Docker Desktop from the Start menu"
    }
} catch {
    Print-Error "Docker daemon is not running"
    Print-Info "Start Docker Desktop from the Start menu"
}

# Check 3: Docker Compose
Print-Section "Checking Docker Compose"
try {
    # Try docker compose (new)
    $composeVersion = docker compose version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Docker Compose is available: $composeVersion"
    } else {
        # Try docker-compose (old)
        $composeVersion = docker-compose --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Print-Success "Docker Compose is available: $composeVersion"
        } else {
            Print-Error "Docker Compose is not available"
            Print-Info "Docker Compose should come with Docker Desktop"
        }
    }
} catch {
    Print-Error "Docker Compose is not available"
    Print-Info "Docker Compose should come with Docker Desktop"
}

# Check 4: Required Files
Print-Section "Checking Required Files"

$requiredFiles = @(
    "docker-compose.yml",
    "backend/Dockerfile",
    "backend/package.json",
    "backend/server.js",
    "backend/db.js",
    "backend/.env.example",
    "frontend/Dockerfile",
    "frontend/package.json",
    "frontend/vite.config.js",
    "frontend/index.html",
    "frontend/src/main.jsx",
    "frontend/src/App.jsx"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Print-Success $file
    } else {
        Print-Error "$file is missing"
    }
}

# Check 5: Port Availability
Print-Section "Checking Port Availability"

function Test-Port {
    param(
        [int]$Port,
        [string]$Service
    )
    
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if ($connection) {
            Print-Warning "Port $Port ($Service) is already in use"
            Print-Info "Stop the service using this port or change the port in docker-compose.yml"
        } else {
            Print-Success "Port $Port ($Service) is available"
        }
    } catch {
        # If Get-NetTCPConnection fails, try alternative method
        try {
            $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $Port)
            $listener.Start()
            $listener.Stop()
            Print-Success "Port $Port ($Service) is available"
        } catch {
            Print-Warning "Port $Port ($Service) is already in use"
            Print-Info "Stop the service using this port or change the port in docker-compose.yml"
        }
    }
}

Test-Port -Port 3000 -Service "Frontend"
Test-Port -Port 3001 -Service "Backend"
Test-Port -Port 5432 -Service "PostgreSQL"

# Check 6: Environment File
Print-Section "Checking Environment Configuration"
if (Test-Path "backend/.env") {
    Print-Success "backend/.env exists"
} else {
    Print-Warning "backend/.env not found"
    Print-Info "Copy backend/.env.example to backend/.env before running"
    Print-Info "Command: Copy-Item backend/.env.example backend/.env"
}

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

if ($script:AllChecksPassed) {
    Write-Host "🚀 All checks passed! You're ready to go!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "  1. Copy environment file (if not done):" -ForegroundColor White
    Write-Host "     Copy-Item backend/.env.example backend/.env" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Start the application:" -ForegroundColor White
    Write-Host "     docker-compose up --build" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Access the application:" -ForegroundColor White
    Write-Host "     Frontend: http://localhost:3000" -ForegroundColor Gray
    Write-Host "     Backend:  http://localhost:3001" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  4. Check the logs:" -ForegroundColor White
    Write-Host "     docker-compose logs -f" -ForegroundColor Gray
    Write-Host ""
    Write-Host "For more details, see QUICKSTART.md or README.md" -ForegroundColor White
    Write-Host "==========================================" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "🔧 Some checks failed. Please fix the issues above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor White
    Write-Host "  • Install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor Gray
    Write-Host "  • Start Docker Desktop from the Start menu" -ForegroundColor Gray
    Write-Host "  • Stop services using required ports" -ForegroundColor Gray
    Write-Host "  • Ensure you're in the bob-pool directory" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Need help? Check QUICKSTART.md or README.md" -ForegroundColor White
    Write-Host "==========================================" -ForegroundColor Cyan
    exit 1
}

# Made with Bob
