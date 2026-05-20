# 🚀 Bob Pool - Quick Start Guide

Get the Bob Pool carpooling application running in **5 minutes**!

## ✅ Prerequisites Checklist

Before you begin, make sure you have:

- [ ] **Docker Desktop** installed and running
  - Download: [Windows](https://docs.docker.com/desktop/install/windows-install/) | [Mac](https://docs.docker.com/desktop/install/mac-install/) | [Linux](https://docs.docker.com/desktop/install/linux-install/)
- [ ] **Git** (to clone the repository)
- [ ] **8GB RAM** minimum (Docker requirement)
- [ ] **Ports 3000, 3001, and 5432** available

## 🔍 Verify Your Setup

Run the verification script to check if everything is ready:

**Linux/Mac:**
```bash
chmod +x verify-setup.sh
./verify-setup.sh
```

**Windows (PowerShell):**
```powershell
.\verify-setup.ps1
```

If all checks pass ✓, continue to the next step!

## 🏃 Quick Start (3 Steps)

### Step 1: Configure Environment

Copy the example environment file:

**Linux/Mac:**
```bash
cp backend/.env.example backend/.env
```

**Windows (PowerShell):**
```powershell
Copy-Item backend/.env.example backend/.env
```

**Windows (Command Prompt):**
```cmd
copy backend\.env.example backend\.env
```

> 💡 **Tip:** The default configuration works out of the box. You can customize it later if needed.

### Step 2: Start the Application

Build and start all services with Docker Compose:

```bash
docker-compose up --build
```

> ⏱️ **First run takes 2-3 minutes** to download images and build containers.

### Step 3: Access the Application

Once you see "Server running on port 3001" in the logs:

- **Frontend (React):** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Health Check:** http://localhost:3001/health

## ✨ What You Should See

### Terminal Output
```
✓ Database connected successfully
✓ Server running on port 3001
✓ Frontend dev server running on port 3000
```

### Browser
- Navigate to http://localhost:3000
- You should see the Bob Pool home page
- Try registering a new account
- Create your first ride!

## 🛠️ Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop the Application
```bash
# Stop and remove containers
docker-compose down

# Stop, remove containers, and delete volumes (fresh start)
docker-compose down -v
```

### Restart a Service
```bash
# Restart backend only
docker-compose restart backend

# Rebuild and restart
docker-compose up --build backend
```

### Access Database
```bash
# Connect to PostgreSQL
docker-compose exec db psql -U bobpool -d bobpool

# View tables
\dt

# Exit
\q
```

## 🐛 Common Issues & Fixes

### Issue: Port Already in Use

**Error:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Fix:**
```bash
# Find what's using the port (Linux/Mac)
lsof -i :3000

# Find what's using the port (Windows)
netstat -ano | findstr :3000

# Stop the conflicting service or change the port in docker-compose.yml
```

### Issue: Docker Daemon Not Running

**Error:** `Cannot connect to the Docker daemon`

**Fix:**
- **Windows/Mac:** Start Docker Desktop from the Start menu or Applications
- **Linux:** `sudo systemctl start docker`

### Issue: Permission Denied (Linux)

**Error:** `permission denied while trying to connect to the Docker daemon socket`

**Fix:**
```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker
```

### Issue: Build Fails with Network Error

**Error:** `failed to fetch` or `network timeout`

**Fix:**
```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -a
docker-compose up --build
```

### Issue: Database Connection Failed

**Error:** `ECONNREFUSED` or `database connection failed`

**Fix:**
```bash
# Ensure database is healthy
docker-compose ps

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

### Issue: Frontend Shows Blank Page

**Fix:**
1. Check browser console for errors (F12)
2. Verify backend is running: http://localhost:3001/health
3. Clear browser cache and reload
4. Restart frontend: `docker-compose restart frontend`

## 📚 Next Steps

Now that you're up and running:

1. **Explore the API** - Check out [API.md](API.md) for endpoint documentation
2. **Development Guide** - See [DEVELOPMENT.md](DEVELOPMENT.md) for development workflows
3. **Full Documentation** - Read [README.md](README.md) for complete project details
4. **Make Changes** - Edit code and see live updates (hot reload enabled)

## 🎯 Quick Feature Tour

### Register & Login
1. Go to http://localhost:3000
2. Click "Register" and create an account
3. Login with your credentials

### Create a Ride
1. Click "Create Ride" in the navigation
2. Fill in ride details (origin, destination, date, time)
3. Set available seats and price
4. Submit to create your ride

### Find Rides
1. Browse available rides on the home page
2. Use filters to find rides matching your needs
3. Click "Book" to reserve a seat

### View Your Rides
1. Check "My Rides" to see rides you've created
2. View bookings for your rides
3. Manage your ride listings

## 💡 Pro Tips

- **Hot Reload:** Code changes auto-reload in development mode
- **Database Persistence:** Data persists between restarts (stored in Docker volume)
- **Fresh Start:** Use `docker-compose down -v` to reset everything
- **Logs:** Keep logs open in a separate terminal for debugging
- **API Testing:** Use tools like Postman or curl to test the API directly

## 🆘 Need Help?

- **Verification Failed?** Run the verify script again after fixing issues
- **Still Stuck?** Check the full [README.md](README.md) for detailed troubleshooting
- **Found a Bug?** Check existing issues or create a new one

## 🎉 Success!

If you can see the Bob Pool interface and create an account, you're all set! Happy carpooling! 🚗💨

---

**Quick Reference:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Database: localhost:5432
- Stop: `docker-compose down`
- Logs: `docker-compose logs -f`