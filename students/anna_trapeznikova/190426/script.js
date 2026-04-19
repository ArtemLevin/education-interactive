
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-copy-link]').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-copy-link');
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(url).then(() => {
        const old = btn.textContent;
        btn.textContent = 'Ссылка скопирована';
        setTimeout(() => btn.textContent = old, 1300);
      }).catch(() => {});
    });
  });

  document.querySelectorAll('[data-quiz]').forEach(block => {
    const answer = block.getAttribute('data-answer');
    const feedback = block.querySelector('.quiz-feedback');
    block.querySelectorAll('button[data-choice]').forEach(button => {
      button.addEventListener('click', () => {
        const choice = button.getAttribute('data-choice');
        if (choice === answer) {
          feedback.textContent = 'Верно. Этот вариант соответствует разбору.';
        } else {
          feedback.textContent = 'Пока нет. Сверьтесь с блоком «Идея решения» и «Проверка ответа».';
        }
      });
    });
  });

  document.querySelectorAll('[data-level-toggle]').forEach(group => {
    group.querySelectorAll('button[data-target-level]').forEach(button => {
      button.addEventListener('click', () => {
        const target = button.getAttribute('data-target-level');
        group.querySelectorAll('[data-level-panel]').forEach(panel => {
          panel.hidden = panel.getAttribute('data-level-panel') !== target;
        });
        group.querySelectorAll('button[data-target-level]').forEach(btn => btn.classList.remove('primary'));
        button.classList.add('primary');
      });
    });
  });

  const paramButtons = document.querySelectorAll('[data-param-line]');
  if (paramButtons.length) {
    const line = document.getElementById('paramLine');
    const label = document.getElementById('paramLabel');
    const dotA = document.getElementById('paramDotA');
    const dotB = document.getElementById('paramDotB');
    const dotHole = document.getElementById('paramDotHole');
    const yMap = {
      min1: { y: 214, text: 'уровень вершины', showA: true, showB: false, showHole: false },
      three: { y: 96, text: 'уровень выколотой точки', showA: true, showB: false, showHole: true }
    };
    paramButtons.forEach(button => {
      button.addEventListener('click', () => {
        const key = button.getAttribute('data-param-line');
        const conf = yMap[key];
        if (!conf || !line) return;
        line.setAttribute('y1', conf.y);
        line.setAttribute('y2', conf.y);
        label.textContent = conf.text;
        if (dotA) dotA.style.display = conf.showA ? 'block' : 'none';
        if (dotB) dotB.style.display = conf.showB ? 'block' : 'none';
        if (dotHole) dotHole.style.display = conf.showHole ? 'block' : 'none';
        paramButtons.forEach(btn => btn.classList.remove('primary'));
        button.classList.add('primary');
      });
    });
  }
});
