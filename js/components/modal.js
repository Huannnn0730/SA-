// ============================================================
// MODAL HELPERS
// ============================================================

function modalShell(title, body, footer = '') {
  return `<div class="modal-box">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-gray-800">${title}</h3>
      <button onclick="closeModal()" class="btn-icon btn-icon-red">${svgIcon('x', 18)}</button>
    </div>
    <div>${body}</div>
    ${footer ? `<div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">${footer}</div>` : ''}
  </div>`;
}

let _pendingConfirm = null;

function confirmModal(title, message, onConfirm) {
  _pendingConfirm = onConfirm;
  openModal(modalShell(
    title,
    `<p class="text-gray-600 text-sm">${message}</p>`,
    `<button onclick="closeModal()" class="btn btn-secondary">取消</button>
     <button onclick="if(_pendingConfirm){_pendingConfirm();_pendingConfirm=null;}closeModal();" class="btn btn-primary">確認</button>`
  ));
}
