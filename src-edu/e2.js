/* ============ الخنساء للتعليم: الأساس ============ */
const ED='__ED__',Q=ED==='quran',VERSION='1.0.0';
const APPNAME=Q?'الخنساء للمعاهد والحلقات':'الخنساء لإدارة المدارس';
const L=Q?{cls:'حلقة',clsP:'الحلقات',tch:'الأستاذ',tchP:'الأساتذة',stu:'طالب',stuP:'الطلاب',fees:'الاشتراكات'}:{cls:'صف',clsP:'الصفوف',tch:'المعلم',tchP:'الكادر التدريسي',stu:'طالب',stuP:'الطلاب',fees:'الأقساط'};
const KEY='kh_edu_'+ED;
const SURAS='الفاتحة البقرة آل_عمران النساء المائدة الأنعام الأعراف الأنفال التوبة يونس هود يوسف الرعد إبراهيم الحجر النحل الإسراء الكهف مريم طه الأنبياء الحج المؤمنون النور الفرقان الشعراء النمل القصص العنكبوت الروم لقمان السجدة الأحزاب سبأ فاطر يس الصافات ص الزمر غافر فصلت الشورى الزخرف الدخان الجاثية الأحقاف محمد الفتح الحجرات ق الذاريات الطور النجم القمر الرحمن الواقعة الحديد المجادلة الحشر الممتحنة الصف الجمعة المنافقون التغابن الطلاق التحريم الملك القلم الحاقة المعارج نوح الجن المزمل المدثر القيامة الإنسان المرسلات النبأ النازعات عبس التكوير الانفطار المطففين الانشقاق البروج الطارق الأعلى الغاشية الفجر البلد الشمس الليل الضحى الشرح التين العلق القدر البينة الزلزلة العاديات القارعة التكاثر العصر الهمزة الفيل قريش الماعون الكوثر الكافرون النصر المسد الإخلاص الفلق الناس'.split(' ').map(s=>s.replace(/_/g,' '));
const AYAT=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const GRADES=['ممتاز','جيد جداً','جيد','مقبول','يعاد'];
const DOCS_S=['صورة شخصية','شهادة ميلاد / قيد نفوس','صورة دفتر العائلة','صورة هوية الولي','بطاقة اللقاح','وثيقة نقل / تسلسل','الجلاء السابق','تعهد ولي الأمر'];
const DOCS_Q=['صورة شخصية','صورة هوية الولي','موافقة ولي الأمر'];
const SUBJ=['التربية الإسلامية','اللغة العربية','الرياضيات','العلوم','اللغة الإنكليزية','الاجتماعيات','الفيزياء والكيمياء','اللغة الفرنسية','التربية الفنية','التربية الرياضية','المعلوماتية'];
const DAYS=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','السبت'];

const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toLatin=s=>String(s==null?'':s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/٫/g,'.');
const num=v=>{const n=parseFloat(toLatin(v).replace(/[^\d.\-]/g,''));return isFinite(n)?n:0};
const fmt=n=>Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2});
const p2=n=>String(n).padStart(2,'0');
const isoD=t=>{const d=new Date(t);return `${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`};
const dt=t=>{const d=new Date(t);return `${isoD(t)} ${p2(d.getHours())}:${p2(d.getMinutes())}`};
const today=()=>isoD(Date.now());
const norm=s=>toLatin(String(s||'').toLowerCase()).replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي');
const val=id=>{const e=$('#'+id);return e?String(e.value).trim():''};
const money=v=>fmt(Math.round(v||0))+' '+(S().cur||'ل.س');
const age=b=>{if(!b)return '';const d=new Date(b),n=new Date();let a=n.getFullYear()-d.getFullYear();if(n<new Date(n.getFullYear(),d.getMonth(),d.getDate()))a--;return a>=0&&a<100?a:''};

const fresh=()=>({set:{name:'',phone:'',addr:'',manager:'',year:(new Date().getFullYear())+'-'+(new Date().getFullYear()+1),cur:'ل.س',logo:'',terms:['الفصل الأول','الفصل الثاني'],periods:Q?3:7,days:Q?['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس']:DAYS.slice(0,5),docs:Q?DOCS_Q:DOCS_S,feesOn:!Q,pass:50},
 classes:[],students:[],teachers:[],att:{},exams:[],marks:{},pays:[],tpays:[],exps:[],tt:{},hifz:[],tests:[],log:[],seq:0,rseq:0,ready:false});
