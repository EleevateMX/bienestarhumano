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
  } else {
    // Construye dataset inicial con histórico simulado + reporte 2026 Q1
    const history = generateMonthlyHistory();
    // Adjuntamos el reporte detallado
    history.push({
      period: REPORT_2026_Q1.period,
      label: REPORT_2026_Q1.label,
      uploadedBy: REPORT_2026_Q1.uploadedBy,
      uploadedAt: REPORT_2026_Q1.uploadedAt,
      modules: REPORT_2026_Q1.modules,
      summary: aggregateModuleSummary(REPORT_2026_Q1.modules)
    });
    STATE.periods = history;
    saveStorage({ periods: STATE.periods });
  }
  STATE.currentPeriodIdx = STATE.periods.length - 1;
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
      // refrescar vista correspondiente
      if(view==='map') setTimeout(()=> { initMap(); STATE.map?.invalidateSize(); }, 100);
      if(view==='trends') renderTrends();
      if(view==='modules') renderModules();
      if(view==='priority') renderPriority();
      if(view==='data') renderDataLoader();
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
  sel.innerHTML = '';
  STATE.periods.forEach((p, idx) => {
    const o = document.createElement('option');
    o.value = idx;
    o.textContent = p.label;
    sel.appendChild(o);
  });
  sel.value = STATE.currentPeriodIdx;
  sel.addEventListener('change', () => {
    STATE.currentPeriodIdx = +sel.value;
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
  const cur = STATE.periods[STATE.currentPeriodIdx];
  if(!cur) return;
  const prev = STATE.periods[STATE.currentPeriodIdx-1];
  const s = cur.summary || aggregateModuleSummary(cur.modules);
  const total = s.medicos + s.odonto + s.enfermeria + s.rehab + s.mental + s.nutri;

  $('#heroPeriod').textContent = `Datos del período: ${cur.label}`;

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
  }

  renderSparkline(s);
  renderDistChart(s);
  renderTopChart(cur);
  renderGenderChart(cur);
  renderStatusChart(cur);
}

