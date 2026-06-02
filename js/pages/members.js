// ============================================================
// MEMBER MANAGEMENT PAGE (Admin)
// ============================================================

function renderMembers() {
  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-bold text-gray-800 text-lg">成員管理</h2>
          <button onclick="openAddMemberModal()" class="btn btn-primary">${svgIcon('plus', 16)} 新增成員</button>
        </div>

        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr>
              <th>姓名</th><th>職稱</th><th>角色</th><th>進行中任務數</th><th>操作</th>
            </tr></thead>
            <tbody id="members-tbody">${renderMemberRows()}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

function renderMemberRows() {
  return AppState.members.map(m => {
    const user = AppState.getUser(m.id);
    const colors = ['#2563eb','#7c3aed','#db2777','#059669','#d97706','#0891b2'];
    const color = colors[m.id % colors.length];
    return `<tr>
      <td>
        <div class="flex items-center gap-3">
          <div style="width:36px;height:36px;border-radius:50%;background:${color};color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700">${user ? user.avatar : m.name.slice(0,2)}</div>
          <span class="font-medium">${m.name}</span>
        </div>
      </td>
      <td class="text-gray-500">${m.title}</td>
      <td><span class="badge ${m.role === 'admin' ? 'badge-blue' : 'badge-green'}">${AppState.roleLabel(m.role)}</span></td>
      <td>
        <div class="flex items-center gap-2">
          <span class="font-semibold text-blue-600">${m.activeTasks}</span>
          <span class="text-gray-400 text-sm">個任務</span>
        </div>
      </td>
      <td>
        <div class="flex gap-1">
          <button onclick="openEditMemberModal(${m.id})" class="btn-icon" title="編輯">${svgIcon('edit', 16)}</button>
          <button onclick="deleteMember(${m.id})" class="btn-icon btn-icon-red" title="刪除">${svgIcon('trash', 16)}</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function openAddMemberModal() {
  openModal(modalShell('新增成員',
    `<div class="flex flex-col gap-4">
      <div class="grid grid-cols-2 gap-3">
        <div><label class="form-label">姓名</label><input id="mb-name" class="form-input" placeholder="請輸入姓名" /></div>
        <div><label class="form-label">職稱</label><input id="mb-title" class="form-input" placeholder="請輸入職稱" /></div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="form-label">Email</label><input id="mb-email" type="email" class="form-input" placeholder="請輸入 Email" /></div>
        <div>
          <label class="form-label">角色</label>
          <select id="mb-role" class="form-input form-select">
            <option value="executor">執行人員</option><option value="admin">管理者</option>
          </select>
        </div>
      </div>
      <div><label class="form-label">初始密碼</label><input id="mb-password" type="password" class="form-input" placeholder="請設定初始密碼" /></div>
    </div>`,
    `<button onclick="closeModal()" class="btn btn-secondary">取消</button>
     <button onclick="addMember()" class="btn btn-primary">新增</button>`
  ));
}

function addMember() {
  const name = document.getElementById('mb-name').value.trim();
  const title = document.getElementById('mb-title').value.trim();
  const email = document.getElementById('mb-email').value.trim();
  const role = document.getElementById('mb-role').value;
  const password = document.getElementById('mb-password').value;
  if (!name || !email || !password) { showToast('請填寫所有必填欄位', 'error'); return; }
  if (AppState.users.find(u => u.email === email)) { showToast('此 Email 已存在', 'error'); return; }
  const id = AppState.users.length + 1;
  AppState.users.push({ id, name, email, password, role, title, phone: '', avatar: name.slice(0,2) });
  AppState.members.push({ id, name, title, role, activeTasks: 0 });
  closeModal();
  document.getElementById('members-tbody').innerHTML = renderMemberRows();
  saveAppState();
  showToast('成員已新增', 'success');
}

function openEditMemberModal(id) {
  const m = AppState.members.find(m => m.id === id);
  if (!m) return;
  openModal(modalShell('編輯成員',
    `<div class="flex flex-col gap-4">
      <div class="grid grid-cols-2 gap-3">
        <div><label class="form-label">姓名</label><input id="emb-name" class="form-input" value="${m.name}" /></div>
        <div><label class="form-label">職稱</label><input id="emb-title" class="form-input" value="${m.title}" /></div>
      </div>
      <div>
        <label class="form-label">角色</label>
        <select id="emb-role" class="form-input form-select">
          <option value="executor" ${m.role==='executor'?'selected':''}>執行人員</option>
          <option value="admin" ${m.role==='admin'?'selected':''}>管理者</option>
        </select>
      </div>
    </div>`,
    `<button onclick="closeModal()" class="btn btn-secondary">取消</button>
     <button onclick="saveMember(${id})" class="btn btn-primary">儲存</button>`
  ));
}

function saveMember(id) {
  const m = AppState.members.find(m => m.id === id);
  const u = AppState.getUser(id);
  if (!m) return;
  m.name = document.getElementById('emb-name').value.trim() || m.name;
  m.title = document.getElementById('emb-title').value.trim() || m.title;
  m.role = document.getElementById('emb-role').value;
  if (u) { u.name = m.name; u.title = m.title; u.role = m.role; }
  closeModal();
  document.getElementById('members-tbody').innerHTML = renderMemberRows();
  saveAppState();
  showToast('成員已更新', 'success');
}

function deleteMember(id) {
  if (id === AppState.currentUser?.id) { showToast('無法刪除目前登入的帳號', 'error'); return; }
  confirmModal('刪除成員', '確定要刪除此成員嗎？', () => {
    AppState.members = AppState.members.filter(m => m.id !== id);
    AppState.users = AppState.users.filter(u => u.id !== id);
    document.getElementById('members-tbody').innerHTML = renderMemberRows();
    saveAppState();
    showToast('成員已刪除', 'success');
  });
}
