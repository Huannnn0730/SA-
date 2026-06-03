// ============================================================
// CALENDAR PAGE
// ============================================================

var calYear  = new Date().getFullYear();
var calMonth = new Date().getMonth();
var calView  = 'month'; // 'month' | 'week' | 'day'
var calWeekStart = (() => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - d.getDay()); return d; })();
var calDay   = new Date(); // selected day for day view

function renderCalendar() {
  const viewBtns = ['month','week','day'].map((v, i) => {
    const labels = ['月','週','日'];
    const active = calView === v;
    return `<button onclick="calView='${v}';renderCalendar()"
      class="btn btn-sm ${active ? 'btn-primary' : 'btn-secondary'}"
      style="padding:4px 12px;font-size:12px">${labels[i]}</button>`;
  }).join('');

  let navHtml = '', contentHtml = '';

  if (calView === 'month') {
    navHtml = `
      <button onclick="calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderCalendar();" class="btn-icon">${svgIcon('arrow_left', 18)}</button>
      <h3 class="font-bold text-gray-800 text-lg">${calYear} 年 ${calMonth + 1} 月</h3>
      <button onclick="calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderCalendar();" class="btn-icon">${svgIcon('arrow_right', 18)}</button>`;
    contentHtml = renderMonthView();
  } else if (calView === 'week') {
    const weekEnd = new Date(calWeekStart); weekEnd.setDate(calWeekStart.getDate() + 6);
    navHtml = `
      <button onclick="calWeekStart=new Date(calWeekStart);calWeekStart.setDate(calWeekStart.getDate()-7);renderCalendar();" class="btn-icon">${svgIcon('arrow_left', 18)}</button>
      <h3 class="font-bold text-gray-800 text-lg">${calWeekStart.getMonth()+1}/${calWeekStart.getDate()} — ${weekEnd.getMonth()+1}/${weekEnd.getDate()}</h3>
      <button onclick="calWeekStart=new Date(calWeekStart);calWeekStart.setDate(calWeekStart.getDate()+7);renderCalendar();" class="btn-icon">${svgIcon('arrow_right', 18)}</button>`;
    contentHtml = renderWeekView();
  } else {
    navHtml = `
      <button onclick="calDay=new Date(calDay);calDay.setDate(calDay.getDate()-1);renderCalendar();" class="btn-icon">${svgIcon('arrow_left', 18)}</button>
      <h3 class="font-bold text-gray-800 text-lg">${calDay.getFullYear()} 年 ${calDay.getMonth()+1} 月 ${calDay.getDate()} 日</h3>
      <button onclick="calDay=new Date(calDay);calDay.setDate(calDay.getDate()+1);renderCalendar();" class="btn-icon">${svgIcon('arrow_right', 18)}</button>`;
    contentHtml = renderDayView();
  }

  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-bold text-gray-800 text-lg">行事曆</h2>
          <div class="flex gap-1 bg-gray-100 rounded-lg p-1">${viewBtns}</div>
        </div>
        <div class="flex items-center justify-between mb-4">${navHtml}</div>
        ${contentHtml}
      </div>
    </div>`;
}

// ── Helpers ────────────────────────────────────────────────

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getTasksForDate(dateStr) {
  const u = AppState.currentUser;
  const tasks = u.role === 'admin' ? AppState.tasks : AppState.tasks.filter(t => t.assignee === u.id);
  return tasks.filter(t => {
    if (!t.startDate || !t.dueDate) return false;
    const start = t.startDate.replace(/\//g, '-');
    const end   = t.dueDate.replace(/\//g, '-');
    return start <= dateStr && dateStr <= end;
  });
}

const CAL_STATUS_COLOR = {
  done:    { bg: '#dcfce7', text: '#16a34a', border: '#16a34a' },
  active:  { bg: '#dbeafe', text: '#1d4ed8', border: '#2563eb' },
  paused:  { bg: '#fef3c7', text: '#b45309', border: '#d97706' },
  pending: { bg: '#f1f5f9', text: '#64748b', border: '#94a3b8' },
  overdue: { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' },
};

// 在月視圖中，取得任務在這一天的視覺型態
// viewFirstKey: 當月第一天 (YYYY-MM-01)
function taskSpanType(t, dateStr, viewFirstKey) {
  const start = t.startDate.replace(/\//g, '-');
  const end   = t.dueDate.replace(/\//g, '-');
  if (start === end) return 'single';
  // 視覺起點：任務真實起點 或 當月第一天（跨月任務）
  const visStart = start < viewFirstKey ? viewFirstKey : start;
  if (dateStr === visStart) return 'start';
  if (dateStr === end)      return 'end';
  return 'mid';
}

function taskChipMonth(t, spanType) {
  const c = CAL_STATUS_COLOR[t.status] || CAL_STATUS_COLOR.pending;
  const radius = spanType === 'single' ? '6px'
    : spanType === 'start' ? '6px 0 0 6px'
    : spanType === 'end'   ? '0 6px 6px 0'
    : '0';
  const ml = spanType === 'mid' || spanType === 'end' ? '-1px' : '0';
  const showText = spanType === 'start' || spanType === 'single';
  return `<div onclick="event.stopPropagation();AppState.currentTaskId=${t.id};navigateTo('task-detail')"
    title="${t.name}"
    style="background:${c.bg};color:${c.text};border-left:${showText?`3px solid ${c.border}`:'none'};
           border-radius:${radius};margin-left:${ml};padding:2px ${showText?'6px':'2px'};
           font-size:11px;font-weight:500;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
           margin-bottom:2px;line-height:1.5;"
  >${showText ? t.name : '&nbsp;'}</div>`;
}

// ── Month View ─────────────────────────────────────────────

function renderMonthView() {
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;

  const MAX_VISIBLE = 2;
  const viewFirstKey = `${calYear}-${String(calMonth+1).padStart(2,'0')}-01`;

  let cells = '';
  // 上個月補白
  for (let i = 0; i < firstDay; i++) {
    const prevDate = new Date(calYear, calMonth, -firstDay + i + 1).getDate();
    cells += `<div style="min-height:90px;padding:6px 4px;background:#fafafa;border:1px solid #f1f5f9;border-radius:8px">
      <div style="font-size:13px;font-weight:600;color:#d1d5db;margin-bottom:4px">${prevDate}</div>
    </div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = isCurrentMonth && d === today.getDate();
    const isWeekend = (firstDay + d - 1) % 7 === 0 || (firstDay + d - 1) % 7 === 6;
    const dayTasks = getTasksForDate(key);
    const visible = dayTasks.slice(0, MAX_VISIBLE);
    const extra = dayTasks.length - MAX_VISIBLE;

    const chipsHtml = visible.map(t => taskChipMonth(t, taskSpanType(t, key, viewFirstKey))).join('') +
      (extra > 0 ? `<div onclick="event.stopPropagation();showCalDayPanel('${key}',${d})"
        style="font-size:11px;color:#6366f1;font-weight:600;cursor:pointer;padding:1px 6px;border-radius:4px;background:#eef2ff">
        +${extra} 更多</div>` : '');

    cells += `
      <div onclick="showCalDayPanel('${key}',${d})"
        style="min-height:90px;padding:6px 4px;
               background:${isToday ? '#eff6ff' : '#fff'};
               border:${isToday ? '2px solid #3b82f6' : '1px solid #f1f5f9'};
               border-radius:8px;cursor:pointer;transition:background .15s;"
        onmouseover="this.style.background='${isToday?'#dbeafe':'#f8fafc'}'"
        onmouseout="this.style.background='${isToday?'#eff6ff':'#fff'}'">
        <div style="font-size:13px;font-weight:700;margin-bottom:4px;
                    color:${isToday?'#2563eb':isWeekend?'#ef4444':'#374151'};
                    display:flex;align-items:center;gap:4px;">
          ${isToday
            ? `<span style="background:#3b82f6;color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px">${d}</span>`
            : d}
        </div>
        <div style="overflow:hidden">${chipsHtml}</div>
      </div>`;
  }

  return `
    <div class="grid grid-cols-7 mb-2">
      ${['日','一','二','三','四','五','六'].map((label, i) =>
        `<div style="text-align:center;font-size:12px;font-weight:600;padding:6px 0;color:${i===0||i===6?'#ef4444':'#94a3b8'}">${label}</div>`
      ).join('')}
    </div>
    <div class="grid grid-cols-7 gap-1">${cells}</div>
    <div id="cal-day-panel"></div>`;
}