let DB;try{DB=Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY)||'{}'));DB.set=Object.assign(fresh().set,DB.set||{})}catch(e){DB=fresh()}
const S=()=>DB.set;
let saveT;function save(){clearTimeout(saveT);saveT=setTimeout(flush,250)}
function flush(){try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){toast('الذاكرة ممتلئة! خفف الصور أو خذ نسخة احتياطية',6000)}}
function logA(x){DB.log.unshift({t:Date.now(),x});if(DB.log.length>800)DB.log.length=800}
function toast(m,ms){const o=$('.toast');if(o)o.remove();const d=document.createElement('div');d.className='toast';d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),ms||2600)}

const stuById=id=>DB.students.find(s=>s.id===id);
const clsById=id=>DB.classes.find(c=>c.id===id);
const tchById=id=>DB.teachers.find(t=>t.id===id);
const clsName=id=>{const c=clsById(id);return c?c.name:'بدون '+L.cls};
const active=()=>DB.students.filter(s=>s.status!=='left');
const inCls=cid=>active().filter(s=>s.cid===cid).sort((a,b)=>a.name.localeCompare(b.name,'ar'));
/* الأقساط */
const feeOf=s=>{const c=clsById(s.cid);const f=s.fee!=null&&s.fee!==''?+s.fee:(c?+c.fee||0:0);return Math.max(0,f-(+s.disc||0))};
const paidOf=sid=>DB.pays.filter(p=>p.sid===sid).reduce((a,p)=>a+p.amt,0);
const dueOf=s=>Math.max(0,feeOf(s)-paidOf(s.id));
/* الحضور */
const attKey=(d,cid)=>d+'|'+cid;
function attStats(sid){let p=0,a=0,l=0,e=0;for(const [k,v] of Object.entries(DB.att)){const x=v[sid];if(x==='p')p++;else if(x==='a')a++;else if(x==='l')l++;else if(x==='e')e++}return {p,a,l,e,n:p+a+l+e}}
/* الحفظ */
const hifzOf=sid=>DB.hifz.filter(h=>h.sid===sid).sort((a,b)=>b.t-a.t);
const pagesOf=sid=>DB.hifz.filter(h=>h.sid===sid&&h.type==='h').reduce((a,h)=>a+(+h.pages||0),0);
const juzOf=sid=>Math.min(30,Math.round(pagesOf(sid)/20*10)/10);
const posTxt=h=>h?`${SURAS[h.s2]||''} ${h.a2||''}`:'—';

