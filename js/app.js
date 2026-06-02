// ============================================================
// MAIN APP ENTRY POINT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Read initial hash
  const hash = window.location.hash.replace('#', '');
  const startPage = hash && routes[hash] ? hash : 'login';

  AppState.currentPage = startPage;

  if (AppState.currentUser) {
    navigateTo(startPage === 'login' ? 'dashboard' : startPage);
  } else {
    renderAuthPage(startPage);
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
