/* ============================================================
   BIENESTAR HUMANO — APLICACIÓN PRINCIPAL
   ============================================================ */

(() => {
'use strict';

/* ---------- ESTADO GLOBAL ---------- */
const STATE = {
  currentUser: null,
  selectedUser: null,
  periods: [],            // lista de {period, label, summary, modules}
  currentPeriodIdx: 0,
  aggKey: null,           // null = un mes; 'all' | 'y2025' | 'y2026' = acumulado
  charts: {},
  map: null,
  mapMarkers: []
};

const STORAGE_KEY = 'bh_merida_v1';

/* ---------- UTILIDADES ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const fmt = (n) => (n||0).toLocaleString('es-MX');
const sum = (arr) => arr.reduce((a,b)=>a+(b||0),0);

function toast(msg, type='success'){
  const el = $('#toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  setTimeout(()=> el.classList.remove('show'), 2800);
}

/* ---------- PERSISTENCIA (LocalStorage + Apps Script opcional) ---------- */
function loadStorage(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  }catch{ return null; }
}
function saveStorage(state){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch(e){ console.warn('LocalStorage falló', e); }
}

async function syncToAppsScript(action, payload){
  if(!APPS_SCRIPT_URL) return null;
  try{
    const res = await fetch(APPS_SCRIPT_URL, {
      method:'POST',
      // no headers para evitar preflight CORS
      body: JSON.stringify({ action, payload })
    });
    return await res.json();
  }catch(e){
    console.warn('Apps Script sync falló:', e);
    return null;
  }
}

async function pullFromAppsScript(){
  if(!APPS_SCRIPT_URL) return null;
  try{
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getAll`);
    return await res.json();
  }catch{ return null; }
}

/* ---------- INICIALIZACIÓN DE DATOS ---------- */
function initData(){
  const stored = loadStorage();
  if(stored && Array.isArray(stored.periods) && stored.periods.length){
    STATE.periods = stored.periods;
    // Fusionar con los períodos oficiales en caso de haber mejoras del Excel
    // que el usuario aún no tiene localmente. No sobreescribe sus datos cargados.
    if(typeof INITIAL_PERIODS !== 'undefined'){
      const version = (typeof DATA_VERSION !== 'undefined') ? DATA_VERSION : 1;
      const isOfficial = (p) => /^Datos oficiales/i.test(p.uploadedBy || '');
      if(stored.dataVersion !== version){
        // Nueva versión del Excel: se reemplazan SOLO los meses oficiales guardados;
        // los meses capturados a mano por las usuarias se conservan tal cual.
        const officialIds = new Set(INITIAL_PERIODS.map(p => p.period));
        STATE.periods = STATE.periods.filter(p => !(isOfficial(p) && officialIds.has(p.period)));
      }
      const existingIds = new Set(STATE.periods.map(p => p.period));
      INITIAL_PERIODS.forEach(p => { if(!existingIds.has(p.period)) STATE.periods.push(p); });
      STATE.periods.sort((a,b) => a.period.localeCompare(b.period));
      saveStorage({ periods: STATE.periods, dataVersion: version });
    }
  } else {
    // Dataset inicial: 21 períodos mensuales REALES extraídos del Excel oficial
    // "MODULOS2025" (enero 2025 → septiembre 2026).
    STATE.periods = (typeof INITIAL_PERIODS !== 'undefined' ? INITIAL_PERIODS : []).slice();
    STATE.periods.sort((a,b) => a.period.localeCompare(b.period));
    saveStorage({ periods: STATE.periods, dataVersion: (typeof DATA_VERSION !== 'undefined') ? DATA_VERSION : 1 });
  }
  // Posicionarse por defecto en el último período COMPLETO (no parciales)
  STATE.currentPeriodIdx = STATE.periods.length - 1;
  for(let i = STATE.periods.length - 1; i >= 0; i--){
    const lbl = (STATE.periods[i].label || '').toLowerCase();
    if(!STATE.periods[i].partial && !lbl.includes('parcial')){ STATE.currentPeriodIdx = i; break; }
  }
}

function aggregateModuleSummary(modulesData){
  const sum = { medicos:0, odonto:0, enfermeria:0, rehab:0, mental:0, nutri:0 };
  Object.values(modulesData||{}).forEach(m=>{
    sum.medicos += (m.medicos||0);
    sum.odonto += (m.odonto||0);
    sum.enfermeria += (m.enfermeria||0);
    sum.rehab += (m.rehab||0);
    sum.mental += (m.mental||0);
    sum.nutri += (m.nutri||0);
  });
  return sum;
}

/* ============================================================
   PARTÍCULAS DE FONDO
   ============================================================ */
function initParticles(){
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = $('#particles');
  const ctx = canvas.getContext('2d');
  let w, h;
  const particles = [];
  const COUNT = window.innerWidth < 768 ? 28 : 60;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for(let i=0;i<COUNT;i++){
    particles.push({
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (Math.random()-0.5)*0.3,
      vy: (Math.random()-0.5)*0.3,
      r: Math.random()*2.4 + 0.6,
      hue: Math.random() > 0.55 ? 'green' : 'blue',
      a: Math.random() * 0.4 + 0.1
    });
  }

  function tick(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if(p.x<0) p.x=w; if(p.x>w) p.x=0;
      if(p.y<0) p.y=h; if(p.y>h) p.y=0;
      ctx.beginPath();
      ctx.fillStyle = p.hue==='green'
        ? `rgba(116,186,71,${p.a})`
        : `rgba(14,42,107,${p.a})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    });
    // líneas entre partículas cercanas
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if(d < 110){
          ctx.beginPath();
          ctx.strokeStyle = `rgba(116,186,71,${0.1 * (1 - d/110)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(tick);
  }
  tick();
}

/* ============================================================
   LOGIN
   ============================================================ */
function initLogin(){
  $$('.user-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.user-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      STATE.selectedUser = chip.dataset.user;
      $('#password').focus();
      $('#loginError').textContent = '';
    });
  });

  $('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = STATE.selectedUser;
    const pass = $('#password').value.trim();
    if(!user){ $('#loginError').textContent = 'Selecciona un usuario'; return; }
    if(USERS[user] && checkPassword(USERS[user], pass)){
      STATE.currentUser = user;
      try{ localStorage.setItem(SESSION_KEY, user); }catch(_){}
      $('#login').classList.add('hidden');
      $('#app').classList.remove('hidden');
      onLoggedIn();
    } else {
      $('#loginError').textContent = 'Contraseña incorrecta. Intenta de nuevo.';
      $('#password').value = '';
      $('#password').focus();
    }
  });

  $('#password').addEventListener('input', () => $('#loginError').textContent = '');
}

/* Sesión persistente: la usuaria sigue dentro al recargar hasta que pulse "Cerrar sesión". */
const SESSION_KEY = 'bh_merida_session';
function restoreSession(){
  let user = null;
  try{ user = localStorage.getItem(SESSION_KEY); }catch(_){}
  if(!user || !USERS[user]) return false;
  STATE.currentUser = user;
  $('#login').classList.add('hidden');
  $('#app').classList.remove('hidden');
  onLoggedIn(true);
  return true;
}

/* Contraseñas: se compara la huella SHA-256 (passwordHash). Si data.js aún
   trae `password` en texto (versión vieja), también se acepta. */
function checkPassword(u, pass){
  if(u.password !== undefined) return u.password === pass;
  return sha256Hex(pass) === String(u.passwordHash || '').toLowerCase();
}

/* SHA-256 en JS puro (funciona también abriendo el archivo sin servidor, donde crypto.subtle no está). */
function sha256Hex(str){
  const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const bytes = new TextEncoder().encode(str);
  const l = bytes.length, padLen = ((l + 9 + 63) >> 6) << 6;
  const buf = new Uint8Array(padLen); buf.set(bytes); buf[l] = 0x80;
  const dv = new DataView(buf.buffer); dv.setUint32(padLen - 4, (l * 8) >>> 0); dv.setUint32(padLen - 8, Math.floor(l * 8 / 4294967296));
  let H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const W = new Uint32Array(64);
  const rotr = (x,n) => (x >>> n) | (x << (32 - n));
  for(let off = 0; off < padLen; off += 64){
    for(let i = 0; i < 16; i++) W[i] = dv.getUint32(off + i*4);
    for(let i = 16; i < 64; i++){
      const s0 = rotr(W[i-15],7) ^ rotr(W[i-15],18) ^ (W[i-15] >>> 3);
      const s1 = rotr(W[i-2],17) ^ rotr(W[i-2],19) ^ (W[i-2] >>> 10);
      W[i] = (W[i-16] + s0 + W[i-7] + s1) >>> 0;
    }
    let [a,b,c,d,e,f,g,h] = H;
    for(let i = 0; i < 64; i++){
      const S1 = rotr(e,6) ^ rotr(e,11) ^ rotr(e,25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = rotr(a,2) ^ rotr(a,13) ^ rotr(a,22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H = H.map((v, i) => (v + [a,b,c,d,e,f,g,h][i]) >>> 0);
  }
  return H.map(v => v.toString(16).padStart(8,'0')).join('');
}

function onLoggedIn(restored){
  const u = USERS[STATE.currentUser];
  $('#userName').textContent = u.name;
  $('#userAvatar').textContent = u.name[0];
  $('#userAvatar').style.background = `linear-gradient(135deg, ${u.color}, ${u.color}dd)`;
  $('#loadAuthor').value = u.name;
  if(!restored) toast(`Hola, ${u.name}`, 'success');
  refreshAll();
}

/* ============================================================
   NAVEGACIÓN
   ============================================================ */
function initNav(){
  $$('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      $$('.view').forEach(v => v.classList.remove('active'));
      const view = btn.dataset.view;
      $(`#view-${view}`).classList.add('active');
      // cerrar sidebar móvil
      $('#sidebar').classList.remove('open');
      $('.sidebar-backdrop')?.classList.remove('show');
      // refrescar vista correspondiente (delay para que el display:block aplique antes)
      // Esperar dos frames para que el navegador haya aplicado display:block y medido el contenedor
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if(view==='map'){ initMap(); STATE.map?.invalidateSize(); }
        if(view==='trends') renderTrends();
        if(view==='modules') renderModules();
        if(view==='priority') renderPriority();
        if(view==='data') renderDataLoader();
      }));
    });
  });

  // menú móvil
  $('#menuBtn').addEventListener('click', () => {
    $('#sidebar').classList.toggle('open');
    let bd = $('.sidebar-backdrop');
    if(!bd){
      bd = document.createElement('div');
      bd.className = 'sidebar-backdrop';
      bd.addEventListener('click', ()=> {
        $('#sidebar').classList.remove('open');
        bd.classList.remove('show');
      });
      // Dentro de #app: así comparte contexto de apilamiento con el menú y no lo tapa en móvil.
      $('#app').appendChild(bd);
    }
    bd.classList.toggle('show');
  });

  // logout
  $('#logoutBtn').addEventListener('click', () => {
    try{ localStorage.removeItem(SESSION_KEY); }catch(_){}
    STATE.currentUser = null;
    STATE.selectedUser = null;
    $('#password').value = '';
    $$('.user-chip').forEach(c => c.classList.remove('selected'));
    $('#app').classList.add('hidden');
    $('#login').classList.remove('hidden');
  });

  // selector de período
  const sel = $('#periodSelect');
  buildPeriodOptions();
  sel.addEventListener('change', () => {
    if(isNaN(+sel.value)){ STATE.aggKey = sel.value; }
    else { STATE.aggKey = null; STATE.currentPeriodIdx = +sel.value; }
    refreshAll();
  });
}

/* Llena el selector de período agrupando los meses por año (más reciente arriba) */
/* ---------- PERÍODOS ACUMULADOS (todo el histórico / por año) ---------- */
const isPartialPeriod = (p) => !!p.partial || /parcial/i.test(p.label || '');
const MES_CORTO = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const periodMonthLabel = (p) => { const [y,m] = p.period.split('-'); return `${MES_CORTO[+m-1]} ${y}`; };

