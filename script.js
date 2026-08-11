const focusButton = document.querySelector('#focus-button');
const focusMessage = document.querySelector('#focus-message');
const taskList = document.querySelector('#task-list');

// Utility to create a tiny burst effect for checking tasks
function createBurst(x, y) {
  const burst = document.createElement('div');
  burst.style.position = 'fixed';
  burst.style.left = x + 'px';
  burst.style.top = y + 'px';
  burst.style.width = '10px';
  burst.style.height = '10px';
  burst.style.background = 'var(--mint)';
  burst.style.borderRadius = '50%';
  burst.style.pointerEvents = 'none';
  burst.style.transform = 'translate(-50%, -50%) scale(1)';
  burst.style.opacity = '1';
  burst.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  burst.style.zIndex = '100';
  document.body.appendChild(burst);

  requestAnimationFrame(() => {
    burst.style.transform = 'translate(-50%, -50%) scale(4)';
    burst.style.opacity = '0';
  });

  setTimeout(() => burst.remove(), 400);
}

function refreshProgress() {
  const tasks = [...document.querySelectorAll('.task')];
  const completed = tasks.filter((task) => task.classList.contains('done')).length;
  const progress = Math.round((completed / tasks.length) * 100);
  
  // Update text values
  document.querySelector('#completed-count').textContent = completed;
  
  // Animate number counting up/down
  const progressEl = document.querySelector('#progress-number');
  progressEl.textContent = progress;
  
  // Set bar width with a small delay for smoother initial load
  setTimeout(() => {
    document.querySelector('#progress-bar').style.width = progress + '%';
  }, 50);
  
  // Update remaining pill
  const remaining = tasks.length - completed;
  const countPill = document.querySelector('#task-count');
  countPill.textContent = remaining === 0 ? 'All done!' : remaining + ' left';
  
  if (remaining === 0) {
    countPill.style.background = 'var(--mint)';
    countPill.style.color = '#152638';
  } else {
    countPill.style.background = 'rgba(167, 139, 250, 0.12)';
    countPill.style.color = '#c7beff';
  }
}

focusButton.addEventListener('click', () => {
  document.body.classList.toggle('focus-mode');
  const active = document.body.classList.contains('focus-mode');
  
  focusButton.innerHTML = active 
    ? '<i class="ph ph-target"></i> Focus session running' 
    : '<i class="ph ph-target"></i> Start focus session';
    
  focusMessage.style.opacity = '0';
  setTimeout(() => {
    focusMessage.textContent = active 
      ? 'Focus mode is on. Protect the next 25 minutes.' 
      : 'Focus mode paused. Your plan is waiting.';
    focusMessage.style.opacity = '1';
  }, 200);
});

taskList.addEventListener('click', (event) => {
  const button = event.target.closest('.task-toggle');
  if (!button) return;
  
  const task = button.closest('.task');
  const isDone = task.classList.toggle('done');
  button.setAttribute('aria-pressed', String(isDone));
  
  if (isDone) {
    const rect = button.getBoundingClientRect();
    createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }
  
  refreshProgress();
});

// Initialize
refreshProgress();