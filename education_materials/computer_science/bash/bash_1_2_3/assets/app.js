
const search = document.getElementById("search");
if (search) {
  const content = document.getElementById("content");
  const blocks = [...content.querySelectorAll(".card,.note,.terminal,.think-block")];

  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    blocks.forEach(b => {
      b.classList.remove("hidden");
      b.querySelectorAll("[data-original]").forEach(n => {
        n.innerHTML = n.dataset.original;
        delete n.dataset.original;
      });
      if (!q) return;
      if (!b.innerText.toLowerCase().includes(q)) {
        b.classList.add("hidden");
        return;
      }
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      b.querySelectorAll("h2,h3,p,li,code").forEach(n => {
        if (!n.innerText.toLowerCase().includes(q)) return;
        n.dataset.original = n.innerHTML;
        n.innerHTML = n.innerHTML.replace(new RegExp("(" + safe + ")", "gi"), "<mark>$1</mark>");
      });
    });
  });
}

(function(){
  let modal = document.getElementById("exerciseModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "exerciseModal";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="exerciseTitle">
        <div class="modal-head">
          <div class="modal-title" id="exerciseTitle">Упражнения</div>
          <button class="modal-close" type="button" aria-label="Закрыть">×</button>
        </div>
        <div class="modal-body">
          <div id="exercisePack" class="exercise-pack"></div>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  const title = modal.querySelector("#exerciseTitle");
  const pack = modal.querySelector("#exercisePack");
  const close = modal.querySelector(".modal-close");

  function norm(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[«»"'`]/g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*;\s*/g, ";")
      .replace(/\s*=\s*/g, "=");
  }

  function isCorrect(user, accepted) {
    const u = norm(user);
    return (accepted || []).some(a => {
      const x = norm(a);
      if (x.startsWith("contains:")) return u.includes(x.replace("contains:", "").trim());
      return u === x;
    });
  }

  function escapeText(s) {
    return String(s || "").replace(/[&<>"']/g, ch => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[ch]));
  }

  function renderExercise(ex, idx) {
    const item = document.createElement("section");
    item.className = "exercise-item";
    const code = ex.code ? `<div class="terminal exercise-code"><div class="term-head"><span>snippet</span><span>input</span></div><pre><code>${escapeText(ex.code)}</code></pre></div>` : "";
    item.innerHTML = `
      <h3>${idx + 1}. ${escapeText(ex.title)} <span class="exercise-level">${escapeText(ex.level)}</span></h3>
      <p class="exercise-task">${escapeText(ex.task)}</p>
      ${code}
      <textarea class="exercise-input" rows="2" placeholder="Введите ответ здесь..."></textarea>
      <div class="exercise-controls">
        <button type="button" data-action="check">Проверить</button>
        <button type="button" data-action="hint">Подсказка 1/3</button>
        <button type="button" data-action="answer">Показать ответ</button>
      </div>
      <div class="exercise-feedback"></div>
      <div class="exercise-hints"><ol></ol></div>
      <div class="exercise-answer"></div>
    `;

    const input = item.querySelector(".exercise-input");
    const feedback = item.querySelector(".exercise-feedback");
    const hints = item.querySelector(".exercise-hints");
    const hintsList = item.querySelector(".exercise-hints ol");
    const answer = item.querySelector(".exercise-answer");
    const hintBtn = item.querySelector('[data-action="hint"]');
    const answerBtn = item.querySelector('[data-action="answer"]');
    let hintCount = 0;

    item.querySelector('[data-action="check"]').addEventListener("click", () => {
      if (isCorrect(input.value, ex.accept)) {
        feedback.textContent = "OK: ответ засчитан.";
        feedback.className = "exercise-feedback ok";
        item.classList.add("done");
      } else {
        feedback.textContent = "Пока нет. Проверьте синтаксис, кавычки и пробелы. Можно открыть подсказку.";
        feedback.className = "exercise-feedback bad";
      }
    });

    hintBtn.addEventListener("click", () => {
      hintCount = Math.min(3, hintCount + 1);
      hints.classList.add("show");
      hintsList.innerHTML = (ex.hints || []).slice(0, hintCount).map(h => `<li>${escapeText(h)}</li>`).join("");
      hintBtn.textContent = hintCount < 3 ? `Подсказка ${hintCount + 1}/3` : "Все подсказки открыты";
    });

    answerBtn.addEventListener("click", () => {
      answer.classList.toggle("show");
      answer.textContent = ex.answer || "";
      answerBtn.textContent = answer.classList.contains("show") ? "Скрыть ответ" : "Показать ответ";
    });

    return item;
  }

  function openPack(btn) {
    let data = [];
    try {
      data = JSON.parse(btn.dataset.exercises || "[]");
    } catch(e) {
      data = [];
    }
    title.textContent = btn.dataset.title || "Упражнения";
    pack.innerHTML = "";
    data.forEach((ex, i) => pack.appendChild(renderExercise(ex, i)));
    modal.classList.add("open");
    close.focus();
  }

  function closeModal(){
    modal.classList.remove("open");
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".exercise-btn,.think-btn");
    if (btn) openPack(btn);
    if (e.target === modal) closeModal();
  });
  close.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });
})();


