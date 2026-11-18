'use strict';

// Alle effekter er scenarieantagelser. Ingen af fordelingerne er ansøgerdata.
const BASE = [{lo:2,hi:4,w:4},{lo:4,hi:6,w:53},{lo:6,hi:8,w:188},{lo:8,hi:10,w:101},{lo:10,hi:12,w:12}];
// Konstrueret national reference: 27 % >=10 og gennemsnit 8,8.
// De fire lavere kategorier er vægtet opad ud fra Sambach-fordelingen.
// To nationale nøgletal bestemmer ikke en hel fordeling.
const NATIONAL = [{lo:2,hi:4,w:0.001042336},{lo:4,hi:6,w:0.034100986},{lo:6,hi:8,w:0.298670512},{lo:8,hi:10,w:0.396186166},{lo:10,hi:12,w:0.27}];
const REPS = 3000;
const INTAKES = Array.from({length:11}, (_, i) => 50 + i * 5);
const $ = id => document.getElementById(id);
const fmt = n => n.toFixed(1).replace('.', ',');
const STORE_KEY = 'optagelsessimulator-scenario-v2';
const OLD_STORE_KEY = 'optagelsessimulator-scenario-v1';
function hasOldSaved() { try { return !!localStorage.getItem(OLD_STORE_KEY); } catch { return false; } }
function readSaved() {
  try {
    const s=JSON.parse(localStorage.getItem(STORE_KEY));
    return s && INTAKES.includes(s.intake) && Number.isInteger(s.quota) && s.quota>=0 && s.quota<=50 && Number.isInteger(s.effect) && s.effect>=0 && s.effect<=100 && Number.isInteger(s.applicants) && s.applicants>=40 && s.applicants<=240 ? s : null;
  } catch { return null; }
}
let savedScenario=readSaved();

