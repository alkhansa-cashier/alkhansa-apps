/* ============ المحرّك: الأساس ============ */
const VERSION='1.0.0',KEY='kh_pro_'+ED;
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toLatin=s=>String(s==null?'':s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/٫/g,'.');
const num=v=>{const n=parseFloat(toLatin(v).replace(/[^\d.\-]/g,''));return isFinite(n)?n:0};
const fmt=n=>Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2});
const p2=n=>String(n).padStart(2,'0');
const isoD=t=>{const d=new Date(t);return `${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`};
const hm=t=>{const d=new Date(t);return p2(d.getHours())+':'+p2(d.getMinutes())};
const dt=t=>isoD(t)+' '+hm(t);
const today=()=>isoD(Date.now());
const dayMs=864e5,dOf=s=>new Date(s+'T00:00:00').getTime();
const norm=s=>toLatin(String(s||'').toLowerCase()).replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي');
const val=id=>{const e=$('#'+id);return e?String(e.value).trim():''};
const money=v=>fmt(Math.round(v||0))+' '+(S().cur||'ل.س');
const age=b=>{if(!b)return '';const d=new Date(b),n=new Date();let a=n.getFullYear()-d.getFullYear();if(n<new Date(n.getFullYear(),d.getMonth(),d.getDate()))a--;return a>=0&&a<120?a:''};
const fresh=()=>({set:{name:'',phone:'',addr:'',manager:'',cur:'ل.س',logo:'',openH:9,closeH:21,slot:30,loyalN:10,terms:'',footer:'شكراً لثقتكم'},
 clients:[],appts:[],recs:[],svcs:(CFG.svcs||[]).map(([n,p,g,u,r])=>({id:uid(),n,p,g:g||'',u:u||'',r:r||''})),invs:[],pays:[],staff:[],assets:[],cons:[],jobs:[],plans:(CFG.plans||[]).map(([n,d,p])=>({id:uid(),n,d,p})),subs:[],checks:[],exps:[],queue:[],ords:[],sess:[],log:[],seq:{c:0,i:0,r:0,j:0,k:0},ready:false});
