// ============================================================
// GANTT CHART PAGE (Admin) — UC38 任務依賴箭頭
// ============================================================

function renderGantt() {
  const allTasks = AppState.tasks.slice(0, 8);

  const cols = ['5/1','5/5','5/15','5/22','6/1','6/12','6/20','7/5'];
  const colW = 80;
  const rowH = 40;
  const nameColW = 160;

  // [startCol, endCol, color]
  const ganttMap = {
    1: [0, 2, '#22c55e'],
    2: [1, 4, '#3b82f6'],
    3: [3, 5, '#3b82f6'],
    4: [3, 6, '#3b82f6'],
    5: [5, 7, '#94a3b8'],
    6: [0, 2, '#22c55e'],
    7: [2, 5, '#3b82f6'],
    8: [0, 1, '#22c55e'],
  };

  const tasks = allTasks.filter(t => ganttMap[t.id]);

  const headerCols = cols.map(c =>
    `<th style="width:${colW}px;padding:8px 0;font-size:12px;color:#64748b;font-weight:500;text-align:center;border-left:1px solid #f1f5f9">${c}</th>`
  ).join('');

  // Build bar position index for arrow drawing (taskId → {x, y, w})
  const barPos = {};
  tasks.forEach((t, rowIndex) => {
    const gm = ganttMap[t.id];
    if (!gm) return;
    const [startCol, endCol] = gm;
    barPos[t.id] = {
      x: nameColW + startCol * colW + 4,
      xEnd: nameColW + endCol * colW - 4,
      y: rowIndex * rowH + rowH / 2, // vertical center of bar
    };
  });

  const rows = tasks.map((t, rowIndex) => {
    const gm = ganttMap[t.id];
    if (!gm) return '';
    const [startCol, endCol, color] = gm;
    let cells = '';
    for (let i = 0; i < cols.length; i++) {
      if (i === startCol) {
        const span = endCol - startCol;
        const barW = (span * colW) - 8;
        cells += `<td colspan="${span}" style="position:relative;height:${rowH}px;border-left:1px solid #f1f5f9;padding:0">
          <div style="position:absolute;left:4px;top:9px;width:${barW}px;height:22px;background:${color};border-radius:4px;display:flex;align-items:center;padding:0 8px;font-size:11px;color:white;overflow:hidden;cursor:pointer"
               onclick="navigateTo('task-detail');AppState.currentTaskId=${t.id}">
            ${t.progress > 0 ? `<div style="position:absolute;left:0;top:0;height:100%;width:${t.progress}%;background:rgba(0,0,0,0.18);border-radius:4px 0 0 4px;pointer-events:none"></div>` : ''}
            <span style="position:relative;z-index:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.name}</span>
          </div>
        </td>`;
        i = endCol - 1;
      } else {
        cells += `<td style="border-left:1px solid #f1f5f9;height:${rowH}px"></td>`;
      }
    }

    // Dependency badge on task name
    const deps = (t.dependencies || []);
    const hasDep = deps.length > 0;
    const allDone = deps.every(did => {
      const dep = AppState.tasks.find(tk => tk.id === did);
      return dep && dep.status === 'done';
    });

    return `<tr>
      <td style="padding:8px 12px;font-size:13px;color:#374151;white-space:nowrap;border-bottom:1px solid #f1f5f9;font-weight:500;min-width:${nameColW}px">
        <div class="flex items-center gap-1">
          ${hasDep ? `<span title="有前置任務" style="color:${allDone?'#22c55e':'#f59e0b'};font-size:14px">${allDone?'✓':'⚑'}</span>` : ''}
          ${t.name}
        </div>
      </td>
      ${cells}
    </tr>`;
  }).join('');

  // Build SVG arrows for dependencies
  const svgArrows = tasks.flatMap(t => {
    const deps = t.dependencies || [];
    return deps.map(depId => {
      const from = barPos[depId];
      const to = barPos[t.id];
      if (!from || !to) return '';
      // Arrow from end of dependency bar → start of this bar
      const x1 = from.xEnd;
      const y1 = from.y;
      const x2 = to.x;
      const y2 = to.y;
      const midX = (x1 + x2) / 2;
      const color = '#f97316';
      return `<path d="M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}"
        fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="5,3"
        marker-end="url(#arrowhead)"/>`;
    });
  }).join('');

  const totalW = nameColW + cols.length * colW;
  const totalH = tasks.length * rowH;

  // Only render SVG layer if there are arrows
  const hasDeps = tasks.some(t => (t.dependencies||[]).length > 0);
  const svgOverlay = hasDeps ? `
    <div style="position:absolute;top:32px;left:0;pointer-events:none;z-index:10">
      <svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#f97316"/>
          </marker>
        </defs>
        ${svgArrows}
      </svg>
    </div>` : '';

  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-bold text-gray-800 text-lg">進度監控 — 甘特圖</h2>
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-gray-600">2024年 5月 — 7月</span>
            <button class="btn-icon">${svgIcon('arrow_left', 16)}</button>
            <button class="btn-icon">${svgIcon('arrow_right', 16)}</button>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-4 mb-4 text-xs">
          ${[['#22c55e','已完成'],['#3b82f6','進行中'],['#94a3b8','未開始']].map(([c,l]) =>
            `<div class="flex items-center gap-1.5"><span style="width:14px;height:10px;background:${c};border-radius:2px;display:inline-block"></span><span class="text-gray-500">${l}</span></div>`
          ).join('')}
          <div class="flex items-center gap-1.5">
            <svg width="28" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#f97316" stroke-width="2" stroke-dasharray="5,3"/><polygon points="18,2 26,5 18,8" fill="#f97316"/></svg>
            <span class="text-gray-500">任務依賴關係</span>
          </div>
          <div class="flex items-center gap-1.5"><span style="color:#f59e0b">⚑</span><span class="text-gray-500">有未完成的前置任務</span></div>
          <div class="flex items-center gap-1.5"><span style="color:#22c55e">✓</span><span class="text-gray-500">前置任務已完成</span></div>
        </div>

        <!-- Gantt -->
        <div class="overflow-x-auto" style="position:relative">
          ${svgOverlay}
          <table style="border-collapse:collapse;width:100%;position:relative;z-index:1">
            <thead>
              <tr>
                <th style="width:${nameColW}px;text-align:left;padding:8px 12px;font-size:12px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">任務名稱</th>
                ${headerCols}
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <!-- Dependency info panel -->
        ${tasks.some(t=>(t.dependencies||[]).length>0) ? `
        <div class="mt-4 pt-4 border-t border-gray-100">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">依賴關係說明</h4>
          <div class="flex flex-col gap-2">
            ${tasks.filter(t=>(t.dependencies||[]).length>0).map(t => {
              const deps = t.dependencies.map(did => AppState.tasks.find(tk=>tk.id===did)).filter(Boolean);
              return `<div class="text-xs text-gray-500">
                <span class="font-medium text-gray-700">${t.name}</span> 需等待
                ${deps.map(d=>`<span class="font-medium ${d.status==='done'?'text-green-600 line-through':'text-orange-500'}">${d.name}</span>`).join('、')}
                完成後才能開始
              </div>`;
            }).join('')}
          </div>
        </div>` : ''}
      </div>
    </div>`;
}