function aggregatePeriods(list, key, label){
  const modules = {}, gender = { h:0, m:0 };
  list.forEach(p => {
    Object.entries(p.modules || {}).forEach(([id, m]) => {
      const acc = modules[id] = modules[id] || { medicos:0, odonto:0, enfermeria:0, rehab:0, mental:0, nutri:0 };
      Object.keys(acc).forEach(k => acc[k] += (m[k] || 0));
    });
    if(p.gender){ gender.h += p.gender.h || 0; gender.m += p.gender.m || 0; }
  });
  const summary = { medicos:0, odonto:0, enfermeria:0, rehab:0, mental:0, nutri:0 };
  list.forEach(p => { const sp = p.summary || aggregateModuleSummary(p.modules); Object.keys(summary).forEach(k => summary[k] += sp[k] || 0); });
  const first = list[0], last = list[list.length-1];
  return {
    period: key, virtual: true, months: list.length, list,
    label: label || key,
    range: list.length ? `${periodMonthLabel(first)} → ${periodMonthLabel(last)}` : '',
    summary, gender: (gender.h + gender.m) ? gender : null, modules
  };
}

/* Opciones de acumulado disponibles según los meses cargados (se excluye el mes en captura) */
function aggregateOptions(){
  const complete = STATE.periods.filter(p => !isPartialPeriod(p)).sort((a,b) => a.period.localeCompare(b.period));
  if(!complete.length) return [];
  const opts = [];
  const all = aggregatePeriods(complete, 'all');
  all.label = `Todo el histórico (${all.range})`;
  opts.push(all);
  const years = [...new Set(complete.map(p => p.period.slice(0,4)))].sort().reverse();
  years.forEach(y => {
    const list = complete.filter(p => p.period.startsWith(y));
    const agg = aggregatePeriods(list, 'y' + y);
    agg.label = list.length === 12 ? `Año ${y} (completo)` : `Año ${y} (${agg.range})`;
    opts.push(agg);
  });
  return opts;
}

function currentPeriod(){
  if(STATE.aggKey){
    const found = aggregateOptions().find(a => a.period === STATE.aggKey);
    if(found) return found;
    STATE.aggKey = null;
  }
  return STATE.periods[STATE.currentPeriodIdx];
}

function buildPeriodOptions(){
  const sel = $('#periodSelect');
  sel.innerHTML = '';
  const aggs = aggregateOptions();
  if(aggs.length){
    const og = document.createElement('optgroup');
    og.label = 'Acumulados';
    aggs.forEach(a => {
      const o = document.createElement('option');
      o.value = a.period; o.textContent = a.label;
      og.appendChild(o);
    });
    sel.appendChild(og);
  }
  const groups = {};
  STATE.periods.forEach((p, idx) => {
    const y = (p.period || '').slice(0,4) || 'Otros';
    (groups[y] = groups[y] || []).push({ p, idx });
  });
  Object.keys(groups).sort().reverse().forEach(y => {
    const og = document.createElement('optgroup');
    og.label = y;
    groups[y].slice().reverse().forEach(({p, idx}) => {
      const o = document.createElement('option');
      o.value = idx; o.textContent = p.label;
      og.appendChild(o);
    });
    sel.appendChild(og);
  });
  sel.value = STATE.aggKey || STATE.currentPeriodIdx;
}

const SUM_TOTAL = (s) => (s.medicos||0)+(s.odonto||0)+(s.enfermeria||0)+(s.rehab||0)+(s.mental||0)+(s.nutri||0);
const moduleTotal = (m) => SUM_TOTAL(m || {});

/* ============================================================
   ANIMACIÓN DE NÚMEROS
   ============================================================ */
function animateNumber(el, target, duration = 1400){
  const start = +el.dataset.current || 0;
  const change = target - start;
  const startTime = performance.now();
  function step(t){
    const elapsed = t - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutExpo
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = Math.round(start + change * eased);
    el.textContent = fmt(current);
    if(progress < 1) requestAnimationFrame(step);
    else { el.dataset.current = target; el.textContent = fmt(target); }
  }
  requestAnimationFrame(step);
}

function setTrend(el, current, prev, suffix = 'vs mes anterior'){
  if(prev === undefined || prev === null){ el.textContent=''; return; }
  const diff = current - prev;
  const pct = prev === 0 ? 0 : (diff / prev) * 100;
  const arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '—';
  const cls = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
  el.className = `kpi-trend ${cls}`;
  el.textContent = `${arrow} ${Math.abs(pct).toFixed(1)}% ${suffix}`;
}

/* ============================================================
   RESUMEN / KPIs
   ============================================================ */
function renderOverview(){
  const cur = currentPeriod();
  if(!cur) return;
  // Verificar que Chart.js esté disponible
  if(typeof Chart === 'undefined'){
    console.warn('Chart.js no cargó. Las gráficas no se mostrarán.');
  }
  // Verificar que el contenedor de gráficas esté dimensionado
  const sizeEl = $('#topChart');
  if(sizeEl && sizeEl.parentElement.clientWidth === 0){
    return requestAnimationFrame(renderOverview);
  }
  // Contra qué se compara: el mes anterior, o el mismo tramo del año anterior si es un acumulado anual.
  let prev = null, trendSuffix = 'vs mes anterior';
  if(!cur.virtual){
    prev = STATE.periods[STATE.currentPeriodIdx-1];
  } else if(cur.period.startsWith('y')){
    const y = +cur.period.slice(1);
    const months = new Set(cur.list.map(p => p.period.slice(5)));
    const prevList = STATE.periods.filter(p => p.period.startsWith(String(y-1)) && months.has(p.period.slice(5)) && !isPartialPeriod(p));
    if(prevList.length === cur.list.length){ prev = aggregatePeriods(prevList, 'prev'); trendSuffix = `vs mismo período de ${y-1}`; }
  }
  const s = cur.summary || aggregateModuleSummary(cur.modules);
  const total = s.medicos + s.odonto + s.enfermeria + s.rehab + s.mental + s.nutri;

  $('#heroPeriod').textContent = cur.virtual ? `${cur.label.replace(/ \(.*\)$/, '')} · ${cur.months} meses (${cur.range})` : cur.label;

  animateNumber($('#kpiTotal'), total);
  animateNumber($('#kpiNutri'), s.nutri);
  SERVICE_DEFS.forEach(d => {
    const el = $(`#kpi${d.key[0].toUpperCase()+d.key.slice(1)}Share`);
    if(el) el.textContent = total ? `${Math.round((s[d.key]||0) / total * 100)}%` : '';
  });
  renderMixBar(s, total);
  renderHeroFacts(cur, s, total);
  renderIdleModules(cur);
  animateNumber($('#kpiMedicos'), s.medicos);
  animateNumber($('#kpiOdonto'), s.odonto);
  animateNumber($('#kpiEnfermeria'), s.enfermeria);
  animateNumber($('#kpiRehab'), s.rehab);
  animateNumber($('#kpiMental'), s.mental);

  if(prev){
    const sp = prev.summary || aggregateModuleSummary(prev.modules);
    const totalPrev = sp.medicos + sp.odonto + sp.enfermeria + sp.rehab + sp.mental + sp.nutri;
    setTrend($('#kpiTotalTrend'), total, totalPrev, trendSuffix);
    setTrend($('#kpiMedicosTrend'), s.medicos, sp.medicos, trendSuffix);
    setTrend($('#kpiOdontoTrend'), s.odonto, sp.odonto, trendSuffix);
    setTrend($('#kpiEnfermeriaTrend'), s.enfermeria, sp.enfermeria, trendSuffix);
    setTrend($('#kpiRehabTrend'), s.rehab, sp.rehab, trendSuffix);
    setTrend($('#kpiMentalTrend'), s.mental, sp.mental, trendSuffix);
    setTrend($('#kpiNutriTrend'), s.nutri, sp.nutri, trendSuffix);
  } else {
    const txt = cur.virtual ? `Acumulado de ${cur.months} meses` : 'Primer mes registrado';
    ['Total','Medicos','Odonto','Enfermeria','Rehab','Mental','Nutri'].forEach(k => {
      const el = $(`#kpi${k}Trend`); if(el){ el.className = 'kpi-trend flat'; el.textContent = (cur.virtual && k !== 'Total') ? `promedio ${fmt(Math.round((s[k.toLowerCase()] || 0) / cur.months))} al mes` : txt; }
    });
  }

  renderSparkline(s);
  renderAlerts(cur, prev);
  renderTopChart(cur);
  renderGenderChart(cur);
  renderStatusChart(cur);
}

/* Barra de composición: cómo se reparten las atenciones del mes entre servicios */
function renderMixBar(s, total){
  const bar = $('#mixBar'); if(!bar) return;
  bar.innerHTML = SERVICE_DEFS.map(d => {
    const v = s[d.key] || 0;
    const pct = total ? v / total * 100 : 0;
    if(pct <= 0) return '';
    return `<span class="mix-seg" style="--c:${d.color};width:${pct}%" title="${d.label}: ${fmt(v)} (${pct.toFixed(1)}%)"></span>`;
  }).join('');
}

/* Tres datos clave en lenguaje llano debajo de la cifra principal */
function renderHeroFacts(cur, s, total){
  const ul = $('#heroFacts'); if(!ul) return;
  const tracked = MODULES.filter(m => m.status !== 'CERRADO');
  const withData = tracked.filter(m => moduleTotal(cur.modules && cur.modules[m.id]) > 0).length;
  const top = SERVICE_DEFS.slice().sort((a,b) => (s[b.key]||0) - (s[a.key]||0))[0];
  const facts = [
    `<strong>${withData}</strong> de ${tracked.length} módulos con registros`,
    total ? `<strong>${top.label}</strong> concentra el ${Math.round((s[top.key]||0)/total*100)}%` : 'Sin atenciones registradas'
  ];
  if(cur.gender && (cur.gender.h + cur.gender.m) > 0){
    facts.push(`<strong>${Math.round(cur.gender.m / (cur.gender.h + cur.gender.m) * 100)}%</strong> de las atenciones fueron a mujeres`);
  }
  ul.innerHTML = facts.map(f => `<li>${f}</li>`).join('');
}

/* Lista accionable: módulos activos que no reportaron nada en el mes */
function renderIdleModules(cur){
  const ul = $('#idleList'); if(!ul) return;
  const t = $('#idleTitle'); if(t) t.textContent = cur.virtual ? 'Módulos activos sin registros en el período' : 'Módulos activos sin registros este mes';
  const idle = MODULES.filter(m => m.status === 'ACTIVO' && moduleTotal(cur.modules && cur.modules[m.id]) === 0);
  $('#idleCount').textContent = idle.length ? String(idle.length) : '';
  ul.innerHTML = idle.length
    ? idle.map(m => `<li><span class="idle-name">${m.name}</span><span class="idle-colony">${m.colony || ''}</span></li>`).join('')
    : `<li class="idle-empty">Todos los módulos activos reportaron atenciones ${cur.virtual ? 'en el período' : 'este mes'}.</li>`;
}

function renderSparkline(){
  if(typeof Chart === 'undefined') return;
  // Pequeño sparkline en el KPI principal: últimos 8 meses, o todo el tramo si es un acumulado
  const cur = currentPeriod();
  const last = cur.virtual ? cur.list : STATE.periods.slice(Math.max(0, STATE.currentPeriodIdx - 7), STATE.currentPeriodIdx + 1);
  const cap = $('#sparkCap');
  if(cap) cap.textContent = cur.virtual ? `Mes a mes (${cur.range})` : 'Tendencia de los últimos 8 meses';
  const data = last.map(p => {
    const s = p.summary || aggregateModuleSummary(p.modules);
    return s.medicos + s.odonto + s.enfermeria + s.rehab + s.mental + s.nutri;
  });
  const ctx = $('#sparkTotal').getContext('2d');
  if(STATE.charts.spark) STATE.charts.spark.destroy();
  STATE.charts.spark = new Chart(ctx, {
    type:'line',
    data:{
      labels: last.map(p => p.label),
      datasets:[{
        data,
        borderColor:'rgba(255,255,255,.95)',
        backgroundColor:'rgba(255,255,255,.18)',
        fill:true, tension:.4, pointRadius:0, borderWidth:2
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ display:false }, tooltip:{ enabled:false }},
      scales:{ x:{ display:false }, y:{ display:false } }
    }
  });
}

