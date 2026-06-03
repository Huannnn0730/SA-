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

function getMyTasks() {
  const u = AppState.currentUser;
  return u.role === 'admin'
    ? AppState.tasks
    : AppState.tasks.filter(t => t.assignee === u.id);
}

// 取得某天截止的任務
function getTasksDueOn(dateStr) {
  return getMyTasks().filter(t => {
    if (!t.dueDate || t.dueDate === '—') return false;
    return t.dueDate.replace(/\//g, '-') === dateStr;
  });
}

const STATUS_COLOR = {
  done:    { bg:'#dcfce7', text:'#16a34a', dot:'#22c55e' },
  active:  { bg:'#dbeafe', text:'#1d4ed8', dot:'#3b82f6' },
  paused:  { bg:'#fef3c7', text:'#b45309', dot:'#f59e0b' },
  pending: { bg:'#f1f5f9', text:'#64748b', dot:'#94a3b8' },
  overdue: { bg:'#fee2e2', text:'#dc2626', dot:'#ef4444' },
};

function taskChipCell(t) {
  const c = STATUS_COLOR[t.status] || STATUS_COLOR.pending;
  return `
    <div onclick="event.stopPropagation();AppState.currentTaskId=${t.id};navigateTo('task-detail')"
      title="${t.name}"
      style="background:${c.bg};color:${c.text};border-left:3px solid ${c.dot};
             border-radius:3px;padding:1px 5px;font-size:11px;font-weight:500;
             white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
             margin-bottom:2px;cursor:pointer;line-height:16px;"
    >${t.name}</div>`;
}

// ── Month View ─────────────────────────────────────────────

function renderMonthView() {
  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today       = new Date();
  const isCurrentMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;
  const MAX = 2;

  let cells = '';

  // 上個月補白
  for (let i = 0; i < firstDay; i++) {
    cells += `<div style="min-height:90px;padding:4px;background:#fafafa;border:1px solid #f1f5f9;border-radius:8px">
      <div style="font-size:12px;color:#d1d5db;font-weight:600">${new Date(calYear,calMonth,-firstDay+i+1).getDate()}</div>
    </div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key      = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday  = isCurrentMonth && d === today.getDate();
    const isWeekend = (firstDay + d - 1) % 7 === 0 || (firstDay + d - 1) % 7 === 6;
    const dueTasks = getTasksDueOn(key);
    const visible  = dueTasks.slice(0, MAX);
    const extra    = dueTasks.length - MAX;

    const chipsHtml = visible.map(t => taskChipCell(t)).join('') +
      (extra > 0
        ? `<div onclick="event.stopPropagation();showDayPanel('${key}',${d})"
             style="font-size:10px;color:#6366f1;font-weight:600;cursor:pointer;
                    padding:1px 4px;border-radius:3px;background:#eef2ff;">+${extra} 更多</div>`
        : '');

    cells += `
      <div onclick="showDayPanel('${key}',${d})"
        style="min-height:90px;padding:4px;
               background:${isToday ? '#eff6ff' : '#fff'};
               border:${isToday ? '2px solid #3b82f6' : '1px solid #f1f5f9'};
               border-radius:8px;cursor:pointer;"
        onmouseover="if(!this.style.border.includes('2px'))this.style.background='#f8fafc'"
        onmouseout="if(!this.style.border.includes('2px'))this.style.background='#fff'">
        <div style="font-size:12px;font-weight:700;margin-bottom:3px;
                    color:${isToday?'#2563eb':isWeekend?'#ef4444':'#374151'}">
          ${isToday
            ? `<span style="background:#3b82f6;color:#fff;border-radius:50%;width:20px;height:20px;
                            display:inline-flex;align-items:center;justify-content:center;font-size:11px">${d}</span>`
            : d}
        </div>
        <div style="overflow:hidden">${chipsHtml}</div>
      </div>`;
  }

  return `
    <div class="grid grid-cols-7 mb-1">
      ${['日','一','二','三','四','五','六'].map((l,i) =>
        `<div style="text-align:center;font-size:12px;font-weight:600;padding:6px 0;
                     color:${i===0||i===6?'#ef4444':'#94a3b8'}">${l}</div>`
      ).join('')}
    </div>
    <div class="grid grid-cols-7 gap-1">${cells}</div>
    <div id="cal-day-panel"></div>`;
}

// ── Day Panel ──────────────────────────────────────────────

function showDayPanel(key, day) {
  const panel = document.getElementById('cal-day-panel');
  if (!panel) return;

  const tasks = getTasksDueOn(key);
  const statusMap = { done:'已完成', active:'進行中', paused:'暫停中', pending:'未開始', overdue:'逾期' };

  if (!tasks.length) {
    panel.innerHTML = `<div class="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400">${calMonth+1}/${day} 無截止任務</div>`;
    return;
  }

  panel.innerHTML = `
    <div class="mt-4 pt-4 border-t border-gray-100">
      <h4 class="font-semibold text-gray-700 text-sm mb-3">${calMonth+1}/${day} 截止任務（${tasks.length} 件）</h4>
      <div class="flex flex-col gap-2">
        ${tasks.map(t => {
          const c    = STATUS_COLOR[t.status] || STATUS_COLOR.pending;
          const proj = AppState.projects.find(p => p.id === t.projectId);
          const user = AppState.users.find(u => u.id === t.assignee);
          return `
            <div onclick="AppState.currentTaskId=${t.id};navigateTo('task-detail')"
              style="display:flex;align-items:center;gap:12px;padding:10px 14px;
                     border-radius:10px;background:${c.bg};border-left:4px solid ${c.dot};cursor:pointer;"
              onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:600;color:#1e293b">${t.name}</div>
                <div style="font-size:11px;color:#64748b;margin-top:2px">
                  ${proj ? proj.name : ''} · 開始 ${t.startDate || '—'}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
                <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;
                             background:#fff;color:${c.text};border:1px solid ${c.dot}">
                  ${statusMap[t.status]||t.status}
                </span>
                ${user ? userAvatar(user, 24) : ''}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}
