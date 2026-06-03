// ============================================================
// CALENDAR PAGE
// ============================================================

var calYear  = new Date().getFullYear();
var calMonth = new Date().getMonth();

function renderCalendar() {
  const navHtml = `
    <button onclick="calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderCalendar();" class="btn-icon">${svgIcon('arrow_left', 18)}</button>
    <h3 class="font-bold text-gray-800 text-lg">${calYear} 年 ${calMonth + 1} 月</h3>
    <button onclick="calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderCalendar();" class="btn-icon">${svgIcon('arrow_right', 18)}</button>`;

  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="card">
        <div class="flex items-center justify-between mb-4">${navHtml}</div>
        ${renderMonthView()}
      </div>
    </div>`;
}

// ── Helpers ────────────────────────────────────────────────

// 取得當月可見任務（篩角色）
function getMyTasks() {
  const u = AppState.currentUser;
  return u.role === 'admin'
    ? AppState.tasks
    : AppState.tasks.filter(t => t.assignee === u.id);
}

// 取得某天（YYYY-MM-DD）所有進行中任務
function getTasksForDate(dateStr) {
  return getMyTasks().filter(t => {
    if (!t.startDate || !t.dueDate) return false;
    return t.startDate.replace(/\//g,'-') <= dateStr && dateStr <= t.dueDate.replace(/\//g,'-');
  });
}

// 決定任務在某天的視覺型態（考慮跨月）
function spanType(t, dateStr, monthFirstKey) {
  const s = t.startDate.replace(/\//g,'-');
  const e = t.dueDate.replace(/\//g,'-');
  if (s === e) return 'single';
  const visStart = s < monthFirstKey ? monthFirstKey : s;
  if (dateStr === visStart) return 'start';
  if (dateStr === e)        return 'end';
  return 'mid';
}

const STATUS_COLOR = {
  done:    { bg:'#dcfce7', text:'#16a34a', bar:'#22c55e' },
  active:  { bg:'#dbeafe', text:'#1d4ed8', bar:'#3b82f6' },
  paused:  { bg:'#fef3c7', text:'#b45309', bar:'#f59e0b' },
  pending: { bg:'#f1f5f9', text:'#64748b', bar:'#94a3b8' },
  overdue: { bg:'#fee2e2', text:'#dc2626', bar:'#ef4444' },
};

function chipHtml(t, type) {
  const c = STATUS_COLOR[t.status] || STATUS_COLOR.pending;
  const showText = type === 'single' || type === 'start';
  const radius = type === 'single' ? '4px'
    : type === 'start' ? '4px 0 0 4px'
    : type === 'end'   ? '0 4px 4px 0'
    : '0';
  const ml = (type === 'mid' || type === 'end') ? '-2px' : '0';
  return `
    <div onclick="event.stopPropagation();AppState.currentTaskId=${t.id};navigateTo('task-detail')"
      title="${t.name}"
      style="background:${c.bg};color:${c.text};
             border-left:${showText ? `3px solid ${c.bar}` : 'none'};
             border-radius:${radius};margin-left:${ml};
             padding:1px ${showText?'5px':'0'};height:18px;
             font-size:11px;font-weight:500;cursor:pointer;
             white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
             margin-bottom:2px;line-height:16px;display:block;">
      ${showText ? t.name : ''}
    </div>`;
}

// ── Month View ─────────────────────────────────────────────

function renderMonthView() {
  const firstDay   = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;
  const monthFirstKey = `${calYear}-${String(calMonth+1).padStart(2,'0')}-01`;
  const MAX = 2;

  // 格子
  let cells = '';

  // 上個月補白
  for (let i = 0; i < firstDay; i++) {
    cells += `<div style="min-height:90px;padding:4px;background:#fafafa;border:1px solid #f1f5f9;border-radius:8px;">
      <div style="font-size:12px;color:#d1d5db;font-weight:600;margin-bottom:3px">${new Date(calYear,calMonth,-firstDay+i+1).getDate()}</div>
    </div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = isCurrentMonth && d === today.getDate();
    const isWeekend = (firstDay + d - 1) % 7 === 0 || (firstDay + d - 1) % 7 === 6;
    const dayTasks = getTasksForDate(key);
    const visible  = dayTasks.slice(0, MAX);
    const extra    = dayTasks.length - MAX;

    const chipsHtml = visible.map(t => chipHtml(t, spanType(t, key, monthFirstKey))).join('') +
      (extra > 0
        ? `<div onclick="event.stopPropagation();showDayPanel('${key}',${d})"
             style="font-size:10px;color:#6366f1;font-weight:600;cursor:pointer;padding:1px 4px;border-radius:3px;background:#eef2ff;margin-top:1px">
             +${extra} 更多</div>`
        : '');

    cells += `
      <div onclick="showDayPanel('${key}',${d})"
        style="min-height:90px;padding:4px;
               background:${isToday?'#eff6ff':'#fff'};
               border:${isToday?'2px solid #3b82f6':'1px solid #f1f5f9'};
               border-radius:8px;cursor:pointer;"
        onmouseover="if(this.style.border.indexOf('2px')<0)this.style.background='#f8fafc'"
        onmouseout="if(this.style.border.indexOf('2px')<0)this.style.background='#fff'">
        <div style="font-size:12px;font-weight:700;margin-bottom:3px;
                    color:${isToday?'#2563eb':isWeekend?'#ef4444':'#374151'}">
          ${isToday
            ? `<span style="background:#3b82f6;color:#fff;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:11px">${d}</span>`
            : d}
        </div>
        <div style="overflow:hidden">${chipsHtml}</div>
      </div>`;
  }

  return `
    <div class="grid grid-cols-7 mb-1">
      ${['日','一','二','三','四','五','六'].map((l,i) =>
        `<div style="text-align:center;font-size:12px;font-weight:600;padding:6px 0;color:${i===0||i===6?'#ef4444':'#94a3b8'}">${l}</div>`
      ).join('')}
    </div>
    <div class="grid grid-cols-7 gap-1">${cells}</div>
    <div id="cal-day-panel"></div>`;
}

