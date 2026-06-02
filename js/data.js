// ============================================================
// MOCK DATA — Global Store
// ============================================================
const AppState = {
  currentUser: null,
  currentPage: 'login',
  currentTaskId: null,
  sidebarCollapsed: false,

  users: [
    { id: 1, name: '王小明', email: 'wang@example.com', password: '123456', role: 'admin',  title: '專案經理', phone: '0912-345-678', avatar: 'WM' },
    { id: 2, name: '李小美', email: 'li@example.com',   password: '123456', role: 'executor', title: '設計師',   phone: '0987-654-321', avatar: 'LM' },
    { id: 3, name: '國小強', email: 'guo@example.com',  password: '123456', role: 'executor', title: '前端工程師', phone: '0922-111-222', avatar: 'GQ' },
    { id: 4, name: '陳大文', email: 'chen@example.com', password: '123456', role: 'executor', title: '後端工程師', phone: '0933-444-555', avatar: 'CW' },
    { id: 5, name: '張小紅', email: 'zhang@example.com',password: '123456', role: 'executor', title: '測試工程師', phone: '0944-666-777', avatar: 'ZR' },
  ],

  projects: [
    { id: 1, name: '管理後台優先專案', status: 'active',   startDate: '2024/05/01', endDate: '2024/07/31', progress: 60 },
    { id: 2, name: '行銷活動專案',     status: 'active',   startDate: '2024/05/10', endDate: '2024/06/30', progress: 45 },
    { id: 3, name: '內部系統開發',     status: 'done',     startDate: '2024/03/01', endDate: '2024/05/15', progress: 100 },
    { id: 4, name: '品牌設計計劃',     status: 'paused',   startDate: '2024/04/01', endDate: '2024/05/31', progress: 30 },
    { id: 5, name: 'APP 開發專案',     status: 'pending',  startDate: '2024/06/01', endDate: '2024/09/30', progress: 0  },
  ],

  tasks: [
    { id: 1,  projectId: 1, name: '需求文件撰寫',   assignee: 1, priority: 'high', dueDate: '2026/06/03', status: 'active',  progress: 20,  desc: '撰寫會員系統的完整需求規格書，包含功能需求、非功能需求與介面設計規範。', comments: [], attachments: ['需求文件.pdf'], dependencies: [], mood: null },
    { id: 2,  projectId: 1, name: '設計稿確認',     assignee: 2, priority: 'high', dueDate: '2026/06/04', status: 'active',  progress: 15,  desc: '確認所有頁面的設計稿，包含桌面版與手機版，並提交給開發團隊。', comments: [], attachments: ['設計稿.zip'], dependencies: [1], mood: '😟' },
    { id: 3,  projectId: 1, name: '前端開發',       assignee: 3, priority: 'mid',  dueDate: '2026/06/10', status: 'active',  progress: 45,  desc: '根據設計稿實作前端介面，使用 React + TypeScript 技術棧。', comments: [], attachments: [], dependencies: [2], mood: '🔥' },
    { id: 4,  projectId: 1, name: '後端 API 開發',  assignee: 4, priority: 'high', dueDate: '2026/06/15', status: 'active',  progress: 40,  desc: '開發 RESTful API，包含用戶管理、專案管理、任務管理等模組。', comments: [], attachments: [], dependencies: [], mood: '😊' },
    { id: 5,  projectId: 1, name: '測試與修正',     assignee: 5, priority: 'mid',  dueDate: '2026/07/20', status: 'pending', progress: 0,   desc: '執行功能測試、壓力測試與安全性測試，並修復發現的問題。', comments: [], attachments: [], dependencies: [3, 4], mood: null },
    { id: 6,  projectId: 2, name: '行銷素材製作',   assignee: 2, priority: 'mid',  dueDate: '2026/05/25', status: 'done',    progress: 100, desc: '製作社群媒體廣告素材、EDM 模板與活動頁面設計。', comments: [], attachments: [], dependencies: [], mood: '😊' },
    { id: 7,  projectId: 2, name: '活動頁面開發',   assignee: 3, priority: 'high', dueDate: '2026/06/05', status: 'active',  progress: 55,  desc: '開發活動登陸頁面，串接報名系統與 Google Analytics。', comments: [], attachments: [], dependencies: [6], mood: null },
    { id: 8,  projectId: 3, name: '系統架構規劃',   assignee: 1, priority: 'high', dueDate: '2026/03/20', status: 'done',    progress: 100, desc: '規劃整體系統架構，包含資料庫設計、API 設計與部署方案。', comments: [], attachments: [], dependencies: [], mood: null },
    { id: 9,  projectId: 4, name: '品牌識別設計',   assignee: 2, priority: 'low',  dueDate: '2026/05/10', status: 'paused',  progress: 30,  desc: '設計新品牌識別系統，包含 Logo、色彩規範與字體使用準則。', comments: [], attachments: [], dependencies: [], mood: null },
    { id: 10, projectId: 5, name: 'APP 需求分析',   assignee: 1, priority: 'mid',  dueDate: '2026/06/15', status: 'pending', progress: 0,   desc: '收集並分析 APP 功能需求，產出需求規格書。', comments: [], attachments: [], dependencies: [], mood: null },
  ],

  notifications: [
    { id: 1, type: 'task', icon: 'bell', title: '任務指派', message: '您有一個新任務「會員系統開發」已指派給您，截止日期 2024/06/10', time: '10分鐘前', read: false },
    { id: 2, type: 'reminder', icon: 'clock', title: '任務截止提醒', message: '任務「API 整合」已於期限至 2024/06/10，請盡快完成', time: '1小時前', read: false },
    { id: 3, type: 'general', icon: 'info', title: '普通通知', message: '王小紅 已將任務「設計稿確認」的進度更新為 70%', time: '3小時前', read: false },
    { id: 4, type: 'system', icon: 'settings', title: '系統公告', message: '系統將於 6/15 02:00～04:00 進行維護，請提前儲存工作', time: '2天前', read: true },
    { id: 5, type: 'task', icon: 'bell', title: '任務更新', message: '前端開發任務進度已更新至 45%', time: '3天前', read: true },
    { id: 6, type: 'reminder', icon: 'clock', title: '專案截止提醒', message: '專案「行銷活動專案」將於 2024/06/30 截止', time: '5天前', read: true },
  ],

  members: [
    { id: 1, name: '王小明', title: '專案經理',  role: 'admin',    activeTasks: 3 },
    { id: 2, name: '李小美', title: '設計師',    role: 'executor', activeTasks: 4 },
    { id: 3, name: '國小強', title: '前端工程師', role: 'executor', activeTasks: 5 },
    { id: 4, name: '陳大文', title: '後端工程師', role: 'executor', activeTasks: 3 },
    { id: 5, name: '張小紅', title: '測試工程師', role: 'executor', activeTasks: 2 },
  ],

  files: [
    { id: 1, name: '需求流程.drawio', folder: '需求文件', size: '2.1 MB', date: '2024/05/20', icon: 'drawio' },
    { id: 2, name: 'API 文件.pdf',    folder: '開發文件', size: '1.3 MB', date: '2024/05/18', icon: 'pdf' },
    { id: 3, name: '測試報告.xlsx',   folder: '測試報告', size: '0.9 MB', date: '2024/05/15', icon: 'xlsx' },
    { id: 4, name: 'UI設計稿.zip',    folder: '設計稿',   size: '8.4 MB', date: '2024/05/12', icon: 'zip' },
    { id: 5, name: '系統架構圖.png',  folder: '需求文件', size: '0.5 MB', date: '2024/05/10', icon: 'image' },
  ],

  discussions: [
    { id: 1, taskId: 1, user: 1, message: '需求文件已上傳到 Google Drive，請大家確認', time: '2024/05/10 10:30', read: false },
    { id: 2, taskId: 1, user: 2, message: '已看過，有幾個地方需要補充說明，我會另外標注', time: '2024/05/10 11:05', read: false },
    { id: 3, taskId: 1, user: 3, message: '已看完，沒有問題', time: '2024/05/10 11:10', read: false },
    { id: 4, taskId: 2, user: 2, message: '請成員確認新的設計稿是否符合需求（Google → Facebook）', time: '2024/05/12 09:30', read: false },
    { id: 5, taskId: 2, user: 1, message: '已確認，很好！請繼續', time: '2024/05/12 10:00', read: true },
  ],

  // Derived helpers
  getProject(id) { return this.projects.find(p => p.id === id); },
  getUser(id) { return this.users.find(u => u.id === id); },
  getTasksByUser(userId) { return this.tasks.filter(t => t.assignee === userId); },
  getTasksByProject(projectId) { return this.tasks.filter(t => t.projectId === projectId); },
  getDiscussionsByTask(taskId) { return this.discussions.filter(d => d.taskId === taskId); },

  statusLabel(s) {
    return { active: '進行中', done: '已完成', paused: '暫停中', pending: '未開始', overdue: '逾期' }[s] || s;
  },
  statusBadge(s) {
    return { active: 'badge-blue', done: 'badge-green', paused: 'badge-yellow', pending: 'badge-gray', overdue: 'badge-red' }[s] || 'badge-gray';
  },
  priorityLabel(p) { return { high: '高', mid: '中', low: '低' }[p] || p; },
  priorityBadge(p) { return { high: 'badge-red', mid: 'badge-orange', low: 'badge-green' }[p] || 'badge-gray'; },
  roleLabel(r) { return { admin: '管理者', executor: '執行人員' }[r] || r; },

  calendarEvents: {
    '2024-06-03': ['需求文件撰寫'],
    '2024-06-05': ['設計稿確認'],
    '2024-06-08': ['前端開發', 'API 開發'],
    '2024-06-10': ['測試開始'],
    '2024-06-15': ['後端 API 截止'],
    '2024-06-20': ['活動頁面截止'],
    '2024-06-25': ['行銷素材'],
    '2024-06-30': ['行銷活動專案截止'],
  },
};

// Report computed data
AppState.reportData = {
  completionRate: 75,
  overdueTasks: 6,
  totalHours: 320,
  taskDist: [
    { label: '已完成', value: 45, color: '#22c55e' },
    { label: '進行中', value: 28, color: '#3b82f6' },
    { label: '待辦',   value: 12, color: '#94a3b8' },
    { label: '逾期',   value: 6,  color: '#ef4444' },
  ],
  hoursData: [
    { name: '王小明', hours: 80 },
    { name: '李小美', hours: 65 },
    { name: '國小強', hours: 90 },
    { name: '陳大文', hours: 55 },
    { name: '張小紅', hours: 30 },
  ],
};
