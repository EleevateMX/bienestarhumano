import sys, json, re, openpyxl, unicodedata
wb = openpyxl.load_workbook(sys.argv[1], data_only=True)

SHEETS = [
 ('2025-01','ENE'),('2025-02','FEB'),('2025-03','MARZ'),('2025-04','ABRL'),('2025-05','MAY'),('2025-06','JUN'),
 ('2025-07','JUL'),('2025-08','AGOS'),('2025-09','SEPT'),('2025-10','OCT'),('2025-11','NOV'),('2025-12','DIC'),
 ('2026-01','ENE26'),('2026-02','FEB26'),('2026-03','MAR26'),('2026-04','ABR26'),('2026-05','MAYO26'),('2026-06','JUN26'),
 ('2026-07','JUL26'),('2026-08','AGO26'),('2026-09','sept2026'),
]
def norm(s):
    s = unicodedata.normalize('NFKD', str(s)).encode('ascii','ignore').decode().upper()
    s = re.sub(r'\(.*?\)','',s)   # quita paréntesis
    return re.sub(r'\s+',' ',s).strip()

NAME2ID = {
 'AGUILAS':'aguilas','AZCORRA MATUTINO':'azcorra_mat','AZCORRA VESPERTINO':'azcorra_vesp',
 'CAMM MATUTINO':'camm_mat','CAMM VESPERTINO':'camm_vesp','CAUCEL':'caucel','CHABLEKAL':'chablekal',
 'CHICHI SUAREZ':'chichi_suarez','CHOLUL':'cholul','EMILIANO ZAPATA ORIENTE':'emiliano_zapata',
 'JUAN PABLO':'juan_pablo','KUKULCAN MATUTINO':'kukulcan_mat','KUKULCAN VESPERTINO':'kukulcan_vesp',
 'MELITON SALAZAR MATUTINO':'meliton_mat','MELITON SALAZAR VESPERTINO':'meliton_vesp','MOLAS':'molas',
 'MULSAY MATUTINO':'mulsay_mat','MULSAY VESPERTINO':'mulsay_vesp','NORA QUINTANA MATUTINO':'nora_quintana_mat',
 'NORA QUINTANA VESPERTINO':'nora_quintana_vesp','PENSIONES':'pensiones','PLAN DE AYALA SUR':'plan_ayala',
 'PORVENIR':'porvenir','RENACIMIENTO':'renacimiento','SALVADOR ALVARADO SUR':'salvador_alvarado',
 'SAN ANTONIO XLUCH':'san_antonio','SAN JOSE TZAL':'san_jose_tzal','SANTA ROSA':'santa_rosa',
 'SANTA ROSA':'santa_rosa','SITPACH':'sitpach','VERGEL':'vergel','XOCLAN CARMELITAS':'xoclan_carmelitas',
 'XOCLAN SUSULA MAT':'xoclan_susula_dental','XOCLAN SUSULA VESP':'xoclan_susula_vesp',
 'XOCLAN SUSULA':'xoclan_susula_dental','XOCLAN SUSULA VESPERTINO':'xoclan_susula_vesp',
 'ALMA NOVA SUR':'almanova_sur','ALMA NOVA PENSIONES':'almanova_pensiones','ALMA NOVA ORIENTE':'almanova_oriente',
 'ALMA NOVA NORTE':'almanova_norte','ALMA NOVA CAUCEL':'almanova_caucel','CEMANUD':'cemanud',
 'MEDICO A DOMICILIO':'medico_domicilio','FERIAS Y BRIGADAS':'ferias','CRUZ ROJA':'cruz_roja',
 'SARA MENA':'sara_mena','COMISARIAS':'comisarias','M. CRESCENCIO REJON':'crescencio_rejon',
}
def to_id(raw):
    n = norm(raw)
    if 'PEDIATRIA' in str(raw).upper(): return 'santa_rosa_ped'
    if n in NAME2ID: return NAME2ID[n]
    return None

# columnas: (H, M, TOTAL)
COLS = {'medicos':(3,4,5),'odonto':(6,7,8),'enfermeria':(9,10,11),'rehab':(12,13,14),'mental':(16,17,18),'nutri':(19,20,21)}
TOT = (22,23,24)
def num(v):
    if v is None or v=='': return 0
    try: return int(round(float(v)))
    except: return 0

out=[]; warnings=[]
for period, sheet in SHEETS:
    ws = wb[sheet]
    modules={}; gender={'h':0,'m':0}; summary={k:0 for k in COLS}; unknown=[]
    seg = 0
    excel_total_row=None
    for r in range(3, 80):
        raw = ws.cell(r,2).value
        if raw is None:
            has_x = ws.cell(r,24).value is not None and ws.cell(r,25).value is not None
            has_any = any(isinstance(ws.cell(r,c).value,(int,float)) and ws.cell(r,c).value for c in range(3,22))
            if has_x:
                excel_total_row = r; break
            if has_any and 'comisarias' not in modules:
                s = 'COMISARIAS'; warnings.append(f'{sheet}: fila {r} sin nombre asignada a COMISARIAS')
            else:
                continue
        else:
            s = str(raw).strip()
        if s.upper().startswith('TOTAL'):
            excel_total_row = r; break
        mid = to_id(s)
        if not mid:
            unknown.append(s); continue
        m={}
        for k,(h,mm,t) in COLS.items():
            tv = num(ws.cell(r,t).value)
            hv, mv = num(ws.cell(r,h).value), num(ws.cell(r,mm).value)
            if tv==0 and (hv or mv): tv = hv+mv
            m[k]=tv
            summary[k]+=tv
        seg += num(ws.cell(r,15).value)
        # Hombres/Mujeres: suma de las columnas H/M de cada servicio (las columnas
        # V/W/X "Total consultas" tienen fórmulas desfasadas en algunas hojas).
        th = sum(num(ws.cell(r,c[0]).value) for c in COLS.values())
        tm = sum(num(ws.cell(r,c[1]).value) for c in COLS.values())
        if th+tm != sum(m.values()):
            warnings.append(f'{sheet}: {s} H+M={th+tm} != total={sum(m.values())}')
        gender['h']+=th; gender['m']+=tm
        if mid in modules: warnings.append(f'{sheet}: id duplicado {mid} ({s})')
        modules[mid]=m
    # fila total del Excel para validar
    xl_tot=None
    if excel_total_row:
        xl_tot = {k: num(ws.cell(excel_total_row,c[2]).value) for k,c in COLS.items()}
        xl_tot['total']=num(ws.cell(excel_total_row,TOT[2]).value)
    out.append({'period':period,'sheet':sheet,'summary':summary,'gender':gender,'modules':modules,'xl_total':xl_tot,'unknown':unknown,'seguimiento':seg})
json.dump(out, open(sys.argv[2],'w'), ensure_ascii=False, indent=1)
for p in out:
    tot=sum(p['summary'].values())
    flag = ''
    if p['xl_total']:
        xs = {k:v for k,v in p['xl_total'].items() if k!='total'}
        if xs!=p['summary'] or p['xl_total']['total']!=tot: flag=f'  !! EXCEL dice {p["xl_total"]}'
    print(p['period'], p['sheet'], 'n_mod', len(p['modules']), 'sum', p['summary'], 'TOTAL', tot, 'gen', p['gender'], 'unk', p['unknown'], flag)
print('WARN', warnings)