(function(){
  let tip = document.getElementById("termTip");
  if (!tip) {
    tip = document.createElement("div");
    tip.id = "termTip";
    tip.className = "term-tip";
    document.body.appendChild(tip);
  }

  function placeTip(target){
    const rect = target.getBoundingClientRect();
    const margin = 12;
    const desiredLeft = Math.min(window.innerWidth - 372, Math.max(margin, rect.left));
    let top = rect.bottom + 10;
    if (top + tip.offsetHeight > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - tip.offsetHeight - 10);
    }
    tip.style.left = desiredLeft + "px";
    tip.style.top = top + "px";
  }

  function showTip(target){
    const title = target.dataset.term || target.textContent.trim();
    const text = target.dataset.tip || "";
    tip.innerHTML = "<b>" + title.replace(/[&<>]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[s])) + "</b>" +
      text.replace(/[&<>]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]));
    tip.classList.add("show");
    placeTip(target);
  }

  function hideTip(){
    tip.classList.remove("show");
  }

  document.addEventListener("mouseover", e => {
    const t = e.target.closest(".term");
    if (t) showTip(t);
  });
  document.addEventListener("focusin", e => {
    const t = e.target.closest(".term");
    if (t) showTip(t);
  });
  document.addEventListener("mouseout", e => {
    if (e.target.closest(".term")) hideTip();
  });
  document.addEventListener("focusout", e => {
    if (e.target.closest(".term")) hideTip();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") hideTip();
  });
  window.addEventListener("scroll", hideTip, {passive:true});
})();


