const HOURS = [
  {k:"readings", n:"Office of Readings", t:"any hour"},
  {k:"lauds",    n:"Lauds",             t:"morning"},
  {k:"daytime",  n:"Daytime Prayer",    t:"midday"},
  {k:"vespers",  n:"Vespers",           t:"evening"},
  {k:"compline", n:"Compline",          t:"night"}
];
const COMPLINE = {0:[4,134],1:[86],2:[143],3:[31,130],4:[16],5:[88],6:[4,134]};
let P={}, C={}, T={}, hour=null, week=1;

const pad=n=>String(n).padStart(3,"0");

function pickHour(){
  const h=new Date().getHours();
  if(h>=4&&h<9) return "lauds";
  if(h>=9&&h<17) return "daytime";
  if(h>=17&&h<21) return "vespers";
  return "compline";
}
function psalmBlock(num){
  const p=P[num];
  const head=`<div class="psalm"><h3>Psalm ${num}</h3>`;
  if(!p) return head+`<p class="warn">Text not bundled.</p></div>`;
  const verses=p.verses.map(v=>`<div class="verse"><span class="n">${v.v}</span>${v.t}</div>`).join("");
  return head+`<p class="att">${p.ref}</p>${verses}</div>`;
}
function canticleBlock(key,title){
  const c=C[key]; if(!c) return "";
  const verses=c.verses.map(v=>`<div class="verse"><span class="n">${v.v}</span>${v.t}</div>`).join("");
  return `<div class="psalm"><h3>${title}</h3><p class="att">${c.ref}</p>${verses}</div>`;
}
function render(){
  const day=new Date().getDay();
  const h=HOURS.find(x=>x.k===hour);
  document.getElementById("sub").textContent =
    `${h.n} — ${new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})} · Week ${["I","II","III","IV"][week-1]}`;
  let nums = hour==="compline" ? (COMPLINE[day]||[4]) : (T[`${week}|${day}|${hour}`]||[]);
  let html=`<section><h2>${h.n}</h2><p class="note">${h.t} · ${nums.length} psalm${nums.length===1?"":"s"}</p>`;
  html+=`<div class="prayer">O God, come to my assistance. O Lord, make haste to help me.<br>Glory be to the Father, and to the Son, and to the Holy Spirit.</div>`;
  if(!nums.length) html+=`<p class="warn">No psalms assigned in the table for this hour and week.</p>`;
  nums.forEach(n=>{ html+=psalmBlock(n); });
  if(hour==="lauds") html+=canticleBlock("benedictus","The Benedictus");
  if(hour==="vespers") html+=canticleBlock("magnificat","The Magnificat");
  if(hour==="compline") html+=canticleBlock("nunc-dimittis","The Nunc Dimittis");
  html+=`<div class="prayer">Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.</div>`;
  html+=`</section>`;
  document.getElementById("out").innerHTML=html;
  document.querySelectorAll("#hours button").forEach(b=>b.classList.toggle("on",b.dataset.h===hour));
  document.querySelectorAll("#weekrow button").forEach(b=>b.classList.toggle("on",+b.dataset.w===week));
}
async function init(){
  const [p,c,t]=await Promise.all([
    fetch("psalms.json").then(r=>r.json()),
    fetch("canticles.json").then(r=>r.json()),
    fetch("psalter.json").then(r=>r.json())
  ]);
  P=p;C=c;T=t;
  const nav=document.getElementById("hours");
  nav.innerHTML=HOURS.map(h=>`<button data-h="${h.k}">${h.n}</button>`).join("");
  nav.querySelectorAll("button").forEach(b=>b.onclick=()=>{hour=b.dataset.h;render();});
  document.querySelectorAll("#weekrow button").forEach(b=>b.onclick=()=>{week=+b.dataset.w;render();});
  hour=pickHour(); render();
}
init();
