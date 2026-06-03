// ============================================================
// TASK DETAIL PAGE
// ============================================================

const MOOD_OPTIONS = [
  { emoji: '😊', label: '順利',    color: '#22c55e' },
  { emoji: '🔥', label: '全力衝刺', color: '#f97316' },
  { emoji: '😟', label: '遇到困難', color: '#f59e0b' },
  { emoji: '😤', label: '壓力大',  color: '#ef4444' },
];

function renderTaskDetail() {
  const t = AppState.tasks.find(t => t.id === AppState.currentTaskId);
  if (!t) {
    document.getElementById('page-container').innerHTML = `<div class="card text-center text-gray-400 py-12">找不到任務</div>`;
    return;
  }

  const proj = AppState.getProject(t.projectId);
  const assignee = AppState.getUser(t.assignee);
  const u = AppState.currentUser;
  const isAdmin = u.role === 'admin';
  const discussions = AppState.getDiscussionsByTask(t.id);
  const isAssignee = t.assignee === u.id;
  const prevPage = isAdmin ? 'tasks' : 'my-tasks';
  const prevLabel = isAdmin ? '任務管理' : '我的任務';

  // Dependency info
  const deps = (t.dependencies || []).map(did => AppState.tasks.find(tk => tk.id === did)).filter(Boolean);
  const depBlocked = deps.some(d => d.status !== 'done');

  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <button onclick="navigateTo('${prevPage}')" class="hover:text-blue-600 transition-colors">${prevLabel}</button>
        <span>/</span>
        <span class="text-gray-700 font-medium">${t.name}</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Main content -->
        <div class="lg:col-span-2 flex flex-col gap-4">

          <!-- Task header card -->
          <div class="card">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h2 class="text-xl font-bold text-gray-800 mb-2">${t.name}</h2>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="badge ${AppState.statusBadge(t.status)}">${AppState.statusLabel(t.status)}</span>
                  <span class="badge ${AppState.priorityBadge(t.priority)}">${AppState.priorityLabel(t.priority)} 優先度</span>
                  <span class="text-sm text-gray-400">${svgIcon('clock', 14)} 截止：${t.dueDate}</span>
                  ${t.mood ? `<span style="font-size:20px" title="心情回饋">${t.mood}</span>` : ''}
                </div>
              </div>
            </div>

            <!-- Dependency warning -->
            ${depBlocked ? `
              <div class="mb-4 flex items-center gap-2 rounded-lg px-4 py-3" style="background:#fff7ed;border:1.5px solid #fed7aa">
                <span style="color:#f97316;font-size:18px">⚠️</span>
                <div>
                  <div class="text-sm font-semibold" style="color:#ea580c">前置任務尚未完成</div>
                  <div class="text-xs" style="color:#9a3412">需先完成：${deps.filter(d=>d.status!=='done').map(d=>d.name).join('、')}</div>
                </div>
              </div>` : ''}

            <!-- Progress -->
            <div class="mb-4">
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600 font-medium">任務進度</span>
                <span class="font-bold text-blue-600">${t.progress}%</span>
              </div>
              ${progressBar(t.progress, 'progress-blue', 10)}
            </div>

            <!-- Action buttons -->
            <div class="flex gap-3 flex-wrap">
              ${(isAssignee || isAdmin) && t.status === 'pending' ? `<button onclick="updateTaskStatus(${t.id},'active')" class="btn btn-primary" ${depBlocked?'disabled title="請先完成前置任務"':''}>${svgIcon('activity', 14)} 開始作業</button>` : ''}
              ${(isAssignee || isAdmin) && t.status === 'active' ? `
                <button onclick="updateTaskStatus(${t.id},'done')" class="btn btn-success">${svgIcon('check', 14)} 標記完成</button>
                <button onclick="openProgressModal(${t.id})" class="btn btn-secondary">${svgIcon('chart', 14)} 更新進度</button>
              ` : ''}
              ${t.status === 'done' ? `<span class="btn btn-success cursor-default">${svgIcon('check_circle', 14)} 已完成</span>` : ''}
              ${isAdmin ? `<button onclick="openEditTaskModal(${t.id})" class="btn btn-secondary">${svgIcon('edit', 14)} 編輯任務</button>` : ''}
            </div>
          </div>

          <!-- Mood Feedback card -->
          ${isAssignee ? renderMoodCard(t) : (isAdmin ? renderMoodReadOnly(t) : '')}

          <!-- Description card -->
          <div class="card">
            <h3 class="font-bold text-gray-800 mb-3">任務描述</h3>
            <p class="text-gray-600 text-sm leading-relaxed">${t.desc || '（暫無描述）'}</p>
          </div>

          <!-- Attachments card -->
          <div class="card">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-gray-800">附件</h3>
              <button onclick="showToast('請選擇要上傳的檔案','info')" class="btn btn-secondary btn-sm">${svgIcon('upload', 14)} 上傳</button>
            </div>
            ${t.attachments && t.attachments.length > 0
              ? t.attachments.map(a => `
                  <div class="file-item">
                    <div style="width:36px;height:36px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#3b82f6">${svgIcon('file', 16)}</div>
                    <span class="text-sm text-gray-700">${a}</span>
                    <button onclick="showToast('下載中...','info')" class="btn-icon ml-auto">${svgIcon('download', 14)}</button>
                  </div>`).join('')
              : `<div class="text-center text-gray-400 text-sm py-4">暫無附件</div>`}
          </div>

          <!-- Discussion card -->
          <div class="card">
            <h3 class="font-bold text-gray-800 mb-4">討論留言</h3>
            <div id="task-chat" class="flex flex-col gap-4 mb-4" style="max-height:300px;overflow-y:auto">
              ${renderTaskChatMessages(discussions)}
            </div>
            <div class="flex gap-2 pt-3 border-t border-gray-100">
              <input id="task-comment-input" class="form-input flex-1" placeholder="輸入留言..." onkeydown="if(event.key==='Enter')addTaskComment(${t.id})" />
              <button onclick="addTaskComment(${t.id})" class="btn btn-primary" style="padding:8px 14px">${svgIcon('send', 16)}</button>
            </div>
          </div>
        </div>

        <!-- Side info -->
        <div class="flex flex-col gap-4">
          <div class="card">
            <h3 class="font-bold text-gray-800 mb-4">任務資訊</h3>
            <div class="flex flex-col gap-3">
              <div>
                <div class="text-xs text-gray-400 mb-1">負責人</div>
                <div class="flex items-center gap-2">
                  ${assignee ? userAvatar(assignee, 32) : ''}
                  <span class="text-sm font-medium text-gray-700">${assignee ? assignee.name : '—'}</span>
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-400 mb-1">所屬專案</div>
                <span class="text-sm text-gray-700">${proj ? proj.name : '—'}</span>
              </div>
              <div>
                <div class="text-xs text-gray-400 mb-1">截止日期</div>
                <span class="text-sm text-gray-700">${t.dueDate}</span>
              </div>
              <div>
                <div class="text-xs text-gray-400 mb-1">優先度</div>
                <span class="badge ${AppState.priorityBadge(t.priority)}">${AppState.priorityLabel(t.priority)}</span>
              </div>
              <div>
                <div class="text-xs text-gray-400 mb-1">狀態</div>
                <span class="badge ${AppState.statusBadge(t.status)}">${AppState.statusLabel(t.status)}</span>
              </div>
              ${deps.length ? `
              <div>
                <div class="text-xs text-gray-400 mb-1">前置任務</div>
                <div class="flex flex-col gap-1">
                  ${deps.map(d => `
                    <div class="flex items-center gap-1 text-xs">
                      <span style="color:${d.status==='done'?'#22c55e':'#94a3b8'}">${d.status==='done'?'✓':'○'}</span>
                      <span class="${d.status==='done'?'line-through text-gray-300':'text-gray-600'}">${d.name}</span>
                    </div>`).join('')}
                </div>
              </div>` : ''}
            </div>
          </div>

          ${proj ? `
          <div class="card">
            <h3 class="font-bold text-gray-800 mb-3">專案進度</h3>
            <div class="text-sm text-gray-600 mb-2">${proj.name}</div>
            ${progressBar(AppState.getProjectProgress(proj.id), 'progress-blue', 8)}
            <div class="text-right text-xs text-blue-600 font-semibold mt-1">${AppState.getProjectProgress(proj.id)}%</div>
          </div>` : ''}
        </div>
      </div>
    </div>`;
}

// ── Mood Card ──────────────────────────────────────────────

function renderMoodCard(t) {
  return `
    <div class="card">
      <h3 class="font-bold text-gray-800 mb-1">心情回饋 <span class="text-xs font-normal text-gray-400 ml-1">— 目前工作狀態如何？</span></h3>
      <p class="text-xs text-gray-400 mb-3">選擇最符合你現在狀況的心情，讓管理員掌握團隊狀態</p>
      <div class="flex gap-3 flex-wrap" id="mood-btns">
        ${MOOD_OPTIONS.map(m => `
          <button onclick="selectMood(${t.id},'${m.emoji}')"
            class="mood-btn flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all"
            id="mood-${m.emoji.codePointAt(0)}"
            style="border-color:${t.mood===m.emoji ? m.color : '#e5e7eb'};background:${t.mood===m.emoji ? m.color+'18' : 'white'}">
            <span style="font-size:28px">${m.emoji}</span>
            <span class="text-xs font-medium" style="color:${t.mood===m.emoji ? m.color : '#6b7280'}">${m.label}</span>
          </button>`).join('')}
      </div>
      ${t.mood ? `<p class="text-xs mt-3" style="color:#6b7280">已回饋：${t.mood} ${MOOD_OPTIONS.find(m=>m.emoji===t.mood)?.label || ''}</p>` : ''}
    </div>`;
}

function renderMoodReadOnly(t) {
  const moodObj = MOOD_OPTIONS.find(m => m.emoji === t.mood);
  return `
    <div class="card">
      <h3 class="font-bold text-gray-800 mb-1">心情回饋 <span class="text-xs font-normal text-gray-400 ml-1">— 負責人回報狀態</span></h3>
      ${t.mood && moodObj
        ? `<div class="flex items-center gap-3 mt-2">
            <span style="font-size:36px">${t.mood}</span>
            <div>
              <div class="text-sm font-semibold" style="color:${moodObj.color}">${moodObj.label}</div>
              <div class="text-xs text-gray-400">負責人目前回報的工作狀態</div>
            </div>
          </div>`
        : `<p class="text-sm text-gray-400 mt-2">負責人尚未回饋心情</p>`
      }
    </div>`;
}

function selectMood(taskId, emoji) {
  const t = AppState.tasks.find(t => t.id === taskId);
  if (!t) return;
  t.mood = (t.mood === emoji) ? null : emoji; // toggle
  const moodObj = MOOD_OPTIONS.find(m => m.emoji === emoji);

  // Re-render mood card area only
  const moodSection = document.getElementById('mood-btns')?.closest('.card');
  if (moodSection) moodSection.outerHTML = renderMoodCard(t).match(/<div class="card">([\s\S]*)<\/div>/)?.[0] || '';

  // Update mood display in header badges
  renderTaskDetail();

  // Push notification to admin if stressed
  if (t.mood === '😤' || t.mood === '😟') {
    const assignee = AppState.getUser(t.assignee);
    const adminUser = AppState.users.find(u => u.role === 'admin');
    AppState.notifications.unshift({
      id: Date.now(),
      type: 'mood',
      icon: 'heart',
      title: '成員情緒警示',
      message: `${assignee ? assignee.name : '成員'} 在任務「${t.name}」回饋心情：${t.mood}，請適時關懷`,
      time: '剛剛',
      read: false,
      taskId: t.id,
      targetUserId: adminUser ? adminUser.id : null,
    });
  }

  saveAppState();
  showToast(`心情已記錄 ${t.mood ? t.mood : '（已清除）'}`, 'success');
}

// ── Chat ───────────────────────────────────────────────────

function renderTaskChatMessages(discussions) {
  const u = AppState.currentUser;
  if (!discussions.length) return `<div class="text-center text-gray-400 text-sm py-4">暫無留言，開始討論吧！</div>`;
  return discussions.map(d => {
    const sender = AppState.getUser(d.user);
    const isMe = d.user === u.id;
    return `
      <div class="flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2">
        ${!isMe ? (sender ? userAvatar(sender, 32) : '') : ''}
        <div class="${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1">
          ${!isMe ? `<span class="text-xs text-gray-400">${sender ? sender.name : ''}</span>` : ''}
          <div class="chat-bubble ${isMe ? 'chat-bubble-right' : 'chat-bubble-left'}">${d.message}</div>
          <span class="text-xs text-gray-300">${d.time}</span>
        </div>
      </div>`;
  }).join('');
}

function addTaskComment(taskId) {
  const input = document.getElementById('task-comment-input');
  const msg = input?.value.trim();
  if (!msg) return;
  const u = AppState.currentUser;
  const now = new Date();
  const timeStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  AppState.discussions.push({ id: AppState.discussions.length + 1, taskId, user: u.id, message: msg, time: timeStr, read: false });
  saveAppState();
  input.value = '';
  const chat = document.getElementById('task-chat');
  if (chat) {
    chat.innerHTML = renderTaskChatMessages(AppState.getDiscussionsByTask(taskId));
    chat.scrollTop = chat.scrollHeight;
  }
}

// ── Status / Progress ──────────────────────────────────────

function updateTaskStatus(taskId, newStatus) {
  const t = AppState.tasks.find(t => t.id === taskId);
  if (!t) return;

  // Block if dependencies not done
  if (newStatus === 'active') {
    const deps = (t.dependencies || []).map(did => AppState.tasks.find(tk => tk.id === did)).filter(Boolean);
    const blocked = deps.filter(d => d.status !== 'done');
    if (blocked.length) {
      showToast(`請先完成前置任務：${blocked.map(d=>d.name).join('、')}`, 'error');
      return;
    }
  }

  t.status = newStatus;
  if (newStatus === 'done') t.progress = 100;
  if (newStatus === 'active' && t.progress === 0) t.progress = 5;
  checkRiskAlerts();

  // 通知管理者狀態變更
  const adminUser = AppState.users.find(u => u.role === 'admin');
  const executor = AppState.getUser(t.assignee);
  if (adminUser && AppState.currentUser?.id !== adminUser.id) {
    const statusLabel = { done: '已完成', active: '開始執行', paused: '暫停中', pending: '重設為待開始' };
    AppState.notifications.unshift({
      id: Date.now(),
      type: 'general',
      icon: 'info',
      title: '任務狀態更新',
      message: `${executor ? executor.name : '成員'} 已將「${t.name}」標記為「${statusLabel[newStatus] || newStatus}」`,
      time: '剛剛',
      read: false,
      taskId: t.id,
      targetUserId: adminUser.id,
    });
  }

  saveAppState();
  renderTaskDetail();
  showToast(newStatus === 'done' ? '任務已標記為完成！' : '任務已開始執行', 'success');
}

function saveTaskProgress(taskId) {
  const tk = AppState.tasks.find(t => t.id === taskId);
  if (!tk) return;
  const newProgress = parseInt(document.getElementById('prog-slider').value);
  const oldProgress = tk.progress;
  tk.progress = newProgress;
  checkRiskAlerts();

  // 通知管理者進度更新
  const adminUser = AppState.users.find(u => u.role === 'admin');
  const executor = AppState.getUser(tk.assignee);
  if (adminUser && AppState.currentUser?.id !== adminUser.id) {
    AppState.notifications.unshift({
      id: Date.now(),
      type: 'general',
      icon: 'info',
      title: '進度更新',
      message: `${executor ? executor.name : '成員'} 已將「${tk.name}」進度從 ${oldProgress}% 更新至 ${newProgress}%`,
      time: '剛剛',
      read: false,
      taskId: tk.id,
      targetUserId: adminUser.id,
    });
  }

  saveAppState();
  closeModal();
  renderTaskDetail();
  showToast('進度已更新', 'success');
}

function openProgressModal(taskId) {
  const t = AppState.tasks.find(t => t.id === taskId);
  if (!t) return;
  openModal(modalShell('更新進度',
    `<div>
      <label class="form-label mb-3 block">目前進度：<span id="prog-val" class="text-blue-600 font-bold">${t.progress}%</span></label>
      <input type="range" min="0" max="100" value="${t.progress}" class="w-full" id="prog-slider" oninput="document.getElementById('prog-val').textContent=this.value+'%'" />
      <div class="flex justify-between text-xs text-gray-400 mt-1"><span>0%</span><span>50%</span><span>100%</span></div>
    </div>`,
    `<button onclick="closeModal()" class="btn btn-secondary">取消</button>
     <button onclick="saveTaskProgress(${taskId})" class="btn btn-primary">儲存</button>`
  ));
}
