# Running Frontend Locally (Without Container)

This guide explains how to run the frontend application locally on your machine without using containers, while the backend runs in a container.

## Prerequisites

- Node.js 18 or higher installed
- npm (comes with Node.js)
- Backend server running (see [BACKEND-ONLY.md](BACKEND-ONLY.md))

## Quick Start

### 1. Start the Backend Server

First, start the backend server using containers:

```bash
# From the project root directory
podman-compose -f compose.backend-only.yml up -d
```

This will start the backend API on `http://localhost:3001` and the database.

### 2. Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 3. Configure Environment

Create a `.env` file from the example:

```bash
# Copy the example environment file
cp .env.example .env
```

The `.env` file should contain:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
```

### 4. Start the Frontend Development Server

```bash
# Run with local configuration
npm run dev -- --config vite.config.local.js

# Or simply (uses default config with proxy)
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Development Workflow

### Hot Reloading

The Vite development server provides instant hot module replacement (HMR). Any changes you make to the frontend code will be reflected immediately in the browser without a full page reload.

### API Proxy

The local Vite configuration includes a proxy that forwards all `/api/*` requests to `http://localhost:3001`. This means:

- Frontend makes requests to `/api/auth/login`
- Vite proxies it to `http://localhost:3001/api/auth/login`
- No CORS issues!

### File Structure

```
frontend/
├── src/
│   ├── components/     # Reusable React components
│   ├── contexts/       # React context providers
│   ├── pages/          # Page components
│   ├── styles/         # CSS stylesheets
│   ├── config/         # Configuration files
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite config (for containers)
└── vite.config.local.js # Vite config (for local dev)
```

## Available Scripts

```bash
# Start development server
npm run dev

# Start with local config explicitly
npm run dev -- --config vite.config.local.js

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing the Setup

Once both backend and frontend are running:

1. Open `http://localhost:3000` in your browser
2. You should see the Bob Pool home page
3. Try registering a new user (must use @ibm.com email)
4. Login and test the features

## Troubleshooting

### Port 3000 Already in Use

If port 3000 is already in use:

```bash
# Find what's using the port
lsof -i :3000

# Kill the process or change the port in vite.config.local.js
```

### API Connection Issues

If the frontend can't connect to the backend:

1. **Check backend is running:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Check backend logs:**
   ```bash
   podman-compose -f compose.backend-only.yml logs backend
   ```

3. **Verify proxy configuration** in `vite.config.local.js`:
   ```javascript
   proxy: {
     '/api': {
       target: 'http://localhost:3001',
       changeOrigin: true,
       secure: false
     }
   }
   ```

### Module Not Found Errors

If you get module not found errors:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

If you see CORS errors in the browser console:

- Make sure you're using the proxy configuration (requests should go to `/api/*` not `http://localhost:3001/api/*`)
- Check that the backend is running and accessible
- Verify the proxy settings in `vite.config.local.js`

## Environment Variables

The frontend uses Vite's environment variable system. Variables must be prefixed with `VITE_`:

```env
# .env file
VITE_API_BASE_URL=http://localhost:3001
```

Access in code:

```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## Building for Production

To create a production build:

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The build output will be in the `dist/` directory.

## Switching Between Local and Container

### Local Development (Current Setup)
```bash
# Backend in container
podman-compose -f compose.backend-only.yml up -d

# Frontend locally
cd frontend && npm run dev
```

### Full Container Setup
```bash
# Everything in containers
podman-compose up
```

### Hybrid Development
You can also run the backend locally if needed:

```bash
# Start database only
podman-compose -f compose.backend-only.yml up db -d

# Run backend locally
cd backend
npm install
npm run dev

# Run frontend locally
cd frontend
npm run dev
```

## IDE Setup

### VS Code

Recommended extensions:
- ESLint
- Prettier
- ES7+ React/Redux/React-Native snippets
- Vite

### Settings

Create `.vscode/settings.json` in the frontend directory:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Performance Tips

1. **Use React DevTools** browser extension for debugging
2. **Enable source maps** (already configured in Vite)
3. **Use the Network tab** to monitor API calls
4. **Check Console** for errors and warnings

## Next Steps

- See [API.md](API.md) for API documentation
- See [DEVELOPMENT.md](DEVELOPMENT.md) for development guidelines
- See [QUICKSTART.md](QUICKSTART.md) for full stack setup

# Made with Bob