function quantile(distribution, u) {
  const total = distribution.reduce((sum, bin) => sum + bin.w, 0);
  let remaining = u * total;
  for (const bin of distribution) {
    if (remaining < bin.w) return bin.lo + (remaining / bin.w) * (bin.hi - bin.lo);
    remaining -= bin.w;
  }
  return distribution[distribution.length - 1].hi;
}
function rng(seed) {
  return function() { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
// Faste tilfældige tal sikrer stabile resultater, når indstillingerne ændres.
const uniforms = (() => { const r = rng(20261118); return Array.from({length:REPS}, () => Array.from({length:240}, () => [r(), r()])); })();
function calc(quota, effect, applicants) {
  const pool = applicants;
  const slots = INTAKES.map(n => Math.floor(n * (1 - quota / 100) + 0.5));
  const columns = INTAKES.map(() => []);
  for (const draws of uniforms) {
    const values = [];
    for (let j = 0; j < pool; j++) {
      const [categoryDraw, profileDraw] = draws[j];
      const source = profileDraw < effect / 100 ? NATIONAL : BASE;
      values.push(quantile(source, categoryDraw));
    }
    values.sort((a,b) => b-a);
    slots.forEach((k,i) => { if (k < pool && k > 0) columns[i].push(values[k-1]); });
  }
  const series = columns.map((values, i) => {
    if (!values.length) return {n:INTAKES[i], k:slots[i], valid:false};
    values.sort((a,b) => a-b);
    return {n:INTAKES[i], k:slots[i], valid:true, low:values[Math.floor(REPS*.05)], median:values[Math.floor(REPS*.5)], high:values[Math.floor(REPS*.95)]};
  });
  return {pool, series};
}
function renderChart(base, scenario, selected, saved, savedIntake) {
  const svg = $('chart'), w=720, h=345, left=46, right=18, top=13, bottom=40;
  const shown = [...base.series, ...scenario.series, ...(saved?saved.series:[])].filter(d=>d.valid);
  const maxY = Math.max(9, Math.ceil(Math.max(...shown.map(d=>d.high))));
  const x = n => left+(n-50)/50*(w-left-right);
  const y = n => top+(maxY-n)/(maxY-2)*(h-top-bottom);
  let s = '<title id="chart-title">Karaktergrænse ved forskellige optagsstørrelser</title><desc id="chart-desc">Median for aktuelt og eventuelt gemt scenario samt grundmodel. Båndet viser et modelbaseret 90 procents interval for det aktuelle scenario. Kun optag med konkurrence om karakterpladser vises.</desc>';
  for (let tick=2; tick<=maxY; tick++) s += `<line x1="${left}" y1="${y(tick)}" x2="${w-right}" y2="${y(tick)}" stroke="#e7ece8"/><text x="${left-14}" y="${y(tick)+4}" text-anchor="end" fill="#99a99f" font-size="11">${tick}</text>`;
  for (let tick=50; tick<=100; tick+=10) s += `<text x="${x(tick)}" y="${h-13}" text-anchor="middle" fill="#99a99f" font-size="11">${tick}</text>`;
  const val = scenario.series.filter(d=>d.valid), orig = base.series.filter(d=>d.valid);
  const coords = (data,key) => data.map(d=>`${x(d.n)},${y(d[key])}`).join(' ');
  if (val.length>1) {
    const poly = val.map(d=>`${x(d.n)},${y(d.high)}`).concat([...val].reverse().map(d=>`${x(d.n)},${y(d.low)}`)).join(' ');
    s += `<polygon points="${poly}" fill="#e6815e" opacity="0.13"/>`;
  }
  if (orig.length>1) s += `<polyline points="${coords(orig,'median')}" fill="none" stroke="#afc0b6" stroke-width="2.4" stroke-dasharray="6 5"/>`;
  if (saved) {
    const savedValues=saved.series.filter(d=>d.valid);
    if (savedValues.length>1) s += `<polyline points="${coords(savedValues,'median')}" fill="none" stroke="#4f72a5" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
    const point=savedValues.find(d=>d.n===savedIntake);
    if (point) s += `<circle cx="${x(point.n)}" cy="${y(point.median)}" r="5.5" fill="#4f72a5" stroke="white" stroke-width="2"/>`;
  }
  if (val.length>1) s += `<polyline points="${coords(val,'median')}" fill="none" stroke="#dc7954" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"/>`;
  for (const d of val) s += `<circle cx="${x(d.n)}" cy="${y(d.median)}" r="${d.n===selected?5.5:3}" fill="${d.n===selected?'#dc7954':'white'}" stroke="#dc7954" stroke-width="2"/>`;
  if (!val.length) s += `<text x="${w/2}" y="${h/2}" text-anchor="middle" fill="#6b8173" font-size="14">Ingen konkurrence om karakterpladserne</text>`;
  svg.innerHTML=s;
}
function update() {
  const intake=+$('intake').value, quota=+$('quota').value, effect=+$('attraction').value, applicants=+$('applicants').value;
  $('intake-value').textContent=`${intake} studerende`;
  $('quota-value').textContent=`${quota} %`;
  $('applicants-value').textContent=`${applicants} personer`;
  const pct=(applicants/80-1)*100;
  $('applicants-change').textContent=`${pct>0?'+':''}${fmt(pct)} % i forhold til 80 nuværende optagne. De 80 er ikke et kendt ansøgertal.`;
  $('attraction-value').textContent=`${effect} %`;
  const base=calc(quota,0,applicants), scenario=effect===0?base:calc(quota,effect,applicants);
  const d=scenario.series.find(z=>z.n===intake);
  $('places').textContent=d.k;
  $('pool').textContent=scenario.pool;
  $('estimate').textContent=d.valid?fmt(d.median):'Alle optages';
  $('estimate').style.fontSize=d.valid?'':'32px';
  $('result-label').textContent=d.valid?'Anslået laveste optagne gennemsnit':'Ingen konkurrencebestemt karaktergrænse';
  $('interval').textContent=d.valid?`${fmt(d.low)}–${fmt(d.high)}`:'—';
  $('result-note').textContent=d.valid
    ? `Beregnet ud fra ${d.k} karakterpladser blandt ${scenario.pool} tænkte ansøgere. Kvote 2 antages at komme fra et særskilt felt.`
    : `Med ${d.k} karakterpladser og ${scenario.pool} tænkte ansøgere optages alle i modellen. ${Math.max(0,d.k-scenario.pool)} karakterpladser vil i så fald være ubesatte.`;
  const baseline=base.series.find(z=>z.n===intake);
  const share=100*12/358+(27-100*12/358)*effect/100;
  const baseMean=(4*3+53*5+188*7+101*9+12*11)/358;
  const mean=baseMean+(8.8-baseMean)*effect/100;
  let explanation=`Feltet er ${applicants} uanset tiltrækningseffekt. Med ${effect} % effekt er den tænkte ansøgerprofils gennemsnit ${fmt(mean)} og andelen med mindst 10 ${fmt(share)} %.`;
  if (d.valid && baseline.valid) {
    const difference=d.median-baseline.median;
    explanation+=` Uden effekt: ${fmt(baseline.median)}. ${Math.abs(difference)<0.05 ? 'Ændringen er mindre end 0,05 karakterpoint.' : `Forskel før afrunding: ${difference>0?'+':''}${difference.toFixed(2).replace('.', ',')} karakterpoint.`}`;
  }
  $('effect-note').textContent=explanation;
  let saved=null;
  if (savedScenario) {
    saved=calc(savedScenario.quota,savedScenario.effect,savedScenario.applicants);
    const sd=saved.series.find(z=>z.n===savedScenario.intake);
    $('saved-description').textContent=`Gemt: ${savedScenario.intake} optagne, ${savedScenario.applicants} ansøgere, ${savedScenario.quota} % kvote 2, ${savedScenario.effect} % tiltrækning. Grænse: ${sd.valid?fmt(sd.median):'alle optages'}.`;
  } else $('saved-description').textContent=hasOldSaved()?'Et scenario fra den tidligere model er bevaret i browseren, men kan ikke sammenlignes direkte med den nye model. Gem et nyt scenario her.':'Gem de aktuelle indstillinger, og prøv derefter et andet scenario. Det gemte vises i grafen.';
  $('save-scenario').textContent=savedScenario?'Overskriv gemt scenario':'Gem scenario';
  $('clear-scenario').hidden=!savedScenario;
  $('saved-key').hidden=!savedScenario;
  $('saved-key-label').hidden=!savedScenario;
  renderChart(base,scenario,intake,saved,savedScenario?.intake);
}
let scheduled;
document.querySelectorAll('input').forEach(el=>el.addEventListener('input',()=>{cancelAnimationFrame(scheduled);scheduled=requestAnimationFrame(update);}));
$('reset').addEventListener('click',()=>{$('intake').value=80;$('quota').value=15;$('applicants').value=100;$('attraction').value=5;update();});
$('save-scenario').addEventListener('click',()=>{
  savedScenario={intake:+$('intake').value,quota:+$('quota').value,effect:+$('attraction').value,applicants:+$('applicants').value};
  try { localStorage.setItem(STORE_KEY,JSON.stringify(savedScenario)); } catch { /* Scenariet kan stadig sammenlignes i denne fane. */ }
  update();
});
$('clear-scenario').addEventListener('click',()=>{
  savedScenario=null;
  try { localStorage.removeItem(STORE_KEY); } catch { /* Ingen lokal lagring tilgængelig. */ }
  update();
});
update();
