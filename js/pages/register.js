// ============================================================
// REGISTER PAGE
// ============================================================

function renderRegister() {
  document.getElementById('auth-container').innerHTML = `
    <div class="auth-card fade-in" style="max-width:480px">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">建立新帳號</h2>
        <p class="text-gray-400 text-sm mt-1">請填寫以下資料以建立帳號</p>
      </div>

      <div class="flex flex-col gap-4">
        <div>
          <label class="form-label">姓名</label>
          <div class="relative">
            <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af">${svgIcon('user', 16)}</span>
            <input id="reg-name" type="text" class="form-input" style="padding-left:40px" placeholder="請輸入姓名" />
          </div>
        </div>
        <div>
          <label class="form-label">Email</label>
          <div class="relative">
            <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af">${svgIcon('mail', 16)}</span>
            <input id="reg-email" type="email" class="form-input" style="padding-left:40px" placeholder="請輸入 Email" />
          </div>
        </div>
        <div>
          <label class="form-label">密碼</label>
          <div class="relative">
            <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af">${svgIcon('lock', 16)}</span>
            <input id="reg-password" type="password" class="form-input" style="padding-left:40px" placeholder="請輸入密碼（至少6碼）" />
          </div>
        </div>
        <div>
          <label class="form-label">確認密碼</label>
          <div class="relative">
            <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af">${svgIcon('lock', 16)}</span>
            <input id="reg-password2" type="password" class="form-input" style="padding-left:40px" placeholder="請再次輸入密碼" />
          </div>
        </div>

        <div>
          <label class="form-label">身分選擇</label>
          <div class="flex gap-3">
            <label class="flex-1 flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors" id="role-admin-label">
              <input type="radio" name="role" value="admin" id="role-admin" class="accent-blue-600" />
              <div>
                <div class="font-semibold text-sm text-gray-800">管理人員</div>
                <div class="text-xs text-gray-400">可管理專案、任務與成員</div>
              </div>
            </label>
            <label class="flex-1 flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors" id="role-exec-label">
              <input type="radio" name="role" value="executor" id="role-exec" class="accent-blue-600" checked />
              <div>
                <div class="font-semibold text-sm text-gray-800">執行人員</div>
                <div class="text-xs text-gray-400">查看並執行指派的任務</div>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label class="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" id="reg-terms" class="mt-0.5 rounded accent-blue-600" />
            <span>我已閱讀並同意 <button class="text-blue-600 hover:underline">使用條款</button> 及 <button class="text-blue-600 hover:underline">隱私政策</button></span>
          </label>
        </div>

        <button onclick="handleRegister()" class="btn btn-primary w-full justify-center" style="height:44px;font-size:15px">註冊</button>
      </div>

      <p class="text-center text-sm text-gray-500 mt-6">
        已有帳號？
        <button onclick="navigateAuth('login')" class="text-blue-600 hover:text-blue-700 font-medium">立即登入</button>
      </p>
    </div>`;
}

function handleRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pwd = document.getElementById('reg-password').value;
  const pwd2 = document.getElementById('reg-password2').value;
  const role = document.querySelector('input[name="role"]:checked')?.value;
  const terms = document.getElementById('reg-terms').checked;

  if (!name || !email || !pwd || !pwd2) { showToast('請填寫所有欄位', 'error'); return; }
  if (pwd.length < 6) { showToast('密碼至少需要6個字元', 'error'); return; }
  if (pwd !== pwd2) { showToast('兩次密碼不符', 'error'); return; }
  if (!terms) { showToast('請同意使用條款', 'error'); return; }
  if (AppState.users.find(u => u.email === email)) { showToast('此 Email 已被使用', 'error'); return; }

  const newUser = {
    id: AppState.users.length + 1,
    name, email, password: pwd, role: role || 'executor',
    title: role === 'admin' ? '專案經理' : '執行人員',
    phone: '',
    avatar: name.slice(0, 2),
  };
  AppState.users.push(newUser);
  AppState.members.push({ id: newUser.id, name, title: newUser.title, role: newUser.role });
  saveAppState();
  showToast('註冊成功！請登入', 'success');
  navigateAuth('login');
}
