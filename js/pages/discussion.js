// ============================================================
// DISCUSSION BOARD PAGE
// ============================================================

let selectedDiscussionTask = null;

function renderDiscussion() {
  const u = AppState.currentUser;
  const myTaskIds = u.role === 'admin'
    ? null
    : new Set(AppState.tasks.filter(t => t.assignee === u.id).map(t => t.id));
  // Group discussions by task (filter by user's tasks for executors)
  const taskIds = [...new Set(AppState.discussions.map(d => d.taskId))]
    .filter(tid => !myTaskIds || myTaskIds.has(tid));
  const threads = taskIds.map(tid => {
    const task = AppState.tasks.find(t => t.id === tid);
    const msgs = AppState.getDiscussionsByTask(tid);
    const lastMsg = msgs[msgs.length - 1];
    const unread = msgs.filter(m => !m.read).length;
    return { tid, task, msgs, lastMsg, unread };
  });

  if (threads.length === 0) {
    selectedDiscussionTask = null;
  } else if (!selectedDiscussionTask || !threads.find(t => t.tid === selectedDiscussionTask)) {
    selectedDiscussionTask = threads[0].tid;
  }

  const activeThread = threads.find(t => t.tid === selectedDiscussionTask);

  if (threads.length === 0) {
    document.getElementById('page-container').innerHTML = `
      <div class="page-enter">
        <div class="card flex flex-col items-center justify-center py-20 text-center">
          ${svgIcon('message', 48)}
          <div class="mt-4 text-gray-400 text-sm">目前沒有相關任務的討論</div>
        </div>
      </div>`;
    return;
  }

  document.getElementById('page-container').innerHTML = `
    <div class="page-enter">
      <div class="card" style="height:calc(100vh - 140px);display:flex;flex-direction:column;padding:0;overflow:hidden">
        <div class="flex flex-1 overflow-hidden">

          <!-- Thread list -->
          <div style="width:280px;border-right:1px solid #f1f5f9;flex-shrink:0;overflow-y:auto">
            <div class="p-4 border-b border-gray-100">
              <h3 class="font-bold text-gray-800">討論區</h3>
            </div>
            <div>
              ${threads.map(th => `
                <div onclick="selectedDiscussionTask=${th.tid};renderDiscussion()" class="p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${th.tid === selectedDiscussionTask ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}">
                  <div class="flex items-start justify-between gap-2">
                    <span class="text-sm font-semibold text-gray-800 leading-tight">任務討論 — ${th.task ? th.task.name : '已刪除'}</span>
                    ${th.unread > 0 ? `<span class="badge badge-blue text-xs flex-shrink-0">${th.unread}</span>` : ''}
                  </div>
                  ${th.lastMsg ? `
                    <div class="text-xs text-gray-400 mt-1 truncate">
                      ${AppState.getUser(th.lastMsg.user)?.name || '—'}: ${th.lastMsg.message}
                    </div>
                    <div class="text-xs text-gray-300 mt-0.5">${th.lastMsg.time}</div>` : ''}
                </div>`).join('')}
            </div>
          </div>

          <!-- Chat area -->
          <div class="flex-1 flex flex-col overflow-hidden">
            ${activeThread ? `
              <!-- Chat header -->
              <div class="p-4 border-b border-gray-100 flex items-center gap-3">
                <div>
                  <div class="font-bold text-gray-800 text-sm">任務討論 — ${activeThread.task?.name || '—'}</div>
                  <div class="text-xs text-gray-400">${activeThread.msgs.length} 則留言</div>
                </div>
                ${activeThread.task ? `
                  <button onclick="AppState.currentTaskId=${activeThread.task.id};navigateTo('task-detail')" class="btn btn-secondary btn-sm ml-auto">查看任務</button>
                ` : ''}
              </div>

              <!-- Messages -->
              <div id="disc-chat" class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                ${renderDiscChatMessages(activeThread.msgs)}
              </div>

              <!-- Input -->
              <div class="p-4 border-t border-gray-100 flex gap-2">
                <input id="disc-input" class="form-input flex-1" placeholder="輸入訊息..." onkeydown="if(event.key==='Enter')sendDiscMessage(${activeThread.tid})" />
                <button onclick="sendDiscMessage(${activeThread.tid})" class="btn btn-primary" style="padding:8px 14px">${svgIcon('send', 16)}</button>
              </div>` : `
              <div class="flex-1 flex items-center justify-center text-gray-400">
                <div class="text-center">
                  ${svgIcon('message', 40)}
                  <div class="mt-3 text-sm">選擇討論串開始對話</div>
                </div>
              </div>`}
          </div>
        </div>
      </div>
    </div>`;

  // Mark as read
  if (activeThread) {
    activeThread.msgs.forEach(m => m.read = true);
  }

  // Scroll to bottom
  setTimeout(() => {
    const chat = document.getElementById('disc-chat');
    if (chat) chat.scrollTop = chat.scrollHeight;
  }, 50);
}

function renderDiscChatMessages(msgs) {
  const u = AppState.currentUser;
  if (!msgs.length) return `<div class="text-center text-gray-400 text-sm py-8">開始討論吧！</div>`;
  return msgs.map(m => {
    const sender = AppState.getUser(m.user);
    const isMe = m.user === u.id;
    return `
      <div class="flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2">
        ${!isMe ? (sender ? userAvatar(sender, 32) : '') : ''}
        <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1">
          ${!isMe ? `<span class="text-xs text-gray-400 ml-1">${sender?.name || '—'}</span>` : ''}
          <div class="chat-bubble ${isMe ? 'chat-bubble-right' : 'chat-bubble-left'}">${m.message}</div>
          <span class="text-xs text-gray-300 mx-1">${m.time}</span>
        </div>
        ${isMe ? (sender ? userAvatar(sender, 32) : '') : ''}
      </div>`;
  }).join('');
}

function sendDiscMessage(taskId) {
  const input = document.getElementById('disc-input');
  const msg = input?.value.trim();
  if (!msg) return;
  const u = AppState.currentUser;
  const now = new Date();
  const timeStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  AppState.discussions.push({ id: AppState.discussions.length + 1, taskId, user: u.id, message: msg, time: timeStr, read: true });
  input.value = '';
  const chat = document.getElementById('disc-chat');
  if (chat) {
    const msgs = AppState.getDiscussionsByTask(taskId);
    chat.innerHTML = renderDiscChatMessages(msgs);
    chat.scrollTop = chat.scrollHeight;
  }
}
