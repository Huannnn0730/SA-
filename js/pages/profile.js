// ============================================================
// PERSONAL PROFILE PAGE
// ============================================================

let profileTab = 'basic';

function renderProfile() {
  const u = AppState.currentUser;
  const colors = ['#2563eb','#7c3aed','#db2777','#059669','#d97706','#0891b2'];
  const color = colors[u.id % colors.length];

  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="card">
        <!-- Profile header -->
        <div class="flex items-center gap-6 mb-8 pb-6 border-b border-gray-100">
          <div style="width:80px;height:80px;border-radius:50%;background:${color};color:white;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;flex-shrink:0">${u.avatar || u.name.slice(0,2)}</div>
          <div>
            <h2 class="text-2xl font-bold text-gray-800">${u.name}</h2>
            <p class="text-gray-500 mt-1">${u.title || '—'}</p>
            <span class="badge ${u.role === 'admin' ? 'badge-blue' : 'badge-green'} mt-2">${AppState.roleLabel(u.role)}</span>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-gray-200 mb-6">
          <button class="tab-btn ${profileTab==='basic'?'active':''}" onclick="switchProfileTab('basic')">基本資料</button>
          <button class="tab-btn ${profileTab==='pwd'?'active':''}" onclick="switchProfileTab('pwd')">修改密碼</button>
          <button class="tab-btn ${profileTab==='notif'?'active':''}" onclick="switchProfileTab('notif')">通知設定</button>
        </div>

        <div id="profile-tab-content">
          ${renderProfileTabContent(u)}
        </div>
      </div>
    </div>`;
}

function switchProfileTab(tab) {
  profileTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => { if (b.textContent.includes({'basic':'基本','pwd':'密碼','notif':'通知'}[tab])) b.classList.add('active'); });
  document.getElementById('profile-tab-content').innerHTML = renderProfileTabContent(AppState.currentUser);
}

function renderProfileTabContent(u) {
  if (profileTab === 'basic') {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <div>
          <label class="form-label">姓名</label>
          <input id="prof-name" type="text" class="form-input" value="${u.name}" />
        </div>
        <div>
          <label class="form-label">Email</label>
          <input id="prof-email" type="email" class="form-input" value="${u.email}" />
        </div>
        <div>
          <label class="form-label">職稱</label>
          <input id="prof-title" type="text" class="form-input" value="${u.title || ''}" placeholder="請輸入職稱" />
        </div>
        <div>
          <label class="form-label">聯絡電話</label>
          <input id="prof-phone" type="text" class="form-input" value="${u.phone || ''}" placeholder="請輸入電話" />
        </div>
        <div class="md:col-span-2 flex justify-end">
          <button onclick="saveProfile()" class="btn btn-primary">儲存變更</button>
        </div>
      </div>`;
  }

  if (profileTab === 'pwd') {
    return `
      <div class="flex flex-col gap-4 max-w-md">
        <div>
          <label class="form-label">目前密碼</label>
          <input id="pwd-current" type="password" class="form-input" placeholder="請輸入目前密碼" />
        </div>
        <div>
          <label class="form-label">新密碼</label>
          <input id="pwd-new" type="password" class="form-input" placeholder="請輸入新密碼（至少6碼）" />
        </div>
        <div>
          <label class="form-label">確認新密碼</label>
          <input id="pwd-confirm" type="password" class="form-input" placeholder="請再次輸入新密碼" />
        </div>
        <div class="flex justify-end">
          <button onclick="changePassword()" class="btn btn-primary">更新密碼</button>
        </div>
      </div>`;
  }

  if (profileTab === 'notif') {
    return `
      <div class="flex flex-col gap-4 max-w-lg">
        ${[
          ['task_assigned', '任務指派通知', '當有新任務指派給您時通知'],
          ['task_due', '任務截止提醒', '任務截止前一天發送提醒'],
          ['task_update', '任務更新通知', '任務狀態或進度更新時通知'],
          ['project_update', '專案更新通知', '所屬專案有更新時通知'],
          ['system', '系統公告', '接收系統維護與公告通知'],
        ].map(([key, label, desc]) => `
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div class="font-medium text-gray-800 text-sm">${label}</div>
              <div class="text-xs text-gray-400 mt-0.5">${desc}</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" id="notif-${key}" checked />
              <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>`).join('')}
        <div class="flex justify-end">
          <button onclick="showToast('通知設定已儲存','success')" class="btn btn-primary">儲存設定</button>
        </div>
      </div>`;
  }
  return '';
}

function saveProfile() {
  const u = AppState.currentUser;
  u.name = document.getElementById('prof-name').value.trim() || u.name;
  u.email = document.getElementById('prof-email').value.trim() || u.email;
  u.title = document.getElementById('prof-title').value.trim();
  u.phone = document.getElementById('prof-phone').value.trim();
  u.avatar = u.name.slice(0, 2);
  renderSidebar();
  renderHeader();
  renderProfile();
  showToast('個人資料已更新', 'success');
}

function changePassword() {
  const current = document.getElementById('pwd-current').value;
  const newPwd = document.getElementById('pwd-new').value;
  const confirm = document.getElementById('pwd-confirm').value;
  const u = AppState.currentUser;
  if (current !== u.password) { showToast('目前密碼不正確', 'error'); return; }
  if (newPwd.length < 6) { showToast('新密碼至少需要6個字元', 'error'); return; }
  if (newPwd !== confirm) { showToast('兩次密碼不符', 'error'); return; }
  u.password = newPwd;
  showToast('密碼更新成功', 'success');
  document.getElementById('pwd-current').value = '';
  document.getElementById('pwd-new').value = '';
  document.getElementById('pwd-confirm').value = '';
}
