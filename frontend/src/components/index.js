/**
 * Components Barrel Export File
 * 
 * This file exports all components from a single location,
 * making imports cleaner and more maintainable.
 * 
 * Instead of:
 *   import Navbar from './components/Navbar';
 * 
 * You can use:
 *   import { Navbar } from './components';
 * 
 * This pattern is called a "barrel export" and helps organize
 * the codebase as it grows.
 */

export { default as Navbar } from './Navbar.jsx';

// Future components will be exported here, for example:
// export { default as Footer } from './Footer.jsx';
// export { default as RideCard } from './RideCard.jsx';
// export { default as SearchBar } from './SearchBar.jsx';

// Made with Bob
