'use strict';

// Alle effekter er scenarieantagelser. Ingen af fordelingerne er ansøgerdata.
const BASE = [{lo:2,hi:4,w:4},{lo:4,hi:6,w:53},{lo:6,hi:8,w:188},{lo:8,hi:10,w:101},{lo:10,hi:12,w:12}];
// Et tænkt referencefelt: 27 % på 10+, samme relative fordeling under 10.
// Det er ikke den fulde nationale fordeling.
const NATIONAL = [{lo:2,hi:4,w:4},{lo:4,hi:6,w:53},{lo:6,hi:8,w:188},{lo:8,hi:10,w:101},{lo:10,hi:12,w:346*0.27/0.73}];
const REPS = 3000;
const INTAKES = Array.from({length:11}, (_, i) => 50 + i * 5);
const $ = id => document.getElementById(id);
const fmt = n => n.toFixed(1).replace('.', ',');

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
const uniforms = (() => { const r = rng(20261118); return Array.from({length:REPS}, () => Array.from({length:120}, () => [r(), r()])); })();
function calc(quota, effect, mode) {
  const pool = mode === 'count' ? Math.round(80 * (1 + effect / 100)) : 80;
  const slots = INTAKES.map(n => Math.floor(n * (1 - quota / 100) + 0.5));
  const columns = INTAKES.map(() => []);
  for (const draws of uniforms) {
    const values = [];
    for (let j = 0; j < pool; j++) {
      const [categoryDraw, profileDraw] = draws[j];
      const source = mode === 'profile' && profileDraw < effect / 100 ? NATIONAL : BASE;
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
function renderChart(base, scenario, selected) {
  const svg = $('chart'), w=720, h=345, left=46, right=18, top=13, bottom=40;
  const x = n => left+(n-50)/50*(w-left-right);
  const y = n => top+(9-n)/7*(h-top-bottom);
  let s = '<title id="chart-title">Karaktergrænse ved forskellige optagsstørrelser</title><desc id="chart-desc">Median for scenario og grundmodel. Båndet viser et modelbaseret 90 procents interval. Kun optag med konkurrence om karakterpladser vises.</desc>';
  for (let tick=2; tick<=9; tick++) s += `<line x1="${left}" y1="${y(tick)}" x2="${w-right}" y2="${y(tick)}" stroke="#e7ece8"/><text x="${left-14}" y="${y(tick)+4}" text-anchor="end" fill="#99a99f" font-size="11">${tick}</text>`;
  for (let tick=50; tick<=100; tick+=10) s += `<text x="${x(tick)}" y="${h-13}" text-anchor="middle" fill="#99a99f" font-size="11">${tick}</text>`;
  const val = scenario.series.filter(d=>d.valid), orig = base.series.filter(d=>d.valid);
  const coords = (data,key) => data.map(d=>`${x(d.n)},${y(d[key])}`).join(' ');
  if (val.length>1) {
    const poly = val.map(d=>`${x(d.n)},${y(d.high)}`).concat([...val].reverse().map(d=>`${x(d.n)},${y(d.low)}`)).join(' ');
    s += `<polygon points="${poly}" fill="#e6815e" opacity="0.13"/>`;
  }
  if (orig.length>1) s += `<polyline points="${coords(orig,'median')}" fill="none" stroke="#afc0b6" stroke-width="2.4" stroke-dasharray="6 5"/>`;
  if (val.length>1) s += `<polyline points="${coords(val,'median')}" fill="none" stroke="#dc7954" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"/>`;
  for (const d of val) s += `<circle cx="${x(d.n)}" cy="${y(d.median)}" r="${d.n===selected?5.5:3}" fill="${d.n===selected?'#dc7954':'white'}" stroke="#dc7954" stroke-width="2"/>`;
  if (!val.length) s += `<text x="${w/2}" y="${h/2}" text-anchor="middle" fill="#6b8173" font-size="14">Ingen konkurrence om karakterpladserne</text>`;
  svg.innerHTML=s;
}
function update() {
  const intake=+$('intake').value, quota=+$('quota').value, effect=+$('attraction').value;
  const mode=document.querySelector('input[name="mode"]:checked').value;
  $('intake-value').textContent=`${intake} studerende`;
  $('quota-value').textContent=`${quota} %`;
  $('attraction-value').textContent=`${effect} %`;
  const base=calc(quota,0,'count'), scenario=effect===0?base:calc(quota,effect,mode);
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
  renderChart(base,scenario,intake);
}
let scheduled;
document.querySelectorAll('input').forEach(el=>el.addEventListener('input',()=>{cancelAnimationFrame(scheduled);scheduled=requestAnimationFrame(update);}));
$('reset').addEventListener('click',()=>{$('intake').value=80;$('quota').value=15;$('attraction').value=5;document.querySelector('input[name="mode"][value="count"]').checked=true;update();});
update();
