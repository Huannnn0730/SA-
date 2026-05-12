// ============================================================
// PROJECT MANAGEMENT PAGE (Admin)
// ============================================================

function renderProjects() {
  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-bold text-gray-800 text-lg">專案管理</h2>
          <button onclick="openAddProjectModal()" class="btn btn-primary">
            ${svgIcon('plus', 16)} 新增專案
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="data-table" id="projects-table">
            <thead>
              <tr>
                <th>專案名稱</th><th>狀態</th><th>開始日期</th><th>結束日期</th><th>進度</th><th>操作</th>
              </tr>
            </thead>
            <tbody id="projects-tbody">
              ${renderProjectRows()}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}

function renderProjectRows() {
  return AppState.projects.map(p => `
    <tr>
      <td class="font-medium">${p.name}</td>
      <td><span class="badge ${AppState.statusBadge(p.status)}">${AppState.statusLabel(p.status)}</span></td>
      <td class="text-gray-500">${p.startDate}</td>
      <td class="text-gray-500">${p.endDate}</td>
      <td style="min-width:140px">
        <div class="flex items-center gap-2">
          <div class="flex-1">${progressBar(p.progress, p.progress >= 100 ? 'progress-green' : p.progress >= 50 ? 'progress-blue' : 'progress-orange')}</div>
          <span class="text-xs font-semibold text-gray-600">${p.progress}%</span>
        </div>
      </td>
      <td>
        <div class="flex items-center gap-1">
          <button onclick="openEditProjectModal(${p.id})" class="btn-icon" title="編輯">${svgIcon('edit', 16)}</button>
          <button onclick="deleteProject(${p.id})" class="btn-icon btn-icon-red" title="刪除">${svgIcon('trash', 16)}</button>
        </div>
      </td>
    </tr>`).join('');
}

function openAddProjectModal() {
  openModal(modalShell('新增專案',
    `<div class="flex flex-col gap-4">
      <div><label class="form-label">專案名稱</label><input id="proj-name" class="form-input" placeholder="請輸入專案名稱" /></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="form-label">開始日期</label><input id="proj-start" type="date" class="form-input" /></div>
        <div><label class="form-label">結束日期</label><input id="proj-end" type="date" class="form-input" /></div>
      </div>
      <div>
        <label class="form-label">狀態</label>
        <select id="proj-status" class="form-input form-select">
          <option value="pending">未開始</option><option value="active">進行中</option><option value="paused">暫停中</option><option value="done">已完成</option>
        </select>
      </div>
    </div>`,
    `<button onclick="closeModal()" class="btn btn-secondary">取消</button>
     <button onclick="addProject()" class="btn btn-primary">新增</button>`
  ));
}

function addProject() {
  const name = document.getElementById('proj-name').value.trim();
  const start = document.getElementById('proj-start').value;
  const end = document.getElementById('proj-end').value;
  const status = document.getElementById('proj-status').value;
  if (!name) { showToast('請輸入專案名稱', 'error'); return; }
  AppState.projects.push({
    id: AppState.projects.length + 1,
    name, status,
    startDate: start || '—', endDate: end || '—', progress: 0,
  });
  closeModal();
  document.getElementById('projects-tbody').innerHTML = renderProjectRows();
  showToast('專案已新增', 'success');
}

function openEditProjectModal(id) {
  const p = AppState.getProject(id);
  if (!p) return;
  openModal(modalShell('編輯專案',
    `<div class="flex flex-col gap-4">
      <div><label class="form-label">專案名稱</label><input id="edit-proj-name" class="form-input" value="${p.name}" /></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="form-label">開始日期</label><input id="edit-proj-start" type="date" class="form-input" value="${p.startDate.replace(/\//g,'-')}" /></div>
        <div><label class="form-label">結束日期</label><input id="edit-proj-end" type="date" class="form-input" value="${p.endDate.replace(/\//g,'-')}" /></div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="form-label">狀態</label>
          <select id="edit-proj-status" class="form-input form-select">
            ${['pending','active','paused','done'].map(s => `<option value="${s}" ${p.status===s?'selected':''}>${AppState.statusLabel(s)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">進度 (${p.progress}%)</label>
          <input id="edit-proj-progress" type="range" min="0" max="100" value="${p.progress}" class="w-full mt-3" oninput="this.previousElementSibling&&(this.previousElementSibling.textContent='進度 ('+this.value+'%)')" />
        </div>
      </div>
    </div>`,
    `<button onclick="closeModal()" class="btn btn-secondary">取消</button>
     <button onclick="saveProject(${id})" class="btn btn-primary">儲存</button>`
  ));
}

function saveProject(id) {
  const p = AppState.getProject(id);
  if (!p) return;
  p.name = document.getElementById('edit-proj-name').value.trim() || p.name;
  const s = document.getElementById('edit-proj-start').value;
  const e = document.getElementById('edit-proj-end').value;
  if (s) p.startDate = s.replace(/-/g, '/');
  if (e) p.endDate = e.replace(/-/g, '/');
  p.status = document.getElementById('edit-proj-status').value;
  p.progress = parseInt(document.getElementById('edit-proj-progress').value);
  closeModal();
  document.getElementById('projects-tbody').innerHTML = renderProjectRows();
  showToast('專案已更新', 'success');
}

function deleteProject(id) {
  confirmModal('刪除專案', '確定要刪除此專案嗎？此操作無法復原。', () => {
    AppState.projects = AppState.projects.filter(p => p.id !== id);
    document.getElementById('projects-tbody').innerHTML = renderProjectRows();
    showToast('專案已刪除', 'success');
  });
}
