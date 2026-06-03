// ============================================================
// UTILITIES
// ============================================================

// 依目前登入者過濾可見通知
// admin：看所有無 targetUserId 的通知 + targetUserId === admin.id 的通知
// 執行人員：只看 targetUserId === 自己 id 的通知
function getVisibleNotifications() {
  const u = AppState.currentUser;
  if (!u) return [];
  if (u.role === 'admin') {
    return AppState.notifications.filter(n => !n.targetUserId || n.targetUserId === u.id);
  }
  return AppState.notifications.filter(n => n.targetUserId === u.id);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 2800);
}

function avatarHtml(initials, size = 36, color = '#2563eb') {
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};color:white;display:flex;align-items:center;justify-content:center;font-size:${Math.round(size*0.35)}px;font-weight:700;flex-shrink:0;">${initials}</div>`;
}

const avatarColors = ['#2563eb','#7c3aed','#db2777','#059669','#d97706','#0891b2'];
function userAvatar(user, size = 36) {
  const color = avatarColors[user.id % avatarColors.length];
  return avatarHtml(user.avatar || user.name.slice(0,2), size, color);
}

function svgIcon(name, size = 18, cls = '') {
  const icons = {
    home: `<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    bell: `<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>`,
    user: `<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    folder: `<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>`,
    task: `<rect x="9" y="11" width="4" height="2" rx="1"/><rect x="9" y="7" width="4" height="2" rx="1"/><path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/>`,
    chart: `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,
    calendar: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
    users: `<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>`,
    file: `<path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>`,
    message: `<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>`,
    settings: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>`,
    logout: `<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
    menu: `<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>`,
    plus: `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
    edit: `<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>`,
    trash: `<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>`,
    search: `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
    check: `<polyline points="20 6 9 17 4 12"/>`,
    x: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
    arrow_left: `<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>`,
    arrow_right: `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
    clock: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
    info: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
    gantt: `<rect x="3" y="4" width="6" height="4" rx="1"/><rect x="10" y="9" width="8" height="4" rx="1"/><rect x="8" y="14" width="9" height="4" rx="1"/><line x1="3" y1="20" x2="21" y2="20"/>`,
    download: `<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
    upload: `<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>`,
    send: `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`,
    eye: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`,
    lock: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>`,
    mail: `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>`,
    key: `<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>`,
    check_circle: `<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
    activity: `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
    list: `<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>`,
    layout: `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>`,
    heart: `<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>`,
    alert: `<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
    flame: `<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/>`,
  };
  const paths = icons[name] || icons.info;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}" style="flex-shrink:0">${paths}</svg>`;
}

function donutChart(segments, total, centerLabel, centerSub, size = 140) {
  let offset = 0;
  const r = 50, cx = size/2, cy = size/2, stroke = 16;
  const circumference = 2 * Math.PI * r;
  let paths = '';
  segments.forEach(seg => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="${stroke}" stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset * circumference}" transform="rotate(-90 ${cx} ${cy})" style="transition:stroke-dasharray 0.5s"/>`;
    offset += pct;
  });
  return `<div class="donut-chart" style="width:${size}px;height:${size}px;">
    <svg width="${size}" height="${size}">${paths}</svg>
    <div class="donut-center">
      <span style="font-size:${size > 120 ? 24 : 18}px;font-weight:800;color:#1e293b;">${centerLabel}</span>
      ${centerSub ? `<span style="font-size:11px;color:#64748b;">${centerSub}</span>` : ''}
    </div>
  </div>`;
}

function barChart(data, maxVal, width = 280, height = 120) {
  const barW = Math.floor(width / data.length) - 8;
  const bars = data.map((d, i) => {
    const barH = Math.round((d.hours / maxVal) * (height - 30));
    const x = i * (barW + 8) + 4;
    const y = height - 30 - barH;
    return `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="3" fill="#3b82f6" opacity="0.85"/>
      <text x="${x + barW/2}" y="${height - 14}" text-anchor="middle" font-size="10" fill="#64748b">${d.name.slice(0,2)}</text>
      <text x="${x + barW/2}" y="${y - 4}" text-anchor="middle" font-size="10" fill="#374151" font-weight="600">${d.hours}</text>`;
  }).join('');
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
}

