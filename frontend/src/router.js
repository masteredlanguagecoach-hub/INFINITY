import { auth } from './auth.js';

let routes = {};
let onRouteCallback = null;

export const router = {
  init(definedRoutes) {
    routes = definedRoutes;
    window.addEventListener('hashchange', () => this.handleHashChange());
    // Trigger immediately on load
    this.handleHashChange();
  },
  
  navigate(path) {
    const targetHash = path.startsWith('#') ? path : '#' + path;
    if (window.location.hash === targetHash) {
      this.handleHashChange();
    } else {
      window.location.hash = targetHash;
    }
  },
  
  onRoute(cb) {
    onRouteCallback = cb;
  },
  
  handleHashChange() {
    let rawHash = window.location.hash;
    if (rawHash.startsWith('#')) rawHash = rawHash.slice(1);
    const path = (rawHash || '/').split('?')[0];
    
    // Auth check
    if (!auth.isAuthenticated() && path !== '/login') {
      this.navigate('/login');
      return;
    }
    if (auth.isAuthenticated() && path === '/login') {
      this.navigate('/');
      return;
    }
    
    let matchedRoute = routes[path] || routes['*'];
    if (!matchedRoute) return;
    
    // Role check
    if (matchedRoute.module && !auth.canAccess(matchedRoute.module)) {
      console.warn(`Access denied to module ${matchedRoute.module}`);
      this.navigate('/');
      return;
    }
    
    if (onRouteCallback) {
      onRouteCallback(matchedRoute);
    }
  }
};

