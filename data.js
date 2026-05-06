/* ============================================================
   BIENESTAR HUMANO — BASE DE DATOS V6
   23 módulos de Salud + 5 AlmaNova. Sin reconvertidos ni cerrados.
   ============================================================ */
const USERS = {
  alejandra_mejia:    { name: 'Alejandra Mejía',    password: 'AlejandraBH2026',  color:'#56AB2F', role:'admin' },
  jesus_perez:        { name: 'Jesús Pérez',        password: 'JesusBH2026',      color:'#0E2A6B', role:'admin' },
  alfonso_avila:      { name: 'Alfonso Ávila',      password: 'AlfonsoBH2026',    color:'#1E50C5', role:'admin' },
  crescencio_gutierrez:{ name: 'Cresencio Gutiérrez', password: 'CresencioBH2026', color:'#F59E0B', role:'admin' },
  ivan_herrera:       { name: 'Iván Herrera',       password: 'IvanBH2026',       color:'#8B5CF6', role:'admin' }
};
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwqDq6v_wpk7V-0OQTOHJYXv7JFm1UF6EuQkuTw11gLaNvv_0DXYCXmppCWhVEz4Tgoqw/exec';
const MODULES = [
  {
    "id": "azcorra",
    "name": "Azcorra",
    "status": "ACTIVO",
    "lat": 20.9486,
    "lng": -89.6405,
    "colony": "Azcorra"
  },
  {
    "id": "caucel",
    "name": "Caucel",
    "status": "ACTIVO",
    "lat": 21.008,
    "lng": -89.7019,
    "colony": "Caucel"
  },
  {
    "id": "camm",
    "name": "CAMM",
    "status": "ACTIVO",
    "lat": 20.9714,
    "lng": -89.6237,
    "colony": "Centro"
  },
  {
    "id": "chablekal",
    "name": "Chablekal",
    "status": "ACTIVO",
    "lat": 21.1106,
    "lng": -89.6017,
    "colony": "Chablekal"
  },
  {
    "id": "chichi_suarez",
    "name": "Chichí Suárez",
    "status": "ACTIVO",
    "lat": 21.0294,
    "lng": -89.5681,
    "colony": "Chichí Suárez"
  },
  {
    "id": "cholul",
    "name": "Cholul",
    "status": "ACTIVO",
    "lat": 21.0331,
    "lng": -89.5853,
    "colony": "Cholul"
  },
  {
    "id": "crescencio_rejon",
    "name": "M. Crescencio Rejón",
    "status": "ACTIVO",
    "lat": 20.9667,
    "lng": -89.6233,
    "colony": "Centro"
  },
  {
    "id": "emiliano_zapata",
    "name": "Emiliano Zapata Oriente",
    "status": "ACTIVO",
    "lat": 20.9647,
    "lng": -89.5781,
    "colony": "Emiliano Zapata Oriente"
  },
  {
    "id": "juan_pablo",
    "name": "Juan Pablo II / El Papa",
    "status": "ACTIVO",
    "lat": 20.9844,
    "lng": -89.6886,
    "colony": "Juan Pablo II"
  },
  {
    "id": "meliton",
    "name": "Melitón Salazar",
    "status": "ACTIVO",
    "lat": 20.9897,
    "lng": -89.6175,
    "colony": "Melitón Salazar"
  },
  {
    "id": "mulsay",
    "name": "Mulsay",
    "status": "ACTIVO",
    "lat": 20.9569,
    "lng": -89.6711,
    "colony": "Mulsay"
  },
  {
    "id": "molas",
    "name": "Molas",
    "status": "ACTIVO",
    "lat": 20.8853,
    "lng": -89.6086,
    "colony": "Molas"
  },
  {
    "id": "nora_quintana",
    "name": "Nora Quintana",
    "status": "ACTIVO",
    "lat": 20.9389,
    "lng": -89.6069,
    "colony": "Nora Quintana"
  },
  {
    "id": "salvador_alvarado",
    "name": "Salvador Alvarado Sur",
    "status": "ACTIVO",
    "lat": 20.9456,
    "lng": -89.6217,
    "colony": "Salvador Alvarado Sur"
  },
  {
    "id": "san_antonio",
    "name": "San Antonio Xluch",
    "status": "ACTIVO",
    "lat": 20.9344,
    "lng": -89.6478,
    "colony": "San Antonio Xluch"
  },
  {
    "id": "san_jose_tzal",
    "name": "San José Tzal",
    "status": "ACTIVO",
    "lat": 20.8631,
    "lng": -89.6189,
    "colony": "San José Tzal"
  },
  {
    "id": "santa_rosa",
    "name": "Santa Rosa",
    "status": "ACTIVO",
    "lat": 20.9722,
    "lng": -89.6608,
    "colony": "Santa Rosa"
  },
  {
    "id": "sitpach",
    "name": "Sitpach",
    "status": "ACTIVO",
    "lat": 21.0367,
    "lng": -89.5478,
    "colony": "Sitpach"
  },
  {
    "id": "porvenir",
    "name": "Porvenir",
    "status": "ACTIVO",
    "lat": 20.9603,
    "lng": -89.6258,
    "colony": "Porvenir"
  },
  {
    "id": "vergel",
    "name": "Vergel",
    "status": "ACTIVO",
    "lat": 20.9214,
    "lng": -89.6033,
    "colony": "Vergel"
  },
  {
    "id": "xoclan",
    "name": "Xoclán",
    "status": "ACTIVO",
    "lat": 20.9786,
    "lng": -89.6731,
    "colony": "Xoclán"
  },
  {
    "id": "xoclan_susula",
    "name": "Xoclán Susulá",
    "status": "ACTIVO",
    "lat": 20.9858,
    "lng": -89.6789,
    "colony": "Xoclán Susulá"
  },
  {
    "id": "renacimiento",
    "name": "Renacimiento",
    "status": "ACTIVO",
    "lat": 20.9853,
    "lng": -89.6692,
    "colony": "Renacimiento"
  },
  {
    "id": "almanova_sur",
    "name": "AlmaNova Sur",
    "status": "ACTIVO",
    "lat": 20.9367,
    "lng": -89.6242,
    "colony": "Sur",
    "type": "mental"
  },
  {
    "id": "almanova_pensiones",
    "name": "AlmaNova Pensiones",
    "status": "ACTIVO",
    "lat": 20.9789,
    "lng": -89.6428,
    "colony": "Pensiones",
    "type": "mental"
  },
  {
    "id": "almanova_oriente",
    "name": "AlmaNova Oriente",
    "status": "ACTIVO",
    "lat": 20.9647,
    "lng": -89.5781,
    "colony": "Oriente",
    "type": "mental"
  },
  {
    "id": "almanova_norte",
    "name": "AlmaNova Norte",
    "status": "ACTIVO",
    "lat": 21.015,
    "lng": -89.6258,
    "colony": "Norte",
    "type": "mental"
  },
  {
    "id": "almanova_caucel",
    "name": "AlmaNova Caucel",
    "status": "ACTIVO",
    "lat": 21.008,
    "lng": -89.7019,
    "colony": "Caucel",
    "type": "mental"
  }
];
const REPORT_2026_Q1 = { period:'2026-Q1', label:'Enero-Abril 2026', uploadedBy:'Sistema (datos iniciales)', uploadedAt: new Date().toISOString(), modules: {
  "azcorra": {
    "medicos": 666,
    "odonto": 271,
    "enfermeria": 2485,
    "rehab": 0,
    "mental": 48,
    "nutri": 0
  },
  "caucel": {
    "medicos": 55,
    "odonto": 54,
    "enfermeria": 299,
    "rehab": 57,
    "mental": 100,
    "nutri": 70
  },
  "camm": {
    "medicos": 182,
    "odonto": 201,
    "enfermeria": 2397,
    "rehab": 0,
    "mental": 82,
    "nutri": 13
  },
  "chablekal": {
    "medicos": 568,
    "odonto": 145,
    "enfermeria": 1082,
    "rehab": 0,
    "mental": 0,
    "nutri": 0
  },
  "chichi_suarez": {
    "medicos": 169,
    "odonto": 112,
    "enfermeria": 1106,
    "rehab": 0,
    "mental": 43,
    "nutri": 0
  },
  "cholul": {
    "medicos": 280,
    "odonto": 83,
    "enfermeria": 961,
    "rehab": 826,
    "mental": 40,
    "nutri": 0
  },
  "crescencio_rejon": {
    "medicos": 24,
    "odonto": 0,
    "enfermeria": 32,
    "rehab": 0,
    "mental": 7,
    "nutri": 0
  },
  "emiliano_zapata": {
    "medicos": 342,
    "odonto": 122,
    "enfermeria": 936,
    "rehab": 0,
    "mental": 0,
    "nutri": 0
  },
  "juan_pablo": {
    "medicos": 588,
    "odonto": 0,
    "enfermeria": 1536,
    "rehab": 0,
    "mental": 0,
    "nutri": 0
  },
  "meliton": {
    "medicos": 122,
    "odonto": 150,
    "enfermeria": 328,
    "rehab": 320,
    "mental": 81,
    "nutri": 8
  },
  "mulsay": {
    "medicos": 272,
    "odonto": 260,
    "enfermeria": 522,
    "rehab": 0,
    "mental": 75,
    "nutri": 0
  },
  "molas": {
    "medicos": 329,
    "odonto": 85,
    "enfermeria": 1093,
    "rehab": 0,
    "mental": 12,
    "nutri": 0
  },
  "nora_quintana": {
    "medicos": 362,
    "odonto": 201,
    "enfermeria": 1745,
    "rehab": 0,
    "mental": 0,
    "nutri": 0
  },
  "salvador_alvarado": {
    "medicos": 477,
    "odonto": 106,
    "enfermeria": 2259,
    "rehab": 0,
    "mental": 0,
    "nutri": 0
  },
  "san_antonio": {
    "medicos": 210,
    "odonto": 177,
    "enfermeria": 4201,
    "rehab": 625,
    "mental": 86,
    "nutri": 10
  },
  "san_jose_tzal": {
    "medicos": 109,
    "odonto": 68,
    "enfermeria": 327,
    "rehab": 78,
    "mental": 10,
    "nutri": 0
  },
  "santa_rosa": {
    "medicos": 281,
    "odonto": 161,
    "enfermeria": 1578,
    "rehab": 705,
    "mental": 136,
    "nutri": 93
  },
  "sitpach": {
    "medicos": 112,
    "odonto": 59,
    "enfermeria": 329,
    "rehab": 0,
    "mental": 52,
    "nutri": 0
  },
  "porvenir": {
    "medicos": 333,
    "odonto": 0,
    "enfermeria": 1812,
    "rehab": 0,
    "mental": 0,
    "nutri": 0
  },
  "vergel": {
    "medicos": 371,
    "odonto": 194,
    "enfermeria": 1887,
    "rehab": 0,
    "mental": 99,
    "nutri": 85
  },
  "xoclan": {
    "medicos": 179,
    "odonto": 0,
    "enfermeria": 340,
    "rehab": 0,
    "mental": 0,
    "nutri": 0
  },
  "xoclan_susula": {
    "medicos": 0,
    "odonto": 349,
    "enfermeria": 0,
    "rehab": 0,
    "mental": 0,
    "nutri": 0
  },
  "renacimiento": {
    "medicos": 262,
    "odonto": 0,
    "enfermeria": 1206,
    "rehab": 1669,
    "mental": 131,
    "nutri": 0
  },
  "almanova_sur": {
    "medicos": 0,
    "odonto": 0,
    "enfermeria": 0,
    "rehab": 0,
    "mental": 1122,
    "nutri": 0
  },
  "almanova_pensiones": {
    "medicos": 0,
    "odonto": 0,
    "enfermeria": 0,
    "rehab": 0,
    "mental": 645,
    "nutri": 0
  },
  "almanova_oriente": {
    "medicos": 0,
    "odonto": 0,
    "enfermeria": 0,
    "rehab": 0,
    "mental": 472,
    "nutri": 0
  },
  "almanova_norte": {
    "medicos": 0,
    "odonto": 0,
    "enfermeria": 0,
    "rehab": 0,
    "mental": 560,
    "nutri": 0
  },
  "almanova_caucel": {
    "medicos": 0,
    "odonto": 0,
    "enfermeria": 0,
    "rehab": 0,
    "mental": 0,
    "nutri": 0
  }
} };
function generateMonthlyHistory(){
  const months = [];
  const start = new Date(2024, 8, 1);
  const end = new Date(2025, 11, 31);
  const avg = { medicos: 5713, odonto: 2383, enfermeria: 9897, rehab: 1476, mental: 1402, nutri: 838 };
  const cur = new Date(start); let i = 0;
  while(cur <= end){
    const y = cur.getFullYear(), m = cur.getMonth();
    const seasonal = 0.94 + (Math.sin((i + 1) * 1.37) * 0.055) + (Math.cos((i + 2) * 0.71) * 0.035);
    const trend = 1 + (i * 0.012);
    months.push({ period: `${y}-${String(m+1).padStart(2,'0')}`, label: cur.toLocaleString('es-MX', {month:'long', year:'numeric'}), uploadedBy:'Histórico de referencia', uploadedAt:cur.toISOString(), summary:{ medicos:Math.round(avg.medicos*seasonal*trend), odonto:Math.round(avg.odonto*seasonal*trend), enfermeria:Math.round(avg.enfermeria*seasonal*trend), rehab:Math.round(avg.rehab*seasonal*trend), mental:Math.round(avg.mental*seasonal*trend), nutri:Math.round(avg.nutri*seasonal*trend) } });
    i++; cur.setMonth(cur.getMonth()+1);
  }
  return months;
}
const PRIORITY_DATA = {
  "asOf": "31 de marzo de 2026",
  "salud": [
    {
      "lbl": "Atenciones médicas totales",
      "num": 52871
    },
    {
      "lbl": "Consultas en módulos médicos",
      "num": 42158
    },
    {
      "lbl": "Consultas en módulos móviles",
      "num": 4681
    },
    {
      "lbl": "Médico a domicilio",
      "num": 6032
    },
    {
      "lbl": "Consultas de odontología",
      "num": 21556
    },
    {
      "lbl": "Rehabilitaciones",
      "num": 32264
    },
    {
      "lbl": "Detecciones y atenciones de enfermería",
      "num": 175692
    },
    {
      "lbl": "Odontología en unidades móviles",
      "num": 5055
    },
    {
      "lbl": "Rehabilitación en unidades móviles",
      "num": 1504
    },
    {
      "lbl": "Enfermería en unidades móviles",
      "num": 73945
    },
    {
      "lbl": "Ferias de salud",
      "num": 422
    },
    {
      "lbl": "Colonias atendidas",
      "num": 272
    },
    {
      "lbl": "Ferias en comisarías",
      "num": 312
    }
  ],
  "mujeres": [
    {
      "lbl": "Consultas en módulos",
      "num": 24497
    },
    {
      "lbl": "Consultas en módulos móviles",
      "num": 2987
    },
    {
      "lbl": "Consultas de ginecología",
      "num": 1138
    },
    {
      "lbl": "Total de mastografías",
      "num": 2668
    },
    {
      "lbl": "CAMM",
      "num": 1078
    },
    {
      "lbl": "Mastógrafo móvil",
      "num": 1909
    },
    {
      "lbl": "DOCMA / exploración mamaria",
      "num": 2605
    },
    {
      "lbl": "DOCMA + Mastografías",
      "num": 5348
    },
    {
      "lbl": "Total de ultrasonidos",
      "num": 891
    },
    {
      "lbl": "Ultrasonidos en CAMM",
      "num": 843
    },
    {
      "lbl": "Ultrasonidos en mastógrafo móvil",
      "num": 266
    },
    {
      "lbl": "Odontológicas en módulos",
      "num": 12340
    },
    {
      "lbl": "Odontológicas en módulos móviles",
      "num": 3051
    },
    {
      "lbl": "Rehabilitación",
      "num": 20034
    },
    {
      "lbl": "Rehabilitación móvil",
      "num": 1116
    },
    {
      "lbl": "Detecciones y atenciones enfermería",
      "num": 118352
    },
    {
      "lbl": "Enfermería en unidades móviles",
      "num": 40426
    }
  ],
  "mental": [
    {
      "lbl": "Personas atendidas en ALMA NOVA",
      "num": 13944
    },
    {
      "lbl": "Consultas psicológicas",
      "num": 25234
    },
    {
      "lbl": "Beneficiarios en prevención",
      "num": 19273
    },
    {
      "lbl": "Canalizaciones realizadas",
      "num": 241
    },
    {
      "lbl": "Personas atendidas en brigadas",
      "num": 4542
    }
  ]
};
const SERVICE_DEFS = [
  {
    "key": "medicos",
    "label": "Médicos",
    "color": "#1E50C5"
  },
  {
    "key": "odonto",
    "label": "Odontología",
    "color": "#56AB2F"
  },
  {
    "key": "enfermeria",
    "label": "Enfermería",
    "color": "#F59E0B"
  },
  {
    "key": "rehab",
    "label": "Rehabilitación",
    "color": "#8B5CF6"
  },
  {
    "key": "mental",
    "label": "Salud Mental",
    "color": "#EC4899"
  },
  {
    "key": "nutri",
    "label": "Nutrición",
    "color": "#06B6D4"
  }
];
