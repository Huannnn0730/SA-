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
  discussion: '討論區 / 留言',
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
        <h1 class="text-lg font-bold text-gray-800">${title}</h1>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-400 hidden sm:block">${dateStr}</span>
        <div class="search-input-wrap hidden lg:block">
          ${svgIcon('search', 16, 'search-icon')}
          <input class="form-input" style="width:200px;padding-left:36px;height:36px;font-size:13px" placeholder="搜尋專案、任務..." />
        </div>
      </div>
    </header>`;

  const hbBtn = document.getElementById('hamburger-btn');
  if (hbBtn) hbBtn.addEventListener('click', toggleSidebar);
}
