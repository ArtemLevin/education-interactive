
const searchInput=document.querySelector('#search');
if(searchInput){
  const cards=[...document.querySelectorAll('.task-card')];
  const empty=document.querySelector('.no-results');
  searchInput.addEventListener('input',()=>{
    const q=searchInput.value.trim().toLowerCase(); let shown=0;
    cards.forEach(card=>{
      const ok=card.textContent.toLowerCase().includes(q);
      card.style.display=ok?'block':'none';
      if(ok) shown++;
    });
    if(empty) empty.style.display=shown?'none':'block';
  });
}

(function initDrawingPanels(){
  const title=document.querySelector('.task-title');
  const paper=document.querySelector('.task-page .paper');
  if(!title || !paper || !window.taskDrawings) return;

  const m=(title.textContent||'').match(/(\d+)/);
  if(!m) return;

  const n=Number(m[1]);
  const data=window.taskDrawings[n];
  if(!data || !data.svg) return;

  const wrapper=document.createElement('div');
  wrapper.className='task-layout';
  paper.parentNode.insertBefore(wrapper,paper);
  wrapper.appendChild(paper);

  const aside=document.createElement('aside');
  aside.className='drawing-panel';
  aside.innerHTML=`
    <h3>Чертёж</h3>
    <p>${data.caption||'Корректный схематический рисунок к условию задачи.'}</p>
    <a href="#" class="drawing-preview" aria-label="Открыть чертёж в модальном окне">${data.svg}</a>
    <button type="button" class="open-drawing">Открыть крупно</button>
    <div class="drawing-note">Схема отражает условия задачи. При необходимости не все длины выполнены в масштабе, но взаимное расположение объектов и ключевые отношения сохранены.</div>
  `;
  wrapper.appendChild(aside);

  const modal=document.createElement('div');
  modal.className='modal-backdrop';
  modal.setAttribute('aria-hidden','true');
  modal.innerHTML=`
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Чертёж к задаче ${n}">
      <button type="button" class="modal-close" aria-label="Закрыть">×</button>
      <div class="modal-head">
        <h3>Чертёж к задаче ${n}</h3>
        <p>${data.caption||''}</p>
      </div>

      <div class="editor-toolbar" aria-label="Редактор чертежа">
        <button type="button" class="toggle-editor">Включить редактор</button>
        <button type="button" class="reset-drawing">Сбросить чертёж</button>
        <button type="button" class="rotate-left">↺ −15°</button>
        <button type="button" class="rotate-right">↻ +15°</button>
        <label>Поворот
          <input class="rotate-range" type="range" min="-180" max="180" value="0" step="1">
        </label>
        <span class="hint">
          Включите редактор, затем кликните по элементу чертежа. Элемент можно двигать мышью; выбранный элемент можно поворачивать кнопками или ползунком. Для прямых линий появляются две ручки на концах.
        </span>
      </div>
      <div class="editor-warning">
        Свободное редактирование может нарушить геометрическую корректность. Кнопка «Сбросить чертёж» возвращает проверенную исходную схему.
      </div>

      <div class="modal-svg">${data.svg}</div>
    </div>`;

  document.body.appendChild(modal);

  const editor=setupFreeSvgEditor(modal, data.svg);

  const open=()=>{
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    editor.refresh();
  };
  const close=()=>{
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  };

  aside.querySelector('.drawing-preview').addEventListener('click',e=>{e.preventDefault(); open();});
  aside.querySelector('.open-drawing').addEventListener('click',open);
  modal.querySelector('.modal-close').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal) close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && modal.classList.contains('open')) close();});
})();

