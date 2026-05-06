/* ============================================================
   BIENESTAR HUMANO — APLICACIÓN PRINCIPAL V8 ROLES + DEPORTE
   - Gráficas nativas sin depender de Chart.js
   - Módulos activos: 23 Salud + 5 AlmaNova
   - Selector de tablero: Salud / Educación / Deporte
   - Mobile compatible con mobile.html
   ============================================================ */
(() => {
'use strict';

const STATE = {
  currentUser: null,
  selectedUser: null,
  currentProgram: 'salud',
  periods: [],
  currentPeriodIdx: 'all',
  map: null,
  mapMarkers: []
};

const STORAGE_KEY = 'bh_merida_v8_roles_deporte';
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const fmt = (n) => (Number(n)||0).toLocaleString('es-MX');
const svcKeys = () => SERVICE_DEFS.map(s => s.key);
const totalOf = (m={}) => svcKeys().reduce((a,k)=>a+(Number(m[k])||0),0);
const isMental = (mod) => mod.type === 'mental';
const offeredServices = (mod) => SERVICE_DEFS.filter(s => (mod.services || svcKeys()).includes(s.key));
const serviceLabel = (key) => SERVICE_DEFS.find(s => s.key === key)?.label || key;
const saludModules = () => MODULES.filter(m => !isMental(m));
const almanovaModules = () => MODULES.filter(m => isMental(m));
const activeModules = () => MODULES;
const educationVenues = () => (typeof EDUCATION_CATALOG !== 'undefined' ? EDUCATION_CATALOG.venues || [] : []);
const educationCategories = () => (typeof EDUCATION_CATALOG !== 'undefined' ? EDUCATION_CATALOG.categories || [] : []);
const educationHas = (venue, key) => Boolean(venue && venue[key]);

const sportsUnits = () => (typeof SPORTS_CATALOG !== 'undefined' ? SPORTS_CATALOG.units || [] : []);
const sportsCommittees = () => (typeof SPORTS_CATALOG !== 'undefined' ? SPORTS_CATALOG.committees || [] : []);
const sportsSummary = () => (typeof SPORTS_CATALOG !== 'undefined' ? SPORTS_CATALOG.summary || {} : {});
const currentUserAllowedPrograms = () => USERS[STATE.currentUser]?.allowedPrograms || ['salud'];
const canAccessProgram = (program) => currentUserAllowedPrograms().includes(program);
const programLabel = (program) => ({salud:'Salud', educacion:'Educación', deporte:'Deporte'}[program] || program);


function toast(msg, type='success'){
  const el = $('#toast');
  if(!el) return;
  el.textContent = msg;
  el.className = `toast show ${type}`;
  setTimeout(()=> el.classList.remove('show'), 2600);
}

function loadStorage(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
  catch{ return null; }
}
function saveStorage(state){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){ console.warn(e); }
}

function aggregateModuleSummary(modulesData){
  const out = { medicos:0, odonto:0, enfermeria:0, rehab:0, mental:0, nutri:0 };
  Object.values(modulesData||{}).forEach(m => svcKeys().forEach(k => out[k] += Number(m[k]) || 0));
  return out;
}

function createDistributedPeriod(year, month, modulesSrc, fraction){
  const date = new Date(year, month, 1);
  const period = `${year}-${String(month+1).padStart(2,'0')}`;
  const label = date.toLocaleString('es-MX', { month:'long', year:'numeric' });
  const modules = {};
  Object.entries(modulesSrc||{}).forEach(([id,m]) => {
    modules[id] = {};
    svcKeys().forEach(k => modules[id][k] = Math.round((Number(m[k])||0) * fraction));
  });
  return { period, label, uploadedBy:'Datos iniciales', uploadedAt:new Date().toISOString(), modules, summary: aggregateModuleSummary(modules) };
}

function initData(){
  const stored = loadStorage();
  if(stored && Array.isArray(stored.periods) && stored.periods.length){
    STATE.periods = stored.periods;
  }else{
    const history = generateMonthlyHistory();
    history.push(
      createDistributedPeriod(2026,0,REPORT_2026_Q1.modules,.21),
      createDistributedPeriod(2026,1,REPORT_2026_Q1.modules,.24),
      createDistributedPeriod(2026,2,REPORT_2026_Q1.modules,.26),
      createDistributedPeriod(2026,3,REPORT_2026_Q1.modules,.29)
    );
    STATE.periods = history;
    saveStorage({ periods: STATE.periods });
  }
  STATE.currentPeriodIdx = 'all';
}

function buildAllPeriods(){
  const summary = { medicos:0, odonto:0, enfermeria:0, rehab:0, mental:0, nutri:0 };
  const modules = {};
  STATE.periods.forEach(p => {
    const ps = p.summary || aggregateModuleSummary(p.modules || {});
    svcKeys().forEach(k => summary[k] += Number(ps[k]) || 0);
    Object.entries(p.modules || {}).forEach(([id,m]) => {
      if(!modules[id]) modules[id] = { medicos:0, odonto:0, enfermeria:0, rehab:0, mental:0, nutri:0 };
      svcKeys().forEach(k => modules[id][k] += Number(m[k]) || 0);
    });
  });
  const first = STATE.periods[0]?.label || 'inicio';
  const last = STATE.periods[STATE.periods.length-1]?.label || 'actual';
  return { period:'all', label:'Desde el principio', rangeLabel:`${first} — ${last}`, modules, summary };
}
function getCurrentPeriod(){ return STATE.currentPeriodIdx === 'all' ? buildAllPeriods() : STATE.periods[Number(STATE.currentPeriodIdx)] || buildAllPeriods(); }
function getPreviousPeriod(){ return STATE.currentPeriodIdx === 'all' ? null : STATE.periods[Number(STATE.currentPeriodIdx)-1] || null; }

function populatePeriodSelect(){
  const sel = $('#periodSelect'); if(!sel) return;
  const current = STATE.currentPeriodIdx;
  sel.innerHTML = '<option value="all">Desde el principio</option>';
  STATE.periods.forEach((p,i)=> sel.insertAdjacentHTML('beforeend', `<option value="${i}">${p.label}</option>`));
  sel.value = String(current);
}

function chartHost(id){
  const old = document.getElementById(id);
  if(old){
    const host = old.closest('.chart-body') || old.parentElement;
    host.dataset.chart = id;
    return host;
  }
  return document.querySelector(`[data-chart="${id}"]`);
}
function setChart(id, html){ const host = chartHost(id); if(host) host.innerHTML = html; }
function escapeHtml(s){ return String(s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function nativeBars(id, labels, values, colors){
  const max = Math.max(1, ...values.map(Number));
  const rows = labels.map((l,i)=>{
    const val = Number(values[i])||0;
    const pct = Math.max(2, val/max*100);
    const color = colors?.[i] || '#56AB2F';
    return `<div class="native-bar-row"><div class="native-bar-label">${escapeHtml(l)}</div><div class="native-bar-track"><div class="native-bar-fill" style="width:${pct}%;background:${color}"></div></div><div class="native-bar-value">${fmt(val)}</div></div>`;
  }).join('');
  setChart(id, `<div class="native-chart native-bars">${rows}</div>`);
}
function nativeDonut(id, labels, values, colors){
  const total = values.reduce((a,b)=>a+(Number(b)||0),0) || 0;
  const safeTotal = total || 1;
  let startDeg = 0;
  const segments = values.map((v,i)=>{
    const deg = (Number(v)||0) / safeTotal * 360;
    const seg = `${colors[i]||'#56AB2F'} ${startDeg}deg ${startDeg + deg}deg`;
    startDeg += deg;
    return seg;
  }).join(', ');
  const items = labels.map((l,i)=>`<div class="donut-legend-item"><span style="background:${colors[i]}"></span>${escapeHtml(l)} <strong>${fmt(values[i])}</strong></div>`).join('');
  setChart(id, `<div class="native-donut"><div class="donut-chart" style="background:conic-gradient(${segments || '#E2E8F0 0deg 360deg'});"><div class="donut-core"><strong>${fmt(total)}</strong><small>Total</small></div></div><div class="donut-legend">${items}</div></div>`);
}
function nativeLine(id, labels, values){
  const w=900,h=260,pad=28;
  const max=Math.max(1,...values), min=Math.min(...values,0);
  const x=(i)=> pad + (i/(Math.max(1,values.length-1))) * (w-pad*2);
  const y=(v)=> h-pad - ((v-min)/(max-min||1))*(h-pad*2);
  const points = values.map((v,i)=>`${x(i)},${y(v)}`).join(' ');
  const dots = values.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="5"><title>${labels[i]}: ${fmt(v)}</title></circle>`).join('');
  const labelHtml = labels.map(l=>`<span>${escapeHtml(String(l).replace(' de ',' '))}</span>`).join('');
  setChart(id, `<div class="native-line-wrap"><svg viewBox="0 0 ${w} ${h}" class="native-line"><polyline points="${points}"/>${dots}</svg><div class="native-line-labels">${labelHtml}</div></div>`);
}

function setTrend(el, current, prev){
  if(!el) return;
  if(prev === undefined || prev === null){ el.textContent = STATE.currentPeriodIdx === 'all' ? 'Acumulado histórico' : ''; el.className='kpi-trend flat'; return; }
  const diff = current - prev;
  const pct = prev === 0 ? 0 : (diff / prev) * 100;
  el.className = `kpi-trend ${diff>0?'up':diff<0?'down':'flat'}`;
  el.textContent = `${diff>0?'▲':diff<0?'▼':'—'} ${Math.abs(pct).toFixed(1)}% vs período anterior`;
}
function animateNumber(el, target){
  if(!el) return;
  el.textContent = fmt(target);
  el.dataset.current = target;
}


function renderEducationOverview(){
  const venues = educationVenues();
  const cats = educationCategories();
  const english = EDUCATION_CATALOG?.englishEnrollmentSept2024 || {hombres:0,mujeres:0,total:0,sedes:0};
  const hero = $('#heroPeriod');
  if(hero) hero.textContent = 'Catálogo base cargado · indicadores pendientes por alimentar';
  const labels = $$('#view-overview .kpi-label');
  const setLabel=(i,t)=>{ if(labels[i]) labels[i].textContent=t; };
  setLabel(0,'Sedes de educación');
  setLabel(1,'Inglés inscritos');
  setLabel(2,'Sedes con inglés');
  setLabel(3,'Bibliotecas/Ludotecas');
  setLabel(4,'Educación artística');
  setLabel(5,'Acompañamiento académico');
  animateNumber($('#kpiTotal'), venues.length);
  animateNumber($('#kpiMedicos'), english.total);
  animateNumber($('#kpiOdonto'), english.sedes);
  animateNumber($('#kpiEnfermeria'), venues.filter(v=>educationHas(v,'bibliotecas_ludotecas')).length);
  animateNumber($('#kpiRehab'), venues.filter(v=>educationHas(v,'artisticas')).length);
  animateNumber($('#kpiMental'), venues.filter(v=>educationHas(v,'acompanamiento')).length);
  ['kpiTotalTrend','kpiMedicosTrend','kpiOdontoTrend','kpiEnfermeriaTrend','kpiRehabTrend','kpiMentalTrend'].forEach(id=>{ const el=$('#'+id); if(el){ el.className='kpi-trend flat'; el.textContent='Pendiente de captura mensual'; }});
  nativeBars('distChart', cats.map(c=>c.label), cats.map(c=>venues.filter(v=>educationHas(v,c.key)).length), ['#1E50C5','#8B5CF6','#56AB2F','#F59E0B']);
  const byZone = {};
  venues.forEach(v=> byZone[v.zona || 'Sin zona'] = (byZone[v.zona || 'Sin zona'] || 0) + 1);
  const zones = Object.entries(byZone).sort((a,b)=>b[1]-a[1]);
  nativeBars('topChart', zones.map(x=>x[0]), zones.map(x=>x[1]), zones.map((_,i)=>['#0E2A6B','#56AB2F','#F59E0B','#8B5CF6','#EC4899'][i%5]));
  nativeDonut('genderChart', ['Hombres inglés','Mujeres inglés'], [english.hombres, english.mujeres], ['#0E2A6B','#EC4899']);
  nativeDonut('statusChart', ['Sedes catálogo','Sedes inglés'], [venues.length, english.sedes], ['#56AB2F','#0E2A6B']);
}
function renderEducationModules(){
  const grid = $('#modulesGrid'); if(!grid) return;
  const search = ($('#moduleSearch')?.value || '').toLowerCase();
  const venues = educationVenues().filter(v => !search || (v.sede||'').toLowerCase().includes(search) || (v.zona||'').toLowerCase().includes(search));
  grid.innerHTML = '<div class="module-section-title"><h3>Educación · Bibliotecas y talleres</h3><p>Catálogo preparado para acompañamiento académico, educación artística, ludotecas/bibliotecas e inglés.</p></div>';
  venues.forEach(v=>{
    const card=document.createElement('div'); card.className='module-card module-educacion';
    const badges=educationCategories().filter(c=>educationHas(v,c.key)).map(c=>`<span>${escapeHtml(c.label)}</span>`).join('') || '<span>Sin indicador asignado</span>';
    const details=educationCategories().filter(c=>educationHas(v,c.key)).map(c=>`<div class="module-stat module-stat-full"><div class="module-stat-label">${escapeHtml(c.label)}</div><div class="module-stat-value module-stat-text">${escapeHtml(v[c.key])}</div></div>`).join('');
    card.innerHTML=`<div class="module-head"><div class="module-name">${escapeHtml(v.sede)}<br><small class="muted">${escapeHtml(v.zona||'')}</small></div><span class="module-status status-ACTIVO">EDU</span></div><div class="module-services">${badges}</div><div class="module-stats">${details}</div>`;
    grid.appendChild(card);
  });
}

function renderSportsOverview(){
  const units = sportsUnits();
  const committees = sportsCommittees();
  const summary = sportsSummary();
  const hero = $('#heroPeriod');
  if(hero) hero.textContent = 'Catálogo deportivo cargado · unidades deportivas y comités';
  const labels = $$('#view-overview .kpi-label');
  const setLabel=(i,t)=>{ if(labels[i]) labels[i].textContent=t; };
  setLabel(0,'Total estructura deportiva');
  setLabel(1,'Unidades deportivas');
  setLabel(2,'Comités deportivos');
  setLabel(3,'Administradores');
  setLabel(4,'Disciplinas / actividades');
  setLabel(5,'Espacios con mapa');
  animateNumber($('#kpiTotal'), (summary.units||units.length) + (summary.committees||committees.length));
  animateNumber($('#kpiMedicos'), summary.units || units.length);
  animateNumber($('#kpiOdonto'), summary.committees || committees.length);
  animateNumber($('#kpiEnfermeria'), summary.adminCount || 0);
  animateNumber($('#kpiRehab'), summary.activities || units.reduce((a,u)=>a+(u.activities?.length||0),0));
  animateNumber($('#kpiMental'), units.length + committees.length);
  ['kpiTotalTrend','kpiMedicosTrend','kpiOdontoTrend','kpiEnfermeriaTrend','kpiRehabTrend','kpiMentalTrend'].forEach(id=>{ const el=$('#'+id); if(el){ el.className='kpi-trend flat'; el.textContent='Catálogo base de deportes'; }});
  nativeBars('distChart', ['Unidades deportivas','Comités deportivos','Administradores','Actividades'], [summary.units||units.length, summary.committees||committees.length, summary.adminCount||0, summary.activities||0], ['#0E2A6B','#56AB2F','#F59E0B','#8B5CF6']);
  const topUnits = units.slice().sort((a,b)=>(b.activities?.length||0)-(a.activities?.length||0)).slice(0,10);
  nativeBars('topChart', topUnits.map(u=>u.name), topUnits.map(u=>u.activities?.length||0), topUnits.map((_,i)=>['#0E2A6B','#1E50C5','#56AB2F','#F59E0B','#8B5CF6','#EC4899'][i%6]));
  nativeDonut('genderChart', ['Comité deportivo','Administrador'], [summary.committeeCount||0, summary.adminCount||0], ['#56AB2F','#0E2A6B']);
  nativeDonut('statusChart', ['Unidades','Comités'], [summary.units||units.length, summary.committees||committees.length], ['#F59E0B','#56AB2F']);
}

function renderSportsModules(){
  const grid = $('#modulesGrid'); if(!grid) return;
  const search = ($('#moduleSearch')?.value || '').toLowerCase();
  const units = sportsUnits().filter(u => !search || (u.name||'').toLowerCase().includes(search) || (u.admin||'').toLowerCase().includes(search) || (u.activities||[]).some(a => (a.disciplina||'').toLowerCase().includes(search)));
  const committees = sportsCommittees().filter(c => !search || (c.name||'').toLowerCase().includes(search) || (c.tipo||'').toLowerCase().includes(search) || (c.categoria||'').toLowerCase().includes(search));
  grid.innerHTML = '<div class="module-section-title"><h3>Deporte · Unidades deportivas</h3><p>Horarios, disciplinas, responsables y cupos cargados desde el archivo de unidades deportivas.</p></div>';
  units.forEach(u=>{
    const card=document.createElement('div'); card.className='module-card module-deporte';
    const acts=(u.activities||[]).map(a=>`<div class="module-stat module-stat-full"><div class="module-stat-label">${escapeHtml(a.disciplina||'Actividad')}</div><div class="module-stat-value module-stat-text">${escapeHtml([a.horario,a.edades,a.cupo].filter(Boolean).join(' · ') || 'Horario por confirmar')}</div></div>`).join('');
    const badges=(u.activities||[]).slice(0,6).map(a=>`<span>${escapeHtml(a.disciplina)}</span>`).join('') || '<span>Unidad deportiva</span>';
    card.innerHTML=`<div class="module-head"><div class="module-name">${escapeHtml(u.name)}<br><small class="muted">${escapeHtml(u.admin ? 'Admin: '+u.admin : 'Unidad deportiva')}</small></div><span class="module-status status-ACTIVO">DEP</span></div><div class="module-services">${badges}</div><div class="module-stats">${acts}</div><div class="module-total"><span class="muted">Actividades registradas</span><strong>${fmt((u.activities||[]).length)}</strong></div>`;
    grid.appendChild(card);
  });
  grid.insertAdjacentHTML('beforeend','<div class="module-section-title"><h3>Comités deportivos</h3><p>Listado de comités y administradores. Las ubicaciones en mapa se muestran como referencia territorial cuando no hay coordenada oficial.</p></div>');
  committees.slice(0, 80).forEach(c=>{
    const card=document.createElement('div'); card.className='module-card module-comite';
    card.innerHTML=`<div class="module-head"><div class="module-name">${escapeHtml(c.name)}<br><small class="muted">${escapeHtml(c.tipo||'')}</small></div><span class="module-status status-ACTIVO">${(c.categoria||'COM').includes('ADMIN')?'ADM':'COM'}</span></div><div class="module-address">${escapeHtml(c.responsable||'')}</div><div class="module-total"><span class="muted">${escapeHtml(c.categoria||'')}</span><strong>${escapeHtml((c.id||'').replace('comite_',''))}</strong></div>`;
    grid.appendChild(card);
  });
}

function renderSportsTrends(){
  const units=sportsUnits(), committees=sportsCommittees(), summary=sportsSummary();
  nativeBars('trendChart', units.map(u=>u.name), units.map(u=>u.activities?.length||0), units.map((_,i)=>['#0E2A6B','#1E50C5','#56AB2F','#F59E0B','#8B5CF6','#EC4899'][i%6]));
  const byType={};
  committees.forEach(c=>{ const key=(c.tipo||'Sin tipo').split(',')[0].trim(); byType[key]=(byType[key]||0)+1; });
  const topTypes=Object.entries(byType).sort((a,b)=>b[1]-a[1]).slice(0,10);
  nativeBars('multiTrendChart', topTypes.map(x=>x[0]), topTypes.map(x=>x[1]), topTypes.map((_,i)=>['#56AB2F','#0E2A6B','#F59E0B','#8B5CF6','#EC4899'][i%5]));
  nativeBars('growthChart', ['Unidades','Comités','Administradores','Actividades'], [summary.units||0, summary.committees||0, summary.adminCount||0, summary.activities||0], ['#0E2A6B','#56AB2F','#F59E0B','#8B5CF6']);
}

function renderSportsDataLoader(){
  const wrap=$('#dataTableBody');
  if(wrap) wrap.innerHTML='<tr><td colspan="8" class="module-name-cell">Deporte queda preparado con unidades deportivas, horarios y comités. Cuando envíen indicadores mensuales, se activará la captura por: personas inscritas, asistencias, actividades, torneos, comités activos y participación por sede.</td></tr>';
  renderHistory();
}

function renderOverview(){
  if(STATE.currentProgram === 'educacion') return renderEducationOverview();
  if(STATE.currentProgram === 'deporte') return renderSportsOverview();
  const cur = getCurrentPeriod();
  const prev = getPreviousPeriod();
  const s = cur.summary || aggregateModuleSummary(cur.modules||{});
  const total = totalOf(s);
  const labels = $$('#view-overview .kpi-label');
  ['Total de atenciones','Consultas Médicas','Odontología','Enfermería','Rehabilitación','Salud Mental'].forEach((t,i)=>{ if(labels[i]) labels[i].textContent=t; });
  const hero = $('#heroPeriod');
  if(hero) hero.textContent = cur.period === 'all' ? `Datos acumulados: ${cur.rangeLabel}` : `Datos del período: ${cur.label}`;
  animateNumber($('#kpiTotal'), total);
  animateNumber($('#kpiMedicos'), s.medicos);
  animateNumber($('#kpiOdonto'), s.odonto);
  animateNumber($('#kpiEnfermeria'), s.enfermeria);
  animateNumber($('#kpiRehab'), s.rehab);
  animateNumber($('#kpiMental'), s.mental);
  if(prev){
    const ps = prev.summary || aggregateModuleSummary(prev.modules||{});
    setTrend($('#kpiTotalTrend'), total, totalOf(ps));
    setTrend($('#kpiMedicosTrend'), s.medicos, ps.medicos);
    setTrend($('#kpiOdontoTrend'), s.odonto, ps.odonto);
    setTrend($('#kpiEnfermeriaTrend'), s.enfermeria, ps.enfermeria);
    setTrend($('#kpiRehabTrend'), s.rehab, ps.rehab);
    setTrend($('#kpiMentalTrend'), s.mental, ps.mental);
  }else{
    ['kpiTotalTrend','kpiMedicosTrend','kpiOdontoTrend','kpiEnfermeriaTrend','kpiRehabTrend','kpiMentalTrend'].forEach(id=>setTrend($('#'+id),0,null));
  }
  renderSparkline();
  renderDistChart(s, document.querySelector('[data-chart-mode].active')?.dataset.chartMode || 'bar');
  renderTopChart(cur);
  renderGenderChart(cur);
  renderStatusChart();
}
function renderSparkline(){
  const last = STATE.periods.slice(-8);
  const values = last.map(p => totalOf(p.summary || aggregateModuleSummary(p.modules||{})));
  nativeLine('sparkTotal', last.map(p=>p.label), values);
}
function renderDistChart(s, mode='bar'){
  const labels = SERVICE_DEFS.map(d=>d.label);
  const values = SERVICE_DEFS.map(d=>s[d.key]||0);
  const colors = SERVICE_DEFS.map(d=>d.color);
  if(mode === 'doughnut') nativeDonut('distChart', labels, values, colors);
  else nativeBars('distChart', labels, values, colors);
}
function renderTopChart(period){
  const arr = saludModules().map(mod => ({ name:mod.name, total:totalOf(period.modules?.[mod.id]||{}) })).filter(x=>x.total>0).sort((a,b)=>b.total-a.total).slice(0,10);
  nativeBars('topChart', arr.map(x=>x.name), arr.map(x=>x.total), arr.map((_,i)=> SERVICE_DEFS[i % SERVICE_DEFS.length].color));
}
function renderGenderChart(period){
  const total = totalOf(period.summary || aggregateModuleSummary(period.modules||{}));
  nativeDonut('genderChart', ['Hombres','Mujeres'], [Math.round(total*.323), Math.round(total*.677)], ['#0E2A6B','#EC4899']);
}
function renderStatusChart(){
  nativeDonut('statusChart', ['Módulos de Salud','AlmaNova'], [saludModules().length, almanovaModules().length], ['#56AB2F','#0E2A6B']);
}

function renderModules(){
  if(STATE.currentProgram === 'educacion') return renderEducationModules();
  if(STATE.currentProgram === 'deporte') return renderSportsModules();
  const cur = getCurrentPeriod();
  const search = ($('#moduleSearch')?.value || '').toLowerCase();
  const grid = $('#modulesGrid'); if(!grid) return;
  grid.innerHTML = '';
  const section = (title, subtitle, mods, cls) => {
    const filtered = mods.filter(mod => !search || mod.name.toLowerCase().includes(search) || (mod.colony||'').toLowerCase().includes(search));
    const header = document.createElement('div');
    header.className = 'module-section-title';
    header.innerHTML = `<h3>${title}</h3><p>${subtitle}</p>`;
    grid.appendChild(header);
    filtered.forEach(mod => grid.appendChild(moduleCard(mod, cur, cls)));
  };
  section('Módulos de Salud', `${saludModules().length} módulos activos`, saludModules(), 'salud');
  section('AlmaNova · Psicología', `${almanovaModules().length} unidades de salud mental`, almanovaModules(), 'almanova');
}
function moduleCard(mod, cur, cls){
  const m = cur.modules?.[mod.id] || {};
  const total = totalOf(m);
  const card = document.createElement('div');
  card.className = `module-card module-${cls}`;
  card.tabIndex = 0;
  card.dataset.moduleId = mod.id;
  const svc = offeredServices(mod);
  const statsHtml = isMental(mod)
    ? `<div class="module-stat module-stat-full"><div class="module-stat-label">Total de atenciones</div><div class="module-stat-value">${fmt(total)}</div></div>`
    : svc.map(s=>`<div class="module-stat"><div class="module-stat-label">${s.label}</div><div class="module-stat-value">${fmt(m[s.key])}</div></div>`).join('');
  const serviceBadges = isMental(mod) ? '<span>AN</span><span>Salud Mental</span>' : svc.map(s=>`<span>${s.label}</span>`).join('');
  card.innerHTML = `
    <div class="module-head">
      <div class="module-name">${escapeHtml(mod.name)}<br><small class="muted">${escapeHtml(mod.colony||'')}</small></div>
      <span class="module-status status-ACTIVO">${isMental(mod)?'AN':'ACTIVO'}</span>
    </div>
    <div class="module-address">${escapeHtml(mod.address || '')}</div>
    <div class="module-services">${serviceBadges}</div>
    <div class="module-schedule">${escapeHtml(mod.schedule || '')}</div>
    <div class="module-stats">${statsHtml}</div>
    <div class="module-total"><span class="muted">${isMental(mod)?'Atenciones AlmaNova':'Total atenciones'}</span><strong>${fmt(total)}</strong></div>
    <div class="module-open-hint">Click para ver tendencia mensual por servicio</div>`;
  card.addEventListener('click', ()=> openModuleDetail(mod.id));
  card.addEventListener('keydown', e=>{ if(e.key==='Enter') openModuleDetail(mod.id); });
  return card;
}


function openModuleDetail(moduleId){
  const mod = MODULES.find(m=>m.id===moduleId); if(!mod) return;
  let modal = $('#moduleModal');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'moduleModal';
    modal.className = 'module-modal hidden';
    document.body.appendChild(modal);
  }
  const periods = STATE.periods.filter(p => p.modules && p.modules[moduleId]);
  const latest = periods.slice(-6);
  const latestTotals = latest.map(p => totalOf(p.modules[moduleId]||{}));
  const serviceTotals = {};
  svcKeys().forEach(k => serviceTotals[k]=0);
  periods.forEach(p => svcKeys().forEach(k => serviceTotals[k] += Number(p.modules[moduleId]?.[k]) || 0));
  modal.innerHTML = `
    <div class="module-modal-backdrop" data-close="1"></div>
    <div class="module-modal-card">
      <button class="module-modal-close" data-close="1">×</button>
      <div class="module-modal-head">
        <span>${isMental(mod)?'AlmaNova · Psicología · AN':'Módulo de Salud'}</span>
        <h2>${escapeHtml(mod.name)}</h2>
        <p>${escapeHtml(mod.colony||'')} · Tendencia mensual por servicio</p>
      </div>
      <div class="module-modal-grid">
        <div class="chart-card"><div class="chart-head"><h3>Uso mensual total</h3></div><div class="chart-body" data-chart="moduleTrendChart"></div></div>
        <div class="chart-card"><div class="chart-head"><h3>${isMental(mod)?'Atenciones de salud mental':'Servicio más usado'}</h3></div><div class="chart-body" data-chart="moduleServiceChart"></div></div>
      </div>
      <div class="module-month-list">
        ${latest.map(p=>{
          const m=p.modules[moduleId]||{};
          const top=isMental(mod)?{label:'Salud Mental',val:totalOf(m)}:SERVICE_DEFS.map(s=>({label:s.label,val:m[s.key]||0})).sort((a,b)=>b.val-a.val)[0];
          return `<div><strong>${p.label}</strong><span>${fmt(totalOf(m))} atenciones</span><small>${isMental(mod)?'Atenciones AlmaNova':'Más usado'}: ${top.label} (${fmt(top.val)})</small></div>`;
        }).join('')}
      </div>
    </div>`;
  modal.classList.remove('hidden');
  modal.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click', ()=>modal.classList.add('hidden')));
  nativeLine('moduleTrendChart', latest.map(p=>p.label), latestTotals);
  if(isMental(mod)) nativeBars('moduleServiceChart', ['Atenciones salud mental'], [periods.reduce((a,p)=>a+totalOf(p.modules[moduleId]||{}),0)], ['#0E2A6B']);
  else { const svc = offeredServices(mod); nativeBars('moduleServiceChart', svc.map(s=>s.label), svc.map(s=>serviceTotals[s.key]), svc.map(s=>s.color)); }
}

function initMap(){
  if(typeof L === 'undefined' || !$('#map')) return;
  if(STATE.map) return;
  STATE.map = L.map('map', { center:[20.97,-89.62], zoom:12, scrollWheelZoom:true });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{ attribution:'© OpenStreetMap · CARTO', maxZoom:19 }).addTo(STATE.map);
  drawMapMarkers();
}
function drawMapMarkers(){
  if(!STATE.map) return;
  STATE.mapMarkers.forEach(m=>STATE.map.removeLayer(m)); STATE.mapMarkers=[];
  if(STATE.currentProgram === 'deporte'){
    const unitIcon = (txt='UD') => L.divIcon({ className:'', html:`<div class="module-marker sport">${txt}</div>`, iconSize:[34,34], iconAnchor:[17,17] });
    const committeeIcon = (txt='C') => L.divIcon({ className:'', html:`<div class="module-marker committee">${txt}</div>`, iconSize:[28,28], iconAnchor:[14,14] });
    sportsUnits().forEach(u=>{ if(!u.lat || !u.lng) return; const marker=L.marker([u.lat,u.lng],{icon:unitIcon(u.shortCode||'UD')}); marker.bindPopup(`<div class="popup-name">${escapeHtml(u.name)}</div><div class="popup-row"><span>Actividades</span><strong>${fmt((u.activities||[]).length)}</strong></div><div class="popup-row"><span>Admin</span><strong>${escapeHtml(u.admin||'—')}</strong></div>`); marker.addTo(STATE.map); STATE.mapMarkers.push(marker); });
    sportsCommittees().forEach(c=>{ if(!c.lat || !c.lng) return; const marker=L.marker([c.lat,c.lng],{icon:committeeIcon((c.categoria||'').includes('ADMIN')?'A':'C')}); marker.bindPopup(`<div class="popup-name">${escapeHtml(c.name)}</div><div class="popup-row"><span>Tipo</span><strong>${escapeHtml(c.tipo||'—')}</strong></div><div class="popup-row"><span>Estatus</span><strong>${escapeHtml(c.categoria||'—')}</strong></div>`); marker.addTo(STATE.map); STATE.mapMarkers.push(marker); });
    return;
  }
  const cur = getCurrentPeriod();
  activeModules().forEach(mod=>{ if(!mod.lat || !mod.lng) return; const total = totalOf(cur.modules?.[mod.id]||{}); const marker = L.marker([mod.lat,mod.lng], { icon:L.divIcon({ className:'', html:`<div class="module-marker ${isMental(mod)?'mental':''}">${mod.shortCode || (isMental(mod)?'AN':mod.name.substring(0,2).toUpperCase())}</div>`, iconSize:[32,32], iconAnchor:[16,16] }) }); marker.bindPopup(`<div class="popup-name">${escapeHtml(mod.name)}</div><div class="popup-row"><span>Total</span><strong>${fmt(total)}</strong></div>`); marker.on('click', ()=> openModuleDetail(mod.id)); marker.addTo(STATE.map); STATE.mapMarkers.push(marker); });
}

function renderTrends(){
  if(STATE.currentProgram === 'deporte') return renderSportsTrends();
  if(STATE.currentProgram === 'educacion'){
    const english = EDUCATION_CATALOG?.englishEnrollmentSept2024 || {hombres:0,mujeres:0,total:0};
    nativeBars('trendChart', ['Inglés · Sep 2024'], [english.total], ['#0E2A6B']);
    nativeBars('multiTrendChart', ['Hombres','Mujeres'], [english.hombres, english.mujeres], ['#0E2A6B','#EC4899']);
    nativeBars('growthChart', ['Pendiente'], [0], ['#94A3B8']);
    return;
  }
  const last12 = STATE.periods.slice(-12);
  const labels = last12.map(p=>p.label);
  const totals = last12.map(p=>totalOf(p.summary || aggregateModuleSummary(p.modules||{})));
  nativeLine('trendChart', labels, totals);
  nativeBars('multiTrendChart', ['Médicos','Odontología','Enfermería'], [
    last12.reduce((a,p)=>a+(p.summary?.medicos||0),0),
    last12.reduce((a,p)=>a+(p.summary?.odonto||0),0),
    last12.reduce((a,p)=>a+(p.summary?.enfermeria||0),0)
  ], ['#1E50C5','#56AB2F','#F59E0B']);
  const growth = totals.map((v,i)=> i===0 ? 0 : ((v-(totals[i-1]||0))/(totals[i-1]||1)*100));
  nativeBars('growthChart', labels, growth.map(v=>Number(v.toFixed(1))), growth.map(v=>v>=0?'#56AB2F':'#EF4444'));
}

function renderDataLoader(){
  if(STATE.currentProgram === 'deporte') return renderSportsDataLoader();
  if(STATE.currentProgram === 'educacion'){ const wrap=$('#dataTableBody'); if(wrap) wrap.innerHTML='<tr><td colspan="8" class="module-name-cell">Educación queda preparada. Cuando envíen los indicadores mensuales, se activará la captura por: acompañamiento académico, educación artística, ludotecas/bibliotecas e inglés.</td></tr>'; renderHistory(); return; }
  const yearSel = $('#loadYear'); if(!yearSel) return;
  if(!yearSel.options.length){
    const cy = new Date().getFullYear();
    for(let y=cy-2;y<=cy+1;y++) yearSel.insertAdjacentHTML('beforeend', `<option value="${y}">${y}</option>`);
    yearSel.value = cy; if($('#loadMonth')) $('#loadMonth').value = new Date().getMonth();
  }
  const tbody = $('#dataTableBody'); if(!tbody) return;
  tbody.innerHTML = '';
  activeModules().forEach(mod => {
    const tr = document.createElement('tr'); tr.dataset.id = mod.id;
    tr.innerHTML = `<td class="module-name-cell">${escapeHtml(mod.name)}${isMental(mod)?'<br><small class="muted">AlmaNova · solo total</small>':''}<br><small class="muted">${escapeHtml((mod.services||[]).map(serviceLabel).join(', '))}</small></td>${SERVICE_DEFS.map(s=>{ const enabled=(mod.services||svcKeys()).includes(s.key); return `<td><input type="number" min="0" data-svc="${s.key}" value="0" ${!enabled?'disabled class="input-disabled"':''} placeholder="${enabled?(isMental(mod)?'Total':'0'):'—'}" /></td>`; }).join('')}<td class="total-cell" data-total>0</td>`;
    tbody.appendChild(tr);
    tr.querySelectorAll('input').forEach(inp=>inp.addEventListener('input', ()=>{
      tr.querySelector('[data-total]').textContent = fmt(Array.from(tr.querySelectorAll('input')).reduce((a,b)=>a+(+b.value||0),0));
      updateLoaderProgress();
    }));
  });
  renderHistory();
  const saveBtn = $('#saveDataBtn');
  if(saveBtn && !saveBtn.dataset.bound){
    saveBtn.dataset.bound='1'; saveBtn.addEventListener('click', saveCurrentData);
    $('#clearDataBtn')?.addEventListener('click', ()=>{$$('#dataTableBody input').forEach(i=>i.value=0);$$('#dataTableBody [data-total]').forEach(t=>t.textContent='0');updateLoaderProgress();});
    $('#exportBtn')?.addEventListener('click', exportData);
    $('#importInput')?.addEventListener('change', importData);
  }
  updateLoaderProgress();
}
function updateLoaderProgress(){
  const inputs = $$('#dataTableBody input');
  const filled = inputs.filter(i=>+i.value>0).length;
  const pct = inputs.length ? Math.min(100, filled/inputs.length*100) : 0;
  if($('#progressFill')) $('#progressFill').style.width = `${pct}%`;
}
function saveCurrentData(){
  const year=+$('#loadYear').value, month=+$('#loadMonth').value;
  const period=`${year}-${String(month+1).padStart(2,'0')}`;
  const label=new Date(year,month,1).toLocaleString('es-MX',{month:'long',year:'numeric'});
  const modules={};
  $$('#dataTableBody tr').forEach(tr=>{ const obj={}; tr.querySelectorAll('input').forEach(inp=>obj[inp.dataset.svc]=+inp.value||0); modules[tr.dataset.id]=obj; });
  const newP={period,label,uploadedBy:USERS[STATE.currentUser]?.name||'Usuario',uploadedAt:new Date().toISOString(),modules,summary:aggregateModuleSummary(modules)};
  const idx=STATE.periods.findIndex(p=>p.period===period);
  if(idx>=0){ if(!confirm(`Ya existe ${label}. ¿Reemplazar?`)) return; STATE.periods[idx]=newP; }
  else{ STATE.periods.push(newP); STATE.periods.sort((a,b)=>a.period.localeCompare(b.period)); }
  saveStorage({periods:STATE.periods}); STATE.currentPeriodIdx='all'; refreshAll(); toast(`Mes ${label} guardado`, 'success');
}
function renderHistory(){
  const list=$('#historyList'); if(!list) return;
  list.innerHTML='';
  STATE.periods.slice().reverse().forEach(p=>{
    list.insertAdjacentHTML('beforeend', `<div class="history-item"><div><div class="history-period">${p.label}</div><div class="history-meta"><span>${p.uploadedBy||'—'}</span><span>${fmt(totalOf(p.summary))} atenciones</span></div></div><div class="history-actions"><button class="history-load" data-period="${p.period}">Ver</button></div></div>`);
  });
  list.querySelectorAll('.history-load').forEach(b=>b.addEventListener('click',()=>{ STATE.currentPeriodIdx=STATE.periods.findIndex(p=>p.period===b.dataset.period); populatePeriodSelect(); document.querySelector('[data-view="overview"]')?.click(); }));
}
function exportData(){
  const blob = new Blob([JSON.stringify({periods:STATE.periods}, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`bienestar_humano_${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
}
function importData(e){
  const f=e.target.files?.[0]; if(!f) return;
  const r=new FileReader(); r.onload=ev=>{ try{ const p=JSON.parse(ev.target.result); if(!Array.isArray(p.periods)) throw Error(); STATE.periods=p.periods; STATE.currentPeriodIdx='all'; saveStorage({periods:STATE.periods}); refreshAll(); toast('Datos importados','success'); }catch{ toast('Archivo inválido','error'); } }; r.readAsText(f);
}

function renderPriority(){
  const fill=(id,items)=>{ const ul=$(id); if(ul) ul.innerHTML=items.map(it=>`<li><span class="lbl">${escapeHtml(it.lbl)}</span><span class="num">${fmt(it.num)}</span></li>`).join(''); };
  fill('#priSalud', PRIORITY_DATA.salud); fill('#priMujeres', PRIORITY_DATA.mujeres); fill('#priMental', PRIORITY_DATA.mental);
}
function initModuleFilters(){ $('#moduleSearch')?.addEventListener('input', renderModules); $('#statusFilter')?.addEventListener('change', renderModules); }
function initChartTabs(){
  $$('[data-chart-mode]').forEach(btn=>btn.addEventListener('click',()=>{ $$('[data-chart-mode]').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); const s=getCurrentPeriod().summary||{}; renderDistChart(s, btn.dataset.chartMode); }));
}
function showProgramGate(){
  document.body.classList.remove('program-ready');
  const gate=$('#programGate'); if(gate) gate.classList.remove('hidden');
  const allowed = currentUserAllowedPrograms();
  $$('.program-card').forEach(card=>{ const program = card.dataset.program; const ok = allowed.includes(program); card.classList.toggle('locked', !ok); card.disabled = !ok; const span = card.querySelector('span'); if(span && !ok && !span.dataset.original){ span.dataset.original = span.textContent; span.textContent = 'Sin permiso para este usuario'; } if(span && ok && span.dataset.original){ span.textContent = span.dataset.original; } });
  window.scrollTo({top:0, behavior:'instant'});
}
function initProgramGate(){
  $$('.program-card').forEach(card=>card.addEventListener('click',()=>{ const program=card.dataset.program; if(!canAccessProgram(program)){ toast(`Tu usuario no tiene acceso a ${programLabel(program)}.`, 'error'); return; } STATE.currentProgram = program; $('#programGate')?.classList.add('hidden'); document.body.classList.add('program-ready'); window.scrollTo({top:0, behavior:'instant'}); refreshAll(); if(program === 'deporte') toast('Deporte cargado: unidades deportivas y comités.', 'success'); if(program === 'educacion') toast('Educación cargado: catálogo preparado.', 'success'); }));
}

function initLogin(){
  $$('.user-chip').forEach(chip=>chip.addEventListener('click',()=>{ $$('.user-chip').forEach(c=>c.classList.remove('selected')); chip.classList.add('selected'); STATE.selectedUser=chip.dataset.user; $('#password')?.focus(); if($('#loginError')) $('#loginError').textContent=''; }));
  $('#loginForm')?.addEventListener('submit', e=>{
    e.preventDefault(); const user=STATE.selectedUser; const pass=$('#password')?.value.trim();
    if(!user){ if($('#loginError')) $('#loginError').textContent='Selecciona un usuario'; return; }
    if(USERS[user] && USERS[user].password === pass){ STATE.currentUser=user; $('#login')?.classList.add('hidden'); $('#app')?.classList.remove('hidden'); onLoggedIn(); }
    else{ if($('#loginError')) $('#loginError').textContent='Contraseña incorrecta. Intenta de nuevo.'; if($('#password')) $('#password').value=''; }
  });
  $('#password')?.addEventListener('input',()=>{ if($('#loginError')) $('#loginError').textContent=''; });
}
function onLoggedIn(){
  const u=USERS[STATE.currentUser];
  if($('#userName')) $('#userName').textContent=u.name;
  if($('#userAvatar')) { $('#userAvatar').textContent=u.name[0]; $('#userAvatar').style.background=`linear-gradient(135deg, ${u.color}, ${u.color}dd)`; }
  if($('#loadAuthor')) $('#loadAuthor').value=u.name;
  showProgramGate(); toast(`Bienvenida ${u.name}`,'success'); refreshAll();
}
function initNav(){
  $$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{
    const view=btn.dataset.view; if(!view) return;
    $$('.nav-item').forEach(b=>{ if(b.dataset.view===view) b.classList.add('active'); else b.classList.remove('active'); });
    $$('.view').forEach(v=>v.classList.remove('active'));
    $(`#view-${view}`)?.classList.add('active');
    $('#sidebar')?.classList.remove('open'); $('.sidebar-backdrop')?.classList.remove('show');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ if(view==='map'){initMap(); STATE.map?.invalidateSize();} if(view==='trends')renderTrends(); if(view==='modules')renderModules(); if(view==='priority')renderPriority(); if(view==='data')renderDataLoader(); }));
  }));
  $('#menuBtn')?.addEventListener('click',()=>{
    $('#sidebar')?.classList.toggle('open');
    let bd=$('.sidebar-backdrop'); if(!bd){ bd=document.createElement('div'); bd.className='sidebar-backdrop'; bd.addEventListener('click',()=>{$('#sidebar')?.classList.remove('open');bd.classList.remove('show');}); document.body.appendChild(bd); }
    bd.classList.toggle('show');
  });
  $('#logoutBtn')?.addEventListener('click',()=>{ STATE.currentUser=null; STATE.selectedUser=null; $('#password') && ($('#password').value=''); $$('.user-chip').forEach(c=>c.classList.remove('selected')); document.body.classList.remove('program-ready'); $('#app')?.classList.add('hidden'); $('#login')?.classList.remove('hidden'); });
  const sel=$('#periodSelect');
  if(sel){ populatePeriodSelect(); sel.addEventListener('change',()=>{ STATE.currentPeriodIdx = sel.value === 'all' ? 'all' : Number(sel.value); refreshAll(); }); }
}
function refreshAll(){
  populatePeriodSelect(); renderOverview();
  if($('#view-modules')?.classList.contains('active')) renderModules();
  if($('#view-trends')?.classList.contains('active')) renderTrends();
  if($('#view-priority')?.classList.contains('active')) renderPriority();
  if($('#view-data')?.classList.contains('active')) renderDataLoader();
  if(STATE.map) drawMapMarkers();
}
function initParticles(){
  const canvas=$('#particles'); if(!canvas) return; const ctx=canvas.getContext('2d'); let w,h; const count=innerWidth<768?22:54; const ps=[];
  function resize(){w=canvas.width=innerWidth;h=canvas.height=innerHeight;} resize(); addEventListener('resize',resize);
  for(let i=0;i<count;i++) ps.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()*2+1,a:Math.random()*.35+.08,hue:Math.random()>.5?'g':'b'});
  function tick(){ctx.clearRect(0,0,w,h); ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;ctx.fillStyle=p.hue==='g'?`rgba(141,198,63,${p.a})`:`rgba(14,42,107,${p.a})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}); requestAnimationFrame(tick);} tick();
}
async function boot(){
  initData(); initParticles(); initLogin(); initNav(); initChartTabs(); initModuleFilters(); initProgramGate();
  setTimeout(()=>{ const s=$('#splash'); if(s) s.style.display='none'; $('#login')?.classList.remove('hidden'); }, 1200);
}
document.addEventListener('DOMContentLoaded', boot);
})();
