/* ============================================================
   BIENESTAR HUMANO — APLICACIÓN PRINCIPAL V12 GESTIÓN EDITABLE + PUNTOS
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
  mapMarkers: [],
  kmlPoints: [],
  kmlLoaded: false,
  kmlLoading: false
};

const STORAGE_KEY = 'bh_merida_v12_kmz_segmentos';
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


/* V11 · KMZ/KML helper */
function normalizeLookupText(str=''){
  return String(str||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
function isRehabExcludedText(str=''){
  const t = normalizeLookupText(str);
  return t.includes('espacios municipales en rehabilitacion') || t.includes('municipales en rehabilitacion') || t.includes('rehabilitacion') && t.includes('espacio municipal');
}
function parseKmlPlacemarks(text){
  const points=[];
  try{
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    const placemarks = Array.from(doc.getElementsByTagName('Placemark'));
    placemarks.forEach(pm=>{
      const name = pm.getElementsByTagName('name')[0]?.textContent?.trim() || '';
      const desc = pm.getElementsByTagName('description')[0]?.textContent?.trim() || '';
      const coords = pm.getElementsByTagName('coordinates')[0]?.textContent?.trim() || '';
      if(!coords || isRehabExcludedText(name+' '+desc)) return;
      const first = coords.split(/\s+/).find(Boolean);
      if(!first) return;
      const [lng,lat] = first.split(',').map(Number);
      if(Number.isFinite(lat) && Number.isFinite(lng)) points.push({name,description:desc,lat,lng,lookup:normalizeLookupText(name+' '+desc),source:'KMZ'});
    });
  }catch(e){ console.warn('No se pudo parsear KML', e); }
  return points;
}
function extractNetworkLinkHref(text){
  try{
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    return doc.getElementsByTagName('href')[0]?.textContent?.trim() || '';
  }catch{ return ''; }
}
async function loadPhysicalSpacesKml(){
  if(STATE.kmlLoaded || STATE.kmlLoading) return STATE.kmlPoints;
  STATE.kmlLoading = true;
  const urls = [];
  if(typeof LOCAL_SPACES_KML !== 'undefined') urls.push(LOCAL_SPACES_KML);
  if(typeof SPACES_KML_URL !== 'undefined') urls.push(SPACES_KML_URL);
  for(const url of urls){
    try{
      const res = await fetch(url, {cache:'no-store'});
      if(!res.ok) continue;
      let text = await res.text();
      let points = parseKmlPlacemarks(text);
      if(!points.length){
        const href = extractNetworkLinkHref(text);
        if(href){
          try{
            const res2 = await fetch(href, {cache:'no-store'});
            if(res2.ok){ text = await res2.text(); points = parseKmlPlacemarks(text); }
          }catch(e){ console.warn('NetworkLink KML no accesible desde el navegador', e); }
        }
      }
      if(points.length){
        STATE.kmlPoints = points;
        STATE.kmlLoaded = true;
        break;
      }
    }catch(e){ console.warn('KML no accesible:', url, e); }
  }
  STATE.kmlLoading = false;
  return STATE.kmlPoints;
}
function scoreKmlMatch(point, item, program){
  const names = [item.name, item.sede, item.sheet, item.address, item.colony, item.tipo].filter(Boolean).map(normalizeLookupText).filter(Boolean);
  if(!names.length) return 0;
  let score = 0;
  for(const n of names){
    if(n.length < 3) continue;
    if(point.lookup.includes(n) || n.includes(point.lookup)) score = Math.max(score, 100);
    const words = n.split(' ').filter(w=>w.length>3);
    const hits = words.filter(w=>point.lookup.includes(w)).length;
    score = Math.max(score, hits * 12 + (hits===words.length && words.length?25:0));
  }
  const t = point.lookup;
  if(program==='educacion' && /(biblioteca|ludoteca|ingles|cultural|cdi|cdc|academia|educacion|taller)/.test(t)) score += 12;
  if(program==='deporte' && /(deport|cancha|comite|fut|beisbol|unidad|campo|parque)/.test(t)) score += 12;
  if(program==='salud' && /(salud|medic|almanova|alma nova|camm|odont|enfermer|modulo)/.test(t)) score += 12;
  return score;
}
function kmlPointForItem(item, program){
  if(!STATE.kmlPoints?.length) return null;
  let best=null, bestScore=0;
  STATE.kmlPoints.forEach(p=>{ const sc=scoreKmlMatch(p,item,program); if(sc>bestScore){ bestScore=sc; best=p; } });
  return bestScore >= 45 ? best : null;
}
function mapCoordForItem(item, program){
  const p = kmlPointForItem(item, program);
  if(p) return {lat:p.lat,lng:p.lng,source:'KMZ',match:p.name};
  if(item.lat && item.lng) return {lat:Number(item.lat),lng:Number(item.lng),source:'Catálogo',match:''};
  return null;
}
function canSwitchPrograms(){ return currentUserAllowedPrograms().length > 1; }
function updateProgramBackButton(){
  const btn = $('#programBackBtn');
  if(!btn) return;
  const show = Boolean(STATE.currentUser && canSwitchPrograms() && document.body.classList.contains('program-ready'));
  btn.classList.toggle('hidden', !show);
}
function returnToProgramGate(){
  if(!canSwitchPrograms()) return;
  document.body.classList.remove('program-ready');
  $('#programGate')?.classList.remove('hidden');
  $$('.view').forEach(v=>v.classList.remove('active'));
  $('#view-overview')?.classList.add('active');
  $$('.nav-item').forEach(b=>b.classList.toggle('active', b.dataset.view==='overview'));
  updateProgramBackButton();
  window.scrollTo({top:0, behavior:'instant'});
}


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
  loadPhysicalSpacesKml().then(()=>{ if(STATE.map) drawMapMarkers(); });
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
  updateProgramBackButton();
  window.scrollTo({top:0, behavior:'instant'});
}
function initProgramGate(){
  $$('.program-card').forEach(card=>card.addEventListener('click',()=>{ const program=card.dataset.program; if(!canAccessProgram(program)){ toast(`Tu usuario no tiene acceso a ${programLabel(program)}.`, 'error'); return; } STATE.currentProgram = program; $('#programGate')?.classList.add('hidden'); document.body.classList.add('program-ready'); updateProgramBackButton(); window.scrollTo({top:0, behavior:'instant'}); refreshAll(); if(STATE.map){ loadPhysicalSpacesKml().then(()=>drawMapMarkers()); } if(program === 'deporte') toast('Deporte cargado: unidades deportivas y comités.', 'success'); if(program === 'educacion') toast('Educación cargado: catálogo preparado.', 'success'); }));
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
  $('#logoutBtn')?.addEventListener('click',()=>{ STATE.currentUser=null; STATE.selectedUser=null; $('#password') && ($('#password').value=''); $$('.user-chip').forEach(c=>c.classList.remove('selected')); document.body.classList.remove('program-ready'); updateProgramBackButton(); $('#app')?.classList.add('hidden'); $('#login')?.classList.remove('hidden'); });
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

/* ============================================================
   V9 · Ajustes finales ad hoc por segmento
   V10 · Educación con sedes geolocalizadas
   ============================================================ */
const SEGMENT_COLORS = ['#0E2A6B','#56AB2F','#F59E0B','#8B5CF6','#EC4899','#06B6D4','#1E50C5','#10B981'];
function setTextSafe(sel,text){ const el=$(sel); if(el) el.textContent=text; }
function sportsTotalActivitiesV9(){ return sportsUnits().reduce((a,u)=>a+(u.activities?.length||0),0) || sportsSummary().activities || 0; }
function sportsDisciplinesV9(){ const m={}; sportsUnits().forEach(u=>(u.activities||[]).forEach(a=>{ const k=(a.disciplina||'Actividad').trim(); m[k]=(m[k]||0)+1; })); return Object.entries(m).sort((a,b)=>b[1]-a[1]); }
function sportsByUnitV9(){ return sportsUnits().map(u=>({name:u.name,total:u.activities?.length||0})).sort((a,b)=>b.total-a.total); }
function educationZoneStatsV9(){ const m={}; educationVenues().forEach(v=>m[v.zona||'Sin zona']=(m[v.zona||'Sin zona']||0)+1); return Object.entries(m).sort((a,b)=>b[1]-a[1]); }
function educationCatCountsV9(){ return educationCategories().map(c=>({key:c.key,label:c.label,count:educationVenues().filter(v=>educationHas(v,c.key)).length})); }
function setViewCopyV9(){
  const program=STATE.currentProgram;
  const mapTitle=$('#view-map .view-head h2'), mapSub=$('#view-map .view-head .muted');
  const modTitle=$('#view-modules .view-head h2'), modSub=$('#view-modules .view-head .muted');
  const prTitle=$('#view-priority .view-head h2'), prSub=$('#view-priority .view-head .muted');
  const th=$$('#view-trends .chart-head h3');
  if(program==='educacion'){
    if(mapTitle) mapTitle.textContent='Bibliotecas y talleres';
    if(mapSub) mapSub.textContent='Sedes educativas por zona y tipo de servicio';
    if(modTitle) modTitle.textContent='Bibliotecas y talleres';
    if(modSub) modSub.textContent='Acompañamiento académico, educación artística, ludotecas/bibliotecas e inglés';
    if(prTitle) prTitle.textContent='Indicadores de Educación';
    if(prSub) prSub.textContent='Información exclusiva del segmento de Educación';
    if(th[0]) th[0].textContent='Indicadores educativos'; if(th[1]) th[1].textContent='Categorías educativas'; if(th[2]) th[2].textContent='Bibliotecas y talleres por zona';
  } else if(program==='deporte'){
    if(mapTitle) mapTitle.textContent='Sedes Deportivas y Canchas';
    if(mapSub) mapSub.textContent='Unidades deportivas, comités y canchas localizadas';
    if(modTitle) modTitle.textContent='Sedes Deportivas y Canchas';
    if(modSub) modSub.textContent='Unidades deportivas, horarios, disciplinas, comités y canchas';
    if(prTitle) prTitle.textContent='Indicadores de Deporte';
    if(prSub) prSub.textContent='Información exclusiva del segmento deportivo';
    if(th[0]) th[0].textContent='Actividades por unidad deportiva'; if(th[1]) th[1].textContent='Tipos de comités y canchas'; if(th[2]) th[2].textContent='Resumen deportivo';
  } else {
    if(mapTitle) mapTitle.textContent='Mapa de Salud';
    if(mapSub) mapSub.textContent='Módulos médicos y AlmaNova';
    if(modTitle) modTitle.textContent='Módulos de Salud';
    if(modSub) modSub.textContent='Detalle de productividad por módulo y AlmaNova';
    if(prTitle) prTitle.textContent='Temas Prioritarios de Salud';
    if(prSub) prSub.textContent='Concentrado exclusivo de salud, servicios médicos y salud mental';
    if(th[0]) th[0].textContent='Atenciones totales por mes'; if(th[1]) th[1].textContent='Servicios de Salud'; if(th[2]) th[2].textContent='Crecimiento mensual (%)';
  }
}
const _renderOverviewBaseV9 = renderOverview;
renderOverview = function(){ setViewCopyV9(); return _renderOverviewBaseV9(); };
const _renderModulesBaseV9 = renderModules;
renderModules = function(){ setViewCopyV9(); return _renderModulesBaseV9(); };
const _drawMapMarkersBaseV9 = drawMapMarkers;
drawMapMarkers = function(){ setViewCopyV9();
  if(STATE.currentProgram==='educacion'){
    if(!STATE.map) return; STATE.mapMarkers.forEach(m=>STATE.map.removeLayer(m)); STATE.mapMarkers=[];
    const base={Norte:[21.035,-89.61],Sur:[20.90,-89.62],Oriente:[20.965,-89.56],Poniente:[20.985,-89.68],Centro:[20.97,-89.62]};
    educationVenues().forEach((v,i)=>{ const b=base[v.zona]||[20.97,-89.62]; const lat=b[0]+((i%5)-2)*0.006, lng=b[1]+(Math.floor(i/5)%5-2)*0.006; const cats=educationCategories().filter(c=>educationHas(v,c.key)).map(c=>c.label).join(', ')||'Sin categoría'; const marker=L.marker([lat,lng],{icon:L.divIcon({className:'',html:'<div class="module-marker edu">BT</div>',iconSize:[32,32],iconAnchor:[16,16]})}); marker.bindPopup(`<div class="popup-name">${escapeHtml(v.sede)}</div><div class="popup-row"><span>Zona</span><strong>${escapeHtml(v.zona||'—')}</strong></div><div class="popup-row"><span>Servicios</span><strong>${escapeHtml(cats)}</strong></div>`); marker.addTo(STATE.map); STATE.mapMarkers.push(marker); });
    return;
  }
  return _drawMapMarkersBaseV9();
};
renderTrends = function(){ setViewCopyV9();
  if(STATE.currentProgram==='educacion'){
    const english=EDUCATION_CATALOG?.englishEnrollmentSept2024||{hombres:0,mujeres:0,total:0};
    const cats=educationCatCountsV9();
    nativeBars('trendChart',['Inglés · Septiembre 2024','Sedes educativas'],[english.total||0,educationVenues().length],['#0E2A6B','#56AB2F']);
    nativeBars('multiTrendChart',cats.map(x=>x.label),cats.map(x=>x.count),SEGMENT_COLORS);
    const zones=educationZoneStatsV9(); nativeBars('growthChart',zones.map(x=>x[0]),zones.map(x=>x[1]),SEGMENT_COLORS);
    return;
  }
  if(STATE.currentProgram==='deporte'){
    const s=sportsSummary(); const by=sportsByUnitV9().slice(0,10);
    nativeBars('trendChart',by.map(x=>x.name),by.map(x=>x.total),SEGMENT_COLORS);
    const types={}; sportsCommittees().forEach(c=>{ const k=(c.tipo||'Sin tipo').trim(); types[k]=(types[k]||0)+1; }); const top=Object.entries(types).sort((a,b)=>b[1]-a[1]).slice(0,10);
    nativeBars('multiTrendChart',top.map(x=>x[0]),top.map(x=>x[1]),SEGMENT_COLORS);
    nativeBars('growthChart',['Unidades deportivas','Comités / canchas','Administradores','Actividades'],[s.units||sportsUnits().length,s.committees||sportsCommittees().length,s.adminCount||0,sportsTotalActivitiesV9()],SEGMENT_COLORS);
    return;
  }
  const last12=STATE.periods.slice(-12); const labels=last12.map(p=>p.label); const totals=last12.map(p=>totalOf(p.summary||aggregateModuleSummary(p.modules||{})));
  nativeLine('trendChart',labels,totals); nativeBars('multiTrendChart',SERVICE_DEFS.map(s=>s.label),SERVICE_DEFS.map(s=>last12.reduce((a,p)=>a+(p.summary?.[s.key]||0),0)),SERVICE_DEFS.map(s=>s.color)); const growth=totals.map((v,i)=>i===0?0:((v-(totals[i-1]||0))/(totals[i-1]||1)*100)); nativeBars('growthChart',labels,growth.map(v=>Number(v.toFixed(1))),growth.map(v=>v>=0?'#56AB2F':'#EF4444'));
};
renderPriority = function(){ setViewCopyV9(); const grid=$('#view-priority .priority-grid'); if(!grid) return;
  const card=(cls,title,items)=>`<div class="priority-card ${cls}"><header><h3>${escapeHtml(title)}</h3></header><ul class="priority-list">${items.map(it=>`<li><span class="lbl">${escapeHtml(it.lbl)}</span><span class="num">${fmt(it.num)}</span></li>`).join('')}</ul></div>`;
  if(STATE.currentProgram==='educacion'){
    const cats=educationCatCountsV9(); const english=EDUCATION_CATALOG?.englishEnrollmentSept2024||{};
    grid.innerHTML=card('priority-salud','Educación',cats.map(c=>({lbl:c.label,num:c.count})))+card('priority-mujeres','Inglés',[{lbl:'Alumnos inscritos septiembre 2024',num:english.total||0},{lbl:'Hombres',num:english.hombres||0},{lbl:'Mujeres',num:english.mujeres||0},{lbl:'Sedes con inglés',num:english.sedes||0}])+card('priority-mental','Bibliotecas y talleres',[{lbl:'Sedes educativas en catálogo',num:educationVenues().length},{lbl:'Zonas cubiertas',num:educationZoneStatsV9().length}]); return;
  }
  if(STATE.currentProgram==='deporte'){
    const s=sportsSummary(); const disc=sportsDisciplinesV9().slice(0,8).map(([lbl,num])=>({lbl,num}));
    grid.innerHTML=card('priority-salud','Sedes Deportivas y Canchas',[{lbl:'Unidades deportivas',num:s.units||sportsUnits().length},{lbl:'Comités / canchas',num:s.committees||sportsCommittees().length},{lbl:'Administradores',num:s.adminCount||0},{lbl:'Actividades registradas',num:sportsTotalActivitiesV9()}])+card('priority-mujeres','Disciplinas principales',disc)+card('priority-mental','Cobertura deportiva',[{lbl:'Registros localizados en mapa',num:(s.units||sportsUnits().length)+(s.committees||sportsCommittees().length)},{lbl:'Unidades con actividades',num:sportsUnits().filter(u=>(u.activities||[]).length).length}]); return;
  }
  grid.innerHTML=card('priority-salud','Salud',PRIORITY_DATA.salud)+card('priority-mujeres','Salud de las mujeres',PRIORITY_DATA.mujeres)+card('priority-mental','Salud Mental · ALMA NOVA',PRIORITY_DATA.mental);
};
const _refreshAllBaseV9=refreshAll;
refreshAll=function(){ setViewCopyV9(); _refreshAllBaseV9(); setViewCopyV9(); };


/* ============================================================
   V10 · Mapa de Educación por sede/dirección real
   - Usa EDUCATION_CATALOG.venues lat/lng creados desde columna A.
   - Al dar click, muestra dirección, zona y servicios de la sede.
   ============================================================ */
function educationServiceListV10(v){
  return educationCategories()
    .filter(c => educationHas(v, c.key))
    .map(c => `<div class="popup-row"><span>${escapeHtml(c.label)}</span><strong>${escapeHtml(v[c.key] || '—')}</strong></div>`)
    .join('');
}
function educationMapInfoV10(v){
  const cats = educationCategories().filter(c => educationHas(v,c.key)).map(c=>c.label).join(', ') || 'Sin servicio asignado';
  const panel = $('#mapInfo');
  if(panel){
    panel.innerHTML = `
      <h3 style="font-family:var(--font-display);color:var(--brand-blue);margin-bottom:.35rem">${escapeHtml(v.sede)}</h3>
      <p class="muted"><strong>Dirección:</strong> ${escapeHtml(v.address || 'Dirección no especificada')}</p>
      <p class="muted"><strong>Zona:</strong> ${escapeHtml(v.zona || '—')} · <strong>Servicios:</strong> ${escapeHtml(cats)}</p>
      ${v.observaciones ? `<p class="muted"><strong>Observaciones:</strong> ${escapeHtml(v.observaciones)}</p>` : ''}
    `;
  }
}
const _drawMapMarkersBaseV10 = drawMapMarkers;
drawMapMarkers = function(){
  setViewCopyV9();
  if(STATE.currentProgram === 'educacion'){
    if(!STATE.map) return;
    STATE.mapMarkers.forEach(m => STATE.map.removeLayer(m));
    STATE.mapMarkers = [];

    const venues = educationVenues().filter(v => v.lat && v.lng);
    venues.forEach(v => {
      const marker = L.marker([Number(v.lat), Number(v.lng)], {
        icon: L.divIcon({
          className: '',
          html: '<div class="module-marker edu">BT</div>',
          iconSize: [34,34],
          iconAnchor: [17,17]
        })
      });

      const cats = educationCategories().filter(c => educationHas(v,c.key)).map(c => c.label).join(', ') || 'Sin servicio asignado';
      marker.bindPopup(`
        <div class="popup-name">${escapeHtml(v.sede)}</div>
        <div class="popup-row"><span>Zona</span><strong>${escapeHtml(v.zona || '—')}</strong></div>
        <div class="popup-row"><span>Dirección</span><strong>${escapeHtml(v.address || '—')}</strong></div>
        <div class="popup-row"><span>Servicios</span><strong>${escapeHtml(cats)}</strong></div>
        ${v.observaciones ? `<div class="popup-row"><span>Obs.</span><strong>${escapeHtml(v.observaciones)}</strong></div>` : ''}
      `);
      marker.on('click', () => educationMapInfoV10(v));
      marker.addTo(STATE.map);
      STATE.mapMarkers.push(marker);
    });

    if(venues.length){
      const group = L.featureGroup(STATE.mapMarkers);
      STATE.map.fitBounds(group.getBounds().pad(0.16));
    }
    return;
  }
  return _drawMapMarkersBaseV10();
};

const _renderEducationModulesBaseV10 = renderEducationModules;
renderEducationModules = function(){
  const grid = $('#modulesGrid'); 
  if(!grid) return _renderEducationModulesBaseV10();
  const search = ($('#moduleSearch')?.value || '').toLowerCase();
  const venues = educationVenues().filter(v => 
    !search ||
    (v.sede || '').toLowerCase().includes(search) ||
    (v.zona || '').toLowerCase().includes(search) ||
    (v.address || '').toLowerCase().includes(search)
  );

  grid.innerHTML = '<div class="module-section-title"><h3>Educación · Bibliotecas y talleres</h3><p>Ubicación tomada desde la columna A del archivo de sedes. Al abrir el mapa, cada sede muestra dirección, zona y servicios.</p></div>';
  venues.forEach(v => {
    const card = document.createElement('div');
    card.className = 'module-card module-educacion';
    const badges = educationCategories().filter(c => educationHas(v,c.key)).map(c => `<span>${escapeHtml(c.label)}</span>`).join('') || '<span>Sin indicador asignado</span>';
    const details = educationCategories().filter(c => educationHas(v,c.key)).map(c => `<div class="module-stat module-stat-full"><div class="module-stat-label">${escapeHtml(c.label)}</div><div class="module-stat-value module-stat-text">${escapeHtml(v[c.key])}</div></div>`).join('');
    card.innerHTML = `
      <div class="module-head">
        <div class="module-name">${escapeHtml(v.sede)}<br><small class="muted">${escapeHtml(v.zona || '')}</small></div>
        <span class="module-status status-ACTIVO">EDU</span>
      </div>
      <div class="module-address">${escapeHtml(v.address || '')}</div>
      <div class="module-services">${badges}</div>
      <div class="module-stats">${details}</div>
      ${v.observaciones ? `<div class="module-schedule">${escapeHtml(v.observaciones)}</div>` : ''}
    `;
    grid.appendChild(card);
  });
};


/* ============================================================
   V11 · Mapas por KMZ/KML + botón Atrás por permisos
   ============================================================ */
function mapSourcePillV11(coord){
  return coord?.source === 'KMZ' ? '<div class="map-source-pill">Ubicación KMZ 2026</div>' : '<div class="map-source-pill">Ubicación catálogo base</div>';
}
function fitMapToMarkersV11(){
  if(STATE.map && STATE.mapMarkers.length){
    try{ STATE.map.fitBounds(L.featureGroup(STATE.mapMarkers).getBounds().pad(0.14)); }catch{}
  }
}
const _drawMapMarkersBaseV11 = drawMapMarkers;
drawMapMarkers = function(){
  setViewCopyV9();
  if(!STATE.map) return;
  STATE.mapMarkers.forEach(m => STATE.map.removeLayer(m));
  STATE.mapMarkers = [];

  if(STATE.currentProgram === 'educacion'){
    educationVenues().forEach(v => {
      const coord = mapCoordForItem(v, 'educacion');
      if(!coord) return;
      const cats = educationCategories().filter(c => educationHas(v,c.key)).map(c => c.label).join(', ') || 'Sin servicio asignado';
      const marker = L.marker([coord.lat, coord.lng], { icon:L.divIcon({className:'', html:'<div class="module-marker edu kmz">BT</div>', iconSize:[34,34], iconAnchor:[17,17]}) });
      marker.bindPopup(`<div class="popup-name">${escapeHtml(v.sede)}</div><div class="popup-row"><span>Zona</span><strong>${escapeHtml(v.zona || '—')}</strong></div><div class="popup-row"><span>Dirección</span><strong>${escapeHtml(v.address || '—')}</strong></div><div class="popup-row"><span>Servicios</span><strong>${escapeHtml(cats)}</strong></div>${mapSourcePillV11(coord)}`);
      marker.on('click', () => { educationMapInfoV10(v); const p=$('#mapInfo'); if(p) p.insertAdjacentHTML('beforeend', mapSourcePillV11(coord)); });
      marker.addTo(STATE.map); STATE.mapMarkers.push(marker);
    });
    fitMapToMarkersV11();
    return;
  }

  if(STATE.currentProgram === 'deporte'){
    const unitIcon = (txt='UD') => L.divIcon({ className:'', html:`<div class="module-marker sport kmz">${txt}</div>`, iconSize:[34,34], iconAnchor:[17,17] });
    const committeeIcon = (txt='C') => L.divIcon({ className:'', html:`<div class="module-marker committee kmz">${txt}</div>`, iconSize:[28,28], iconAnchor:[14,14] });
    sportsUnits().forEach(u => {
      const coord = mapCoordForItem(u, 'deporte'); if(!coord) return;
      const marker=L.marker([coord.lat,coord.lng],{icon:unitIcon(u.shortCode||'UD')});
      marker.bindPopup(`<div class="popup-name">${escapeHtml(u.name)}</div><div class="popup-row"><span>Tipo</span><strong>Unidad deportiva</strong></div><div class="popup-row"><span>Actividades</span><strong>${fmt((u.activities||[]).length)}</strong></div><div class="popup-row"><span>Admin</span><strong>${escapeHtml(u.admin||'—')}</strong></div>${mapSourcePillV11(coord)}`);
      marker.addTo(STATE.map); STATE.mapMarkers.push(marker);
    });
    sportsCommittees().forEach(c => {
      const coord = mapCoordForItem(c, 'deporte'); if(!coord) return;
      const marker=L.marker([coord.lat,coord.lng],{icon:committeeIcon((c.categoria||'').includes('ADMIN')?'A':'C')});
      marker.bindPopup(`<div class="popup-name">${escapeHtml(c.name)}</div><div class="popup-row"><span>Tipo</span><strong>${escapeHtml(c.tipo||'Comité / cancha')}</strong></div><div class="popup-row"><span>Estatus</span><strong>${escapeHtml(c.categoria||'—')}</strong></div>${mapSourcePillV11(coord)}`);
      marker.addTo(STATE.map); STATE.mapMarkers.push(marker);
    });
    fitMapToMarkersV11();
    return;
  }

  const cur = getCurrentPeriod();
  activeModules().forEach(mod => {
    const coord = mapCoordForItem(mod, 'salud'); if(!coord) return;
    const total = totalOf(cur.modules?.[mod.id]||{});
    const cls = isMental(mod) ? 'mental kmz' : 'kmz';
    const txt = mod.shortCode || (isMental(mod)?'AN':mod.name.substring(0,2).toUpperCase());
    const marker=L.marker([coord.lat,coord.lng],{icon:L.divIcon({className:'', html:`<div class="module-marker ${cls}">${txt}</div>`, iconSize:[32,32], iconAnchor:[16,16]})});
    marker.bindPopup(`<div class="popup-name">${escapeHtml(mod.name)}</div><div class="popup-row"><span>Segmento</span><strong>${isMental(mod)?'AlmaNova':'Salud'}</strong></div><div class="popup-row"><span>Total</span><strong>${fmt(total)}</strong></div>${mapSourcePillV11(coord)}`);
    marker.on('click', ()=> openModuleDetail(mod.id));
    marker.addTo(STATE.map); STATE.mapMarkers.push(marker);
  });
  fitMapToMarkersV11();
};


/* ============================================================
   V12 · Gestión editable + puntos manuales + educación diferenciada
   ============================================================ */
const UI_STORAGE_KEY_V12 = 'bh_merida_v12_gestion_ui';
function uiStateV12(){
  try{ return JSON.parse(localStorage.getItem(UI_STORAGE_KEY_V12) || '{"overrides":{},"points":[]}'); }
  catch{ return {overrides:{}, points:[]}; }
}
function saveUiStateV12(state){
  try{ localStorage.setItem(UI_STORAGE_KEY_V12, JSON.stringify(state)); }catch(e){ console.warn('No se pudo guardar gestión UI', e); }
}
function itemKeyV12(program, id){ return `${program}:${id}`; }
function getOverrideV12(program, id){ return uiStateV12().overrides[itemKeyV12(program,id)] || {}; }
function mergeItemV12(program, item, id){ return Object.assign({}, item || {}, getOverrideV12(program, id || item?.id || item?.sede || item?.name)); }
function getCustomPointsV12(program=STATE.currentProgram){ return (uiStateV12().points || []).filter(p => p.program === program); }
function saveOverrideV12(program, id, data){
  const st = uiStateV12();
  const key = itemKeyV12(program, id);
  st.overrides[key] = Object.assign({}, st.overrides[key] || {}, data, {updatedAt:new Date().toISOString()});
  saveUiStateV12(st);
}
function savePointV12(point){
  const st = uiStateV12();
  st.points = st.points || [];
  const idx = st.points.findIndex(p => p.id === point.id);
  if(idx >= 0) st.points[idx] = Object.assign({}, st.points[idx], point, {updatedAt:new Date().toISOString()});
  else st.points.push(Object.assign({id:`pt_${Date.now()}_${Math.random().toString(16).slice(2)}`, createdAt:new Date().toISOString()}, point));
  saveUiStateV12(st);
}
function deletePointV12(id){
  const st = uiStateV12(); st.points = (st.points || []).filter(p => p.id !== id); saveUiStateV12(st);
}
function svgIconV12(kind){
  const icons = {
    salud:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.6-9.3-9.1C1 8.4 3.3 4.5 7.1 4.5c2 0 3.5 1 4.9 2.6 1.4-1.6 2.9-2.6 4.9-2.6 3.8 0 6.1 3.9 4.4 7.4C19 16.4 12 21 12 21Z"/><path d="M7 12h3l1.2-2.5L13 15l1.4-3H17"/></svg>',
    mental:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4.5a4 4 0 0 0-4 4v1.1A4.8 4.8 0 0 0 3 13.5C3 17 5.8 20 9.4 20H12V7.5A3 3 0 0 0 9 4.5Z"/><path d="M15 4.5a4 4 0 0 1 4 4v1.1a4.8 4.8 0 0 1 2 3.9c0 3.5-2.8 6.5-6.4 6.5H12V7.5a3 3 0 0 1 3-3Z"/><path d="M8 10h3M13 10h3M8 14h2M14 14h2"/></svg>',
    ingles:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h10a4 4 0 0 1 4 4v10H8a4 4 0 0 1-4-4V5Z"/><path d="M8 9h6M8 13h8M8 17h5"/></svg>',
    biblioteca:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h5a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H5V4Z"/><path d="M19 4h-5a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h5V4Z"/><path d="M7 8h3M14 8h3"/></svg>',
    deporte:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3c2.6 2.3 4 5.3 4 9s-1.4 6.7-4 9M12 3c-2.6 2.3-4 5.3-4 9s1.4 6.7 4 9M3 12h18"/></svg>',
    punto:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>'
  };
  return icons[kind] || icons.punto;
}
function educationKindV12(v){
  const hasIng = educationHas(v,'ingles');
  const hasBibli = educationHas(v,'bibliotecas_ludotecas');
  const hasArt = educationHas(v,'artisticas');
  const hasAcomp = educationHas(v,'acompanamiento');
  if(hasIng && !hasBibli && !hasArt && !hasAcomp) return {label:'Inglés', code:'IN', icon:'ingles', cls:'edu-ingles'};
  if(hasBibli) return {label:'Biblioteca / Ludoteca', code:'BL', icon:'biblioteca', cls:'edu-biblioteca'};
  return {label:'Sede educativa', code:'ED', icon:'biblioteca', cls:'edu-general'};
}
function itemEditableSummaryV12(program, item){
  if(program === 'educacion') return [item.sede, item.address, item.zona, item.observaciones].filter(Boolean).join(' · ');
  if(program === 'deporte') return [item.name, item.admin || item.responsable, item.tipo, item.categoria].filter(Boolean).join(' · ');
  return [item.name, item.address, item.colony, item.schedule].filter(Boolean).join(' · ');
}
function editButtonV12(program, id, label='Editar información'){
  return `<button type="button" class="card-edit-btn" data-edit-program="${escapeHtml(program)}" data-edit-id="${escapeHtml(id)}">${svgIconV12('punto')}<span>${label}</span></button>`;
}
function bindEditButtonsV12(){
  $$('[data-edit-program]').forEach(btn => {
    if(btn.dataset.boundV12) return;
    btn.dataset.boundV12 = '1';
    btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openEditModalV12(btn.dataset.editProgram, btn.dataset.editId); });
  });
}
function catalogItemV12(program, id){
  if(program === 'educacion') return educationVenues().find(v => v.id === id) || getCustomPointsV12(program).find(p=>p.id===id);
  if(program === 'deporte') return sportsUnits().find(u => u.id === id) || sportsCommittees().find(c => c.id === id) || getCustomPointsV12(program).find(p=>p.id===id);
  return MODULES.find(m => m.id === id) || getCustomPointsV12(program).find(p=>p.id===id);
}
function openEditModalV12(program, id){
  const base = catalogItemV12(program, id); if(!base) return;
  const item = mergeItemV12(program, base, id);
  const isPoint = String(id).startsWith('pt_');
  const nameVal = item.name || item.sede || '';
  const addressVal = item.address || item.colony || item.zona || item.tipo || '';
  const detailVal = item.description || item.observaciones || item.schedule || item.admin || item.responsable || '';
  let modal = $('#editInfoModalV12');
  if(!modal){ modal = document.createElement('div'); modal.id='editInfoModalV12'; modal.className='module-modal hidden'; document.body.appendChild(modal); }
  modal.innerHTML = `
    <div class="module-modal-backdrop" data-close="1"></div>
    <form class="module-modal-card edit-info-card" id="editInfoFormV12">
      <button type="button" class="module-modal-close" data-close="1">×</button>
      <div class="module-modal-head"><span>Gestión de información · ${escapeHtml(programLabel(program))}</span><h2>Editar información visible</h2><p>Solo se modifican textos. La ubicación del mapa no se altera.</p></div>
      <div class="edit-grid-v12">
        <label>Nombre visible<input name="name" value="${escapeHtml(nameVal)}" required></label>
        <label>Dirección / zona / tipo<input name="address" value="${escapeHtml(addressVal)}"></label>
        <label class="edit-full">Información, horarios u observaciones<textarea name="detail" rows="5">${escapeHtml(detailVal)}</textarea></label>
      </div>
      <div class="edit-actions-v12">
        ${isPoint ? '<button type="button" class="btn-ghost danger" id="deletePointV12">Eliminar punto</button>' : ''}
        <button type="button" class="btn-ghost" data-close="1">Cancelar</button>
        <button class="btn-primary" type="submit">Guardar cambios</button>
      </div>
    </form>`;
  modal.classList.remove('hidden');
  modal.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click',()=>modal.classList.add('hidden')));
  $('#deletePointV12')?.addEventListener('click',()=>{ if(confirm('¿Eliminar este punto agregado?')){ deletePointV12(id); modal.classList.add('hidden'); refreshAll(); toast('Punto eliminado','success'); }});
  $('#editInfoFormV12')?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = { name:fd.get('name'), sede:fd.get('name'), address:fd.get('address'), colony:fd.get('address'), zona:fd.get('address'), description:fd.get('detail'), observaciones:fd.get('detail'), schedule:fd.get('detail'), admin:fd.get('detail'), responsable:fd.get('detail') };
    if(isPoint){ savePointV12(Object.assign({}, base, data, {id, program, lat:base.lat, lng:base.lng})); }
    else saveOverrideV12(program, id, data);
    modal.classList.add('hidden'); refreshAll(); toast('Información actualizada','success');
  }, {once:true});
}
function ensureMapToolsV12(){
  const view = $('#view-map .view-head'); if(!view || $('#addPointBtnV12')) return;
  const tools = document.createElement('div'); tools.className='view-tools map-tools-v12';
  tools.innerHTML = `<button id="addPointBtnV12" class="btn-secondary" type="button">${svgIconV12('punto')} Agregar punto</button>`;
  view.appendChild(tools);
  $('#addPointBtnV12')?.addEventListener('click', openAddPointModalV12);
}
function openAddPointModalV12(){
  const center = STATE.map ? STATE.map.getCenter() : {lat:20.97,lng:-89.62};
  let modal = $('#addPointModalV12');
  if(!modal){ modal=document.createElement('div'); modal.id='addPointModalV12'; modal.className='module-modal hidden'; document.body.appendChild(modal); }
  modal.innerHTML = `
    <div class="module-modal-backdrop" data-close="1"></div>
    <form class="module-modal-card edit-info-card" id="addPointFormV12">
      <button type="button" class="module-modal-close" data-close="1">×</button>
      <div class="module-modal-head"><span>Nuevo punto · ${escapeHtml(programLabel(STATE.currentProgram))}</span><h2>Agregar punto al mapa</h2><p>Se guardará en este navegador para el rubro actual. Puedes editar su información después.</p></div>
      <div class="edit-grid-v12">
        <label>Nombre del punto<input name="name" required placeholder="Ej. Nueva sede"></label>
        <label>Tipo / categoría<input name="type" placeholder="Ej. Biblioteca, módulo, cancha"></label>
        <label>Latitud<input name="lat" type="number" step="any" value="${center.lat.toFixed(6)}" required></label>
        <label>Longitud<input name="lng" type="number" step="any" value="${center.lng.toFixed(6)}" required></label>
        <label class="edit-full">Descripción / dirección / horario<textarea name="description" rows="4" placeholder="Información visible en el popup"></textarea></label>
      </div>
      <div class="edit-actions-v12"><button type="button" class="btn-ghost" data-close="1">Cancelar</button><button class="btn-primary" type="submit">Agregar punto</button></div>
    </form>`;
  modal.classList.remove('hidden');
  modal.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click',()=>modal.classList.add('hidden')));
  $('#addPointFormV12')?.addEventListener('submit', e => {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const lat = Number(fd.get('lat')), lng = Number(fd.get('lng'));
    if(!Number.isFinite(lat) || !Number.isFinite(lng)){ toast('Coordenadas inválidas','error'); return; }
    savePointV12({program:STATE.currentProgram, name:fd.get('name'), type:fd.get('type'), description:fd.get('description'), lat, lng});
    modal.classList.add('hidden'); refreshAll(); if(STATE.map) drawMapMarkers(); toast('Punto agregado al mapa','success');
  }, {once:true});
}
function renderCustomPointCardsV12(grid, program){
  const pts = getCustomPointsV12(program);
  if(!pts.length) return;
  grid.insertAdjacentHTML('beforeend', `<div class="module-section-title"><h3>Puntos agregados</h3><p>Registros creados manualmente para gestión interna del rubro.</p></div>`);
  pts.forEach(p=>{
    const card = document.createElement('div'); card.className = `module-card module-custom module-${program}`;
    card.innerHTML = `<div class="module-head"><div class="module-icon-v12">${svgIconV12('punto')}</div><div class="module-name">${escapeHtml(p.name)}<br><small class="muted">${escapeHtml(p.type||'Punto agregado')}</small></div><span class="module-status status-ACTIVO">NUEVO</span></div><div class="module-address">${escapeHtml(p.description||'')}</div><div class="module-total"><span class="muted">Coordenadas</span><strong>${Number(p.lat).toFixed(4)}, ${Number(p.lng).toFixed(4)}</strong></div>${editButtonV12(program,p.id,'Editar')}</div>`;
    grid.appendChild(card);
  });
}

