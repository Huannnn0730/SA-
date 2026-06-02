// ============================================================
// LOGIN PAGE
// ============================================================

function renderLogin() {
  document.getElementById('auth-container').innerHTML = `
    <div class="auth-card fade-in">
      <div class="text-center mb-8">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          ${svgIcon('chart', 26, '')}
        </div>
        <h2 class="text-2xl font-bold text-gray-800">專案排程管理系統</h2>
        <p class="text-gray-400 text-sm mt-1">請登入您的帳號</p>
      </div>

      <div class="flex flex-col gap-4">
        <div>
          <label class="form-label">帳號 / Email</label>
          <div class="relative">
            <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af">${svgIcon('user', 16)}</span>
            <input id="login-email" type="email" class="form-input" style="padding-left:40px" placeholder="請輸入 Email" value="wang@example.com" />
          </div>
        </div>
        <div>
          <label class="form-label">密碼</label>
          <div class="relative">
            <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af">${svgIcon('lock', 16)}</span>
            <input id="login-password" type="password" class="form-input" style="padding-left:40px;padding-right:40px" placeholder="請輸入密碼" value="123456" />
            <button onclick="togglePwd('login-password')" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#9ca3af">${svgIcon('eye', 16)}</button>
          </div>
        </div>
        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2 cursor-pointer text-gray-600">
            <input type="checkbox" id="remember" class="rounded" /> 記住我
          </label>
          <button onclick="navigateAuth('forgot')" class="text-blue-600 hover:text-blue-700 font-medium">忘記密碼？</button>
        </div>
        <button onclick="handleLogin()" class="btn btn-primary w-full justify-center" style="height:44px;font-size:15px">登入</button>
        <div class="auth-divider">或</div>
        <button class="btn btn-secondary w-full justify-center gap-3" style="height:44px;font-size:14px">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="18" height="18" />
          使用 Google 帳號登入
        </button>
      </div>

      <p class="text-center text-sm text-gray-500 mt-6">
        還沒有帳號？
        <button onclick="navigateAuth('register')" class="text-blue-600 hover:text-blue-700 font-medium">立即註冊</button>
      </p>

      <div class="mt-6 p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
        <strong>測試帳號：</strong><br>
        管理員: wang@example.com / 123456<br>
        執行人員: li@example.com / 123456
      </div>
    </div>`;
}

function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const user = AppState.users.find(u => u.email === email && u.password === password);
  if (!user) { showToast('帳號或密碼錯誤', 'error'); return; }
  AppState.currentUser = user;
  sessionStorage.setItem('userId', user.id);
  showApp();
  navigateTo('dashboard');
  showToast(`歡迎回來，${user.name}！`, 'success');
}

function togglePwd(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}