function renderDistChart(s, mode='bar'){
  if(typeof Chart === 'undefined' || !$('#distChart')) return;
  const ctx = $('#distChart').getContext('2d');
  if(STATE.charts.dist) STATE.charts.dist.destroy();
  const data = SERVICE_DEFS.map(d => s[d.key] || 0);
  const colors = SERVICE_DEFS.map(d => d.color);
  STATE.charts.dist = new Chart(ctx, {
    type: mode,
    data:{
      labels: SERVICE_DEFS.map(d => d.label),
      datasets:[{
        data, backgroundColor: colors, borderRadius: mode==='bar' ? 8 : 0,
        borderColor:'#fff', borderWidth: mode==='bar' ? 0 : 3
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      animation:{ duration: 1100, easing: 'easeOutQuart' },
      plugins:{ legend:{ display: mode==='doughnut', position:'bottom' } },
      scales: mode==='bar' ? { y:{ beginAtZero:true, grid:{ color:'#EDF2F7' } }, x:{ grid:{ display:false } } } : {}
    }
  });
}

function renderTopChart(period){
  if(typeof Chart === 'undefined') return;
  if(!period.modules) return;
  const arr = Object.entries(period.modules).map(([id, m]) => {
    const total = (m.medicos||0)+(m.odonto||0)+(m.enfermeria||0)+(m.rehab||0)+(m.mental||0)+(m.nutri||0);
    const mod = MODULES.find(x => x.id===id);
    return { name: mod?.name || id, total };
  }).filter(x => x.total > 0).sort((a,b)=> b.total - a.total).slice(0, 10);
  const ctx = $('#topChart').getContext('2d');
  if(STATE.charts.top) STATE.charts.top.destroy();
  STATE.charts.top = new Chart(ctx, {
    type:'bar',
    data:{
      labels: arr.map(x => x.name),
      datasets:[{ data: arr.map(x => x.total), backgroundColor:'#002C72', hoverBackgroundColor:'#006AFF', borderRadius:6, barThickness:16 }]
    },
    options:{
      indexAxis:'y',
      responsive:true, maintainAspectRatio:false,
      animation:{ duration: 1200 },
      plugins:{ legend:{ display:false } },
      scales:{ x:{ beginAtZero:true, grid:{ color:'#EDF2F7'} }, y:{ grid:{ display:false } } }
    }
  });
}

function renderGenderChart(period){
  if(typeof Chart === 'undefined') return;
  const note = $('#genderNote');
  if(STATE.charts.gender) STATE.charts.gender.destroy();
  const g = period.gender;
  if(!g || (g.h + g.m) === 0){
    if(note) note.textContent = 'Este mes no tiene desglose por sexo. Se registra al cargar el mes con columnas de hombres y mujeres.';
    return;
  }
  if(note) note.textContent = `${fmt(g.m)} mujeres · ${fmt(g.h)} hombres`;
  STATE.charts.gender = new Chart($('#genderChart').getContext('2d'), {
    type:'doughnut',
    data:{ labels:['Mujeres','Hombres'], datasets:[{ data:[g.m, g.h], backgroundColor:['#F44C7F','#002C72'], borderColor:'#fff', borderWidth:3 }] },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'68%', animation:{ duration: 900 },
      plugins:{ legend:{ position:'bottom', labels:{ usePointStyle:true, boxWidth:8 } },
        tooltip:{ callbacks:{ label:(c) => `${c.label}: ${fmt(c.parsed)} (${Math.round(c.parsed/(g.h+g.m)*100)}%)` } } } }
  });
}

function renderStatusChart(period){
  if(typeof Chart === 'undefined') return;
  const counts = { ACTIVO:0, RECONV:0, CERRADO:0 };
  MODULES.forEach(m => counts[m.status] = (counts[m.status]||0) + 1);
  const ctx = $('#statusChart').getContext('2d');
  if(STATE.charts.status) STATE.charts.status.destroy();
  STATE.charts.status = new Chart(ctx, {
    type:'doughnut',
    data:{
      labels:['Activos','Reconvertidos','Cerrados'],
      datasets:[{
        data:[counts.ACTIVO, counts.RECONV, counts.CERRADO],
        backgroundColor:['#74BA47','#FE6F61','#CBD5E1'],
        borderColor:'#fff', borderWidth:3
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      animation:{ duration: 1200 },
      plugins:{ legend:{ position:'bottom' } }
    }
  });
}

/* Tabs de chart de distribución */
function initChartTabs(){
  $$('[data-chart-mode]').forEach(b => b.addEventListener('click', () => {
    $$('[data-chart-mode]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const mode = b.dataset.chartMode;
    const cur = currentPeriod();
    const s = cur.summary || aggregateModuleSummary(cur.modules);
    renderDistChart(s, mode);
  }));
}

/* ============================================================
   MÓDULOS (lista detallada)
   ============================================================ */
function renderModules(){
  const cur = currentPeriod();
  const search = $('#moduleSearch').value.toLowerCase();
  const status = $('#statusFilter').value;
  const sortBy = $('#moduleSort') ? $('#moduleSort').value : 'name';
  const grid = $('#modulesGrid');
  grid.innerHTML = '';

  const list = MODULES.slice();
  if(sortBy === 'total') list.sort((a,b) => moduleTotal(cur.modules && cur.modules[b.id]) - moduleTotal(cur.modules && cur.modules[a.id]));
  else list.sort((a,b) => a.name.localeCompare(b.name, 'es'));

  list.forEach(mod => {
    if(status !== 'all' && mod.status !== status) return;
    if(search && !mod.name.toLowerCase().includes(search) && !(mod.colony||'').toLowerCase().includes(search)) return;
    const m = (cur.modules && cur.modules[mod.id]) || {};
    const total = (m.medicos||0)+(m.odonto||0)+(m.enfermeria||0)+(m.rehab||0)+(m.mental||0)+(m.nutri||0);
    const card = document.createElement('div');
    card.className = `module-card status-${mod.status}`;
    card.tabIndex = 0; card.setAttribute('role','button'); card.title = 'Ver historia del módulo';
    card.addEventListener('click', () => openModuleModal(mod.id));
    card.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openModuleModal(mod.id); } });
    card.innerHTML = `
      <div class="module-head">
        <div class="module-name">${mod.name}<br><small class="muted" style="font-weight:500">${mod.colony||''}</small></div>
        <span class="module-status status-${mod.status}">${mod.status}</span>
      </div>
      <div class="module-stats">
        <div class="module-stat${(m.medicos||0) ? '' : ' is-zero'}"><div class="module-stat-label">Médicos</div><div class="module-stat-value">${fmt(m.medicos)}</div></div>
        <div class="module-stat${(m.odonto||0) ? '' : ' is-zero'}"><div class="module-stat-label">Odontología</div><div class="module-stat-value">${fmt(m.odonto)}</div></div>
        <div class="module-stat${(m.enfermeria||0) ? '' : ' is-zero'}"><div class="module-stat-label">Enfermería</div><div class="module-stat-value">${fmt(m.enfermeria)}</div></div>
        <div class="module-stat${(m.rehab||0) ? '' : ' is-zero'}"><div class="module-stat-label">Rehabilitación</div><div class="module-stat-value">${fmt(m.rehab)}</div></div>
        <div class="module-stat${(m.mental||0) ? '' : ' is-zero'}"><div class="module-stat-label">Salud mental</div><div class="module-stat-value">${fmt(m.mental)}</div></div>
        <div class="module-stat${(m.nutri||0) ? '' : ' is-zero'}"><div class="module-stat-label">Nutrición</div><div class="module-stat-value">${fmt(m.nutri)}</div></div>
      </div>
      <div class="module-total">
        <span class="muted">Total atenciones</span>
        <strong>${fmt(total)}</strong>
      </div>
    `;
    grid.appendChild(card);
  });

  if(!grid.children.length){
    grid.innerHTML = '<p class="muted" style="grid-column:1/-1;text-align:center;padding:2rem">No hay módulos con esos filtros.</p>';
  }
}

/* ============================================================
   MAPA INTERACTIVO (Leaflet + OpenStreetMap)
   ============================================================ */
function initMap(){
  if(STATE.map) return;
  const cfg = (typeof MAP_CONFIG !== 'undefined') ? MAP_CONFIG : {};
  const map = L.map('map', {
    center: cfg.center || [20.97, -89.62],
    zoom: cfg.zoom || 12,
    scrollWheelZoom: true
  });

  // Ninguna de estas capas necesita API key.
  const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors', maxZoom: 19
  });
  const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap · © CARTO', subdomains: 'abcd', maxZoom: 19
  });
  const satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri — Esri, Earthstar Geographics', maxZoom: 19
  });
  const bases = {
    'Calles (OpenStreetMap)': osm,
    'Claro (CARTO)': carto,
    'Satélite (Esri)': satelite
  };
  // Capa opcional con llave de MapTiler (solo si se pegó una en data.js → MAP_CONFIG.maptilerKey)
  if(cfg.maptilerKey){
    bases['Calles (MapTiler)'] = L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${encodeURIComponent(cfg.maptilerKey)}`, {
      attribution: '© MapTiler © OpenStreetMap contributors', maxZoom: 20
    });
  }
  osm.addTo(map);

  // Si OpenStreetMap no responde (red restringida, bloqueo), cambia solo a CARTO.
  let tileErrors = 0, switched = false;
  osm.on('tileerror', () => {
    tileErrors++;
    if(tileErrors >= 4 && !switched && map.hasLayer(osm)){
      switched = true;
      map.removeLayer(osm); carto.addTo(map);
      toast('Se cambió a la capa CARTO porque OpenStreetMap no respondió', 'warning');
    }
  });
  osm.on('load', () => { tileErrors = 0; });

  L.control.layers(bases, null, { position:'topright', collapsed:true }).addTo(map);
  L.control.scale({ imperial:false, position:'bottomleft' }).addTo(map);

  STATE.map = map;
  initColoniasLayer(map);
  drawMapMarkers();
}

/* Capa de colonias, fraccionamientos y comisarías (etiquetas del KMZ oficial).
   Se muestra a partir del zoom 13 para no saturar; se puede apagar con la casilla. */
function initColoniasLayer(map){
  if(typeof COLONIAS === 'undefined' || !COLONIAS.length) return;
  // Tres capas escalonadas por zoom para no saturar: comisarías/zonas (13+), colonias (14+), fraccionamientos (15+)
  const layers = { com: L.layerGroup(), col: L.layerGroup(), fracc: L.layerGroup() };
  const minZoom = { com: 13, col: 14, fracc: 15 };
  const pretty = (n) => n.replace(/^(F\.|C\.|FRACC\.)\s*/, '').replace(/\s+/g,' ').trim();
  COLONIAS.forEach(([name, lat, lng]) => {
    const kind = /^F/.test(name) ? 'fracc' : /^C\./.test(name) ? 'col' : 'com';
    L.marker([lat, lng], {
      icon: L.divIcon({ className:'', html:`<span class="colonia-lbl ${kind}">${pretty(name)}</span>`, iconSize:[0,0], iconAnchor:[0,0] }),
      interactive: false, keyboard: false
    }).addTo(layers[kind]);
  });
  const toggle = $('#kmlToggle');
  const sync = () => {
    const on = toggle ? toggle.checked : true;
    Object.keys(layers).forEach(k => {
      const visible = on && map.getZoom() >= minZoom[k];
      if(visible && !map.hasLayer(layers[k])) layers[k].addTo(map);
      if(!visible && map.hasLayer(layers[k])) map.removeLayer(layers[k]);
    });
  };
  map.on('zoomend', sync);
  if(toggle){ toggle.closest('label').classList.remove('hidden'); toggle.addEventListener('change', sync); }
  sync();
}

/* Alterna entre el mapa de módulos (Leaflet) y el mapa "Espacios físicos 2026"
   publicado en Google My Maps. El de Google no requiere API key: se inserta
   como mapa público embebido. */
function initMapMode(){
  const cfg = (typeof MAP_CONFIG !== 'undefined') ? MAP_CONFIG : {};
  const btns = $$('[data-map-mode]');
  if(!btns.length) return;
  const wrap = $('#myMapsWrap'), frame = $('#myMapsFrame'), link = $('#myMapsLink');
  const hasMyMaps = !!cfg.myMapsId;
  if(!hasMyMaps){ btns.find(b => b.dataset.mapMode === 'mymaps')?.remove(); return; }
  link.href = `https://www.google.com/maps/d/viewer?mid=${encodeURIComponent(cfg.myMapsId)}`;
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const mode = b.dataset.mapMode;
    if(mode === 'mymaps'){
      if(!frame.src) frame.src = `https://www.google.com/maps/d/embed?mid=${encodeURIComponent(cfg.myMapsId)}&ehbc=002C72`;
      $('#map').classList.add('hidden'); wrap.classList.remove('hidden');
      $('#mapInfo').innerHTML = '<p class="muted">Mapa "Espacios físicos 2026" de Google My Maps. Si no carga, el mapa debe estar compartido como público; también puedes abrirlo con el botón "Abrir en Google Maps".</p>';
    } else {
      wrap.classList.add('hidden'); $('#map').classList.remove('hidden');
      requestAnimationFrame(() => { initMap(); STATE.map?.invalidateSize(); });
    }
  }));
}

