// ============================================================
// WORK PROGRESS PAGE (Executor)
// ============================================================

function renderWorkProgress() {
  const u = AppState.currentUser;
  const myTasks = AppState.tasks.filter(t => t.assignee === u.id);
  const done = myTasks.filter(t => t.status === 'done').length;
  const active = myTasks.filter(t => t.status === 'active').length;
  const pending = myTasks.filter(t => t.status === 'pending').length;
  const total = myTasks.length;
  const rate = total > 0 ? Math.round(done / total * 100) : 0;

  const taskSegs = [
    { label: '已完成', value: done, color: '#22c55e' },
    { label: '進行中', value: active, color: '#3b82f6' },
    { label: '未開始', value: pending, color: '#94a3b8' },
  ];

  // Per-project completion for trend display
  const myProjects = [...new Set(myTasks.map(t => t.projectId))]
    .map(pid => {
      const proj = AppState.getProject(pid);
      const pTasks = myTasks.filter(t => t.projectId === pid);
      const pDone = pTasks.filter(t => t.status === 'done').length;
      return { name: proj ? proj.name : `專案${pid}`, rate: pTasks.length ? Math.round(pDone / pTasks.length * 100) : 0 };
    });

  const upcomingTasks = myTasks.filter(t => t.status !== 'done').sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);

  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <h2 class="font-bold text-gray-800 text-lg mb-4">我的工作進度</h2>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="card text-center">
          <div class="text-4xl font-black text-blue-600 mb-1">${rate}%</div>
          <div class="text-sm text-gray-500">本月完成率</div>
          <div class="text-xs text-green-600 mt-1 font-medium">↑15% 較上月</div>
        </div>
        <div class="card text-center">
          <div class="text-4xl font-black text-green-600 mb-1">${done}</div>
          <div class="text-sm text-gray-500">已完成任務</div>
          <div class="text-xs text-red-500 mt-1 font-medium">↓3 較上月</div>
        </div>
        <div class="card text-center">
          <div class="text-4xl font-black text-orange-500 mb-1">${active + pending}</div>
          <div class="text-sm text-gray-500">待完成任務</div>
          <div class="text-xs text-red-500 mt-1 font-medium">↓1 較上月</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Task distribution -->
        <div class="card">
          <h3 class="font-bold text-gray-800 mb-4">任務狀態分布</h3>
          <div class="flex items-center gap-6">
            ${donutChart(taskSegs, Math.max(total, 1), rate + '%', '完成率', 140)}
            <div class="flex flex-col gap-3 flex-1">
              ${taskSegs.map(s => `
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2">
                    <span style="width:10px;height:10px;border-radius:50%;background:${s.color};display:inline-block"></span>
                    <span class="text-gray-600">${s.label}</span>
                  </div>
                  <span class="font-bold text-gray-800">${s.value}</span>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Per-project completion -->
        <div class="card">
          <h3 class="font-bold text-gray-800 mb-4">各專案完成狀況</h3>
          ${myProjects.length === 0
            ? `<div class="text-sm text-gray-400 text-center py-6">尚未加入任何專案</div>`
            : `<div class="flex flex-col gap-4">
                ${myProjects.map(p => `
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-600 truncate">${p.name}</span>
                      <span class="font-semibold text-gray-800 ml-2">${p.rate}%</span>
                    </div>
                    ${progressBar(p.rate, p.rate >= 80 ? 'progress-green' : p.rate >= 40 ? 'progress-blue' : 'progress-orange', 8)}
                  </div>`).join('')}
              </div>`}
        </div>

        <!-- Upcoming tasks -->
        <div class="card lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-800">即將到期任務</h3>
          </div>
          <div class="flex flex-col gap-2">
            ${upcomingTasks.length === 0
              ? '<div class="text-center text-gray-400 py-6 text-sm">所有任務都已完成！</div>'
              : upcomingTasks.map(t => {
                  const proj = AppState.getProject(t.projectId);
                  return `
                    <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer" onclick="navigateTo('task-detail');AppState.currentTaskId=${t.id}">
                      <div class="flex-1">
                        <div class="font-medium text-gray-800 text-sm">${t.name}</div>
                        <div class="text-xs text-gray-400 mt-0.5">${proj ? proj.name : '—'}</div>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="badge ${AppState.statusBadge(t.status)}">${AppState.statusLabel(t.status)}</span>
                        <span class="text-xs text-gray-500">${t.dueDate}</span>
                        <span class="badge ${AppState.priorityBadge(t.priority)}">${AppState.priorityLabel(t.priority)}</span>
                      </div>
                    </div>`;
                }).join('')}
          </div>
        </div>
      </div>
    </div>`;
}
