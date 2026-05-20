/**
 * Pages Barrel Export File
 * 
 * This file exports all page components from a single location,
 * making imports cleaner and more maintainable.
 * 
 * Instead of:
 *   import Home from './pages/Home';
 * 
 * You can use:
 *   import { Home } from './pages';
 * 
 * This pattern is called a "barrel export" and helps organize
 * the codebase as it grows.
 */

export { default as Home } from './Home.jsx';
export { default as FindRides } from './FindRides.jsx';
export { default as MyRides } from './MyRides.jsx';
export { default as CreateRide } from './CreateRide.jsx';
export { default as Login } from './Login.jsx';
export { default as Register } from './Register.jsx';

// Future page components will be exported here, for example:
// export { default as MyRides } from './MyRides.jsx';
// export { default as Login } from './Login.jsx';
// export { default as Register } from './Register.jsx';
// export { default as Profile } from './Profile.jsx';

// Made with Bob