function drawMapMarkers(){
  if(!STATE.map) return;
  STATE.mapMarkers.forEach(m => STATE.map.removeLayer(m));
  STATE.mapMarkers = [];

  const cur = currentPeriod();
  const seen = {};   // coordenadas ya usadas → separa módulos que comparten sede (matutino/vespertino)

  // Iniciales inteligentes: primera letra de cada palabra significativa
  const getInitials = (name) => {
    const stopWords = new Set(['de','la','las','el','los','y','a','al','en','un','una','do']);
    const words = name.replace(/\(.*?\)/g,'').split(/\s+/).filter(w => w && !stopWords.has(w.toLowerCase()));
    if(words.length === 1) return words[0].substring(0,2).toUpperCase();
    return words.slice(0,2).map(w => w[0]).join('').toUpperCase();
  };

  MODULES.forEach(mod => {
    if(!mod.lat || !mod.lng) return;
    if(mod.type === 'movil') return; // servicios sin sede fija: se listan abajo del mapa
    const key = `${mod.lat},${mod.lng}`;
    const n = seen[key] = (seen[key] || 0) + 1;
    let lat = mod.lat, lng = mod.lng;
    if(n > 1){ const ang = (n - 1) * 1.25, r = 0.0011; lat += Math.sin(ang) * r; lng += Math.cos(ang) * r; }
    const m = (cur.modules && cur.modules[mod.id]) || {};
    const total = (m.medicos||0)+(m.odonto||0)+(m.enfermeria||0)+(m.rehab||0)+(m.mental||0)+(m.nutri||0);
    const cls = mod.status==='CERRADO' ? 'cerrado' : mod.status==='RECONV' ? 'reconv' : '';
    const initials = getInitials(mod.name);
    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className:'',
        html:`<div class="module-marker ${cls}">${initials}<span class="module-marker-label">${mod.name}</span></div>`,
        iconSize:[36,36], iconAnchor:[18,18]
      })
    });
    marker.bindPopup(`
      <div class="popup-name">${mod.name}</div>
      <div class="popup-row"><span>📍 Colonia</span><strong>${mod.colony||'—'}</strong></div>
      <div class="popup-row"><span>🩺 Médicos</span><strong>${fmt(m.medicos)}</strong></div>
      <div class="popup-row"><span>🦷 Odontología</span><strong>${fmt(m.odonto)}</strong></div>
      <div class="popup-row"><span>💉 Enfermería</span><strong>${fmt(m.enfermeria)}</strong></div>
      <div class="popup-row"><span>🦴 Rehabilitación</span><strong>${fmt(m.rehab)}</strong></div>
      <div class="popup-row"><span>🧠 Salud Mental</span><strong>${fmt(m.mental)}</strong></div>
      <div class="popup-row popup-total"><span>Total</span><span>${fmt(total)}</span></div>
      <button class="popup-btn" onclick="window.bhOpenModule && window.bhOpenModule('${mod.id}')">Ver historia del módulo</button>
    `);
    marker.on('click', () => {
      $('#mapInfo').innerHTML = `
        <h3 style="font-family:var(--font-display);color:var(--brand-blue);margin-bottom:.4rem">${mod.name}</h3>
        <p class="muted">Colonia: <strong>${mod.colony||'—'}</strong> · Estatus: <strong>${mod.status}</strong></p>
        <p class="muted">Total de atenciones: <strong style="color:var(--brand-green-dark)">${fmt(total)}</strong></p>
      `;
    });
    marker.addTo(STATE.map);
    STATE.mapMarkers.push(marker);
  });

  // Servicios sin ubicación fija (a domicilio, ferias y brigadas, comisarías)
  const movil = MODULES.filter(mod => mod.type === 'movil').map(mod => {
    const t = moduleTotal(cur.modules && cur.modules[mod.id]);
    return `<span class="movil-chip"><strong>${mod.name}</strong> ${fmt(t)}</span>`;
  }).join('');
  const note = $('#mapMovil');
  if(note) note.innerHTML = movil ? `<small class="muted">Servicios sin sede fija en ${cur.label}:</small> ${movil}` : '';
}

/* ============================================================
   TENDENCIAS
   ============================================================ */
const TREND = { metric:'total', range:'12', includePartial:false };
const MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MONTHS_LONG  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const METRIC_LABEL = { total:'Atenciones totales' };
SERVICE_DEFS.forEach(d => METRIC_LABEL[d.key] = d.label);
const METRIC_COLOR = { total:'#002C72' };
SERVICE_DEFS.forEach(d => METRIC_COLOR[d.key] = d.color);

const periodSummary = (p) => p.summary || aggregateModuleSummary(p.modules);
const metricOf = (p, k) => k === 'total' ? SUM_TOTAL(periodSummary(p)) : (periodSummary(p)[k] || 0);
const isPartial = (p) => !!p.partial || /parcial/i.test(p.label || '');
const shortLabel = (p) => { const [y,m] = p.period.split('-'); return `${MONTHS_SHORT[+m-1]} ${y.slice(2)}`; };
const longLabel  = (p) => { const [y,m] = p.period.split('-'); return `${MONTHS_LONG[+m-1]} ${y}`; };
const pct = (a, b) => (b ? ((a - b) / b * 100) : null);
const fmtPct = (v) => v === null ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(1).replace('.', ',')} %`;
const fmtAbsPct = (v) => `${Math.abs(v).toFixed(1).replace('.', ',')} %`;

/* Etiquetas de valor dibujadas sobre puntos y barras (sin librerías externas) */
const valueLabelsPlugin = {
  id: 'valueLabels',
  afterDatasetsDraw(chart, _args, opts){
    if(!opts || !opts.enabled) return;
    const { ctx } = chart;
    ctx.save();
    ctx.font = `600 ${opts.size || 11}px Poppins, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    chart.data.datasets.forEach((ds, di) => {
      const meta = chart.getDatasetMeta(di);
      if(meta.hidden) return;
      meta.data.forEach((el, i) => {
        const v = ds.data[i];
        if(v === null || v === undefined) return;
        const txt = opts.format ? opts.format(v, ds, i) : fmt(v);
        const bar = meta.type === 'bar';
        const above = bar ? v >= 0 : true;
        ctx.fillStyle = opts.color || '#334155';
        ctx.textBaseline = above ? 'bottom' : 'top';
        ctx.fillText(txt, el.x, above ? el.y - 5 : el.y + 5);
      });
    });
    ctx.restore();
  }
};
if(typeof Chart !== 'undefined') Chart.register(valueLabelsPlugin);

function trendRows(){
  // Meses ordenados; excluye el mes parcial salvo que la usuaria lo pida.
  let rows = STATE.periods.slice().sort((a,b) => a.period.localeCompare(b.period));
  if(!TREND.includePartial) rows = rows.filter(p => !isPartial(p));
  if(TREND.range !== 'all') rows = rows.slice(-Number(TREND.range));
  return rows;
}

