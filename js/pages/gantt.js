// ============================================================
// GANTT CHART PAGE (Admin) — UC38 動態日期版
// ============================================================

function renderGantt() {
  const tasks = AppState.tasks.filter(t => t.startDate && t.dueDate && t.dueDate !== '—');

  const parseDate = s => { const d = new Date(s.replace(/\//g, '-')); d.setHours(0,0,0,0); return d; };
  const daysBetween = (a, b) => Math.round((b - a) / 86400000);

  const nameColW = 160;
  const rowH = 40;
  const dayW = 16;

  // Compute date range from all tasks
  const starts = tasks.map(t => parseDate(t.startDate));
  const ends   = tasks.map(t => parseDate(t.dueDate));
  const rangeStart = new Date(Math.min(...starts));
  const rangeEnd   = new Date(Math.max(...ends));
  rangeStart.setDate(rangeStart.getDate() - 3);
  rangeEnd.setDate(rangeEnd.getDate() + 3);
  const totalDays = daysBetween(rangeStart, rangeEnd);
  const totalChartW = totalDays * dayW;

  const today = new Date(); today.setHours(0,0,0,0);
  const todayOffset = daysBetween(rangeStart, today);

  // Weekly column labels
  const weekLabels = [];
  const cur = new Date(rangeStart);
  while (cur <= rangeEnd) {
    weekLabels.push(new Date(cur));
    cur.setDate(cur.getDate() + 7);
  }

  // Dependency depth for indentation
  function getDepth(taskId, visited = new Set()) {
    if (visited.has(taskId)) return 0;
    visited.add(taskId);
    const t = tasks.find(tk => tk.id === taskId);
    if (!t || !(t.dependencies||[]).length) return 0;
    return 1 + Math.max(...t.dependencies.map(did => getDepth(did, new Set(visited))));
  }

  const statusColor = { done: '#22c55e', active: '#3b82f6', pending: '#94a3b8', paused: '#f59e0b' };

  const rows = tasks.map(t => {
    const start  = parseDate(t.startDate);
    const end    = parseDate(t.dueDate);
    const barLeft  = daysBetween(rangeStart, start) * dayW;
    const barWidth = Math.max(daysBetween(start, end), 1) * dayW - 4;
    const color  = statusColor[t.status] || '#94a3b8';

    const deps = t.dependencies || [];
    const hasDep = deps.length > 0;
    const allDone = deps.every(did => {
      const dep = AppState.tasks.find(tk => tk.id === did);
      return dep && dep.status === 'done';
    });
    const depth  = getDepth(t.id);
    const indent = depth * 14;

    return `<tr>
      <td style="padding:0;border-bottom:1px solid #f1f5f9;min-width:${nameColW}px;max-width:${nameColW}px;position:sticky;left:0;background:white;z-index:2">
        <div style="display:flex;align-items:center;gap:3px;padding:8px 8px 8px ${8+indent}px;overflow:hidden">
          ${depth > 0 ? `<span style="color:#cbd5e1;font-size:12px;flex-shrink:0">└</span>` : ''}
          ${hasDep ? `<span title="${allDone?'前置任務已完成':'有未完成的前置任務'}" style="color:${allDone?'#22c55e':'#f59e0b'};font-size:12px;flex-shrink:0">${allDone?'✓':'⚑'}</span>` : ''}
          <span style="font-size:12px;color:#374151;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.name}</span>
        </div>
      </td>
      <td style="position:relative;height:${rowH}px;padding:0;width:${totalChartW}px;min-width:${totalChartW}px">
        <div style="position:absolute;left:${barLeft}px;top:9px;width:${barWidth}px;min-width:4px;height:22px;background:${color};border-radius:4px;display:flex;align-items:center;padding:0 6px;font-size:10px;color:white;overflow:hidden;cursor:pointer"
             onclick="AppState.currentTaskId=${t.id};navigateTo('task-detail')">
          ${t.progress > 0 ? `<div style="position:absolute;left:0;top:0;height:100%;width:${t.progress}%;background:rgba(0,0,0,0.18);border-radius:4px 0 0 4px;pointer-events:none"></div>` : ''}
          ${barWidth > 40 ? `<span style="position:relative;z-index:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.name}</span>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');

  // Today marker (rendered as part of header cell)
  const todayMarkerHeader = todayOffset >= 0 && todayOffset <= totalDays
    ? `<div style="position:absolute;left:${todayOffset * dayW}px;top:0;bottom:-${tasks.length * rowH}px;width:2px;background:#f97316;opacity:0.5;pointer-events:none;z-index:3"></div>`
    : '';

  const headerLabels = weekLabels.map(d => {
    const offset = daysBetween(rangeStart, d);
    const isNear = Math.abs(daysBetween(d, today)) < 4;
    return `<div style="position:absolute;left:${offset * dayW}px;top:4px;font-size:10px;color:${isNear?'#f97316':'#94a3b8'};white-space:nowrap;font-weight:${isNear?'700':'400'}">${d.getMonth()+1}/${d.getDate()}</div>`;
  }).join('');

  const emptyState = !tasks.length ? `
    <div class="text-center py-12 text-gray-400">
      <div style="font-size:40px">📋</div>
      <div class="mt-2 text-sm">尚無任務，請先新增任務並設定開始/截止日期</div>
    </div>` : '';

  const scrollToTodayOffset = Math.max(0, (todayOffset - 5) * dayW);

  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-bold text-gray-800 text-lg">進度監控 — 甘特圖</h2>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-4 mb-4 text-xs">
          ${[['#22c55e','已完成'],['#3b82f6','進行中'],['#f59e0b','暫停中'],['#94a3b8','未開始']].map(([c,l]) =>
            `<div class="flex items-center gap-1.5"><span style="width:14px;height:10px;background:${c};border-radius:2px;display:inline-block"></span><span class="text-gray-500">${l}</span></div>`
          ).join('')}
          <div class="flex items-center gap-1.5"><span style="color:#f59e0b">⚑</span><span class="text-gray-500">有未完成的前置任務</span></div>
          <div class="flex items-center gap-1.5"><span style="color:#22c55e">✓</span><span class="text-gray-500">前置任務已完成</span></div>
          <div class="flex items-center gap-1.5"><span style="width:2px;height:12px;background:#f97316;display:inline-block;opacity:0.6"></span><span class="text-gray-500">今天</span></div>
        </div>

        ${emptyState || `
        <!-- Gantt table -->
        <div class="overflow-x-auto" id="gantt-scroll">
          <table style="border-collapse:collapse;table-layout:fixed">
            <thead>
              <tr>
                <th style="width:${nameColW}px;min-width:${nameColW}px;text-align:left;padding:8px 12px;font-size:12px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0;position:sticky;left:0;background:white;z-index:3">任務名稱</th>
                <th style="position:relative;width:${totalChartW}px;min-width:${totalChartW}px;height:28px;border-bottom:2px solid #e2e8f0;padding:0">
                  ${headerLabels}
                  ${todayMarkerHeader}
                </th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`}
      </div>
    </div>`;

  // Auto-scroll to today
  requestAnimationFrame(() => {
    const el = document.getElementById('gantt-scroll');
    if (el) el.scrollLeft = scrollToTodayOffset;
  });
}
