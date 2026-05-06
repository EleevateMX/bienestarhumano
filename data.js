/* ============================================================
   BIENESTAR HUMANO — BASE DE DATOS DEL SISTEMA
   - Módulos con coordenadas en Mérida, Yucatán
   - Datos del reporte enero-abril 2026 (PDF)
   - Histórico de Temas Prioritarios al 31 marzo 2026
   ============================================================ */

/* USUARIOS (las contraseñas pueden cambiarse luego en GitHub o Apps Script) */
const USERS = {
  alejandra: { name: 'Alejandra', password: 'Alejandra2026',  color:'#56AB2F', role:'admin' },
  chucho:    { name: 'Chucho',    password: 'Chucho2026',     color:'#0E2A6B', role:'admin' },
  sandra:    { name: 'Sandra',    password: 'Sandra2026',     color:'#F59E0B', role:'admin' },
  clarisa:   { name: 'Clarisa',   password: 'Clarisa2026',    color:'#EC4899', role:'admin' }
};

/* ENDPOINT DE GOOGLE APPS SCRIPT
   Reemplaza esta URL por la del Web App publicado en Apps Script.
   Si está vacío, el sistema funciona 100% en LocalStorage. */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwqDq6v_wpk7V-0OQTOHJYXv7JFm1UF6EuQkuTw11gLaNvv_0DXYCXmppCWhVEz4Tgoqw/exec'; // Ejemplo: 'https://script.google.com/macros/s/AKfy.../exec'

/* MÓDULOS MÉDICOS — coordenadas aproximadas en Mérida, Yucatán
   Lat/Lng centradas por colonia. Pueden ajustarse después. */
