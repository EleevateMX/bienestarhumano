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
  charts: {},
  map: null,
  mapMarkers: []
};

const STORAGE_KEY = 'bh_merida_v3_stable';

/* ---------- UTILIDADES ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const fmt = (n) => (n||0).toLocaleString('es-MX');
const sum = (arr) => arr.reduce((a,b)=>a+(b||0),0);


function buildAllPeriods(){
  const summary = { medicos:0, odonto:0, enfermeria:0, rehab:0, mental:0, nutri:0 };
  const modules = {};
  STATE.periods.forEach(p => {
    const ps = p.summary || aggregateModuleSummary(p.modules || {});
    SERVICE_DEFS.forEach(svc => summary[svc.key] += ps[svc.key] || 0);
    Object.entries(p.modules || {}).forEach(([id, m]) => {
      if(!modules[id]) modules[id] = { medicos:0, odonto:0, enfermeria:0, rehab:0, mental:0, nutri:0 };
      SERVICE_DEFS.forEach(svc => modules[id][svc.key] += m[svc.key] || 0);
    });
  });
  const first = STATE.periods[0]?.label || 'inicio';
  const last = STATE.periods[STATE.periods.length-1]?.label || 'actual';
  return {
    period:'all',
    label:'Desde el principio',
    rangeLabel:`${first} — ${last}`,
    uploadedBy:'Sistema',
    uploadedAt:new Date().toISOString(),
    modules,
    summary
  };
}

function getCurrentPeriod(){
  if(STATE.currentPeriodIdx === 'all') return buildAllPeriods();
  return STATE.periods[STATE.currentPeriodIdx] || STATE.periods[STATE.periods.length-1] || buildAllPeriods();
}

function getPreviousPeriod(){
  if(STATE.currentPeriodIdx === 'all') return null;
  return STATE.periods[STATE.currentPeriodIdx-1] || null;
}

function populatePeriodSelect(){
  const sel = $('#periodSelect');
  if(!sel) return;
  const selected = STATE.currentPeriodIdx;
  sel.innerHTML = '';
  const all = document.createElement('option');
  all.value = 'all';
  all.textContent = 'Desde el principio';
  sel.appendChild(all);
  STATE.periods.forEach((p, idx) => {
    const o = document.createElement('option');
    o.value = idx;
    o.textContent = p.label;
    sel.appendChild(o);
  });
  sel.value = selected === 'all' ? 'all' : String(STATE.currentPeriodIdx);
}

function resizeChartsSoon(){
  setTimeout(() => {
    Object.values(STATE.charts || {}).forEach(ch => {
      try{ ch.resize(); }catch(_){ }
    });
  }, 160);
}


function resetChartInstance(key){
  if(STATE.charts && STATE.charts[key]){
    try{ STATE.charts[key].destroy(); }catch(_){ }
    delete STATE.charts[key];
  }
}

function chartHost(canvasId, chartKey){
  let canvas = $('#'+canvasId);
  let host = canvas?.parentElement || document.querySelector(`[data-chart-id=\"${canvasId}\"]`);
  if(!host) return null;
  resetChartInstance(chartKey || canvasId);
  host.dataset.chartId = canvasId;
  host.innerHTML = '';
  host.classList.add('simple-chart-host');
  return host;
}

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
}

function renderEmptyChart(canvasId, chartKey, msg='Sin datos suficientes para mostrar.'){
  const host = chartHost(canvasId, chartKey);
  if(!host) return;
  host.innerHTML = `<div class="chart-empty">${escapeHtml(msg)}</div>`;
}

function renderBarList(canvasId, chartKey, items, opts={}){
  const host = chartHost(canvasId, chartKey);
  if(!host) return;
  const clean = (items||[]).filter(x => (x.value||0) > 0);
  if(!clean.length){ renderEmptyChart(canvasId, chartKey); return; }
  const max = Math.max(...clean.map(x => x.value), 1);
  host.innerHTML = `<div class="simple-bars ${opts.horizontal ? 'horizontal' : ''}">
    ${clean.map((x, i) => {
      const pct = Math.max(3, (x.value / max) * 100);
      const color = x.color || 'var(--brand-green)';
      return `<div class="simple-bar-row" style="--pct:${pct}%;--bar:${color};--delay:${i*45}ms">
        <div class="simple-bar-label"><span>${escapeHtml(x.label)}</span><strong>${fmt(x.value)}</strong></div>
        <div class="simple-bar-track"><i></i></div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderDonut(canvasId, chartKey, items){
  const host = chartHost(canvasId, chartKey);
  if(!host) return;
  const clean = (items||[]).filter(x => (x.value||0) > 0);
  if(!clean.length){ renderEmptyChart(canvasId, chartKey); return; }
  const total = clean.reduce((a,b)=>a+b.value,0);
  let acc = 0;
  const stops = clean.map(x => {
    const start = (acc / total) * 100;
    acc += x.value;
    const end = (acc / total) * 100;
    return `${x.color || 'var(--brand-green)'} ${start}% ${end}%`;
  }).join(', ');
  host.innerHTML = `<div class="simple-donut-wrap">
    <div class="simple-donut" style="background:conic-gradient(${stops})"><span>${fmt(total)}</span><small>Total</small></div>
    <div class="simple-legend">
      ${clean.map(x => `<div><i style="background:${x.color || 'var(--brand-green)'}"></i><span>${escapeHtml(x.label)}</span><strong>${fmt(x.value)}</strong></div>`).join('')}
    </div>
  </div>`;
}

function renderLineSvg(canvasId, chartKey, labels, values, opts={}){
  const host = chartHost(canvasId, chartKey);
  if(!host) return;
  if(!values || values.length < 2){ renderEmptyChart(canvasId, chartKey, 'Se necesitan al menos 2 períodos para tendencias.'); return; }
  const width = 760, height = opts.height || 260, pad = 34;
  const min = Math.min(...values, 0), max = Math.max(...values, 1);
  const span = Math.max(1, max - min);
  const pts = values.map((v,i)=>{
    const x = pad + (i * (width - pad*2) / Math.max(1, values.length-1));
    const y = height - pad - ((v-min)/span)*(height-pad*2);
    return [x,y];
  });
  const path = pts.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${path} L${pts.at(-1)[0].toFixed(1)},${height-pad} L${pts[0][0].toFixed(1)},${height-pad} Z`;
  const ticks = [0, .25, .5, .75, 1].map(t => {
    const y = height - pad - t*(height-pad*2);
    const val = Math.round(min + t*span);
    return `<line x1="${pad}" x2="${width-pad}" y1="${y}" y2="${y}"/><text x="6" y="${y+4}">${fmt(val)}</text>`;
  }).join('');
  const labelMarks = labels.map((l,i)=> i % Math.ceil(labels.length/6) === 0 || i===labels.length-1 ? `<text class="x-label" x="${pts[i][0]}" y="${height-7}" text-anchor="middle">${escapeHtml(String(l).replace(' de ', ' '))}</text>` : '').join('');
  host.innerHTML = `<div class="svg-chart-wrap"><svg class="svg-line-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
    <g class="grid">${ticks}</g>
    <path class="area" d="${area}"></path>
    <path class="line" d="${path}"></path>
    ${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4"></circle>`).join('')}
    <g class="x-axis">${labelMarks}</g>
  </svg></div>`;
}

function renderMultiLineSvg(canvasId, chartKey, labels, series){
  const host = chartHost(canvasId, chartKey);
  if(!host) return;
  if(!series?.length || labels.length < 2){ renderEmptyChart(canvasId, chartKey, 'Se necesitan datos históricos.'); return; }
  const width = 760, height = 250, pad = 34;
  const all = series.flatMap(s => s.values);
  const min = 0, max = Math.max(...all, 1);
  const pathFor = vals => vals.map((v,i)=>{
    const x = pad + (i * (width - pad*2) / Math.max(1, vals.length-1));
    const y = height - pad - ((v-min)/Math.max(1,max-min))*(height-pad*2);
    return `${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  host.innerHTML = `<div class="svg-chart-wrap"><svg class="svg-line-chart multi" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
    <g class="grid">${[0,.25,.5,.75,1].map(t=>{ const y=height-pad-t*(height-pad*2); return `<line x1="${pad}" x2="${width-pad}" y1="${y}" y2="${y}"/>`; }).join('')}</g>
    ${series.map(s=>`<path class="line" style="stroke:${s.color}" d="${pathFor(s.values)}"></path>`).join('')}
  </svg></div>
  <div class="simple-legend compact">${series.map(s=>`<div><i style="background:${s.color}"></i><span>${escapeHtml(s.label)}</span></div>`).join('')}</div>`;
}

function renderGrowthBars(canvasId, chartKey, labels, values){
  const items = values.map((v,i)=>({ label: labels[i], value: Math.round(Math.abs(v)*10)/10, color: v >= 0 ? 'var(--ok)' : 'var(--err)' }));
  renderBarList(canvasId, chartKey, items, { horizontal:true });
}

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
  } else {
    // Construye dataset inicial:
    // 1. Histórico simulado mensual sept-2024 → diciembre-2025
    // 2. Para enero-abril 2026, el reporte detallado del PDF se distribuye en 4 meses
    const history = generateMonthlyHistory();
    const summary = aggregateModuleSummary(REPORT_2026_Q1.modules);
    // El PDF cubre 4 meses (ene-abr 2026); creamos 4 períodos mensuales que comparten
    // el detalle por módulo y dividen el summary entre 4 con pequeña variación
    const ene = createDistributedPeriod(2026, 0, REPORT_2026_Q1.modules, summary, 0.21);
    const feb = createDistributedPeriod(2026, 1, REPORT_2026_Q1.modules, summary, 0.24);
    const mar = createDistributedPeriod(2026, 2, REPORT_2026_Q1.modules, summary, 0.26);
    const abr = createDistributedPeriod(2026, 3, REPORT_2026_Q1.modules, summary, 0.29);
    history.push(ene, feb, mar, abr);
    STATE.periods = history;
    saveStorage({ periods: STATE.periods });
  }
  STATE.currentPeriodIdx = STATE.periods.length - 1;
}

/* Crea un período mensual con porción del summary y modules proporcionalmente */
function createDistributedPeriod(year, month, modulesSrc, summarySrc, fraction){
  const date = new Date(year, month, 1);
  const period = `${year}-${String(month+1).padStart(2,'0')}`;
  const label = date.toLocaleString('es-MX', { month:'long', year:'numeric' });
  const modules = {};
  Object.entries(modulesSrc||{}).forEach(([id, m]) => {
    modules[id] = {
      medicos: Math.round((m.medicos||0) * fraction),
      odonto: Math.round((m.odonto||0) * fraction),
      enfermeria: Math.round((m.enfermeria||0) * fraction),
      rehab: Math.round((m.rehab||0) * fraction),
      mental: Math.round((m.mental||0) * fraction),
      nutri: Math.round((m.nutri||0) * fraction)
    };
  });
  return {
    period, label,
    uploadedBy: 'Reporte Ene-Abr 2026 (PDF)',
    uploadedAt: new Date().toISOString(),
    modules,
    summary: aggregateModuleSummary(modules)
  };
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
        ? `rgba(141,198,63,${p.a})`
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
          ctx.strokeStyle = `rgba(141,198,63,${0.1 * (1 - d/110)})`;
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
    if(USERS[user] && USERS[user].password === pass){
      STATE.currentUser = user;
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

function onLoggedIn(){
  const u = USERS[STATE.currentUser];
  $('#userName').textContent = u.name;
  $('#userAvatar').textContent = u.name[0];
  $('#userAvatar').style.background = `linear-gradient(135deg, ${u.color}, ${u.color}dd)`;
  $('#loadAuthor').value = u.name;
  toast(`Bienvenida ${u.name}`, 'success');
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
      document.body.appendChild(bd);
    }
    bd.classList.toggle('show');
  });

  // logout
  $('#logoutBtn').addEventListener('click', () => {
    STATE.currentUser = null;
    STATE.selectedUser = null;
    $('#password').value = '';
    $$('.user-chip').forEach(c => c.classList.remove('selected'));
    $('#app').classList.add('hidden');
    $('#login').classList.remove('hidden');
  });

  // selector de período
  const sel = $('#periodSelect');
  populatePeriodSelect();
  sel.addEventListener('change', () => {
    STATE.currentPeriodIdx = sel.value === 'all' ? 'all' : Number(sel.value);
    refreshAll();
  });
}

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

