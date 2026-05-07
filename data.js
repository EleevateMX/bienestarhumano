/* ============================================================
   BIENESTAR HUMANO — BASE DE DATOS V11
   23 módulos de Salud + 5 AlmaNova. Sin reconvertidos ni cerrados.
   ============================================================ */
const USERS = {
  alejandra_mejia:    { name: 'Alejandra Mejía',    password: 'AlejandraBH2026',  color:'#56AB2F', role:'admin', allowedPrograms:['salud','educacion','deporte'] },
  jesus_perez:        { name: 'Jesús Pérez',        password: 'JesusBH2026',      color:'#0E2A6B', role:'admin', allowedPrograms:['salud','educacion','deporte'] },
  alfonso_avila:      { name: 'Alfonso Ávila',      password: 'AlfonsoBH2026',    color:'#1E50C5', role:'admin', allowedPrograms:['salud'] },
  crescencio_gutierrez:{ name: 'Cresencio Gutiérrez', password: 'CresencioBH2026', color:'#F59E0B', role:'admin', allowedPrograms:['educacion'] },
  ivan_herrera:       { name: 'Iván Herrera',       password: 'IvanBH2026',       color:'#8B5CF6', role:'admin', allowedPrograms:['deporte'] }
};
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwqDq6v_wpk7V-0OQTOHJYXv7JFm1UF6EuQkuTw11gLaNvv_0DXYCXmppCWhVEz4Tgoqw/exec';

/* KMZ/KML · Espacios físicos 2026
   El archivo compartido trae un NetworkLink de Google My Maps.
   La app intentará leerlo para usar coordenadas más precisas en Salud, Educación y Deporte.
   Si Google bloquea la lectura desde GitHub Pages, se conservan las coordenadas base ya cargadas. */
const LOCAL_SPACES_KML = 'espacios-fisicos-2026.kml?v=14.0';
const SPACES_KML_URL = 'https://www.google.com/maps/d/kml?forcekml=1&mid=1e0q43k8PyBzwQr3s8WOAXIr49DLz-d0';

/* CATÁLOGO BASE · SUBDIRECCIÓN DE EDUCACIÓN
   Bibliotecas/talleres cargados como estructura inicial. Los indicadores se alimentarán cuando envíen las cifras. */
const EDUCATION_CATALOG = {
  "categories": [
    {
      "key": "acompanamiento",
      "label": "Acompañamiento académico"
    },
    {
      "key": "artisticas",
      "label": "Educación artística"
    },
    {
      "key": "bibliotecas_ludotecas",
      "label": "Ludotecas / Bibliotecas"
    },
    {
      "key": "ingles",
      "label": "Inglés"
    }
  ],
  "englishEnrollmentSept2024": {
    "hombres": 514,
    "mujeres": 752,
    "total": 1350,
    "sedes": 7
  },
  "source": "BIBLIOTECAS Y TALLERES DE LA SUBDIRECCIÓN DE EDUCACIÓN · columna A usada para sede/dirección",
  "venues": [
    {
      "sede": "Academia De Inglés",
      "address": "Calle 55 x 52 y 54 Col. Centro.",
      "zona": "Centro",
      "artisticas": "",
      "acompanamiento": "",
      "ingles": "L a V 4:00 pm a 8:00 pm · Sábado 9:00 am a 1:00 pm",
      "bibliotecas_ludotecas": "",
      "observaciones": "",
      "id": "edu_academia_de_ingles",
      "shortCode": "BT",
      "lat": 20.9705,
      "lng": -89.6218
    },
    {
      "sede": "Francisco De Montejo",
      "address": "Calle 55-B N° 182 x 42 Fracc. Francisco de Montejo.",
      "zona": "Norte",
      "artisticas": "",
      "acompanamiento": "",
      "ingles": "L y MIE 4:00 pm a 8:00 pm",
      "bibliotecas_ludotecas": "",
      "observaciones": "",
      "id": "edu_francisco_de_montejo",
      "shortCode": "BT",
      "lat": 21.045,
      "lng": -89.656
    },
    {
      "sede": "C.D.I. Sara Mena De Correa",
      "address": "Calle 57 S/N. Fracc. Fidel Velázquez",
      "zona": "Oriente",
      "artisticas": "L-MIER-V 2:00 pm a 7:00 pm IVAN ERNESTO MOO CEH",
      "acompanamiento": "L-MIER-V 2:00 pm a 9:00 pm DAYLI GORETTI AVILA CANUL",
      "ingles": "M y J 4:00 pm a 9:00 pm",
      "bibliotecas_ludotecas": "",
      "observaciones": "",
      "id": "edu_c_d_i_sara_mena_de_correa",
      "shortCode": "BT",
      "lat": 20.989,
      "lng": -89.573
    },
    {
      "sede": "Centro Cultural Casa Mata",
      "address": "Calle 63-D S/N x 12 Col. Sarmiento.",
      "zona": "Oriente",
      "artisticas": "M y J 2:00 pm a 7:00 pm IVÁN ERNESTO MOO CEH",
      "acompanamiento": "",
      "ingles": "L a V 2:00 pm a 8:00 pm",
      "bibliotecas_ludotecas": "",
      "observaciones": "",
      "id": "edu_centro_cultural_casa_mata",
      "shortCode": "BT",
      "lat": 20.9445,
      "lng": -89.6335
    },
    {
      "sede": "Biblioteca Miraflores",
      "address": "Calle 21 N°218 x 22 y 24 Col. Miraflores.",
      "zona": "Oriente",
      "artisticas": "M y J. 1:00 pm a 8:00 pm JELMY JEANNETTE CASTRO VEGA",
      "acompanamiento": "",
      "ingles": "",
      "bibliotecas_ludotecas": "L a V 10:00 am a 5:00 pm HEYDI RUIZ CARRILLO",
      "observaciones": "",
      "id": "edu_biblioteca_miraflores",
      "shortCode": "BT",
      "lat": 20.965,
      "lng": -89.5855
    },
    {
      "sede": "Ludoteca Poligono 108",
      "address": "Calle 27-B Diagonal N°322 x 26-C y 26-D Polígono 108.",
      "zona": "Oriente",
      "artisticas": "M Y J 1:00 pm a 8:00 pm ASTRID EUGENIA ESCALANTE SÁENZ",
      "acompanamiento": "",
      "ingles": "",
      "bibliotecas_ludotecas": "L a V 8:00 am 3:00 pm GEYDI VIDALIA ESTRELLA ROMERO · L a V 12:00 pm a 7:00 pm JUANITA DE LA CRUZ PEÑA LEÓN",
      "observaciones": "Cerrada. Requiere mantenimiento y adeCucaciones de pintura, impermeabilización, herrajes y plomeria. Próximamente abrirá.",
      "id": "edu_ludoteca_poligono_108",
      "shortCode": "BT",
      "lat": 20.9485,
      "lng": -89.5865
    },
    {
      "sede": "C.D.I. Fco. I. Madero",
      "address": "Calle 35 N°220 x 32 y 34 Fco. I. Madero.",
      "zona": "Poniente",
      "artisticas": "M Y J 11:00 am a 6:00 pm CÉSAR ELVER COCOM CELIS L a V 1:00 p.m A 6:00 p. m. MA. MICAELA CHAVEZ TEJEDA",
      "acompanamiento": "",
      "ingles": "L a J 3:00 pm a 7:00 pm",
      "bibliotecas_ludotecas": "",
      "observaciones": "",
      "id": "edu_c_d_i_fco_i_madero",
      "shortCode": "BT",
      "lat": 20.943,
      "lng": -89.6105
    },
    {
      "sede": "C.D.I. Juan Pablo",
      "address": "Calle 61 N°369 - A x 22 Fracc. Juan Pablo II.",
      "zona": "Poniente",
      "artisticas": "",
      "acompanamiento": "L a V 1:00 pm a 8:00 pm ROY SOSA MOLINA SOSA",
      "ingles": "",
      "bibliotecas_ludotecas": "L a V 11:00 am a 7:00 pm GRETTEL MORENO",
      "observaciones": "",
      "id": "edu_c_d_i_juan_pablo",
      "shortCode": "BT",
      "lat": 20.9844,
      "lng": -89.6886
    },
    {
      "sede": "C.D.I. Nora Quintana",
      "address": "Calle 140 S/N x 61 y 61-A Fracc. Nora Quintana.",
      "zona": "Poniente",
      "artisticas": "M y J 2:00 pm a 7:00 p.m MARIANA GEORGINA ORTIZ SAMOS L, MIER Y V 1:00 p. m a 8:00p.m. AVECITA VICTORIA SÁNCHEZ DUARTE",
      "acompanamiento": "L, MIER y V 3:00 pm a 8:00 pm FAIVEL DANIEL RAMÍREZ JURADO",
      "ingles": "L a V 4:00 pm a 8:00 pm",
      "bibliotecas_ludotecas": "L a V 8:00 am 3:00 pm WENDY BALAM · L a V 12:00 pm a 7:00 pm HEYDI LÓPEZ ALAMILLA",
      "observaciones": "",
      "id": "edu_c_d_i_nora_quintana",
      "shortCode": "BT",
      "lat": 20.939,
      "lng": -89.607
    },
    {
      "sede": "C.D.I. Susulá Xoclan",
      "address": "Calle 132 N°1136 x 71 y 71 B Col. Susulá Xoclán.",
      "zona": "Poniente",
      "artisticas": "L, MIER y V 12:00 pm a 7:00 pm CLAUDIA VERÓNICA CIMÉ KU M y J 1:00 pm a 8:00 p.m AVECITA VICTORIA SÁNCHEZ DUARTE",
      "acompanamiento": "L - MIER - V 2:00 pm a 7:00 pm ROMÁN DE JESÚS PECH ONTIVEROS",
      "ingles": "",
      "bibliotecas_ludotecas": "",
      "observaciones": "",
      "id": "edu_c_d_i_susula_xoclan",
      "shortCode": "BT",
      "lat": 20.9858,
      "lng": -89.6789
    },
    {
      "sede": "Biblioteca Tixcacal Opichen",
      "address": "Calle 34 x 79 y 81 S/N Tixcacal Opichen.",
      "zona": "Poniente",
      "artisticas": "",
      "acompanamiento": "L a V 3:00 pm a 8:00 pm KAREN ALEJANDRA CONTRERAS PERAZA.",
      "ingles": "",
      "bibliotecas_ludotecas": "L a V 12:00 pm a 7:00 pm PASTORA PISTÉ BERNABÉ",
      "observaciones": "",
      "id": "edu_biblioteca_tixcacal_opichen",
      "shortCode": "BT",
      "lat": 20.997,
      "lng": -89.715
    },
    {
      "sede": "C.D.I. Amapola",
      "address": "Calle 105 N° 541 x 64 y 66 Col. Melitón Salazar.",
      "zona": "Sur",
      "artisticas": "L - MIER -V 2:00 pm a 7:00 pm MARIANA GEORGINA ORTIZ SAMOS",
      "acompanamiento": "M y J 2:00 pm a 7:00 pm ROMÁN DE JESÚS PECH ONTIVEROS",
      "ingles": "M y V 4:00 pm a 8:00 pm",
      "bibliotecas_ludotecas": "",
      "observaciones": "",
      "id": "edu_c_d_i_amapola",
      "shortCode": "BT",
      "lat": 20.9535,
      "lng": -89.638
    },
    {
      "sede": "C.D.I. Crescencio Rejón",
      "address": "Calle 25 N° 318x 24 y 24-A Col. Crescencio Rejón.",
      "zona": "Sur",
      "artisticas": "L a V 9:00 am a 4:00 pm ANDREA GUADALUPE MEDINA CASTILLO",
      "acompanamiento": "M y J 2:00 pm a 7:00 pm LOURDES CAROLINA PÉREZ TEC",
      "ingles": "",
      "bibliotecas_ludotecas": "L a V 1:00 pm a 7:00 pm ARLY DANAÉ DOMÍNGUEZ CHABLE",
      "observaciones": "",
      "id": "edu_c_d_i_crescencio_rejon",
      "shortCode": "BT",
      "lat": 20.9667,
      "lng": -89.6233
    },
    {
      "sede": "C.D.I. San José Tecoh",
      "address": "Calle 151 S/N. x 68 y 70 Col. San José Tecoh.",
      "zona": "Sur",
      "artisticas": "",
      "acompanamiento": "L - MIER - V 3:00 pm a 8:00 pm LOURDES CAROLINA PÉREZ TEC",
      "ingles": "",
      "bibliotecas_ludotecas": "L a V 12:00 pm a 7:00 pm ROSA ISELA PACHECO ESPINOSA",
      "observaciones": "",
      "id": "edu_c_d_i_san_jose_tecoh",
      "shortCode": "BT",
      "lat": 20.929,
      "lng": -89.636
    },
    {
      "sede": "Centro Integral Del Sur",
      "address": "Calle 58 x 155 y 155-A Fracc. Brisas de San José.",
      "zona": "Sur",
      "artisticas": "",
      "acompanamiento": "L a V 8:00 am a 1:00 pm PERERA CAUICH EVELYNE MADELEINE · L a V 3:00 am a 8:00 pm URZULA MARIANA OJEDA PERAZA",
      "ingles": "M a V 4:00 pm a 8:00 pm · Sábado 9 am a 1 pm",
      "bibliotecas_ludotecas": "",
      "observaciones": "",
      "id": "edu_centro_integral_del_sur",
      "shortCode": "BT",
      "lat": 20.9367,
      "lng": -89.6242
    },
    {
      "sede": "Emiliano Zapata Sur Ludoteca",
      "address": "Calle 92 x 141 y 145 Col. Emiliano Zapata Sur.",
      "zona": "Sur",
      "artisticas": "L , MIER y V 1:00 pm a 8:00 pm CHRISTIAN PAMELA JIMÉNEZ CONRADO",
      "acompanamiento": "M y J 3:00 pm a 8:00 pm FAIVEL DANIEL RAMÍREZ JURADO",
      "ingles": "",
      "bibliotecas_ludotecas": "L a V 8:00 am a 1:00 pm GABRIELA SAAVEDRA RAMÍREZ",
      "observaciones": "",
      "id": "edu_emiliano_zapata_sur_ludoteca",
      "shortCode": "BT",
      "lat": 20.9085,
      "lng": -89.639
    },
    {
      "sede": "C.D.I. San José Tzal",
      "address": "Calle 14 S/N x 21 y 23 Comisaría San José Tzal.",
      "zona": "Sur",
      "artisticas": "L, MIÉR y V 12:00 am a 7:00 pm CÉSAR ELVER COCOM CELIS",
      "acompanamiento": "L a V 12:00 pm a 7:00 pm CARLOS BACAB PUC",
      "ingles": "",
      "bibliotecas_ludotecas": "L a V 8:00 am a 3:00 pm ALMA TENORIO BENÍTEZ",
      "observaciones": "",
      "id": "edu_c_d_i_san_jose_tzal",
      "shortCode": "BT",
      "lat": 20.8631,
      "lng": -89.6189
    },
    {
      "sede": "Molas –",
      "address": "Calle 21 N° 108 x 28 Comisaría de Molas.",
      "zona": "Sur",
      "artisticas": "M y J 12:00 pm a 7:00 pm CLAUDIA VERÓNICA CIMÉ KU",
      "acompanamiento": "",
      "ingles": "",
      "bibliotecas_ludotecas": "L a V 11:00 am a 4:00 pm LOURDES NOVELO GÓMEZ",
      "observaciones": "",
      "id": "edu_molas",
      "shortCode": "BT",
      "lat": 20.8853,
      "lng": -89.6086
    },
    {
      "sede": "Cholul",
      "address": "Calle 19-A x 20 y 20-A Plaza principal de la Comisaría de Cholul.",
      "zona": "Norte",
      "artisticas": "",
      "acompanamiento": "L a V 3:00 pm -8:00 pm HARY JOSÉ BASULTO TRIAY",
      "ingles": "",
      "bibliotecas_ludotecas": "",
      "observaciones": "",
      "id": "edu_cholul",
      "shortCode": "BT",
      "lat": 21.0331,
      "lng": -89.5853
    },
    {
      "sede": "Chichi Suárez –",
      "address": "Calle 10 esquina x 35Comisaría Chichí Suárez.",
      "zona": "Norte",
      "artisticas": "L, MIÉR, V 1:00 pm a 8:00 pm ASTRID EUGENIA ESCALANTE SÁENZ",
      "acompanamiento": "M y J 2:00 pm a 9:00 pm DAYLI GORETTI AVILA CANUL",
      "ingles": "",
      "bibliotecas_ludotecas": "L a V 1:00 pm a 7:00 pm OFELIA BÉJAR LARROCHA",
      "observaciones": "",
      "id": "edu_chichi_suarez",
      "shortCode": "BT",
      "lat": 21.0294,
      "lng": -89.5681
    },
    {
      "sede": "Dzityá",
      "address": "Calle 20 x 21 y 23 Plaza principal de la Comisaría.",
      "zona": "Norte",
      "artisticas": "",
      "acompanamiento": "L a V 2:00 pm a 7 pm JOSÉ MAURICIO GONZÁLEZ CUPUL",
      "ingles": "",
      "bibliotecas_ludotecas": "",
      "observaciones": "",
      "id": "edu_dzitya",
      "shortCode": "BT",
      "lat": 21.058,
      "lng": -89.681
    },
    {
      "sede": "C.D.I. Komchen –",
      "address": "Calle 28 S/N x 37 y 35.",
      "zona": "Norte",
      "artisticas": "",
      "acompanamiento": "",
      "ingles": "",
      "bibliotecas_ludotecas": "L a V 12:00 pm a 7:00 pm MA. DE LA LUZ SOLEDAD BAAS",
      "observaciones": "",
      "id": "edu_c_d_i_komchen",
      "shortCode": "BT",
      "lat": 21.102,
      "lng": -89.662
    },
    {
      "sede": "Sitpach",
      "address": "Calle 11 x 10 y 8 Plaza principal de la Comisaría.",
      "zona": "Norte",
      "artisticas": "",
      "acompanamiento": "",
      "ingles": "",
      "bibliotecas_ludotecas": "L a V 12:00 pm a 7:00 pm MARTHA CHAN CHAN",
      "observaciones": "",
      "id": "edu_sitpach",
      "shortCode": "BT",
      "lat": 21.0367,
      "lng": -89.5478
    },
    {
      "sede": "Xcanatún",
      "address": "Calle 19-A x 20 y 20-A Plaza principal de la Comisaría.",
      "zona": "Norte",
      "artisticas": "",
      "acompanamiento": "",
      "ingles": "",
      "bibliotecas_ludotecas": "L a V 1:00 pm a 8:00 pm ADRIANA CARDENAS CHAN",
      "observaciones": "",
      "id": "edu_xcanatun",
      "shortCode": "BT",
      "lat": 21.087,
      "lng": -89.633
    },
    {
      "sede": "Xcumpich",
      "address": "Calle 24 S/N x 5-B Comisaría.",
      "zona": "Norte",
      "artisticas": "",
      "acompanamiento": "",
      "ingles": "",
      "bibliotecas_ludotecas": "L a V 1:00 pm a 6:00 pm SUGEYDI BERENICE DIAZ ESPADAS",
      "observaciones": "",
      "id": "edu_xcumpich",
      "shortCode": "BT",
      "lat": 21.024,
      "lng": -89.633
    }
  ]
};

