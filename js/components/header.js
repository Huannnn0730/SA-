// ============================================================
// HEADER COMPONENT
// ============================================================

const pageTitles = {
  dashboard: '首頁',
  notifications: '通知中心',
  profile: '個人資料',
  projects: '專案管理',
  tasks: '任務管理',
  gantt: '進度監控 (甘特圖)',
  members: '成員管理',
  reports: '報表',
  'my-tasks': '我的任務',
  'task-detail': '任務詳細',
  'work-progress': '工作進度',
  calendar: '行事曆',
  files: '檔案管理',
  discussion: '討論區',
};

function renderHeader() {
  const u = AppState.currentUser;
  const title = pageTitles[AppState.currentPage] || '首頁';
  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`;

  document.getElementById('header-container').innerHTML = `
    <header class="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between" style="height:64px">
      <div class="flex items-center gap-3">
        <!-- Hamburger button (mobile only) -->
        <button id="hamburger-btn" class="btn-icon md:hidden">
          ${svgIcon('menu', 22)}
        </button>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-400 hidden sm:block">${dateStr}</span>
        <div class="search-input-wrap hidden lg:block" style="position:relative">
          ${svgIcon('search', 16, 'search-icon')}
          <input id="global-search-input" class="form-input" style="width:200px;padding-left:36px;height:36px;font-size:13px" placeholder="搜尋專案、任務..."
            oninput="globalSearch(this.value)"
            onblur="setTimeout(()=>{ const d=document.getElementById('global-search-dropdown'); if(d) d.remove(); },150)"
          />
          <div id="global-search-dropdown"></div>
        </div>
      </div>
    </header>`;

  const hbBtn = document.getElementById('hamburger-btn');
  if (hbBtn) hbBtn.addEventListener('click', toggleSidebar);
}

function globalSearch(query) {
  const dropdown = document.getElementById('global-search-dropdown');
  if (!dropdown) return;
  if (!query.trim()) { dropdown.innerHTML = ''; return; }

  const u = AppState.currentUser;
  const isAdmin = u?.role === 'admin';
  const q = query.toLowerCase();

  const matchedTasks = AppState.tasks
    .filter(t => (!isAdmin ? t.assignee === u.id : true) && t.name.toLowerCase().includes(q))
    .slice(0, 5);

  const matchedProjects = isAdmin
    ? AppState.projects.filter(p => p.name.toLowerCase().includes(q)).slice(0, 3)
    : [];

  if (!matchedTasks.length && !matchedProjects.length) {
    dropdown.innerHTML = `<div style="padding:12px 16px;font-size:13px;color:#94a3b8">找不到相關結果</div>`;
  } else {
    dropdown.innerHTML = `
      ${matchedProjects.length ? `
        <div style="padding:6px 16px 2px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">專案</div>
        ${matchedProjects.map(p => `
          <div onclick="navigateTo('projects')" style="padding:8px 16px;font-size:13px;color:#374151;cursor:pointer;display:flex;align-items:center;gap:8px" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background=''">
            ${svgIcon('folder', 14)} ${p.name}
          </div>`).join('')}` : ''}
      ${matchedTasks.length ? `
        <div style="padding:6px 16px 2px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;${matchedProjects.length?'border-top:1px solid #f1f5f9;margin-top:4px':''}">任務</div>
        ${matchedTasks.map(t => {
          const proj = AppState.getProject(t.projectId);
          return `
          <div onclick="AppState.currentTaskId=${t.id};navigateTo('task-detail')" style="padding:8px 16px;font-size:13px;color:#374151;cursor:pointer;display:flex;align-items:center;gap:8px" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background=''">
            ${svgIcon('task', 14)}
            <div>
              <div>${t.name}</div>
              ${proj ? `<div style="font-size:11px;color:#94a3b8">${proj.name}</div>` : ''}
            </div>
          </div>`;
        }).join('')}` : ''}`;
  }

  dropdown.style.cssText = `
    position:absolute;top:calc(100% + 6px);left:0;width:280px;background:white;
    border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.12);border:1px solid #e2e8f0;
    z-index:999;overflow:hidden;padding:4px 0`;
}
