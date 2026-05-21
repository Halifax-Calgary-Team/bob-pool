# bob-pool

Bob Pool is an internal IBM carpooling web application that helps IBM employees coordinate rides to and from work.

## 🎯 Essentials

### MVP Functionality
- **Profiles**: IBM email address requirement for all users
- **Ride Creation**: Drivers can list a ride with pickup/dropoff locations, date, time, and number of seats available
- **Ride Search**: Riders can search for rides based on pickup/dropoff locations, date, and time
- **Status Management**: Drivers can accept or reject ride requests and update the status of their rides

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + React Router
- **Backend**: Node.js + Express
- **Database**: PostgreSQL 15
- **Containerization**: Podman + Podman Compose

## 📁 Project Structure

```
bob-pool/
├── backend/                 # Node.js/Express API server
│   ├── routes/             # API route handlers
│   │   ├── auth.js        # Authentication endpoints
│   │   ├── rides.js       # Ride management endpoints
│   │   └── index.js       # Route aggregator
│   ├── db.js              # Database connection & schema
│   ├── server.js          # Express server setup
│   ├── package.json       # Backend dependencies
│   ├── Containerfile      # Backend container config
│   └── .env.example       # Environment variables template
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS stylesheets
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # React entry point
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── Containerfile      # Frontend container config
│   └── index.html         # HTML template
├── podman-compose.yml      # Multi-container orchestration
├── .containerignore       # Container ignore patterns
├── README.md              # This file
├── API.md                 # API documentation
└── DEVELOPMENT.md         # Development guide
```

## 🚀 Getting Started

### Prerequisites

- **Podman** and **Podman Compose** installed
  - [Install Podman](https://podman.io/getting-started/installation)
  - [Install Podman Compose](https://github.com/containers/podman-compose#installation)
  - Podman runs rootless by default (no daemon required)

### Quick Start

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd bob-pool
   ```

2. **Start the application**:
   ```bash
   podman-compose up
   ```
   
   This single command will:
   - Build the frontend, backend, and database containers
   - Start all services
   - Initialize the database schema
   - Enable hot-reloading for development

3. **Access the application**:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001
   - **API Health Check**: http://localhost:3001/health

### First-Time Setup Notes

- The database will automatically initialize with the required tables on first run
- No manual database setup is needed
- The backend will wait for the database to be ready before starting
- All services will restart automatically if they crash

## 💻 Development

### Making Changes

The application is configured with **hot-reloading** for both frontend and backend:

- **Frontend changes**: Edit files in `frontend/src/` - the browser will automatically refresh
- **Backend changes**: Edit files in `backend/` - the server will automatically restart
- **Database changes**: Modify `backend/db.js` and restart containers

### Viewing Logs

View logs for all services:
```bash
podman-compose logs -f
```

View logs for a specific service:
```bash
podman-compose logs -f backend
podman-compose logs -f frontend
podman-compose logs -f db
```

### Stopping the Application

Stop all containers (keeps data):
```bash
podman-compose down
```

Stop and remove all data (fresh start):
```bash
podman-compose down -v
```

### Rebuilding After Dependency Changes

If you add new npm packages, rebuild the containers:
```bash
podman-compose down
podman-compose up --build
```

## 📚 API Documentation

The Bob Pool API provides RESTful endpoints for authentication, ride management, and ride requests.

- **Base URL**: http://localhost:3001/api
- **Authentication**: Session-based (cookies)
- **Format**: JSON

For complete API documentation including all endpoints, request/response examples, and status codes, see [API.md](./API.md).

### Quick API Overview

- **Authentication**: `/api/auth/*` - Register, login, logout, get current user
- **Rides**: `/api/rides/*` - Create, list, update, delete rides
- **Ride Requests**: `/api/rides/:id/request` - Request to join rides, accept/reject requests

## 🤝 Contributing

### For Team Members

1. **Pull latest changes** before starting work:
   ```bash
   git pull origin main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and test locally with Podman

4. **Commit with clear messages**:
   ```bash
   git add .
   git commit -m "Add: brief description of changes"
   ```

5. **Push and create a pull request**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Development Resources

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Detailed development guide with architecture overview, code organization, and how to add new features
- **[API.md](./API.md)** - Complete API reference with examples
- **[BACKEND-ONLY.md](./BACKEND-ONLY.md)** - Run only the backend server (useful for API testing)
- **[FRONTEND-LOCAL.md](./FRONTEND-LOCAL.md)** - Run frontend locally without containers (faster development)

### Code Style

- Use clear, descriptive variable and function names
- Add comments for complex logic
- Follow existing code patterns in the project
- Test your changes before committing

## 📞 Logistics & Communication

Keep it simple to avoid building complex notification systems or chat engines:

- **Email-based communication**: Use the user's default email client to send notifications and messages
- **Basic notifications**: Email or browser alerts for ride status changes
- **Location pins**: Use map API (maybe Google) for pickup/dropoff locations

## 👨‍💼 Admin & Governance

- **Admin dashboard**: View and manage all rides and users
- **Company email domain lockdown**: Restrict user registration to IBM email addresses (@ibm.com)

## ✂️ What to Cut

To hit the one month deadline, avoid these time-intensive features:

- **In-app payments**: Stick to cash/e-transfer on arrival
- **AI matching algorithm**: Let users search manually for now
- **Real-time tracking**: Use static location pins for now

---

**Made with Bob** 🚗
