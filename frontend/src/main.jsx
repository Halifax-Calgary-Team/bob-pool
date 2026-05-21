import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import '@carbon/styles/css/styles.css';
import './styles/main.css';

/**
 * Main entry point for the Bob Pool React application
 * 
 * This file:
 * 1. Imports React and ReactDOM for rendering
 * 2. Imports BrowserRouter for client-side routing
 * 3. Imports the main App component
 * 4. Imports global styles
 * 5. Renders the App wrapped in BrowserRouter to enable routing
 */

// Get the root DOM element from index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
// BrowserRouter enables client-side routing throughout the app
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Made with Bob
