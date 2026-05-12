// ============================================================
// REPORTS PAGE (Admin)
// ============================================================

function renderReports() {
  const rd = AppState.reportData;
  const totalTasks = rd.taskDist.reduce((a, b) => a + b.value, 0);
  const maxHours = Math.max(...rd.hoursData.map(d => d.hours));

  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-gray-800 text-lg">專案報表</h2>
        <button onclick="showToast('報表已匯出','success')" class="btn btn-primary">${svgIcon('download', 16)} 匯出</button>
      </div>

      <!-- Summary stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="card text-center">
          <div class="text-4xl font-black text-blue-600 mb-1">${rd.completionRate}%</div>
          <div class="text-sm text-gray-500">任務完成率</div>
          <div class="text-xs text-green-600 mt-1 font-medium">↑10% 較上月</div>
        </div>
        <div class="card text-center">
          <div class="text-4xl font-black text-red-500 mb-1">${rd.overdueTasks}</div>
          <div class="text-sm text-gray-500">逾期任務</div>
          <div class="text-xs text-red-500 mt-1 font-medium">↑2 較上月</div>
        </div>
        <div class="card text-center">
          <div class="text-4xl font-black text-purple-600 mb-1">${rd.totalHours}</div>
          <div class="text-sm text-gray-500">總工時（小時）</div>
          <div class="text-xs text-red-500 mt-1 font-medium">↑28 較上月</div>
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
                  ${progressBar(Math.round(d.value / totalTasks * 100), '', 5)}
                </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Hours bar chart -->
        <div class="card">
          <h3 class="font-bold text-gray-800 mb-4">工時統計（小時）</h3>
          <div class="overflow-x-auto">
            ${barChart(rd.hoursData, maxHours, 340, 140)}
          </div>
          <div class="flex flex-col gap-2 mt-4">
            ${rd.hoursData.map(d => `
              <div class="flex items-center gap-3 text-sm">
                <span class="text-gray-600 w-16 flex-shrink-0">${d.name}</span>
                <div class="flex-1">${progressBar(Math.round(d.hours / maxHours * 100), 'progress-blue', 8)}</div>
                <span class="font-semibold text-gray-700 w-12 text-right">${d.hours}h</span>
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
                      <div class="flex-1">${progressBar(p.progress, 'progress-blue')}</div>
                      <span class="text-sm font-semibold text-gray-600">${p.progress}%</span>
                    </div>
                  </td>
                  <td class="text-gray-500">${pTasks.length} 個</td>
                  <td><span class="font-semibold ${rate >= 80 ? 'text-green-600' : rate >= 50 ? 'text-blue-600' : 'text-orange-500'}">${rate}%</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}