let DB;try{DB=Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY)||'{}'));DB.set=Object.assign(fresh().set,DB.set||{});DB.seq=Object.assign(fresh().seq,DB.seq||{})}catch(e){DB=fresh()}
const S=()=>DB.set;
let saveT;function save(){clearTimeout(saveT);saveT=setTimeout(flush,250)}
function flush(){try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){toast('الذاكرة ممتلئة! خذ نسخة احتياطية وخفف الصور',6000)}}
function logA(x){DB.log.unshift({t:Date.now(),x});if(DB.log.length>1000)DB.log.length=1000}
function toast(m,ms){const o=$('.toast');if(o)o.remove();const d=document.createElement('div');d.className='toast';d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),ms||2600)}
const cById=id=>DB.clients.find(x=>x.id===id),stById=id=>DB.staff.find(x=>x.id===id),svById=id=>DB.svcs.find(x=>x.id===id),asById=id=>DB.assets.find(x=>x.id===id);
const cName=id=>{const c=cById(id);return c?c.name:'—'};
const invOf=cid=>DB.invs.filter(i=>i.cid===cid);
const balOf=cid=>Math.round(invOf(cid).reduce((a,i)=>a+i.total,0)-DB.pays.filter(p=>p.cid===cid).reduce((a,p)=>a+p.amt,0));
const inR=(t,a,b)=>t>=a&&t<=b;
function waNum(p){let n=toLatin(p).replace(/\D/g,'');if(n.startsWith('00'))n=n.slice(2);else if(n.startsWith('0'))n='963'+n.slice(1);return n}
function openWA(p,t){window.open(`https://wa.me/${waNum(p||'')}?text=${encodeURIComponent(t)}`,'_blank')}
const I={home:'M3 11l9-8 9 8 M5 10v10h14V10',users:'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 20v-2a4 4 0 0 0-3-3.9 M16 2.1a4 4 0 0 1 0 7.8',cal:'M3 5h18v16H3z M16 3v4 M8 3v4 M3 10h18',money:'M2 6h20v12H2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6',more:'M4 6h16 M4 12h16 M4 18h16',plus:'M12 5v14 M5 12h14',back:'M9 18l6-6-6-6',x:'M18 6L6 18 M6 6l12 12',search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16 M21 21l-4.3-4.3',print:'M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6z',edit:'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',trash:'M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6',wa:'M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5z',check:'M20 6L9 17l-5-5',chart:'M3 3v18h18 M7 15l4-4 3 3 5-6',file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8',star:'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',gear:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M19 12h2 M3 12h2 M12 3v2 M12 19v2 M5.6 5.6l1.4 1.4 M17 17l1.4 1.4 M5.6 18.4L7 17 M17 7l1.4-1.4',tooth:'M7 3c-2 0-4 2-4 5 0 4 2 5 2 8s1 5 2.5 5S9 18 12 18s3 3 4.5 3S19 19 19 16s2-4 2-8c0-3-2-5-4-5-2 0-3 1-5 1S9 3 7 3z',flask:'M9 3h6 M10 3v6L4 19a2 2 0 0 0 1.7 3h12.6A2 2 0 0 0 20 19l-6-10V3',scis:'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M20 4L8.1 15.9 M14.5 14.5L20 20 M8.1 8.1L12 12',car:'M5 17h14 M3 13l2-6h14l2 6v5H3z M7 17v2 M17 17v2 M7 13h.01 M17 13h.01',house:'M3 11l9-8 9 8 M5 10v10h5v-6h4v6h5V10',box:'M21 8l-9-5-9 5v8l9 5 9-5z M3 8l9 5 9-5 M12 13v8',dumb:'M6 6v12 M18 6v12 M3 9v6 M21 9v6 M6 12h12',bell:'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9',down:'M12 3v12 M7 10l5 5 5-5 M5 21h14',up:'M12 21V9 M7 14l5-5 5 5 M5 3h14',clock:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 6v6l4 2',award:'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14 M8.2 13.9L7 23l5-3 5 3-1.2-9.1'};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24"><path d="${I[n]||''}"/></svg>`;
const empty=(i,t,s)=>`<div class="empty">${ic(i)}<div><b>${t}</b></div>${s?`<div>${s}</div>`:''}</div>`;
const seg=(a,cur,items,k)=>`<div class="seg">${items.map(([v,t])=>`<button class="${String(cur)===String(v)?'on':''}" data-a="${a}" data-v="${esc(v)}"${k?` data-k="${k}"`:''}>${t}</button>`).join('')}</div>`;
const av=c=>`<span class="av">${c&&c.photo?`<img src="${c.photo}">`:esc(((c&&c.name)||'?').trim()[0]||'?')}</span>`;
const kpi=(t,v,c,i)=>`<div class="kpi ${c||''}"><small>${ic(i||'chart')}${t}</small><b>${v}</b></div>`;
const stOpts=(sel,all)=>(all?`<option value="">${all}</option>`:'')+DB.staff.map(s=>`<option value="${s.id}" ${s.id===sel?'selected':''}>${esc(s.name)}</option>`).join('');
/* ============ التنقل ============ */
let tab='home';const stack=[];const ui={q:'',ad:today()};
const NAVI={home:['الرئيسية','home'],clients:[L.clP,'users'],appts:['المواعيد','cal'],invs:['الحسابات','money'],more:['المزيد','more'],lab:['التحاليل','flask'],queue:['الدور','scis'],subs:['الاشتراكات','award'],checkin:['الدخول','check'],assets:[L.asP||'',CFG.aI||(ED==='rental'?'car':'house')],cons:[L.conP||'','file'],jobs:[L.jobP||'','box'],staff:[L.stP,'users']};
const NAV=()=>CFG.nav.map(k=>[k,...NAVI[k]]);
function go(name,p,sheet){stack.push({name,p:p||{},sheet:!!sheet});try{history.pushState({n:stack.length},'')}catch(e){}render()}
let skipPop=0;function back(){if(!stack.length)return;stack.pop();skipPop++;try{history.back()}catch(e){skipPop--}render()}
window.addEventListener('popstate',()=>{if(skipPop>0){skipPop--;return}if(stack.length){stack.pop();render()}else if(tab!=='home'){tab='home';render();try{history.pushState({},'')}catch(e){}}});
const top_=()=>stack[stack.length-1];
const head=(t,right,bk)=>`<header class="hd">${bk?`<button class="ib" data-a="back">${ic('back')}</button>`:''}<h1>${esc(t)}</h1>${right||''}</header>`;
const V={},P={},SH={},A={},IN={};
function render(){const app=$('#app');if(!DB.ready&&!stack.length)stack.push({name:'setup',p:{},sheet:false});
 const full=[...stack].reverse().find(x=>!x.sheet),t=top_(),m=$('.main'),sc=m?m.scrollTop:0,key=full?full.name+(full.p.id||''):'t-'+tab,same=app.dataset.v===key;
 let h=`<aside class="side"><div class="brand">${S().logo?`<img src="${S().logo}">`:''}<div><b>${esc(S().name||APPNAME)}</b><small>${esc(APPNAME)}</small></div></div>${NAV().map(([k,n,i])=>`<button class="${!full&&tab===k?'on':''}" data-a="tab" data-v="${k}">${ic(i)}${n}</button>`).join('')}</aside>`;
 h+=full?P[full.name](full.p):V[tab]();
 h+=`<nav class="nav">${NAV().map(([k,n,i])=>`<button class="${!full&&tab===k?'on':''}" data-a="tab" data-v="${k}">${ic(i)}<span>${n}</span></button>`).join('')}</nav>`;
 if(t&&t.sheet)h+=`<div class="shade" data-a="shade"><div class="sheet">${SH[t.name](t.p)}</div></div>`;
 app.innerHTML=h;app.dataset.v=key;if(same){const m2=$('.main');if(m2)m2.scrollTop=sc}
 const f=$('.sheet [data-focus]')||$('[data-focus]');if(f)setTimeout(()=>{try{f.focus()}catch(e){}},60)}
