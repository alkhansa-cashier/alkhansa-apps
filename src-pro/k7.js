/* ============ جلسات الأجهزة بالساعة (صالات الألعاب) ============ */
NAVI.sess=['الجلسات','clock'];
const ssOn=a=>DB.sess.find(s=>s.aid===a.id&&!s.end);
const ssRate=(s,a)=>s.mode==='m'?(+a.rate2||+a.rate||0):(+a.rate||0);
const ssMin=s=>Math.max(1,Math.ceil(((s.end||Date.now())-s.t)/60000));
const ssTime=s=>Math.ceil(ssMin(s)/60*s.rate/500)*500;
const ssEx=s=>(s.ex||[]).reduce((a,x)=>a+x.p*x.q,0);
const ssClock=m=>Math.floor(m/60)+':'+String(m%60).padStart(2,'0');
V.sess=()=>{const t0=dOf(today()),dn=DB.sess.filter(s=>s.end&&s.end>=t0),inc=dn.reduce((a,s)=>a+s.tot,0),on=DB.assets.filter(a=>ssOn(a)).length;
 return head('الجلسات')+`<main class="main"><div class="g3w">${kpi('شغّالة',on+' / '+DB.assets.length,'blue','clock')}${kpi('جلسات اليوم',dn.length,'','check')}${kpi('دخل اليوم',money(inc),'ok','money')}</div>
 <div class="gdev">${DB.assets.map(a=>{const s=ssOn(a);if(a.st==='mnt')return `<div class="card dev off"><b>${esc(a.name||a.type||'')}</b><small>بالصيانة</small></div>`;
  return s?`<div class="card dev on"><b>${esc(a.name||'')}</b><div class="big">${ssClock(ssMin(s))}</div><small>${s.mode==='m'?'رباعي':'عادي'} · ${money(ssTime(s)+ssEx(s))}</small><div class="row"><button class="btn sm" data-a="sheet" data-v="ssex" data-id="${s.id}">${ic('plus')} طلبات</button><button class="btn sm pri" data-a="ssstop" data-id="${s.id}">إنهاء</button></div></div>`
  :`<div class="card dev"><b>${esc(a.name||'')}</b><small>${esc(a.type||'')} · ${money(a.rate||0)} / ساعة</small><div class="row"><button class="btn sm pri" data-a="ssgo" data-id="${a.id}" data-v="s">▶ عادي</button>${a.rate2?`<button class="btn sm" data-a="ssgo" data-id="${a.id}" data-v="m">▶ رباعي</button>`:''}</div></div>`}).join('')||empty('clock','أضف الأجهزة من تبويب '+(L.asP||'الأجهزة'))}</div>
 ${dn.length?`<div class="card mt"><h3>${ic('check')}جلسات اليوم</h3>${dn.slice().reverse().slice(0,40).map(s=>`<div class="kv"><span>${esc((asById(s.aid)||{}).name||'')} · ${ssClock(ssMin(s))} · ${isoT(s.t)}</span><b>${money(s.tot)}</b></div>`).join('')}</div>`:''}</main>`};
const isoT=t=>{const d=new Date(t);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
A.ssgo=d=>{const a=asById(d.id);if(!a||ssOn(a))return;const s={id:uid(),aid:a.id,t:Date.now(),mode:d.v,ex:[]};s.rate=ssRate(s,a);DB.sess.push(s);a.st='out';flush();render();toast('بدأت الجلسة ▶')};
SH.ssex=p=>{const s=DB.sess.find(x=>x.id===p.id);return `<h3>طلبات على ${esc((asById(s.aid)||{}).name||'')}</h3>${DB.svcs.map(v=>`<button class="li" data-a="ssadd" data-id="${s.id}" data-v="${v.id}"><div class="gr"><b>${esc(v.n)}</b></div><b>${money(v.p)}</b></button>`).join('')}
 ${(s.ex||[]).length?`<div class="card mt">${s.ex.map((x,i)=>`<div class="kv"><span>${esc(x.n)} × ${x.q}</span><button class="btn sm" data-a="ssrm" data-id="${s.id}" data-v="${i}">حذف</button></div>`).join('')}</div>`:''}<button class="btn wide mt" data-a="back">تم</button>`};
A.ssadd=d=>{const s=DB.sess.find(x=>x.id===d.id),v=svById(d.v);const e=s.ex.find(x=>x.n===v.n);e?e.q++:s.ex.push({n:v.n,p:v.p,q:1});flush();render();toast('+ '+v.n)};
A.ssrm=d=>{const s=DB.sess.find(x=>x.id===d.id);s.ex.splice(+d.v,1);flush();render()};
A.ssstop=d=>{const s=DB.sess.find(x=>x.id===d.id);if(!s||s.end)return;s.end=Date.now();const a=asById(s.aid),m=ssMin(s);s.tot=ssTime(s)+ssEx(s);
 const items=[{n:`${a?a.name:''} ${ssClock(m)} ساعة${s.mode==='m'?' (رباعي)':''}`,p:ssTime(s),q:1},...(s.ex||[]).map(x=>({n:x.n,p:x.p,q:x.q}))];s.iid=addInvoice('',items,0,s.tot,ui.pm||'cash').id;if(a)a.st='free';flush();render();toast(`انتهت الجلسة: ${money(s.tot)}`)};
setInterval(()=>{if(tab==='sess'&&!stack.length&&!$('input:focus'))render()},30000);
/* نهاية k7.js */
