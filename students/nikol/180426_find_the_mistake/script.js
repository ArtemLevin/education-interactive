
function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }

function initCommon(){
  qsa('.step').forEach(step=>{
    step.addEventListener('mouseenter', ()=> step.classList.add('active'));
    step.addEventListener('mouseleave', ()=> step.classList.remove('active'));
  });
  const openBtn = qs('#openModal');
  const closeBtn = qs('#closeModal');
  const overlay = qs('#overlay');
  if(openBtn && overlay){
    openBtn.addEventListener('click', ()=> overlay.classList.add('open'));
    overlay.addEventListener('click', e=>{ if(e.target === overlay) overlay.classList.remove('open'); });
  }
  if(closeBtn && overlay) closeBtn.addEventListener('click', ()=> overlay.classList.remove('open'));
  window.addEventListener('keydown', e=>{ if(e.key === 'Escape' && overlay) overlay.classList.remove('open'); });
  const quizBtns = qsa('.quiz button');
  quizBtns.forEach((btn, idx)=>{
    btn.addEventListener('click', ()=>{
      const correct = Number(btn.dataset.correct) === 1;
      const out = qs('#quizResult');
      if(out){
        out.textContent = correct ? 'Верно. Это правильный выбор.' : 'Пока нет. Проверьте ключевую идею ещё раз.';
        out.style.color = correct ? 'var(--ok)' : 'var(--danger)';
      }
    });
  });
  const genBtn = qs('#genBtn');
  if(genBtn){
    genBtn.addEventListener('click', ()=>{
      const out = qs('#genOut');
      if(out) out.innerHTML = `<strong>Похожее задание:</strong> ${TASK.similar}<br><strong>Ответ:</strong> ${TASK.similar_answer}`;
    });
  }
}

function drawArithmetic(svg, scale=1){
  const w = 520, h = 360;
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  const good = TASK.answer;
  svg.innerHTML = `
    <rect x="18" y="18" width="${w-36}" height="${h-36}" rx="24" fill="rgba(255,255,255,.02)" stroke="rgba(140,200,255,.18)"/>
    <text x="36" y="58" fill="#eef4ff" font-size="26" font-weight="700">Проверка по шагам</text>
    <text x="36" y="96" fill="#9eb1cc" font-size="16">Главная цель — не потерять знак и порядок действий.</text>

    <line x1="52" y1="210" x2="468" y2="210" stroke="#45668d" stroke-width="3"/>
    <line x1="90" y1="194" x2="90" y2="226" stroke="#45668d" stroke-width="3"/>
    <line x1="260" y1="194" x2="260" y2="226" stroke="#45668d" stroke-width="3"/>
    <line x1="430" y1="194" x2="430" y2="226" stroke="#45668d" stroke-width="3"/>
    <text x="82" y="250" fill="#9eb1cc" font-size="16">старт</text>
    <text x="244" y="250" fill="#9eb1cc" font-size="16">проверка</text>
    <text x="416" y="250" fill="#9eb1cc" font-size="16">ответ</text>

    <circle cx="${150+40*scale}" cy="160" r="${18*scale}" fill="rgba(255,143,143,.3)" stroke="#ff8f8f"/>
    <text x="${145+40*scale}" y="166" fill="#fff" font-size="${14*scale}">±</text>
    <text x="116" y="145" fill="#ffb3b3" font-size="15">опасное место: знак</text>

    <circle cx="${390-25*scale}" cy="160" r="${20*scale}" fill="rgba(163,230,163,.25)" stroke="#a3e6a3"/>
    <text x="${381-25*scale}" y="166" fill="#fff" font-size="${14*scale}">✓</text>
    <text x="320" y="145" fill="#c9f4c9" font-size="15">верная сборка результата</text>

    <text x="36" y="300" fill="#eef4ff" font-size="18">Ответ: ${good}</text>
  `;
}