function setupFreeSvgEditor(modal, originalSvg){
  const box=modal.querySelector('.modal-svg');
  const toggle=modal.querySelector('.toggle-editor');
  const reset=modal.querySelector('.reset-drawing');
  const rotateLeft=modal.querySelector('.rotate-left');
  const rotateRight=modal.querySelector('.rotate-right');
  const rotateRange=modal.querySelector('.rotate-range');

  let enabled=false;
  let selected=null;
  let drag=null;
  let handlesGroup=null;

  function getSvg(){ return box.querySelector('svg'); }

  function ensureLayer(){
    const s=getSvg();
    if(!s) return null;
    let layer=s.querySelector('g.editor-ui-layer');
    if(!layer){
      layer=document.createElementNS('http://www.w3.org/2000/svg','g');
      layer.setAttribute('class','editor-ui-layer');
      s.appendChild(layer);
    }
    handlesGroup=layer;
    return layer;
  }

  function svgPoint(evt){
    const s=getSvg();
    const pt=s.createSVGPoint();
    pt.x=evt.clientX;
    pt.y=evt.clientY;
    const matrix=s.getScreenCTM();
    if(!matrix) return {x:0,y:0};
    return pt.matrixTransform(matrix.inverse());
  }

  function editableElement(target){
    const s=getSvg();
    let el=target;
    while(el && el!==s){
      if(el.classList && el.classList.contains('editor-handle')) return null;
      const tag=(el.tagName||'').toLowerCase();
      if(['line','circle','ellipse','path','polygon','polyline','text','rect'].includes(tag)){
        return el;
      }
      el=el.parentNode;
    }
    return null;
  }

  function state(el){
    return {
      x:Number(el.dataset.tx || 0),
      y:Number(el.dataset.ty || 0),
      a:Number(el.dataset.angle || 0)
    };
  }

  function rawCenter(el){
    const tag=el.tagName.toLowerCase();
    if(tag==='line'){
      return {
        x:(Number(el.getAttribute('x1'))+Number(el.getAttribute('x2')))/2,
        y:(Number(el.getAttribute('y1'))+Number(el.getAttribute('y2')))/2
      };
    }
    if(tag==='circle'){
      return {x:Number(el.getAttribute('cx')), y:Number(el.getAttribute('cy'))};
    }
    if(tag==='ellipse'){
      return {x:Number(el.getAttribute('cx')), y:Number(el.getAttribute('cy'))};
    }
    if(tag==='text'){
      return {x:Number(el.getAttribute('x')||0), y:Number(el.getAttribute('y')||0)};
    }
    try{
      const b=el.getBBox();
      return {x:b.x+b.width/2,y:b.y+b.height/2};
    }catch(e){
      return {x:180,y:130};
    }
  }

  function visualCenter(el){
    const c=rawCenter(el);
    const st=state(el);
    return {x:c.x+st.x, y:c.y+st.y};
  }

  function apply(el){
    const st=state(el);
    const c=rawCenter(el);
    const parts=[];
    if(st.x || st.y) parts.push(`translate(${st.x} ${st.y})`);
    if(st.a) parts.push(`rotate(${st.a} ${c.x} ${c.y})`);
    el.setAttribute('transform', parts.join(' '));
  }

  function clearSelection(){
    if(selected) selected.classList.remove('editable-selected');
    selected=null;
    rotateRange.value=0;
    clearHandles();
  }

  function clearHandles(){
    const layer=ensureLayer();
    if(layer) layer.innerHTML='';
  }

  function select(el){
    if(!enabled || !el) return;
    clearSelection();
    selected=el;
    selected.classList.add('editable-selected');
    rotateRange.value=Number(selected.dataset.angle || 0);
    drawHandles();
  }

  function drawHandles(){
    clearHandles();
    if(!selected) return;
    const layer=ensureLayer();
    const tag=selected.tagName.toLowerCase();
    if(tag==='line'){
      ['1','2'].forEach(idx=>{
        const h=document.createElementNS('http://www.w3.org/2000/svg','circle');
        h.setAttribute('class','editor-handle');
        h.setAttribute('r','6');
        h.dataset.endpoint=idx;
        positionLineHandle(h);
        layer.appendChild(h);
      });
    }else{
      const c=visualCenter(selected);
      const h=document.createElementNS('http://www.w3.org/2000/svg','circle');
      h.setAttribute('class','editor-handle');
      h.setAttribute('r','6');
      h.dataset.movehandle='1';
      h.setAttribute('cx', c.x);
      h.setAttribute('cy', c.y);
      layer.appendChild(h);
    }
  }

  function positionLineHandle(h){
    if(!selected || selected.tagName.toLowerCase()!=='line') return;
    const idx=h.dataset.endpoint;
    const st=state(selected);
    h.setAttribute('cx', Number(selected.getAttribute('x'+idx))+st.x);
    h.setAttribute('cy', Number(selected.getAttribute('y'+idx))+st.y);
  }

  function refreshHandles(){
    if(!selected) return;
    drawHandles();
  }

  function setRotation(angle){
    if(!selected) return;
    selected.dataset.angle=String(angle);
    apply(selected);
    rotateRange.value=angle;
    refreshHandles();
  }

  function rotateBy(delta){
    if(!selected) return;
    let a=Number(selected.dataset.angle || 0)+delta;
    if(a>180) a-=360;
    if(a<-180) a+=360;
    setRotation(a);
  }

  function startDrag(evt){
    if(!enabled) return;

    const handle = evt.target.classList && evt.target.classList.contains('editor-handle') ? evt.target : null;
    if(handle && selected){
      evt.preventDefault();
      evt.stopPropagation();
      const p=svgPoint(evt);
      if(handle.dataset.endpoint){
        drag={type:'endpoint', endpoint:handle.dataset.endpoint, start:p};
      }else{
        const st=state(selected);
        drag={type:'move', el:selected, start:p, x:st.x, y:st.y};
      }
      try{ evt.target.setPointerCapture(evt.pointerId); }catch(e){}
      return;
    }

    const el=editableElement(evt.target);
    if(!el) return;
    evt.preventDefault();
    evt.stopPropagation();
    select(el);
    const p=svgPoint(evt);
    const st=state(el);
    drag={type:'move', el, start:p, x:st.x, y:st.y};
    try{ el.setPointerCapture(evt.pointerId); }catch(e){}
  }

  function moveDrag(evt){
    if(!enabled || !drag) return;
    evt.preventDefault();
    const p=svgPoint(evt);

    if(drag.type==='move'){
      drag.el.dataset.tx=String(drag.x + p.x - drag.start.x);
      drag.el.dataset.ty=String(drag.y + p.y - drag.start.y);
      apply(drag.el);
      refreshHandles();
      return;
    }

    if(drag.type==='endpoint' && selected && selected.tagName.toLowerCase()==='line'){
      const st=state(selected);
      const idx=drag.endpoint;
      selected.setAttribute('x'+idx, String(p.x-st.x));
      selected.setAttribute('y'+idx, String(p.y-st.y));
      apply(selected);
      refreshHandles();
    }
  }

  function endDrag(){
    drag=null;
  }

  function bind(){
    const s=getSvg();
    if(!s || s.dataset.editorBound==='1') return;
    s.dataset.editorBound='1';
    s.addEventListener('pointerdown', startDrag);
    s.addEventListener('pointermove', moveDrag);
    s.addEventListener('pointerup', endDrag);
    s.addEventListener('pointercancel', endDrag);
    s.addEventListener('click', e=>{
      if(!enabled) return;
      const el=editableElement(e.target);
      if(!el && !(e.target.classList && e.target.classList.contains('editor-handle'))) clearSelection();
    });
  }

  toggle.addEventListener('click',()=>{
    enabled=!enabled;
    box.classList.toggle('editor-on', enabled);
    toggle.classList.toggle('active', enabled);
    toggle.textContent=enabled?'Редактор включён':'Включить редактор';
    bind();
    if(!enabled) clearSelection();
  });

  reset.addEventListener('click',()=>{
    box.innerHTML=originalSvg;
    enabled=false;
    toggle.classList.remove('active');
    toggle.textContent='Включить редактор';
    box.classList.remove('editor-on');
    selected=null;
    drag=null;
    rotateRange.value=0;
    bind();
  });

  rotateLeft.addEventListener('click',()=>rotateBy(-15));
  rotateRight.addEventListener('click',()=>rotateBy(15));
  rotateRange.addEventListener('input',()=>setRotation(Number(rotateRange.value)));

  bind();

  return {refresh: bind};
}
