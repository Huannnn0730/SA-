// ============================================================
// NOTIFICATION CENTER
// ============================================================

function renderNotifications() {
  const notifs = AppState.notifications;
  const unread = notifs.filter(n => !n.read).length;

  const iconMap = { bell: 'bell', clock: 'clock', info: 'info', settings: 'settings' };
  const colorMap = { task: '#3b82f6', reminder: '#f97316', general: '#8b5cf6', system: '#64748b' };
  const bgMap = { task: '#dbeafe', reminder: '#ffedd5', general: '#ede9fe', system: '#f1f5f9' };

  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <h2 class="font-bold text-gray-800 text-lg">通知中心</h2>
            ${unread > 0 ? `<span class="badge badge-red">${unread} 則未讀</span>` : '<span class="badge badge-green">全部已讀</span>'}
          </div>
          <div class="flex gap-2">
            <button onclick="markAllRead()" class="btn btn-secondary btn-sm">全部已讀</button>
          </div>
        </div>

        <!-- Filter tabs -->
        <div class="flex gap-1 border-b border-gray-200 mb-4">
          ${['全部', '任務', '提醒', '一般', '系統'].map((t, i) => `
            <button class="tab-btn ${i === 0 ? 'active' : ''}" onclick="filterNotifs(this, '${['all','task','reminder','general','system'][i]}')">${t}</button>`).join('')}
        </div>

        <!-- Notifications list -->
        <div id="notif-list">
          ${notifs.map(n => `
            <div class="notif-item" id="notif-${n.id}" onclick="readNotif(${n.id})">
              <div style="width:40px;height:40px;border-radius:50%;background:${bgMap[n.type]};color:${colorMap[n.type]};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                ${svgIcon(iconMap[n.icon] || 'bell', 18)}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <span class="text-sm font-semibold text-gray-800">${n.title}</span>
                  <span class="text-xs text-gray-400 flex-shrink-0">${n.time}</span>
                </div>
                <p class="text-sm text-gray-500 mt-1 leading-relaxed">${n.message}</p>
              </div>
              <div class="notif-dot ${n.read ? 'read' : ''}"></div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

function markAllRead() {
  AppState.notifications.forEach(n => n.read = true);
  renderNotifications();
  updateNotifBadge();
  updateSidebarActive();
  renderHeader();
  showToast('已全部標為已讀', 'success');
}

function readNotif(id) {
  const n = AppState.notifications.find(n => n.id === id);
  if (!n) return;
  n.read = true;
  updateNotifBadge();
  renderHeader();

  if (n.taskId) {
    AppState.currentTaskId = n.taskId;
    navigateTo('task-detail');
  } else if (n.projectId) {
    navigateTo('projects');
  } else {
    renderNotifications();
  }
}

function filterNotifs(btn, type) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const list = document.getElementById('notif-list');
  if (!list) return;
  list.querySelectorAll('.notif-item').forEach(item => {
    const id = parseInt(item.id.replace('notif-', ''));
    const n = AppState.notifications.find(n => n.id === id);
    item.style.display = (type === 'all' || n.type === type) ? 'flex' : 'none';
  });
}
