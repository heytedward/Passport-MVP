// src/utils/authCleanup.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

/**
 * Comprehensive cleanup function for user sign out
 * This ensures all user data is cleared from the app
 */
export const performAuthCleanup = async () => {
  console.log('🧹 Starting quick auth cleanup...');
  
  try {
    // 1. Clear localStorage (essential)
    try {
      localStorage.clear();
      console.log('✅ localStorage cleared');
    } catch (storageError) {
      console.log('⚠️ localStorage clear failed:', storageError);
    }
    
    // 2. Clear sessionStorage (essential)
    try {
      sessionStorage.clear();
      console.log('✅ sessionStorage cleared');
    } catch (storageError) {
      console.log('⚠️ sessionStorage clear failed:', storageError);
    }
    
    // 3. Clear browser caches (non-blocking)
    if (window.caches) {
      try {
        const cacheNames = await caches.keys();
        // Only clear Monarch Passport related caches
        const monarchCaches = cacheNames.filter(name => 
          name.includes('monarch') || name.includes('passport') || name.includes('papillon')
        );
        await Promise.all(monarchCaches.map(name => caches.delete(name)));
        console.log('✅ Monarch caches cleared');
      } catch (cacheError) {
        console.log('⚠️ Cache clear failed:', cacheError);
      }
    }
    
    // 4. Quick service worker cleanup (non-blocking)
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const monarchWorkers = registrations.filter(reg => 
          reg.scope.includes('localhost') || reg.scope.includes('monarch')
        );
        await Promise.all(monarchWorkers.map(registration => registration.unregister()));
        console.log('✅ Monarch service workers unregistered');
      } catch (swError) {
        console.log('⚠️ Service worker cleanup failed:', swError);
      }
    }
    
    console.log('✅ Quick auth cleanup completed');
    return true;
    
  } catch (error) {
    console.error('❌ Auth cleanup failed:', error);
    return false;
  }
};

/**
 * Force page reload to clear all React state
 */
export const forcePageReload = () => {
  console.log('🔄 Force reloading page to clear all state...');
  
  // Clear any remaining data
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (error) {
    console.log('⚠️ Final storage clear failed:', error);
  }
  
  // Force reload to clear all React state
  window.location.href = '/';
};

/**
 * Emergency cleanup when network is down
 */
export const emergencyCleanup = () => {
  console.log('🚨 Performing emergency cleanup...');
  
  try {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any visible user data
    document.querySelectorAll('[data-user]').forEach(el => {
      el.removeAttribute('data-user');
    });
    
    // Force reload
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Emergency cleanup failed:', error);
    // Last resort - redirect to home
    window.location.href = '/';
  }
}; 