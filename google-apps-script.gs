/**
 * ============================================================
 *  BIENESTAR HUMANO · MOTOR DE DATOS (Google Apps Script)
 * ============================================================
 *
 *  Este archivo se pega en Apps Script (script.google.com → Nuevo proyecto)
 *  y se publica como Web App. La URL resultante se coloca en
 *  data.js → APPS_SCRIPT_URL.
 *
 *  El script guarda los datos en una hoja de cálculo de Google Sheets
 *  llamada "BienestarHumano_DB" (se crea automáticamente).
 *
 *  ENDPOINTS (todo se hace por GET y POST):
 *   GET  ?action=getAll              -> Devuelve { periods: [...] }
 *   POST { action:'savePeriod',  payload:{...} }   -> Guarda/actualiza un período
 *   POST { action:'deletePeriod',payload:{period:'2026-03'} } -> Elimina un período
 *
 *  CÓMO PUBLICAR:
 *  1. Abre https://script.google.com → "Nuevo proyecto"
 *  2. Pega TODO este código y guarda
 *  3. Click en "Implementar" → "Nueva implementación"
 *  4. Tipo: Aplicación web
 *      - Ejecutar como: Yo (tu cuenta)
 *      - Quién tiene acceso: Cualquier usuario
 *  5. Copia la URL del Web App
 *  6. Pégala en data.js como valor de APPS_SCRIPT_URL
 *
 * ============================================================
 */

const SHEET_NAME = 'BienestarHumano_DB';

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('BienestarHumano_DB');
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, 5).setValues([['period','label','uploadedBy','uploadedAt','data']]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  if (action === 'getAll') return _json(getAll_());
  return _json({ ok:true, info:'Bienestar Humano API' });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    if (action === 'savePeriod')   return _json(savePeriod_(body.payload));
    if (action === 'deletePeriod') return _json(deletePeriod_(body.payload.period));
    return _json({ ok:false, error:'Acción no reconocida' });
  } catch (err) {
    return _json({ ok:false, error: String(err) });
  }
}

function getAll_() {
  const sh = getOrCreateSheet_();
  const last = sh.getLastRow();
  if (last < 2) return { periods: [] };
  const rows = sh.getRange(2, 1, last - 1, 5).getValues();
  const periods = rows.map(r => {
    let parsed = {};
    try { parsed = JSON.parse(r[4]); } catch(_) {}
    return Object.assign({
      period: r[0],
      label: r[1],
      uploadedBy: r[2],
      uploadedAt: r[3]
    }, parsed);
  });
  return { ok:true, periods };
}

function savePeriod_(payload) {
  if (!payload || !payload.period) return { ok:false, error:'Falta period' };
  const sh = getOrCreateSheet_();
  const last = sh.getLastRow();
  const existing = last >= 2 ? sh.getRange(2, 1, last - 1, 1).getValues() : [];
  const idx = existing.findIndex(r => r[0] === payload.period);
  const dataStr = JSON.stringify({ modules: payload.modules || {}, summary: payload.summary || {} });
  const row = [payload.period, payload.label || '', payload.uploadedBy || '', payload.uploadedAt || new Date().toISOString(), dataStr];

  if (idx >= 0) {
    sh.getRange(idx + 2, 1, 1, 5).setValues([row]);
  } else {
    sh.appendRow(row);
  }
  return { ok:true, period: payload.period };
}

function deletePeriod_(period) {
  const sh = getOrCreateSheet_();
  const last = sh.getLastRow();
  if (last < 2) return { ok:false, error:'No hay datos' };
  const data = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === period) {
      sh.deleteRow(i + 2);
      return { ok:true, deleted: period };
    }
  }
  return { ok:false, error:'No encontrado' };
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