function initTrendControls(){
  const sel = $('#trendMetric');
  if(!sel || sel.dataset.bound) return;
  sel.dataset.bound = '1';
  sel.addEventListener('change', () => { TREND.metric = sel.value; renderTrends(); });
  $$('[data-range]').forEach(b => b.addEventListener('click', () => {
    $$('[data-range]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    TREND.range = b.dataset.range; renderTrends();
  }));
  $('#trendPartial').addEventListener('change', (e) => { TREND.includePartial = e.target.checked; renderTrends(); });
  // Si no hay mes parcial en los datos, se oculta la casilla.
  if(!STATE.periods.some(isPartial)) $('#trendPartial').closest('label').classList.add('hidden');
}

function renderTrendStats(rows, k){
  const box = $('#trendStats'); if(!box) return;
  const vals = rows.map(p => metricOf(p, k));
  const complete = rows.filter(p => !isPartial(p));
  const cvals = complete.map(p => metricOf(p, k));
  const total = sum(cvals);
  const avg = cvals.length ? Math.round(total / cvals.length) : 0;
  let bestIdx = -1; cvals.forEach((v,i) => { if(bestIdx < 0 || v > cvals[bestIdx]) bestIdx = i; });
  const last = complete[complete.length-1];
  const prev = complete[complete.length-2];
  // mismo mes del año anterior
  let yoyTxt = '—', yoyCls = 'flat', yoyCap = 'Sin dato del año anterior';
  if(last){
    const [y,m] = last.period.split('-');
    const ly = STATE.periods.find(p => p.period === `${+y-1}-${m}`);
    if(ly){
      const d = pct(metricOf(last,k), metricOf(ly,k));
      yoyTxt = fmtPct(d); yoyCls = d > 0 ? 'up' : d < 0 ? 'down' : 'flat';
      yoyCap = `${longLabel(last)} vs. ${longLabel(ly)}`;
    } else if(prev){
      const d = pct(metricOf(last,k), metricOf(prev,k));
      yoyTxt = fmtPct(d); yoyCls = d > 0 ? 'up' : d < 0 ? 'down' : 'flat';
      yoyCap = `${longLabel(last)} vs. ${longLabel(prev)}`;
    }
  }
  const tiles = [
    { lbl:'Total del período', val: fmt(total), cap: `${cvals.length} ${cvals.length === 1 ? 'mes completo' : 'meses completos'}` },
    { lbl:'Promedio mensual', val: fmt(avg), cap: 'atenciones por mes' },
    { lbl:'Mejor mes', val: bestIdx >= 0 ? fmt(cvals[bestIdx]) : '—', cap: bestIdx >= 0 ? longLabel(complete[bestIdx]) : '' },
    { lbl:'Mismo mes, año anterior', val: yoyTxt, cap: yoyCap, cls: yoyCls }
  ];
  box.innerHTML = tiles.map(t => `
    <div class="stat ${t.cls || ''}">
      <div class="stat-lbl">${t.lbl}</div>
      <div class="stat-val">${t.val}</div>
      <div class="stat-cap">${t.cap}</div>
    </div>`).join('');
  return { last, prev, total, avg, best: bestIdx >= 0 ? complete[bestIdx] : null, vals };
}

function renderTrendInsight(rows, k, st){
  const el = $('#trendInsight'); if(!el) return;
  if(!st.last){ el.textContent = 'Aún no hay meses completos para leer una tendencia.'; return; }
  const name = METRIC_LABEL[k].toLowerCase();
  const parts = [`<strong>${longLabel(st.last)}</strong> cerró con <strong>${fmt(metricOf(st.last,k))}</strong> ${k === 'total' ? 'atenciones' : 'de ' + name}`];
  if(st.prev){
    const d = pct(metricOf(st.last,k), metricOf(st.prev,k));
    parts.push(d === null ? '' : `un <b class="${d >= 0 ? 'up' : 'down'}">${fmtAbsPct(d)}</b> ${d >= 0 ? 'más' : 'menos'} que ${longLabel(st.prev).split(' ')[0].toLowerCase()}`);
  }
  const [y,m] = st.last.period.split('-');
  const ly = STATE.periods.find(p => p.period === `${+y-1}-${m}`);
  if(ly){
    const d = pct(metricOf(st.last,k), metricOf(ly,k));
    if(d !== null) parts.push(`y <b class="${d >= 0 ? 'up' : 'down'}">${fmtAbsPct(d)}</b> ${d >= 0 ? 'por arriba' : 'por debajo'} de ${longLabel(ly).toLowerCase()}`);
  }
  let txt = parts.filter(Boolean).join(', ') + '.';
  if(st.best && st.best.period !== st.last.period) txt += ` El mejor mes del rango fue <strong>${longLabel(st.best)}</strong> con ${fmt(metricOf(st.best,k))}.`;
  const partial = rows.find(isPartial);
  if(partial) txt += ` <em>${longLabel(partial)} sigue en captura y se muestra punteado.</em>`;
  el.innerHTML = txt;
}

function renderTrends(){
  if(typeof Chart === 'undefined'){
    const container = $('#view-trends');
    if(container && !container.querySelector('.chart-error-msg')){
      const msg = document.createElement('div');
      msg.className = 'chart-error-msg';
      msg.style.cssText = 'padding:1.4rem;background:#FEF3C7;border:1px solid #F59E0B;border-radius:14px;margin-bottom:1rem;color:#92400E';
      msg.innerHTML = '⚠️ <strong>La librería de gráficas no se pudo cargar.</strong> Verifica tu conexión a internet y recarga la página.';
      container.insertBefore(msg, container.children[1]);
    }
    return;
  }
  const canvas = $('#trendChart');
  if(!canvas) return;
  if(canvas.parentElement.clientWidth === 0) return requestAnimationFrame(renderTrends);

  initTrendControls();
  const k = TREND.metric;
  const color = METRIC_COLOR[k];
  const rows = trendRows();
  const labels = rows.map(shortLabel);
  const values = rows.map(p => metricOf(p, k));
  const partialIdx = rows.findIndex(isPartial);
  const small = window.innerWidth < 640;

  // Subtítulos
  const first = rows[0], lastRow = rows[rows.length-1];
  const rangeTxt = rows.length ? `${longLabel(first)} → ${longLabel(lastRow)}` : '';
  $('#trendsSub').textContent = rows.length ? `${rangeTxt} · ${rows.length} meses` : 'Sin datos';
  $('#trendMainTitle').textContent = `${METRIC_LABEL[k]} por mes`;
  $('#trendMainSub').textContent = rangeTxt;

  const st = renderTrendStats(rows, k);
  renderTrendInsight(rows, k, st);

  const completeVals = values.filter((_, i) => i !== partialIdx);
  const avg = completeVals.length ? sum(completeVals) / completeVals.length : 0;

  // ----- Gráfica principal -----
  const ctxT = canvas.getContext('2d');
  if(STATE.charts.trend) STATE.charts.trend.destroy();
  const grad = ctxT.createLinearGradient(0, 0, 0, 340);
  grad.addColorStop(0, color + '55'); grad.addColorStop(1, color + '00');
  STATE.charts.trend = new Chart(ctxT, {
    type:'line',
    data:{ labels, datasets:[
      {
        label: METRIC_LABEL[k], data: values,
        borderColor: color, backgroundColor: grad, fill:true, tension:.35, borderWidth:3,
        pointRadius: (c) => c.dataIndex === partialIdx ? 6 : 4,
        pointBackgroundColor: (c) => c.dataIndex === partialIdx ? '#fff' : color,
        pointBorderColor: color, pointBorderWidth: 2,
        segment:{ borderDash: (c) => (partialIdx >= 0 && c.p1DataIndex === partialIdx) ? [6,5] : undefined }
      },
      {
        label:'Promedio del período', data: values.map(() => Math.round(avg)),
        borderColor:'#94A3B8', borderDash:[4,4], borderWidth:1.5, pointRadius:0, fill:false, tension:0
      }
    ]},
    options:{
      responsive:true, maintainAspectRatio:false,
      layout:{ padding:{ top: 18 } },
      animation:{ duration: 900, easing:'easeOutCubic' },
      interaction:{ mode:'index', intersect:false },
      plugins:{
        legend:{ display:true, position:'bottom', labels:{ usePointStyle:true, boxWidth:8, font:{ size: 11 } } },
        valueLabels:{ enabled: !small && rows.length <= 14, color: color, size: 11,
          format:(v, ds) => ds.label === METRIC_LABEL[k] ? fmt(v) : '' },
        tooltip:{ callbacks:{
          title: (items) => longLabel(rows[items[0].dataIndex]) + (items[0].dataIndex === partialIdx ? ' (en captura)' : ''),
          label: (c) => ` ${c.dataset.label}: ${fmt(c.parsed.y)}`
        }}
      },
      scales:{
        y:{ beginAtZero:true, grid:{ color:'#EDF2F7' }, ticks:{ callback: v => fmt(v), font:{ size: 11 } } },
        x:{ grid:{ display:false }, ticks:{ maxRotation:0, autoSkip:true, font:{ size: 11 } } }
      }
    }
  });

  // ----- Año contra año (ene–dic, una serie por año) -----
  const years = [...new Set(STATE.periods.map(p => p.period.slice(0,4)))].sort();
  const yoyYears = years.slice(-2);
  const yearColors = { [yoyYears[yoyYears.length-1]]: color };
  if(yoyYears.length > 1) yearColors[yoyYears[0]] = '#CBD5E1';
  const ctxY = $('#yoyChart').getContext('2d');
  if(STATE.charts.yoy) STATE.charts.yoy.destroy();
  STATE.charts.yoy = new Chart(ctxY, {
    type:'bar',
    data:{
      labels: MONTHS_SHORT,
      datasets: yoyYears.map(y => ({
        label: y,
        data: MONTHS_SHORT.map((_, i) => {
          const p = STATE.periods.find(q => q.period === `${y}-${String(i+1).padStart(2,'0')}`);
          if(!p || (isPartial(p) && !TREND.includePartial)) return null;
          return metricOf(p, k);
        }),
        backgroundColor: yearColors[y], borderRadius: 4, maxBarThickness: 22
      }))
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      animation:{ duration: 900 },
      plugins:{
        legend:{ position:'bottom', labels:{ usePointStyle:true, boxWidth:8 } },
        valueLabels:{ enabled:false },
        tooltip:{ callbacks:{ label: (c) => ` ${c.dataset.label}: ${fmt(c.parsed.y)}` } }
      },
      scales:{
        y:{ beginAtZero:true, grid:{ color:'#EDF2F7' }, ticks:{ callback: v => fmt(v), font:{ size: 11 } } },
        x:{ grid:{ display:false }, ticks:{ font:{ size: 11 } } }
      }
    }
  });
  $('#yoySub').textContent = yoyYears.join(' vs. ');

  // ----- Cambio respecto al mes anterior (%) -----
  const growth = values.map((v, i) => i === 0 ? null : pct(v, values[i-1]));
  const ctxG = $('#growthChart').getContext('2d');
  if(STATE.charts.growth) STATE.charts.growth.destroy();
  STATE.charts.growth = new Chart(ctxG, {
    type:'bar',
    data:{ labels, datasets:[{
      data: growth,
      backgroundColor: growth.map(g => g === null ? '#E2E8F0' : g >= 0 ? '#74BA47' : '#FE6F61'),
      borderRadius: 5, maxBarThickness: 26
    }]},
    options:{
      responsive:true, maintainAspectRatio:false,
      layout:{ padding:{ top: 14, bottom: 14 } },
      animation:{ duration: 900 },
      plugins:{
        legend:{ display:false },
        valueLabels:{ enabled: !small && rows.length <= 14, size: 10, color:'#475569',
          format:(v) => v === null ? '' : `${v > 0 ? '+' : ''}${Math.round(v)}%` },
        tooltip:{ callbacks:{
          title: (items) => longLabel(rows[items[0].dataIndex]),
          label: (c) => c.parsed.y === null ? ' Sin mes anterior' : ` ${fmtPct(c.parsed.y)} respecto al mes anterior`
        }}
      },
      scales:{
        y:{ grid:{ color:'#EDF2F7' }, ticks:{ callback: v => v + '%', font:{ size: 11 } } },
        x:{ grid:{ display:false }, ticks:{ maxRotation:0, autoSkip:true, font:{ size: 11 } } }
      }
    }
  });

  // ----- Composición por servicio (barras apiladas) -----
  const ctxS = $('#stackChart').getContext('2d');
  if(STATE.charts.stack) STATE.charts.stack.destroy();
  STATE.charts.stack = new Chart(ctxS, {
    type:'bar',
    data:{
      labels,
      datasets: SERVICE_DEFS.map(d => ({
        label: d.label,
        data: rows.map(p => periodSummary(p)[d.key] || 0),
        backgroundColor: d.color, borderRadius: 2, maxBarThickness: 34,
        borderWidth: k === d.key ? 2 : 0, borderColor: '#0F172A'
      }))
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      animation:{ duration: 900 },
      interaction:{ mode:'index', intersect:false },
      plugins:{
        legend:{ position:'bottom', labels:{ usePointStyle:true, boxWidth:8, font:{ size: 11 } } },
        valueLabels:{ enabled:false },
        tooltip:{ callbacks:{
          title: (items) => longLabel(rows[items[0].dataIndex]),
          label: (c) => {
            const tot = SUM_TOTAL(periodSummary(rows[c.dataIndex]));
            return ` ${c.dataset.label}: ${fmt(c.parsed.y)} (${tot ? Math.round(c.parsed.y / tot * 100) : 0} %)`;
          },
          footer: (items) => ' Total: ' + fmt(SUM_TOTAL(periodSummary(rows[items[0].dataIndex])))
        }}
      },
      scales:{
        x:{ stacked:true, grid:{ display:false }, ticks:{ maxRotation:0, autoSkip:true, font:{ size: 11 } } },
        y:{ stacked:true, beginAtZero:true, grid:{ color:'#EDF2F7' }, ticks:{ callback: v => fmt(v), font:{ size: 11 } } }
      }
    }
  });

  renderTrendTable(rows, k);
}

function renderTrendTable(rows, k){
  const tbody = $('#trendTableBody'); if(!tbody) return;
  const totals = rows.map(p => SUM_TOTAL(periodSummary(p)));
  const maxTotal = Math.max(...rows.filter(p => !isPartial(p)).map(p => SUM_TOTAL(periodSummary(p))), 0);
  const html = rows.map((p, i) => {
    const s = periodSummary(p);
    const d = i === 0 ? null : pct(totals[i], totals[i-1]);
    const cls = d === null ? 'flat' : d > 0 ? 'up' : d < 0 ? 'down' : 'flat';
    const partial = isPartial(p);
    return `<tr class="${partial ? 'is-partial' : ''}${totals[i] === maxTotal && !partial ? ' is-best' : ''}">
      <td class="module-name-cell">${longLabel(p)}${partial ? ' <span class="tag-partial">en captura</span>' : ''}</td>
      ${SERVICE_DEFS.map(dd => `<td class="num ${dd.key === k ? 'is-metric' : ''}">${fmt(s[dd.key])}</td>`).join('')}
      <td class="num total-cell">${fmt(totals[i])}</td>
      <td><span class="delta ${cls}">${fmtPct(d)}</span></td>
    </tr>`;
  }).reverse().join('');
  tbody.innerHTML = html || '<tr><td colspan="9" class="muted" style="text-align:center;padding:1.2rem">Sin meses en este rango.</td></tr>';
}

/* ============================================================
   CARGAR DATOS (entrada manual)
   ============================================================ */
function renderDataLoader(){
  // años
  const yearSel = $('#loadYear');
  if(!yearSel.options.length){
    const cy = new Date().getFullYear();
    for(let y = cy-2; y <= cy+1; y++){
      const o = document.createElement('option');
      o.value = y; o.textContent = y;
      yearSel.appendChild(o);
    }
    yearSel.value = cy;
    $('#loadMonth').value = new Date().getMonth();
  }

  // Tabla
  const tbody = $('#dataTableBody');
  tbody.innerHTML = '';
  MODULES.forEach(mod => {
    const tr = document.createElement('tr');
    tr.dataset.id = mod.id;
    tr.innerHTML = `
      <td class="module-name-cell">${mod.name}</td>
      ${SERVICE_DEFS.map(s => `<td><input type="number" min="0" data-svc="${s.key}" value="0" /></td>`).join('')}
      <td class="total-cell" data-total>0</td>
    `;
    tbody.appendChild(tr);
    tr.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => {
        const total = Array.from(tr.querySelectorAll('input')).reduce((a,b)=> a + (+b.value||0), 0);
        tr.querySelector('[data-total]').textContent = fmt(total);
        updateLoaderProgress();
      });
    });
  });

  // Histórico
  renderHistory();

  // Acciones
  if(!$('#saveDataBtn').dataset.bound){
    $('#saveDataBtn').dataset.bound = '1';
    $('#saveDataBtn').addEventListener('click', saveCurrentData);
    $('#clearDataBtn').addEventListener('click', () => {
      $$('#dataTableBody input').forEach(i => i.value = 0);
      $$('#dataTableBody [data-total]').forEach(t => t.textContent = '0');
      $$('#dataTableBody tr').forEach(tr => { delete tr.dataset.h; delete tr.dataset.m; });
      $('#loadH').value = ''; $('#loadM').value = '';
      updateLoaderProgress();
    });
    $('#exportBtn').addEventListener('click', exportData);
    $('#importInput').addEventListener('change', importData);
    $('#loadYear').addEventListener('change', updateLoaderProgress);
    $('#loadMonth').addEventListener('change', updateLoaderProgress);
  }
  updateLoaderProgress();
}

