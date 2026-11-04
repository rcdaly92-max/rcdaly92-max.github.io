// Aplicación web exclusiva de MI. Mantener la hoja privada.
const MI_ID='1yfitygIKWXCV4jSTQogN2L80MEIFBexNhOiRzCN3UkQ';
function texto_(v,n){let t=String(v==null?'':v).replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);return /^[=+@-]/.test(t)?"'"+t:t;}
function libro_(){return SpreadsheetApp.openById(MI_ID);}
function configurarMI(){const ss=libro_();if(!ss.getSheetByName('INTENTOS')||!ss.getSheetByName('RESPUESTAS'))throw Error('Faltan pestañas');console.log(ss.getUrl());}
function doPost(e){const lock=LockService.getScriptLock();try{
 const raw=e.parameter.payload;if(!raw||raw.length>40000)throw Error('Datos inválidos');const p=JSON.parse(raw);
 if(!/^[A-Za-z0-9_-]{12,90}$/.test(p.submission_id)||p.activity_id!=='mi-indicadores-clase-4'||!Array.isArray(p.answers)||p.answers.length!==12||!p.student_name||!p.student_code)throw Error('Entrega inválida');
 lock.waitLock(25000);const ss=libro_(),h=ss.getSheetByName('INTENTOS'),d=ss.getSheetByName('RESPUESTAS');
 if(h.getLastRow()>1&&h.getRange(2,1,h.getLastRow()-1,1).createTextFinder(p.submission_id).matchEntireCell(true).findNext())return HtmlService.createHtmlOutput('Entrega ya registrada');
 const key=["12,5 %", "3800", "7,9 %", "8 %", "10", "25", "1,5", "No; se necesitan denominadores por sexo de personas libres de enfermedad al inicio", "20", "Tasas estandarizadas con la misma población de referencia", "Puede aumentar", "Prevalencia puntual"];
 const fecha=new Date().toISOString(),score=p.answers.reduce((n,a,i)=>n+(a.selected===key[i]?1:0),0);
 // Recuperar posibles detalles de un intento incompleto antes de reintentar.
 if(d.getLastRow()>1){const matches=d.getRange(2,1,d.getLastRow()-1,1).createTextFinder(p.submission_id).matchEntireCell(true).findAll();matches.sort((a,b)=>b.getRow()-a.getRow()).forEach(r=>d.deleteRow(r.getRow()));}
 const rows=p.answers.map((a,i)=>[p.submission_id,fecha,'mi-indicadores-clase-4',texto_(p.student_code,80),texto_(p.student_name,120),i+1,'MI-'+(i+1),texto_(a.question,450),texto_(a.selected,600),key[i],a.selected===key[i]?'Sí':'No',texto_(a.topic,100)]);
 d.getRange(d.getLastRow()+1,1,rows.length,12).setValues(rows);
 h.appendRow([p.submission_id,fecha,'Metodología de la investigación · Medicina · Clase 4','mi-indicadores-clase-4','Indicadores epidemiológicos',texto_(p.student_code,80),texto_(p.student_name,120),texto_(p.group,80),score,12,Math.round(score/12*1000)/10,Math.round(score/12*100)/10,'mi-1',texto_(p.origin,200),'']);
 SpreadsheetApp.flush();return HtmlService.createHtmlOutput('Entrega registrada en MI');
 }catch(err){console.error(String(err));return HtmlService.createHtmlOutput('No se pudo registrar la entrega');}finally{if(lock.hasLock())lock.releaseLock();}}
function doGet(e){const p=e.parameter||{};let r={ok:false,estado:'pendiente'};
 if(p.action==='ping')r={ok:true,estado:'disponible',destino:'MI'};
 else if(p.action==='status'&&/^[A-Za-z0-9_-]{12,90}$/.test(p.id||'')){const h=libro_().getSheetByName('INTENTOS');if(h.getLastRow()>1&&h.getRange(2,1,h.getLastRow()-1,1).createTextFinder(p.id).matchEntireCell(true).findNext())r={ok:true,estado:'guardado'};}
 const cb=String(p.callback||'');return ContentService.createTextOutput(/^[A-Za-z_$][A-Za-z0-9_$]{0,75}$/.test(cb)?cb+'('+JSON.stringify(r)+');':JSON.stringify(r)).setMimeType(cb?ContentService.MimeType.JAVASCRIPT:ContentService.MimeType.JSON);}