const MODULES = [
  { id:'aguilas',           name:'Águilas',                       status:'RECONV',  lat:21.0067, lng:-89.6395, colony:'Las Águilas' },
  { id:'azcorra_mat',       name:'Azcorra Matutino',              status:'ACTIVO',  lat:20.9486, lng:-89.6405, colony:'Azcorra' },
  { id:'azcorra_vesp',      name:'Azcorra Vespertino',            status:'ACTIVO',  lat:20.9486, lng:-89.6405, colony:'Azcorra' },
  { id:'camm_mat',          name:'CAMM Matutino',                 status:'ACTIVO',  lat:20.9714, lng:-89.6237, colony:'Centro' },
  { id:'camm_vesp',         name:'CAMM Vespertino',               status:'ACTIVO',  lat:20.9714, lng:-89.6237, colony:'Centro' },
  { id:'caucel',            name:'Caucel',                        status:'ACTIVO',  lat:21.0080, lng:-89.7019, colony:'Caucel' },
  { id:'chablekal',         name:'Chablekal',                     status:'ACTIVO',  lat:21.1106, lng:-89.6017, colony:'Chablekal' },
  { id:'chichi_suarez',     name:'Chichí Suárez',                 status:'ACTIVO',  lat:21.0294, lng:-89.5681, colony:'Chichí Suárez' },
  { id:'cholul',            name:'Cholul',                        status:'ACTIVO',  lat:21.0331, lng:-89.5853, colony:'Cholul' },
  { id:'emiliano_zapata',   name:'Emiliano Zapata Oriente',       status:'ACTIVO',  lat:20.9647, lng:-89.5781, colony:'Emiliano Zapata Oriente' },
  { id:'juan_pablo',        name:'Juan Pablo (El Papa)',          status:'ACTIVO',  lat:20.9844, lng:-89.6886, colony:'Juan Pablo II' },
  { id:'kukulcan_mat',      name:'Kukulcán Matutino',             status:'RECONV',  lat:20.9525, lng:-89.6539, colony:'Kukulcán' },
  { id:'kukulcan_vesp',     name:'Kukulcán Vespertino',           status:'RECONV',  lat:20.9525, lng:-89.6539, colony:'Kukulcán' },
  { id:'meliton_mat',       name:'Melitón Salazar Matutino',      status:'ACTIVO',  lat:20.9897, lng:-89.6175, colony:'Melitón Salazar' },
  { id:'meliton_vesp',      name:'Melitón Salazar Vespertino',    status:'CERRADO', lat:20.9897, lng:-89.6175, colony:'Melitón Salazar' },
  { id:'molas',             name:'Molas',                         status:'ACTIVO',  lat:20.8853, lng:-89.6086, colony:'Molas' },
  { id:'mulsay_mat',        name:'Mulsay Matutino',               status:'ACTIVO',  lat:20.9569, lng:-89.6711, colony:'Mulsay' },
  { id:'mulsay_vesp',       name:'Mulsay Vespertino',             status:'ACTIVO',  lat:20.9569, lng:-89.6711, colony:'Mulsay' },
  { id:'nora_quintana_mat', name:'Nora Quintana Matutino',        status:'ACTIVO',  lat:20.9389, lng:-89.6069, colony:'Nora Quintana' },
  { id:'nora_quintana_vesp',name:'Nora Quintana Vespertino',      status:'ACTIVO',  lat:20.9389, lng:-89.6069, colony:'Nora Quintana' },
  { id:'pensiones',         name:'Pensiones',                     status:'RECONV',  lat:20.9789, lng:-89.6428, colony:'Pensiones' },
  { id:'plan_ayala',        name:'Plan de Ayala Sur',             status:'CERRADO', lat:20.9356, lng:-89.6578, colony:'Plan de Ayala Sur' },
  { id:'porvenir',          name:'Porvenir',                      status:'ACTIVO',  lat:20.9603, lng:-89.6258, colony:'Porvenir' },
  { id:'renacimiento',      name:'Renacimiento',                  status:'ACTIVO',  lat:20.9853, lng:-89.6692, colony:'Renacimiento' },
  { id:'salvador_alvarado', name:'Salvador Alvarado Sur',         status:'ACTIVO',  lat:20.9456, lng:-89.6217, colony:'Salvador Alvarado Sur' },
  { id:'san_antonio',       name:'San Antonio Xluch',             status:'ACTIVO',  lat:20.9344, lng:-89.6478, colony:'San Antonio Xluch' },
  { id:'san_jose_tzal',     name:'San José Tzal',                 status:'ACTIVO',  lat:20.8631, lng:-89.6189, colony:'San José Tzal' },
  { id:'santa_rosa',        name:'Santa Rosa',                    status:'ACTIVO',  lat:20.9722, lng:-89.6608, colony:'Santa Rosa' },
  { id:'santa_rosa_ped',    name:'Santa Rosa (Pediatría)',        status:'ACTIVO',  lat:20.9722, lng:-89.6608, colony:'Santa Rosa' },
  { id:'sitpach',           name:'Sitpach',                       status:'ACTIVO',  lat:21.0367, lng:-89.5478, colony:'Sitpach' },
  { id:'vergel',            name:'Vergel',                        status:'ACTIVO',  lat:20.9214, lng:-89.6033, colony:'Vergel' },
  { id:'xoclan_carmelitas', name:'Xoclán Carmelitas',             status:'ACTIVO',  lat:20.9786, lng:-89.6731, colony:'Xoclán Carmelitas' },
  { id:'xoclan_susula_dental', name:'Xoclán Susulá (Dental)',     status:'ACTIVO',  lat:20.9858, lng:-89.6789, colony:'Xoclán Susulá' },
  { id:'xoclan_susula_vesp',name:'Xoclán Susulá Vespertino',      status:'ACTIVO',  lat:20.9858, lng:-89.6789, colony:'Xoclán Susulá' },
  { id:'almanova_sur',      name:'Alma Nova Sur',                 status:'ACTIVO',  lat:20.9367, lng:-89.6242, colony:'Sur', type:'mental' },
  { id:'almanova_pensiones',name:'Alma Nova Pensiones',           status:'ACTIVO',  lat:20.9789, lng:-89.6428, colony:'Pensiones', type:'mental' },
  { id:'almanova_oriente',  name:'Alma Nova Oriente',             status:'ACTIVO',  lat:20.9647, lng:-89.5781, colony:'Oriente', type:'mental' },
  { id:'almanova_norte',    name:'Alma Nova Norte',               status:'ACTIVO',  lat:21.0150, lng:-89.6258, colony:'Norte', type:'mental' },
  { id:'cemanud',           name:'CEMANUD',                       status:'ACTIVO',  lat:20.9714, lng:-89.6237, colony:'Centro', type:'nutri' },
  { id:'medico_domicilio',  name:'Médico a Domicilio',            status:'ACTIVO',  lat:20.9714, lng:-89.6237, colony:'Móvil', type:'movil' },
  { id:'ferias',            name:'Ferias y Brigadas',             status:'ACTIVO',  lat:20.9714, lng:-89.6237, colony:'Móvil', type:'movil' },
  { id:'cruz_roja',         name:'Cruz Roja',                     status:'CERRADO', lat:20.9744, lng:-89.6203, colony:'Centro' },
  { id:'sara_mena',         name:'Sara Mena',                     status:'ACTIVO',  lat:20.9583, lng:-89.6500, colony:'Sara Mena' },
  { id:'comisarias',        name:'Comisarías',                    status:'ACTIVO',  lat:20.9714, lng:-89.6237, colony:'Varias', type:'movil' },
  { id:'crescencio_rejon',  name:'M. Crescencio Rejón',           status:'ACTIVO',  lat:20.9667, lng:-89.6233, colony:'Centro' }
];

