
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

(function initSplitEditorPanel(){
  const title=document.querySelector('.task-title');
  const paper=document.querySelector('.task-page .paper');
  if(!title || !paper || !window.taskDrawings) return;

  const m=(title.textContent||'').match(/(\d+)/);
  if(!m) return;

  const n=Number(m[1]);
  const data=window.taskDrawings[n];
  if(!data || !data.svg) return;

  const wrapper=document.createElement('div');
  wrapper.className='task-layout split-editor-layout';
  paper.parentNode.insertBefore(wrapper,paper);
  wrapper.appendChild(paper);

  const aside=document.createElement('aside');
  aside.className='drawing-panel split-editor-panel';
  aside.innerHTML=`
    <div class="split-editor-head">
      <div>
        <h3>Чертёж к задаче ${n}</h3>
        <p>${data.caption||'Корректный схематический рисунок к условию задачи.'}</p>
      </div>
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
        Включите редактор и выберите элемент. На пустом месте можно зажать левую кнопку и протянуть рамку выделения. Выделенные элементы можно двигать группой; колесо меняет размер выбранного элемента.
      </span>
    </div>

    <div class="editor-warning">
      Свободное редактирование может нарушить геометрическую корректность. Кнопка «Сбросить чертёж» возвращает проверенную исходную схему.
    </div>

    <div class="modal-svg split-editor-svg">${data.svg}</div>
  `;
  wrapper.appendChild(aside);

  const editor=setupFreeSvgEditor(aside, data.svg);
  editor.refresh();
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
  let selectedItems=[];
  let drag=null;
  let selectionRect=null;
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

  
function allEditableElements(){
    const s=getSvg();
    if(!s) return [];
    return [...s.querySelectorAll('line,circle,ellipse,path,polygon,polyline,text,rect')]
      .filter(el=>{
        if(el.closest && el.closest('.editor-ui-layer')) return false;
        if(el.classList && el.classList.contains('editor-bg')) return false;
        if(el.classList && el.classList.contains('editor-selection-rect')) return false;
        return true;
      });
  }

  function screenSelectionBox(a,b){
    return {
      x:Math.min(a.x,b.x),
      y:Math.min(a.y,b.y),
      width:Math.abs(b.x-a.x),
      height:Math.abs(b.y-a.y)
    };
  }

  function intersects(a,b){
    return a && b &&
      a.x <= b.x + b.width &&
      a.x + a.width >= b.x &&
      a.y <= b.y + b.height &&
      a.y + a.height >= b.y;
  }

  function elementScreenBox(el){
    try{
      const r=el.getBoundingClientRect();
      return {x:r.left, y:r.top, width:r.width, height:r.height};
    }catch(e){
      return null;
    }
  }

  function selectionBoxFromDrag(start, current){
    return {
      x:Math.min(start.x,current.x),
      y:Math.min(start.y,current.y),
      width:Math.abs(current.x-start.x),
      height:Math.abs(current.y-start.y)
    };
  }

  function setRectAttrs(rect, b){
    rect.setAttribute('x', b.x);
    rect.setAttribute('y', b.y);
    rect.setAttribute('width', b.width);
    rect.setAttribute('height', b.height);
  }

  function selectMany(items){
    clearSelection();
    selectedItems=items.filter(Boolean);
    selectedItems.forEach(el=>el.classList.add('editable-selected'));
    selected=selectedItems[0] || null;
    rotateRange.value=selected ? Number(selected.dataset.angle || 0) : 0;
    drawHandles();
  }

  function moveGroupBy(dx,dy){
    if(!selectedItems.length) return;
    selectedItems.forEach(el=>{
      const st=state(el);
      const startX=Number(el.dataset.dragStartX || st.x);
      const startY=Number(el.dataset.dragStartY || st.y);
      el.dataset.tx=String(startX + dx);
      el.dataset.ty=String(startY + dy);
      apply(el);
    });
    refreshHandles();
  }

  function ensureBackgroundRect(){
    const s=getSvg();
    if(!s || s.querySelector('rect.editor-bg')) return;
    const vb=(s.getAttribute('viewBox') || '0 0 360 260').trim().split(/\s+/).map(Number);
    const bg=document.createElementNS('http://www.w3.org/2000/svg','rect');
    bg.setAttribute('class','editor-bg');
    bg.setAttribute('x', vb[0] || 0);
    bg.setAttribute('y', vb[1] || 0);
    bg.setAttribute('width', vb[2] || 360);
    bg.setAttribute('height', vb[3] || 260);
    bg.setAttribute('fill','transparent');
    bg.setAttribute('pointer-events','all');
    s.insertBefore(bg, s.firstChild);
  }

    function state(el){
    return {
      x:Number(el.dataset.tx || 0),
      y:Number(el.dataset.ty || 0),
      a:Number(el.dataset.angle || 0),
      k:Number(el.dataset.scale || 1)
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
    if(st.k && st.k !== 1){
      // Масштабируем выбранный SVG-элемент вокруг его собственного центра.
      // Так подпись, линия, окружность или фигура растёт из центра, а не «улетает» в сторону.
      parts.push(`translate(${c.x} ${c.y}) scale(${st.k}) translate(${-c.x} ${-c.y})`);
    }
    el.setAttribute('transform', parts.join(' '));
  }

  function clearSelection(){
    selectedItems.forEach(el=>el.classList.remove('editable-selected'));
    if(selected && !selectedItems.includes(selected)) selected.classList.remove('editable-selected');
    selected=null;
    selectedItems=[];
    rotateRange.value=0;
    clearHandles();
  }

  function clearHandles(){
    const layer=ensureLayer();
    if(layer) layer.innerHTML='';
  }

  function select(el){
    if(!enabled || !el) return;
    selectMany([el]);
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

  function scaleSelectedBy(factor){
    if(!selected) return;
    const st=state(selected);
    const next=Math.max(0.2, Math.min(5, st.k*factor));
    selected.dataset.scale=String(next);
    apply(selected);
    refreshHandles();
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
        selectedItems.forEach(el=>{
          const st=state(el);
          el.dataset.dragStartX=String(st.x);
          el.dataset.dragStartY=String(st.y);
        });
        drag={type:'moveGroup', start:p};
      }
      try{ evt.target.setPointerCapture(evt.pointerId); }catch(e){}
      return;
    }

    const el=editableElement(evt.target);
    if(el){
      evt.preventDefault();
      evt.stopPropagation();
      if(!selectedItems.includes(el)) select(el);
      selectedItems.forEach(item=>{
        const st=state(item);
        item.dataset.dragStartX=String(st.x);
        item.dataset.dragStartY=String(st.y);
      });
      const p=svgPoint(evt);
      drag={type:'moveGroup', start:p};
      try{ el.setPointerCapture(evt.pointerId); }catch(e){}
      return;
    }

    // Рамочное выделение: зажимаем левую кнопку на пустом месте SVG и тянем рамку.
    if(evt.target === getSvg() || (evt.target.classList && evt.target.classList.contains('editor-bg'))){
      evt.preventDefault();
      const p=svgPoint(evt);
      clearSelection();
      const layer=ensureLayer();
      selectionRect=document.createElementNS('http://www.w3.org/2000/svg','rect');
      selectionRect.setAttribute('class','editor-selection-rect');
      selectionRect.setAttribute('x',p.x);
      selectionRect.setAttribute('y',p.y);
      selectionRect.setAttribute('width',0);
      selectionRect.setAttribute('height',0);
      layer.appendChild(selectionRect);
      drag={
        type:'boxSelect',
        start:p,
        current:p,
        startClient:{x:evt.clientX,y:evt.clientY},
        currentClient:{x:evt.clientX,y:evt.clientY}
      };
      try{ evt.target.setPointerCapture(evt.pointerId); }catch(e){}
    }
  }

  function moveDrag(evt){
    if(!enabled || !drag) return;
    evt.preventDefault();
    const p=svgPoint(evt);

    if(drag.type==='moveGroup'){
      moveGroupBy(p.x-drag.start.x, p.y-drag.start.y);
      return;
    }

    if(drag.type==='boxSelect'){
      drag.current=p;
      drag.currentClient={x:evt.clientX,y:evt.clientY};
      if(selectionRect) setRectAttrs(selectionRect, selectionBoxFromDrag(drag.start, p));
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
    if(drag && drag.type==='boxSelect'){
      const svgBox=selectionBoxFromDrag(drag.start, drag.current || drag.start);
      const screenBox=screenSelectionBox(drag.startClient, drag.currentClient || drag.startClient);
      if(selectionRect) selectionRect.remove();
      selectionRect=null;
      if(screenBox.width>3 && screenBox.height>3){
        const items=allEditableElements().filter(el=>intersects(screenBox, elementScreenBox(el)));
        selectMany(items);
      }
    }
    drag=null;
  }

  function onWheel(evt){
    if(!enabled || !selected) return;
    // Масштабируем только выбранный элемент и только когда курсор находится над SVG.
    evt.preventDefault();
    const factor = evt.deltaY < 0 ? 1.08 : 1/1.08;
    scaleSelectedBy(factor);
  }

  function bind(){
    const s=getSvg();
    if(!s) return;
    ensureBackgroundRect();
    if(s.dataset.editorBound==='1') return;
    s.dataset.editorBound='1';
    s.addEventListener('pointerdown', startDrag);
    s.addEventListener('pointermove', moveDrag);
    s.addEventListener('pointerup', endDrag);
    s.addEventListener('pointercancel', endDrag);
    window.addEventListener('pointermove', moveDrag);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    s.addEventListener('wheel', onWheel, {passive:false});
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