function updateLoaderProgress(){
  const inputs = $$('#dataTableBody input');
  const filled = inputs.filter(i => +i.value > 0).length;
  const pct = Math.min(100, (filled / inputs.length) * 100);
  $('#progressFill').style.width = `${pct}%`;
  $$('.progress-step').forEach(s => s.classList.remove('active'));
  $('[data-step="1"]').classList.add('active');
  if(pct > 0) $('[data-step="2"]').classList.add('active');
  if(pct > 50) $('[data-step="3"]').classList.add('active');
  if(pct > 90) $('[data-step="4"]').classList.add('active');
}

async function saveCurrentData(){
  const year = +$('#loadYear').value;
  const month = +$('#loadMonth').value;
  const period = `${year}-${String(month+1).padStart(2,'0')}`;
  const date = new Date(year, month, 1);
  const label = date.toLocaleString('es-MX', { month:'long', year:'numeric' });

  const modulesData = {};
  $$('#dataTableBody tr').forEach(tr => {
    const id = tr.dataset.id;
    const obj = {};
    tr.querySelectorAll('input').forEach(inp => obj[inp.dataset.svc] = +inp.value || 0);
    if(tr.dataset.h !== undefined && tr.dataset.h !== ''){ obj.h = +tr.dataset.h || 0; obj.m = +tr.dataset.m || 0; }
    modulesData[id] = obj;
  });
  const summary = aggregateModuleSummary(modulesData);
  const gh = +$('#loadH').value || 0, gm = +$('#loadM').value || 0;

  const newPeriod = {
    period, label,
    uploadedBy: USERS[STATE.currentUser].name,
    uploadedAt: new Date().toISOString(),
    modules: modulesData,
    summary,
    gender: (gh + gm) > 0 ? { h: gh, m: gm } : undefined
  };

  // Reemplaza si ya existía ese período
  const existingIdx = STATE.periods.findIndex(p => p.period === period);
  if(existingIdx >= 0){
    if(!confirm(`Ya existe un registro de ${label}. ¿Deseas reemplazarlo?`)) return;
    STATE.periods[existingIdx] = newPeriod;
  } else {
    STATE.periods.push(newPeriod);
    STATE.periods.sort((a,b) => a.period.localeCompare(b.period));
  }
  saveStorage({ periods: STATE.periods, dataVersion: (typeof DATA_VERSION !== 'undefined') ? DATA_VERSION : 1 });

  // intenta sincronizar a Apps Script
  const r = await syncToAppsScript('savePeriod', newPeriod);
  if(r) toast(`Mes ${label} guardado y sincronizado`, 'success');
  else toast(`Mes ${label} guardado (local)`, 'success');

  STATE.aggKey = null;
  STATE.currentPeriodIdx = STATE.periods.findIndex(p => p.period === period);
  refreshAll();
}