/* ============================================================
   DATOS DEL REPORTE ENERO-ABRIL 2026 (PDF)
   Estructura: por módulo, totales en cada servicio
   medicos = consultas médicas
   odonto, enfermeria, rehab, mental, nutri = servicios
   ============================================================ */
const REPORT_2026_Q1 = {
  period:'2026-Q1', label:'Enero-Abril 2026',
  uploadedBy:'Sistema (datos iniciales)', uploadedAt: new Date().toISOString(),
  modules: {
    aguilas:           { medicos:0,    odonto:0,   enfermeria:0,    rehab:0,    mental:0,    nutri:0 },
    azcorra_mat:       { medicos:156,  odonto:146, enfermeria:1298, rehab:0,    mental:48,   nutri:0 },
    azcorra_vesp:      { medicos:510,  odonto:125, enfermeria:1187, rehab:0,    mental:0,    nutri:0 },
    camm_mat:          { medicos:182,  odonto:155, enfermeria:1706, rehab:0,    mental:82,   nutri:13 },
    camm_vesp:         { medicos:0,    odonto:46,  enfermeria:691,  rehab:0,    mental:0,    nutri:0 },
    caucel:            { medicos:55,   odonto:54,  enfermeria:299,  rehab:57,   mental:100,  nutri:70 },
    chablekal:         { medicos:568,  odonto:145, enfermeria:1082, rehab:0,    mental:0,    nutri:0 },
    chichi_suarez:     { medicos:169,  odonto:112, enfermeria:1106, rehab:0,    mental:43,   nutri:0 },
    cholul:            { medicos:280,  odonto:83,  enfermeria:961,  rehab:826,  mental:40,   nutri:0 },
    emiliano_zapata:   { medicos:342,  odonto:122, enfermeria:936,  rehab:0,    mental:0,    nutri:0 },
    juan_pablo:        { medicos:588,  odonto:0,   enfermeria:1536, rehab:0,    mental:0,    nutri:0 },
    kukulcan_mat:      { medicos:0,    odonto:0,   enfermeria:0,    rehab:0,    mental:0,    nutri:0 },
    kukulcan_vesp:     { medicos:0,    odonto:0,   enfermeria:0,    rehab:0,    mental:0,    nutri:0 },
    meliton_mat:       { medicos:122,  odonto:150, enfermeria:328,  rehab:320,  mental:81,   nutri:8 },
    meliton_vesp:      { medicos:0,    odonto:0,   enfermeria:0,    rehab:0,    mental:0,    nutri:0 },
    molas:             { medicos:329,  odonto:85,  enfermeria:1093, rehab:0,    mental:12,   nutri:0 },
    mulsay_mat:        { medicos:171,  odonto:122, enfermeria:324,  rehab:0,    mental:75,   nutri:0 },
    mulsay_vesp:       { medicos:101,  odonto:138, enfermeria:198,  rehab:0,    mental:0,    nutri:0 },
    nora_quintana_mat: { medicos:186,  odonto:149, enfermeria:1024, rehab:0,    mental:0,    nutri:0 },
    nora_quintana_vesp:{ medicos:176,  odonto:52,  enfermeria:721,  rehab:0,    mental:0,    nutri:0 },
    pensiones:         { medicos:0,    odonto:0,   enfermeria:0,    rehab:0,    mental:0,    nutri:0 },
    plan_ayala:        { medicos:0,    odonto:0,   enfermeria:0,    rehab:0,    mental:0,    nutri:0 },
    porvenir:          { medicos:333,  odonto:0,   enfermeria:1812, rehab:0,    mental:0,    nutri:0 },
    renacimiento:      { medicos:262,  odonto:0,   enfermeria:1206, rehab:1669, mental:131,  nutri:0 },
    salvador_alvarado: { medicos:477,  odonto:106, enfermeria:2259, rehab:0,    mental:0,    nutri:0 },
    san_antonio:       { medicos:210,  odonto:177, enfermeria:4201, rehab:625,  mental:86,   nutri:10 },
    san_jose_tzal:     { medicos:109,  odonto:68,  enfermeria:327,  rehab:78,   mental:10,   nutri:0 },
    santa_rosa:        { medicos:91,   odonto:161, enfermeria:1016, rehab:705,  mental:136,  nutri:93 },
    santa_rosa_ped:    { medicos:190,  odonto:0,   enfermeria:562,  rehab:0,    mental:0,    nutri:0 },
    sitpach:           { medicos:112,  odonto:59,  enfermeria:329,  rehab:0,    mental:52,   nutri:0 },
    vergel:            { medicos:371,  odonto:194, enfermeria:1887, rehab:0,    mental:99,   nutri:85 },
    xoclan_carmelitas: { medicos:179,  odonto:0,   enfermeria:340,  rehab:0,    mental:0,    nutri:0 },
    xoclan_susula_dental:{ medicos:0,  odonto:205, enfermeria:0,    rehab:0,    mental:0,    nutri:0 },
    xoclan_susula_vesp:{ medicos:0,    odonto:144, enfermeria:0,    rehab:0,    mental:0,    nutri:0 },
    almanova_sur:      { medicos:0,    odonto:0,   enfermeria:0,    rehab:0,    mental:1122, nutri:0 },
    almanova_pensiones:{ medicos:0,    odonto:0,   enfermeria:0,    rehab:0,    mental:645,  nutri:0 },
    almanova_oriente:  { medicos:0,    odonto:0,   enfermeria:0,    rehab:0,    mental:472,  nutri:0 },
    almanova_norte:    { medicos:0,    odonto:0,   enfermeria:0,    rehab:0,    mental:560,  nutri:0 },
    cemanud:           { medicos:0,    odonto:0,   enfermeria:0,    rehab:0,    mental:0,    nutri:986 },
    medico_domicilio:  { medicos:908,  odonto:0,   enfermeria:520,  rehab:148,  mental:0,    nutri:0 },
    ferias:            { medicos:232,  odonto:343, enfermeria:711,  rehab:0,    mental:301,  nutri:1251 },
    cruz_roja:         { medicos:0,    odonto:0,   enfermeria:0,    rehab:0,    mental:0,    nutri:0 },
    sara_mena:         { medicos:0,    odonto:0,   enfermeria:0,    rehab:0,    mental:105,  nutri:0 },
    comisarias:        { medicos:0,    odonto:0,   enfermeria:0,    rehab:0,    mental:0,    nutri:0 },
    crescencio_rejon:  { medicos:24,   odonto:0,   enfermeria:32,   rehab:0,    mental:7,    nutri:0 }
  }
};

