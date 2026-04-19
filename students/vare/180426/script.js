
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-toggle]').forEach(button => {
    const id = button.getAttribute('data-toggle');
    const block = document.getElementById(id);
    if (!block) return;
    button.addEventListener('click', () => {
      const hidden = block.hasAttribute('hidden');
      if (hidden) {
        block.removeAttribute('hidden');
        button.textContent = button.getAttribute('data-hide-text') || 'Скрыть';
      } else {
        block.setAttribute('hidden', '');
        button.textContent = button.getAttribute('data-show-text') || 'Показать';
      }
    });
  });

  document.querySelectorAll('.quiz').forEach(quiz => {
    const button = quiz.querySelector('button[data-answer]');
    const input = quiz.querySelector('input, select');
    const result = quiz.querySelector('.quiz-result');
    if (!button || !input || !result) return;
    button.addEventListener('click', () => {
      const expected = (button.dataset.answer || '').trim().toLowerCase();
      const value = (input.value || '').trim().toLowerCase();
      if (!value) {
        result.textContent = 'Сначала дайте ответ.';
        result.style.color = '#9a3412';
        return;
      }
      if (value === expected) {
        result.textContent = 'Верно.';
        result.style.color = '#166534';
      } else {
        result.textContent = 'Пока не совпало. Подумайте ещё раз.';
        result.style.color = '#991b1b';
      }
    });
  });
});