/* CATÁLOGO BASE · SUBDIRECCIÓN DE DEPORTES */
const SPORTS_CATALOG = {
  "updatedFrom": "final HORARIO UNIDADES DEPORTIVAS. V2.xlsx y Listado de comités Deportivos.xlsx",
  "categories": [
    {
      "key": "unidades",
      "label": "Unidades deportivas"
    },
    {
      "key": "comites",
      "label": "Comités deportivos"
    },
    {
      "key": "administradores",
      "label": "Administradores"
    },
    {
      "key": "actividades",
      "label": "Disciplinas / actividades"
    }
  ],
  "units": [
    {
      "id": "fut_7_americas",
      "name": "FUT 7 LAS AMÉRICAS",
      "sheet": "FUT 7 AMERICAS",
      "type": "Unidad deportiva",
      "shortCode": "UD",
      "lat": 21.0515,
      "lng": -89.6405,
      "admin": "MARCO ANTONIO SOSA",
      "note": "INSCRIPCIONES ABIERTAS TODO EL AÑO",
      "activities": [
        {
          "disciplina": "FÚTBOL",
          "responsable": "*ROBIN JESUS RIVADENEYRA GONZÁLEZ        *LUIS ALBERTO CHAN ONTIVEROS",
          "horario": "Lunes: 4:00 PM A 8:00 PM · Miércoles: 4:00 PM A 8:00 PM",
          "edades": "4  A 5 AÑOS         (AÑO DE NACIMIENTO 2020-2021)",
          "cupo": "100 NIÑOS",
          "categoria": "MICROBIO                   (4PM A 5PM)"
        },
        {
          "disciplina": "MÉRIDA EN ACCIÓN",
          "responsable": "SUSANA VALENTINA CATZIM GOMEZ",
          "horario": "Lunes: 6:00 PM A 7:00 PM · Miércoles: 6:00 PM A 7:00 PM",
          "edades": "TODAS LAS EDADES",
          "cupo": "ILIMITADO"
        }
      ]
    },
    {
      "id": "valenzuela",
      "name": "FERNANDO VALENZUELA  (CAMPOS DE BEISBOL)",
      "sheet": "VALENZUELA",
      "type": "Unidad deportiva",
      "shortCode": "UD",
      "lat": 20.9649,
      "lng": -89.616,
      "admin": "MARIO MANRIQUE",
      "note": "NO HAY ESCUELAS MUNICIPALES.",
      "activities": [
        {
          "disciplina": "Beisbol",
          "responsable": "MARIO MANRIQUE",
          "horario": "Lunes: 8:00AM A 11:00 PM · Martes: 8:00AM A 11:00 PM · Miércoles: 8:00AM A 11:00 PM · Jueves: 8:00AM A 11:00 PM · Viernes: 8:00 AM A 12:00 PM · Sábado: 7:00 AM A 9:00 PM · Domingo: 8:00 AM A 2:00PM"
        }
      ]
    },
    {
      "id": "acuatico",
      "name": "ACUÁTICO CAUCEL",
      "sheet": "ACUATICO",
      "type": "Unidad deportiva",
      "shortCode": "UD",
      "lat": 21.0065,
      "lng": -89.7035,
      "admin": "CLAUDIA CELIS",
      "note": "INSCRIPCIONES ABIERTAS TODO EL AÑO",
      "activities": [
        {
          "disciplina": "CLASES DE NATACIÓN",
          "responsable": "NIÑOS",
          "horario": "Lunes: 2:00 PM A  5:00 PM · Martes: 2:00 PM A  5:00PM · Miércoles: 2:00 PM A  5:00 PM · Jueves: 2:00 PM A  5:00 PM · Viernes: 2:00 PM A  5:00PM",
          "edades": "6 A 14 AÑOS",
          "cupo": "120 NIÑOS",
          "categoria": "NIÑOS"
        },
        {
          "disciplina": "CLASES DE NATACIÓN",
          "responsable": "ADULTOS",
          "horario": "Lunes: 6:00 PM A 9:00PM · Martes: 6:00 PM A 9:00PM · Miércoles: 6:00 PM A 9:00PM · Jueves: 6:00 PM A 9:00PM · Viernes: 6:00 PM A 9:00PM",
          "edades": "15 AÑOS EN ADELANTE",
          "cupo": "90 ADULTOS",
          "categoria": "ADULTOS"
        }
      ]
    },
    {
      "id": "jpbox",
      "name": "JUAN PABLO BOX",
      "sheet": "JPBOX",
      "type": "Unidad deportiva",
      "shortCode": "UD",
      "lat": 20.9844,
      "lng": -89.6886,
      "admin": "RAMÓN GARCÍA",
      "note": "INSCRIPCIONES ABIERTAS TODO EL AÑO",
      "activities": [
        {
          "disciplina": "BOXEO",
          "responsable": "JAVIER ABRAHAM RODRIGUEZ CABALLERO",
          "horario": "Lunes: 5:00 PM A 8:00 PM · Martes: 5:00 PM A 8:00 PM · Miércoles: 5:00 PM A 8:00 PM · Jueves: 5:00 PM A 8:00 PM · Viernes: 5:00 PM A 8:00 PM",
          "edades": "5 AÑOS EN ADELANTE",
          "cupo": "100 NIÑOS Y 50 ADULTOS",
          "categoria": "INFANTIL            ( 5PM A 6PM)"
        },
        {
          "disciplina": "MÉRIDA EN ACCIÓN",
          "responsable": "MARIANA CICERO",
          "horario": "Lunes: 8:15 AM A 9:15 AM · Miércoles: 8:15 AM A 9:15 AM · Jueves: 8:15 AM A 9:15 AM · Viernes: 7:15 AM A 8:15 AM",
          "cupo": "ILIMITADO",
          "categoria": "CUALQUIER EDAD"
        }
      ]
    },
    {
      "id": "heroes",
      "name": "HÉROES",
      "sheet": "HEROES",
      "type": "Unidad deportiva",
      "shortCode": "UD",
      "lat": 20.9442,
      "lng": -89.6165,
      "admin": "SOCRATES ROSADO",
      "note": "INSCRIPCIONES ABIERTAS TODO EL AÑO",
      "activities": [
        {
          "disciplina": "TENIS",
          "responsable": "SOCORRO ESCAMILLA",
          "horario": "Lunes: 5:00 PM A 8:00 PM · Miércoles: 5:00 PM A 8:00 PM · Viernes: 5:00 PM A 8:00 PM",
          "edades": "7 EN ADELANTE",
          "cupo": "45 ALUMNOS",
          "categoria": "INFANTIL               (5PM A 6PM)"
        },
        {
          "disciplina": "LIMALAMA",
          "responsable": "JOSÉ TRINIDAD CASTILLO",
          "horario": "Lunes: 5:00 PM A 7:00 PM · Miércoles: 5:00 PM A 7:00 PM · Viernes: 5:00 PM A 7:00 PM",
          "edades": "7 A 20 AÑOS",
          "cupo": "60 ALUMNOS",
          "categoria": "INFANTIL               (5PM A 6PM)"
        }
      ]
    },
    {
      "id": "cis",
      "name": "CIS",
      "sheet": "CIS",
      "type": "Unidad deportiva",
      "shortCode": "UD",
      "lat": 20.929,
      "lng": -89.6175,
      "admin": "MIGUEL MADERA",
      "note": "INSCRIPCIONES ABIERTAS TODO EL AÑO CON CUPO LIMITADO",
      "activities": [
        {
          "disciplina": "GIMNASIO",
          "responsable": "MIGUEL MADERA",
          "horario": "Lunes: 7:00 AM A  8:00 PM · Martes: 7:00 AM A  8:00 PM · Miércoles: 7:00 AM A  8:00 PM · Jueves: 7:00 AM A  8:00 PM · Viernes: 7:00 AM A  8:00 PM",
          "edades": "18 EN ADELANTE",
          "cupo": "50 PERSONAS POR HORA"
        }
      ]
    },
    {
      "id": "sjt",
      "name": "SAN JOSÉ TECOH",
      "sheet": "SJT",
      "type": "Unidad deportiva",
      "shortCode": "UD",
      "lat": 20.8631,
      "lng": -89.6189,
      "admin": "BELIZARIO CHALE TRUJEQUE",
      "note": "INSCRIPCIONES ABIERTAS TODO EL AÑO CON CUPO LIMITADO",
      "activities": [
        {
          "disciplina": "BOX",
          "responsable": "ABRAHAM RAFAEL FALCÓN CANCHE",
          "horario": "Lunes: 5:00 PM A 8:00 PM · Martes: 5:00 PM A 8:00 PM · Miércoles: 5:00 PM A 8:00 PM · Jueves: 5:00 PM A 8:00 PM · Viernes: 5:00 PM A 8:00 PM",
          "edades": "8 A 12 AÑOS",
          "cupo": "60 PERSONAS",
          "categoria": "INFANTIL                  (5PM A 6PM)"
        },
        {
          "disciplina": "TAEKWONDO",
          "responsable": "ARMANDO CANCHE",
          "horario": "Lunes: 4:00 PM A 8:00 PM · Miércoles: 4:00 PM A 8:00 PM · Viernes: 4:00 PM A 8:00 PM",
          "edades": "6 A 11 AÑOS",
          "categoria": "INFANTIL                  (4PM A 5PM)"
        }
      ]
    },
    {
      "id": "fco_montejo",
      "name": "FRANCISCO DE MONTEJO",
      "sheet": "FCO MONTEJO",
      "type": "Unidad deportiva",
      "shortCode": "UD",
      "lat": 21.036,
      "lng": -89.6515,
      "admin": "ARMANDO DORANTES",
      "note": "INSCRIPCIONES PARA BASQUETBOL(MTRA. ADDY PECH)PRINCIPIOS DEL MES DE AGOSTO PARA EMPEZAR CLASES EN EL MES DE SEPTIEMBRE NOTA2:  INSCRIPCIONES ABIERTAS TODO EL AÑO PARA LAS DEMAS ACTIVIDADES",
      "activities": [
        {
          "disciplina": "TENIS DE MESA",
          "responsable": "OMAR F. MEDINA AMBROSIO",
          "horario": "Lunes: 4:00 PM A 7:00 PM · Martes: 4:00 PM A 7:00 PM · Miércoles: 4:00 PM A 7:00 PM · Jueves: 4:00 PM A 7:00 PM · Viernes: 4:00 PM A 7:00 PM",
          "edades": "6 A 8 AÑOS",
          "cupo": "26 NIÑOS",
          "categoria": "INICIACIÓN                                       (4PM A 5 PM)"
        },
        {
          "disciplina": "BASQUETBOL",
          "responsable": "ADDY ALEJANDRINA PECH",
          "horario": "Martes: 4:00 PM A 8:00 PM · Jueves: 4:00 PM A 8:00 PM",
          "edades": "6 a 7 años(AÑO DE NACIMIENTO 2018-2019)",
          "cupo": "70-80 ALUMNOS",
          "categoria": "ESCUELTA                (4PM A 5PM)"
        },
        {
          "disciplina": "CROSSFIT",
          "responsable": "BRAULIO CERVANTES",
          "horario": "Lunes: 4:30 PM A 7:30 PM · Martes: 4:30 PM A 7:30 PM · Miércoles: 4:30 PM A 7:30 PM · Jueves: 4:30 PM A 7:30 PM · Viernes: 4:30 PM A 7:30 PM"
        },
        {
          "disciplina": "MÉRIDA EN ACCIÓN (ZUMBA)",
          "responsable": "MARIANA CICERO",
          "horario": "Lunes: 5:30 PM A 6:30 PM · Miércoles: 5:30 PM A 6:30 PM · Viernes: 5:30 PM A 6:30 PM",
          "edades": "CUALQUIER EDAD",
          "cupo": "ILIMITADO"
        },
        {
          "disciplina": "YOGA",
          "responsable": "CECILIA ROJAS CASERES",
          "horario": "Lunes: 7:30 PM A 8:30 PM · Martes: 7:30 PM A 8:30 PM · Miércoles: 7:30 PM A 8:30 PM · Jueves: 7:30 PM A 8:30 PM",
          "edades": "CUALQUIER EDAD",
          "cupo": "ILIMITADO"
        }
      ]
    },
    {
      "id": "caucel",
      "name": "CAUCEL",
      "sheet": "CAUCEL",
      "type": "Unidad deportiva",
      "shortCode": "UD",
      "lat": 21.008,
      "lng": -89.7019,
      "admin": "EDER MANUEL VILLANUEVA PINTO",
      "note": "INSCRIPCIONES DE AGOSTO A SEPTIEMBRE",
      "activities": [
        {
          "disciplina": "ATLETISMO  RUTA(LIBRE)",
          "responsable": "RITA BACAB LÓPEZ",
          "horario": "Lunes: 6:00 AM A 8:00 AM · Martes: 6:00 AM A 8:00 AM · Miércoles: 6:00 AM A 8:00 AM · Jueves: 6:00 AM A 8:00 AM · Viernes: 6:00 AM A 8:00 AM",
          "edades": "20 AÑOS EN ADELANTE",
          "cupo": "30 ALUMNOS",
          "categoria": "30.0"
        },
        {
          "disciplina": "MÉRIDA EN ACCIÓN (MATUTINO)",
          "responsable": "MARISOL LOERA ACEVEDO",
          "horario": "Lunes: 7:00 AM  a 8:00 AM · Martes: 7:00 AM  a 8:00 AM · Miércoles: 7:00 AM  a 8:00 AM · Jueves: 7:00 AM  a 8:00 AM · Viernes: 7:00 AM  a 8:00 AM",
          "edades": "TODAS LAS EDADES",
          "categoria": "CUPO ILIMITADO"
        },
        {
          "disciplina": "MÉRIDA EN ACCIÓN (VESPERTINO)",
          "responsable": "MARISOL LOERA ACEVEDO",
          "horario": "Lunes: 5:30 PM A 6:30 PM · Miércoles: 5:30 PM A 6:30 PM · Viernes: 5:30 PM A 6:30 PM",
          "edades": "TODAS LAS EDADES",
          "categoria": "CUPO ILIMITADO"
        },
        {
          "disciplina": "ATLETISMO (INFANTIL)",
          "responsable": "ROXANA PARDENILLA OJEDA",
          "horario": "Lunes: 4:30 PM A 6:30 PM · Martes: 4:30 PM A 6:30 PM · Miércoles: 4:30 PM A 6:30 PM · Jueves: 4:30 PM A 6:30 PM · Viernes: 4:30 PM A 6:30 PM",
          "edades": "6 A 10 AÑOS",
          "cupo": "60 ALUMNOS",
          "categoria": "20 NIÑOS"
        },
        {
          "disciplina": "ATLETISMO (JUVENIL)",
          "edades": "12 A 18 AÑOS",
          "categoria": "40 JOVENES"
        },
        {
          "disciplina": "FÚTBOL (MICROBIO)",
          "responsable": "ALEXIS CABRERA BRAVATA \nEDUARDO PALACIOS JUÁREZ",
          "horario": "Lunes: 5:00 PM A 6:00 PM · Miércoles: 5:00 PM A 6:00 PM",
          "edades": "4 A 5  AÑOS",
          "cupo": "100 ALUMNOS",
          "categoria": "20 NIÑOS"
        },
        {
          "disciplina": "FÚTBOL (INFANTIL MENOR)",
          "responsable": "ALEXIS CABRERA BRAVATA \nEDUARDO PALACIOS JUÁREZ",
          "horario": "Lunes: 6:00 PM A 7:00 PM · Miércoles: 6:00 PM A 7:00 PM · Viernes: 5:00 PM A 6:30 PM",
          "edades": "6 A 7 AÑOS",
          "categoria": "20 NIÑOS"
        },
        {
          "disciplina": "FÚTBOL (NIÑOS HEROES)",
          "responsable": "ALEXIS CABRERA BRAVATA EDUARDO PALACIOS JUÁREZ",
          "horario": "Lunes: 6:00 PM A 7:00 PM · Miércoles: 6:00 PM A 7:00 PM · Viernes: 5:00 PM A 6:30 PM",
          "edades": "8 A 9 AÑOS",
          "categoria": "20 NIÑOS"
        },
        {
          "disciplina": "FÚTBOL (INFANTIL MAYOR)",
          "responsable": "ALEXIS CABRERA BRAVATA EDUARDO PALACIOS JUÁREZ",
          "horario": "Lunes: 7:00 PM A 8:00 PM · Miércoles: 7:00 PM A 8:00 PM · Viernes: 6:30 PM A 8:00PM",
          "edades": "10 A 11 AÑOS",
          "categoria": "20 NIÑOS"
        },
        {
          "disciplina": "FÚTBOL (JUVENIL MENOR)",
          "responsable": "ALEXIS CABRERA BRAVATA EDUARDO PALACIOS JUÁREZ",
          "horario": "Lunes: 7:00 PM A 8:00 PM · Miércoles: 7:00 PM A 8:00 PM · Viernes: 6:30 PM A 8:00 PM",
          "edades": "11 A 12 AÑOS",
          "categoria": "20 NIÑOS"
        }
      ]
    },
    {
      "id": "biciruta",
      "name": "BICIRUTA",
      "sheet": "BICIRUTA",
      "type": "Unidad deportiva",
      "shortCode": "UD",
      "lat": 20.9673,
      "lng": -89.6237,
      "admin": "EDWIN GONZÁLEZ",
      "note": "",
      "activities": [
        {
          "disciplina": "NOCTURNA",
          "horario": "EL PRIMER SÁBADO DE CADA MES · DE 6:00 PM A 10:00 PM"
        },
        {
          "disciplina": "DOMINICAL",
          "horario": "TODOS LOS DOMINGOS · DE 8:00 AM A 12:00 PM"
        }
      ]
    }
  ],
  "committees": [
    {
      "id": "comite_001",
      "name": "ADOLFO LOPEZ MATEOS",
      "tipo": "CANCHA DE USOS MULTIPLES Y CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTA: JAZMIN PATRICIA SEGOVIA RICALDE SECRETARIO: ABELARDO ROSADO DZUL TESORERO: JESUS ADRIAN DURAN HUCHIM",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.975738,
      "lng": -89.634381
    },
    {
      "id": "comite_002",
      "name": "ALAMOS DEL SUR",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: CRISTOPHER JOSE RAMIREZ CHAN SECRETARIO: JESSICA BEATRIZ CABALLERO PECH TESORERO: IVAN DE JESUS CANCHE ROCA VOCAL: MARIA DE LOS ANGELES LANDA CAMACH",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.951747,
      "lng": -89.621403
    },
    {
      "id": "comite_003",
      "name": "AMAPOLITA",
      "tipo": "CAMPO DE FÚTBOL Y  CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTA: REYNA MARIA MEX TRUJILLO SECRETARIO: JOSE LAZARO LLANES CAUICH  TESORERA: NELLY MARIBEL CANTO ZAVALA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.981037,
      "lng": -89.610159
    },
    {
      "id": "comite_004",
      "name": "AVILA CAMACHO",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "JORGE VAZQUEZ",
      "categoria": "ADMINISTRADOR",
      "lat": 20.963505,
      "lng": -89.646574
    },
    {
      "id": "comite_005",
      "name": "AZCORRA",
      "tipo": "CANCHA DE FÚTBOL",
      "responsable": "PRESIDENTE: JOSE DANIEL GOME PEREZ SECRETARIO: ANGEL PECH KU TESORERO: DIDIER SOSA BORGES",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.954956,
      "lng": -89.600408
    },
    {
      "id": "comite_006",
      "name": "BELLAVISTA",
      "tipo": "CAMPO DE FUTBOL 7",
      "responsable": "FERNANDO JOEL LOPEZ TORRES",
      "categoria": "ADMINISTRADOR",
      "lat": 20.990965,
      "lng": -89.630688
    },
    {
      "id": "comite_007",
      "name": "BENITO JUAREZ ORIENTE",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: DAVID ISRAEL TUTZIN GONZALEZ SECRETARIO: ANGEL ANTONIO POOT YAH TESORERA: NAYELI TERESA GONZALEZ ORTEGA VOCAL 2: SAHARA ESTHER PECH RODRIGUEZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.942868,
      "lng": -89.637953
    },
    {
      "id": "comite_008",
      "name": "BOJORQUEZ",
      "tipo": "CAMPO DE BEISBOL, CAMPO DE FÚTBOL, CANCHA DE USOS",
      "responsable": "PRESIDENTE: ALBA MINERVA CASTILLO UVALLE SECRETARIA: MERCEDES SEVILLA SOBERANIS TESORERA: SONIA GUADALUPE CEN HERRERA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.977144,
      "lng": -89.589861
    },
    {
      "id": "comite_009",
      "name": "BRISAS",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "FELIPE DE LA CRUZ",
      "categoria": "ADMINISTRADOR",
      "lat": 20.979187,
      "lng": -89.658232
    },
    {
      "id": "comite_010",
      "name": "BUGAMBILIAS DE CHUBURNÁ",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: SILVIA ENGRACIA CHAN NIEVES SECRETARIO:  CARLOS MARTIN SOBRINO GOMEZ TESORERO: ERNESTO SOLIS ORDOÑEZ VOCAL 1: BRENDA ZURYSADAI VEGARA SOSA VOCAL 2: ",
      "categoria": "ADMINISTRADOR",
      "lat": 20.935916,
      "lng": -89.605642
    },
    {
      "id": "comite_011",
      "name": "CÁMARA DE LA CONSTRUCCIÓN",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: MARCOS ALBERTO BUENFIL MARTIN SECRETARIO: JULIO CESAR CIAU CANUL TESORERO: JULIAN CONCEPCION PUC POOL",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 21.002015,
      "lng": -89.609898
    },
    {
      "id": "comite_012",
      "name": "CANCHAS DE TENIS DE LA ALEMAN",
      "tipo": "CANCHA DE TENIS",
      "responsable": "ALEX ROSADO",
      "categoria": "ADMINISTRADOR",
      "lat": 20.947407,
      "lng": -89.663335
    },
    {
      "id": "comite_013",
      "name": "CASTILLA CAMARA",
      "tipo": "CANCHA DE USOS MULTIPLES TECHADA Y CANCHA NO TECHADA",
      "responsable": "PRESIDENTE: MANUEL DE ATOCHA MOO Y VIANA SECRETRAIO: LUIS ENRIQUE AZCORRA AVILA TESORERO: RAUL A SIERRA CASTILLO VOCAL: CARLOS VALDEZ MAY",
      "categoria": "ADMINISTRADOR",
      "lat": 20.958102,
      "lng": -89.574698
    },
    {
      "id": "comite_014",
      "name": "CD CAUCEL ALMENDROS 1",
      "tipo": "CANCHA DE USOS, CANCHA SINTETICA, CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: BRYAN ARMANDO POOL CAHUM  TESORERA: VIRGINIA GUADALUPE GARMA FUNES SECRETARIO: JULIAN HUMBERTO QUINTERO MAY",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 21.002849,
      "lng": -89.653076
    },
    {
      "id": "comite_015",
      "name": "CD CAUCEL BALCONES",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "JUAN LUIS MEDINA UICAB",
      "categoria": "ADMINISTRADOR",
      "lat": 20.921183,
      "lng": -89.630081
    },
    {
      "id": "comite_016",
      "name": "CD CAUCEL GRAN SANTA FE",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: JOSUE ANDRES CHAVEZ MONTALVO SECRETARIO: ROGER ELIAS TRACONIS MEZA TESORERO: EFRAIN CERVANTES CAMARA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.998307,
      "lng": -89.578683
    },
    {
      "id": "comite_017",
      "name": "CD CAUCEL TERESA DE CALCUTA",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: WILLIAMS JAVIER CARRILLO MENDOZA SECRETARIO: LEONEL ARTURO RODRIGUEZ SALAS TESORERO: XOCHILT MAYETZINN CHI TREJO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.969102,
      "lng": -89.683743
    },
    {
      "id": "comite_018",
      "name": "CDI NORA",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "WILLIAMS CARRILLO",
      "categoria": "ADMINISTRADOR",
      "lat": 20.959552,
      "lng": -89.614068
    },
    {
      "id": "comite_019",
      "name": "CHIVIRICO",
      "tipo": "CAMPO DE SOFTBOL",
      "responsable": "PRESIDENTE: ALEJO PALOMO GARMA SECRETARIO: JOSE MAXIMILIANO CHAN CHAN TESORERO: IRVING JESUS SIERRA ZAPATA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.979922,
      "lng": -89.623714
    },
    {
      "id": "comite_020",
      "name": "CHUBURNÁ DE HIDALGO EMILIO DE LA CRUZ",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "MIGUEL ANGEL CARRILLO YAM",
      "categoria": "ADMINISTRADOR",
      "lat": 20.955243,
      "lng": -89.634705
    },
    {
      "id": "comite_021",
      "name": "CHUBURNA DE HIDALGO INSURGENTES",
      "tipo": "CAMPO DE FÚTBOL, CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTA: STEPHANIA SUAREZ BOLIO SECRETARIO: ABRAHAM PALACIO URROTIA TESORERO: ERICK CASTILLO GONGORA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.96936,
      "lng": -89.602084
    },
    {
      "id": "comite_022",
      "name": "CHUBURNA ICHES BURGOS",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: CARLOS CHAN CANUL SECRETARIO: JORGE DE LA CRUZ CANUL TESORERO: JOSE MANUEL RUELAS PECH VOCAL: GONZALO CECILIO KU CHAN VOCAL: SONIA GUADALUPE CANCHE ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.978458,
      "lng": -89.642653
    },
    {
      "id": "comite_023",
      "name": "CINCO COLONIAS",
      "tipo": "CAMPO DE BEISBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: FRANCISCO SALINAS LOPEZ SECRETARIO: JESUS ARMIN DORANTES BARRERA TESORERO: MARIANO PEREZ ANDRADE",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.945108,
      "lng": -89.617121
    },
    {
      "id": "comite_024",
      "name": "COLONIA 15 MAYO",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTA: REBECA GONZALEZ RODRIGUEZ SECRETARIA: CLAUDIA VERONICA RODRIGUEZ LOPEZ  TESORERA: LETICIA ROMERO HERNÁNDEZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.988533,
      "lng": -89.608281
    },
    {
      "id": "comite_025",
      "name": "COLONIA ESPERANZA",
      "tipo": "CAMPO  DE SOFTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: EDUARDO PASTOR PUGA BERZUNZA SECRETARIO: FRANK SOSA MORALES TESORERO: JUAN GABRIEL DIAZ SUAREZ VOCAL: JAIME USCANGA BALLADO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.958733,
      "lng": -89.653909
    },
    {
      "id": "comite_026",
      "name": "COLONIA LIBERTAD",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "ISRAEL JIMENEZ",
      "categoria": "ADMINISTRADOR",
      "lat": 20.954601,
      "lng": -89.590972
    },
    {
      "id": "comite_027",
      "name": "COLONIA MAYA CAMPO DE FÚTBOL",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: CLARITO FRANCISCO SANCHEZ CIME SECRETARIO: ROGER VARGAS EUAN TESORERO: MELVY ISABEL SANGUINO CARDOS",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.996466,
      "lng": -89.637719
    },
    {
      "id": "comite_028",
      "name": "COLONIA MAYA CANCHA DE USOS MÚLTIPLES",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: JAVIER ENRIQUE JIMENEZ PECH SECRETARIO: ERNESTO ANTONIO LUGO TEC TESORERO: JAVIER ANTONIO JIMENEZ OJEDA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.934704,
      "lng": -89.636855
    },
    {
      "id": "comite_029",
      "name": "COLONIA ROMA",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE BASQUETBOL",
      "responsable": "PRESIDENTE: DANIEL JESUS COOL UICAB SECRETARIA: IVETTE E VAZQUEZ OCAMPO TESORERO: ALAN LOPEZ VAZQUEZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.984076,
      "lng": -89.584244
    },
    {
      "id": "comite_030",
      "name": "COLONIA SALVADOR ALVARADO ORIENTE",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: ADRIÁN ENRIQUE AGUILAR  LARASECRETARIO: CRISTOFHER MOISES ARGUETA ALAVARADO TESORERO: HENRY MARTIN EK SOSA. VOCAL: JESÚS GILBERTO RODRIGUEZ KANTÚN",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.976954,
      "lng": -89.668082
    },
    {
      "id": "comite_031",
      "name": "COLONIA YUCATÁN",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTA: LUZ MARIA COLLI PINTO SECRETARIO: SARA ESPERANZA ACEVEDO TESORERO: FERNANDO ANTONIO TORRES CAB",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.93214,
      "lng": -89.596248
    },
    {
      "id": "comite_032",
      "name": "COMISARIA DE CAUCEL PUEBLO BEISBOL",
      "tipo": "CAMPO DE BEISBOL",
      "responsable": "PRESIDENTE: SERGIO MIGUEL NOH GONZALEZ SECRETARIO: RAMIRO JESUS COUOH COUOH TESORERO: MARIO RAFAEL AVILA EUAN",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 21.010192,
      "lng": -89.61415
    },
    {
      "id": "comite_033",
      "name": "COMISARIA DE CAUCEL PUEBLO FÚTBOL",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: JOSE RAMIRO LOPEZ EUAN  SECRETARIO: ANGEL DE JESUS CHABLE CANCHE TESORERO: LUIS ALBERTO NOH COYOC VOCAL: URIEL ANTONIO VARGAS COLLI",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.938707,
      "lng": -89.666579
    },
    {
      "id": "comite_034",
      "name": "COMISARIA DE CAUCEL PUEBLO SÍNTETICO Y USOS MÚLTIPLES",
      "tipo": "CANCHA SÍNTETICA",
      "responsable": "PRESIDENTE: RAMIRO DE JESUS LOPEZ EUAN  SECRETARIO: JOSE HECTOR CANUL CANCHE TESORERO: MIGUEL EDUARDO CANUL EUAN",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.962996,
      "lng": -89.565237
    },
    {
      "id": "comite_035",
      "name": "COMISARIA DE CHABLEKAL",
      "tipo": "CAMPO DE FÚTBOL, CAMPO DE BEISBOL, SINTETICO, CANCHA DE BASQUET, CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: ANTONIO CHALE EUAN SECRETARIO: WILIAN ULISES POOL DZUL TESORERO: ROGELIO CANUL CHIM VOCAL: GREGORIA HERRERA DELGADO VOCAL 2: GINA MARIA CHIM TUT",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 21.004397,
      "lng": -89.664291
    },
    {
      "id": "comite_036",
      "name": "COMISARIA DE CHABLEKAL SINTETICO",
      "tipo": "SINTETICO",
      "responsable": "MARCO ANTONIO CHALE CHAN",
      "categoria": "ADMINISTRADOR",
      "lat": 20.95644,
      "lng": -89.622937
    },
    {
      "id": "comite_037",
      "name": "COMISARIA DE CHALMUCH",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: ENRIQUE ALEJANDRO MEX YAM SECRETARIO: TOMAS FLORENCIO MORENO CANCHE TESORERO: JORGE MARTIN HU MORENO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.976582,
      "lng": -89.612631
    },
    {
      "id": "comite_038",
      "name": "COMISARIA DE CHICHI SUAREZ  FÚTBOL",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE:  JUAN BAUTISTA PEREZ CHAN SECRETARIO: JORGE CHAN TZAB TESORERO: AGUSTIN PAT CHI",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.965585,
      "lng": -89.641192
    },
    {
      "id": "comite_039",
      "name": "COMISARIA DE CHICHI SUAREZ BEISBOL",
      "tipo": "CAMPO DE BEISBOL",
      "responsable": "PRESIDENTE: CARLOS RAMIREZ CHI SECRETARIO: GILBERTO CABALLERO PACHECO TESORERO: CARLOS ECHANOVE GONGORA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.956309,
      "lng": -89.606187
    },
    {
      "id": "comite_040",
      "name": "COMISARIA DE CHICHI SUAREZ CANCHA DE USOS",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: ROGER ALBERTON CHAN POOL SECRETARIO: JOSE EDUARDO MAAS MARTINEZ TESORERO: LUIS ALBERTO TZAB CEN",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.986739,
      "lng": -89.627289
    },
    {
      "id": "comite_041",
      "name": "COMISARIA DE CHOLUL",
      "tipo": "CANCHA DE USOS MULTIPLES, CANCHA SINTETICA",
      "responsable": "PRESIDENTE: DIDIER DE JESUS PUC CASTRO SECRETARIO: JESUS SALVADOR UCHIN SULU TESORERA: CLAUDIA BERENICE ORTIZ NOGUERA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.948006,
      "lng": -89.637257
    },
    {
      "id": "comite_042",
      "name": "COMISARIA DE CHOLUL FÚTBOL",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: JOSE IGNACIO PUC ALONZO SECRETARIO: ENRIQUE DAVID PECH IX TESORERO: CARLOS ALEJANDRO CHAN DZIB",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.973563,
      "lng": -89.594444
    },
    {
      "id": "comite_043",
      "name": "COMISARIA DE CHOLUL SOFTBOL",
      "tipo": "CAMPO DE SOFTBOL",
      "responsable": "PRESIDENTA: MARIA ANGELINA PECH POOT SECRETARIO: EDGARDO GUSTAVO GUAN MARTIN TESORERO: JONATHAN GABRIEL AGUILAR MARTIN",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.979411,
      "lng": -89.651868
    },
    {
      "id": "comite_044",
      "name": "COMISARIA DE COSGAYA",
      "tipo": "CAMPO DE FÚTBOL, CAMPO DE SOFTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: MARIA JULIA EK BORGES  SECRETARIO: JOSEPH ADBRIEL AKE BAAS TESORERA: YANET BERENICE TZEC CAMPOS",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.939278,
      "lng": -89.61073
    },
    {
      "id": "comite_045",
      "name": "COMISARÍA DE DZIDZILCHÉ",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: EDUARDO MARTIN CAB \nSECRETARIO: MARTIN ALONSO CIERRA FIGUEROA \nTESORERO: JOSÉ EFRAIN CEBALLOS CUMI",
      "categoria": "ADMINISTRADOR",
      "lat": 20.996589,
      "lng": -89.608636
    },
    {
      "id": "comite_046",
      "name": "COMISARIA DE DZITYA",
      "tipo": "CAMPO DE FÚTBOL, CAMPO DE BEISBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: SANTIAGO CASTAÑEDA CHI SECRETARIO: XAVIER ELEAZAR CHI PISTE TESORERO: KEVIN CHI CATZIN",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.952296,
      "lng": -89.660001
    },
    {
      "id": "comite_047",
      "name": "COMISARIA DE DZOYAXCHE",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTA: SANDRA MARIBEL TZAB CHAN SECRETARIA: ISABEL TZAB PECH TESORERO: RODRIGO DANIEL TZAB TZAB",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.956195,
      "lng": -89.581156
    },
    {
      "id": "comite_048",
      "name": "COMISARIA DE KIKTEIL",
      "tipo": "CAMPO DE FÚTBOL, CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: CRISTHIAN SINAÍ DIAZ EK SECRETARIO: MARIANO PEREZ GIL TESORERO:JULIO CAMARA BAAS",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 21.000706,
      "lng": -89.64658
    },
    {
      "id": "comite_049",
      "name": "COMISARIA DE KOMCHEN",
      "tipo": "CANCHA DE USOS MULTIPLES, CANCHA SINTETICA",
      "responsable": "PRESIDENTE: AXEL FERNANDO KU PEÑA SECRETARIO:  YOICE DEL ANGEL KU KOYOC  TESORERO: LUIS REYLI KU PEÑA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.926474,
      "lng": -89.633373
    },
    {
      "id": "comite_050",
      "name": "COMISARIA DE MOLAS",
      "tipo": "CAMPO DE FÚTBOL, CAMPO DE BEISBOL, CANCHA DE USOS MULTIPLES, SINTETICO",
      "responsable": "PRESIDENTE: MELCHOR HUMBERTO ZOZAYA CRUZ SECRETARIO: JOSE FERMIN IUIT JIMENEZ TESORERO: FREDY ALONSO BACAB KU VOCAL: MIGUEL DOMINGO MENDEZ ALVAREZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.992386,
      "lng": -89.580377
    },
    {
      "id": "comite_051",
      "name": "COMISARIA DE NOC AC",
      "tipo": "CANCHA DE USOS MULTIPLES Y CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: RANDY JOEL DZIB JARA SECRETARIO: JOSE FRANCISCO HUCHIM POOL TESORERA: MARIA VICTORIA GUADALUPE SULUB SALAZAR VOCAL: JOSE GILBERTO JARA HUCHIM",
      "categoria": "ADMINISTRADOR",
      "lat": 20.972704,
      "lng": -89.677703
    },
    {
      "id": "comite_052",
      "name": "COMISARIA DE ONCAN",
      "tipo": "CANCHA DE USOS MULTIPLES Y CAMPO DE FÚTBOL",
      "responsable": "EDWIN FIDEL CAUICH DZUL",
      "categoria": "ADMINISTRADOR",
      "lat": 20.930016,
      "lng": -89.585423
    },
    {
      "id": "comite_053",
      "name": "COMISARÍA DE PETAC",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESEIDENTE: EDWIN RICARDO EK CANCHE SECRETARIO: NANCY BEATRIZ KU RAMIREZ TESORERA: DIANELA MARILÚ BATÚN COCOM",
      "categoria": "ADMINISTRADOR",
      "lat": 21.017919,
      "lng": -89.620798
    },
    {
      "id": "comite_054",
      "name": "COMISARIA DE SAN JOSE TZAL",
      "tipo": "CAMPO DE FÚTBOL, CANCHA DE ÚSOS MULTIPLES Y SÍNTETICO",
      "responsable": "PRESIDENTA: KARINA IUIT  IUIT SECRETARIO: GABRIEL ALBERTO RAMOS BACAB  TESORERA: MARIA MISHEL PISTE CHAN",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.959477,
      "lng": -89.631842
    },
    {
      "id": "comite_055",
      "name": "COMISARIA DE SIERRA PAPACAL",
      "tipo": "CAMPO DE FÚTBOL, CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: SILBANO JESUS PECH ORTEGA SECRETARIO: RIGEL HURIEL CAB POOL TESORERO: JOEL POOT MOO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.967663,
      "lng": -89.607585
    },
    {
      "id": "comite_056",
      "name": "COMISARIA DE SITPACH",
      "tipo": "CAMPO DE FÚTBOL Y CAMPO DE SOFTBOL",
      "responsable": "PRESIDENTA: DIANA ARACELLI CANCHE CEN SECRETARIA:MAGDALENA DZUL DZIB  TESORERO: JORGE GABRIEL GAMBOA GONZALEZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.97675,
      "lng": -89.637087
    },
    {
      "id": "comite_057",
      "name": "COMISARIA DE SODZIL NORTE",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: YAMILE KARINE CORREA M SECRETARIO: CARLOS ERNESTO MO PECH TESORERO: JOSE MANUEL MAY KU",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.949482,
      "lng": -89.620079
    },
    {
      "id": "comite_058",
      "name": "COMISARIA DE SUYTUNCHEN",
      "tipo": "CANCHA DE USOS MULTIPLES Y CAMPO DE FÚTBOL",
      "responsable": "JOSÉ GASPAR CUA YAM",
      "categoria": "ADMINISTRADOR",
      "lat": 20.983528,
      "lng": -89.609428
    },
    {
      "id": "comite_059",
      "name": "COMISARÍA DE TAHDZIBICHEN",
      "tipo": "CAMPO DE FÚTBOL Y CANCHAS DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: EDUARDO JONATAN CHI VILLANUEVA SECRETARIO: JOSE EMMANUEL VILLANUEVA COB TESORERO: HENRY SAMUEL CHI VILLANUEVA",
      "categoria": "ADMINISTRADOR",
      "lat": 20.961963,
      "lng": -89.649092
    },
    {
      "id": "comite_060",
      "name": "COMISARIA DE TEXAN CAMARA",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: RODRIGO CETINA SECRETARIO: CESAR PASTOR TUN SANTANA TESORERO: KAREN GUADALUPE CANUL URIBIA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.954772,
      "lng": -89.597234
    },
    {
      "id": "comite_061",
      "name": "COMISARIA DE TIXCACAL",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: FAUSTO CAN MARTIN SECRETARIO: HUMBERTO RAFAEL RODRIGUEZ RODRIGUEZ TESORERO: PEDRO ANTONIO KU RODRIGUEZ VOCAL: ELBI GEORGINA MAY MARTIN",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.992863,
      "lng": -89.63302
    },
    {
      "id": "comite_062",
      "name": "COMISARIA DE TZACALA",
      "tipo": "CAMPO DE FÚTBOL, CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: EDWIN ARMANDO MORALES YAM SECRETARIO: ANTONIO MORALES YAM\nTESORERO: ARMANDO YAM CHAN",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.940095,
      "lng": -89.637633
    },
    {
      "id": "comite_063",
      "name": "COMISARIA DE XCANATUN",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: JORGE MARTIN NAJERA PECH SECRETARIO: PEDRO PABLO CAMPOS GOMEZ TESORERO: JULIO UC CAB VOCAL: FILIBERTO ALONZO CANCHE",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.979484,
      "lng": -89.587916
    },
    {
      "id": "comite_064",
      "name": "COMISARIA DE XCUMPICH",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: EMILIANO RUBIO GOMEZ SECRETARIO: OSWALDO ANTONIO ESQUIVEL PEREZ TESORERA: EDDY XIMENA SALAZAR LARA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.978449,
      "lng": -89.661604
    },
    {
      "id": "comite_065",
      "name": "COMISARIA DE YAXCHE CASARES",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: MANUEL ALEJANDRO CETINA CETINA SECRETARIO: MARTA JUSTINA BALAM CIME TESORERO: CECILIA MARICRUZ CAHUM CHAN",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.934605,
      "lng": -89.602431
    },
    {
      "id": "comite_066",
      "name": "COMISARIA DE YAXNIC",
      "tipo": "CAMPO DE FÚTBOL, CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: MARIA GUADALUPE DE JESUS MATU CHAN SECRETARIO:  FREDY DE JESUS SIMA CHAN \nTESORERO: VICTOR ANDRES SIMA CHAN VOCAL 1: CARLOS PEREZ SULU",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 21.004832,
      "lng": -89.611349
    },
    {
      "id": "comite_067",
      "name": "COMISARIA HACIENDA OPICHEN",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: RUSELL ANGEL AMARO MOGUEL SECRETARIO: RUSSEL DE JESUS RODRIGUEZ GUERRERO TESORERO: JOSE ROBERTO RODRIGUEZ KU VOCAL: RAUL ALEJANDRO CAAMAL CHIN",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.944404,
      "lng": -89.66446
    },
    {
      "id": "comite_068",
      "name": "CORDEMEX REVOLUCION- GONZALO GUERRERO",
      "tipo": "CAMPO DE FÚTBOL, CAMPO DE BEISBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE:  RENE PATRON VALDEZ SECRETARIO: EDGAR EDUARDO OJEDA COB TESORERO: ANASTACIO CHUIL PACHECO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.9598,
      "lng": -89.571421
    },
    {
      "id": "comite_069",
      "name": "CORTES SARMIENTO",
      "tipo": "CAMPO DE SOFTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: LUIS ENRIQUE CISNEROS MONTERO SECRETARIO: JORGE RICARDO CHIM QUIJANO TESORERO: EDGAR RODRIGO GARCIA LARA VOCAL 1: ABEL FRANCISCO VALLEJO LOEZA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 21.00338,
      "lng": -89.656978
    },
    {
      "id": "comite_070",
      "name": "DELIO MORENO \"LA CEIBA\"",
      "tipo": "CAMPO DE SOFTBOL, CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: DAVID ALFONSO SOLIS SOBERANIS SECRETARIO: ANDY AMEK CAMPOS TESORERO: EDWIN CAMPOS CARDEÑA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.91857,
      "lng": -89.627487
    },
    {
      "id": "comite_071",
      "name": "DEPORTES EXTREMOS",
      "tipo": "CANCHA SINTETICA, CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: JAVIER LOPEZ SANCHEZ SECRETARIO: JULIO ALBERTO SANTIAGO GONZALEZ TESORERO: JAIME JUAREZ ALCOCER",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 21.001793,
      "lng": -89.578587
    },
    {
      "id": "comite_072",
      "name": "DIAZ ORDAZ",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: HENRY GAMALIEL ACOSTA SECRETARIO: JORGE ENRIQUE MAIN NAVIT TESORERA: FLOR DE AGUA GOMEZ ACOSTA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.966894,
      "lng": -89.635599
    },
    {
      "id": "comite_073",
      "name": "DOLORES OTERO",
      "tipo": "CANCHA DE USOS MULTIPLES  Y CAMPO DE BEISBOL",
      "responsable": "PRESIDENTE: CARLOS ISRAEL ROMERO ACOSTA SECRETARIO: IVAN ANTONIO NARVAEZ CAUICH TESORERO: LUIS ALEJANDRO SANCHEZ MARTIN",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.958358,
      "lng": -89.611514
    },
    {
      "id": "comite_074",
      "name": "EMILIANO ZAPATA NORTE",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: JOSE AGUILEO CEN CHAN SECRETARIO: MARIO EFRAIN KEB CHUC TESORERO: CRISTIAN ALBERTO CEN UXUL",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.982239,
      "lng": -89.62478
    },
    {
      "id": "comite_075",
      "name": "EMILIANO ZAPATA SUR",
      "tipo": "CAMPO DE BEISBOL",
      "responsable": "PRESIDENTE: MARIA LETICIA GRACIELA CANUL MEDINA SECRETARIO: PAUL ANTONIO PAAS TZUC TESORERA: VIRGINIA DZIB MAY   VOCAL: JORGE RENE CEBALLOS LLANES",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.952855,
      "lng": -89.635672
    },
    {
      "id": "comite_076",
      "name": "EMILIANO ZAPATA SUR II PARQUE MARÍA DE LA PAZ",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "TEODORO CAPI HERNANDEZ",
      "categoria": "ADMINISTRADOR",
      "lat": 20.970694,
      "lng": -89.599469
    },
    {
      "id": "comite_077",
      "name": "EX RASTRO",
      "tipo": "CAMPO DE FÚTBOL, CANCHA DE USOS MULTIPLES, CAMPO DE FUT 7",
      "responsable": "PRESIDENTA: SINAI GUADALUPE GÓMEZ CHACON  SECRETARIO: ROLANDO EMMANUEL ARZAPALO VARGUEZ TESORERO:  JOEL GUALBERTO OCAMPO GARCIA VOCAL: MARIO PALMERO ALI",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.978853,
      "lng": -89.645735
    },
    {
      "id": "comite_078",
      "name": "FELIPE CARRILLO PUERTO CHUBURNA",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTA: ADDY MARIA YOLANDA EUAN FLORES SECRETARIO: WILLIAM RENE POLANCO ORTIZ TESORERA: MARIA VALENTINA RODRIGUEZ COLLI",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.943101,
      "lng": -89.615025
    },
    {
      "id": "comite_079",
      "name": "FELIPE CARRILLO PUERTO NORTE",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: DANIEL AUGUSTO SEGURA DIAZ SECRETARIO: JOSE FRANCISCO ADRIAN CANO COLLÍ TESORERO: MARIO ARTURO SOLIS TEJERO VOCAL 2: SALVADOR ALBERTO ESCALANTE MART",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.991257,
      "lng": -89.608337
    },
    {
      "id": "comite_080",
      "name": "FIDEL VELAZQUEZ LA  CROC",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "ANDRES DE JESÚS MORENO VIVAS",
      "categoria": "ADMINISTRADOR",
      "lat": 20.956577,
      "lng": -89.656016
    },
    {
      "id": "comite_081",
      "name": "FIDEL VELAZQUEZ SARA MENA",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: KARIM URIBE OXTE SECRETARIA: ALEJANDRA ISABEL ORTIZ PAVON TESORERO: JOSE GUILLERMO ACOSTA ADUELO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.95511,
      "lng": -89.587624
    },
    {
      "id": "comite_082",
      "name": "FRACC CHENKÚ",
      "tipo": "CAMPO DE FÚTBOL Y SOFTBOL",
      "responsable": "ALFONZO MEZETA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.997936,
      "lng": -89.64073
    },
    {
      "id": "comite_083",
      "name": "FRACC CHENKÚ FUT 7",
      "tipo": "CAMPO DE FÚTBOL 7",
      "responsable": "PRESIDENTE: JOSE LUIS PATRON PACHECO SECRETARIO: JESUS ALBERTO CARRILLO TESORERO: PABLO EMILIO MAY CANTO VOCAL:  RICARDO HUMBERTO MANGAS NUÑEZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.931877,
      "lng": -89.635682
    },
    {
      "id": "comite_084",
      "name": "FRACC DEL PARQUE",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: LUIS DEMETRIO COHOU HERRERA  SECRETARIO: JOSE DEL CARMEN RUZ MALDONADO TESORERO: JESUS COUOH MATOS",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.986932,
      "lng": -89.582902
    },
    {
      "id": "comite_085",
      "name": "FRACCIONAMIENTO DEL SUR",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTA: FANNY MAGALI PERAZA POLANCO SECRETARIO: EDUARDO RAFAEL ARELLANO BLANCARTE TESORERA: CAMILA RAQUEL MEJIA DE LA CRUZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.97549,
      "lng": -89.671406
    },
    {
      "id": "comite_086",
      "name": "FRANCISCO DE MONTEJO ARBOLEDAS",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE BASQUETBOL",
      "responsable": "PRESIDENTE: MAURICIO OCAMPO CASTRO SECRETARIO: FERNANDO AGUILAR VARGUEZ TESORERO: MAURICIO RENE RICALDE MEDINA VOCAL 1: IAN ALEJANDRO ARJONA FITZMAURICE VOCAL 2",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.931406,
      "lng": -89.592496
    },
    {
      "id": "comite_087",
      "name": "FRANCISCO DE MONTEJO CANTARITOS CAMPO DE SOFTBOL",
      "tipo": "CAMPO DE SOFTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: EXIQUIO EUAN CARRILLO SECRETARIO: ALEJANDRO CAMARA OLIVERA TESORERO: JUAN JOSE CORREA RAMIREZ VOCAL: BRIAN MANUEL CERVANTES ZALDIVAR",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 21.012875,
      "lng": -89.616469
    },
    {
      "id": "comite_088",
      "name": "FRANCISCO DE MONTEJO CANTARITOS CANCHA DE USOS MÚLTIPLES",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "ALEJANDRO CAMARA",
      "categoria": "ADMINISTRADOR",
      "lat": 20.935321,
      "lng": -89.666939
    },
    {
      "id": "comite_089",
      "name": "FRANCISCO DE MONTEJO LA PISTA",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTA:  ROCIO DEL C BASTARRACHEA KANTUN SECRETARIA: LETICIA FABIOLA VALADEZ GUILLERMO  TESORERO: CARLOS HERNAN VARGAS CORTEZ VOCAL 1: GUMERSINDO ARTURO LOR",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.96541,
      "lng": -89.562235
    },
    {
      "id": "comite_090",
      "name": "FRANCISCO DE MONTEJO LA RAMPA",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: ARTURO AGUIÑAGA BRAVO SECRETARIO: LUCY ADRIANA ESCALANTE ALCOCER TESORERA: ALICIA GUADALUPE OLIVARES TUN",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.974373,
      "lng": -89.632021
    },
    {
      "id": "comite_091",
      "name": "FRANCISCO DE MONTEJO NARANJOS",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTA: RUBI ESTRADA PEREZ SECRETARIO:  IGNACIO DE LEON OJEDA TESORERA: REBECA SANCHEZ GONZALEZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.954085,
      "lng": -89.622131
    },
    {
      "id": "comite_092",
      "name": "FRANCISCO DE MONTEJO ROTARIOS",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTA: PAOLA PENSABE RODRIGUEZ SECRETARIA: LUZ MARIA SANTANA ALFARO TESORERA: NATALIA CORTEZ PALMA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.978855,
      "lng": -89.611437
    },
    {
      "id": "comite_093",
      "name": "FRANCISCO I MADERO",
      "tipo": "CAMPO DE BEISBOL",
      "responsable": "PRESIDENTE: ROGER ARMANDO ESPINOSA FRANCO SECRETARIO: OSCAR MANUEL ROSADO MENA TESORERO: MAURICIO SANCHEZ GONZALEZ VOCAL 1: ARMANDO HUMBERTO CABALLERO DELGADO V",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.964464,
      "lng": -89.643887
    },
    {
      "id": "comite_094",
      "name": "FRANCISCO VILLA PONIENTE",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTA: CLAUDIA PAT MANZANERO SECRETARIO: EDDIE OMAR GONZALEZ DE LA ROSA TESORERA: ESTEFHANY IRAIS CERVANTES PAT",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.955708,
      "lng": -89.603211
    },
    {
      "id": "comite_095",
      "name": "JESUS CARRANZA BASQUETBOL",
      "tipo": "CANCHA DE BASQUETBOL",
      "responsable": "PRESIDENTE: HERBERT JAIR MARTIN AVILES SECRETARIA: OFELIA DEL PILAR PECH LOPE TESORERA: JULIA CAROLINA PAVIA QUEZADA VOCAL: CHRISTINA IVETTE CRUZ CANTO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.988842,
      "lng": -89.629141
    },
    {
      "id": "comite_096",
      "name": "JESUS CARRANZA FÚTBOL",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: GILMER JESUS PACHECO HERRERA SECRETARIO: VICTOR MANUEL MATOS NIÑO TESORERO: CARLOS RICARDO CENTURION CUEVAS",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.945344,
      "lng": -89.63746
    },
    {
      "id": "comite_097",
      "name": "JESUS CARRANZA SOFTBOL",
      "tipo": "CAMPO DE SOFTBOL",
      "responsable": "PRESIDENTA: SHARON ESTEFANI CANTO CANTO SECRETARIO: PEDRO EMMANUEL ECHEVERRIA ESCALANTE  TESORERA: HAYDEE CONSUELO GONZALEZ LOEZA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.975527,
      "lng": -89.592192
    },
    {
      "id": "comite_098",
      "name": "JUAN PABLO CARDENALES",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: LUIS ENRIQUE LEON MAGAÑA SECRETARIA:  LESLY GABRIELA GONZALEZ NUÑEZ TESORERA: MARGARITA DEL ROSARIO MAY NOH",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.979128,
      "lng": -89.655176
    },
    {
      "id": "comite_099",
      "name": "JUAN PABLO FLAMBOYANES",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: JIMMY JASIEL VEGA GONZALEZ TESORERO: FRANCISCO ALFREDO YAMA GARRIDO SECRETARIO: CESAR EFRAIN MARTINEZ SULUB VOCAL 2: INES YADIRA HAY CANCHE",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.937659,
      "lng": -89.607929
    },
    {
      "id": "comite_100",
      "name": "JUAN PABLO NORA",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: LIGIA BEATRIZ VAZQUEZ TELLO SECRETARIO: BALTAZAR QUIÑONES QUIÑONES TESORERO: VIRGINIA CANDILA DZUL",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.999411,
      "lng": -89.609533
    },
    {
      "id": "comite_101",
      "name": "LA MESTIZA COLONIA YUCATAN",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "JOSE RAUL ZAPATA BACELIS",
      "categoria": "ADMINISTRADOR",
      "lat": 20.949598,
      "lng": -89.661549
    },
    {
      "id": "comite_102",
      "name": "LAZARO CARDENAS",
      "tipo": "CAMPO DE BEISBOL",
      "responsable": "PRESIDENTE: PEDRO JOSÉ CONTRERAS SECRETARIO: JORGE EUAN ALONZO TESORERO: FELIPE ALBERTO DE JESUS CARRILLO PINEDA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.957426,
      "lng": -89.577801
    },
    {
      "id": "comite_103",
      "name": "LOS HEROES",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "ANGEL EDUARDO ESPINOZA ÁVILA",
      "categoria": "ADMINISTRADOR",
      "lat": 21.001633,
      "lng": -89.650169
    },
    {
      "id": "comite_104",
      "name": "LOS HEROES",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: SERGIO RAUL QUINTAL DUARTE SECRETARIO: MAGALLY JOSE ESCALANTE OJEDA TESORERO: CHRISTIAN JESUS MALDONADO BOBADILLA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.923736,
      "lng": -89.631331
    },
    {
      "id": "comite_105",
      "name": "LOS REYES",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: ALEJANDRA SARAHI URIBE OXTE SECRETARIO: CESAR ALBERTO CORTEZ GONZALEZ TESORERO: BALBINO PINZON AC",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.995659,
      "lng": -89.579763
    },
    {
      "id": "comite_106",
      "name": "MAYAPAN",
      "tipo": "CANCHA DE BASQUETBOL",
      "responsable": "PRESIDENTE: ANTONIO TOLOSA SECRETARIO: IRVING ALBORNOZ TESORERO: RENE MENDEZ PALOMO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.970517,
      "lng": -89.680808
    },
    {
      "id": "comite_107",
      "name": "MELITON SALAZAR",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: LIDIA DE JESUS CAUICH GONGORA SECRETARIO: RAFAEL ANTONIO CAUICH TESORERO: DAVID ANTONIO TUN SANCHEZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.929953,
      "lng": -89.581262
    },
    {
      "id": "comite_108",
      "name": "MERCEDES BARRERA",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: ADRIAN RAI ROSADO MOGUEL SECRETARIA: GABRIELA LIZZET ALVAREZ MUKUL TESORERO: JORGE ENRIQUE CARRANZA CHABLE",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.977559,
      "lng": -89.62319
    },
    {
      "id": "comite_109",
      "name": "MIGUEL ALEMAN",
      "tipo": "CAMPO DE SOFTBOL",
      "responsable": "ANTONIO HERRERA",
      "categoria": "ADMINISTRADOR",
      "lat": 20.957331,
      "lng": -89.633253
    },
    {
      "id": "comite_110",
      "name": "MIRAFLORES",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: JESÚS REYNALDO CHAC GONZALEZ SECRETARIA: JAZMIN GUADALUPE HERNANDEZ KU TESORERA: LESVIA DEL CARMEN CHALE NOVELO VOCAL 1: WILBERTH WALDEMAR CALAN UCA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.968569,
      "lng": -89.604826
    },
    {
      "id": "comite_111",
      "name": "MISNÉ CANCHA USOS",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "RAYMUNDO MEX",
      "categoria": "ADMINISTRADOR",
      "lat": 20.977549,
      "lng": -89.639941
    },
    {
      "id": "comite_112",
      "name": "MONTES DE AME",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: FERNANDO LÓPEZ SECRETARIO: FRANCISCO JAVIER CASTILLO APARICIO TESORERO: RENE QUIÑONES REYES",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.947298,
      "lng": -89.618475
    },
    {
      "id": "comite_113",
      "name": "MORELOS ORIENTE",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: ROGRIGO DE JESUS VILLALOBOS SANGUINO SECRETARIO: JOSE EDUARDO COLLI CHAN TESORERO: ANGEL LUIS YAH FUENTES",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.986114,
      "lng": -89.608972
    },
    {
      "id": "comite_114",
      "name": "MULSAY CARMELITAS",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "ERICK CASTILLO MAGAÑA",
      "categoria": "ADMINISTRADOR",
      "lat": 20.960196,
      "lng": -89.651475
    },
    {
      "id": "comite_115",
      "name": "MULSAY LA PATO",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS",
      "responsable": "PRESIDENTA: KARINA MENDOZA HERNANDEZ SECRETARIO: IRVING GRANIER BOLDO GONZALEZ TESORERO: FERNANDO ENRIQUE LEAL GOMEZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.954833,
      "lng": -89.593984
    },
    {
      "id": "comite_116",
      "name": "MULSAY SOLIDARIDAD/ JARDINES DE MULSAY",
      "tipo": "CAMPO DE FÚTBOL, CANCHA DE USOS MULTIPLES, CAMPO DE BEISBOL",
      "responsable": "PRESIDENTE: DANIEL HAU SANCHEZ SECRETARIO: MOISES ISRAEL PRECIADO TESORERO: DARWIN CANUL",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.994617,
      "lng": -89.635602
    },
    {
      "id": "comite_117",
      "name": "NORA QUNTANA",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: EDUARDO GARCIA AGUILAR SECRETARIO: ERNESTO JAVIER OY LUGO TESORERA: ERIKA ELENA PEREZ VAZQUEZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.937292,
      "lng": -89.637009
    },
    {
      "id": "comite_118",
      "name": "NUCLEO MULSAY",
      "tipo": "CAMPO DE FUTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: FELIPE MONTERO MAGAÑA SECRETARIA: YAREIMY EUAN PACHECO TESORERA: ARLINE ESTEFANIA SOLIS CASTILLO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.982015,
      "lng": -89.586177
    },
    {
      "id": "comite_119",
      "name": "NUEVA PACABTUN",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: MARIA GUADALUPE MALDONADO LAVADORES SECRETARIO: JANETH ALONDRA DZUL PINELO TESORERO: LUIS ANTONIO CAUICH RODRIGUEZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.977452,
      "lng": -89.664971
    },
    {
      "id": "comite_120",
      "name": "NUEVA REFORMA AGRARIA",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: ANGEL ALONSO MILLAN SALAZAR SECRETARIO: GABRIEL EDUARDO ORTIZ BATUN TESORERO: MARIO EFRAIN CELIS KUK",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.933495,
      "lng": -89.599017
    },
    {
      "id": "comite_121",
      "name": "PACABTUN DAVID LORIA RIVERO",
      "tipo": "CAMPO DE BEISBOL",
      "responsable": "PRESIDENTE: SANTIAGO ERMILO HUCHIM FLORES SECRETARIO: LUIS ANTONIO CARDEÑA HERRERA TESORERO: JUAN PABLO PEREZ TORREZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 21.007611,
      "lng": -89.613113
    },
    {
      "id": "comite_122",
      "name": "PACABTUN LAS TORRES",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: FERNANDO ALBERTO TRUJEQUE VEGA SECRETARIO: JORGE ALBERTO TRUJEQUE ARGENTE TESORERO: MARIA SILVIA CANUL MAY",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.941256,
      "lng": -89.665316
    },
    {
      "id": "comite_123",
      "name": "PARQUE ALEMAN",
      "tipo": "AREA DE SKATE",
      "responsable": "JORGE XEBASTIAN MILLET DOMINGUEZ",
      "categoria": "ADMINISTRADOR",
      "lat": 20.961757,
      "lng": -89.568231
    },
    {
      "id": "comite_124",
      "name": "PARQUE ECOLÓGICO DEL PONIENTE FRACC YUCALPETEN",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: HENRY DAVID TRACONIS MEZA SECRETARIO: MARIO TIRADO JIMENEZ TESORERA: MONICA LISSETH HU ARANA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 21.003665,
      "lng": -89.661019
    },
    {
      "id": "comite_125",
      "name": "PARQUE JAPONES",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "GIMER BRICEÑO",
      "categoria": "ADMINISTRADOR",
      "lat": 20.916065,
      "lng": -89.624591
    },
    {
      "id": "comite_126",
      "name": "POLIGONO 108 CTM CAMPO FÚTBOL",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "TERESA SOLIS GOROCICA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.974597,
      "lng": -89.614249
    },
    {
      "id": "comite_127",
      "name": "POLIGONO 108 CTM CANCHA DE USOS",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: SERGIO IVAN EROSA AVILA SECRETARIO: JHOVANY ISRAEL PECH BEYTIA  TESORERO: ALAN JOSE GARCIA NADAL",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.966207,
      "lng": -89.638406
    },
    {
      "id": "comite_128",
      "name": "POLIGONO 108 XTABAY",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTA: LAURA FABIOLA LARA GONZALEZ SECRETARIA: ESCARLETH MONSERRAT AVILA LARA TESORERA: JOHANA KARIME LARA GONZALEZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.957369,
      "lng": -89.608797
    },
    {
      "id": "comite_129",
      "name": "PORVENIR",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: MARIO ERMILO DZUL SOLIS SECRETARIO: DANIEL GUADALUPE BALAM MANRIQUE\nTESORERO: RUBEN ALBERTOKOH AVILES",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.984492,
      "lng": -89.626131
    },
    {
      "id": "comite_130",
      "name": "RAPTORES PACABTUN",
      "tipo": "CAMPO DE AMERICANO, CAMPO DE FÚTBOL Y CAMPO DE BEISBOL",
      "responsable": "PRESIDENTE: ANGEL DE JESUS ARGUELLES LORIA SECRETARIO: ISMAEL DARIO GEBHARDT MUÑOZ TESORERA: GLADYS ILANY ARCEL CARRILLO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.950358,
      "lng": -89.636373
    },
    {
      "id": "comite_131",
      "name": "SALVADOR ALVARADO SUR",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: EDUARDO IVAN CHAN CASANOVA SECRETARIO: ROBERTO BARRIENTOS TAPIA TESORERA: MARIA DEL CARMEN ARANDA SUAREZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.972257,
      "lng": -89.59697
    },
    {
      "id": "comite_132",
      "name": "SAN ANTONIO KAUA II",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: DANIEL JESUS CASTILLO SOSA SECRETARIO: ERIC EFRAIN LOPEZ HERNANDEZ TESORERO: EDUARDO CAUICH CHUC VOCAL: CARLOS FRANCISCO CANUL BOLIO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.97901,
      "lng": -89.648912
    },
    {
      "id": "comite_133",
      "name": "SAN ANTONIO XLUCH EL BATE CAMPO DE BEISBOL",
      "tipo": "CAMPO DE BEISBOL",
      "responsable": "PRESIDENTE: SANTIAGO ARMANDO BACAB CASTILLO SECRETARIO: LUIS MANUEL DIAZ PEREZ  TESORERO: JULIO MANUEL DIAZ HERNANDEZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.941223,
      "lng": -89.612671
    },
    {
      "id": "comite_134",
      "name": "SAN ANTONIO XLUCH EL BATE CANCHA DE USOS",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: RODOLFO CANCHE PISTE SECRETARIO: ROBERTO IVAN CONTRERAS LARA TESORERO: LORENZO GARCIA ALEMAN",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.994027,
      "lng": -89.608691
    },
    {
      "id": "comite_135",
      "name": "SAN ANTONIO XLUCH LOS MUERTOS",
      "tipo": "CAMPO DE FÚTBOL, CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: JOSE LUIS SOLIS MORALES TESORERO: GABRIEL FRANCISCO SEGOVIA MENDOZA SECRETARIO: ANTONIO ISRAEL EK MAY VOCAL 2: FRANCISCO JAVIER CANCHE MAY",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.954221,
      "lng": -89.657932
    },
    {
      "id": "comite_136",
      "name": "SAN CARLOS DEL SUR",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "EMILIO GUTIERREZ ORDOÑEZ",
      "categoria": "ADMINISTRADOR",
      "lat": 20.955876,
      "lng": -89.584261
    },
    {
      "id": "comite_137",
      "name": "SAN FRANCISCO PORVENIR",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: JUAN FRANCISCO NOH MALDONADO SECRETARIO: ROBERTO ARMANDO SUAREZ PACHECO TESORERO: LIMER RENE CARRILLO CANUL",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.99922,
      "lng": -89.643957
    },
    {
      "id": "comite_138",
      "name": "SAN GERONIMO",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: GERARDO PEREZ SANCHEZ SECRETARIO: ROGER CABALLERO TESORERO: CRISTIAN F MARRUFO CANCINO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.929072,
      "lng": -89.634196
    },
    {
      "id": "comite_139",
      "name": "SAN JOSE TECOH",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTA: MARÍA VERONICA GALERA BALAN SECRETARIA: YESSICA NOEMI RODRIGUEZ LÓPEZ TESORERO: EDUARD JAVIER KU UICAB VOCAL 1: JONATHAN EMANUEL TAMAYO PEREZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.989944,
      "lng": -89.581814
    },
    {
      "id": "comite_140",
      "name": "SAN JOSE TECOH  \"LOS CARDENALES\"",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: JUAN CARLOS ARENAS HEREDIA SECRETARIO: JORGE ROMERO TESORERO: MANUEL RICARDO ARGAEZ VALDEZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.973765,
      "lng": -89.674663
    },
    {
      "id": "comite_141",
      "name": "SAN JOSE TECOH SAN ROQUE",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: SHIRLEY I BRITO AGUILAR SECRETARIA: ALESSANDRA ABIGAIL YEH DIAZ TESORERA: YESSICA NOEMI RODRIGUEZ LOPEZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.930908,
      "lng": -89.588588
    },
    {
      "id": "comite_142",
      "name": "SAN LUIS CHUBURNÁ",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "MIGUEL MOGUEL",
      "categoria": "ADMINISTRADOR",
      "lat": 21.015466,
      "lng": -89.619094
    },
    {
      "id": "comite_143",
      "name": "SAN MARCOS NOCOH  EL CERRITO",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: VERONICA MARIBEL KU TRUJILLO SECRETARIO:  WILBERTH ANTONIO CEN POOL TESORERO: LUIS ARNALDO TEC MEDINA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.931834,
      "lng": -89.666994
    },
    {
      "id": "comite_144",
      "name": "SAN MARCOS NOCOH CARTONERA",
      "tipo": "CAMPO DE FÚTBOL, CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: FERNANDO LÓPEZ RAMÍREZ SECRETARIO: JOSE SEBASTIAN CHI ARCEO\nTESORERO: GILDA SELENE ITZA VALLE",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.967212,
      "lng": -89.610403
    },
    {
      "id": "comite_145",
      "name": "SAN NICOLAS DEL SUR",
      "tipo": "CAMPO DE FÚTBOL, CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: AMELIO DE JESUS UCAN EUAN SECRETARIO: ORLANDO JAVIER ABAN HU TESORERA: LUCIA GUADALUPE GIJON CHAN",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.975545,
      "lng": -89.634589
    },
    {
      "id": "comite_146",
      "name": "SAN PABLO ORIENTE",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: GABRIEL RAFACEL GIL COOL SECRETARIO: INES SARAÍ ROMERO PACHECO TESORERO: JUAN TEODORO TUN PECH",
      "categoria": "ADMINISTRADOR",
      "lat": 20.951777,
      "lng": -89.621037
    },
    {
      "id": "comite_147",
      "name": "SAN PABLO UXMAL",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: JOSE EFRAIN CHAN BALAM SECRETARIO: RENE DESIDERIO KU Y CASTILLO TESORERO: JOSE MELCHOR EUAN RAMIREZ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.981251,
      "lng": -89.610498
    },
    {
      "id": "comite_148",
      "name": "SAN PEDRO CHOLUL",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: MIGUEL ANGEL CONTRERAS LIZAMA SECRETARIA: VICTORIA AZENETH MULL ALVAREZ TESORERO: RAMON MIRANDA AROYO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.963108,
      "lng": -89.646485
    },
    {
      "id": "comite_149",
      "name": "SAN PEDRO UXMAL",
      "tipo": "CAMPO DE FÚTBOL, CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: SEVERO CORDOVA HERNÁNDEZ SECRETARIA: TERESA MARGARITA CAMPOS BACELIS TESORERO: JOSÉ GABRIEL PUC ROSADO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.955339,
      "lng": -89.600124
    },
    {
      "id": "comite_150",
      "name": "SAN SEBASTIAN",
      "tipo": "CAMPO DE SOFTBOL, CANCHA DE USOS MULTIPLES, CANCHA DE BASQUET",
      "responsable": "KAREN CÁMARA",
      "categoria": "ADMINISTRADOR",
      "lat": 20.990831,
      "lng": -89.631261
    },
    {
      "id": "comite_151",
      "name": "SAN VICENTE ORIENTE",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: HECTOR DANIEL CANDELARIO GAYAZO SECRETARIO: ILEANA GUADALUPE CANUL PECH TESORERA: ROCIO POLANCO BAAS",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.942621,
      "lng": -89.637371
    },
    {
      "id": "comite_152",
      "name": "SANTA MARIA CHUBURNA",
      "tipo": "CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: RAFAEL DE LA CRUZ MONFORTE SECRETARIO: ELEONOR DEL PILAR LEAL MATINEZ TESORERO: MERCEDES NAVARRO SIERRA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.9777,
      "lng": -89.590111
    },
    {
      "id": "comite_153",
      "name": "SANTA ROSA",
      "tipo": "CAMPO DE SOFTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: CARLOS ALBERTO CORTES RIVERO TESORERO: JUAN AUGUSTO  CETINA DIAZ SECRETARIO: JOSE ELIAS QUIJANO CARRILLO VOCAL 2:  RENAN HERNANDEZ PACHECO VOCAL 3: ",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.978591,
      "lng": -89.658517
    },
    {
      "id": "comite_154",
      "name": "SERAPIO RENDON I",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: GILMER ENRIQUE REYES MAY SECRETARIO: SIRLY ESTHER IX CHI TESORERO: EDWIN JOEL PADILLA OCH VOCAL 1: ALEXA MARINTIA PAT",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.936215,
      "lng": -89.6049
    },
    {
      "id": "comite_155",
      "name": "SERAPIO RENDON II",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: CRISTIAN GOMEZ SAGRERO SECRETARIA: NORMA ALEJANDRA CUEVAS TORRES TESORERO: JULIO CESAR AYALA NAVARRETE",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 21.002228,
      "lng": -89.61074
    },
    {
      "id": "comite_156",
      "name": "TANLUM",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "FELIPE GUZMAN BARRERA",
      "categoria": "ADMINISTRADOR",
      "lat": 20.946732,
      "lng": -89.662857
    },
    {
      "id": "comite_157",
      "name": "TERRANOVA",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: FRANCISCO ARAUJO MAY SECRETARIO: JULIO CESAR ESCALANTE CABRERA TESORERO: MIGUEL ANGEL GOROCICA BRICEÑO",
      "categoria": "ADMINISTRADOR",
      "lat": 20.958918,
      "lng": -89.574494
    },
    {
      "id": "comite_158",
      "name": "UNIDAD MORELOS VICENTE SOLIS",
      "tipo": "CAMPO DE BEISBOL, CAMPO DE FÚTBOL Y CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: ABDIEL JESUS SANGUINO MARTINEZ SECRETARIO: FRANCISCO GOMEZ RAMIREZ TESORERO: WILBERTH YUCUNDO PECH CANCHE",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 21.002335,
      "lng": -89.65393
    },
    {
      "id": "comite_159",
      "name": "VERGEL EMANCIPACIÓN CAMPO PEQUEÑO",
      "tipo": "CAMPO PEQUEÑO DE FÚTBOL",
      "responsable": "ADRIAN PALOMO",
      "categoria": "ADMINISTRADOR",
      "lat": 20.921073,
      "lng": -89.62898
    },
    {
      "id": "comite_160",
      "name": "VERGEL EX CONASUPO",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "JOSE LUIS HERRERA VALLADARES",
      "categoria": "ADMINISTRADOR",
      "lat": 20.999048,
      "lng": -89.579443
    },
    {
      "id": "comite_161",
      "name": "VERGEL I CANCHAS GEMELAS",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: WALTER JESUS GONZALEZ KANTUN  SECRETARIO: ANDRES FRANCISCO AGUILAR CARDOS  TESORERO: WILBERTH DE JESUS CARRILLO CASTILLO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.968078,
      "lng": -89.683781
    },
    {
      "id": "comite_162",
      "name": "VERGEL III CTM",
      "tipo": "CAMPO DE SOFTBOL",
      "responsable": "EDITH VILLANUEVA",
      "categoria": "ADMINISTRADOR",
      "lat": 20.959704,
      "lng": -89.613891
    },
    {
      "id": "comite_163",
      "name": "VERGEL III EL PAÑUELO",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: ARMIN BACELIS MEJIA SECRETARIO: ALBERTO CARRILLO TESORERO: JESUS JABET AGUILAR POOT TESORERO: JORGE CATALINO HEREDIA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.979907,
      "lng": -89.624024
    },
    {
      "id": "comite_164",
      "name": "VERGEL IV EL REY",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: JONATAN ALESSANDRO ECHEVERRIA SANTANA SECRETARIO: ENRIQUE ISAAC UC RODRIGUEZ TESORERO: CARLOS ALBERTO COCOM BAAS",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.955048,
      "lng": -89.63442
    },
    {
      "id": "comite_165",
      "name": "VERGEL MISNE",
      "tipo": "CAMPO DE SOFTBOL",
      "responsable": "PRESIDENTE: ALFREDO UICAB COBA SECRETARIO: MANUEL RAMIREZ TESORERO: CARLOS MAY TOLEDANO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.969712,
      "lng": -89.602145
    },
    {
      "id": "comite_166",
      "name": "VERGEL SAN JOSE",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTE: RODRIGO REYES CAPETILLO SECRETARIO: JOSE ROBERTO GARCIA MEDELLIN TESORERO: MANUEL JESUS SANDOVAL CETINA",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.978124,
      "lng": -89.642923
    },
    {
      "id": "comite_167",
      "name": "VERGELII EMANCIPACIÓN",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTE: CARLOS MANUEL OJEDA GAMBOA SECRETARIO: GABRIEL LEONARDO OSORIO RUIZ TESORERO: PEDRO JOSE MENESES CALDERON",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.945211,
      "lng": -89.616597
    },
    {
      "id": "comite_168",
      "name": "XOCLAN XBECH",
      "tipo": "CAMPO DE FÚTBOL",
      "responsable": "PRESIDENTA: MARIA OYUKI NOVELO ROMERO TESORERA:YANET YASMIN ESPADAS OSALDE SECRETARIA: GLENDY DEL ROSARIO TUN BURGOS VOCAL 2: MARIA TERESA DE JESUS POOL PUC",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.988776,
      "lng": -89.608801
    },
    {
      "id": "comite_169",
      "name": "YUCALPETEN",
      "tipo": "CANCHA DE USOS MULTIPLES",
      "responsable": "PRESIDENTA: BEATRIZ DEL ROCIO ARCEO DIAZ SECRETARIA: ROSA GUADALUPE SALINAS CATZIN TESORERA: KAREN VERONICA BLANCO ESPEJO",
      "categoria": "COMITÉ DEPORTIVO",
      "lat": 20.958214,
      "lng": -89.653705
    }
  ],
  "summary": {
    "units": 10,
    "committees": 169,
    "committeeCount": 133,
    "adminCount": 36,
    "activities": 29
  }
};