function drawLogs(svg, scale=1){
  const w=520,h=360;
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.innerHTML = `
    <rect x="18" y="18" width="${w-36}" height="${h-36}" rx="24" fill="rgba(255,255,255,.02)" stroke="rgba(140,200,255,.18)"/>
    <text x="34" y="54" fill="#eef4ff" font-size="26" font-weight="700">Карта логарифмических правил</text>
    <text x="34" y="86" fill="#9eb1cc" font-size="16">Сначала назовите правило, потом применяйте его.</text>

    <rect x="40" y="120" width="${160*scale}" height="${76*scale}" rx="18" fill="rgba(140,200,255,.12)" stroke="#8cc8ff"/>
    <text x="56" y="152" fill="#eef4ff" font-size="${18*scale}">logₐ b + logₐ c</text>
    <text x="78" y="182" fill="#cde7ff" font-size="${17*scale}">= logₐ(bc)</text>

    <rect x="${230-20*scale}" y="120" width="${140*scale}" height="${76*scale}" rx="18" fill="rgba(255,209,102,.12)" stroke="#ffd166"/>
    <text x="${248-20*scale}" y="152" fill="#fff6d5" font-size="${17*scale}">logₐ(bᵐ)</text>
    <text x="${250-20*scale}" y="182" fill="#fff6d5" font-size="${17*scale}">= m·logₐb</text>

    <rect x="360" y="120" width="${120*scale}" height="${76*scale}" rx="18" fill="rgba(255,143,143,.12)" stroke="#ff8f8f"/>
    <text x="379" y="152" fill="#ffd9d9" font-size="${16*scale}">НЕ:</text>
    <text x="375" y="182" fill="#ffd9d9" font-size="${15*scale}">log(a+b)</text>

    <line x1="200" y1="158" x2="${230-20*scale}" y2="158" stroke="#8cc8ff" stroke-width="3" marker-end="url(#arrow)"/>
    <line x1="${370-20*scale}" y1="158" x2="360" y2="158" stroke="#ffd166" stroke-width="3" marker-end="url(#arrow)"/>

    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <polygon points="0,0 10,5 0,10" fill="#8cc8ff"></polygon>
      </marker>
    </defs>

    <text x="34" y="290" fill="#eef4ff" font-size="18">Ключ: проверьте, используется ли произведение, степень или переход к новому основанию.</text>
  `;
}

function drawTrig(svg, scale=1){
  const w=520,h=360,cx=260,cy=194,r=110*scale;
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.innerHTML = `
    <rect x="18" y="18" width="${w-36}" height="${h-36}" rx="24" fill="rgba(255,255,255,.02)" stroke="rgba(140,200,255,.18)"/>
    <text x="34" y="54" fill="#eef4ff" font-size="26" font-weight="700">Единичная окружность</text>
    <text x="34" y="86" fill="#9eb1cc" font-size="16">Смотрим четверть, знак и вторую серию решений.</text>

    <line x1="${cx-r-30}" y1="${cy}" x2="${cx+r+30}" y2="${cy}" stroke="#45668d" stroke-width="3"/>
    <line x1="${cx}" y1="${cy-r-30}" x2="${cx}" y2="${cy+r+30}" stroke="#45668d" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(140,200,255,.04)" stroke="#8cc8ff" stroke-width="3"/>
    <text x="${cx+r+16}" y="${cy+6}" fill="#9eb1cc" font-size="15">0</text>
    <text x="${cx-6}" y="${cy-r-18}" fill="#9eb1cc" font-size="15">π/2</text>
    <text x="${cx-r-28}" y="${cy+6}" fill="#9eb1cc" font-size="15">π</text>
    <text x="${cx-10}" y="${cy+r+28}" fill="#9eb1cc" font-size="15">3π/2</text>

    <path d="M ${cx} ${cy} L ${cx + r*Math.cos(Math.PI/6)} ${cy - r*Math.sin(Math.PI/6)}" stroke="#ffd166" stroke-width="4"/>
    <circle cx="${cx + r*Math.cos(Math.PI/6)}" cy="${cy - r*Math.sin(Math.PI/6)}" r="7" fill="#ffd166"/>
    <path d="M ${cx} ${cy} L ${cx + r*Math.cos(5*Math.PI/6)} ${cy - r*Math.sin(5*Math.PI/6)}" stroke="#a3e6a3" stroke-width="4"/>
    <circle cx="${cx + r*Math.cos(5*Math.PI/6)}" cy="${cy - r*Math.sin(5*Math.PI/6)}" r="7" fill="#a3e6a3"/>
    <text x="${cx + r*Math.cos(Math.PI/6)+10}" y="${cy - r*Math.sin(Math.PI/6)-10}" fill="#fff6d5" font-size="14">I</text>
    <text x="${cx + r*Math.cos(5*Math.PI/6)-24}" y="${cy - r*Math.sin(5*Math.PI/6)-10}" fill="#c9f4c9" font-size="14">II</text>

    <text x="34" y="318" fill="#eef4ff" font-size="18">Подсказка: одинаковый синус часто даёт две точки за период.</text>
  `;
}

function renderVisual(target){
  const zoom = Number(qs('#zoom')?.value || 1);
  if(TASK.topic === 'арифметика') drawArithmetic(target, zoom);
  else if(TASK.topic === 'логарифмы' || TASK.topic === 'logeq') drawLogs(target, zoom);
  else drawTrig(target, zoom);
}

function initVisuals(){
  const main = qs('#visual');
  const modal = qs('#visualModal');
  if(main) renderVisual(main);
  if(modal) renderVisual(modal);
  const z = qs('#zoom');
  if(z){
    z.addEventListener('input', ()=>{
      if(main) renderVisual(main);
      if(modal) renderVisual(modal);
      qs('#zoomValue').textContent = `${z.value}×`;
    });
  }
}

window.addEventListener('DOMContentLoaded', ()=>{
  initCommon();
  initVisuals();
});
