export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  let text = 'Notification';
  if (typeof message === 'string') {
    text = message;
  } else if (typeof message === 'object' && message !== null) {
    text = message.message || message.error || JSON.stringify(message);
  }
  toast.textContent = text;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