function renderHistory(){
  const list = $('#historyList');
  list.innerHTML = '';
  STATE.periods.slice().reverse().forEach((p, idx) => {
    const total = (p.summary?.medicos||0)+(p.summary?.odonto||0)+(p.summary?.enfermeria||0)+(p.summary?.rehab||0)+(p.summary?.mental||0)+(p.summary?.nutri||0);
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div>
        <div class="history-period">${p.label}</div>
        <div class="history-meta">
          <span>👤 ${p.uploadedBy||'—'}</span>
          <span>📊 ${fmt(total)} atenciones</span>
        </div>
      </div>
      <div class="history-actions">
        <button class="history-load" data-period="${p.period}">Ver</button>
        <button class="history-del" data-period="${p.period}">Eliminar</button>
      </div>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll('.history-load').forEach(b => b.addEventListener('click', () => {
    STATE.aggKey = null;
    STATE.currentPeriodIdx = STATE.periods.findIndex(p => p.period === b.dataset.period);
    $('#periodSelect').value = STATE.currentPeriodIdx;
    document.querySelector('[data-view="overview"]').click();
  }));
  list.querySelectorAll('.history-del').forEach(b => b.addEventListener('click', () => {
    if(!confirm('¿Eliminar este período?')) return;
    STATE.periods = STATE.periods.filter(p => p.period !== b.dataset.period);
    if(STATE.currentPeriodIdx >= STATE.periods.length) STATE.currentPeriodIdx = STATE.periods.length-1;
    saveStorage({ periods: STATE.periods, dataVersion: (typeof DATA_VERSION !== 'undefined') ? DATA_VERSION : 1 });
    syncToAppsScript('deletePeriod', { period: b.dataset.period });
    refreshAll();
    toast('Período eliminado', 'success');
  }));
}

function exportData(){
  const blob = new Blob([JSON.stringify({ periods: STATE.periods }, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bienestar_humano_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Datos exportados', 'success');
}

function importData(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try{
      const parsed = JSON.parse(ev.target.result);
      if(!Array.isArray(parsed.periods)) throw new Error('Formato inválido');
      if(!confirm(`Vas a importar ${parsed.periods.length} períodos. ¿Reemplazar todo?`)) return;
      STATE.periods = parsed.periods;
      STATE.currentPeriodIdx = STATE.periods.length-1;
      saveStorage({ periods: STATE.periods, dataVersion: (typeof DATA_VERSION !== 'undefined') ? DATA_VERSION : 1 });
      refreshAll();
      toast('Datos importados', 'success');
    }catch(err){ toast('Archivo inválido', 'error'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

/* ============================================================
   TEMAS PRIORITARIOS
   ============================================================ */
function renderPriority(){
  const grid = $('#priGrid'); if(!grid || typeof PRIORITY_CUTS === 'undefined') return;
  const cuts = PRIORITY_CUTS.slice().sort((a,b) => a.asOf.localeCompare(b.asOf));
  const cur = cuts[cuts.length-1], prev = cuts[cuts.length-2] || null;
  const showDelta = $('#priDelta') ? $('#priDelta').checked : true;
  const v = (k) => (cur.values[k] ?? null);
  const pv = (k) => (prev ? (prev.values[k] ?? null) : null);
  const delta = (k) => { const a = v(k), b = pv(k); return (a === null || b === null) ? null : a - b; };
  const deltaChip = (k) => {
    if(!showDelta || !prev) return '';
    const d = delta(k); if(d === null) return '';
    if(d === 0) return `<span class="pri-delta flat" title="Sin cambio desde el corte anterior">sin cambio</span>`;
    return `<span class="pri-delta ${d > 0 ? 'up' : 'down'}" title="Desde el ${prev.label}">${d > 0 ? '+' : '−'}${fmt(Math.abs(d))}</span>`;
  };
  const ratioChip = (it) => {
    if(!it.ratio) return '';
    const a = v(it.key), b = v(it.ratio);
    if(!a || !b) return '';
    return `<span class="pri-ratio" title="Proporción del total de ${it.lbl.toLowerCase()} que fueron mujeres">${Math.round(a / b * 100)} % del total</span>`;
  };
  const daysBetween = prev ? Math.round((new Date(cur.asOf) - new Date(prev.asOf)) / 86400000) : 0;

  $('#priSub').textContent = `Acumulado del 1 de septiembre de 2024 al ${cur.label}${prev ? ` · comparado con el corte del ${prev.label}` : ''}`;
  $('#priDelta').closest('label').classList.toggle('hidden', !prev);

  // Franja superior: los tres números que resumen la administración
  const strip = [
    { lbl:'Atenciones médicas', key:'sal_total', color:'#002C72' },
    { lbl:'Detecciones y atenciones de enfermería', key:'sal_enf', color:'#74BA47' },
    { lbl:'Consultas médicas a mujeres', key:'muj_mod', color:'#F44C7F' },
    { lbl:'Personas atendidas en Alma Nova', key:'men_personas', color:'#006AFF' }
  ];
  $('#priStrip').innerHTML = strip.map(x => {
    const d = delta(x.key);
    const perMonth = (showDelta && prev && d !== null && daysBetween > 0) ? `<small>≈ ${fmt(Math.round(d / (daysBetween / 30.44)))} al mes desde ${prev.label.replace(/^\d+ de /, '')}</small>` : '';
    return `<div class="pri-kpi" style="--c:${x.color}"><div class="pri-kpi-lbl">${x.lbl}</div><div class="pri-kpi-val">${fmt(v(x.key))}</div><div class="pri-kpi-foot">${deltaChip(x.key)}${perMonth}</div></div>`;
  }).join('');

  grid.innerHTML = PRIORITY_THEMES.map(t => {
    const h = t.headline;
    const headRatio = h.ratio && v(h.ratio) ? `<span class="pri-ratio">${Math.round(v(h.key) / v(h.ratio) * 100)} % de las consultas en módulos</span>` : '';
    const groups = t.groups.map(g => {
      const items = g.items;
      if(g.kind === 'facts'){
        return `<div class="pri-group"><h4>${g.title}</h4><div class="pri-facts">${items.map(it => `
          <div class="pri-fact"><strong>${fmt(v(it.key))}</strong><span>${it.lbl}</span>${it.note ? `<small>${it.note}</small>` : ''}${deltaChip(it.key)}</div>`).join('')}</div></div>`;
      }
      const max = Math.max(...items.filter(it => !it.sub).map(it => v(it.key) || 0), 1);
      return `<div class="pri-group"><h4>${g.title}</h4><ul class="pri-list">${items.map(it => {
        const val = v(it.key);
        const w = Math.max(2, Math.round((val || 0) / max * 100));
        return `<li class="${it.sub ? 'is-sub' : ''}${it.strong ? ' is-strong' : ''}">
          <div class="pri-row"><span class="pri-lbl">${it.lbl}</span><span class="pri-num">${fmt(val)}</span></div>
          ${it.sub ? '' : `<div class="pri-bar"><span style="width:${w}%;background:${t.color}"></span></div>`}
          <div class="pri-meta">${ratioChip(it)}${deltaChip(it.key)}</div>
        </li>`;
      }).join('')}</ul></div>`;
    }).join('');
    return `<article class="pri-card" style="--c:${t.color}">
      <header class="pri-head">
        <div class="pri-icon">${t.icon}</div>
        <div><h3>${t.title}</h3></div>
      </header>
      <div class="pri-headline">
        <div class="pri-headline-val">${fmt(v(h.key))}</div>
        <div class="pri-headline-lbl">${h.lbl}${h.note ? `<small>${h.note}</small>` : ''}</div>
        <div class="pri-headline-meta">${headRatio}${deltaChip(h.key)}</div>
      </div>
      ${groups}
    </article>`;
  }).join('');

  const chk = $('#priDelta');
  if(chk && !chk.dataset.bound){ chk.dataset.bound = '1'; chk.addEventListener('change', renderPriority); }
}

/* ============================================================
   FILTROS DE MÓDULOS
   ============================================================ */
function initModuleFilters(){
  $('#moduleSearch').addEventListener('input', renderModules);
  $('#statusFilter').addEventListener('change', renderModules);
  $('#moduleSort')?.addEventListener('change', renderModules);
}

/* ============================================================
   REFRESH GENERAL
   ============================================================ */
function refreshAll(){
  buildPeriodOptions();
  renderOverview();
  if($('#view-modules').classList.contains('active')) renderModules();
  if($('#view-trends').classList.contains('active')) renderTrends();
  if($('#view-priority').classList.contains('active')) renderPriority();
  if($('#view-data').classList.contains('active')) renderHistory();
  if(STATE.map) drawMapMarkers();
}


/* ============================================================
   ALERTAS DEL MES
   ============================================================ */
function renderAlerts(cur, prev){
  const ul = $('#alertList'), count = $('#alertCount'); if(!ul) return;
  const alerts = [];
  if(cur.virtual){
    ul.innerHTML = '<li class="alert-ok">Las alertas se calculan mes a mes. Elige un mes en el selector de período.</li>';
    count.textContent = ''; return;
  }
  const s = periodSummary(cur);
  if(prev){
    const sp = periodSummary(prev);
    // 1. Servicios con caída fuerte
    SERVICE_DEFS.forEach(d => {
      const a = s[d.key] || 0, b = sp[d.key] || 0;
      if(b >= 100 && a < b * 0.7) alerts.push({ lvl:'high', txt:`<strong>${d.label}</strong> cayó ${Math.round((1 - a/b)*100)} % respecto a ${longLabel(prev).toLowerCase()} (${fmt(b)} → ${fmt(a)}).` });
      if(b >= 100 && a === 0) alerts[alerts.length-1].txt = `<strong>${d.label}</strong> no tiene registros este mes (el mes anterior tuvo ${fmt(b)}). ¿Faltó capturar?`;
    });
    // 2. Módulos con caída fuerte
    MODULES.forEach(mod => {
      if(mod.status === 'CERRADO') return;
      const a = moduleTotal(cur.modules && cur.modules[mod.id]), b = moduleTotal(prev.modules && prev.modules[mod.id]);
      if(b >= 80 && a > 0 && a < b * 0.6) alerts.push({ lvl:'mid', txt:`<strong>${mod.name}</strong> bajó ${Math.round((1 - a/b)*100)} % (${fmt(b)} → ${fmt(a)}).` });
    });
  }
  // 3. Módulos activos sin reportar dos meses seguidos
  const idx = STATE.periods.findIndex(p => p.period === cur.period);
  const prev2 = idx > 1 ? STATE.periods[idx-2] : null;
  if(prev){
    MODULES.forEach(mod => {
      if(mod.status !== 'ACTIVO') return;
      const z = [cur, prev, prev2].filter(Boolean).map(p => moduleTotal(p.modules && p.modules[mod.id]) === 0);
      if(z[0] && z[1]) alerts.push({ lvl: z[2] ? 'high' : 'mid', txt:`<strong>${mod.name}</strong> lleva ${z[2] ? 'tres' : 'dos'} meses sin reportar atenciones.` });
    });
  }
  // 4. Sexo no cuadra con el total
  if(cur.gender && (cur.gender.h + cur.gender.m) !== SUM_TOTAL(s)){
    alerts.push({ lvl:'low', txt:`La suma de hombres y mujeres (${fmt(cur.gender.h + cur.gender.m)}) no coincide con el total de atenciones (${fmt(SUM_TOTAL(s))}).` });
  }
  const order = { high:0, mid:1, low:2 };
  alerts.sort((a,b) => order[a.lvl] - order[b.lvl]);
  count.textContent = alerts.length ? String(alerts.length) : '';
  ul.innerHTML = alerts.length
    ? alerts.map(a => `<li class="alert-${a.lvl}">${a.txt}</li>`).join('')
    : '<li class="alert-ok">Sin alertas: ningún servicio ni módulo muestra caídas fuertes ni meses sin captura.</li>';
}

/* ============================================================
   DETALLE DE MÓDULO (modal)
   ============================================================ */
function initModuleModal(){
  const modal = $('#moduleModal'); if(!modal) return;
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModuleModal));
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && !modal.classList.contains('hidden')) closeModuleModal(); });
  window.bhOpenModule = openModuleModal;
}
function closeModuleModal(){
  $('#moduleModal').classList.add('hidden');
  document.body.classList.remove('modal-open');
}
function openModuleModal(id){
  const mod = MODULES.find(m => m.id === id); if(!mod) return;
  const modal = $('#moduleModal');
  modal.classList.remove('hidden'); document.body.classList.add('modal-open');
  $('#mmTitle').textContent = mod.name;
  const statusTxt = { ACTIVO:'Activo', RECONV:'Reconvertido', CERRADO:'Cerrado' }[mod.status] || mod.status;
  $('#mmSub').textContent = `${mod.colony || ''} · ${statusTxt}${mod.src === 'kmz' ? ' · ubicación del KMZ oficial' : ''}`;

  const rows = STATE.periods.filter(p => !isPartialPeriod(p)).sort((a,b) => a.period.localeCompare(b.period));
  const vals = rows.map(p => moduleTotal(p.modules && p.modules[id]));
  const withData = vals.filter(v => v > 0);
  const total = sum(vals);
  let bestIdx = -1; vals.forEach((v,i) => { if(bestIdx < 0 || v > vals[bestIdx]) bestIdx = i; });
  const last = rows[rows.length-1], prev = rows[rows.length-2];
  const lastV = vals[vals.length-1], prevV = vals[vals.length-2];
  const d = prev ? pct(lastV, prevV) : null;
  const mix = { medicos:0, odonto:0, enfermeria:0, rehab:0, mental:0, nutri:0 };
  rows.forEach(p => { const m = (p.modules && p.modules[id]) || {}; Object.keys(mix).forEach(k => mix[k] += m[k] || 0); });
  const topSvc = SERVICE_DEFS.slice().sort((a,b) => mix[b.key] - mix[a.key])[0];
  $('#mmStats').innerHTML = [
    { lbl:'Acumulado', val: fmt(total), cap:`${withData.length} meses con registros` },
    { lbl:'Promedio mensual', val: fmt(withData.length ? Math.round(total / withData.length) : 0), cap:'en meses con registros' },
    { lbl:'Mejor mes', val: bestIdx >= 0 && vals[bestIdx] > 0 ? fmt(vals[bestIdx]) : '—', cap: bestIdx >= 0 && vals[bestIdx] > 0 ? longLabel(rows[bestIdx]) : '' },
    { lbl: last ? longLabel(last) : 'Último mes', val: fmt(lastV || 0), cap: d === null ? '' : `${fmtPct(d)} vs ${prev ? longLabel(prev).split(' ')[0].toLowerCase() : 'mes anterior'}`, cls: d === null ? '' : d > 0 ? 'up' : d < 0 ? 'down' : 'flat' }
  ].map(t => `<div class="stat ${t.cls || ''}"><div class="stat-lbl">${t.lbl}</div><div class="stat-val">${t.val}</div><div class="stat-cap">${t.cap}</div></div>`).join('');
  $('#mmRange').textContent = rows.length ? `${longLabel(rows[0])} → ${longLabel(last)}` : '';

  if(typeof Chart === 'undefined') return;
  const color = topSvc ? topSvc.color : '#002C72';
  if(STATE.charts.mm) STATE.charts.mm.destroy();
  STATE.charts.mm = new Chart($('#mmChart').getContext('2d'), {
    type:'bar',
    data:{ labels: rows.map(shortLabel), datasets: SERVICE_DEFS.map(dd => ({
      label: dd.label, data: rows.map(p => ((p.modules && p.modules[id]) || {})[dd.key] || 0),
      backgroundColor: dd.color, borderRadius: 2, maxBarThickness: 28
    })) },
    options:{ responsive:true, maintainAspectRatio:false, animation:{ duration: 700 },
      interaction:{ mode:'index', intersect:false },
      plugins:{ legend:{ position:'bottom', labels:{ usePointStyle:true, boxWidth:8, font:{ size:11 } } }, valueLabels:{ enabled:false },
        tooltip:{ callbacks:{ title:(it) => longLabel(rows[it[0].dataIndex]), footer:(it) => ' Total: ' + fmt(vals[it[0].dataIndex]) } } },
      scales:{ x:{ stacked:true, grid:{ display:false }, ticks:{ maxRotation:0, autoSkip:true, font:{ size:11 } } }, y:{ stacked:true, beginAtZero:true, grid:{ color:'#EDF2F7' }, ticks:{ callback:v => fmt(v), font:{ size:11 } } } } }
  });
  if(STATE.charts.mmMix) STATE.charts.mmMix.destroy();
  const mixDefs = SERVICE_DEFS.filter(dd => mix[dd.key] > 0);
  STATE.charts.mmMix = new Chart($('#mmMixChart').getContext('2d'), {
    type:'doughnut',
    data:{ labels: mixDefs.map(dd => dd.label), datasets:[{ data: mixDefs.map(dd => mix[dd.key]), backgroundColor: mixDefs.map(dd => dd.color), borderColor:'#fff', borderWidth:2 }] },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'62%', animation:{ duration: 700 },
      plugins:{ legend:{ position:'bottom', labels:{ usePointStyle:true, boxWidth:8, font:{ size:11 } } }, valueLabels:{ enabled:false },
        tooltip:{ callbacks:{ label:(c) => ` ${c.label}: ${fmt(c.parsed)} (${total ? Math.round(c.parsed/total*100) : 0} %)` } } } }
  });
}

/* ============================================================
   INFORME (impresión → PDF)
   ============================================================ */
function initPrint(){
  const btn = $('#printBtn'); if(!btn) return;
  btn.addEventListener('click', () => {
    const cur = currentPeriod();
    const u = USERS[STATE.currentUser];
    const hoy = new Date().toLocaleDateString('es-MX', { day:'numeric', month:'long', year:'numeric' });
    $('#printHeader').innerHTML = `
      <img src="logo.png" alt="" class="print-logo" />
      <div>
        <div class="print-title">Indicadores de Bienestar Humano · ${cur.label}</div>
        <div class="print-meta">Dirección de Bienestar Humano · H. Ayuntamiento de Mérida 2024-2027 · Generado el ${hoy}${u ? ' por ' + u.name : ''}</div>
      </div>`;
    // Imprime el Resumen y las Tendencias del período seleccionado.
    // Mientras dura la impresión ambas vistas se muestran en pantalla para que
    // Chart.js pueda medir los contenedores y dibujar.
    document.body.classList.add('printing');
    requestAnimationFrame(() => {
      renderOverview();
      renderTrends();
      setTimeout(() => {
        Object.values(STATE.charts).forEach(ch => { try{ ch.resize(); }catch(_){} });
        window.print();
      }, 600);
    });
  });
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
    setTimeout(() => Object.values(STATE.charts).forEach(ch => { try{ ch.resize(); }catch(_){} }), 100);
  });
}

