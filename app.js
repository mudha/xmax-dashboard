let DATA=[];
const $=(s)=>document.querySelector(s);

function render(items){
  $('#stats').textContent=`Total tampil: ${items.length}`;
  $('#list').innerHTML=items.map(x=>`<article class="card"><div class="row"><strong>${escapeHtml(x.title||'-')}</strong><span class="src">${x.source}</span></div><div class="row"><span class="price">${escapeHtml(x.price||'-')}</span><span>${escapeHtml(x.location||'-')}</span></div>${x.evaluation?`<div class="eval">${escapeHtml(x.evaluation)}</div>`:''}<a href="${x.link}" target="_blank" rel="noopener">Buka listing</a></article>`).join('') || '<p>Tidak ada data.</p>';
}

function apply(){
  const q=$('#q').value.toLowerCase().trim();
  const s=$('#source').value;
  const out=DATA.filter(x=>{
    if(s && x.source!==s) return false;
    if(!q) return true;
    return `${x.title} ${x.location}`.toLowerCase().includes(q);
  });
  render(out);
}

function escapeHtml(v=''){return v.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));}

async function boot(){
  const r=await fetch('./data/listings.json',{cache:'no-store'});
  const j=await r.json();
  DATA=j.items||[];
  $('#meta').textContent=`Update: ${new Date(j.updated_at).toLocaleString('id-ID')} • Total data: ${j.count||DATA.length}`;
  apply();
}

$('#q').addEventListener('input',apply);
$('#source').addEventListener('change',apply);
boot().catch(e=>{$('#meta').textContent='Gagal memuat data'; console.error(e);});