// ── Day Panel（點擊日期後展開） ──────────────────────────────

function showDayPanel(key, day) {
  const panel = document.getElementById('cal-day-panel');
  if (!panel) return;

  const tasks = getTasksForDate(key);

  if (!tasks.length) {
    panel.innerHTML = `<div class="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400">${calMonth+1}/${day} 無進行中任務</div>`;
    return;
  }

  const statusMap  = { done:'已完成', active:'進行中', paused:'暫停中', pending:'未開始', overdue:'逾期' };

  panel.innerHTML = `
    <div class="mt-4 pt-4 border-t border-gray-100">
      <h4 class="font-semibold text-gray-700 text-sm mb-3">${calMonth+1}/${day} 進行中任務（${tasks.length} 件）</h4>
      <div class="flex flex-col gap-2">
        ${tasks.map(t => {
          const c    = STATUS_COLOR[t.status] || STATUS_COLOR.pending;
          const proj = AppState.projects.find(p => p.id === t.projectId);
          const user = AppState.users.find(u => u.id === t.assignee);
          return `
            <div onclick="AppState.currentTaskId=${t.id};navigateTo('task-detail')"
              style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;
                     background:${c.bg};border-left:4px solid ${c.bar};cursor:pointer;"
              onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:600;color:#1e293b">${t.name}</div>
                <div style="font-size:11px;color:#64748b;margin-top:2px">
                  ${proj ? proj.name : ''} · ${t.startDate} ～ ${t.dueDate}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
                <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:#fff;color:${c.text};border:1px solid ${c.bar}">
                  ${statusMap[t.status]||t.status}
                </span>
                ${user ? userAvatar(user, 24) : ''}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}