function setTrend(el, current, prev){
  if(prev === undefined || prev === null){ el.textContent=''; return; }
  const diff = current - prev;
  const pct = prev === 0 ? 0 : (diff / prev) * 100;
  const arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '—';
  const cls = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
  el.className = `kpi-trend ${cls}`;
  el.textContent = `${arrow} ${Math.abs(pct).toFixed(1)}% vs período anterior`;
}

/* ============================================================
   RESUMEN / KPIs
   ============================================================ */
function renderOverview(){
  const cur = getCurrentPeriod();
  if(!cur) return;
  // Verificar que Chart.js esté disponible
  if(typeof Chart === 'undefined'){
    console.warn('Chart.js no cargó. Las gráficas no se mostrarán.');
  }
  // Verificar que el contenedor de gráficas esté dimensionado
  const distEl = $('#distChart');
  if(distEl && distEl.parentElement.clientWidth === 0){
    return requestAnimationFrame(renderOverview);
  }
  const prev = getPreviousPeriod();
  const s = cur.summary || aggregateModuleSummary(cur.modules);
  const total = s.medicos + s.odonto + s.enfermeria + s.rehab + s.mental + s.nutri;

  $('#heroPeriod').textContent = cur.period === 'all' ? `Datos acumulados: ${cur.rangeLabel}` : `Datos del período: ${cur.label}`;

  animateNumber($('#kpiTotal'), total);
  animateNumber($('#kpiMedicos'), s.medicos);
  animateNumber($('#kpiOdonto'), s.odonto);
  animateNumber($('#kpiEnfermeria'), s.enfermeria);
  animateNumber($('#kpiRehab'), s.rehab);
  animateNumber($('#kpiMental'), s.mental);

  if(prev){
    const sp = prev.summary || aggregateModuleSummary(prev.modules);
    const totalPrev = sp.medicos + sp.odonto + sp.enfermeria + sp.rehab + sp.mental + sp.nutri;
    setTrend($('#kpiTotalTrend'), total, totalPrev);
    setTrend($('#kpiMedicosTrend'), s.medicos, sp.medicos);
    setTrend($('#kpiOdontoTrend'), s.odonto, sp.odonto);
    setTrend($('#kpiEnfermeriaTrend'), s.enfermeria, sp.enfermeria);
    setTrend($('#kpiRehabTrend'), s.rehab, sp.rehab);
    setTrend($('#kpiMentalTrend'), s.mental, sp.mental);
  } else {
    ['#kpiTotalTrend','#kpiMedicosTrend','#kpiOdontoTrend','#kpiEnfermeriaTrend','#kpiRehabTrend','#kpiMentalTrend'].forEach(id => {
      const el = $(id);
      if(el) { el.className = 'kpi-trend flat'; el.textContent = 'Acumulado histórico'; }
    });
  }

  renderSparkline(s);
  renderDistChart(s);
  renderTopChart(cur);
  renderGenderChart(cur);
  renderStatusChart(cur);
}