/* ============================================================
   HISTÓRICO MENSUAL (simulado a partir de promedios mensuales del PDF)
   Estos valores se reemplazarán cuando el usuario cargue meses reales.
   Los promedios mensuales del PDF: 17,139 atenciones / mes
   ============================================================ */
function generateMonthlyHistory(){
  const months = [];
  const start = new Date(2024, 8, 1); // 1 de septiembre 2024
  const end = new Date(2026, 2, 31);  // 31 de marzo 2026
  // Promedios calculados a partir del PDF
  const avg = { medicos: 5713, odonto: 2383, enfermeria: 9897, rehab: 1476, mental: 1402, nutri: 838 };
  const cur = new Date(start);
  while(cur <= end){
    const y = cur.getFullYear(), m = cur.getMonth();
    const variance = 0.85 + Math.random() * 0.3; // ±15%
    const trend = 1 + ( (cur - start) / (end - start) ) * 0.18; // crecimiento ~18%
    months.push({
      period: `${y}-${String(m+1).padStart(2,'0')}`,
      label: cur.toLocaleString('es-MX', {month:'long', year:'numeric'}),
      uploadedBy: 'Histórico inicial',
      uploadedAt: cur.toISOString(),
      summary: {
        medicos: Math.round(avg.medicos * variance * trend),
        odonto: Math.round(avg.odonto * variance * trend),
        enfermeria: Math.round(avg.enfermeria * variance * trend),
        rehab: Math.round(avg.rehab * variance * trend),
        mental: Math.round(avg.mental * variance * trend),
        nutri: Math.round(avg.nutri * variance * trend)
      }
    });
    cur.setMonth(cur.getMonth()+1);
  }
  return months;
}

