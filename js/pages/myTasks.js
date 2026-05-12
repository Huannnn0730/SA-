// ============================================================
// MY TASKS PAGE (Executor)
// ============================================================

let myTaskFilter = { status: 'all', project: 'all', search: '' };

function renderMyTasks() {
  const u = AppState.currentUser;
  const myTasks = AppState.tasks.filter(t => t.assignee === u.id);
  const active = myTasks.filter(t => t.status === 'active').length;
  const done = myTasks.filter(t => t.status === 'done').length;
  const pending = myTasks.filter(t => t.status === 'pending').length;

  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <!-- Stats row -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        ${miniStatCard('進行中', active, '#dbeafe', '#2563eb')}
        ${miniStatCard('已完成', done, '#dcfce7', '#15803d')}
        ${miniStatCard('待開始', pending, '#f1f5f9', '#475569')}
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-gray-800 text-lg">我的任務</h2>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-3 mb-4">
          <select class="form-input form-select" style="width:130px" onchange="myTaskFilter.status=this.value;refreshMyTaskList()">
            <option value="all">全部狀態</option>
            <option value="active">進行中</option><option value="done">已完成</option><option value="pending">未開始</option>
          </select>
          <select class="form-input form-select" style="width:160px" onchange="myTaskFilter.project=this.value;refreshMyTaskList()">
            <option value="all">全部專案</option>
            ${AppState.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          <div class="search-input-wrap flex-1" style="min-width:160px">
            ${svgIcon('search', 16, 'search-icon')}
            <input class="form-input" style="padding-left:36px" placeholder="搜尋任務..." oninput="myTaskFilter.search=this.value;refreshMyTaskList()" />
          </div>
        </div>

        <div id="my-tasks-list" class="flex flex-col gap-3">
          ${renderMyTaskCards()}
        </div>
      </div>
    </div>`;
}

function miniStatCard(label, val, bg, color) {
  return `<div class="card flex items-center gap-4">
    <div style="width:44px;height:44px;background:${bg};border-radius:12px;display:flex;align-items:center;justify-content:center;color:${color};font-size:20px;font-weight:800">${val}</div>
    <span class="text-sm text-gray-600 font-medium">${label}</span>
  </div>`;
}

function getMyFilteredTasks() {
  const u = AppState.currentUser;
  return AppState.tasks.filter(t => {
    if (t.assignee !== u.id) return false;
    if (myTaskFilter.status !== 'all' && t.status !== myTaskFilter.status) return false;
    if (myTaskFilter.project !== 'all' && t.projectId !== parseInt(myTaskFilter.project)) return false;
    if (myTaskFilter.search && !t.name.includes(myTaskFilter.search)) return false;
    return true;
  });
}

function renderMyTaskCards() {
  const tasks = getMyFilteredTasks();
  if (!tasks.length) return `<div class="text-center text-gray-400 py-8">沒有符合條件的任務</div>`;

  return tasks.map(t => {
    const proj = AppState.getProject(t.projectId);
    const priorityColors = { high: '#ef4444', mid: '#f97316', low: '#22c55e' };
    const pColor = priorityColors[t.priority] || '#94a3b8';
    return `
      <div class="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer" onclick="navigateTo('task-detail');AppState.currentTaskId=${t.id}">
        <div style="width:4px;height:60px;background:${pColor};border-radius:4px;flex-shrink:0"></div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2 mb-2">
            <span class="font-semibold text-gray-800">${t.name}</span>
            <span class="badge ${AppState.statusBadge(t.status)} flex-shrink-0">${AppState.statusLabel(t.status)}</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-gray-400 mb-2">
            <span>${svgIcon('folder', 12)} ${proj ? proj.name : '—'}</span>
            <span>${svgIcon('clock', 12)} ${t.dueDate}</span>
            <span class="badge ${AppState.priorityBadge(t.priority)}">${AppState.priorityLabel(t.priority)}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex-1">${progressBar(t.progress, 'progress-blue')}</div>
            <span class="text-xs font-semibold text-gray-500">${t.progress}%</span>
          </div>
        </div>
      </div>`;
  }).join('');
}

function refreshMyTaskList() {
  const el = document.getElementById('my-tasks-list');
  if (el) el.innerHTML = renderMyTaskCards();
}
