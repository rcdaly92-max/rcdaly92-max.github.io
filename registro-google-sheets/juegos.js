/* Registro formativo UTE. Mantener la hoja privada. */
(function(){
'use strict';
const config=window.UTE_REGISTRO_URL;
const kind=location.pathname.includes('clase-2-vida-util')?'vida':location.pathname.includes('actividad-analisis-riesgo-sanitario')?'riesgo':'definiciones';
let seen=new Set(),attempt=null,delivered=false,processing=false;
const answers=[];
const $=(s)=>document.querySelector(s);
function safeId(){return 'UTE-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12)}
function record(q,selected,expected,topic,id){
  if(!q||!expected)return;
  const key=id||kind+'-'+answers.length;
  if(seen.has(key))return;
  seen.add(key);
  answers.push({question_id:key,question:String(q).slice(0,450),selected:String(selected),expected:String(expected),is_correct:String(selected)===String(expected),topic:String(topic)});
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  try{
    if(kind==='vida'){
      if(b.id==='begin'||b.id==='again'){answers.length=0;seen.clear();attempt=null;delivered=false;}
      if(b.closest('#choices')&&b.classList.contains('choice')){
        const item=order[idx],chosen=b.textContent.trim(),expect=C[item.a];
        record(item.q+' — '+item.ctx,chosen,expect,'Clasificación según vida útil','VIDA-'+String(idx+1).padStart(2,'0'));
      }
    }else if(kind==='riesgo'){
      if(b.id==='start'||b.id==='again'){answers.length=0;seen.clear();attempt=null;delivered=false;}
      if(b.closest('#options')&&b.classList.contains('option')){
        const caseItem=cases[index],q=getQuestion(),chosen=b.textContent.trim(),expected=q.choices[q.correct];
        record(caseItem.name+' — '+q.text,chosen,expected,'Análisis del riesgo sanitario','RIESGO-'+(index+1)+'-'+(stage+1));
      }
    }else{
      if(b.id==='resetBtn'||b.id==='retryResults'){answers.length=0;seen.clear();attempt=null;delivered=false;}
      if(b.hasAttribute('data-quiz')){
        const type=b.dataset.quiz,ix=state[type].idx,item=(type==='cases'?conceptCases:bpmCases)[ix];
        record(item.q,b.dataset.answer,item.a,stages[state.stage].t,'DEF-'+type+'-'+(ix+1));
      } else if(b.hasAttribute('data-truth')){
        const ix=state.truth.idx,item=truths[ix],selected=b.dataset.truth==='true'?'Verdadero':'Falso';
        record(item.q,selected,item.a?'Verdadero':'Falso','Verdadero o falso','DEF-VF-'+(ix+1));
      } else if(b.hasAttribute('data-route')){
        const ix=state.route.idx,expected=chain[ix]?.id||'';
        record('¿Qué etapa sigue en la cadena alimentaria?',b.dataset.route,expected,'Cadena alimentaria','DEF-RUTA-'+(ix+1));
      } else if(b.dataset.pair==='def'&&state.pair.selectedTerm){
        const term=state.pair.selectedTerm;
        record('Asociar concepto: '+term,b.dataset.id,term,'Definiciones básicas','DEF-PAR-'+term);
      }
    }
  }catch(err){console.warn('No se pudo registrar una respuesta localmente',err);}
},true);
function finalReached(){
  try{
    if(kind==='vida')return !$('#end')?.classList.contains('hidden');
    if(kind==='riesgo')return !$('#end')?.classList.contains('hide');
    return state&&state.stage===5;
  }catch{return false}
}
function participant(){
  return kind==='definiciones'?$('#studentName')?.value.trim():kind==='vida'?$('#student')?.value.trim():$('#student')?.value.trim();
}
function payload(){
  let points,total,name;
  if(kind==='vida'){points=hits;total=order.length;name='Clase 2 · Vida útil'}
  else if(kind==='riesgo'){points=score;total=cases.length*3;name='Clase 3 · Riesgo sanitario'}
  else{points=totalPoints();total=maxTotal;name='Clase 1 · Definiciones básicas'}
  const p={
    submission_id:safeId(),submitted_at:new Date().toISOString(),
    class_name:kind==='vida'?'Clase 2':kind==='riesgo'?'Clase 3':'Clase 1',
    activity_id:kind==='vida'?'clase-2-vida-util':kind==='riesgo'?'actividad-analisis-riesgo-sanitario':'clase-1-definiciones',
    activity_name:name,student_name:participant()||'',student_code:'',
    group:'',score_correct:points,score_total:total,answers:answers.slice(0,160),
    origin:location.href,version:'ute-juegos-1',
    reflections:kind==='riesgo'?JSON.stringify({justificacion1:$('#reflection1')?.value||'',justificacion2:$('#reflection2')?.value||''}):''
  };
  return p;
}
function show(){
  if(!finalReached())return;
  const parent=kind==='definiciones'?$('#game'):$('#end');
  if(!parent||document.getElementById('ute-entrega'))return;
  const section=document.createElement('section');
  section.id='ute-entrega';
  section.style.cssText='max-width:740px;margin:20px auto;padding:20px;border:2px solid #16806e;border-radius:16px;background:#eefbf7;color:#143c38;line-height:1.5;text-align:left';
  section.innerHTML='<h3 style="margin:0 0 8px">Enviar respuestas a la docente</h3><p>Este registro es formativo. Incluye las respuestas del juego y su puntuación. Introduce tu código o grupo para identificar la entrega.</p><label for="ute-codigo" style="display:block;font-weight:700;margin-bottom:5px">Código de estudiante o grupo</label><input id="ute-codigo" maxlength="65" style="width:100%;max-width:460px;padding:12px;border:1px solid #91afa8;border-radius:8px;font:inherit" placeholder="Ej.: GASTRO-A-12"><p><button type="button" id="ute-enviar" style="background:#08745d;color:#fff;border:0;border-radius:9px;padding:12px 17px;font-size:1rem;font-weight:700;cursor:pointer">Enviar respuestas y calificación</button></p><p id="ute-estado" role="status" aria-live="polite"></p>';
  parent.appendChild(section);
  const btn=section.querySelector('#ute-enviar'),msg=section.querySelector('#ute-estado');
  btn.onclick=async()=>{
    const url=window.UTE_REGISTRO_URL||'';
    if(!url||!window.UTERegistro){msg.textContent='Registro no activado por la docente. Puedes seguir practicando; tus respuestas no se han enviado.';return}
    const codigo=section.querySelector('#ute-codigo').value.trim();
    if(codigo.length<2){msg.textContent='Escribe tu código o identificador de grupo.';return}
    if(!attempt)attempt=payload();
    attempt.student_code=codigo;
    btn.disabled=true;msg.textContent='Enviando; espera la confirmación antes de cerrar...';
    try{
      await window.UTERegistro.entregar(attempt,url);
      delivered=true;msg.textContent='ENTREGA CONFIRMADA: tus resultados se registraron en Google Sheets.';
      btn.textContent='Entrega registrada';btn.disabled=true;
    }catch(err){
      msg.textContent='NO CONFIRMADO: '+err.message+' Puedes intentar de nuevo sin duplicar el envío.';
      btn.disabled=false;
    }
  };
}
let deferred=false;
const obs=new MutationObserver(()=>{
  if(deferred)return;
  deferred=true;
  queueMicrotask(()=>{deferred=false;if(finalReached())show();});
});
obs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
if(finalReached())show();
})();