/* ===== Extended mini-course features ===== */
(function(){
  function norm(s){
    return String(s||"").trim().toLowerCase().replace(/[«»"'`]/g,"").replace(/\s+/g," ");
  }

  function markProgress(key){
    const raw = localStorage.getItem("bashMiniProgress") || "{}";
    const p = JSON.parse(raw);
    p[key] = true;
    localStorage.setItem("bashMiniProgress", JSON.stringify(p));
    renderProgress();
  }

  function renderProgress(){
    const raw = localStorage.getItem("bashMiniProgress") || "{}";
    const p = JSON.parse(raw);
    const keys = ["terminal","builder","debug","exam","cheat","flow","risks","projects"];
    const done = keys.filter(k => p[k]).length;
    document.querySelectorAll("[data-progress-fill]").forEach(el => el.style.width = Math.round(done / keys.length * 100) + "%");
    document.querySelectorAll("[data-progress-text]").forEach(el => el.textContent = `${done}/${keys.length} модулей активности`);
    document.querySelectorAll("[data-badge]").forEach(el => el.classList.toggle("on", !!p[el.dataset.badge]));
  }

  window.addEventListener("DOMContentLoaded", () => {
    renderProgress();
    const pageKey = document.body.dataset.pageKey;
    if (pageKey) markProgress("visit_" + pageKey);
  });

  // Pseudo terminal
  document.addEventListener("submit", e => {
    const form = e.target.closest("[data-terminal-form]");
    if (!form) return;
    e.preventDefault();
    const input = form.querySelector("input");
    const out = document.querySelector(form.dataset.output);
    const cmd = input.value.trim();
    const line = document.createElement("div");
    line.innerHTML = `<span class="prompt-green">$</span> ${cmd}`;
    out.appendChild(line);

    const result = document.createElement("div");
    const c = norm(cmd);
    if (c === "chmod +x script.sh") result.textContent = "ok: script.sh теперь можно запускать как ./script.sh";
    else if (c === "./script.sh") result.textContent = "Готово";
    else if (c === "bash script.sh") result.textContent = "Готово";
    else if (c === "echo $var") result.textContent = "warning: без кавычек значение может разбиться по пробелам";
    else if (c === "echo \"$var\"" || c === "echo ${var}") result.textContent = "ok: безопасный вывод переменной";
    else if (c === "set -euo pipefail") result.textContent = "ok: строгий режим включён";
    else if (c === "echo \"ошибка\" >&2" || c === "echo ошибка >&2") result.textContent = "stderr: Ошибка";
    else result.textContent = "подсказка: попробуйте chmod +x script.sh, ./script.sh, set -euo pipefail или echo \"$VAR\"";
    out.appendChild(result);
    input.value = "";
    out.scrollTop = out.scrollHeight;
    markProgress("terminal");
  });

  // Script builder
  document.addEventListener("click", e => {
    const piece = e.target.closest("[data-piece]");
    if (piece) {
      const target = document.querySelector(piece.dataset.target);
      const clone = piece.cloneNode(true);
      clone.removeAttribute("data-piece");
      clone.dataset.orderedPiece = piece.dataset.value;
      clone.addEventListener("click", () => clone.remove());
      target.appendChild(clone);
    }

    const check = e.target.closest("[data-check-order]");
    if (check) {
      const target = document.querySelector(check.dataset.target);
      const feedback = document.querySelector(check.dataset.feedback);
      const got = [...target.querySelectorAll("[data-ordered-piece]")].map(x => x.dataset.orderedPiece).join("|");
      const expected = check.dataset.expected;
      if (got === expected) {
        feedback.textContent = "OK: скрипт собран в правильном порядке.";
        feedback.className = "feedback ok";
        markProgress("builder");
      } else {
        feedback.textContent = "Пока нет. Подумайте: shebang должен быть первым, strict mode — перед логикой, main \"$@\" — после объявления функции.";
        feedback.className = "feedback bad";
      }
    }

    const clear = e.target.closest("[data-clear-order]");
    if (clear) {
      document.querySelector(clear.dataset.target).innerHTML = "";
    }
  });

  // Debug lab
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-debug-check]");
    if (!btn) return;
    const box = document.querySelector(btn.dataset.input);
    const feedback = document.querySelector(btn.dataset.feedback);
    const ans = norm(box.value);
    const need = btn.dataset.need.split("|").map(norm);
    if (need.every(x => ans.includes(x))) {
      feedback.textContent = "OK: ошибка найдена и исправление похоже на правильное.";
      feedback.className = "feedback ok";
      markProgress("debug");
    } else {
      feedback.textContent = "Пока нет. Найдите опасное место и предложите безопасный вариант.";
      feedback.className = "feedback bad";
    }
  });

  // Multiple choice
  document.addEventListener("click", e => {
    const opt = e.target.closest("[data-option]");
    if (!opt) return;
    const group = opt.closest(".options");
    [...group.querySelectorAll("[data-option]")].forEach(o => o.classList.remove("correct","wrong"));
    if (opt.dataset.correct === "true") {
      opt.classList.add("correct");
      markProgress(opt.dataset.progress || "exam");
    } else {
      opt.classList.add("wrong");
    }
    const fb = group.parentElement.querySelector(".feedback");
    if (fb) {
      fb.textContent = opt.dataset.explain || "";
      fb.className = "feedback " + (opt.dataset.correct === "true" ? "ok" : "bad");
    }
  });

  // Flow visualization
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-flow]");
    if (!btn) return;
    const mode = btn.dataset.flow;
    document.querySelectorAll(".flow-node").forEach(n => n.classList.remove("active"));
    document.querySelectorAll(`[data-flow-node="${mode}"]`).forEach(n => n.classList.add("active"));
    const text = document.querySelector("[data-flow-text]");
    if (mode === "stdout") text.textContent = "stdout — нормальные данные: их можно сохранить в out.log или передать дальше по пайплайну.";
    if (mode === "stderr") text.textContent = "stderr — диагностика и ошибки: их удобно отделять в err.log.";
    if (mode === "both") text.textContent = "Команда ./script.sh > out.log 2> err.log разделяет нормальный вывод и ошибки по разным файлам.";
    markProgress("flow");
  });

  // Project checker
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-project-check]");
    if (!btn) return;
    const input = document.querySelector(btn.dataset.input).value;
    const fb = document.querySelector(btn.dataset.feedback);
    const n = norm(input);
    const req = btn.dataset.require.split("|").map(norm);
    if (req.every(x => n.includes(x))) {
      fb.textContent = "OK: проект засчитан. Решение содержит ключевые элементы.";
      fb.className = "feedback ok";
      markProgress("projects");
    } else {
      fb.textContent = "Пока не хватает одного из ключевых элементов: " + btn.dataset.hint;
      fb.className = "feedback bad";
    }
  });

  // Cheat progress
  document.addEventListener("click", e => {
    if (e.target.closest("[data-cheat-done]")) markProgress("cheat");
    if (e.target.closest("[data-risk-done]")) markProgress("risks");
  });
})();


