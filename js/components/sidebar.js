// ============================================================
// SIDEBAR COMPONENT
// ============================================================

function renderSidebar() {
  const u = AppState.currentUser;
  const isAdmin = u && u.role === 'admin';

  const adminNav = isAdmin ? `
    <div class="sidebar-section-label">管理功能</div>
    <div class="sidebar-nav-item" data-page="projects">${svgIcon('folder', 18, 'icon')} 專案管理</div>
    <div class="sidebar-nav-item" data-page="tasks">${svgIcon('task', 18, 'icon')} 任務管理</div>
    <div class="sidebar-nav-item" data-page="gantt">${svgIcon('gantt', 18, 'icon')} 進度監控</div>
    <div class="sidebar-nav-item" data-page="members">${svgIcon('users', 18, 'icon')} 成員管理</div>
    <div class="sidebar-nav-item" data-page="reports">${svgIcon('chart', 18, 'icon')} 報表</div>
  ` : `
    <div class="sidebar-section-label">我的工作</div>
    <div class="sidebar-nav-item" data-page="my-tasks">${svgIcon('task', 18, 'icon')} 我的任務</div>
    <div class="sidebar-nav-item" data-page="work-progress">${svgIcon('activity', 18, 'icon')} 工作進度</div>
  `;

  const html = `
    <!-- Mobile overlay backdrop -->
    <div id="sidebar-backdrop" onclick="closeSidebar()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:40"></div>
    <div id="sidebar-panel" class="h-full bg-white border-r border-gray-200 flex flex-col sidebar-panel" style="width:240px">
      <!-- Logo -->
      <div class="p-5 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div style="width:36px;height:36px;background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:10px;display:flex;align-items:center;justify-content:center;">
            ${svgIcon('chart', 18, '')}
          </div>
          <div>
            <div class="font-bold text-gray-800 text-sm leading-tight">專案排程</div>
            <div class="text-xs text-gray-400">管理系統</div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-3 overflow-y-auto">
        <div class="sidebar-section-label">共用功能</div>
        <div class="sidebar-nav-item" data-page="dashboard">${svgIcon('home', 18, 'icon')} 首頁</div>
        <div class="sidebar-nav-item" data-page="notifications">${svgIcon('bell', 18, 'icon')} 通知中心
          <span id="notif-badge" class="ml-auto badge badge-red text-xs" style="padding:1px 6px;"></span>
        </div>
        ${adminNav}
        <div class="sidebar-section-label">其他功能</div>
        <div class="sidebar-nav-item" data-page="calendar">${svgIcon('calendar', 18, 'icon')} 行事曆</div>
        <div class="sidebar-nav-item" data-page="files">${svgIcon('file', 18, 'icon')} 檔案管理</div>
        <div class="sidebar-nav-item" data-page="discussion">${svgIcon('message', 18, 'icon')} 討論區</div>
      </nav>

      <!-- User footer -->
      <div class="p-4 border-t border-gray-100">
        <div class="flex items-center gap-3">
          <button onclick="navigateTo('profile');closeSidebar()" class="flex items-center gap-3 flex-1 min-w-0 hover:bg-gray-50 rounded-xl p-1 -m-1 transition-colors text-left">
            ${u ? userAvatar(u, 36) : ''}
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-gray-800 truncate">${u ? u.name : ''}</div>
              <div class="text-xs text-gray-400 truncate">${u ? AppState.roleLabel(u.role) : ''}</div>
            </div>
          </button>
          <button onclick="logout()" class="btn-icon btn-icon-red flex-shrink-0" title="登出">${svgIcon('logout', 16)}</button>
        </div>
      </div>
    </div>`;

  document.getElementById('sidebar-container').innerHTML = html;
  updateSidebarActive();
  updateNotifBadge();

  // nav click
  document.querySelectorAll('.sidebar-nav-item[data-page]').forEach(el => {
    el.addEventListener('click', () => { navigateTo(el.dataset.page); closeSidebar(); });
  });
}

function toggleSidebar() {
  const panel = document.getElementById('sidebar-panel');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!panel) return;
  const isOpen = panel.classList.contains('sidebar-open');
  if (isOpen) { closeSidebar(); } else { openSidebar(); }
}

function openSidebar() {
  const panel = document.getElementById('sidebar-panel');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!panel) return;
  panel.classList.add('sidebar-open');
  if (backdrop) backdrop.style.display = 'block';
}

function closeSidebar() {
  const panel = document.getElementById('sidebar-panel');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!panel) return;
  panel.classList.remove('sidebar-open');
  if (backdrop) backdrop.style.display = 'none';
}

function updateSidebarActive() {
  document.querySelectorAll('.sidebar-nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === AppState.currentPage);
  });
}

function updateNotifBadge() {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  const unread = getVisibleNotifications().filter(n => !n.read).length;
  badge.textContent = unread > 0 ? unread : '';
  badge.style.display = unread > 0 ? 'inline-flex' : 'none';
}
