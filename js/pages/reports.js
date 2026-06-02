// ============================================================
// REPORTS PAGE (Admin) — 含 UC41 資源負載熱力圖
// ============================================================

let reportTab = 'overview'; // 'overview' | 'heatmap'

function renderReports() {
  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-gray-800 text-lg">專案報表</h2>
        <button onclick="showToast('報表已匯出','success')" class="btn btn-primary">${svgIcon('download', 16)} 匯出</button>
      </div>

      <!-- Tab switcher -->
      <div class="flex gap-1 mb-4 p-1 rounded-xl" style="background:#f1f5f9;width:fit-content">
        <button onclick="switchReportTab('overview')"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all ${reportTab==='overview'?'bg-white shadow text-blue-600':'text-gray-500 hover:text-gray-700'}">
          ${svgIcon('chart',15)} 總覽報表
        </button>
        <button onclick="switchReportTab('heatmap')"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${reportTab==='heatmap'?'bg-white shadow text-blue-600':'text-gray-500 hover:text-gray-700'}">
          ${svgIcon('flame',15)} 資源負載熱力圖
          <span class="text-xs px-1.5 py-0.5 rounded-full font-semibold" style="background:#fef3c7;color:#d97706">NEW</span>
        </button>
      </div>

      <div id="report-tab-content">
        ${reportTab === 'overview' ? renderOverviewTab() : renderHeatmapTab()}
      </div>
    </div>`;
}

function switchReportTab(tab) {
  reportTab = tab;
  renderReports();
}

// ── Overview Tab ───────────────────────────────────────────

function renderOverviewTab() {
  const rd = AppState.getReportData();
  const totalTasks = rd.taskDist.reduce((a, b) => a + b.value, 0);
  const maxTaskVal = Math.max(...rd.taskData.map(d => d.value), 1);

  return `
    <!-- Summary stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="card text-center">
        <div class="text-4xl font-black text-blue-600 mb-1">${rd.completionRate}%</div>
        <div class="text-sm text-gray-500">任務完成率</div>
      </div>
      <div class="card text-center">
        <div class="text-4xl font-black text-red-500 mb-1">${rd.overdueTasks}</div>
        <div class="text-sm text-gray-500">逾期任務</div>
      </div>
      <div class="card text-center">
        <div class="text-4xl font-black text-purple-600 mb-1">${AppState.tasks.length}</div>
        <div class="text-sm text-gray-500">任務總數</div>
        <div class="text-xs text-gray-400 mt-1 font-medium">含所有狀態</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Task distribution donut -->
      <div class="card">
        <h3 class="font-bold text-gray-800 mb-4">任務狀態分布</h3>
        <div class="flex items-center gap-8">
          ${donutChart(rd.taskDist, totalTasks, totalTasks, '個任務', 160)}
          <div class="flex flex-col gap-3 flex-1">
            ${rd.taskDist.map(d => `
              <div>
                <div class="flex items-center justify-between text-sm mb-1">
                  <div class="flex items-center gap-2">
                    <span style="width:10px;height:10px;border-radius:50%;background:${d.color};display:inline-block"></span>
                    <span class="text-gray-600">${d.label}</span>
                  </div>
                  <span class="font-semibold text-gray-800">${d.value}</span>
                </div>
                ${progressBar(totalTasks > 0 ? Math.round(d.value / totalTasks * 100) : 0, '', 5)}
              </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- Tasks per member -->
      <div class="card">
        <h3 class="font-bold text-gray-800 mb-4">成員任務負載（進行中任務數）</h3>
        <div class="overflow-x-auto">
          ${barChart(rd.taskData.map(d => ({name: d.name, hours: d.value})), maxTaskVal, 340, 140)}
        </div>
        <div class="flex flex-col gap-2 mt-4">
          ${rd.taskData.map(d => `
            <div class="flex items-center gap-3 text-sm">
              <span class="text-gray-600 w-16 flex-shrink-0">${d.name}</span>
              <div class="flex-1">${progressBar(maxTaskVal > 0 ? Math.round(d.value / maxTaskVal * 100) : 0, 'progress-blue', 8)}</div>
              <span class="font-semibold text-gray-700 w-12 text-right">${d.value} 個</span>
            </div>`).join('')}
        </div>
      </div>

      <!-- Project progress table -->
      <div class="card lg:col-span-2">
        <h3 class="font-bold text-gray-800 mb-4">專案進度明細</h3>
        <table class="data-table">
          <thead><tr>
            <th>專案名稱</th><th>狀態</th><th>進度</th><th>任務數</th><th>完成率</th>
          </tr></thead>
          <tbody>
            ${AppState.projects.map(p => {
              const pTasks = AppState.getTasksByProject(p.id);
              const doneTasks = pTasks.filter(t => t.status === 'done').length;
              const rate = pTasks.length > 0 ? Math.round(doneTasks / pTasks.length * 100) : 0;
              return `<tr>
                <td class="font-medium">${p.name}</td>
                <td><span class="badge ${AppState.statusBadge(p.status)}">${AppState.statusLabel(p.status)}</span></td>
                <td style="min-width:180px">
                  <div class="flex items-center gap-2">
                    <div class="flex-1">${progressBar(AppState.getProjectProgress(p.id), 'progress-blue')}</div>
                    <span class="text-sm font-semibold text-gray-600">${AppState.getProjectProgress(p.id)}%</span>
                  </div>
                </td>
                <td class="text-gray-500">${pTasks.length} 個</td>
                <td><span class="font-semibold ${rate >= 80 ? 'text-green-600' : rate >= 50 ? 'text-blue-600' : 'text-orange-500'}">${rate}%</span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ── UC41 Heatmap Tab ───────────────────────────────────────

function renderHeatmapTab() {
  // Generate date range: past 2 weeks to future 2 weeks (28 days)
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = -14; i <= 13; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  const members = AppState.members.filter(m => m.role !== 'admin');

  // Calculate load per member per day (tasks whose dueDate falls in that week)
  function getLoad(memberId, day) {
    const dayStr = `${day.getFullYear()}/${String(day.getMonth()+1).padStart(2,'0')}/${String(day.getDate()).padStart(2,'0')}`;
    const memberTasks = AppState.tasks.filter(t => t.assignee === memberId && t.status !== 'done');
    return memberTasks.filter(t => {
      if (!t.dueDate || t.dueDate === '—') return false;
      const due = new Date(t.dueDate.replace(/\//g, '-')); due.setHours(0,0,0,0);
      const start = t.startDate
        ? (() => { const d = new Date(t.startDate.replace(/\//g, '-')); d.setHours(0,0,0,0); return d; })()
        : (() => { const d = new Date(due); d.setDate(due.getDate() - 7); return d; })();
      return day >= start && day <= due;
    }).length;
  }

  function heatColor(load) {
    if (load === 0) return '#f8fafc';
    if (load === 1) return '#bfdbfe';
    if (load === 2) return '#60a5fa';
    if (load === 3) return '#2563eb';
    return '#1e3a8a'; // 4+
  }
  function heatLabel(load) {
    if (load === 0) return '空閒';
    if (load === 1) return '輕度';
    if (load === 2) return '適中';
    if (load === 3) return '繁忙';
    return '超載';
  }

  // Week labels (Mon–Sun columns condensed to just dates)
  const dateLabels = days.filter((_, i) => i % 4 === 0).map(d =>
    `<th class="text-xs text-gray-400 font-normal text-center" style="min-width:28px;padding:2px 0">
      ${(d.getMonth()+1)}/${d.getDate()}
    </th>`
  ).join('');

  const rows = members.map(m => {
    const cells = days.map(d => {
      const load = getLoad(m.id, d);
      const color = heatColor(load);
      const isToday = d.getTime() === today.getTime();
      return `<td style="padding:3px 2px;text-align:center">
        <div title="${m.name}｜${d.getMonth()+1}/${d.getDate()}｜${heatLabel(load)}（${load} 個任務）"
          style="width:26px;height:26px;border-radius:5px;background:${color};margin:auto;
                 border:${isToday?'2px solid #f97316':'1.5px solid #e2e8f0'};
                 cursor:default;transition:transform 0.1s"
          onmouseover="this.style.transform='scale(1.2)'"
          onmouseout="this.style.transform='scale(1)'">
        </div>
      </td>`;
    }).join('');
    const activeTasks = AppState.tasks.filter(t => t.assignee === m.id && t.status !== 'done').length;
    const maxLoad = Math.max(...days.map(d => getLoad(m.id, d)));
    const overloadDays = days.filter(d => getLoad(m.id, d) >= 4).length;
    return `<tr>
      <td style="padding:4px 12px 4px 0;white-space:nowrap">
        <div class="flex items-center gap-2">
          ${userAvatar(AppState.getUser(m.id), 28)}
          <div>
            <div class="text-sm font-medium text-gray-700">${m.name}</div>
            <div class="text-xs text-gray-400">${m.title}</div>
          </div>
        </div>
      </td>
      ${cells}
      <td style="padding:4px 0 4px 12px;text-align:right">
        <span class="text-sm font-bold ${maxLoad >= 4 ? 'text-red-500' : maxLoad >= 3 ? 'text-orange-500' : 'text-gray-600'}">${activeTasks} 任務</span>
        ${overloadDays > 0 ? `<div class="text-xs text-red-500">${overloadDays} 天超載</div>` : ''}
      </td>
    </tr>`;
  }).join('');

  // Risk members
  const riskMembers = members.filter(m => {
    const max = Math.max(...days.map(d => getLoad(m.id, d)));
    return max >= 4;
  });

  return `
    <div class="card mb-4">
      <div class="flex flex-wrap items-start justify-between gap-3 mb-2">
        <div>
          <h3 class="font-bold text-gray-800 mb-1">資源負載熱力圖</h3>
          <p class="text-sm text-gray-400">顯示過去 2 週至未來 2 週的每日任務密度，深色代表超載</p>
        </div>
        <div class="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0 flex-wrap">
          ${[
            { color:'#f8fafc', label:'空閒', range:'0' },
            { color:'#bfdbfe', label:'輕鬆', range:'1' },
            { color:'#60a5fa', label:'適中', range:'2' },
            { color:'#2563eb', label:'繁忙', range:'3' },
            { color:'#1e3a8a', label:'超載', range:'4+' },
          ].map(item => `
            <div class="flex items-center gap-1">
              <span style="width:16px;height:16px;border-radius:3px;background:${item.color};display:inline-block;border:1px solid #e2e8f0;flex-shrink:0"></span>
              <span>${item.label}（${item.range}）</span>
            </div>`).join('')}
        </div>
      </div>

      ${riskMembers.length ? `
        <div class="mb-4 flex items-center gap-2 rounded-lg px-4 py-3" style="background:#fff7ed;border:1.5px solid #fed7aa">
          <span style="font-size:18px">⚠️</span>
          <span class="text-sm font-medium" style="color:#ea580c">
            人力預警：${riskMembers.map(m=>m.name).join('、')} 工作量過高，建議重新分配任務
          </span>
        </div>` : `
        <div class="mb-4 flex items-center gap-2 rounded-lg px-4 py-3" style="background:#f0fdf4;border:1.5px solid #bbf7d0">
          <span style="font-size:18px">✅</span>
          <span class="text-sm font-medium" style="color:#15803d">人力配置健康，暫無超載成員</span>
        </div>`}

      <div class="overflow-x-auto">
        <table style="border-collapse:separate;border-spacing:0">
          <thead>
            <tr>
              <th style="text-align:left;padding:4px 12px 4px 0;font-size:12px;color:#94a3b8;font-weight:500">成員</th>
              ${days.map((d,i) => {
                const isToday = d.getTime() === today.getTime();
                return `<th style="min-width:28px;padding:2px 2px;text-align:center;font-size:10px;color:${isToday?'#f97316':'#94a3b8'};font-weight:${isToday?'700':'400'}">
                  ${i % 4 === 0 || isToday ? `${d.getMonth()+1}/${d.getDate()}` : ''}
                </th>`;
              }).join('')}
              <th style="padding:4px 0 4px 12px;font-size:12px;color:#94a3b8;font-weight:500;text-align:right">狀態</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <div class="mt-4 pt-4 border-t border-gray-100">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">成員負載摘要</h4>
        <div class="grid grid-cols-1 md:grid-cols-${Math.min(members.length, 3)} gap-3">
          ${members.map(m => {
            const loads = days.map(d => getLoad(m.id, d));
            const avg = loads.reduce((a,b)=>a+b,0) / loads.length;
            const max = Math.max(...loads);
            const level = max >= 4 ? '超載' : max >= 3 ? '繁忙' : max >= 2 ? '適中' : '輕鬆';
            const levelColor = max >= 4 ? '#ef4444' : max >= 3 ? '#f97316' : max >= 2 ? '#3b82f6' : '#22c55e';
            return `
              <div class="flex items-center gap-3 p-3 rounded-lg" style="background:#f8fafc;border:1px solid #e2e8f0">
                ${userAvatar(AppState.getUser(m.id), 36)}
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-700">${m.name}</div>
                  <div class="text-xs text-gray-400">${m.title}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold" style="color:${levelColor}">${level}</div>
                  <div class="text-xs text-gray-400">均 ${avg.toFixed(1)} 任務/天</div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
}
