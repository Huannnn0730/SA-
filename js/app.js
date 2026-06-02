// ============================================================
// MAIN APP ENTRY POINT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Restore session from sessionStorage
  const savedId = sessionStorage.getItem('userId');
  if (savedId) {
    const u = AppState.users.find(u => u.id === parseInt(savedId));
    if (u) AppState.currentUser = u;
  }

  // Read initial hash
  const hash = window.location.hash.replace('#', '');
  const startPage = hash && routes[hash] ? hash : 'login';
  AppState.currentPage = startPage;

  const authPages = ['login', 'register', 'forgot'];
  if (AppState.currentUser) {
    navigateTo(authPages.includes(startPage) ? 'dashboard' : startPage);
  } else {
    renderAuthPage(authPages.includes(startPage) ? startPage : 'login');
  }

  // UC31: Run risk scan on startup (will add alerts to notifications)
  setTimeout(() => checkRiskAlerts(), 800);
});

// Handle browser back/forward
window.addEventListener('hashchange', () => {
  const page = window.location.hash.replace('#', '');
  if (page && routes[page] && page !== AppState.currentPage) {
    AppState.currentPage = page;
    renderPage(page);
  }
});
