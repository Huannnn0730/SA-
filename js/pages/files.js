// ============================================================
// FILE MANAGEMENT PAGE
// ============================================================

let selectedFolder = '全部';

const folders = ['全部', '需求文件', '設計稿', '開發文件', '測試報告'];

function renderFiles() {
  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-bold text-gray-800 text-lg">檔案管理</h2>
          <button onclick="showToast('請選擇要上傳的檔案','info')" class="btn btn-primary">${svgIcon('upload', 16)} 上傳檔案</button>
        </div>

        <div class="flex gap-6">
          <!-- Folder list -->
          <div style="width:200px;flex-shrink:0">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">資料夾</div>
            ${folders.map(f => `
              <div onclick="selectedFolder='${f}';renderFileList()" class="file-item ${selectedFolder===f ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}">
                ${svgIcon('folder', 18)}
                <span class="text-sm font-medium">${f}</span>
                <span class="ml-auto text-xs text-gray-400">${f === '全部' ? AppState.files.length : AppState.files.filter(fi => fi.folder === f).length}</span>
              </div>`).join('')}
          </div>

          <!-- File list -->
          <div class="flex-1">
            <div class="flex items-center justify-between mb-3">
              <div class="text-sm font-semibold text-gray-600">${selectedFolder}</div>
              <div class="search-input-wrap">
                ${svgIcon('search', 14, 'search-icon')}
                <input class="form-input" style="padding-left:32px;height:34px;font-size:13px;width:180px" placeholder="搜尋檔案..." />
              </div>
            </div>

            <!-- Table header -->
            <div class="grid text-xs font-semibold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100 mb-2" style="grid-template-columns:1fr 80px 100px 80px">
              <span>名稱</span><span>大小</span><span>上傳日期</span><span></span>
            </div>

            <div id="file-list">
              ${renderFileRows()}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function getFilteredFiles() {
  return selectedFolder === '全部' ? AppState.files : AppState.files.filter(f => f.folder === selectedFolder);
}

const fileIconMap = {
  pdf: { bg: '#fee2e2', color: '#b91c1c', label: 'PDF' },
  xlsx: { bg: '#dcfce7', color: '#15803d', label: 'XLS' },
  zip: { bg: '#fef9c3', color: '#a16207', label: 'ZIP' },
  image: { bg: '#ede9fe', color: '#7c3aed', label: 'IMG' },
  drawio: { bg: '#dbeafe', color: '#1d4ed8', label: 'DIO' },
};

function renderFileRows() {
  const files = getFilteredFiles();
  if (!files.length) return `<div class="text-center text-gray-400 py-8 text-sm">此資料夾沒有檔案</div>`;
  return files.map(f => {
    const ic = fileIconMap[f.icon] || fileIconMap.pdf;
    return `
      <div class="grid items-center py-3 border-b border-gray-50 hover:bg-gray-50 rounded-lg px-2 transition-colors" style="grid-template-columns:1fr 80px 100px 80px">
        <div class="flex items-center gap-3">
          <div style="width:36px;height:36px;background:${ic.bg};border-radius:8px;display:flex;align-items:center;justify-content:center;color:${ic.color};font-size:10px;font-weight:700;flex-shrink:0">${ic.label}</div>
          <div>
            <div class="text-sm font-medium text-gray-800">${f.name}</div>
            <div class="text-xs text-gray-400">${f.folder}</div>
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

function renderFileList() {
  // Re-render folder list to update active state + file list
  renderFiles();
}

function deleteFile(id) {
  confirmModal('刪除檔案', '確定要刪除此檔案嗎？', () => {
    AppState.files = AppState.files.filter(f => f.id !== id);
    renderFiles();
    showToast('檔案已刪除', 'success');
  });
}
