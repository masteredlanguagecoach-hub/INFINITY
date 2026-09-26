export function openModal({ title, content, actions = '', size = '' }) {
  closeModal(); // close existing if any

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'active-modal';

  overlay.innerHTML = `
    <div class="modal-content ${size ? `modal-${size}` : ''}">
      <div class="modal-header">
        <h3 style="margin:0">${title}</h3>
        <button class="btn btn-outline" id="modal-close-x" style="border:none; background:none; font-size:1.5rem; line-height:1; padding:0;">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      ${actions ? `<div class="modal-footer">${actions}</div>` : ''}
    </div>
  `;

  document.body.appendChild(overlay);

  const closeX = document.getElementById('modal-close-x');
  if (closeX) closeX.addEventListener('click', closeModal);
  
  // Close on outside click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  return overlay;
}

export function closeModal() {
  const modal = document.getElementById('active-modal');
  if (modal) modal.remove();
}

export function confirmModal({ title, message, onConfirm }) {
  openModal({
    title,
    content: `<p>${message}</p>`,
    actions: `
      <button class="btn btn-outline" id="confirm-cancel">Cancel</button>
      <button class="btn btn-danger" id="confirm-ok">Confirm</button>
    `
  });

  document.getElementById('confirm-cancel').addEventListener('click', closeModal);
  document.getElementById('confirm-ok').addEventListener('click', () => {
    closeModal();
    if (onConfirm) onConfirm();
  });
}
