// ============================================================
// SIMPLE HASH ROUTER
// ============================================================

const routes = {
  // Auth
  login:         () => renderLogin(),
  register:      () => renderRegister(),
  forgot:        () => renderForgotPassword(),

  // Shared
  dashboard:     () => renderDashboard(),
  notifications: () => renderNotifications(),
  profile:       () => renderProfile(),
  calendar:      () => renderCalendar(),
  files:         () => renderFiles(),
  discussion:    () => renderDiscussion(),

  // Admin
  projects:      () => renderProjects(),
  tasks:         () => renderTasks(),
  gantt:         () => renderGantt(),
  members:       () => renderMembers(),
  reports:       () => renderReports(),

  // Executor
  'my-tasks':     () => renderMyTasks(),
  'task-detail':  () => renderTaskDetail(),
  'work-progress':() => renderWorkProgress(),
};

function navigateTo(page) {
  if (!AppState.currentUser && !['login','register','forgot'].includes(page)) {
    page = 'login';
  }
  AppState.currentPage = page;
  window.location.hash = '#' + page;
  renderPage(page);
}

function navigateAuth(page) {
  AppState.currentPage = page;
  renderAuthPage(page);
}

function renderPage(page) {
  if (!AppState.currentUser) {
    renderAuthPage(page);
    return;
  }

  showApp();
  renderSidebar();
  renderHeader();
  updateSidebarActive();

  const renderer = routes[page];
  if (renderer) {
    renderer();
  } else {
    document.getElementById('page-container').innerHTML = `
      <div class="card text-center py-16 text-gray-400">
        <div class="text-4xl mb-4">404</div>
        <div class="text-sm">找不到此頁面</div>
        <button onclick="navigateTo('dashboard')" class="btn btn-primary mt-4">返回首頁</button>
      </div>`;
  }
}

function renderAuthPage(page) {
  hideApp();
  const renderer = routes[page];
  if (renderer) renderer();
  else renderLogin();
}

function showApp() {
  document.getElementById('auth-container').className = 'hidden';
  document.getElementById('app-container').className = 'flex h-screen overflow-hidden bg-gray-100';
}

function hideApp() {
  document.getElementById('app-container').className = 'hidden';
  document.getElementById('auth-container').className = 'min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100';
}

function logout() {
  AppState.currentUser = null;
  AppState.currentPage = 'login';
  hideApp();
  renderLogin();
  showToast('已成功登出', 'info');
}