const MODULES = [
  {
    "id": "azcorra",
    "name": "Azcorra",
    "status": "ACTIVO",
    "lat": 20.9486,
    "lng": -89.6405,
    "colony": "Azcorra",
    "address": "Calle 18 No. 571 x 71-A esquina, Col. Azcorra",
    "services": [
      "medicos",
      "odonto",
      "enfermeria",
      "mental"
    ],
    "schedule": "Matutino 7:00-14:00 · Vespertino 13:00-20:00 · Lunes a viernes"
  },
  {
    "id": "caucel",
    "name": "Caucel",
    "status": "ACTIVO",
    "lat": 21.008,
    "lng": -89.7019,
    "colony": "Caucel",
    "address": "Calle 22 entre 23 y 21, Comisaría de Caucel",
    "services": [
      "medicos",
      "odonto",
      "enfermeria",
      "mental",
      "nutri",
      "rehab"
    ],
    "schedule": "Matutino 8:00-14:00 · Nocturno 22:00-04:00 · Lunes a viernes"
  },
  {
    "id": "camm",
    "name": "CAMM",
    "status": "ACTIVO",
    "lat": 20.9714,
    "lng": -89.6237,
    "colony": "Centro",
    "address": "Calle 88 #311-D x 141 y 143, Col. EZS I-II",
    "services": [
      "medicos",
      "odonto",
      "enfermeria",
      "rehab",
      "mental",
      "nutri"
    ],
    "schedule": "Matutino 7:00-15:00 · Vespertino 14:00-20:00 · Lunes a viernes"
  },
  {
    "id": "chablekal",
    "name": "Chablekal",
    "status": "ACTIVO",
    "lat": 21.1106,
    "lng": -89.6017,
    "colony": "Chablekal",
    "address": "Calle 17 s/n entre 18 y 14, Chablekal",
    "services": [
      "medicos",
      "odonto",
      "enfermeria"
    ],
    "schedule": "Matutino 7:00-14:00 · Lunes a viernes"
  },
  {
    "id": "chichi_suarez",
    "name": "Chichí Suárez",
    "status": "ACTIVO",
    "lat": 21.0294,
    "lng": -89.5681,
    "colony": "Chichí Suárez",
    "address": "Calle 35 frente al parque, Chichí Suárez",
    "services": [
      "medicos",
      "odonto",
      "enfermeria",
      "mental"
    ],
    "schedule": "Matutino 8:00-14:00 · Psicología viernes 8:00-13:00"
  },
  {
    "id": "cholul",
    "name": "Cholul",
    "status": "ACTIVO",
    "lat": 21.0331,
    "lng": -89.5853,
    "colony": "Cholul",
    "address": "Calle 21 x 20 y 22-A, a espaldas de la comisaría",
    "services": [
      "medicos",
      "odonto",
      "enfermeria",
      "rehab",
      "mental"
    ],
    "schedule": "Matutino 7:00-14:30 · Psicología miércoles 8:00-13:00"
  },
  {
    "id": "crescencio_rejon",
    "name": "M. Crescencio Rejón",
    "status": "ACTIVO",
    "lat": 20.9667,
    "lng": -89.6233,
    "colony": "Centro",
    "address": "Calle 25 No. 589 x 24-A",
    "services": [
      "medicos",
      "enfermeria",
      "mental",
      "nutri"
    ],
    "schedule": "Matutino 8:00-14:00 · Lunes a viernes"
  },
  {
    "id": "emiliano_zapata",
    "name": "Emiliano Zapata Oriente",
    "status": "ACTIVO",
    "lat": 20.9647,
    "lng": -89.5781,
    "colony": "Emiliano Zapata Oriente",
    "address": "Calle 41 s/n x 36 y 38, Emiliano Zapata Oriente",
    "services": [
      "medicos",
      "odonto",
      "enfermeria"
    ],
    "schedule": "Matutino 7:00-14:00 · Lunes a viernes"
  },
  {
    "id": "juan_pablo",
    "name": "Juan Pablo II / El Papa",
    "status": "ACTIVO",
    "lat": 20.9844,
    "lng": -89.6886,
    "colony": "Juan Pablo II",
    "address": "Juan Pablo II / El Papa",
    "services": [
      "medicos",
      "enfermeria"
    ],
    "schedule": "Matutino 7:00-14:00 y 8:00-14:00 · Lunes a viernes"
  },
  {
    "id": "meliton",
    "name": "Melitón Salazar",
    "status": "ACTIVO",
    "lat": 20.9897,
    "lng": -89.6175,
    "colony": "Melitón Salazar",
    "address": "Calle 103 s/n x 64-I y 64-J, Melitón Salazar",
    "services": [
      "medicos",
      "odonto",
      "enfermeria",
      "rehab",
      "mental",
      "nutri"
    ],
    "schedule": "Matutino 8:00-14:00 · Nutrición lunes, miércoles y viernes"
  },
  {
    "id": "mulsay",
    "name": "Mulsay",
    "status": "ACTIVO",
    "lat": 20.9569,
    "lng": -89.6711,
    "colony": "Mulsay",
    "address": "Calle 61 s/n x 114-A y 116, Xoclán Rejas esquina",
    "services": [
      "medicos",
      "odonto",
      "enfermeria",
      "mental"
    ],
    "schedule": "Matutino 8:00-14:00 · Vespertino 14:00-20:00 · Lunes a viernes"
  },
  {
    "id": "molas",
    "name": "Molas",
    "status": "ACTIVO",
    "lat": 20.8853,
    "lng": -89.6086,
    "colony": "Molas",
    "address": "Calle 21 #108 x 22 y 24, Molas",
    "services": [
      "medicos",
      "odonto",
      "enfermeria"
    ],
    "schedule": "Matutino 8:00-14:00 · Lunes a viernes"
  },
  {
    "id": "nora_quintana",
    "name": "Nora Quintana",
    "status": "ACTIVO",
    "lat": 20.9389,
    "lng": -89.6069,
    "colony": "Nora Quintana",
    "address": "C.S.I. Herlinda Sánchez, Calle 140 No. 511 x 61 y 61-A",
    "services": [
      "medicos",
      "odonto",
      "enfermeria"
    ],
    "schedule": "Matutino 7:00-14:00 · Lunes a viernes"
  },
  {
    "id": "salvador_alvarado",
    "name": "Salvador Alvarado Sur",
    "status": "ACTIVO",
    "lat": 20.9456,
    "lng": -89.6217,
    "colony": "Salvador Alvarado Sur",
    "address": "Calle 39-A #329 x 8 y 10, frente al parque",
    "services": [
      "medicos",
      "odonto",
      "enfermeria"
    ],
    "schedule": "Matutino 7:00-14:00 · Lunes a viernes"
  },
  {
    "id": "san_antonio",
    "name": "San Antonio Xluch",
    "status": "ACTIVO",
    "lat": 20.9344,
    "lng": -89.6478,
    "colony": "San Antonio Xluch",
    "address": "Calle 137 #625 x 72 y 74, San Antonio Xluch",
    "services": [
      "medicos",
      "odonto",
      "enfermeria",
      "rehab",
      "mental",
      "nutri"
    ],
    "schedule": "Matutino 7:00-14:00 · Psicología martes a jueves 8:00-13:00"
  },
  {
    "id": "san_jose_tzal",
    "name": "San José Tzal",
    "status": "ACTIVO",
    "lat": 20.8631,
    "lng": -89.6189,
    "colony": "San José Tzal",
    "address": "Calle 23 s/n x 14 y 16, San José Tzal",
    "services": [
      "medicos",
      "odonto",
      "enfermeria",
      "rehab"
    ],
    "schedule": "Matutino 7:00-14:00 / 8:00-14:00 · Lunes a viernes"
  },
  {
    "id": "santa_rosa",
    "name": "Santa Rosa",
    "status": "ACTIVO",
    "lat": 20.9722,
    "lng": -89.6608,
    "colony": "Santa Rosa",
    "address": "Calle 46 s/n x 97 y 95, Santa Rosa",
    "services": [
      "medicos",
      "odonto",
      "enfermeria",
      "rehab",
      "mental",
      "nutri"
    ],
    "schedule": "Matutino 7:00-14:00 · Psicología lunes, miércoles y viernes"
  },
  {
    "id": "sitpach",
    "name": "Sitpach",
    "status": "ACTIVO",
    "lat": 21.0367,
    "lng": -89.5478,
    "colony": "Sitpach",
    "address": "Calle 11 s/n x 8 y 10, al lado de la comisaría",
    "services": [
      "medicos",
      "odonto",
      "enfermeria",
      "mental"
    ],
    "schedule": "Matutino 8:00-14:00 · Psicología jueves 8:00-13:00"
  },
  {
    "id": "porvenir",
    "name": "Porvenir",
    "status": "ACTIVO",
    "lat": 20.9603,
    "lng": -89.6258,
    "colony": "Porvenir",
    "address": "Calle 53 No. 563 x 132 y 132-A, anexo a la iglesia",
    "services": [
      "medicos",
      "enfermeria"
    ],
    "schedule": "Matutino 8:00-14:00 · Lunes a viernes"
  },
  {
    "id": "vergel",
    "name": "Vergel",
    "status": "ACTIVO",
    "lat": 20.9214,
    "lng": -89.6033,
    "colony": "Vergel",
    "address": "Calle 15-B #236 x 10-C y 10-B, Fracc. Vergel I",
    "services": [
      "medicos",
      "odonto",
      "enfermeria",
      "mental",
      "nutri"
    ],
    "schedule": "Matutino 7:00-14:00 / 8:00-14:00 · Psicología lunes y viernes"
  },
  {
    "id": "xoclan",
    "name": "Xoclán",
    "status": "ACTIVO",
    "lat": 20.9786,
    "lng": -89.6731,
    "colony": "Xoclán",
    "address": "Calle 55-B s/n x 132 y 134, Xoclán",
    "services": [
      "medicos",
      "enfermeria"
    ],
    "schedule": "Matutino 7:00-14:00 · Lunes a viernes"
  },
  {
    "id": "xoclan_susula",
    "name": "Xoclán Susulá",
    "status": "ACTIVO",
    "lat": 20.9858,
    "lng": -89.6789,
    "colony": "Xoclán Susulá",
    "address": "Calle 130 s/n x 67-A y 68, Xoclán Susulá",
    "services": [
      "odonto"
    ],
    "schedule": "Matutino 8:00-14:00 · Vespertino 14:00-20:00"
  },
  {
    "id": "renacimiento",
    "name": "Renacimiento",
    "status": "ACTIVO",
    "lat": 20.9853,
    "lng": -89.6692,
    "colony": "Renacimiento",
    "address": "Calle 163 s/n x 76 y 78, Renacimiento",
    "services": [
      "medicos",
      "enfermeria",
      "rehab",
      "mental"
    ],
    "schedule": "Matutino 8:00-14:00 · Rehabilitación, terapia de lenguaje y aprendizaje"
  },
  {
    "id": "almanova_sur",
    "name": "AlmaNova Sur",
    "status": "ACTIVO",
    "lat": 20.9367,
    "lng": -89.6242,
    "colony": "Sur",
    "type": "mental",
    "address": "AlmaNova Sur",
    "services": [
      "mental"
    ],
    "schedule": "Matutino 8:00-14:00 · Vespertino 13:00-20:00 · Lunes a viernes",
    "shortCode": "AN"
  },
  {
    "id": "almanova_pensiones",
    "name": "AlmaNova Pensiones",
    "status": "ACTIVO",
    "lat": 20.9789,
    "lng": -89.6428,
    "colony": "Pensiones",
    "type": "mental",
    "address": "Pensiones, Calle 68 s/n x 5-C y 5-D, Parque Cuchilla",
    "services": [
      "mental"
    ],
    "schedule": "Vespertino 13:00-20:00 · Lunes a viernes",
    "shortCode": "AN"
  },
  {
    "id": "almanova_oriente",
    "name": "AlmaNova Oriente",
    "status": "ACTIVO",
    "lat": 20.9647,
    "lng": -89.5781,
    "colony": "Oriente",
    "type": "mental",
    "address": "Kukulcán, Calle 18 Circuito Colonias x 93-A, frente estación de bomberos",
    "services": [
      "mental"
    ],
    "schedule": "Vespertino 13:00-20:00 · Lunes a viernes",
    "shortCode": "AN"
  },
  {
    "id": "almanova_norte",
    "name": "AlmaNova Norte",
    "status": "ACTIVO",
    "lat": 21.015,
    "lng": -89.6258,
    "colony": "Norte",
    "type": "mental",
    "address": "Águilas, Calle 13 x 8 y 8-A, Edif. Elvia Carrillo",
    "services": [
      "mental"
    ],
    "schedule": "Vespertino 13:00-20:00 · Lunes a viernes",
    "shortCode": "AN"
  },
  {
    "id": "almanova_caucel",
    "name": "AlmaNova Caucel",
    "status": "ACTIVO",
    "lat": 21.008,
    "lng": -89.7019,
    "colony": "Caucel",
    "type": "mental",
    "address": "AlmaNova Caucel",
    "services": [
      "mental"
    ],
    "schedule": "Vespertino 13:00-20:00 · Lunes a viernes",
    "shortCode": "AN"
  }
];
const REPORT_2026_Q1 = { period:'2026-Q1', label:'Enero-Abril 2026', uploadedBy:'Sistema (datos iniciales)', uploadedAt: new Date().toISOString(), fullSummary: { medicos:7433, odonto:3141, enfermeria:29692, rehab:4428, mental:4207, nutri:2516 }, modules: {
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
  const PRIORITY_DATA = {
  "asOf": "30 de abril de 2026",
  "salud": [
    {
      "lbl": "Atenciones médicas totales",
      "num": 55235
    },
    {
      "lbl": "Consultas en módulos médicos",
      "num": 44083
    },
    {
      "lbl": "Consultas en módulos móviles",
      "num": 4826
    },
    {
      "lbl": "Médico a domicilio",
      "num": 6326
    },
    {
      "lbl": "Consultas de odontología",
      "num": 22744
    },
    {
      "lbl": "Rehabilitaciones",
      "num": 33835
    },
    {
      "lbl": "Detecciones y atenciones de enfermería",
      "num": 185097
    },
    {
      "lbl": "Odontología en unidades móviles",
      "num": 5356
    },
    {
      "lbl": "Rehabilitación en unidades móviles",
      "num": 1548
    },
    {
      "lbl": "Enfermería en unidades móviles",
      "num": 75150
    },
    {
      "lbl": "Ferias de salud",
      "num": 424
    },
    {
      "lbl": "Colonias atendidas",
      "num": 299
    },
    {
      "lbl": "Ferias en comisarías",
      "num": 325
    }
  ],

  "mujeres": [
    {
      "lbl": "Consultas en módulos",
      "num": 25766
    },
    {
      "lbl": "Consultas en módulos móviles",
      "num": 2991
    },
    {
      "lbl": "Consultas de ginecología",
      "num": 1188
    },
    {
      "lbl": "Total de mastografías",
      "num": 3004
    },
    {
      "lbl": "CAMM",
      "num": 1083
    },
    {
      "lbl": "Mastógrafo móvil",
      "num": 1921
    },
    {
      "lbl": "DOCMA / exploración mamaria",
      "num": 2617
    },
    {
      "lbl": "DOCMA + Mastografías",
      "num": 5621
    },
    {
      "lbl": "Total de ultrasonidos",
      "num": 1162
    },
    {
      "lbl": "Ultrasonidos en CAMM",
      "num": 884
    },
    {
      "lbl": "Ultrasonidos en mastógrafo móvil",
      "num": 278
    },
    {
      "lbl": "Odontológicas en módulos",
      "num": 13022
    },
    {
      "lbl": "Odontológicas en módulos móviles",
      "num": 3165
    },
    {
      "lbl": "Rehabilitación",
      "num": 21180
    },
    {
      "lbl": "Rehabilitación móvil",
      "num": 1148
    },
    {
      "lbl": "Detecciones y atenciones enfermería",
      "num": 124821
    },
    {
      "lbl": "Enfermería en unidades móviles",
      "num": 42940
    }
  ],

  "mental": [
    {
      "lbl": "Personas atendidas en ALMA NOVA",
      "num": 14758
    },
    {
      "lbl": "Consultas psicológicas",
      "num": 25560
    },
    {
      "lbl": "Beneficiarios en prevención",
      "num": 19273
    },
    {
      "lbl": "Canalizaciones realizadas",
      "num": 272
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