const I={home:'M3 11l9-8 9 8 M5 10v10h14V10',users:'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 20v-2a4 4 0 0 0-3-3.9 M16 2.1a4 4 0 0 1 0 7.8',cls:'M3 4h18v12H3z M8 20h8 M12 16v4',check:'M20 6L9 17l-5-5',chart:'M3 3v18h18 M7 15l4-4 3 3 5-6',money:'M2 6h20v12H2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M6 12h.01 M18 12h.01',
 tch:'M12 3L1 9l11 6 9-4.9V17 M5 11.5V16c0 1.7 3.1 3 7 3s7-1.3 7-3v-4.5',more:'M4 6h16 M4 12h16 M4 18h16',plus:'M12 5v14 M5 12h14',back:'M9 18l6-6-6-6',x:'M18 6L6 18 M6 6l12 12',search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16 M21 21l-4.3-4.3',print:'M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6z',
 edit:'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',trash:'M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6',wa:'M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5z',cal:'M3 5h18v16H3z M16 3v4 M8 3v4 M3 10h18',book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
 gear:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
 file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8',card:'M2 5h20v14H2z M6 10h4 M6 14h8 M15 9h3v4h-3z',award:'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14 M8.2 13.9L7 23l5-3 5 3-1.2-9.1',star:'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',down:'M12 3v12 M7 10l5 5 5-5 M5 21h14',up:'M12 21V9 M7 14l5-5 5 5 M5 3h14',bell:'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.7 21a2 2 0 0 1-3.4 0'};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24"><path d="${I[n]||''}"/></svg>`;
const empty=(i,t,s)=>`<div class="empty">${ic(i)}<div><b>${t}</b></div>${s?`<div>${s}</div>`:''}</div>`;
const seg=(a,cur,items,k)=>`<div class="seg">${items.map(([v,t])=>`<button class="${String(cur)===String(v)?'on':''}" data-a="${a}" data-v="${esc(v)}"${k?` data-k="${k}"`:''}>${t}</button>`).join('')}</div>`;
const avatar=s=>`<span class="av">${s.photo?`<img src="${s.photo}" alt="">`:esc((s.name||'?').trim()[0]||'?')}</span>`;
const clsOpts=(sel,all)=>(all?`<option value="">${all}</option>`:'')+DB.classes.map(c=>`<option value="${c.id}" ${c.id===sel?'selected':''}>${esc(c.name)}</option>`).join('');

/* ============ التنقل ============ */
let tab='home';const stack=[];const ui={q:'',cf:'',ad:today(),ac:'',ec:'',fc:'',fq:'',hc:''};
const NAV=()=>[['home','الرئيسية','home'],['stu',L.stuP,'users'],['att','الحضور','check'],Q?['hifz','الحفظ','book']:['grades','العلامات','chart'],...(S().feesOn?[['fees',L.fees,'money']]:[]),['more','المزيد','more']];
function go(name,p,sheet){stack.push({name,p:p||{},sheet:!!sheet});try{history.pushState({n:stack.length},'')}catch(e){}render()}
let skipPop=0;function back(){if(!stack.length)return;stack.pop();skipPop++;try{history.back()}catch(e){skipPop--}render()}
window.addEventListener('popstate',()=>{if(skipPop>0){skipPop--;return}if(stack.length){stack.pop();render()}else if(tab!=='home'){tab='home';render();try{history.pushState({},'')}catch(e){}}});
const top_=()=>stack[stack.length-1];
const head=(t,right,bk)=>`<header class="hd">${bk?`<button class="ib" data-a="back">${ic('back')}</button>`:''}<h1>${esc(t)}</h1>${right||''}</header>`;
function render(){const app=$('#app');if(!DB.ready&&!stack.length){stack.push({name:'setup',p:{},sheet:false})}
 const full=[...stack].reverse().find(x=>!x.sheet),t=top_();const m=$('.main'),sc=m?m.scrollTop:0,same=app.dataset.v===(full?full.name:'t-'+tab);
 let h=`<aside class="side"><div class="brand">${S().logo?`<img src="${S().logo}">`:''}<div><b>${esc(S().name||APPNAME)}</b><small>${esc(S().year||'')}</small></div></div>${NAV().map(([k,n,i])=>`<button class="${!full&&tab===k?'on':''}" data-a="tab" data-v="${k}">${ic(i)}${n}</button>`).join('')}</aside>`;
 h+=full?P[full.name](full.p):V[tab]();
 h+=`<nav class="nav">${NAV().map(([k,n,i])=>`<button class="${!full&&tab===k?'on':''}" data-a="tab" data-v="${k}">${ic(i)}<span>${n}</span></button>`).join('')}</nav>`;
 if(t&&t.sheet)h+=`<div class="shade" data-a="shade"><div class="sheet">${SH[t.name](t.p)}</div></div>`;
 app.innerHTML=h;app.dataset.v=full?full.name:'t-'+tab;if(same){const m2=$('.main');if(m2)m2.scrollTop=sc}
 const f=$('[data-focus]');if(f)setTimeout(()=>{try{f.focus()}catch(e){}},60)}
const V={},P={},SH={},A={},IN={};
A.tab=d=>{tab=d.v;stack.length=0;try{history.go(-(history.length>1?0:0))}catch(e){}render()};
A.back=()=>back();A.shade=(d,el,e)=>{if(e.target===el)back()};
A.open=d=>go(d.v,{id:d.id});A.sheet=d=>go(d.v,{id:d.id,k:d.k},true);
A.set=(d,el)=>{ui[d.k]=d.v;if(el)el.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));if(!top_()||!top_().sheet||el.dataset.r)render()};
document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el)return;const f=A[el.dataset.a];if(f){if(el.dataset.a!=='shade')e.preventDefault();f(el.dataset,el,e)}});
document.addEventListener('input',e=>{const el=e.target.closest('[data-i]');if(el&&IN[el.dataset.i])IN[el.dataset.i](el.value,el)});
document.addEventListener('change',e=>{const el=e.target.closest('[data-c]');if(el){ui[el.dataset.c]=el.value;render()}});
/* نهاية e2.js */