function renderSparkline(){
  const canvas = $('#sparkTotal');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(160, rect.width || 180);
  const h = Math.max(38, rect.height || 40);
  canvas.width = w*dpr; canvas.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  const last = STATE.periods.slice(-8);
  const data = last.map(p => {
    const s = p.summary || aggregateModuleSummary(p.modules || {});
    return SERVICE_DEFS.reduce((a,d)=>a+(s[d.key]||0),0);
  });
  if(data.length < 2) return;
  const max = Math.max(...data), min = Math.min(...data);
  const span = Math.max(1, max-min);
  ctx.beginPath();
  data.forEach((v,i)=>{
    const x = i*(w/(data.length-1));
    const y = h - 4 - ((v-min)/span)*(h-8);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.strokeStyle = 'rgba(255,255,255,.95)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

function renderDistChart(s, mode='bar'){
  const items = SERVICE_DEFS.map(d => ({ label:d.label, value:s[d.key] || 0, color:d.color }));
  if(mode === 'doughnut') renderDonut('distChart', 'dist', items);
  else renderBarList('distChart', 'dist', items);
}

function renderTopChart(period){
  if(!period.modules){ renderEmptyChart('topChart','top'); return; }
  const arr = Object.entries(period.modules).map(([id, m]) => {
    const total = SERVICE_DEFS.reduce((a,d)=>a+(m[d.key]||0),0);
    const mod = MODULES.find(x => x.id===id);
    return { label: mod?.name || id, value: total, color:'var(--brand-green)' };
  }).filter(x => x.value > 0).sort((a,b)=> b.value - a.value).slice(0, 10);
  renderBarList('topChart', 'top', arr, { horizontal:true });
}

function renderGenderChart(period){
  const s = period.summary || aggregateModuleSummary(period.modules || {});
  const total = SERVICE_DEFS.reduce((a,d)=>a+(s[d.key]||0),0);
  const h = Math.round(total * 0.323);
  const m = total - h;
  renderDonut('genderChart', 'gender', [
    { label:'Hombres', value:h, color:'var(--brand-blue)' },
    { label:'Mujeres', value:m, color:'var(--accent-pink)' }
  ]);
}

function renderStatusChart(){
  const counts = { ACTIVO:0, RECONV:0, CERRADO:0 };
  MODULES.forEach(m => counts[m.status] = (counts[m.status]||0) + 1);
  renderBarList('statusChart', 'status', [
    { label:'Activos', value:counts.ACTIVO, color:'var(--brand-green)' },
    { label:'Reconvertidos', value:counts.RECONV, color:'var(--accent-orange)' },
    { label:'Cerrados', value:counts.CERRADO, color:'var(--text-light)' }
  ]);
}

/* Tabs de chart de distribución */
function initChartTabs(){
  $$('[data-chart-mode]').forEach(b => b.addEventListener('click', () => {
    $$('[data-chart-mode]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const mode = b.dataset.chartMode;
    const cur = getCurrentPeriod();
    const s = cur.summary || aggregateModuleSummary(cur.modules);
    renderDistChart(s, mode);
  }));
}

/* ============================================================
   MÓDULOS (lista detallada)
   ============================================================ */
function renderModules(){
  const cur = getCurrentPeriod();
  const search = $('#moduleSearch').value.toLowerCase();
  const status = $('#statusFilter').value;
  const grid = $('#modulesGrid');
  grid.innerHTML = '';

  MODULES.forEach(mod => {
    if(status !== 'all' && mod.status !== status) return;
    if(search && !mod.name.toLowerCase().includes(search) && !(mod.colony||'').toLowerCase().includes(search)) return;
    const m = (cur.modules && cur.modules[mod.id]) || {};
    const total = (m.medicos||0)+(m.odonto||0)+(m.enfermeria||0)+(m.rehab||0)+(m.mental||0)+(m.nutri||0);
    const card = document.createElement('div');
    card.className = `module-card status-${mod.status}`;
    card.innerHTML = `
      <div class="module-head">
        <div class="module-name">${mod.name}<br><small class="muted" style="font-weight:500">${mod.colony||''}</small></div>
        <span class="module-status status-${mod.status}">${mod.status}</span>
      </div>
      <div class="module-stats">
        <div class="module-stat"><div class="module-stat-label">Médicos</div><div class="module-stat-value">${fmt(m.medicos)}</div></div>
        <div class="module-stat"><div class="module-stat-label">Odontología</div><div class="module-stat-value">${fmt(m.odonto)}</div></div>
        <div class="module-stat"><div class="module-stat-label">Enfermería</div><div class="module-stat-value">${fmt(m.enfermeria)}</div></div>
        <div class="module-stat"><div class="module-stat-label">Rehabilitación</div><div class="module-stat-value">${fmt(m.rehab)}</div></div>
        <div class="module-stat"><div class="module-stat-label">Salud Mental</div><div class="module-stat-value">${fmt(m.mental)}</div></div>
        <div class="module-stat"><div class="module-stat-label">Nutrición</div><div class="module-stat-value">${fmt(m.nutri)}</div></div>
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
  const map = L.map('map', {
    center:[20.97, -89.62],
    zoom: 12,
    scrollWheelZoom: true
  });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap · CARTO',
    maxZoom: 19
  }).addTo(map);
  STATE.map = map;
  drawMapMarkers();
}

function drawMapMarkers(){
  if(!STATE.map) return;
  STATE.mapMarkers.forEach(m => STATE.map.removeLayer(m));
  STATE.mapMarkers = [];

  const cur = getCurrentPeriod();

  MODULES.forEach(mod => {
    if(!mod.lat || !mod.lng) return;
    const m = (cur.modules && cur.modules[mod.id]) || {};
    const total = (m.medicos||0)+(m.odonto||0)+(m.enfermeria||0)+(m.rehab||0)+(m.mental||0)+(m.nutri||0);
    const cls = mod.status==='CERRADO' ? 'cerrado' : mod.status==='RECONV' ? 'reconv' : '';
    const marker = L.marker([mod.lat, mod.lng], {
      icon: L.divIcon({
        className:'',
        html:`<div class="module-marker ${cls}">${mod.name.substring(0,2).toUpperCase()}</div>`,
        iconSize:[32,32], iconAnchor:[16,16]
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
}

/* ============================================================
   TENDENCIAS
   ============================================================ */
function renderTrends(){
  const visible = $('#view-trends')?.classList.contains('active');
  if(!visible) return;
  const last12 = STATE.periods.slice(-12);
  const labels = last12.map(p => p.label);
  const totals = last12.map(p => {
    const s = p.summary || aggregateModuleSummary(p.modules || {});
    return SERVICE_DEFS.reduce((a,d)=>a+(s[d.key]||0),0);
  });

  renderLineSvg('trendChart', 'trend', labels, totals, { height: 310 });

  const series = [
    { key:'medicos', label:'Médicos', color:'var(--brand-blue)' },
    { key:'odonto', label:'Odontología', color:'var(--brand-green)' },
    { key:'enfermeria', label:'Enfermería', color:'var(--accent-orange)' }
  ].map(def => ({
    label:def.label,
    color:def.color,
    values:last12.map(p => (p.summary || aggregateModuleSummary(p.modules || {}))[def.key] || 0)
  }));
  renderMultiLineSvg('multiTrendChart', 'multi', labels, series);

  const growth = totals.map((v, i) => {
    if(i===0) return 0;
    const prev = totals[i-1];
    return prev === 0 ? 0 : ((v - prev) / prev * 100);
  });
  renderGrowthBars('growthChart', 'growth', labels, growth);
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
    modulesData[id] = obj;
  });
  const summary = aggregateModuleSummary(modulesData);

  const newPeriod = {
    period, label,
    uploadedBy: USERS[STATE.currentUser].name,
    uploadedAt: new Date().toISOString(),
    modules: modulesData,
    summary
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
  saveStorage({ periods: STATE.periods });

  // intenta sincronizar a Apps Script
  const r = await syncToAppsScript('savePeriod', newPeriod);
  if(r) toast(`Mes ${label} guardado y sincronizado`, 'success');
  else toast(`Mes ${label} guardado (local)`, 'success');

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
    STATE.currentPeriodIdx = STATE.periods.findIndex(p => p.period === b.dataset.period);
    $('#periodSelect').value = STATE.currentPeriodIdx;
    document.querySelector('[data-view="overview"]').click();
  }));
  list.querySelectorAll('.history-del').forEach(b => b.addEventListener('click', () => {
    if(!confirm('¿Eliminar este período?')) return;
    STATE.periods = STATE.periods.filter(p => p.period !== b.dataset.period);
    if(STATE.currentPeriodIdx >= STATE.periods.length) STATE.currentPeriodIdx = STATE.periods.length-1;
    saveStorage({ periods: STATE.periods });
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
      saveStorage({ periods: STATE.periods });
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
  const fill = (selId, items) => {
    const ul = $(selId);
    ul.innerHTML = items.map(it => `
      <li><span class="lbl">${it.lbl}</span><span class="num">${fmt(it.num)}</span></li>
    `).join('');
  };
  fill('#priSalud', PRIORITY_DATA.salud);
  fill('#priMujeres', PRIORITY_DATA.mujeres);
  fill('#priMental', PRIORITY_DATA.mental);
}

/* ============================================================
   FILTROS DE MÓDULOS
   ============================================================ */
function initModuleFilters(){
  $('#moduleSearch').addEventListener('input', renderModules);
  $('#statusFilter').addEventListener('change', renderModules);
}

/* ============================================================
   REFRESH GENERAL
   ============================================================ */
function refreshAll(){
  populatePeriodSelect();
  renderOverview();
  if($('#view-modules').classList.contains('active')) renderModules();
  if($('#view-trends').classList.contains('active')) renderTrends();
  if($('#view-priority').classList.contains('active')) renderPriority();
  if($('#view-data').classList.contains('active')) renderHistory();
  if(STATE.map) drawMapMarkers();
  resizeChartsSoon();
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
    saveStorage({ periods: STATE.periods });
    document.querySelector('.sync-status .sync-dot').style.background = '#56AB2F';
    document.querySelector('.sync-status small').textContent = 'Conectado a la nube';
  }

  initParticles();

  // Splash → Login
  setTimeout(() => {
    $('#splash').style.display = 'none';
    $('#login').classList.remove('hidden');
  }, 2900);

  initLogin();
  initNav();
  initChartTabs();
  initModuleFilters();
  window.addEventListener('resize', () => { if($('#view-overview')?.classList.contains('active')) renderOverview(); if($('#view-trends')?.classList.contains('active')) renderTrends(); });
}

document.addEventListener('DOMContentLoaded', boot);

})();