function showCalDayPanel(key, day) {
  const tasks = getTasksForDate(key);
  const panel = document.getElementById('cal-day-panel');
  if (!panel) return;
  if (!tasks.length) {
    panel.innerHTML = `<div class="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400">${calMonth+1}/${day} 無進行中任務</div>`;
    return;
  }
  panel.innerHTML = `
    <div class="mt-4 pt-4 border-t border-gray-100">
      <h4 class="font-semibold text-gray-700 text-sm mb-3">${calMonth+1}/${day} 進行中任務（${tasks.length} 件）</h4>
      <div class="flex flex-col gap-2">
        ${tasks.map(t => {
          const c = CAL_STATUS_COLOR[t.status] || CAL_STATUS_COLOR.pending;
          const proj = AppState.projects.find(p => p.id === t.projectId);
          return `
            <div onclick="AppState.currentTaskId=${t.id};navigateTo('task-detail')"
              style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;
                     background:${c.bg};border-left:4px solid ${c.border};cursor:pointer;transition:opacity .15s"
              onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600;color:#1e293b">${t.name}</div>
                <div style="font-size:11px;color:#64748b;margin-top:2px">${proj ? proj.name : ''} · ${t.startDate} ～ ${t.dueDate}</div>
              </div>
              <span style="font-size:11px;font-weight:600;color:${c.text};background:#fff;border-radius:20px;padding:2px 8px;border:1px solid ${c.border}">
                ${t.status === 'done' ? '已完成' : t.status === 'active' ? '進行中' : t.status === 'paused' ? '暫停中' : '未開始'}
              </span>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

// ── Week View ──────────────────────────────────────────────

function renderWeekView() {
  const myEvents = getMyCalendarEvents();
  const today = new Date(); today.setHours(0,0,0,0);
  const days = Array.from({length:7}, (_,i) => { const d = new Date(calWeekStart); d.setDate(d.getDate()+i); return d; });
  const dayLabels = ['日','一','二','三','四','五','六'];

  return `
    <div class="grid grid-cols-7 gap-2" style="min-height:200px">
      ${days.map(d => {
        const key = dateKey(d);
        const tasks = myEvents[key] || [];
        const isToday = d.getTime() === today.getTime();
        return `
          <div class="flex flex-col gap-1" style="min-height:160px">
            <div class="text-center pb-2 mb-1 border-b border-gray-100">
              <div class="text-xs text-gray-400">${dayLabels[d.getDay()]}</div>
              <div class="text-sm font-bold ${isToday ? 'text-white bg-blue-500 rounded-full w-7 h-7 flex items-center justify-center mx-auto' : 'text-gray-700'}">${d.getDate()}</div>
            </div>
            ${tasks.length ? tasks.map(t => taskChip(t)).join('') : ''}
          </div>`;
      }).join('')}
    </div>`;
}

// ── Day View ───────────────────────────────────────────────

function renderDayView() {
  const myEvents = getMyCalendarEvents();
  const key = dateKey(calDay);
  const tasks = myEvents[key] || [];
  const dayLabels = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];

  return `
    <div>
      <div class="text-center mb-4">
        <div class="text-sm text-gray-400">${dayLabels[calDay.getDay()]}</div>
      </div>
      ${tasks.length ? `
        <div class="flex flex-col gap-3">
          ${tasks.map(t => {
            const colorMap = { done:'#22c55e', active:'#3b82f6', paused:'#f59e0b', pending:'#94a3b8' };
            const proj = AppState.getProject(t.projectId);
            return `
              <div class="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                   onclick="AppState.currentTaskId=${t.id};navigateTo('task-detail')"
                   style="border-left:4px solid ${colorMap[t.status] || '#94a3b8'}">
                <div class="flex-1">
                  <div class="font-medium text-gray-800">${t.name}</div>
                  <div class="text-xs text-gray-400 mt-0.5">${proj ? proj.name : ''}</div>
                </div>
                <span class="badge ${AppState.priorityBadge(t.priority)} text-xs">${AppState.priorityLabel(t.priority)}</span>
              </div>`;
          }).join('')}
        </div>` : `
        <div class="text-center py-12 text-gray-400">
          ${svgIcon('calendar', 36)}
          <div class="mt-3 text-sm">今日無任務到期</div>
        </div>`}
    </div>`;
}