/* TEMAS PRIORITARIOS (concentrado al 31 de marzo de 2026) */
const PRIORITY_DATA = {
  asOf: '31 de marzo de 2026',
  salud: [
    { lbl:'Atenciones médicas totales',        num: 52871 },
    { lbl:'Consultas en módulos médicos',      num: 42158 },
    { lbl:'Consultas en módulos móviles',      num: 4681  },
    { lbl:'Médico a domicilio',                num: 6032  },
    { lbl:'Consultas de odontología',          num: 21556 },
    { lbl:'Rehabilitaciones',                  num: 32264 },
    { lbl:'Detecciones y atenciones de enfermería', num: 175692 },
    { lbl:'Odontología en unidades móviles',   num: 5055  },
    { lbl:'Rehabilitación en unidades móviles',num: 1504  },
    { lbl:'Enfermería en unidades móviles',    num: 73945 },
    { lbl:'Ferias de salud',                   num: 422   },
    { lbl:'Colonias atendidas',                num: 272   },
    { lbl:'Ferias en comisarías',              num: 312   }
  ],
  mujeres: [
    { lbl:'Consultas en módulos',              num: 24497 },
    { lbl:'Consultas en módulos móviles',      num: 2987  },
    { lbl:'Consultas de ginecología',          num: 1138  },
    { lbl:'Total de mastografías',             num: 2668  },
    { lbl:'CAMM',                              num: 1078  },
    { lbl:'Mastógrafo móvil',                  num: 1909  },
    { lbl:'DOCMA / exploración mamaria',       num: 2605  },
    { lbl:'DOCMA + Mastografías',              num: 5348  },
    { lbl:'Total de ultrasonidos',             num: 891   },
    { lbl:'Ultrasonidos en CAMM',              num: 843   },
    { lbl:'Ultrasonidos en mastógrafo móvil',  num: 266   },
    { lbl:'Odontológicas en módulos',          num: 12340 },
    { lbl:'Odontológicas en módulos móviles',  num: 3051  },
    { lbl:'Rehabilitación',                    num: 20034 },
    { lbl:'Rehabilitación móvil',              num: 1116  },
    { lbl:'Detecciones y atenciones enfermería', num: 118352 },
    { lbl:'Enfermería en unidades móviles',    num: 40426 }
  ],
  mental: [
    { lbl:'Personas atendidas en ALMA NOVA',   num: 13944 },
    { lbl:'Consultas psicológicas',            num: 25234 },
    { lbl:'Beneficiarios en prevención',       num: 19273 },
    { lbl:'Canalizaciones realizadas',         num: 241   },
    { lbl:'Personas atendidas en brigadas',    num: 4542  }
  ]
};

/* CATÁLOGO de servicios para los KPI */
const SERVICE_DEFS = [
  { key:'medicos',    label:'Médicos',       color:'#1E50C5' },
  { key:'odonto',     label:'Odontología',   color:'#56AB2F' },
  { key:'enfermeria', label:'Enfermería',    color:'#F59E0B' },
  { key:'rehab',      label:'Rehabilitación',color:'#8B5CF6' },
  { key:'mental',     label:'Salud Mental',  color:'#EC4899' },
  { key:'nutri',      label:'Nutrición',     color:'#06B6D4' }
];
