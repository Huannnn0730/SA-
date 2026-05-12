// ============================================================
// DASHBOARD PAGE
// ============================================================

function renderDashboard() {
  const u = AppState.currentUser;
  const totalProjects = AppState.projects.length;
  const activeTasks = AppState.tasks.filter(t => t.status === 'active').length;
  const doneTasks = AppState.tasks.filter(t => t.status === 'done').length;
  const overdueTasks = 6;

  // Project donut
  const activeP = AppState.projects.filter(p => p.status === 'active').length;
  const doneP = AppState.projects.filter(p => p.status === 'done').length;
  const pausedP = AppState.projects.filter(p => p.status === 'paused').length;
  const pendingP = AppState.projects.filter(p => p.status === 'pending').length;
  const projTotal = activeP + doneP + pausedP + pendingP;

  // Task donut
  const taskSegs = [
    { label: '進行中', value: activeTasks, color: '#3b82f6' },
    { label: '已完成', value: doneTasks, color: '#22c55e' },
    { label: '暫停中', value: AppState.tasks.filter(t => t.status === 'paused').length, color: '#f59e0b' },
    { label: '未開始', value: AppState.tasks.filter(t => t.status === 'pending').length, color: '#94a3b8' },
  ];

  // Line chart data (mock trend)
  const trendPoints = [
    {y:12},{y:18},{y:14},{y:22},{y:20},{y:28},{y:25},{y:30},{y:27},{y:35},{y:32},{y:40}
  ];

  const todayTasks = AppState.tasks.filter(t => t.assignee === u.id && t.status === 'active').slice(0, 3);
  const upcomingTasks = AppState.tasks.filter(t => t.status !== 'done').slice(0, 4);

  document.getElementById('page-container').innerHTML = `
    <div class="page-enter flex flex-col gap-6">

      <!-- Stat cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        ${statCard('專案總數', totalProjects, '#dbeafe', '#2563eb', 'folder', '↑10%', true)}
        ${statCard('進行中任務', activeTasks, '#fef9c3', '#d97706', 'task', '↑5%', true)}
        ${statCard('已完成任務', doneTasks, '#dcfce7', '#15803d', 'check_circle', '↑28%', true)}
        ${statCard('逾期任務', overdueTasks, '#fee2e2', '#b91c1c', 'clock', '↑2', false)}
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Project progress -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-800">專案進度總覽</h3>
            <span class="text-xs text-gray-400">共 ${projTotal} 個專案</span>
          </div>
          <div class="flex items-center gap-6">
            ${donutChart([
              { label:'進行中', value: activeP, color: '#3b82f6' },
              { label:'已完成', value: doneP, color: '#22c55e' },
              { label:'暫停中', value: pausedP, color: '#f59e0b' },
              { label:'未開始', value: pendingP, color: '#94a3b8' },
            ], projTotal, projTotal, '個專案', 140)}
            <div class="flex flex-col gap-2 flex-1">
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
        </div>

        <!-- Task trend -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-800">任務進度趨勢</h3>
            <span class="badge badge-blue text-xs">近12週</span>
          </div>
          ${lineChartSvg(trendPoints, 340, 120, '#3b82f6')}
          <div class="flex justify-between text-xs text-gray-400 mt-1 px-2">
            <span>5/17</span><span>5/24</span><span>5/31</span><span>6/7</span><span>6/14</span><span>6/21</span>
          </div>
        </div>
      </div>

      <!-- Today tasks + Upcoming -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Today tasks -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-800">今日任務</h3>
            <button onclick="navigateTo('${u.role === 'admin' ? 'tasks' : 'my-tasks'}')" class="text-blue-600 text-sm font-medium hover:text-blue-700">更多 →</button>
          </div>
          <div class="flex flex-col gap-3">
            ${[{time:'09:00',name:'需求文件撰寫',priority:'high'},{time:'11:00',name:'設計稿確認',priority:'mid'},{time:'14:00',name:'前端功能開發',priority:'high'}].map(t => `
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span class="text-xs text-gray-400 w-12 flex-shrink-0">${t.time}</span>
                <span class="flex-1 text-sm font-medium text-gray-700">${t.name}</span>
                <span class="badge ${AppState.priorityBadge(t.priority)} text-xs">${AppState.priorityLabel(t.priority)}</span>
              </div>`).join('')}
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
                <div class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" onclick="navigateTo('task-detail');AppState.currentTaskId=${t.id}">
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

function statCard(label, value, bg, color, icon, trend, up) {
  return `
    <div class="stat-card flex items-center gap-4">
      <div style="width:48px;height:48px;background:${bg};border-radius:12px;display:flex;align-items:center;justify-content:center;color:${color};flex-shrink:0">
        ${svgIcon(icon, 22)}
      </div>
      <div class="flex-1">
        <div class="text-2xl font-bold text-gray-800">${value}</div>
        <div class="text-sm text-gray-500">${label}</div>
        <div class="text-xs mt-1 font-medium" style="color:${up ? '#15803d' : '#b91c1c'}">${trend} 較上月</div>
      </div>
    </div>`;
}
