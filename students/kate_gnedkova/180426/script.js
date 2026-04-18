document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-quiz]').forEach((box) => {
    const form = box.querySelector('form');
    const result = box.querySelector('.quiz-result');
    if (!form || !result) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const expected = (box.getAttribute('data-answer') || '').trim().toLowerCase().replaceAll(' ', '');
      const alt = (box.getAttribute('data-alt') || '').trim().toLowerCase().replaceAll(' ', '');
      const value = (form.querySelector('input')?.value || '').trim().toLowerCase().replaceAll(' ', '');
      const ok = value === expected || (alt && value === alt);
      result.textContent = ok ? 'Верно. Можно двигаться дальше.' : 'Пока нет. Проверьте ключевой шаг и попробуйте ещё раз.';
      result.style.color = ok ? '#0b4f4a' : '#8a2d2d';
    });
  });

  document.querySelectorAll('[data-copy-link]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        btn.textContent = 'Ссылка скопирована';
        setTimeout(() => {
          btn.textContent = 'Скопировать ссылку';
        }, 1600);
      } catch (err) {
        btn.textContent = 'Скопируйте адрес из строки браузера';
      }
    });
  });
});
