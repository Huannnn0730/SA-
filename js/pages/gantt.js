// ============================================================
// GANTT CHART PAGE (Admin)
// ============================================================

function renderGantt() {
  // Build gantt data: tasks with start/end as column indices across weeks
  const projectId = AppState.projects[0].id;
  const allTasks = AppState.tasks.slice(0, 8);

  // 8 columns = 8 date labels
  const cols = ['5/1','5/5','5/15','5/22','6/1','6/12','6/20','7/5'];
  const colW = 80;
  const totalW = cols.length * colW;

  // Manually map tasks to gantt positions [startCol, endCol, color]
  const ganttMap = {
    1: [0, 2, '#22c55e', 'done'],    // 需求文件撰寫
    2: [1, 4, '#3b82f6', 'active'],  // 設計稿確認
    3: [3, 5, '#3b82f6', 'active'],  // 前端開發
    4: [3, 6, '#3b82f6', 'active'],  // 後端API開發
    5: [5, 7, '#94a3b8', 'pending'], // 測試與修正
    6: [0, 2, '#22c55e', 'done'],    // 行銷素材
    7: [2, 5, '#3b82f6', 'active'],  // 活動頁面開發
    8: [0, 1, '#22c55e', 'done'],    // 系統架構
  };

  const tasks = allTasks.filter(t => ganttMap[t.id]);

  const headerCols = cols.map(c => `<th style="width:${colW}px;padding:8px 0;font-size:12px;color:#64748b;font-weight:500;text-align:center;border-left:1px solid #f1f5f9">${c}</th>`).join('');

  const rows = tasks.map(t => {
    const gm = ganttMap[t.id];
    if (!gm) return '';
    const [startCol, endCol, color, status] = gm;
    const colSpanCells = cols.map((_, i) => {
      if (i === startCol) {
        const span = endCol - startCol;
        const barW = (span * colW) - 8;
        return `<td style="position:relative;border-left:1px solid #f1f5f9;padding:0">
          <div title="${t.name}" style="position:absolute;left:4px;top:8px;width:${barW}px;height:22px;background:${color};border-radius:4px;z-index:1;display:flex;align-items:center;padding:0 8px;font-size:11px;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer" onclick="navigateTo('task-detail');AppState.currentTaskId=${t.id}">
            ${t.progress > 0 ? `<div style="position:absolute;left:0;top:0;height:100%;width:${t.progress}%;background:rgba(0,0,0,0.15);border-radius:4px 0 0 4px"></div>` : ''}
            <span style="position:relative;z-index:1">${t.name}</span>
          </div>
        </td>`;
      }
      if (i > startCol && i <= endCol) return '';  // merged
      return `<td style="border-left:1px solid #f1f5f9"></td>`;
    });

    // Remove empty (merged) cells properly
    let cells = '';
    for (let i = 0; i < cols.length; i++) {
      if (i === startCol) {
        const span = endCol - startCol;
        const barW = (span * colW) - 8;
        cells += `<td colspan="${span}" style="position:relative;height:40px;border-left:1px solid #f1f5f9;padding:0">
          <div style="position:absolute;left:4px;top:8px;width:${barW}px;height:22px;background:${color};border-radius:4px;display:flex;align-items:center;padding:0 8px;font-size:11px;color:white;overflow:hidden;cursor:pointer" onclick="navigateTo('task-detail');AppState.currentTaskId=${t.id}">
            ${t.progress > 0 ? `<div style="position:absolute;left:0;top:0;height:100%;width:${t.progress}%;background:rgba(0,0,0,0.18);border-radius:4px 0 0 4px;pointer-events:none"></div>` : ''}
            <span style="position:relative;z-index:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.name}</span>
          </div>
        </td>`;
        i = endCol - 1;
      } else {
        cells += `<td style="border-left:1px solid #f1f5f9;height:40px"></td>`;
      }
    }

    const proj = AppState.getProject(t.projectId);
    return `<tr>
      <td style="padding:8px 12px;font-size:13px;color:#374151;white-space:nowrap;border-bottom:1px solid #f1f5f9;font-weight:500;min-width:160px">${t.name}</td>
      ${cells}
    </tr>`;
  }).join('');

  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-bold text-gray-800 text-lg">進度監控 — 甘特圖</h2>
          <div class="flex items-center gap-3">
            <div class="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button class="btn btn-sm ${true?'btn-primary':'btn-secondary'}" style="padding:4px 12px;font-size:12px">月</button>
              <button class="btn btn-sm btn-secondary" style="padding:4px 12px;font-size:12px">週</button>
            </div>
            <span class="text-sm font-medium text-gray-600">2024年 5月 — 6月</span>
            <button class="btn-icon">${svgIcon('arrow_left', 16)}</button>
            <button class="btn-icon">${svgIcon('arrow_right', 16)}</button>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-4 mb-4 text-xs">
          ${[['#22c55e','已完成'],['#3b82f6','進行中'],['#94a3b8','未開始'],['#ef4444','逾期']].map(([c,l]) =>
            `<div class="flex items-center gap-1.5"><span style="width:14px;height:10px;background:${c};border-radius:2px;display:inline-block"></span><span class="text-gray-500">${l}</span></div>`
          ).join('')}
        </div>

        <!-- Gantt -->
        <div class="overflow-x-auto">
          <table style="border-collapse:collapse;width:100%">
            <thead>
              <tr>
                <th style="width:160px;text-align:left;padding:8px 12px;font-size:12px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">任務名稱</th>
                ${headerCols}
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}
