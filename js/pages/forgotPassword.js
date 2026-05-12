// ============================================================
// FORGOT PASSWORD PAGE (3-step)
// ============================================================

let forgotStep = 1;

function renderForgotPassword() {
  forgotStep = 1;
  renderForgotStep();
}

function renderForgotStep() {
  const steps = [
    { label: '輸入 Email', active: forgotStep >= 1, done: forgotStep > 1 },
    { label: '驗證信箱', active: forgotStep >= 2, done: forgotStep > 2 },
    { label: '設定新密碼', active: forgotStep >= 3, done: false },
  ];

  const stepHtml = `
    <div class="flex items-center gap-2 mb-8">
      ${steps.map((s, i) => `
        <div class="step-circle ${s.done ? 'step-done' : s.active ? 'step-active' : 'step-pending'}">
          ${s.done ? svgIcon('check', 14) : i + 1}
        </div>
        <span class="text-xs ${s.active ? 'text-blue-600 font-semibold' : 'text-gray-400'} hidden sm:block">${s.label}</span>
        ${i < 2 ? `<div class="step-line ${s.done ? 'done' : ''}"></div>` : ''}
      `).join('')}
    </div>`;

  let bodyHtml = '';
  if (forgotStep === 1) {
    bodyHtml = `
      <div class="text-center mb-6">
        <div style="width:56px;height:56px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">${svgIcon('mail', 24)}</div>
        <h3 class="font-bold text-gray-800 text-lg">輸入您的 Email</h3>
        <p class="text-gray-400 text-sm mt-1">我們將發送驗證碼到您的信箱</p>
      </div>
      <div class="mb-4">
        <label class="form-label">輸入您的 Email</label>
        <input id="forgot-email" type="email" class="form-input" placeholder="請輸入您的 Email" />
      </div>
      <button onclick="forgotNext()" class="btn btn-primary w-full justify-center" style="height:44px">發送驗證信</button>`;
  } else if (forgotStep === 2) {
    bodyHtml = `
      <div class="text-center mb-6">
        <div style="width:56px;height:56px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">${svgIcon('mail', 24)}</div>
        <h3 class="font-bold text-gray-800 text-lg">檢查您的信箱</h3>
        <p class="text-gray-400 text-sm mt-1">驗證碼已發送至 <strong class="text-gray-700">${document.getElementById('forgot-email-display')?.textContent || ''}</strong></p>
        <p class="text-gray-400 text-xs mt-1">（測試請輸入：123456）</p>
      </div>
      <div class="mb-4">
        <label class="form-label">輸入驗證碼</label>
        <input id="forgot-code" type="text" class="form-input text-center text-xl tracking-widest" placeholder="_ _ _ _ _ _" maxlength="6" />
      </div>
      <button onclick="forgotNext()" class="btn btn-primary w-full justify-center" style="height:44px">驗證</button>
      <button onclick="forgotStep=1;renderForgotStep()" class="btn btn-secondary w-full justify-center mt-2">重新發送</button>`;
  } else {
    bodyHtml = `
      <div class="text-center mb-6">
        <div style="width:56px;height:56px;background:#f3e8ff;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">${svgIcon('lock', 24)}</div>
        <h3 class="font-bold text-gray-800 text-lg">設定新密碼</h3>
        <p class="text-gray-400 text-sm mt-1">請設定您的新密碼</p>
      </div>
      <div class="flex flex-col gap-4 mb-4">
        <div>
          <label class="form-label">新密碼</label>
          <input id="forgot-pwd1" type="password" class="form-input" placeholder="請輸入新密碼（至少6碼）" />
        </div>
        <div>
          <label class="form-label">確認新密碼</label>
          <input id="forgot-pwd2" type="password" class="form-input" placeholder="請再次輸入新密碼" />
        </div>
      </div>
      <button onclick="forgotFinish()" class="btn btn-primary w-full justify-center" style="height:44px">重設密碼</button>`;
  }

  document.getElementById('auth-container').innerHTML = `
    <div class="auth-card fade-in" style="max-width:440px">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">忘記密碼</h2>
      </div>
      ${stepHtml}
      <span id="forgot-email-display" class="hidden">${forgotStep > 1 ? (document.getElementById('forgot-email-display')?.textContent || '') : ''}</span>
      ${bodyHtml}
      <p class="text-center text-sm text-gray-500 mt-6">
        想起密碼了？<button onclick="navigateAuth('login')" class="text-blue-600 hover:text-blue-700 font-medium">返回登入</button>
      </p>
    </div>`;
}

function forgotNext() {
  if (forgotStep === 1) {
    const email = document.getElementById('forgot-email')?.value.trim();
    if (!email) { showToast('請輸入 Email', 'error'); return; }
    const emailDisplay = document.getElementById('forgot-email-display');
    if (emailDisplay) emailDisplay.textContent = email;
    forgotStep = 2;
    renderForgotStep();
    // store email for step 2 display
    setTimeout(() => {
      const d = document.getElementById('forgot-email-display');
      if (d) d.textContent = email;
    }, 10);
    showToast('驗證碼已發送（測試：123456）', 'info');
  } else if (forgotStep === 2) {
    const code = document.getElementById('forgot-code')?.value.trim();
    if (code !== '123456') { showToast('驗證碼錯誤', 'error'); return; }
    forgotStep = 3;
    renderForgotStep();
  }
}

function forgotFinish() {
  const p1 = document.getElementById('forgot-pwd1')?.value;
  const p2 = document.getElementById('forgot-pwd2')?.value;
  if (!p1 || p1.length < 6) { showToast('密碼至少需要6個字元', 'error'); return; }
  if (p1 !== p2) { showToast('兩次密碼不符', 'error'); return; }
  showToast('密碼重設成功！請重新登入', 'success');
  navigateAuth('login');
}
