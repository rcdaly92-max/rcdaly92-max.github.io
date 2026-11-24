/**
 * Receptor exclusivo de Química Orgánica, Unidad 2, Clase 1.
 * Instalar en una aplicación web de Apps Script asociada al archivo QO.
 * La hoja permanece privada; el código solo se ejecuta en el servidor.
 */
const QO_SPREADSHEET_ID = '1jU-eKdBcRkboBzaMkICY80xr0mgxGewIpEvC6XclS_o';
const ACTIVITY_ID = 'qo-unidad2-clase1';
const ACTIVITY_TITLE = 'Propiedades estructurales del carbono';
const CLASS_TITLE = 'Química orgánica · Unidad 2 · Clase 1';
const VERSION = 'qo-u2c1-1';
const QUESTION_BANK = [
  ['Carbono','¿Qué propiedad del carbono permite que establezca cuatro enlaces covalentes?',['Monovalencia','Tetravalencia','Divalencia','Carácter metálico'],1],
  ['Comparación','¿Cuál de las siguientes sustancias contiene carbono y se clasifica habitualmente como inorgánica?',['Etanol (C₂H₆O)','Metano (CH₄)','Dióxido de carbono (CO₂)','Glucosa (C₆H₁₂O₆)'],2],
  ['Hidrocarburos','¿Qué combinación de elementos forma un hidrocarburo?',['Carbono e hidrógeno','Carbono y oxígeno','Hidrógeno y oxígeno','Carbono, hidrógeno y nitrógeno'],0],
  ['Hidrocarburos','¿Qué rasgo caracteriza a un alqueno?',['Solo enlaces simples C–C','Un triple enlace C≡C','Al menos un doble enlace C=C','Un grupo carboxilo –COOH'],2],
  ['Grupos funcionales','¿A qué función química pertenece el etanol (CH₃CH₂OH)?',['Aldehído','Alcohol','Éter','Cetona'],1],
  ['Grupos funcionales','¿Qué grupo funcional identifica al ácido etanoico presente en el vinagre?',['Carboxilo (–COOH)','Hidroxilo (–OH)','Amino (–NH₂)','Éter (–O–)'],0],
  ['Series homólogas','En una serie homóloga de alcanos, ¿en qué difieren dos miembros consecutivos?',['En un grupo –OH','En un anillo de carbono','En una unidad –CH₂–','En un átomo de oxígeno'],2],
  ['Estructura','¿Qué caracteriza a un compuesto heterocíclico?',['Una cadena abierta ramificada','Un anillo formado solo por carbono','Dos cadenas lineales separadas','Un anillo que contiene algún átomo distinto del carbono'],3],
  ['Nomenclatura','Al nombrar un alcano ramificado, ¿qué se selecciona primero como cadena principal?',['La cadena continua de carbonos más larga','La cadena con más hidrógenos','La cadena con menos enlaces C–C','El sustituyente de menor masa'],0],
  ['Nomenclatura','¿Cuál es el nombre correcto de CH₃–CH(CH₃)–CH₂–CH₃?',['3-metilbutano','2-metilbutano','2-metilpropano','Pentano'],1]
];
function limpiar_(value, maxLength) {
  const s = String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength);
  return /^[=+@-]/.test(s) ? "'" + s : s;
}
function validar_(p) {
  if (!p || p.activity !== ACTIVITY_ID ||
      !/^[a-f0-9-]{30,50}$/i.test(String(p.id || '')) ||
      !Array.isArray(p.answers) || p.answers.length !== QUESTION_BANK.length ||
      p.answers.some(x => !Number.isInteger(x) || x < 0 || x > 3) ||
      !String(p.student_name || '').trim() ||
      !String(p.student_code || '').trim() ||
      !String(p.group || '').trim()) throw Error('Entrega inválida');
}
function hoja_(name) {
  const sheet = SpreadsheetApp.openById(QO_SPREADSHEET_ID).getSheetByName(name);
  if (!sheet) throw Error('No se encontró la pestaña ' + name);
  return sheet;
}
function buscarId_(id) {
  const h = hoja_('INTENTOS');
  const last = h.getLastRow();
  return last > 1 && Boolean(h.getRange(2, 1, last - 1, 1)
    .createTextFinder(String(id)).matchEntireCell(true).findNext());
}
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const raw = e && e.parameter && e.parameter.payload;
    if (!raw || raw.length > 9000) throw Error('Datos inválidos');
    const p = JSON.parse(raw);
    validar_(p);
    lock.waitLock(25000);
    if (buscarId_(p.id)) return ContentService.createTextOutput('Duplicado');
    const ss = SpreadsheetApp.openById(QO_SPREADSHEET_ID);
    const attempts = ss.getSheetByName('INTENTOS');
    const details = ss.getSheetByName('RESPUESTAS');
    if (!attempts || !details) throw Error('Pestañas faltantes');
    const timestamp = new Date().toISOString();
    const correctCount = p.answers.reduce((sum, selected, i) =>
      sum + (selected === QUESTION_BANK[i][3] ? 1 : 0), 0);
    const responseRows = QUESTION_BANK.map((q, i) => {
      const selected = p.answers[i];
      return [
        p.id, timestamp, ACTIVITY_ID,
        limpiar_(p.student_code, 80), limpiar_(p.student_name, 120),
        i + 1, 'U2C1-' + (i + 1), q[1],
        q[2][selected], q[2][q[3]], selected === q[3] ? 'Sí' : 'No', q[0]
      ];
    });
    details.getRange(details.getLastRow() + 1, 1, responseRows.length, 12).setValues(responseRows);
    attempts.appendRow([
      p.id, timestamp, CLASS_TITLE, ACTIVITY_ID, ACTIVITY_TITLE,
      limpiar_(p.student_code, 80), limpiar_(p.student_name, 120),
      limpiar_(p.group, 80), correctCount, QUESTION_BANK.length,
      Math.round(correctCount / QUESTION_BANK.length * 1000) / 10,
      Math.round(correctCount / QUESTION_BANK.length * 100) / 10,
      VERSION, limpiar_(p.origin, 190), ''
    ]);
    SpreadsheetApp.flush();
    return ContentService.createTextOutput('Registrado');
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput('No registrado');
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}
function doGet(e) {
  const p = (e && e.parameter) || {};
  let res = {ok: false, activity: ACTIVITY_ID, estado: 'pendiente'};
  if (p.action === 'ping') {
    res = {ok: true, activity: ACTIVITY_ID, estado: 'disponible'};
  } else if (p.action === 'status' && p.activity === ACTIVITY_ID &&
             /^[a-f0-9-]{30,50}$/i.test(String(p.id || ''))) {
    if (buscarId_(p.id)) res = {ok: true, activity: ACTIVITY_ID, id: p.id, estado: 'guardado'};
  }
  const callback = String(p.callback || '');
  if (callback && !/^[A-Za-z_$][A-Za-z0-9_$]{0,75}$/.test(callback)) {
    return ContentService.createTextOutput('callback inválido');
  }
  return ContentService.createTextOutput(callback ? callback + '(' + JSON.stringify(res) + ');' : JSON.stringify(res))
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}
function verificarQO() {
  const intentos = hoja_('INTENTOS');
  const respuestas = hoja_('RESPUESTAS');
  console.log('QO preparado: ' + intentos.getName() + ' y ' + respuestas.getName());
}