const _moduleCardBaseV12 = moduleCard;
moduleCard = function(mod, cur, cls){
  const program = 'salud';
  const mmod = mergeItemV12(program, mod, mod.id);
  const card = _moduleCardBaseV12(mmod, cur, cls);
  const head = card.querySelector('.module-head');
  if(head && !head.querySelector('.module-icon-v12')) head.insertAdjacentHTML('afterbegin', `<div class="module-icon-v12">${svgIconV12(isMental(mmod)?'mental':'salud')}</div>`);
  card.insertAdjacentHTML('beforeend', editButtonV12(program, mod.id, 'Editar información'));
  bindEditButtonsV12();
  return card;
};
renderEducationModules = function(){
  const grid = $('#modulesGrid'); if(!grid) return;
  const search = ($('#moduleSearch')?.value || '').toLowerCase();
  const venues = educationVenues().map(v => mergeItemV12('educacion', v, v.id)).filter(v => !search || (v.sede||v.name||'').toLowerCase().includes(search) || (v.zona||'').toLowerCase().includes(search) || (v.address||'').toLowerCase().includes(search));
  grid.innerHTML = '<div class="module-section-title"><h3>Educación · Bibliotecas, ludotecas e inglés</h3><p>Las sedes de inglés se muestran separadas. Los talleres se consideran servicios de bibliotecas o ludotecas.</p></div>';
  venues.forEach(v=>{
    const kind = educationKindV12(v);
    const card=document.createElement('div'); card.className=`module-card module-educacion ${kind.cls}`;
    const services=educationCategories().filter(c=>educationHas(v,c.key)).map(c=>`<span>${escapeHtml(c.label)}</span>`).join('') || '<span>Sin indicador asignado</span>';
    const detail=educationCategories().filter(c=>educationHas(v,c.key)).map(c=>`<div class="module-stat module-stat-full"><div class="module-stat-label">${escapeHtml(c.label)}</div><div class="module-stat-value module-stat-text">${escapeHtml(v[c.key])}</div></div>`).join('');
    card.innerHTML=`<div class="module-head"><div class="module-icon-v12">${svgIconV12(kind.icon)}</div><div class="module-name">${escapeHtml(v.sede||v.name)}<br><small class="muted">${escapeHtml(v.zona||'')}</small></div><span class="module-status status-ACTIVO">${kind.code}</span></div><div class="module-type-v12">${escapeHtml(kind.label)}</div><div class="module-address">${escapeHtml(v.address||'')}</div><div class="module-services">${services}</div><div class="module-stats">${detail}</div>${v.observaciones?`<div class="module-schedule">${escapeHtml(v.observaciones)}</div>`:''}${editButtonV12('educacion', v.id, 'Editar información')}`;
    grid.appendChild(card);
  });
  renderCustomPointCardsV12(grid, 'educacion');
  bindEditButtonsV12();
};
renderSportsModules = function(){
  const grid=$('#modulesGrid'); if(!grid) return;
  const search=($('#moduleSearch')?.value||'').toLowerCase();
  const units=sportsUnits().map(u=>mergeItemV12('deporte', u, u.id)).filter(u=>!search || (u.name||'').toLowerCase().includes(search) || (u.admin||'').toLowerCase().includes(search) || (u.activities||[]).some(a=>(a.disciplina||'').toLowerCase().includes(search)));
  const committees=sportsCommittees().map(c=>mergeItemV12('deporte', c, c.id)).filter(c=>!search || (c.name||'').toLowerCase().includes(search) || (c.tipo||'').toLowerCase().includes(search) || (c.categoria||'').toLowerCase().includes(search));
  grid.innerHTML='<div class="module-section-title"><h3>Deporte · Unidades deportivas</h3><p>Horarios, disciplinas, responsables, comités y canchas.</p></div>';
  units.forEach(u=>{ const card=document.createElement('div'); card.className='module-card module-deporte'; const acts=(u.activities||[]).map(a=>`<div class="module-stat module-stat-full"><div class="module-stat-label">${escapeHtml(a.disciplina||'Actividad')}</div><div class="module-stat-value module-stat-text">${escapeHtml([a.horario,a.edades,a.cupo].filter(Boolean).join(' · ') || 'Horario por confirmar')}</div></div>`).join(''); const badges=(u.activities||[]).slice(0,6).map(a=>`<span>${escapeHtml(a.disciplina)}</span>`).join('') || '<span>Unidad deportiva</span>'; card.innerHTML=`<div class="module-head"><div class="module-icon-v12">${svgIconV12('deporte')}</div><div class="module-name">${escapeHtml(u.name)}<br><small class="muted">${escapeHtml(u.admin ? 'Admin: '+u.admin : 'Unidad deportiva')}</small></div><span class="module-status status-ACTIVO">DEP</span></div><div class="module-services">${badges}</div><div class="module-stats">${acts}</div><div class="module-total"><span class="muted">Actividades registradas</span><strong>${fmt((u.activities||[]).length)}</strong></div>${editButtonV12('deporte', u.id, 'Editar información')}`; grid.appendChild(card); });
  grid.insertAdjacentHTML('beforeend','<div class="module-section-title"><h3>Comités deportivos</h3><p>Listado de comités, administradores y canchas.</p></div>');
  committees.slice(0,80).forEach(c=>{ const card=document.createElement('div'); card.className='module-card module-comite'; card.innerHTML=`<div class="module-head"><div class="module-icon-v12">${svgIconV12('deporte')}</div><div class="module-name">${escapeHtml(c.name)}<br><small class="muted">${escapeHtml(c.tipo||'')}</small></div><span class="module-status status-ACTIVO">${(c.categoria||'COM').includes('ADMIN')?'ADM':'COM'}</span></div><div class="module-address">${escapeHtml(c.responsable||c.description||'')}</div><div class="module-total"><span class="muted">${escapeHtml(c.categoria||'')}</span><strong>${escapeHtml((c.id||'').replace('comite_',''))}</strong></div>${editButtonV12('deporte', c.id, 'Editar')}`; grid.appendChild(card); });
  renderCustomPointCardsV12(grid, 'deporte'); bindEditButtonsV12();
};
const _renderModulesBaseV12 = renderModules;
renderModules = function(){ _renderModulesBaseV12(); const grid=$('#modulesGrid'); if(grid && STATE.currentProgram==='salud') renderCustomPointCardsV12(grid,'salud'); bindEditButtonsV12(); };
function drawCustomPointsV12(){
  if(!STATE.map) return;
  getCustomPointsV12().forEach(p=>{
    const marker=L.marker([Number(p.lat),Number(p.lng)],{icon:L.divIcon({className:'',html:`<div class="module-marker custom">+</div>`,iconSize:[34,34],iconAnchor:[17,17]})});
    marker.bindPopup(`<div class="popup-name">${escapeHtml(p.name)}</div><div class="popup-row"><span>Tipo</span><strong>${escapeHtml(p.type||'Punto agregado')}</strong></div><div class="popup-row"><span>Info</span><strong>${escapeHtml(p.description||'—')}</strong></div><button class="popup-edit-v12" data-edit-program="${STATE.currentProgram}" data-edit-id="${p.id}">Editar información</button>`);
    marker.on('popupopen',()=>bindEditButtonsV12());
    marker.addTo(STATE.map); STATE.mapMarkers.push(marker);
  });
}
const _drawMapMarkersBaseV12 = drawMapMarkers;
drawMapMarkers = function(){
  setViewCopyV9();
  if(!STATE.map) return;
  STATE.mapMarkers.forEach(m=>STATE.map.removeLayer(m)); STATE.mapMarkers=[];
  if(STATE.currentProgram==='educacion'){
    educationVenues().forEach(v0=>{ const v=mergeItemV12('educacion', v0, v0.id); const coord=mapCoordForItem(v0,'educacion'); if(!coord) return; const kind=educationKindV12(v); const cats=educationCategories().filter(c=>educationHas(v,c.key)).map(c=>c.label).join(', ')||'Sin servicio asignado'; const marker=L.marker([coord.lat,coord.lng],{icon:L.divIcon({className:'',html:`<div class="module-marker edu ${kind.cls}">${kind.code}</div>`,iconSize:[34,34],iconAnchor:[17,17]})}); marker.bindPopup(`<div class="popup-name">${escapeHtml(v.sede||v.name)}</div><div class="popup-row"><span>Tipo</span><strong>${escapeHtml(kind.label)}</strong></div><div class="popup-row"><span>Dirección</span><strong>${escapeHtml(v.address||'—')}</strong></div><div class="popup-row"><span>Servicios</span><strong>${escapeHtml(cats)}</strong></div>${mapSourcePillV11(coord)}<button class="popup-edit-v12" data-edit-program="educacion" data-edit-id="${v0.id}">Editar información</button>`); marker.on('popupopen',()=>bindEditButtonsV12()); marker.addTo(STATE.map); STATE.mapMarkers.push(marker); });
    drawCustomPointsV12(); fitMapToMarkersV11(); return;
  }
  if(STATE.currentProgram==='deporte'){
    sportsUnits().forEach(u0=>{ const u=mergeItemV12('deporte',u0,u0.id); const coord=mapCoordForItem(u0,'deporte'); if(!coord) return; const marker=L.marker([coord.lat,coord.lng],{icon:L.divIcon({className:'',html:`<div class="module-marker sport kmz">${u.shortCode||'UD'}</div>`,iconSize:[34,34],iconAnchor:[17,17]})}); marker.bindPopup(`<div class="popup-name">${escapeHtml(u.name)}</div><div class="popup-row"><span>Tipo</span><strong>Unidad deportiva</strong></div><div class="popup-row"><span>Actividades</span><strong>${fmt((u.activities||[]).length)}</strong></div><div class="popup-row"><span>Admin</span><strong>${escapeHtml(u.admin||'—')}</strong></div>${mapSourcePillV11(coord)}<button class="popup-edit-v12" data-edit-program="deporte" data-edit-id="${u0.id}">Editar información</button>`); marker.on('popupopen',()=>bindEditButtonsV12()); marker.addTo(STATE.map); STATE.mapMarkers.push(marker); });
    sportsCommittees().forEach(c0=>{ const c=mergeItemV12('deporte',c0,c0.id); const coord=mapCoordForItem(c0,'deporte'); if(!coord) return; const marker=L.marker([coord.lat,coord.lng],{icon:L.divIcon({className:'',html:`<div class="module-marker committee kmz">${(c.categoria||'').includes('ADMIN')?'A':'C'}</div>`,iconSize:[28,28],iconAnchor:[14,14]})}); marker.bindPopup(`<div class="popup-name">${escapeHtml(c.name)}</div><div class="popup-row"><span>Tipo</span><strong>${escapeHtml(c.tipo||'Comité / cancha')}</strong></div><div class="popup-row"><span>Estatus</span><strong>${escapeHtml(c.categoria||'—')}</strong></div>${mapSourcePillV11(coord)}<button class="popup-edit-v12" data-edit-program="deporte" data-edit-id="${c0.id}">Editar</button>`); marker.on('popupopen',()=>bindEditButtonsV12()); marker.addTo(STATE.map); STATE.mapMarkers.push(marker); });
    drawCustomPointsV12(); fitMapToMarkersV11(); return;
  }
  const cur=getCurrentPeriod(); activeModules().forEach(m0=>{ const mod=mergeItemV12('salud',m0,m0.id); const coord=mapCoordForItem(m0,'salud'); if(!coord) return; const total=totalOf(cur.modules?.[m0.id]||{}); const cls=isMental(m0)?'mental kmz':'kmz'; const txt=mod.shortCode||(isMental(m0)?'AN':(mod.name||'').substring(0,2).toUpperCase()); const marker=L.marker([coord.lat,coord.lng],{icon:L.divIcon({className:'',html:`<div class="module-marker ${cls}">${txt}</div>`,iconSize:[32,32],iconAnchor:[16,16]})}); marker.bindPopup(`<div class="popup-name">${escapeHtml(mod.name)}</div><div class="popup-row"><span>Segmento</span><strong>${isMental(m0)?'AlmaNova':'Salud'}</strong></div><div class="popup-row"><span>Dirección</span><strong>${escapeHtml(mod.address||mod.colony||'—')}</strong></div><div class="popup-row"><span>Total</span><strong>${fmt(total)}</strong></div>${mapSourcePillV11(coord)}<button class="popup-edit-v12" data-edit-program="salud" data-edit-id="${m0.id}">Editar información</button>`); marker.on('click',()=>openModuleDetail(m0.id)); marker.on('popupopen',()=>bindEditButtonsV12()); marker.addTo(STATE.map); STATE.mapMarkers.push(marker); });
  drawCustomPointsV12(); fitMapToMarkersV11();
};
const _refreshAllBaseV12 = refreshAll;
refreshAll = function(){ ensureMapToolsV12(); _refreshAllBaseV12(); bindEditButtonsV12(); };
const _initNavBaseV12 = initNav;
initNav = function(){ _initNavBaseV12(); ensureMapToolsV12(); };


async function boot(){
  initData(); initParticles(); initLogin(); initNav(); initChartTabs(); initModuleFilters(); initProgramGate(); $('#programBackBtn')?.addEventListener('click', returnToProgramGate);
  setTimeout(()=>{ const s=$('#splash'); if(s) s.style.display='none'; $('#login')?.classList.remove('hidden'); }, 1200);
}
document.addEventListener('DOMContentLoaded', boot);
})();
