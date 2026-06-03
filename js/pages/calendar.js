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
      ${allEvents.length ? allEvents.sort(([a],[b])=>a.localeCompare(b)).map(([date, tasks]) =>
        tasks.map(t => {
          const statusMap = { done:'已完成', active:'進行中', paused:'暫停中', pending:'未開始', overdue:'逾期' };
          const badgeColor = { done:'#dcfce7;color:#16a34a', active:'#dbeafe;color:#1d4ed8', paused:'#fef3c7;color:#b45309', pending:'#f1f5f9;color:#64748b', overdue:'#fee2e2;color:#dc2626' };
          const borderColor = { done:'#16a34a', active:'#3b82f6', paused:'#f59e0b', pending:'#cbd5e1', overdue:'#ef4444' };
          const assigneeUser = AppState.users.find(u => u.id === t.assignee);
          const proj = AppState.projects.find(p => p.id === t.projectId);
          const day = date.split('-')[2];
          const month = date.split('-')[1];
          return `
            <div data-date="${date}" onclick="AppState.currentTaskId=${t.id};navigateTo('task-detail')"
              style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;border:1px solid #f1f5f9;
                     border-left:4px solid ${borderColor[t.status]||'#cbd5e1'};background:#fff;cursor:pointer;margin-bottom:8px;
                     transition:box-shadow .15s,outline .15s;"
              onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'"
              onmouseout="this.style.boxShadow='none'">
              <div style="width:36px;height:36px;background:#eff6ff;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0">
                <span style="font-size:10px;color:#93c5fd;font-weight:600;line-height:1">${month}月</span>
                <span style="font-size:15px;color:#2563eb;font-weight:700;line-height:1.2">${day}</span>
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:600;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.name}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px">${proj ? proj.name : ''} ${t.startDate ? `· ${t.startDate} ～ ${t.dueDate}` : ''}</div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
                <span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:${badgeColor[t.status]||badgeColor.pending}">
                  ${statusMap[t.status]||t.status}
                </span>
                ${assigneeUser ? userAvatar(assigneeUser, 26) : ''}
              </div>
            </div>`;
        }).join('')
      ).join('') : `<div class="text-gray-400 text-sm">本月無排定事件</div>`}
    </div>`;
}

function showCalDayEvents(key, day) {
  // 清除舊高亮
  document.querySelectorAll('#cal-events [data-date]').forEach(el => {
    el.style.outline = 'none';
    el.style.background = '#fff';
  });
  const cards = document.querySelectorAll(`#cal-events [data-date="${key}"]`);
  if (!cards.length) return;
  cards.forEach(el => {
    el.style.outline = '2px solid #3b82f6';
    el.style.background = '#eff6ff';
  });
  cards[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
