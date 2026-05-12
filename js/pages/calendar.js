// ============================================================
// CALENDAR PAGE
// ============================================================

let calYear = 2024, calMonth = 5; // 0-indexed: 5 = June

function renderCalendar() {
  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-bold text-gray-800 text-lg">行事曆</h2>
          <div class="flex items-center gap-3">
            <div class="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button class="btn btn-sm btn-primary" style="padding:4px 12px;font-size:12px">月</button>
              <button class="btn btn-sm btn-secondary" style="padding:4px 12px;font-size:12px">週</button>
              <button class="btn btn-sm btn-secondary" style="padding:4px 12px;font-size:12px">日</button>
            </div>
          </div>
        </div>

        <!-- Month nav -->
        <div class="flex items-center justify-between mb-4">
          <button onclick="calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderCalendar();" class="btn-icon">${svgIcon('arrow_left', 18)}</button>
          <h3 class="font-bold text-gray-800 text-lg">${calYear} 年 ${calMonth + 1} 月</h3>
          <button onclick="calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderCalendar();" class="btn-icon">${svgIcon('arrow_right', 18)}</button>
        </div>

        <!-- Week headers -->
        <div class="grid grid-cols-7 mb-2">
          ${['日','一','二','三','四','五','六'].map(d => `<div class="text-center text-xs font-semibold text-gray-400 py-2">${d}</div>`).join('')}
        </div>

        <!-- Calendar grid -->
        <div id="cal-grid" class="grid grid-cols-7 gap-1">
          ${renderCalGrid()}
        </div>

        <!-- Event list for selected day -->
        <div id="cal-events" class="mt-4 pt-4 border-t border-gray-100">
          <h4 class="font-semibold text-gray-700 text-sm mb-3">本月任務事件</h4>
          ${renderAllCalEvents()}
        </div>
      </div>
    </div>`;
}

function renderCalGrid() {
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;

  let cells = '';
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells += `<div class="calendar-day text-gray-200 cursor-default">${new Date(calYear, calMonth, -firstDay + i + 1).getDate()}</div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const hasEvent = !!AppState.calendarEvents[dateKey];
    const isToday = isCurrentMonth && d === today.getDate();
    cells += `<div class="calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}" onclick="showCalDayEvents('${dateKey}', ${d})">${d}</div>`;
  }

  return cells;
}

function renderAllCalEvents() {
  const events = Object.entries(AppState.calendarEvents).filter(([k]) => {
    const [y, m] = k.split('-').map(Number);
    return y === calYear && m === calMonth + 1;
  });

  if (!events.length) return `<div class="text-gray-400 text-sm">本月無排定事件</div>`;

  return events.map(([date, tasks]) => `
    <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
      <div style="width:32px;height:32px;background:#dbeafe;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#2563eb;font-size:12px;font-weight:700;flex-shrink:0">${date.split('-')[2]}</div>
      <div>
        ${tasks.map(t => `<span class="text-sm text-gray-700 block">${t}</span>`).join('')}
      </div>
    </div>`).join('');
}

function showCalDayEvents(dateKey, day) {
  const events = AppState.calendarEvents[dateKey];
  if (!events) return;
  const content = `
    <h4 class="font-semibold text-gray-700 text-sm mb-3">${calMonth+1}/${day} 任務事件</h4>
    ${events.map(t => `
      <div class="flex items-center gap-2 p-2 bg-blue-50 rounded-lg mb-2">
        ${svgIcon('check_circle', 16)}
        <span class="text-sm text-gray-700">${t}</span>
      </div>`).join('')}`;
  const evEl = document.getElementById('cal-events');
  if (evEl) evEl.innerHTML = content;
}
