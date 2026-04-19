
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-steps]').forEach(function (wrap) {
    const buttons = wrap.querySelectorAll('.step-btn');
    const cards = wrap.querySelectorAll('.step-card');
    if (!buttons.length || !cards.length) return;
    const activate = function (target) {
      buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.target === target));
      cards.forEach(card => card.classList.toggle('active', card.id === target));
    };
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activate(btn.dataset.target);
        const card = wrap.querySelector('#' + btn.dataset.target);
        if (card) card.scrollIntoView({behavior:'smooth', block:'nearest'});
      });
    });
    activate(cards[0].id);
  });

  document.querySelectorAll('[data-quiz]').forEach(function (wrap) {
    const btn = wrap.querySelector('.quiz-btn');
    const answer = wrap.querySelector('.quiz-answer');
    if (!btn || !answer) return;
    btn.addEventListener('click', function () {
      const show = !answer.classList.contains('show');
      answer.classList.toggle('show', show);
      btn.classList.toggle('active', show);
      btn.textContent = show ? 'Скрыть ответ' : 'Показать ответ';
    });
  });
});
