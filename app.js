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

// ── Price Chart ──────────────────────────────────────────
async function loadPriceChart(){
  try{
    const r=await fetch('./data/daily_average_prices.json',{cache:'no-store'});
    if(!r.ok) return;
    const d=await r.json();
    const days=(d.days||[]).filter(x=>x.count>0);
    if(!days.length) return;

    const labels=days.map(x=>x.date);
    const avg=days.map(x=>x.average_price);
    const mn=days.map(x=>x.min_price);
    const mx=days.map(x=>x.max_price);

    $('#priceChartSection').style.display='';
    const last=days[days.length-1];
    const prev=days.length>1?days[days.length-2]:null;
    let trend='';
    if(prev){
      const diff=last.average_price-prev.average_price;
      trend=diff>0?`📈 Naik Rp ${Math.abs(diff).toLocaleString('id-ID')} dari hari sebelumnya`
           :diff<0?`📉 Turun Rp ${Math.abs(diff).toLocaleString('id-ID')} dari hari sebelumnya`
           :'➡️ Sama dengan hari sebelumnya';
    }
    $('#chartMeta').textContent=`Update: ${d.updated_at?new Date(d.updated_at).toLocaleString('id-ID'):'-'} • ${days.length} hari data • ${trend}`;

    // summary table
    const top3=[...days].sort((a,b)=>a.average_price-b.average_price).slice(0,3);
    $('#chartSummary').innerHTML='<h3>🟢 Termurah (rata-rata harian)</h3>'+top3.map(d=>`<p>${d.date}: Rp ${d.average_price.toLocaleString('id-ID')} (${d.count} listing)</p>`).join('');

    const ctx=document.getElementById('priceChart').getContext('2d');
    if(window._priceChart) window._priceChart.destroy();
    window._priceChart=new Chart(ctx,{
      type:'line',
      data:{
        labels,
        datasets:[
          {label:'Rata-rata',data:avg,borderColor:'#2196F3',backgroundColor:'rgba(33,150,243,.1)',tension:.3,fill:true},
          {label:'Min',data:mn,borderColor:'#4CAF50',backgroundColor:'transparent',tension:.3,borderDash:[4,4]},
          {label:'Max',data:mx,borderColor:'#FF9800',backgroundColor:'transparent',tension:.3,borderDash:[4,4]},
        ]
      },
      options:{
        responsive:true,
        plugins:{title:{display:true,text:'Tren Harga Rata-rata XMAX per Hari'}},
        scales:{
          y:{beginAtZero:false,ticks:{callback:v=>'Rp '+(v/1e6).toFixed(1)+'jt'}},
        }
      }
    });
  }catch(e){console.error('price chart',e);}
}
loadPriceChart();