A.tab=d=>{tab=d.v;stack.length=0;render()};A.back=()=>back();A.shade=(d,el,e)=>{if(e.target===el)back()};
A.open=d=>go(d.v,{id:d.id});A.sheet=d=>go(d.v,{id:d.id,k:d.k},true);
A.set=(d,el)=>{ui[d.k]=d.v;if(el)el.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));if(!top_()||!top_().sheet||el.dataset.r)render()};
document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el)return;const f=A[el.dataset.a];if(f){if(el.dataset.a!=='shade'&&el.type!=='checkbox')e.preventDefault();f(el.dataset,el,e)}});
document.addEventListener('input',e=>{const el=e.target.closest('[data-i]');if(el&&IN[el.dataset.i])IN[el.dataset.i](el.value,el)});
document.addEventListener('change',e=>{const el=e.target.closest('[data-c]');if(el){ui[el.dataset.c]=el.value;render()}});
function pickImg(max,cb){const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.8))};im.src=r.result};r.readAsDataURL(f)};i.click()}

/* ============ العملاء ============ */
function clFiltered(){const q=norm(ui.q);return DB.clients.filter(c=>!q||norm(c.name+' '+(c.phone||'')+' '+(c.no||'')+' '+(c.nid||'')).includes(q)).sort((a,b)=>(b.last||b.t)-(a.last||a.t))}
const clLi=c=>{const b=balOf(c.id);return `<button class="li" data-a="open" data-v="client" data-id="${c.id}">${av(c)}<div class="gr"><b>${esc(c.name)}</b><small>${c.no?'رقم '+c.no+' · ':''}${esc(c.phone||'')}${c.birth&&age(c.birth)!==''?' · '+age(c.birth)+' سنة':''}</small></div>${HAS('subs')?subBadge(c.id):''}${b>0?`<span class="badge bad">عليه ${money(b)}</span>`:''}</button>`};
const clList=()=>{const l=clFiltered().slice(0,300);return l.length?l.map(clLi).join(''):empty('users',DB.clients.length?'ما في نتائج':'ما في '+L.clP+' بعد')};
V.clients=()=>head(L.clP)+`<main class="main"><div class="srch">${ic('search')}<input data-i="q" value="${esc(ui.q)}" placeholder="ابحث بالاسم أو الهاتف أو الرقم"></div><div id="cll">${clList()}</div></main><button class="fab" data-a="newcl">${ic('plus')} ${L.cl} جديد</button>`;
IN.q=v=>{ui.q=v;const e=$('#cll');if(e)e.innerHTML=clList()};
A.newcl=()=>{ui.ph='';go('clform',{},true)};
SH.clform=p=>{const c=p.id?cById(p.id):{name:''};if(!ui.ph)ui.ph=c.photo||'';return `<h3>${p.id?'تعديل':L.cl+' جديد'}</h3><div class="prof"><div class="ph" data-a="clph">${ui.ph?`<img src="${ui.ph}">`:ic('plus')}</div><small style="color:var(--mut)">صورة (اختياري)</small></div>
 <label class="f mt">الاسم الكامل *<input id="c_name" value="${esc(c.name)}" data-focus></label>
 <div class="g2">${CFG.cf.map(([k,t,ty])=>ty==='g'?`<label class="f">${t}<select id="c_${k}"><option value="m">ذكر</option><option value="f" ${c[k]==='f'?'selected':''}>أنثى</option></select></label>`:`<label class="f">${t}<input id="c_${k}" ${ty==='date'?'type="date"':ty==='tel'?'inputmode="tel"':''} value="${esc(c[k]||'')}"></label>`).join('')}</div>
 <label class="f">ملاحظات<textarea id="c_notes">${esc(c.notes||'')}</textarea></label><button class="btn pri wide" data-a="clsave" data-id="${p.id||''}">${ic('check')} حفظ</button>${p.id?`<button class="btn bad wide mt" data-a="cldel" data-id="${p.id}">${ic('trash')} حذف</button>`:''}`};
