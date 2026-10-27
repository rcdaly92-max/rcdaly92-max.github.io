/* Integración compartida: Google Sheets para juegos UTE.
 * Registro exclusivamente formativo. No valida identidad ni impide modificar el JavaScript.
 * Google Apps Script no ofrece CORS normal al navegador: se usa un formulario POST
 * en iframe oculto y se comprueba la recepción con un acuse JSONP de ID aleatorio.
 */
(function(){
'use strict';
function uuid(){
 if(window.crypto && crypto.randomUUID) return crypto.randomUUID().replace(/-/g,'');
 const n=new Uint8Array(18);
 if(window.crypto && crypto.getRandomValues) crypto.getRandomValues(n);
 else for(let i=0;i<n.length;i++)n[i]=Math.floor(Math.random()*256);
 return [...n].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function validarUrl(url){return /^https:\/\/script\.google\.com\/macros\/s\/[^\s/?#]+\/exec(?:\?.*)?$/.test(url)}
function entregar(obj,url){
 return new Promise((resolve,reject)=>{
  if(!validarUrl(url||'')){reject(new Error('Falta configurar la URL /exec de Google Apps Script.'));return;}
  const datos={...obj};
  datos.submission_id=datos.submission_id||uuid();
  datos.submitted_at=datos.submitted_at||new Date().toISOString();
  datos.version=datos.version||'google-registro-1';
  datos.origin=datos.origin||location.href;
  datos.answers=datos.answers||[];
  let intento=0,hecho=false;
  const id='u'+uuid().slice(0,23);
  const frame=document.createElement('iframe');frame.style.display='none';frame.name=id;
  const form=document.createElement('form');form.method='POST';form.action=url;form.target=id;form.style.display='none';
  const field=document.createElement('textarea');field.name='payload';field.value=JSON.stringify(datos);
  form.appendChild(field);document.body.append(frame,form);
  const callback='uteConfirmacion_'+uuid().slice(0,18);
  let current=null,timeout=null;
  function limpiar(){
   hecho=true;clearTimeout(timeout);
   try{delete window[callback]}catch(e){window[callback]=undefined}
   if(current)current.remove();form.remove();
   setTimeout(()=>frame.remove(),600);
  }
  function consultar(){
   if(hecho)return;
   if(++intento>17){limpiar();reject(new Error('No se confirmó el registro en la hoja. Verifica la conexión antes de repetir.'));return;}
   current=document.createElement('script');
   window[callback]=function(estado){
    clearTimeout(timeout);
    if(current){current.remove();current=null;}
    if(hecho)return;
    if(estado && estado.ok && estado.estado==='guardado'){
      limpiar();resolve({ok:true,submission_id:datos.submission_id});
    } else timeout=setTimeout(consultar,1700);
   };
   current.onerror=function(){clearTimeout(timeout);if(current){current.remove();current=null;}timeout=setTimeout(consultar,1700)};
   current.src=url+'?action=status&id='+encodeURIComponent(datos.submission_id)+'&callback='+encodeURIComponent(callback)+'&n='+Date.now();
   document.head.appendChild(current);
   // Si el script no emite nada, reintentar sin asumir éxito.
   timeout=setTimeout(()=>{if(current){current.remove();current=null;}consultar()},2700);
  }
  try{form.submit();timeout=setTimeout(consultar,1400)}catch(err){limpiar();reject(err)}
 });
}
window.UTERegistro={entregar,crearId:uuid};
})();
