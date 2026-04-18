
(function(){
  function ready(fn){
    if(document.readyState !== 'loading'){ fn(); } else { document.addEventListener('DOMContentLoaded', fn); }
  }
  ready(function(){
    document.querySelectorAll('.step > button').forEach(function(btn){
      btn.addEventListener('click', function(){
        btn.parentElement.classList.toggle('open');
      });
    });

    document.querySelectorAll('[data-role="show-answer"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var target = document.getElementById(btn.getAttribute('data-target'));
        if(target){ target.hidden = !target.hidden; }
      });
    });

    document.querySelectorAll('.quiz').forEach(function(box){
      var button = box.querySelector('[data-quiz-check]');
      var result = box.querySelector('.quiz-result');
      if(!button || !result){ return; }
      button.addEventListener('click', function(){
        var good = box.getAttribute('data-answer');
        var selected = box.querySelector('input[type="radio"]:checked');
        if(!selected){
          result.textContent = 'Сначала выберите вариант.';
          result.style.color = 'var(--warn)';
          return;
        }
        if(selected.value === good){
          result.textContent = 'Верно. Логика решения понята правильно.';
          result.style.color = 'var(--accent-2)';
        } else {
          result.textContent = 'Пока нет. Посмотрите блок «Идея решения» и проверьте первый шаг.';
          result.style.color = 'var(--danger)';
        }
      });
    });

    document.querySelectorAll('.similar-root').forEach(function(root){
      var raw = root.querySelector('script[type="application/json"]');
      var out = root.querySelector('.similar-output');
      var btn = root.querySelector('[data-generate]');
      if(!raw || !out || !btn){ return; }
      var data;
      try{ data = JSON.parse(raw.textContent); } catch(err){ return; }
      btn.addEventListener('click', function(){
        if(!Array.isArray(data) || !data.length){ return; }
        var item = data[Math.floor(Math.random()*data.length)];
        out.innerHTML = item;
      });
    });
  });
})();