A.clph=()=>pickImg(360,u=>{ui.ph=u;const e=$('.sheet .ph');if(e)e.innerHTML=`<img src="${u}">`});
A.clsave=d=>{const n=val('c_name');if(!n)return toast('اكتب الاسم');const o={name:n,notes:val('c_notes'),photo:ui.ph||''};CFG.cf.forEach(([k])=>o[k]=val('c_'+k));
 let c;if(d.id){c=cById(d.id);Object.assign(c,o)}else{c=Object.assign({id:uid(),no:++DB.seq.c,t:Date.now()},o);DB.clients.push(c);logA(L.cl+' جديد: '+n)}ui.ph='';flush();
 const after=ui.afterCl;ui.afterCl=null;back();if(after)after(c);else if(!d.id)go('client',{id:c.id})};
A.cldel=d=>{const c=cById(d.id);if(!c||!confirm('حذف '+c.name+' مع كل سجلاته؟'))return;DB.clients=DB.clients.filter(x=>x.id!==c.id);['appts','recs','invs','pays','subs','cons'].forEach(k=>DB[k]=DB[k].filter(x=>x.cid!==c.id));flush();stack.length=0;render()};
/* اختيار عميل */
SH.clpick=()=>`<h3>اختيار ${L.cl}</h3><div class="srch">${ic('search')}<input data-i="cp" placeholder="ابحث" data-focus></div><button class="btn wide" data-a="clpnew">${ic('plus')} ${L.cl} جديد</button><div id="cpl" class="mt">${cpList('')}</div>`;
const cpList=q=>{q=norm(q);return DB.clients.filter(c=>!q||norm(c.name+' '+(c.phone||'')).includes(q)).slice(0,40).map(c=>`<button class="li" data-a="clp" data-id="${c.id}">${av(c)}<div class="gr"><b>${esc(c.name)}</b><small>${esc(c.phone||'')}</small></div></button>`).join('')};
IN.cp=v=>{const e=$('#cpl');if(e)e.innerHTML=cpList(v)};
function pickClient(cb){ui.pickCb=cb;go('clpick',{},true)}
A.clp=d=>{const cb=ui.pickCb;back();if(cb)setTimeout(()=>cb(cById(d.id)),30)};
A.clpnew=()=>{const cb=ui.pickCb;back();ui.afterCl=c=>setTimeout(()=>cb&&cb(c),30);setTimeout(()=>{ui.ph='';go('clform',{},true)},20)};
/* نهاية k2.js */