/* ============================================================
   IMPORTAR EXCEL DEL MES (misma estructura que MODULOS2025)
   ============================================================ */
const EXCEL = { wb:null, parsed:null };
const XL_MONTHS = { ENE:1, ENERO:1, FEB:2, FEBRERO:2, MAR:3, MARZ:3, MARZO:3, ABR:4, ABRL:4, ABRIL:4, MAY:5, MAYO:5, JUN:6, JUNIO:6, JUL:7, JULIO:7, AGO:8, AGOS:8, AGOSTO:8, SEP:9, SEPT:9, SEPTIEMBRE:9, OCT:10, OCTUBRE:10, NOV:11, NOVIEMBRE:11, DIC:12, DICIEMBRE:12 };
const XL_COLS = { medicos:[2,3,4], odonto:[5,6,7], enfermeria:[8,9,10], rehab:[11,12,13], mental:[15,16,17], nutri:[18,19,20] }; // índices 0-based: H, M, TOTAL

function normName(s){
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
}
const XL_ALIASES = {
  'XOCLAN SUSULA':'xoclan_susula_dental', 'XOCLAN SUSULA MAT':'xoclan_susula_dental', 'XOCLAN SUSULA MATUTINO':'xoclan_susula_dental',
  'XOCLAN SUSULA VESP':'xoclan_susula_vesp', 'XOCLAN SUSULA VESPERTINO':'xoclan_susula_vesp',
  'JUAN PABLO':'juan_pablo', 'JUAN PABLO II':'juan_pablo', 'M. CRESCENCIO REJON':'crescencio_rejon', 'CRESCENCIO REJON':'crescencio_rejon',
  'SANTA ROSA PEDIATRIA':'santa_rosa_ped', 'SARA MENA':'sara_mena', 'COMISARIAS':'comisarias'
};
function moduleIdFromName(raw){
  if(/PEDIATR/i.test(raw)) return 'santa_rosa_ped';
  const n = normName(raw);
  if(XL_ALIASES[n]) return XL_ALIASES[n];
  const byName = MODULES.find(m => normName(m.name) === n);
  if(byName) return byName.id;
  // tolerancia: mismo nombre sin "MATUTINO/VESPERTINO" abreviado
  const n2 = n.replace(/\bMAT\b/, 'MATUTINO').replace(/\bVESP\b/, 'VESPERTINO');
  const by2 = MODULES.find(m => normName(m.name) === n2);
  return by2 ? by2.id : null;
}
function guessPeriodFromSheet(name){
  const n = normName(name).replace(/\s+/g, '');
  const m = n.match(/^([A-Z]+)(\d{2,4})?$/);
  if(!m || !XL_MONTHS[m[1]]) return null;
  let y = m[2] ? +m[2] : null;
  if(y !== null && y < 100) y += 2000;
  return { month: XL_MONTHS[m[1]], year: y };
}
function parseExcelSheet(ws){
  const rows = XLSX.utils.sheet_to_json(ws, { header:1, defval:null, raw:true });
  const num = (v) => (typeof v === 'number' && isFinite(v)) ? Math.round(v) : (typeof v === 'string' && v.trim() !== '' && !isNaN(+v)) ? Math.round(+v) : 0;
  const modules = {}, warnings = [], unknown = [];
  let gender = { h:0, m:0 }, totalRow = null;
  for(let r = 2; r < Math.min(rows.length, 120); r++){
    const row = rows[r] || [];
    let raw = row[1];
    if(raw === null || raw === undefined || String(raw).trim() === ''){
      const hasTotal = row[23] !== null && row[23] !== undefined && row[24] !== null && row[24] !== undefined;
      const hasAny = row.slice(2, 21).some(v => num(v) > 0);
      if(hasTotal){ totalRow = row; break; }
      if(hasAny && !modules.comisarias){ raw = 'COMISARIAS'; warnings.push(`Fila ${r+1} sin nombre: se tomó como Comisarías.`); }
      else continue;
    }
    if(/^TOTAL/i.test(String(raw).trim())){ totalRow = row; break; }
    const id = moduleIdFromName(raw);
    if(!id){ unknown.push(String(raw).trim()); continue; }
    const m = {}, g = { h:0, m:0 };
    Object.entries(XL_COLS).forEach(([k, [hi, mi, ti]]) => {
      const h = num(row[hi]), mm = num(row[mi]); let t = num(row[ti]);
      if(t === 0 && (h || mm)) t = h + mm;
      m[k] = t; g.h += h; g.m += mm;
    });
    if(g.h + g.m !== SUM_TOTAL(m)) warnings.push(`${String(raw).trim()}: hombres + mujeres (${fmt(g.h + g.m)}) no cuadra con el total (${fmt(SUM_TOTAL(m))}).`);
    if(modules[id]) warnings.push(`${String(raw).trim()} aparece dos veces; se usó la última fila.`);
    modules[id] = m; m.h = g.h; m.m = g.m;
    gender.h += g.h; gender.m += g.m;
  }
  if(unknown.length) warnings.unshift(`Módulos no reconocidos (no se cargaron): ${unknown.join(', ')}. Agrégalos en data.js → MODULES o renómbralos en el Excel.`);
  const summary = aggregateModuleSummary(modules);
  if(totalRow){
    const xt = num(totalRow[23]);
    if(xt && xt !== SUM_TOTAL(summary)) warnings.push(`La fila de totales del Excel dice ${fmt(xt)} y la suma de módulos da ${fmt(SUM_TOTAL(summary))}. Revisa las fórmulas de esa fila.`);
  }
  return { modules, summary, gender, warnings, unknown, count: Object.keys(modules).length };
}
function initExcelImport(){
  const input = $('#excelInput'); if(!input) return;
  input.addEventListener('change', (e) => {
    const file = e.target.files[0]; if(!file) return;
    if(typeof XLSX === 'undefined'){ toast('No se pudo cargar el lector de Excel. Recarga la página.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try{
        EXCEL.wb = XLSX.read(new Uint8Array(ev.target.result), { type:'array' });
      }catch(err){ toast('No se pudo leer el archivo. ¿Es un .xlsx?', 'error'); return; }
      $('#excelFileName').textContent = file.name;
      const sel = $('#excelSheet'); sel.innerHTML = '';
      const monthly = EXCEL.wb.SheetNames.filter(n => guessPeriodFromSheet(n));
      (monthly.length ? monthly : EXCEL.wb.SheetNames).forEach(n => { const o = document.createElement('option'); o.value = n; o.textContent = n; sel.appendChild(o); });
      // Preselecciona la hoja del mes más reciente (año y mes del nombre de la hoja)
      if(monthly.length){
        const rank = (n) => { const g = guessPeriodFromSheet(n); return (g.year || 0) * 100 + g.month; };
        sel.value = monthly.slice().sort((a,b) => rank(b) - rank(a))[0];
      }
      $('#excelPanel').classList.remove('hidden');
      previewExcelSheet();
    };
    reader.readAsArrayBuffer(file);
    input.value = '';
  });
  $('#excelSheet').addEventListener('change', previewExcelSheet);
  $('#excelClose').addEventListener('click', () => $('#excelPanel').classList.add('hidden'));
  $('#excelApply').addEventListener('click', applyExcelToTable);
}
function previewExcelSheet(){
  const name = $('#excelSheet').value; if(!EXCEL.wb || !name) return;
  const parsed = parseExcelSheet(EXCEL.wb.Sheets[name]);
  EXCEL.parsed = parsed;
  const g = guessPeriodFromSheet(name);
  const total = SUM_TOTAL(parsed.summary);
  const periodTxt = g ? `${MONTHS_LONG[g.month-1]}${g.year ? ' ' + g.year : ' (elige el año abajo)'}` : 'no se reconoce el mes en el nombre de la hoja; elígelo abajo';
  $('#excelHint').textContent = `Hoja "${name}" → ${periodTxt}`;
  $('#excelSummary').innerHTML = [
    { l:'Módulos leídos', v: parsed.count }, { l:'Total de atenciones', v: fmt(total) },
    ...SERVICE_DEFS.map(d => ({ l: d.label, v: fmt(parsed.summary[d.key]) })),
    { l:'Hombres / Mujeres', v: `${fmt(parsed.gender.h)} / ${fmt(parsed.gender.m)}` }
  ].map(x => `<div class="xs"><span>${x.l}</span><strong>${x.v}</strong></div>`).join('');
  $('#excelWarnings').innerHTML = parsed.warnings.length
    ? parsed.warnings.map(w => `<li>${w}</li>`).join('')
    : '<li class="ok">Todo cuadra: sin filas desconocidas ni diferencias de totales.</li>';
  if(g){ if(g.year){ ensureYearOption(g.year); $('#loadYear').value = g.year; } $('#loadMonth').value = g.month - 1; }
}
function ensureYearOption(y){
  const sel = $('#loadYear');
  if(![...sel.options].some(o => +o.value === y)){ const o = document.createElement('option'); o.value = y; o.textContent = y; sel.appendChild(o); }
}
function applyExcelToTable(){
  const parsed = EXCEL.parsed; if(!parsed) return;
  let filled = 0;
  $$('#dataTableBody tr').forEach(tr => {
    const m = parsed.modules[tr.dataset.id];
    tr.querySelectorAll('input').forEach(inp => inp.value = m ? (m[inp.dataset.svc] || 0) : 0);
    const total = m ? SUM_TOTAL(m) : 0;
    tr.querySelector('[data-total]').textContent = fmt(total);
    tr.dataset.h = m ? m.h : ''; tr.dataset.m = m ? m.m : '';
    if(m) filled++;
  });
  $('#loadH').value = parsed.gender.h || ''; $('#loadM').value = parsed.gender.m || '';
  updateLoaderProgress();
  $('#excelPanel').classList.add('hidden');
  toast(`${filled} módulos pasados a la tabla. Revisa y pulsa "Guardar mes".`, 'success');
  $('#saveDataBtn').scrollIntoView({ behavior:'smooth', block:'center' });
}

/* Herramienta para generar la huella de una contraseña nueva */
function initHashTool(){
  const btn = $('#hashBtn'); if(!btn) return;
  btn.addEventListener('click', () => {
    const v = $('#hashInput').value;
    if(!v){ $('#hashOut').textContent = 'Escribe una contraseña primero.'; return; }
    $('#hashOut').textContent = `passwordHash: '${sha256Hex(v)}'`;
  });
}

/* ============================================================
   BOOT
   ============================================================ */
async function boot(){
  initData();
  // Intenta sincronizar desde Apps Script si hay endpoint
  const remote = await pullFromAppsScript();
  if(remote && Array.isArray(remote.periods) && remote.periods.length){
    STATE.periods = remote.periods;
    STATE.currentPeriodIdx = STATE.periods.length-1;
    saveStorage({ periods: STATE.periods, dataVersion: (typeof DATA_VERSION !== 'undefined') ? DATA_VERSION : 1 });
    document.querySelector('.sync-status .sync-dot').style.background = '#74BA47';
    document.querySelector('.sync-status small').textContent = 'Conectado a la nube';
  }

  initParticles();

  initLogin();
  initNav();
  initChartTabs();
  initModuleFilters();
  initMapMode();
  initModuleModal();
  initPrint();
  initExcelImport();
  initHashTool();
  registerServiceWorker();

  // Splash → sesión guardada o Login
  const hadSession = !!(() => { try{ return localStorage.getItem(SESSION_KEY); }catch(_){ return null; } })();
  setTimeout(() => {
    $('#splash').style.display = 'none';
    if(!restoreSession()) $('#login').classList.remove('hidden');
  }, hadSession ? 900 : 2900);
}

function registerServiceWorker(){
  if(!('serviceWorker' in navigator)) return;
  if(location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
  navigator.serviceWorker.register('./sw.js').catch(e => console.warn('SW no registrado', e));
}

document.addEventListener('DOMContentLoaded', boot);

})();
