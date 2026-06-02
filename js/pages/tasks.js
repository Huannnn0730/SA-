// ============================================================
// TASK MANAGEMENT PAGE (Admin)
// ============================================================

let taskFilter = { status: 'all', assignee: 'all', search: '' };
let taskView = 'list'; // 'list' | 'kanban'

function renderTasks() {
  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="card">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 class="font-bold text-gray-800 text-lg">任務管理</h2>
          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- View Toggle -->
            <div class="flex rounded-lg border border-gray-200 overflow-hidden">
              <button id="view-list" onclick="switchTaskView('list')"
                class="px-3 py-1.5 text-sm flex items-center gap-1 transition-colors ${taskView==='list'?'bg-blue-600 text-white':'bg-white text-gray-500 hover:bg-gray-50'}">
                ${svgIcon('list', 15)} 列表
              </button>
              <button id="view-kanban" onclick="switchTaskView('kanban')"
                class="px-3 py-1.5 text-sm flex items-center gap-1 transition-colors border-l border-gray-200 ${taskView==='kanban'?'bg-blue-600 text-white':'bg-white text-gray-500 hover:bg-gray-50'}">
                ${svgIcon('layout', 15)} 看板
              </button>
            </div>
            <button onclick="openAddTaskModal()" class="btn btn-primary">${svgIcon('plus', 16)} 新增任務</button>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-3 mb-4">
          <select class="form-input form-select" style="width:140px" onchange="taskFilter.status=this.value;refreshTaskView()">
            <option value="all">全部狀態</option>
            <option value="active">進行中</option><option value="done">已完成</option>
            <option value="pending">未開始</option><option value="paused">暫停中</option>
          </select>
          <select class="form-input form-select" style="width:140px" onchange="taskFilter.assignee=this.value;refreshTaskView()">
            <option value="all">全部負責人</option>
            ${AppState.members.filter(m => m.role !== 'admin').map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
          </select>
          <div class="search-input-wrap flex-1" style="min-width:180px">
            ${svgIcon('search', 16, 'search-icon')}
            <input class="form-input" style="padding-left:36px" placeholder="搜尋任務..." oninput="taskFilter.search=this.value;refreshTaskView()" />
          </div>
        </div>

        <div id="task-view-container">
          ${taskView === 'list' ? renderListView() : renderKanbanView()}
        </div>
      </div>
    </div>`;
}

function switchTaskView(view) {
  taskView = view;
  renderTasks();
}

function refreshTaskView() {
  const container = document.getElementById('task-view-container');
  if (container) container.innerHTML = taskView === 'list' ? renderListView() : renderKanbanView();
}

// ── List View ──────────────────────────────────────────────

function getFilteredTasks() {
  return AppState.tasks.filter(t => {
    if (taskFilter.status !== 'all' && t.status !== taskFilter.status) return false;
    if (taskFilter.assignee !== 'all' && t.assignee !== parseInt(taskFilter.assignee)) return false;
    if (taskFilter.search && !t.name.includes(taskFilter.search)) return false;
    return true;
  });
}

function renderListView() {
  return `
    <div class="overflow-x-auto">
      <table class="data-table">
        <thead><tr>
          <th>任務名稱</th><th>所屬專案</th><th>負責人</th><th>優先度</th><th>截止日期</th><th>狀態</th><th>操作</th>
        </tr></thead>
        <tbody id="tasks-tbody">${renderTaskRows()}</tbody>
      </table>
    </div>`;
}

function renderTaskRows() {
  const tasks = getFilteredTasks();
  if (!tasks.length) return `<tr><td colspan="7" class="text-center text-gray-400 py-8">沒有符合條件的任務</td></tr>`;
  return tasks.map(t => {
    const proj = AppState.getProject(t.projectId);
    const user = AppState.getUser(t.assignee);
    return `<tr>
      <td class="font-medium">
        <button onclick="AppState.currentTaskId=${t.id};navigateTo('task-detail')" class="text-left hover:text-blue-600 transition-colors">${t.name}</button>
      </td>
      <td class="text-gray-500 text-sm">${proj ? proj.name : '—'}</td>
      <td>
        <div class="flex items-center gap-2">
          ${user ? userAvatar(user, 28) : ''}
          <span class="text-sm">${user ? user.name : '—'}</span>
        </div>
      </td>
      <td><span class="badge ${AppState.priorityBadge(t.priority)}">${AppState.priorityLabel(t.priority)}</span></td>
      <td class="text-gray-500 text-sm">${t.dueDate}</td>
      <td><span class="badge ${AppState.statusBadge(t.status)}">${AppState.statusLabel(t.status)}</span></td>
      <td>
        <div class="flex gap-1">
          <button onclick="openEditTaskModal(${t.id})" class="btn-icon" title="編輯">${svgIcon('edit', 16)}</button>
          <button onclick="deleteTask(${t.id})" class="btn-icon btn-icon-red" title="刪除">${svgIcon('trash', 16)}</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function refreshTaskTable() {
  const tbody = document.getElementById('tasks-tbody');
  if (tbody) tbody.innerHTML = renderTaskRows();
}

// ── Kanban View ────────────────────────────────────────────

const KANBAN_COLS = [
  { key: 'pending', label: '未開始', color: '#94a3b8', bg: '#f8fafc', dot: '#94a3b8' },
  { key: 'active',  label: '進行中', color: '#3b82f6', bg: '#eff6ff', dot: '#3b82f6' },
  { key: 'paused',  label: '暫停中', color: '#f59e0b', bg: '#fffbeb', dot: '#f59e0b' },
  { key: 'done',    label: '已完成', color: '#22c55e', bg: '#f0fdf4', dot: '#22c55e' },
];

function renderKanbanView() {
  const tasks = getFilteredTasks();
  const cols = KANBAN_COLS.map(col => {
    const colTasks = tasks.filter(t => t.status === col.key);
    return `
      <div class="kanban-col" style="flex:1;min-width:220px;background:${col.bg};border-radius:12px;padding:12px;"
           ondragover="event.preventDefault()" ondrop="kanbanDrop(event,'${col.key}')">
        <div class="flex items-center gap-2 mb-3">
          <span style="width:10px;height:10px;border-radius:50%;background:${col.dot};display:inline-block"></span>
          <span class="font-semibold text-sm" style="color:${col.color}">${col.label}</span>
          <span class="ml-auto text-xs text-gray-400 font-medium bg-white rounded-full px-2 py-0.5 border">${colTasks.length}</span>
        </div>
        <div class="flex flex-col gap-2 kanban-drop-zone" id="kanban-col-${col.key}" style="min-height:60px">
          ${colTasks.map(t => renderKanbanCard(t)).join('')}
        </div>
      </div>`;
  }).join('');

  return `<div class="flex gap-3 overflow-x-auto pb-2" style="align-items:flex-start">${cols}</div>`;
}

function renderKanbanCard(t) {
  const user = AppState.getUser(t.assignee);
  const proj = AppState.getProject(t.projectId);
  const moodMap = { '😊': '順利', '😟': '困難', '😤': '壓力大', '🔥': '全力衝刺' };
  const moodHtml = t.mood ? `<span title="${moodMap[t.mood]||''}" style="font-size:16px">${t.mood}</span>` : '';
  return `
    <div class="kanban-card" draggable="true"
         ondragstart="kanbanDragStart(event,${t.id})"
         style="background:white;border-radius:8px;padding:12px;box-shadow:0 1px 4px rgba(0,0,0,0.08);cursor:grab;border:1.5px solid #f1f5f9;transition:box-shadow 0.15s">
      <div class="flex items-start justify-between gap-2 mb-2">
        <button onclick="AppState.currentTaskId=${t.id};navigateTo('task-detail')"
          class="text-sm font-medium text-gray-800 text-left hover:text-blue-600 transition-colors leading-snug">${t.name}</button>
        ${moodHtml}
      </div>
      <div class="text-xs text-gray-400 mb-2">${proj ? proj.name : ''}</div>
      ${progressBar(t.progress, 'progress-blue', 5)}
      <div class="flex items-center justify-between mt-2">
        <div class="flex items-center gap-1">
          ${user ? userAvatar(user, 22) : ''}
          <span class="text-xs text-gray-400">${user ? user.name : ''}</span>
        </div>
        <span class="badge ${AppState.priorityBadge(t.priority)}" style="font-size:10px;padding:1px 6px">${AppState.priorityLabel(t.priority)}</span>
      </div>
    </div>`;
}

let _draggingTaskId = null;

function kanbanDragStart(event, taskId) {
  _draggingTaskId = taskId;
  event.dataTransfer.effectAllowed = 'move';
}

function kanbanDrop(event, newStatus) {
  event.preventDefault();
  if (!_draggingTaskId) return;
  const t = AppState.tasks.find(t => t.id === _draggingTaskId);
  if (t && t.status !== newStatus) {
    t.status = newStatus;
    if (newStatus === 'done' && t.progress < 100) t.progress = 100;
    if (newStatus === 'active' && t.progress === 0) t.progress = 5;
    if (newStatus === 'pending') t.progress = 0;
    showToast(`任務已移至「${AppState.statusLabel(newStatus)}」`, 'success');
    checkRiskAlerts();
    saveAppState();
  }
  _draggingTaskId = null;
  refreshTaskView();
}

// ── Add / Edit / Delete (shared) ───────────────────────────

let _addTaskForProject = null;

function openAddTaskModal() {
  const preId = _addTaskForProject;
  _addTaskForProject = null;
  openModal(modalShell('新增任務',
    `<div class="flex flex-col gap-4">
      <div><label class="form-label">任務名稱</label><input id="tk-name" class="form-input" placeholder="請輸入任務名稱" /></div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="form-label">所屬專案</label>
          <select id="tk-project" class="form-input form-select">
            ${AppState.projects.map(p => `<option value="${p.id}" ${preId && p.id === preId ? 'selected' : ''}>${p.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">負責人</label>
          <select id="tk-assignee" class="form-input form-select">
            ${AppState.members.filter(m => m.role !== 'admin').map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="form-label">優先度</label>
          <select id="tk-priority" class="form-input form-select">
            <option value="high">高</option><option value="mid" selected>中</option><option value="low">低</option>
          </select>
        </div>
        <div>
          <label class="form-label">開始日期</label>
          <input id="tk-start" type="date" class="form-input" />
        </div>
        <div>
          <label class="form-label">截止日期</label>
          <input id="tk-due" type="date" class="form-input" />
        </div>
      </div>
      <div>
        <label class="form-label">任務描述</label>
        <textarea id="tk-desc" class="form-input" rows="3" placeholder="請描述任務內容..."></textarea>
      </div>
    </div>`,
    `<button onclick="closeModal()" class="btn btn-secondary">取消</button>
     <button onclick="addTask()" class="btn btn-primary">新增</button>`
  ));
}

function addTask() {
  const name = document.getElementById('tk-name').value.trim();
  if (!name) { showToast('請輸入任務名稱', 'error'); return; }
  const startRaw = document.getElementById('tk-start').value;
  const dueRaw = document.getElementById('tk-due').value;
  AppState.tasks.push({
    id: AppState.tasks.length + 1,
    name,
    projectId: parseInt(document.getElementById('tk-project').value),
    assignee: parseInt(document.getElementById('tk-assignee').value),
    priority: document.getElementById('tk-priority').value,
    startDate: startRaw ? startRaw.replace(/-/g, '/') : null,
    dueDate: dueRaw ? dueRaw.replace(/-/g, '/') : '—',
    status: (() => {
      if (!startRaw) return 'pending';
      const start = new Date(startRaw); start.setHours(0,0,0,0);
      const now = new Date(); now.setHours(0,0,0,0);
      return start <= now ? 'active' : 'pending';
    })(),
    progress: 0,
    desc: document.getElementById('tk-desc').value,
    comments: [], attachments: [],
    dependencies: [],
    mood: null,
  });
  closeModal();
  refreshTaskView();
  saveAppState();
  showToast('任務已新增', 'success');
}

function openEditTaskModal(id) {
  const t = AppState.tasks.find(t => t.id === id);
  if (!t) return;
  const otherTasks = AppState.tasks.filter(tk => tk.id !== id);
  openModal(modalShell('編輯任務',
    `<div class="flex flex-col gap-4">
      <div><label class="form-label">任務名稱</label><input id="etk-name" class="form-input" value="${t.name}" /></div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="form-label">所屬專案</label>
          <select id="etk-project" class="form-input form-select">
            ${AppState.projects.map(p => `<option value="${p.id}" ${t.projectId===p.id?'selected':''}>${p.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">負責人</label>
          <select id="etk-assignee" class="form-input form-select">
            ${AppState.members.filter(m => m.role !== 'admin').map(m => `<option value="${m.id}" ${t.assignee===m.id?'selected':''}>${m.name}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="form-label">優先度</label>
          <select id="etk-priority" class="form-input form-select">
            ${['high','mid','low'].map(v => `<option value="${v}" ${t.priority===v?'selected':''}>${AppState.priorityLabel(v)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">狀態</label>
          <select id="etk-status" class="form-input form-select">
            ${['pending','active','done','paused'].map(v => `<option value="${v}" ${t.status===v?'selected':''}>${AppState.statusLabel(v)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">截止日期</label>
          <input id="etk-due" type="date" class="form-input" value="${t.dueDate.replace(/\//g,'-')}" />
        </div>
      </div>
      <div>
        <label class="form-label">進度 (<span id="etk-pval">${t.progress}</span>%)</label>
        <input id="etk-progress" type="range" min="0" max="100" value="${t.progress}" class="w-full mt-2"
               oninput="document.getElementById('etk-pval').textContent=this.value" />
      </div>
      <div>
        <label class="form-label">前置任務（依賴關係）</label>
        <select id="etk-deps" class="form-input form-select" multiple style="height:80px">
          ${otherTasks.map(tk => `<option value="${tk.id}" ${(t.dependencies||[]).includes(tk.id)?'selected':''}>${tk.name}</option>`).join('')}
        </select>
        <p class="text-xs text-gray-400 mt-1">可多選，此任務需等所選任務完成後才能開始</p>
      </div>
      <div>
        <label class="form-label">任務描述</label>
        <textarea id="etk-desc" class="form-input" rows="3">${t.desc || ''}</textarea>
      </div>
    </div>`,
    `<button onclick="closeModal()" class="btn btn-secondary">取消</button>
     <button onclick="saveTask(${id})" class="btn btn-primary">儲存</button>`
  ));
}

function saveTask(id) {
  const t = AppState.tasks.find(t => t.id === id);
  if (!t) return;
  t.name = document.getElementById('etk-name').value.trim() || t.name;
  t.projectId = parseInt(document.getElementById('etk-project').value);
  t.assignee = parseInt(document.getElementById('etk-assignee').value);
  t.priority = document.getElementById('etk-priority').value;
  t.status = document.getElementById('etk-status').value;
  const due = document.getElementById('etk-due').value;
  if (due) t.dueDate = due.replace(/-/g, '/');
  t.progress = parseInt(document.getElementById('etk-progress').value);
  t.desc = document.getElementById('etk-desc').value;

  // Save dependencies (multi-select)
  const depsEl = document.getElementById('etk-deps');
  t.dependencies = depsEl ? Array.from(depsEl.selectedOptions).map(o => parseInt(o.value)) : [];

  closeModal();
  refreshTaskView();
  checkRiskAlerts();
  saveAppState();
  showToast('任務已更新', 'success');
}

function deleteTask(id) {
  confirmModal('刪除任務', '確定要刪除此任務嗎？', () => {
    AppState.tasks = AppState.tasks.filter(t => t.id !== id);
    refreshTaskView();
    saveAppState();
    showToast('任務已刪除', 'success');
  });
}
