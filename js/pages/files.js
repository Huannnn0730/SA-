// ============================================================
// FILE MANAGEMENT PAGE
// ============================================================

let selectedProjectId = 'all'; // 'all' | projectId number

function renderFiles() {
  const projects = AppState.projects;
  const allCount = AppState.files.length;

  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-bold text-gray-800 text-lg">檔案管理</h2>
          <button onclick="openUploadModal()" class="btn btn-primary">${svgIcon('upload', 16)} 上傳檔案</button>
        </div>

        <div class="flex gap-6">
          <!-- Project folder list -->
          <div style="width:200px;flex-shrink:0">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">專案資料夾</div>
            <div onclick="selectedProjectId='all';renderFiles()" class="file-item ${selectedProjectId==='all' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}">
              ${svgIcon('folder', 18)}
              <span class="text-sm font-medium">全部</span>
              <span class="ml-auto text-xs text-gray-400">${allCount}</span>
            </div>
            ${projects.map(p => `
              <div onclick="selectedProjectId=${p.id};renderFiles()" class="file-item ${selectedProjectId===p.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}">
                ${svgIcon('folder', 18)}
                <span class="text-sm font-medium truncate">${p.name}</span>
                <span class="ml-auto text-xs text-gray-400 flex-shrink-0">${AppState.files.filter(f => f.projectId === p.id).length}</span>
              </div>`).join('')}
          </div>

          <!-- File list -->
          <div class="flex-1">
            <div class="flex items-center justify-between mb-3">
              <div class="text-sm font-semibold text-gray-600">
                ${selectedProjectId === 'all' ? '全部' : AppState.projects.find(p => p.id === selectedProjectId)?.name || ''}
              </div>
              <div class="search-input-wrap">
                ${svgIcon('search', 14, 'search-icon')}
                <input class="form-input" style="padding-left:32px;height:34px;font-size:13px;width:180px" placeholder="搜尋檔案..."
                  oninput="filterFileList(this.value)" />
              </div>
            </div>

            <div class="grid text-xs font-semibold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100 mb-2" style="grid-template-columns:1fr 100px 100px 80px">
              <span>名稱</span><span>大小</span><span>上傳日期</span><span></span>
            </div>

            <div id="file-list">
              ${renderFileRows()}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden file input -->
    <input type="file" id="file-input" style="display:none" multiple onchange="handleFileSelect(this)" />`;
}

const fileIconMap = {
  pdf:   { bg: '#fee2e2', color: '#b91c1c', label: 'PDF' },
  xlsx:  { bg: '#dcfce7', color: '#15803d', label: 'XLS' },
  zip:   { bg: '#fef9c3', color: '#a16207', label: 'ZIP' },
  image: { bg: '#ede9fe', color: '#7c3aed', label: 'IMG' },
  drawio:{ bg: '#dbeafe', color: '#1d4ed8', label: 'DIO' },
  doc:   { bg: '#e0f2fe', color: '#0369a1', label: 'DOC' },
  other: { bg: '#f1f5f9', color: '#64748b', label: 'FILE' },
};

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return 'pdf';
  if (['xlsx','xls','csv'].includes(ext)) return 'xlsx';
  if (['zip','rar','7z'].includes(ext)) return 'zip';
  if (['png','jpg','jpeg','gif','svg','webp'].includes(ext)) return 'image';
  if (['drawio'].includes(ext)) return 'drawio';
  if (['doc','docx'].includes(ext)) return 'doc';
  return 'other';
}

function getFilteredFiles() {
  return selectedProjectId === 'all'
    ? AppState.files
    : AppState.files.filter(f => f.projectId === selectedProjectId);
}

function renderFileRows(files) {
  const list = files || getFilteredFiles();
  if (!list.length) return `<div class="text-center text-gray-400 py-8 text-sm">此資料夾沒有檔案</div>`;
  return list.map(f => {
    const ic = fileIconMap[f.icon] || fileIconMap.other;
    const proj = AppState.projects.find(p => p.id === f.projectId);
    return `
      <div class="grid items-center py-3 border-b border-gray-50 hover:bg-gray-50 rounded-lg px-2 transition-colors" style="grid-template-columns:1fr 100px 100px 80px">
        <div class="flex items-center gap-3">
          <div style="width:36px;height:36px;background:${ic.bg};border-radius:8px;display:flex;align-items:center;justify-content:center;color:${ic.color};font-size:10px;font-weight:700;flex-shrink:0">${ic.label}</div>
          <div>
            <div class="text-sm font-medium text-gray-800">${f.name}</div>
            <div class="text-xs text-gray-400">${proj ? proj.name : '—'}</div>
          </div>
        </div>
        <span class="text-sm text-gray-500">${f.size}</span>
        <span class="text-sm text-gray-500">${f.date}</span>
        <div class="flex gap-1">
          <button onclick="showToast('下載中...','info')" class="btn-icon" title="下載">${svgIcon('download', 14)}</button>
          <button onclick="deleteFile(${f.id})" class="btn-icon btn-icon-red" title="刪除">${svgIcon('trash', 14)}</button>
        </div>
      </div>`;
  }).join('');
}

function filterFileList(query) {
  const files = getFilteredFiles().filter(f => f.name.toLowerCase().includes(query.toLowerCase()));
  const el = document.getElementById('file-list');
  if (el) el.innerHTML = renderFileRows(files);
}

function deleteFile(id) {
  confirmModal('刪除檔案', '確定要刪除此檔案嗎？', () => {
    AppState.files = AppState.files.filter(f => f.id !== id);
    saveAppState();
    renderFiles();
    showToast('檔案已刪除', 'success');
  });
}

function openUploadModal() {
  const projects = AppState.projects;
  openModal(modalShell('上傳檔案',
    `<div class="flex flex-col gap-4">
      <div>
        <label class="form-label">選擇專案資料夾</label>
        <select id="upload-project" class="form-input form-select">
          ${projects.map(p => `<option value="${p.id}" ${selectedProjectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="form-label">選擇檔案</label>
        <div onclick="document.getElementById('upload-file-input').click()"
          class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          ${svgIcon('upload', 24)}
          <div class="text-sm text-gray-500 mt-2">點擊選擇檔案</div>
          <div class="text-xs text-gray-400 mt-1" id="upload-file-name">支援所有檔案格式</div>
        </div>
        <input type="file" id="upload-file-input" style="display:none" multiple
          onchange="document.getElementById('upload-file-name').textContent=Array.from(this.files).map(f=>f.name).join('、')" />
      </div>
    </div>`,
    `<button onclick="closeModal()" class="btn btn-secondary">取消</button>
     <button onclick="confirmUpload()" class="btn btn-primary">上傳</button>`
  ));
}

function confirmUpload() {
  const projectId = parseInt(document.getElementById('upload-project').value);
  const input = document.getElementById('upload-file-input');
  if (!input.files.length) { showToast('請選擇檔案', 'error'); return; }

  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`;
  const maxId = AppState.files.reduce((m, f) => Math.max(m, f.id), 0);

  Array.from(input.files).forEach((file, i) => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    AppState.files.push({
      id: maxId + i + 1,
      name: file.name,
      projectId,
      size: `${sizeMB} MB`,
      date: dateStr,
      icon: getFileIcon(file.name),
    });
  });

  closeModal();
  selectedProjectId = projectId;
  saveAppState();
  renderFiles();
  showToast(`已上傳 ${input.files.length} 個檔案`, 'success');
}