function lineChartSvg(points, width = 280, height = 100, color = '#3b82f6') {
  const uid = 'lg' + Math.random().toString(36).slice(2, 7);
  const padL = 10, padR = 10, padT = 12, padB = 20;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const maxY = Math.max(...points.map(p => p.y), 1);
  const minY = 0;
  const scaled = points.map((p, i) => ({
    x: padL + (i / (points.length - 1)) * chartW,
    y: padT + chartH - ((p.y - minY) / (maxY - minY)) * chartH,
  }));
  const baseline = padT + chartH;
  const linePath = scaled.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${scaled[scaled.length-1].x.toFixed(1)},${baseline} L${scaled[0].x.toFixed(1)},${baseline} Z`;
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="display:block">
    <defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.2"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    <path d="${areaPath}" fill="url(#${uid})"/>
    <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${scaled.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="white" stroke="${color}" stroke-width="2"/>`).join('')}
  </svg>`;
}

function progressBar(pct, colorClass = 'progress-blue', height = 6) {
  return `<div class="progress-bar" style="height:${height}px"><div class="progress-bar-fill ${colorClass}" style="width:${pct}%"></div></div>`;
}

function closeModal() {
  const mc = document.getElementById('modal-container');
  if (mc) mc.innerHTML = '';
}

function openModal(html) {
  const mc = document.getElementById('modal-container');
  mc.innerHTML = `<div class="modal-overlay" onclick="if(event.target===this)closeModal()">${html}</div>`;
}

function formatDate(d) { return d || '—'; }

// ============================================================
// UC31 — AI 風險預警（規則式）
// ============================================================

function getRiskTasks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return AppState.tasks.filter(t => {
    if (t.status === 'done' || t.status === 'paused') return false;
    const due = new Date(t.dueDate.replace(/\//g, '-'));
    if (isNaN(due.getTime())) return false;
    const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    const lowProgress = t.progress < 30;
    const nearDue = daysLeft <= 3;
    const overdue = daysLeft < 0;
    return overdue || (lowProgress && nearDue);
  }).map(t => {
    const due = new Date(t.dueDate.replace(/\//g, '-'));
    const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    const level = daysLeft < 0 ? 'high' : (daysLeft <= 1 ? 'high' : 'mid');
    const reason = daysLeft < 0
      ? `已逾期 ${Math.abs(daysLeft)} 天，進度 ${t.progress}%`
      : `距截止僅剩 ${daysLeft} 天，進度僅 ${t.progress}%`;
    return { ...t, riskLevel: level, riskReason: reason, daysLeft };
  });
}

// ============================================================
// STATE PERSISTENCE (localStorage)
// ============================================================

function saveAppState() {
  try {
    localStorage.setItem('appState', JSON.stringify({
      users:         AppState.users,
      projects:      AppState.projects,
      tasks:         AppState.tasks,
      notifications: AppState.notifications,
      notifVersion:  NOTIF_VERSION,
      members:       AppState.members,
      files:         AppState.files,
      discussions:   AppState.discussions,
    }));
  } catch(e) {}
}

const NOTIF_VERSION = 3;

function loadAppState() {
  try {
    const raw = localStorage.getItem('appState');
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s.users)         AppState.users         = s.users;
    if (s.projects)      AppState.projects      = s.projects;
    if (s.tasks)         AppState.tasks         = s.tasks;
    if (s.members)       AppState.members       = s.members;
    if (s.files)         AppState.files         = s.files;
    if (s.discussions)   AppState.discussions   = s.discussions;
    // Reset notifications if version mismatch
    if (s.notifications && s.notifVersion === NOTIF_VERSION) {
      AppState.notifications = s.notifications;
    }
  } catch(e) {}
}

function checkRiskAlerts() {
  const risks = getRiskTasks();
  const adminUser = AppState.users.find(u => u.role === 'admin');
  risks.forEach(t => {
    const existsAdmin = AppState.notifications.some(n => n.riskTaskId === t.id && (!n.targetUserId || n.targetUserId === adminUser?.id));
    const existsAssignee = AppState.notifications.some(n => n.riskTaskId === t.id && n.targetUserId === t.assignee);
    const assignee = AppState.getUser(t.assignee);
    const label = t.riskLevel === 'high' ? '🔴 高風險' : '🟡 中風險';

    if (!existsAdmin) {
      AppState.notifications.unshift({
        id: Date.now() + t.id,
        type: 'risk',
        icon: 'alert',
        title: `${label}任務警示（自動偵測）`,
        message: `任務「${t.name}」${t.riskReason}，負責人：${assignee ? assignee.name : '—'}`,
        time: '剛剛',
        read: false,
        riskTaskId: t.id,
        taskId: t.id,
        targetUserId: adminUser ? adminUser.id : null,
      });
    }

    if (!existsAssignee && assignee && assignee.role !== 'admin') {
      AppState.notifications.unshift({
        id: Date.now() + t.id + 500,
        type: 'risk',
        icon: 'alert',
        title: `${label}任務警示`,
        message: `您的任務「${t.name}」${t.riskReason}，請盡快更新進度或聯繫管理者。`,
        time: '剛剛',
        read: false,
        riskTaskId: t.id,
        taskId: t.id,
        targetUserId: t.assignee,
      });
    }
  });
  saveAppState();
}
