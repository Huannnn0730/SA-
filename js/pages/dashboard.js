// ============================================================
// DASHBOARD PAGE
// ============================================================

function renderDashboard() {
  const u = AppState.currentUser;
  const isAdmin = u.role === 'admin';
  const today = new Date(); today.setHours(0,0,0,0);
  const parseDate = s => { const d = new Date(s.replace(/\//g, '-')); d.setHours(0,0,0,0); return d; };

  // Scope tasks by role
  const scopedTasks = isAdmin ? AppState.tasks : AppState.tasks.filter(t => t.assignee === u.id);

  const totalProjects = isAdmin ? AppState.projects.length : [...new Set(scopedTasks.map(t => t.projectId))].length;
  const activeTasks = scopedTasks.filter(t => t.status === 'active').length;
  const doneTasks = scopedTasks.filter(t => t.status === 'done').length;
  const overdueTasks = scopedTasks.filter(t => {
    if (t.status === 'done') return false;
    if (!t.dueDate || t.dueDate === '—') return false;
    return parseDate(t.dueDate) < today;
  }).length;

  // Project donut (admin only)
  const activeP = AppState.projects.filter(p => p.status === 'active').length;
  const doneP = AppState.projects.filter(p => p.status === 'done').length;
  const pausedP = AppState.projects.filter(p => p.status === 'paused').length;
  const pendingP = AppState.projects.filter(p => p.status === 'pending').length;
  const projTotal = activeP + doneP + pausedP + pendingP;

  // Task donut
  const taskSegs = [
    { label: '進行中', value: activeTasks, color: '#3b82f6' },
    { label: '已完成', value: doneTasks, color: '#22c55e' },
    { label: '暫停中', value: scopedTasks.filter(t => t.status === 'paused').length, color: '#f59e0b' },
    { label: '未開始', value: scopedTasks.filter(t => t.status === 'pending').length, color: '#94a3b8' },
  ];

  const todayTasks = scopedTasks.filter(t => t.status === 'active').slice(0, 3);
  const upcomingTasks = scopedTasks
    .filter(t => t.status !== 'done' && t.dueDate && t.dueDate !== '—')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  document.getElementById('page-container').innerHTML = `
    <div class="page-enter flex flex-col gap-6">

      <!-- Stat cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        ${statCard(isAdmin ? '專案總數' : '參與專案', totalProjects, '#dbeafe', '#2563eb', 'folder', '', true)}
        ${statCard('進行中任務', activeTasks, '#fef9c3', '#d97706', 'task', '', true)}
        ${statCard('已完成任務', doneTasks, '#dcfce7', '#15803d', 'check_circle', '', true)}
        ${statCard('逾期任務', overdueTasks, '#fee2e2', '#b91c1c', 'clock', '', false)}
      </div>

      <!-- Charts row — admin only -->
      ${isAdmin ? `
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-gray-800">專案進度總覽</h3>
          <span class="text-xs text-gray-400">共 ${projTotal} 個專案</span>
        </div>
        <div class="flex flex-wrap items-center gap-8">
          ${donutChart([
            { label:'進行中', value: activeP, color: '#3b82f6' },
            { label:'已完成', value: doneP, color: '#22c55e' },
            { label:'暫停中', value: pausedP, color: '#f59e0b' },
            { label:'未開始', value: pendingP, color: '#94a3b8' },
          ], projTotal, projTotal, '個專案', 140)}
          <div class="flex flex-col gap-3 flex-1" style="min-width:160px">
            ${[['進行中', activeP, '#3b82f6'], ['已完成', doneP, '#22c55e'], ['暫停中', pausedP, '#f59e0b'], ['未開始', pendingP, '#94a3b8']].map(([l, v, c]) => `
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <span style="width:10px;height:10px;border-radius:50%;background:${c};display:inline-block"></span>
                  <span class="text-gray-600">${l}</span>
                </div>
                <span class="font-semibold text-gray-800">${v}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>` : ''}

      <!-- UC31 Risk Alert Panel -->
      ${renderRiskPanel()}

      <!-- Today tasks + Upcoming -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Today tasks -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-800">今日任務</h3>
            <button onclick="navigateTo('${u.role === 'admin' ? 'tasks' : 'my-tasks'}')" class="text-blue-600 text-sm font-medium hover:text-blue-700">更多 →</button>
          </div>
          <div class="flex flex-col gap-3">
            ${(() => {
              const myActive = AppState.tasks
                .filter(t => (u.role === 'admin' || t.assignee === u.id) && t.status !== 'done')
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .slice(0, 3);
              if (!myActive.length) return `<div class="text-sm text-gray-400 text-center py-4">目前沒有進行中的任務</div>`;
              return myActive.map(t => `
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                     onclick="AppState.currentTaskId=${t.id};navigateTo('task-detail')">
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-700 truncate">${t.name}</div>
                    <div class="text-xs text-gray-400">截止 ${t.dueDate}</div>
                  </div>
                  <span class="badge ${AppState.priorityBadge(t.priority)} text-xs">${AppState.priorityLabel(t.priority)}</span>
                </div>`).join('');
            })()}
          </div>
        </div>

        <!-- Upcoming deadline -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-800">即將到期任務</h3>
            <button onclick="navigateTo('${u.role === 'admin' ? 'tasks' : 'my-tasks'}')" class="text-blue-600 text-sm font-medium hover:text-blue-700">更多 →</button>
          </div>
          <div class="flex flex-col gap-2">
            ${upcomingTasks.map(t => {
              const proj = AppState.getProject(t.projectId);
              return `
                <div class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" onclick="AppState.currentTaskId=${t.id};navigateTo('task-detail')">
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-700 truncate">${t.name}</div>
                    <div class="text-xs text-gray-400">${proj ? proj.name : ''}</div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <div class="text-xs text-gray-500">${t.dueDate}</div>
                    <span class="badge ${AppState.priorityBadge(t.priority)} text-xs">${AppState.priorityLabel(t.priority)}</span>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>

    </div>`;
}

function renderRiskPanel() {
  const u = AppState.currentUser;
  const allRisks = getRiskTasks();
  const risks = u.role === 'admin' ? allRisks : allRisks.filter(r => r.assignee === u.id);
  if (!risks.length) {
    return `<div class="card flex items-center gap-3" style="background:#f0fdf4;border:1.5px solid #bbf7d0">
      <span style="font-size:22px">✅</span>
      <div>
        <div class="font-semibold text-sm" style="color:#15803d">自動化風險監控：目前無高風險任務</div>
        <div class="text-xs" style="color:#16a34a">所有任務進度正常，繼續保持！</div>
      </div>
    </div>`;
  }
  const high = risks.filter(r => r.riskLevel === 'high');
  const mid  = risks.filter(r => r.riskLevel === 'mid');
  return `
    <div class="card" style="border:1.5px solid #fecaca;background:#fff5f5">
      <div class="flex items-center gap-2 mb-3">
        <span style="font-size:20px">🔴</span>
        <h3 class="font-bold text-gray-800">自動化風險監控</h3>
        <span class="ml-auto text-xs px-2 py-1 rounded-full font-semibold" style="background:#fee2e2;color:#b91c1c">${risks.length} 個任務需注意</span>
      </div>
      <div class="flex flex-col gap-2">
        ${risks.map(r => {
          const assignee = AppState.getUser(r.assignee);
          const isHigh = r.riskLevel === 'high';
          return `
            <div class="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                 style="background:${isHigh?'#fef2f2':'#fffbeb'};border:1px solid ${isHigh?'#fca5a5':'#fde68a'}"
                 onclick="AppState.currentTaskId=${r.id};navigateTo('task-detail')">
              <span style="font-size:18px">${isHigh?'🔴':'🟡'}</span>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-gray-800">${r.name}</div>
                <div class="text-xs" style="color:${isHigh?'#b91c1c':'#92400e'}">${r.riskReason}</div>
              </div>
              <div class="text-right flex-shrink-0">
                ${assignee ? `<div class="flex items-center gap-1 justify-end">${userAvatar(assignee,22)}<span class="text-xs text-gray-500">${assignee.name}</span></div>` : ''}
                <div class="text-xs mt-1 font-semibold" style="color:${isHigh?'#ef4444':'#f59e0b'}">${r.daysLeft < 0 ? '已逾期' : `剩 ${r.daysLeft} 天`}</div>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

function statCard(label, value, bg, color, icon) {
  return `
    <div class="stat-card flex items-center gap-3">
      <div class="stat-icon" style="width:44px;height:44px;background:${bg};border-radius:12px;display:flex;align-items:center;justify-content:center;color:${color};flex-shrink:0">
        ${svgIcon(icon, 20)}
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-xl font-bold text-gray-800 leading-tight">${value}</div>
        <div class="text-xs text-gray-500 truncate">${label}</div>
      </div>
    </div>`;
}