/* ===== Module 3 interactions ===== */
(function(){
  function norm(s){return String(s||"").trim().toLowerCase().replace(/[«»"'`]/g,"").replace(/\s+/g," ").replace(/\s*=\s*/g,"=");}
  function markProgress(key){try{const p=JSON.parse(localStorage.getItem("bashMiniProgress")||"{}");p[key]=true;localStorage.setItem("bashMiniProgress",JSON.stringify(p));}catch(e){}}
  function ok(user, accepted){const u=norm(user);return (accepted||[]).some(a=>{const x=norm(a);return x.startsWith("contains:")?u.includes(x.replace("contains:","").trim()):u===x;});}
  function esc(s){return String(s||"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));}

  let modal=document.getElementById("exerciseModal");
  if(!modal){modal=document.createElement("div");modal.id="exerciseModal";modal.className="modal";modal.innerHTML=`<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="exerciseTitle"><div class="modal-head"><div class="modal-title" id="exerciseTitle">Упражнения</div><button class="modal-close" type="button" aria-label="Закрыть">×</button></div><div class="modal-body"><div id="exercisePack" class="exercise-pack"></div></div></div>`;document.body.appendChild(modal);}
  const title=modal.querySelector("#exerciseTitle"), pack=modal.querySelector("#exercisePack"), close=modal.querySelector(".modal-close");

  function renderExercise(ex,i){
    const item=document.createElement("section");item.className="exercise-item";
    const code=ex.code?`<div class="terminal exercise-code"><div class="term-head"><span>snippet</span><span>input</span></div><pre><code>${esc(ex.code)}</code></pre></div>`:"";
    item.innerHTML=`<h3>${i+1}. ${esc(ex.title)} <span class="exercise-level">${esc(ex.level)}</span></h3><p class="exercise-task">${esc(ex.task)}</p>${code}<textarea class="exercise-input" rows="2" placeholder="Введите ответ здесь..."></textarea><div class="exercise-controls"><button type="button" data-action="check">Проверить</button><button type="button" data-action="hint">Подсказка 1/3</button><button type="button" data-action="answer">Показать ответ</button></div><div class="exercise-feedback"></div><div class="exercise-hints"><ol></ol></div><div class="exercise-answer"></div>`;
    const input=item.querySelector(".exercise-input"), fb=item.querySelector(".exercise-feedback"), hints=item.querySelector(".exercise-hints"), list=item.querySelector(".exercise-hints ol"), answer=item.querySelector(".exercise-answer"), hintBtn=item.querySelector('[data-action="hint"]'), answerBtn=item.querySelector('[data-action="answer"]');
    let hc=0;
    item.querySelector('[data-action="check"]').addEventListener("click",()=>{if(ok(input.value,ex.accept)){fb.textContent="OK: ответ засчитан.";fb.className="exercise-feedback ok";item.classList.add("done");if(ex.progress)markProgress(ex.progress);}else{fb.textContent="Пока нет. Проверьте кавычки, пробелы и ключевой оператор.";fb.className="exercise-feedback bad";}});
    hintBtn.addEventListener("click",()=>{hc=Math.min(3,hc+1);hints.classList.add("show");list.innerHTML=(ex.hints||[]).slice(0,hc).map(h=>`<li>${esc(h)}</li>`).join("");hintBtn.textContent=hc<3?`Подсказка ${hc+1}/3`:"Все подсказки открыты";});
    answerBtn.addEventListener("click",()=>{answer.classList.toggle("show");answer.textContent=ex.answer||"";answerBtn.textContent=answer.classList.contains("show")?"Скрыть ответ":"Показать ответ";});
    return item;
  }
  function openPack(btn){let data=[];try{data=JSON.parse(btn.dataset.exercises||"[]");}catch(e){} title.textContent=btn.dataset.title||"Упражнения";pack.innerHTML="";data.forEach((ex,i)=>pack.appendChild(renderExercise(ex,i)));modal.classList.add("open");close.focus();}
  function closeModal(){modal.classList.remove("open");}
  document.addEventListener("click",e=>{const btn=e.target.closest(".exercise-btn,.think-btn");if(btn)openPack(btn);if(e.target===modal)closeModal();});
  close.addEventListener("click",closeModal);document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modal.classList.contains("open"))closeModal();});

  let tip=document.getElementById("termTip");if(!tip){tip=document.createElement("div");tip.id="termTip";tip.className="term-tip";document.body.appendChild(tip);}
  function showTip(t){tip.innerHTML="<b>"+esc(t.dataset.term||t.textContent.trim())+"</b>"+esc(t.dataset.tip||"");tip.classList.add("show");const r=t.getBoundingClientRect();tip.style.left=Math.min(window.innerWidth-372,Math.max(12,r.left))+"px";tip.style.top=(r.bottom+10)+"px";}
  function hideTip(){tip.classList.remove("show");}
  document.addEventListener("mouseover",e=>{const t=e.target.closest(".term");if(t)showTip(t);});document.addEventListener("focusin",e=>{const t=e.target.closest(".term");if(t)showTip(t);});document.addEventListener("mouseout",e=>{if(e.target.closest(".term"))hideTip();});document.addEventListener("focusout",e=>{if(e.target.closest(".term"))hideTip();});window.addEventListener("scroll",hideTip,{passive:true});

  document.addEventListener("submit",e=>{const form=e.target.closest("[data-m3-terminal-form]");if(!form)return;e.preventDefault();const input=form.querySelector("input"),out=document.querySelector(form.dataset.output),cmd=input.value.trim();const line=document.createElement("div");line.innerHTML=`<span class="prompt-green">$</span> ${esc(cmd)}`;out.appendChild(line);const res=document.createElement("div"),c=norm(cmd);if(c==='[[ -f $file ]]')res.textContent="status: 0, если file существует и является обычным файлом";else if(c==='[[ -d $dir ]]')res.textContent="status: 0, если dir существует и является директорией";else if(c==='[[ -r $file ]]')res.textContent="status: 0, если file доступен для чтения";else if(c==='find . -type f -name *.txt')res.textContent="./notes.txt\\n./docs/readme.txt";else if(c==='echo rm -rf $dir')res.textContent="dry-run: rm -rf ./tmp";else res.textContent='подсказка: попробуйте [[ -f "$file" ]], [[ -d "$dir" ]], find . -type f -name "*.txt" или echo rm -rf "$dir"';out.appendChild(res);input.value="";out.scrollTop=out.scrollHeight;});

  document.addEventListener("click",e=>{const btn=e.target.closest("[data-m3-check]");if(!btn)return;const input=document.querySelector(btn.dataset.input).value,fb=document.querySelector(btn.dataset.feedback),n=norm(input),req=btn.dataset.require.split("|").map(norm);if(req.every(x=>n.includes(x))){fb.textContent="OK: решение содержит ключевые элементы.";fb.className="feedback ok";if(btn.dataset.progress)markProgress(btn.dataset.progress);}else{fb.textContent="Пока не хватает одного из элементов: "+(btn.dataset.hint||"проверьте шаблон из теории.");fb.className="feedback bad";}});
})();
