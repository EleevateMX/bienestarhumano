const fs=require('fs');
const [,, dataJs, jsonPath, outPath] = process.argv;
const src = fs.readFileSync(dataJs,'utf8').split('\n');
const periods = JSON.parse(fs.readFileSync(jsonPath,'utf8'));
const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const KEYS=['medicos','odonto','enfermeria','rehab','mental','nutri'];
const LAST_COMPLETE='2026-08';
const start = src.findIndex(l=>l.startsWith('const INITIAL_PERIODS'));
let end = start; while(!src[end].startsWith('];')) end++;
const lines=[];
lines.push('/* ============================================================');
lines.push('   PERÍODOS MENSUALES REALES');
lines.push('   21 meses extraídos del Excel oficial "MODULOS2025_2" entregado');
lines.push('   por la Dirección: enero 2025 → agosto 2026 completos; septiembre');
lines.push('   2026 parcial (solo Salud Mental capturado al corte).');
lines.push('   Cada período trae `summary` (totales por servicio), `gender`');
lines.push('   (hombres / mujeres, suma de todos los módulos) y `modules`');
lines.push('   (desglose por módulo). Generado automáticamente desde las hojas');
lines.push('   mensuales del Excel; no editar a mano salvo para corregir un dato.');
lines.push('   ============================================================ */');
lines.push('const INITIAL_PERIODS = [');
periods.forEach((p,i)=>{
  const [y,m]=p.period.split('-').map(Number);
  const partial = p.period > LAST_COMPLETE;
  const label = `${MESES[m-1]} ${y}${partial?' (parcial)':''}`;
  const s=KEYS.map(k=>`${k}:${p.summary[k]}`).join(', ');
  lines.push('  {');
  lines.push(`    period: '${p.period}', label: '${label}',${partial?' partial: true,':''}`);
  lines.push(`    uploadedBy: 'Datos oficiales (Excel MODULOS2025_2)', uploadedAt: new Date('${p.period}-15T00:00:00').toISOString(),`);
  lines.push(`    summary: { ${s} },`);
  lines.push(`    gender: { h:${p.gender.h}, m:${p.gender.m} },`);
  lines.push('    modules: {');
  const ids=Object.keys(p.modules).sort();
  ids.forEach((id,j)=>{
    const mm=p.modules[id];
    lines.push(`      ${id}: { ${KEYS.map(k=>`${k}:${mm[k]||0}`).join(', ')} }${j<ids.length-1?',':''}`);
  });
  lines.push('    }');
  lines.push(`  }${i<periods.length-1?',':''}`);
});
lines.push('];');
lines.push('');
lines.push('/* ACUMULADO DE LA ADMINISTRACIÓN (hoja "2024-2027" del Excel):');
lines.push('   del 1 de septiembre de 2024 al corte de septiembre de 2026. */');
lines.push('const ACCUMULATED = {');
lines.push("  from: '1 de septiembre de 2024', to: 'septiembre de 2026',");
lines.push('  summary: { medicos:59151, odonto:29326, enfermeria:200384, rehab:36584, mental:28682, nutri:20826 },');
lines.push('  gender: { h:125818, m:249135 },');
lines.push('  total: 374953,');
lines.push('  byYear: { 2024: 55824, 2025: 194063, 2026: 126402 }  // 2024 = sept-dic · 2026 = ene-sept (corte)');
lines.push('};');
const out=[...src.slice(0,start), ...lines, ...src.slice(end+1)];
// remove the old comment block right before INITIAL_PERIODS (duplicated header)
let text=out.join('\n');
text=text.replace(/\/\* =+\n   PERÍODOS MENSUALES REALES\n   21 meses extraídos del Excel oficial "MODULOS2025" entregado[\s\S]*?=+ \*\/\n(?=\/\* =+\n   PERÍODOS MENSUALES REALES\n   21 meses extraídos del Excel oficial "MODULOS2025_2")/,'');
text=text.replace(`   - 21 períodos mensuales REALES (ene 2025 → sept 2026) extraídos
     del Excel oficial "MODULOS2025"`,`   - 21 períodos mensuales REALES (ene 2025 → ago 2026 completos,
     sept 2026 parcial) extraídos del Excel oficial "MODULOS2025_2"
   - Acumulado de la administración (sept 2024 → sept 2026)`);
fs.writeFileSync(outPath,text);
console.log('ok', lines.length, 'líneas generadas');
