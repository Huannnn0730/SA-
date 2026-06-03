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

function getMyCalendarEvents() {
  const u = AppState.currentUser;
  const tasks = u.role === 'admin' ? AppState.tasks : AppState.tasks.filter(t => t.assignee === u.id);
  const events = {};
  tasks.forEach(t => {
    if (!t.dueDate || t.dueDate === '—') return;
    const key = t.dueDate.replace(/\//g, '-');
    if (!events[key]) events[key] = [];
    events[key].push(t);
  });
  return events;
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function taskChip(t) {
  const colorMap = { done:'#22c55e', active:'#3b82f6', paused:'#f59e0b', pending:'#94a3b8' };
  const color = colorMap[t.status] || '#94a3b8';
  return `<div onclick="AppState.currentTaskId=${t.id};navigateTo('task-detail')"
    style="background:${color};color:white;border-radius:4px;padding:2px 6px;font-size:11px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px"
    title="${t.name}">${t.name}</div>`;
}

// ── Month View ─────────────────────────────────────────────

function renderMonthView() {
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;
  const myEvents = getMyCalendarEvents();

  let cells = '';
  for (let i = 0; i < firstDay; i++) {
    cells += `<div class="calendar-day text-gray-200 cursor-default">${new Date(calYear, calMonth, -firstDay + i + 1).getDate()}</div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const hasEvent = !!myEvents[key];
    const isToday = isCurrentMonth && d === today.getDate();
    cells += `<div class="calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}" onclick="showCalDayEvents('${key}', ${d})">${d}</div>`;
  }

  const allEvents = Object.entries(myEvents).filter(([k]) => {
    const [y, m] = k.split('-').map(Number);
    return y === calYear && m === calMonth + 1;
  });

  return `
    <div class="grid grid-cols-7 mb-2">
      ${['日','一','二','三','四','五','六'].map(d => `<div class="text-center text-xs font-semibold text-gray-400 py-2">${d}</div>`).join('')}
    </div>
    <div id="cal-grid" class="grid grid-cols-7 gap-1">${cells}</div>
    <div id="cal-events" class="mt-4 pt-4 border-t border-gray-100">
      <h4 class="font-semibold text-gray-700 text-sm mb-3">本月任務事件</h4>
      ${allEvents.length ? allEvents.sort(([a],[b])=>a.localeCompare(b)).map(([date, tasks]) => `
        <div class="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
          <div style="width:32px;height:32px;background:#dbeafe;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#2563eb;font-size:12px;font-weight:700;flex-shrink:0">${date.split('-')[2]}</div>
          <div class="flex flex-col gap-1 flex-1">${tasks.map(t => taskChip(t)).join('')}</div>
        </div>`).join('') : `<div class="text-gray-400 text-sm">本月無排定事件</div>`}
    </div>`;
}

function showCalDayEvents(key, day) {
  const myEvents = getMyCalendarEvents();
  const tasks = myEvents[key];
  const evEl = document.getElementById('cal-events');
  if (!evEl) return;
  if (!tasks) { evEl.innerHTML = `<div class="text-gray-400 text-sm">${calMonth+1}/${day} 無任務</div>`; return; }
  evEl.innerHTML = `
    <h4 class="font-semibold text-gray-700 text-sm mb-3">${calMonth+1}/${day} 任務事件</h4>
    ${tasks.map(t => `
      <div class="flex items-center gap-2 p-2 bg-blue-50 rounded-lg mb-2 cursor-pointer hover:bg-blue-100"
           onclick="AppState.currentTaskId=${t.id};navigateTo('task-detail')">
        ${svgIcon('check_circle', 16)}
        <span class="text-sm text-gray-700">${t.name}</span>
      </div>`).join('')}`;
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