function renderSparkline(){
  // Pequeño sparkline en el KPI principal con los últimos 8 períodos
  const last = STATE.periods.slice(-8);
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
      datasets:[{ data: arr.map(x => x.total), backgroundColor:'#56AB2F', borderRadius:6 }]
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
  // Tomamos la proporción del PDF: ~32% H / 68% M
  const s = period.summary || aggregateModuleSummary(period.modules);
  const total = s.medicos + s.odonto + s.enfermeria + s.rehab + s.mental + s.nutri;
  const h = Math.round(total * 0.323);
  const m = total - h;
  const ctx = $('#genderChart').getContext('2d');
  if(STATE.charts.gender) STATE.charts.gender.destroy();
  STATE.charts.gender = new Chart(ctx, {
    type:'doughnut',
    data:{
      labels:['Hombres','Mujeres'],
      datasets:[{ data:[h,m], backgroundColor:['#0E2A6B','#EC4899'], borderColor:'#fff', borderWidth:3 }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      cutout:'65%',
      animation:{ duration: 1100 },
      plugins:{ legend:{ position:'bottom' } }
    }
  });
}

function renderStatusChart(period){
  const counts = { ACTIVO:0, RECONV:0, CERRADO:0 };
  MODULES.forEach(m => counts[m.status] = (counts[m.status]||0) + 1);
  const ctx = $('#statusChart').getContext('2d');
  if(STATE.charts.status) STATE.charts.status.destroy();
  STATE.charts.status = new Chart(ctx, {
    type:'polarArea',
    data:{
      labels:['Activos','Reconvertidos','Cerrados'],
      datasets:[{
        data:[counts.ACTIVO, counts.RECONV, counts.CERRADO],
        backgroundColor:['rgba(141,198,63,.7)','rgba(245,158,11,.7)','rgba(100,116,139,.5)'],
        borderColor:['#56AB2F','#F59E0B','#64748B'], borderWidth:2
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
    const cur = STATE.periods[STATE.currentPeriodIdx];
    const s = cur.summary || aggregateModuleSummary(cur.modules);
    renderDistChart(s, mode);
  }));
}

/* ============================================================
   MÓDULOS (lista detallada)
   ============================================================ */
function renderModules(){
  const cur = STATE.periods[STATE.currentPeriodIdx];
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

  const cur = STATE.periods[STATE.currentPeriodIdx];

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
  const last12 = STATE.periods.slice(-12);
  const labels = last12.map(p => p.label);
  const totals = last12.map(p => {
    const s = p.summary || aggregateModuleSummary(p.modules);
    return s.medicos + s.odonto + s.enfermeria + s.rehab + s.mental + s.nutri;
  });

  const ctxT = $('#trendChart').getContext('2d');
  if(STATE.charts.trend) STATE.charts.trend.destroy();
  // Gradient
  const grad = ctxT.createLinearGradient(0,0,0,300);
  grad.addColorStop(0,'rgba(141,198,63,.5)');
  grad.addColorStop(1,'rgba(141,198,63,0)');
  STATE.charts.trend = new Chart(ctxT, {
    type:'line',
    data:{ labels, datasets:[{
      label:'Atenciones totales',
      data: totals,
      borderColor:'#56AB2F', backgroundColor: grad,
      fill:true, tension:.4, pointRadius:4, pointBackgroundColor:'#56AB2F', borderWidth:3
    }]},
    options:{
      responsive:true, maintainAspectRatio:false,
      animation:{ duration: 1400, easing:'easeOutCubic' },
      plugins:{ legend:{ display:false } },
      scales:{ y:{ beginAtZero:true, grid:{ color:'#EDF2F7' } }, x:{ grid:{ display:false } } }
    }
  });

  // Multi-trend
  const series = ['medicos','odonto','enfermeria'];
  const colors = ['#1E50C5','#56AB2F','#F59E0B'];
  const ctxM = $('#multiTrendChart').getContext('2d');
  if(STATE.charts.multi) STATE.charts.multi.destroy();
  STATE.charts.multi = new Chart(ctxM, {
    type:'line',
    data:{
      labels,
      datasets: series.map((k, i) => ({
        label: SERVICE_DEFS.find(s => s.key===k).label,
        data: last12.map(p => (p.summary||aggregateModuleSummary(p.modules))[k] || 0),
        borderColor: colors[i], backgroundColor: colors[i]+'22',
        tension:.4, borderWidth:2.5, pointRadius:3
      }))
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      animation:{ duration: 1100 },
      plugins:{ legend:{ position:'bottom' } },
      scales:{ y:{ beginAtZero:true, grid:{ color:'#EDF2F7' } }, x:{ grid:{ display:false } } }
    }
  });

  // Crecimiento %
  const growth = totals.map((v, i) => {
    if(i===0) return 0;
    const prev = totals[i-1];
    return prev === 0 ? 0 : ((v - prev) / prev * 100);
  });
  const ctxG = $('#growthChart').getContext('2d');
  if(STATE.charts.growth) STATE.charts.growth.destroy();
  STATE.charts.growth = new Chart(ctxG, {
    type:'bar',
    data:{
      labels,
      datasets:[{
        data: growth,
        backgroundColor: growth.map(g => g >= 0 ? '#56AB2F' : '#EF4444'),
        borderRadius: 6
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      animation:{ duration: 1100 },
      plugins:{
        legend:{ display:false },
        tooltip:{ callbacks:{ label: (c) => c.parsed.y.toFixed(1) + ' %' } }
      },
      scales:{ y:{ grid:{ color:'#EDF2F7' }, ticks:{ callback: v => v + '%' } }, x:{ grid:{ display:false } } }
    }
  });
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
  $('#periodSelect').innerHTML = '';
  STATE.periods.forEach((p, idx) => {
    const o = document.createElement('option');
    o.value = idx; o.textContent = p.label;
    $('#periodSelect').appendChild(o);
  });
  $('#periodSelect').value = STATE.currentPeriodIdx;
  renderOverview();
  if($('#view-modules').classList.contains('active')) renderModules();
  if($('#view-trends').classList.contains('active')) renderTrends();
  if($('#view-priority').classList.contains('active')) renderPriority();
  if($('#view-data').classList.contains('active')) renderHistory();
  if(STATE.map) drawMapMarkers();
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
}

document.addEventListener('DOMContentLoaded', boot);

})();
