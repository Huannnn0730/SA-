// ============================================================
// MAIN APP ENTRY POINT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Restore persisted data first
  loadAppState();

  // Restore session from sessionStorage
  const savedId = sessionStorage.getItem('userId');
  if (savedId) {
    const u = AppState.users.find(u => u.id === parseInt(savedId));
    if (u) AppState.currentUser = u;
  }

  // Restore currentTaskId
  const savedTaskId = sessionStorage.getItem('currentTaskId');
  if (savedTaskId) AppState.currentTaskId = parseInt(savedTaskId);

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

// 跨分頁即時同步：另一個分頁存了 appState 時，這個分頁自動更新
window.addEventListener('storage', (e) => {
  if (e.key !== 'appState' || !AppState.currentUser) return;
  loadAppState();
  // 保留當前登入者（loadAppState 不覆蓋 currentUser）
  renderSidebar();
  updateNotifBadge();
  // 重新 render 目前頁面，讓任務/通知即時反映
  renderPage(AppState.currentPage);
});
