// ============================================================
// APP STATE — Global Store
// ============================================================
const AppState = {
  currentUser: null,
  currentPage: 'login',
  currentTaskId: null,
  sidebarCollapsed: false,

  users: [
    { id: 1, name: '專案經理A', email: 'wang@example.com',  password: '123456', role: 'admin',    title: '專案經理',  phone: '0912-345-678', avatar: 'PM' },
    { id: 2, name: '設計師A',   email: 'li@example.com',    password: '123456', role: 'executor', title: '設計師',    phone: '0987-654-321', avatar: 'DS' },
    { id: 3, name: '前端工程師A', email: 'guo@example.com', password: '123456', role: 'executor', title: '前端工程師', phone: '0922-111-222', avatar: 'FE' },
    { id: 4, name: '後端工程師A', email: 'chen@example.com',password: '123456', role: 'executor', title: '後端工程師', phone: '0933-444-555', avatar: 'BE' },
    { id: 5, name: '測試工程師A', email: 'zhang@example.com',password: '123456', role: 'executor', title: '測試工程師', phone: '0944-666-777', avatar: 'QA' },
  ],

  projects: [
    { id: 1, name: '管理後台系統',   status: 'active',  startDate: '2026/05/01', endDate: '2026/07/31', progress: 40 },
    { id: 2, name: '行銷活動專案',   status: 'active',  startDate: '2026/05/10', endDate: '2026/06/30', progress: 65 },
    { id: 3, name: 'APP 開發專案',   status: 'pending', startDate: '2026/06/01', endDate: '2026/08/31', progress: 0  },
  ],

  // 7 tasks covering all demo features:
  // 依賴鏈: 2→1, 4→[2,3], 6→5
  // 狀態: done×2, active×3, paused×1, pending×1 (kanban 4欄全涵蓋)
  // 風險: task3 截止近且進度低 (高風險示範)
  // 心情: task2(😟 壓力), task5(😊 順利), task6(🔥 全力衝刺)
  tasks: [
    { id: 1, projectId: 1, name: '系統架構規劃',  assignee: 4, priority: 'high', startDate: '2026/05/01', dueDate: '2026/05/20', status: 'done',   progress: 100, desc: '規劃整體系統架構，包含資料庫設計、API 設計與部署方案。',                           comments: [], attachments: ['架構圖.png'], dependencies: [],    mood: '😊' },
    { id: 2, projectId: 1, name: '前端介面開發',  assignee: 3, priority: 'high', startDate: '2026/05/20', dueDate: '2026/06/20', status: 'active', progress: 45,  desc: '根據設計稿實作前端介面，使用 React + TypeScript 技術棧，串接後端 API。',           comments: [], attachments: [],           dependencies: [1],   mood: '😟' },
    { id: 3, projectId: 1, name: '後端 API 開發', assignee: 4, priority: 'high', startDate: '2026/05/20', dueDate: '2026/06/04', status: 'active', progress: 20,  desc: '開發 RESTful API，包含用戶管理、專案管理、任務管理等核心模組。',                     comments: [], attachments: [],           dependencies: [],    mood: null },
    { id: 4, projectId: 1, name: '整合測試',      assignee: 5, priority: 'mid',  startDate: '2026/06/25', dueDate: '2026/07/15', status: 'pending',progress: 0,   desc: '前後端整合完成後，執行功能測試、壓力測試與安全性測試，並修復問題。',               comments: [], attachments: [],           dependencies: [2,3], mood: null },
    { id: 5, projectId: 2, name: '行銷素材製作',  assignee: 2, priority: 'mid',  startDate: '2026/05/10', dueDate: '2026/05/28', status: 'done',   progress: 100, desc: '製作社群媒體廣告素材、EDM 模板與活動頁面視覺設計。',                                 comments: [], attachments: ['素材包.zip'], dependencies: [],   mood: '😊' },
    { id: 6, projectId: 2, name: '活動頁面開發',  assignee: 3, priority: 'high', startDate: '2026/05/28', dueDate: '2026/06/25', status: 'paused', progress: 35,  desc: '開發活動登陸頁面，串接報名系統與 Google Analytics，目前因設計調整暫停。',           comments: [], attachments: [],           dependencies: [5],   mood: '🔥' },
    { id: 7, projectId: 3, name: 'APP 需求分析',  assignee: 3, priority: 'mid',  startDate: '2026/06/05', dueDate: '2026/06/30', status: 'active', progress: 10,  desc: '收集並分析 APP 功能需求，訪談利害關係人，產出完整需求規格書。',                     comments: [], attachments: [],           dependencies: [],    mood: null },
  ],

  notifications: [
    { id: 1, type: 'task',     icon: 'bell',     title: '任務指派',     message: '新任務「後端 API 開發」已指派給您，截止日期 2026/06/07',    time: '10分鐘前', read: false, taskId: 3 },
    { id: 2, type: 'reminder', icon: 'clock',    title: '任務截止提醒', message: '「後端 API 開發」距截止剩 5 天，目前進度僅 20%，請加緊！', time: '1小時前',  read: false, taskId: 3 },
    { id: 3, type: 'general',  icon: 'info',     title: '進度更新',     message: '前端工程師A 已將「前端介面開發」進度更新至 45%',           time: '3小時前',  read: false, taskId: 2 },
    { id: 5, type: 'reminder', icon: 'clock',    title: '專案截止提醒', message: '專案「行銷活動專案」將於 2026/06/30 截止',                  time: '3天前',    read: true,  projectId: 2 },
  ],

  members: [
    { id: 1, name: '專案經理A',  title: '專案經理',   role: 'admin'    },
    { id: 2, name: '設計師A',    title: '設計師',     role: 'executor' },
    { id: 3, name: '前端工程師A', title: '前端工程師', role: 'executor' },
    { id: 4, name: '後端工程師A', title: '後端工程師', role: 'executor' },
    { id: 5, name: '測試工程師A', title: '測試工程師', role: 'executor' },
  ],

  files: [
    { id: 1, name: '需求流程.drawio', folder: '需求文件', size: '2.1 MB', date: '2026/05/20', icon: 'drawio' },
    { id: 2, name: 'API 文件.pdf',    folder: '開發文件', size: '1.3 MB', date: '2026/05/18', icon: 'pdf' },
    { id: 3, name: '測試報告.xlsx',   folder: '測試報告', size: '0.9 MB', date: '2026/05/15', icon: 'xlsx' },
    { id: 4, name: 'UI設計稿.zip',    folder: '設計稿',   size: '8.4 MB', date: '2026/05/12', icon: 'zip' },
    { id: 5, name: '系統架構圖.png',  folder: '需求文件', size: '0.5 MB', date: '2026/05/10', icon: 'image' },
  ],

  discussions: [
    { id: 1, taskId: 1, user: 1, message: '需求文件已上傳到 Google Drive，請大家確認', time: '2026/05/10 10:30', read: false },
    { id: 2, taskId: 1, user: 2, message: '已看過，有幾個地方需要補充說明，我會另外標注', time: '2026/05/10 11:05', read: false },
    { id: 3, taskId: 1, user: 3, message: '已看完，沒有問題', time: '2026/05/10 11:10', read: false },
    { id: 4, taskId: 2, user: 2, message: '請成員確認新的設計稿是否符合需求', time: '2026/05/12 09:30', read: false },
    { id: 5, taskId: 2, user: 1, message: '已確認，很好！請繼續', time: '2026/05/12 10:00', read: true },
  ],

  // Derived helpers
  getProject(id) { return this.projects.find(p => p.id === id); },
  getUser(id) { return this.users.find(u => u.id === id); },
  getTasksByUser(userId) { return this.tasks.filter(t => t.assignee === userId); },
  getTasksByProject(projectId) { return this.tasks.filter(t => t.projectId === projectId); },
  getDiscussionsByTask(taskId) { return this.discussions.filter(d => d.taskId === taskId); },
  getProjectProgress(projectId) {
    const ts = this.tasks.filter(t => t.projectId === projectId);
    if (!ts.length) return 0;
    return Math.round(ts.filter(t => t.status === 'done').length / ts.length * 100);
  },

  // Computed: calendar events from task due dates (getter alias for backward compat)
  get calendarEvents() { return this.getCalendarEvents(); },
  getCalendarEvents() {
    const events = {};
    this.tasks.forEach(t => {
      if (!t.dueDate || t.dueDate === '—') return;
      const key = t.dueDate.replace(/\//g, '-');
      if (!events[key]) events[key] = [];
      events[key].push(t.name);
    });
    return events;
  },

  // Computed: report data from real task/project state
  getReportData() {
    const today = new Date(); today.setHours(0,0,0,0);
    const parseDate = s => { const d = new Date(s.replace(/\//g, '-')); d.setHours(0,0,0,0); return d; };

    const total = this.tasks.length;
    const done = this.tasks.filter(t => t.status === 'done').length;
    const active = this.tasks.filter(t => t.status === 'active').length;
    const pending = this.tasks.filter(t => t.status === 'pending').length;
    const paused = this.tasks.filter(t => t.status === 'paused').length;
    const overdue = this.tasks.filter(t => {
      if (t.status === 'done') return false;
      if (!t.dueDate || t.dueDate === '—') return false;
      return parseDate(t.dueDate) < today;
    }).length;

    const completionRate = total > 0 ? Math.round(done / total * 100) : 0;

    const taskData = this.members.map(m => ({
      name: m.name,
      value: this.tasks.filter(t => t.assignee === m.id && t.status !== 'done').length,
    }));

    return {
      completionRate,
      overdueTasks: overdue,
      taskDist: [
        { label: '已完成', value: done,    color: '#22c55e' },
        { label: '進行中', value: active,  color: '#3b82f6' },
        { label: '未開始', value: pending, color: '#94a3b8' },
        { label: '逾期',   value: overdue, color: '#ef4444' },
      ],
      taskData,
    };
  },

  statusLabel(s) {
    return { active: '進行中', done: '已完成', paused: '暫停中', pending: '未開始', overdue: '逾期' }[s] || s;
  },
  statusBadge(s) {
    return { active: 'badge-blue', done: 'badge-green', paused: 'badge-yellow', pending: 'badge-gray', overdue: 'badge-red' }[s] || 'badge-gray';
  },
  priorityLabel(p) { return { high: '高', mid: '中', low: '低' }[p] || p; },
  priorityBadge(p) { return { high: 'badge-red', mid: 'badge-orange', low: 'badge-green' }[p] || 'badge-gray'; },
  roleLabel(r) { return { admin: '管理者', executor: '執行人員' }[r] || r; },
};
