(()=>{'use strict';
/* ============ الإعدادات الثابتة (بتتعدل من هون) ============ */
const VERSION='1.1.0';const EDITION='__ED__';const LITE=EDITION==='orders',KIND=['shop','acc','phone','pharm','cloth','build','solar','whole','stat','sweet','bake','vet'].includes(EDITION)?'shop':'rest',APPNAME=LITE?'الخنساء طلبات':EDITION==='stat'?'الخنساء للمكتبات والقرطاسية':EDITION==='sweet'?'الخنساء لمحلات الحلويات':EDITION==='bake'?'الخنساء للأفران والمخابز':EDITION==='vet'?'الخنساء للصيدليات البيطرية والزراعية':EDITION==='cloth'?'الخنساء للألبسة والأحذية':EDITION==='build'?'الخنساء لمواد البناء والأدوات الصحية':EDITION==='solar'?'الخنساء للطاقة الشمسية':EDITION==='whole'?'الخنساء لتجار الجملة والموزعين':EDITION==='acc'?'الخنساء محاسب':EDITION==='phone'?'الخنساء موبايل':EDITION==='pharm'?'الخنساء صيدلية':EDITION==='rest'?'الخنساء للمطاعم':'الخنساء كاشير';
const SUPPORT='963934664381';           // واتساب الدعم والتفعيل
const SECRET='Kh7#aNs4-c@sh1er/26x';    // سر توليد أكواد التفعيل (لازم يطابق صفحة المولّد)
const FREE_OPS=40;                      // عمليات البيع المجانية
const PACKS=[
 {id:1,type:'days',n:30,name:'اشتراك شهري',desc:'مبيعات بلا حدود لمدة 30 يوم',price:10},
 {id:2,type:'days',n:365,name:'اشتراك سنوي',desc:'مبيعات بلا حدود لمدة سنة كاملة',price:50},
 {id:3,type:'life',n:0,name:'مدى الحياة',desc:'العرض التوفيري: ادفع مرة واحدة واستخدم للأبد',price:150,best:true}
];

/* ============ أدوات عامة ============ */
const $=(s,r=document)=>r.querySelector(s);
const app=$('#app');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const toLatin=s=>String(s==null?'':s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/٫/g,'.').replace(/٬/g,'');
const num=v=>{let s=toLatin(v).trim();const m=s.match(/^(\d+)\s*\/\s*(\d+)$/);if(m&&+m[2])return +m[1]/+m[2];const n=parseFloat(s.replace(/,/g,'.').replace(/[^\d.\-]/g,''));return isFinite(n)?n:0};
const r3=x=>Math.round(x*1000)/1000;
const fmt=n=>Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2});
const fq=q=>({0.25:'¼',0.5:'½',0.75:'¾'}[q]||fmt(q));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const p2=n=>String(n).padStart(2,'0');
const dt=t=>{const d=new Date(t);return `${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`};
const dday=t=>{const d=new Date(t);return `${d.getFullYear()}${p2(d.getMonth()+1)}${p2(d.getDate())}`};
const norm=s=>toLatin(String(s||'').toLowerCase()).replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/\s+/g,' ').trim();
function hash(s){let a=2166136261,b=5381;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a=Math.imul(a^c,16777619);b=(Math.imul(b,33)^c)>>>0}return ((a>>>0)^Math.imul(b,2654435761))>>>0}

let toastT;
function toast(msg,ms){const t=$('#toast');t.innerHTML=`<div>${esc(msg)}</div>`;clearTimeout(toastT);toastT=setTimeout(()=>t.innerHTML='',ms||2600)}
const errT=e=>{const m=e&&(e.message||e.errorMessage||(typeof e==='string'?e:''));return m?'\n('+String(m).slice(0,160)+')':''};

/* ============ قاعدة البيانات (محفوظة على الجهاز) ============ */
const fresh=()=>({v:1,ready:false,
 settings:{store:'',user:'',phone:'',logo:'',footer:'شكراً لتعاملكم معنا',cur:'SYP',rate:130,rounding:true,theme:'light',
  beep:true,vibrate:true,showLast:true,lowAlert:!LITE,lowAt:5,log:true,pin:'',quick:[0.25,0.5,1,2,3],cols:3,list:false,paper:80,pw:576,dark:1,ls:24,owner:'',kind:KIND,
  ownerName:'',costOn:KIND==='shop',tables:KIND==='rest'?10:0,wide:true,discOn:true,discs:[5,7,10],whole:false,users:[],askUser:false,dual:true,autoPrint:false,autoK:true,copies:1,drawer:false,tmpl:'classic',fs:1,bkRemind:'week',lastShare:0,lastAuto:0,rateAuto:true,rateAt:0,closeOn:false,labels:false,expiry:false,expDays:30,repWeek:true,repMonth:true,lastRepW:0,lastRepM:0,agreed:0},
 products:[],sales:[],customers:[],ledger:[],cats:[],log:[],orders:[],expenses:[],workers:[],suppliers:[],sledger:[],closes:[],mats:[],counts:[],reg:null,remote:null,seq:0,oseq:0,oday:'',
 lic:{dev:String(100000+Math.floor(Math.random()*900000)),serial:0,left:FREE_OPS,until:0,last:0,first:Date.now()}});
let DB=fresh();
const S=()=>DB.settings;
const store={idb:null,mem:false,
 open(){return new Promise(res=>{try{const r=indexedDB.open('khansa-cashier',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>{store.idb=r.result;res()};r.onerror=()=>res();r.onblocked=()=>res()}catch(e){res()}})},
 get(){return new Promise(res=>{if(store.idb){try{const q=store.idb.transaction('kv').objectStore('kv').get('db');q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null);return}catch(e){}}
  try{const s=localStorage.getItem('khansa-db');res(s?JSON.parse(s):null)}catch(e){store.mem=true;res(null)}})},
 set(v){if(store.idb){try{store.idb.transaction('kv','readwrite').objectStore('kv').put(v,'db');return}catch(e){}}
  try{localStorage.setItem('khansa-db',JSON.stringify(v))}catch(e){store.mem=true}}};
let saveT;
function save(){clearTimeout(saveT);saveT=setTimeout(flush,200)}
function flush(){clearTimeout(saveT);store.set(JSON.parse(JSON.stringify(DB)))}
function adopt(d){const f=fresh();DB=Object.assign(f,d);DB.settings=Object.assign(fresh().settings,d.settings||{});DB.lic=Object.assign(f.lic,d.lic||{});
 for(const k of ['products','sales','customers','ledger','cats','log','orders','expenses','workers','suppliers','sledger','closes','mats','counts'])if(!Array.isArray(DB[k]))DB[k]=[];
 if(!DB.lic.first)DB.lic.first=Date.now();if(!Array.isArray(DB.settings.users))DB.settings.users=[];DB.settings.kind=KIND;if(LITE){DB.settings.costOn=false;DB.settings.lowAlert=false;DB.settings.users=[]}}
function logA(x){if(!S().log)return;DB.log.unshift({t:Date.now(),x});if(DB.log.length>500)DB.log.length=500}

/* ============ العملات والأسعار ============ */
const money=(v,c)=>{c=c||S().cur;return c==='USD'?'$'+fmt(v):fmt(v)+' ل.س'};
const roundM=(v,c)=>{c=c||S().cur;if(c==='USD')return Math.round(v*100)/100;return S().rounding?Math.round(v/5)*5:Math.round(v)};
const conv=(v,from,to,rate)=>{rate=rate||S().rate||1;if(from===to)return v;return from==='USD'?v*rate:v/rate};
const pPrice=p=>roundM(conv(p.price,p.cur,S().cur));
const pCost=p=>p.cost?roundM(conv(p.cost,p.ccur||p.cur,S().cur)):0;
const prodById=id=>DB.products.find(p=>p.id===id);
const prodByCode=c=>{c=toLatin(c).trim();return c?DB.products.find(p=>p.barcode===c):null};
const custById=id=>DB.customers.find(c=>c.id===id);
const balance=cid=>roundM(DB.ledger.filter(l=>l.cid===cid).reduce((s,l)=>s+conv(l.amt,l.cur,S().cur),0));

/* ============ السلة ============ */
const carts={sale:[],quick:[]};
const cartTotal=c=>roundM(c.reduce((s,i)=>s+i.price*i.qty,0));
const cartCount=c=>r3(c.reduce((s,i)=>s+i.qty,0));
function addCart(cn,p,q){const cart=carts[cn];let it=cart.find(x=>x.pid===p.id);
 if(it)it.qty=r3(it.qty+q);else{it={pid:p.id,name:p.name,price:curPrice(p),cost:pCost(p),qty:q};cart.push(it)}return it}
const inCart=(cn,pid)=>{const it=carts[cn].find(x=>x.pid===pid);return it?it.qty:0};

/* ============ الصوت والاهتزاز ============ */
let actx;
function beep(ok){if(!S().beep)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();
 const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=ok===false?280:1500;g.gain.value=.16;o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+(ok===false?.28:.09))}catch(e){}}
function buzz(){if(S().vibrate&&navigator.vibrate){try{navigator.vibrate(45)}catch(e){}}}

/* ============ الترخيص والتفعيل ============ */
function licNow(){const l=DB.lic,n=Math.max(Date.now(),l.last||0);if(n-(l.last||0)>60000){l.last=n;save()}return n}
const licTime=()=>DB.lic.until>licNow();
const graceOut=()=>!!(ADMIN_URL&&DB.lic.lastOk&&Date.now()-DB.lic.lastOk>7*864e5);
const licCan=()=>!DB.lic.blocked&&!graceOut()&&(licTime()||trialLeft()>0);
function licText(){if(DB.lic.blocked)return 'الاشتراك موقوف، تواصل مع الدعم';if(graceOut())return 'اتصل بالإنترنت للتحقق من الاشتراك';if(licTime()){const d=Math.ceil((DB.lic.until-licNow())/864e5);if(d>36500)return 'اشتراك مدى الحياة فعّال';return `الاشتراك فعّال، باقي ${d} يوم`}
 const t=trialLeft();return t>0?`تجربة مجانية: باقي ${t} ${t>2&&t<11?'أيام':'يوم'} من ${TRIAL_DAYS}`:'انتهت الفترة التجريبية، فعّل الاشتراك للمتابعة'}
const codeFor=(dev,serial,pk)=>String(pk)+String(hash(`${SECRET}|${dev}|${serial}|${pk}`)%1e7).padStart(7,'0');
const reqCode=()=>`${DB.lic.dev}-${DB.lic.serial+1}`;
function activate(code){code=toLatin(code).replace(/\D/g,'');if(code.length!==8)return 'الكود لازم يكون 8 أرقام';
 const pk=PACKS.find(p=>p.id===+code[0]),l=DB.lic;
 if(!pk||code!==codeFor(l.dev,l.serial+1,pk.id))return 'الكود غير صحيح لهذا الجهاز';
 l.serial++;if(pk.type==='life')l.until=Math.max(l.until,licNow())+200*365*864e5;else if(pk.type==='days')l.until=Math.max(l.until,licNow())+pk.n*864e5;else l.left+=pk.n;
 logA('تفعيل: '+pk.name);flush();return ''}

/* ============ البيع والإرجاع ============ */
const shamPart=s=>s.method==='sham'?s.paid:s.method==='mix'?Math.min(s.paid,s.ps||0):0,cashPart=s=>roundM(s.paid-shamPart(s));
function makeSale(paid,method,cid,meta){const cart=carts.sale,cur=S().cur,sub=cartTotal(cart),disc=discAmt(sub),total=roundM(sub-disc);
 paid=Math.max(0,Math.min(roundM(paid),total));const remaining=roundM(total-paid);
 const sale={id:uid(),no:++DB.seq,t:Date.now(),cur,rate:S().rate,total,paid,remaining,method,ps:method==='mix'?roundM(Math.min(paid,ui.pay.ps||0)):0,cid:cid||'',by:curUserName(),sub,disc,dpct:disc?(ui.pay.dp||0):0,whole:!!(S().whole&&ui.whole),
  items:cart.map(i=>Object.assign({pid:i.pid||'',name:i.name,price:i.price,cost:i.cost||0,qty:i.qty,note:i.note||''},i.uq>1?{uq:i.uq}:{}))};
 if(meta){sale.ord={no:meta.no,type:meta.type,table:meta.table||'',name:meta.name||'',phone:meta.phone||'',addr:meta.addr||''};if(meta.id)DB.orders=DB.orders.filter(o=>o.id!==meta.id)}
 for(const i of cart){const p=i.pid&&prodById(i.pid),q=r3(i.qty*(i.uq||1));if(p){if(p.track)p.stock=r3(p.stock-q);p.sold=r3((p.sold||0)+q)}}
 if(remaining>0&&cid)DB.ledger.push({id:uid(),cid,sid:sale.id,amt:remaining,cur,t:sale.t,note:'فاتورة رقم '+sale.no});
 if(!licTime())DB.lic.left=Math.max(0,DB.lic.left-1);
 DB.sales.unshift(sale);logA(`بيع رقم ${sale.no} بقيمة ${money(total)}`);carts.sale=[];flush();return sale}
function refundSale(s){if(s.refunded)return;s.refunded=Date.now();
 for(const i of s.items){const p=i.pid&&prodById(i.pid),q=r3(i.qty*(i.uq||1));if(p){if(p.track)p.stock=r3(p.stock+q);p.sold=Math.max(0,r3((p.sold||0)-q))}}
 if(s.remaining>0&&s.cid)DB.ledger.push({id:uid(),cid:s.cid,sid:s.id,amt:-s.remaining,cur:s.cur,t:Date.now(),note:'إرجاع فاتورة رقم '+s.no});
 logA(`إرجاع فاتورة رقم ${s.no}`);flush()}
const PERIODS={today:'اليوم',week:'آخر 7 أيام',month:'آخر 30 يوم',mon:'هالشهر',custom:'فترة محددة',all:'الكل'};
function pStart(k){if(k==='today'){const d=new Date();d.setHours(0,0,0,0);return d.getTime()}return k==='week'?Date.now()-7*864e5:k==='month'?Date.now()-30*864e5:0}
function stats(k){const [st,en]=prange(k),cur=S().cur,o={n:0,rev:0,profit:0,nocost:0,cash:0,sham:0,debt:0};
 for(const s of DB.sales){if(s.refunded||s.t<st||s.t>en)continue;o.n++;o.rev+=conv(s.total,s.cur,cur,s.rate);
  o.cash+=conv(cashPart(s),s.cur,cur,s.rate);o.sham+=conv(shamPart(s),s.cur,cur,s.rate);o.debt+=conv(s.remaining,s.cur,cur,s.rate);
  for(const i of s.items){if(i.cost>0)o.profit+=conv((i.price-i.cost)*i.qty,s.cur,cur,s.rate);else o.nocost++}if(s.disc)o.profit-=conv(s.disc,s.cur,cur,s.rate);o.disc=(o.disc||0)+conv(s.disc||0,s.cur,cur,s.rate)}
 return o}

/* ============ نص الفاتورة وواتساب ============ */
function receiptText(s){const m=v=>money(v,s.cur),c=s.cid&&custById(s.cid);
 let t=`🧾 *${S().store||'فاتورة مبيعات'}*\nفاتورة رقم ${s.no}\n${dt(s.t)}\n`;if(s.by)t+=`الكاشير: ${s.by}\n`;if(s.ord)t+=ordLabel(s.ord)+'\n';if(c)t+=`الزبون: ${c.name}\n`;t+='──────────\n';
 s.items.forEach((i,k)=>{t+=`${k+1}) ${i.name}${i.note?' ('+i.note+')':''}\n    ${fq(i.qty)} × ${m(i.price)} = ${m(roundM(i.price*i.qty,s.cur))}\n`});
 t+='──────────\n';if(s.disc)t+=`المجموع: ${m(s.sub)}\nالخصم${s.dpct?' '+s.dpct+'%':''}: −${m(s.disc)}\n`;t+=`*الإجمالي: ${m(s.total)}*\n`;if(S().dual){const o=otherAmt(s.total,s.cur,s.rate);t+=`ما يعادل: ${money(o.v,o.c)}\n`}if(s.remaining>0)t+=`المدفوع: ${m(s.paid)}\nالمتبقي: ${m(s.remaining)}\n`;
 if(S().phone)t+=`هاتف: ${S().phone}\n`;if(S().footer)t+=S().footer;return t}
function waNumber(p){p=toLatin(p).replace(/\D/g,'');if(p.startsWith('00'))p=p.slice(2);else if(p.startsWith('0'))p='963'+p.slice(1);return p}
function openWA(phone,text){const n=waNumber(phone||'');window.open(`https://wa.me/${n}?text=${encodeURIComponent(text)}`,'_blank')}

/* ============ حفظ ومشاركة الملفات ============ */
const isNative=()=>!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const b64utf=s=>btoa(unescape(encodeURIComponent(s)));
function b64blob(b,mime){const bin=atob(b),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new Blob([u],{type:mime})}
async function shareFile(name,mime,data,isB64){
 if(isNative()){const P=window.Capacitor.Plugins||{};
  if(P.Filesystem&&P.Share){try{const r=await P.Filesystem.writeFile({path:name,data:isB64?data:b64utf(data),directory:'CACHE'});
    await P.Share.share({title:name,url:r.uri});return true}catch(e){if(String(e&&e.message).toLowerCase().includes('cancel'))return false}}
  toast('تعذّر حفظ الملف على هذا الجهاز');return false}
 const blob=isB64?b64blob(data,mime):new Blob([data],{type:mime});
 try{const f=new File([blob],name,{type:mime});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});return true}}
 catch(e){if(e&&e.name==='AbortError')return false}
 try{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);return true}
 catch(e){toast('تعذّر حفظ الملف');return false}}
async function shareText(text){try{if(navigator.share){await navigator.share({text});return}}catch(e){if(e&&e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(text);toast('تم نسخ النص')}catch(e){toast('تعذّرت المشاركة')}}

/* ============ CSV (بينفتح بإكسل) ============ */
const CSV_HEAD=['الاسم','الباركود','السعر','العملة','التكلفة','عملة التكلفة','الكمية','القسم'];
const csvCell=v=>{v=String(v==null?'':v);return /[",\n;]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
function productsCSV(){const rows=[CSV_HEAD].concat(DB.products.map(p=>[p.name,p.barcode||'',p.price,p.cur,p.cost||'',p.cost?(p.ccur||p.cur):'',p.track?p.stock:'',p.cat||'']));
 return '\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n')}
function parseCSV(text){text=text.replace(/^\uFEFF/,'');const first=text.split(/\r?\n/)[0]||'';
 const d=(first.split(';').length>first.split(',').length)?';':(first.split('\t').length>first.split(',').length?'\t':',');
 const rows=[];let row=[],cell='',q=false;
 for(let i=0;i<text.length;i++){const ch=text[i];
  if(q){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++}else q=false}else cell+=ch}
  else if(ch==='"')q=true;else if(ch===d){row.push(cell);cell=''}
  else if(ch==='\n'){row.push(cell);rows.push(row);row=[];cell=''}else if(ch!=='\r')cell+=ch}
 if(cell||row.length){row.push(cell);rows.push(row)}
 return rows.filter(r=>r.some(c=>c.trim()))}
const curOf=(s,def)=>{s=String(s||'').toLowerCase();if(/\$|usd|دولار/.test(s))return 'USD';if(/syp|ل\.?س|ليرة/.test(s))return 'SYP';return def};
function importCSV(text){const rows=parseCSV(text);let add=0,upd=0;if(!rows.length)return null;
 if(/الاسم|name|اسم/i.test(rows[0][0]||''))rows.shift();
 for(const r of rows){const name=(r[0]||'').trim();if(!name)continue;const barcode=toLatin(r[1]||'').trim();
  const cur=curOf(r[3],S().cur),stockS=(r[6]||'').trim(),cat=(r[7]||'').trim();
  const data={name,barcode,price:num(r[2]),cur,cost:num(r[4]),ccur:curOf(r[5],cur),track:stockS!=='',stock:num(stockS),cat};
  let p=barcode&&prodByCode(barcode);if(!p)p=DB.products.find(x=>!x.barcode&&!barcode&&x.name===name);
  if(p){Object.assign(p,data);upd++}else{DB.products.push(Object.assign({id:uid(),sold:0,t:Date.now()+add},data));add++}
  if(cat&&!DB.cats.includes(cat))DB.cats.push(cat)}
 logA(`استيراد منتجات: ${add} جديد، ${upd} تحديث`);flush();return {add,upd}}

/* ============ الإيصال كصورة (للمعاينة والمشاركة والطباعة الحرارية) ============ */
const loadImg=src=>new Promise(res=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>res(null);im.src=src});
const otherAmt=(v,cur,rate)=>{const c=cur==='USD'?'SYP':'USD';return {c,v:roundM(conv(v,cur,c,rate),c)}};
async function receiptCanvas(s){const W=S().paper===58?384:(S().pw||576),k=W/576,T=S().tmpl||'classic',Z=T==='big'?1.22:T==='compact'?0.92:1,pad=Math.round(18*k),m=v=>money(v,s.cur);
 const F=(px,bold)=>`${bold?'800':'500'} ${Math.round(px*k*Z)}px system-ui,Tahoma,sans-serif`;
 const c=s.cid&&custById(s.cid),ops=[];let y=pad;
 const lhOf=px=>Math.round(px*k*Z*(T==='compact'?1.35:1.5));
 const txt=(t,px,bold,align)=>{const lh=lhOf(px);ops.push({k:'t',t,f:F(px,bold),align:align||'right',y:y+lh*.75});y+=lh};
 const two=(a,b,px,bold)=>{const lh=lhOf(px);ops.push({k:'t',t:a,f:F(px,bold),align:'right',y:y+lh*.75},{k:'t',t:b,f:F(px,bold),align:'left',y:y+lh*.75});y+=lh};
 const line=()=>{y+=Math.round(6*k);ops.push({k:'l',y});y+=Math.round(10*k)};
 const cut=(t,n)=>t.length>n?t.slice(0,n-1)+'…':t,nmax=T==='big'?20:26;
 txt(S().store||'فاتورة مبيعات',32,true,'center');if(S().phone&&T!=='compact')txt(S().phone,22,false,'center');line();
 if(s.quote)txt('عرض سعر',28,true,'center');if(T==='compact')two((s.quote?'عرض ':'فاتورة ')+s.no,dt(s.t),22,true);else{two(s.quote?'عرض سعر رقم':'فاتورة رقم',String(s.no),24,true);two('التاريخ',dt(s.t),22)}
 if(s.by&&T!=='compact')two('الكاشير',s.by,22);if(c)two('الزبون',c.name,22);if(s.cname)two('السيد',s.cname,22);
 if(s.ord){two('الطلب',ordLabel(Object.assign({},s.ord,{no:0})),22,true);if(s.ord.no)two('رقم الطلب',String(s.ord.no),22);if(s.ord.addr)txt(s.ord.addr,20)}
 if(s.whole)txt('فاتورة جملة',22,true,'center');if(s.refunded)txt('فاتورة مُسترجعة',24,true,'center');line();
 for(const i of s.items){const tot=m(roundM(i.price*i.qty,s.cur));
  if(T==='compact')two(cut(i.name,18)+(i.qty!==1?' ×'+fq(i.qty):''),tot,22,true);else{two(cut(i.name,nmax),tot,24,true);txt(`${fq(i.qty)} × ${m(i.price)}`,20)}
  if(i.note)txt('ملاحظة: '+i.note,20)}
 line();if(s.disc){two('المجموع',m(s.sub),22);two('الخصم'+(s.dpct?' '+s.dpct+'%':''),'−'+m(s.disc),22,true)}two('الإجمالي',m(s.total),30,true);if(S().dual){const o=otherAmt(s.total,s.cur,s.rate);two('ما يعادل',money(o.v,o.c),22)}
 if(s.method==='mix'){two('دفع كاش',m(cashPart(s)),22);two('دفع شام كاش',m(shamPart(s)),22)}if(s.remaining>0){two('المدفوع',m(s.paid),22);two('المتبقي',m(s.remaining),22,true)}
 if(T!=='compact'){line();if(S().footer)txt(S().footer,22,false,'center')}y+=pad;
 const cv=document.createElement('canvas');cv.width=W;cv.height=Math.ceil(y);const x=cv.getContext('2d');
 x.fillStyle='#fff';x.fillRect(0,0,W,cv.height);x.fillStyle='#000';x.strokeStyle='#000';x.direction='rtl';
 for(const o of ops){if(o.k==='l'){x.lineWidth=Math.max(1,Math.round(2*k));x.beginPath();x.moveTo(pad,o.y);x.lineTo(W-pad,o.y);x.stroke()}
  else{x.font=o.f;x.textAlign=o.align;const tx=o.align==='center'?W/2:o.align==='right'?W-pad:pad;x.fillText(o.t,tx,o.y);if(S().dark){x.lineWidth=S().dark*k*.8;x.strokeText(o.t,tx,o.y)}}}
 return cv}
function rasterBytes(cv,band){const w=cv.width,h=cv.height,d=cv.getContext('2d').getImageData(0,0,w,h).data,bw=Math.ceil(w/8),out=[0x1B,0x40],thr=[150,185,215][S().dark||0];band=band||48;
 for(let y0=0;y0<h;y0+=band){const hh=Math.min(band,h-y0);out.push(0x1D,0x76,0x30,0,bw&255,bw>>8,hh&255,hh>>8);
  for(let y=y0;y<y0+hh;y++)for(let bx=0;bx<bw;bx++){let b=0;for(let q=0;q<8;q++){const xx=bx*8+q;if(xx<w){const i=(y*w+xx)*4;if(d[i]*.299+d[i+1]*.587+d[i+2]*.114<thr)b|=0x80>>q}}out.push(b)}}
 out.push(0x1B,0x64,4,0x1D,0x56,1);return new Uint8Array(out)}
/* طريقة تانية: صورة على شكل خطوط 24 نقطة (ESC *) */
function escStarBytes(cv,ls){ls=ls||S().ls||24;const w=cv.width,h=cv.height,d=cv.getContext('2d').getImageData(0,0,w,h).data,thr=[150,185,215][S().dark||0],out=[0x1B,0x40,0x1D,0x4C,0,0,0x1D,0x57,w&255,w>>8,0x1B,0x33,ls];
 const on=(x,y)=>{if(y>=h)return 0;const i=(y*w+x)*4;return d[i]*.299+d[i+1]*.587+d[i+2]*.114<thr};
 const lite=(S().pq||'fast')==='fast',cw=lite?Math.ceil(w/2):w,px=lite?(x,y)=>on(2*x,y)||(2*x+1<w&&on(2*x+1,y)):on,mode=lite?32:33;
 for(let y0=0;y0<h;y0+=24){const row=[];let any=0;for(let x=0;x<cw;x++)for(let k=0;k<3;k++){let b=0;for(let q=0;q<8;q++)if(px(x,y0+k*8+q))b|=0x80>>q;if(b)any=1;row.push(b)}
  if(any){out.push(0x1B,0x2A,mode,cw&255,cw>>8);for(const b of row)out.push(b);out.push(0x0A)}else out.push(0x1B,0x4A,ls)}
 out.push(0x1B,0x32,0x1B,0x64,4,0x1D,0x56,1);return new Uint8Array(out)}
/* نص مباشر بخط الطابعة (إنجليزي وأرقام فقط) */
function textTestBytes(){const L=['AlKhansa Cashier','PRINT TEST 4 - TEXT MODE','--------------------------------','Item 1            2 x 650 = 1300','Item 2            1 x 100 =  100','--------------------------------','TOTAL                      1400','0123456789',''];
 const out=[0x1B,0x40,0x1B,0x61,1,0x1B,0x45,1];for(const l of L){for(const ch of l)out.push(ch.charCodeAt(0)&127);out.push(0x0A)}out.push(0x1B,0x64,4,0x1D,0x56,1);return new Uint8Array(out)}
const HEAT=[0x1B,0x37,7,200,2];
const BLE_SVC=['000018f0-0000-1000-8000-00805f9b34fb','e7810a71-73ae-499d-8c15-faa9aef0c3f2','49535343-fe7d-4ae5-8fa9-9fafd205e455','0000ff00-0000-1000-8000-00805f9b34fb','0000fff0-0000-1000-8000-00805f9b34fb'];
const ble={c:{ch:null,name:''},k:{ch:null,name:''}};
const DESK=()=>!!(window.khDesktop&&window.khDesktop.print);
const canBLE=()=>!DESK()&&!!(navigator.bluetooth||NB());
async function bleConnect(slot){slot=slot||'c';if(NB())return nbConnect(slot);const dev=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:BLE_SVC});
 const g=await dev.gatt.connect();let pick=null;
 for(const sv of await g.getPrimaryServices()){let cs=[];try{cs=await sv.getCharacteristics()}catch(e){}
  for(const c of cs){if(c.properties.write){pick=c;break}if(!pick&&c.properties.writeWithoutResponse)pick=c}if(pick&&pick.properties.write)break}
 if(!pick)throw new Error('لم يتم العثور على قناة طباعة في هذا الجهاز');
 ble[slot].ch=pick;ble[slot].name=dev.name||'طابعة';dev.addEventListener('gattserverdisconnected',()=>{ble[slot].ch=null})}
/* إرسال منتظم: مع تأكيد استلام كل دفعة لحتى ما تضيع بيانات (الخطوط البيضا) */
async function blePrint(bytes,slot){slot=slot||'c';if(!bs(slot).ch)await bleConnect(slot);const c=ble[slot].ch;
 const ps=S().pspeed||'f';if(ps!=='n'&&c.wchunk>=100&&c.properties.writeWithoutResponse){const sz=c.wchunk,gap=ps==='x'?8:22;for(let i=0;i<bytes.length;i+=sz){await c.writeValueWithoutResponse(bytes.slice(i,i+sz));await sleep(gap)}return}
 const resp=!!c.properties.write;let size=c.chunk||(resp?500:20);
 for(let i=0,n=0;i<bytes.length;n++){const part=bytes.slice(i,i+size);
  try{if(resp)await(c.writeValueWithResponse?c.writeValueWithResponse(part):c.writeValue(part));else{await c.writeValueWithoutResponse(part);if(n%6===5)await sleep(6)}}
  catch(e){if(size>20&&i===0){size=size>180?180:20;c.chunk=size;continue}throw e}
  i+=size}}

/* ============ المطعم: الطلبات وورقة المطبخ ============ */
const OTYPE={dine:'صالة',take:'سفري',del:'توصيل'};
const ordLabel=o=>(o.no?'طلب '+o.no+'، ':'')+(OTYPE[o.type]||'سفري')+(o.type==='dine'&&o.table?' طاولة '+o.table:'')+(o.type==='del'&&o.name?'، '+o.name:'');
function nextOrderNo(){if((S().oreset||(KIND==='rest'?'close':'hour'))!=='close'){const d=dday(Date.now()-(S().ohour==null?5:+S().ohour)*3600e3);if(DB.oday!==d){DB.oday=d;DB.oseq=0}}return ++DB.oseq}
const ago=t=>{const m=Math.max(0,Math.round((Date.now()-t)/60000));return m<1?'أقل من دقيقة':m<60?m+' دقيقة':Math.floor(m/60)+' ساعة و'+(m%60)+' دقيقة'};
const ordTotal=o=>roundM(o.items.reduce((s,i)=>s+conv(i.price,o.cur||S().cur,S().cur)*i.qty,0));
async function kitchenCanvas(o,lines,add){const W=S().paper===58?384:(S().pw||576),k=W/576,pad=Math.round(18*k);
 const F=(px,b)=>`${b?'800':'500'} ${Math.round(px*k)}px system-ui,Tahoma,sans-serif`;
 const mx=document.createElement('canvas').getContext('2d');const ops=[];let y=pad;
 const wrap=(t,f)=>{mx.font=f;const out=[];let cur='';for(const w of String(t).split(' ')){const tr=cur?cur+' '+w:w;if(mx.measureText(tr).width>W-2*pad&&cur){out.push(cur);cur=w}else cur=tr}out.push(cur);return out};
 const txt=(t,px,b,al)=>{const f=F(px,b),lh=Math.round(px*k*1.35);for(const ln of wrap(t,f)){ops.push({t:ln,f,al:al||'right',y:y+lh*.8});y+=lh}};
 const line=()=>{y+=Math.round(6*k);ops.push({l:1,y});y+=Math.round(12*k)};
 txt(o.st||'المطبخ',24,false,'center');txt('طلب '+o.no,58,true,'center');txt(ordLabel(Object.assign({},o,{no:0})),30,true,'center');
 txt(dt(Date.now()),22,false,'center');if(add)txt('إضافة على الطلب',30,true,'center');line();
 for(const l of lines){txt(`${fq(l.qty)} × ${l.name}`,36,true);if(l.note)txt('← '+l.note,28)}
 line();y+=pad;
 const cv=document.createElement('canvas');cv.width=W;cv.height=Math.ceil(y);const x=cv.getContext('2d');
 x.fillStyle='#fff';x.fillRect(0,0,W,cv.height);x.fillStyle='#000';x.strokeStyle='#000';x.direction='rtl';
 for(const op of ops){if(op.l){x.lineWidth=Math.max(1,Math.round(3*k));x.setLineDash([Math.round(10*k),Math.round(6*k)]);x.beginPath();x.moveTo(pad,op.y);x.lineTo(W-pad,op.y);x.stroke()}
  else{x.font=op.f;x.textAlign=op.al;const tx=op.al==='center'?W/2:op.al==='right'?W-pad:pad;x.fillText(op.t,tx,op.y);if(S().dark){x.lineWidth=S().dark*k*.8;x.strokeText(op.t,tx,op.y)}}}
 return cv}

/* ============ التقرير لصاحب المحل ============ */
function prange(k){const now=Date.now();
 if(k==='custom'){const f=new Date((ui.rfrom||isoD(now))+'T00:00:00').getTime(),t=new Date((ui.rto||isoD(now))+'T23:59:59').getTime();return [f,t]}
 if(k==='mon'){const d=new Date();d.setDate(1);d.setHours(0,0,0,0);return [d.getTime(),now+1]}
 return [pStart(k),now+1]}
const isoD=t=>{const d=new Date(t);return `${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`};
const plabel=k=>k==='custom'?`من ${ui.rfrom||isoD(Date.now())} إلى ${ui.rto||isoD(Date.now())}`:PERIODS[k];
function reportText(k,hideProfit){const o=stats(k),[st,en]=prange(k),cnt={},m=v=>money(roundM(v));
 const refs=DB.sales.filter(s=>s.refunded&&s.t>=st&&s.t<=en).length,ex=expTotal(st,en);
 for(const s of DB.sales){if(s.refunded||s.t<st||s.t>en)continue;for(const i of s.items)cnt[i.name]=(cnt[i.name]||0)+i.qty}
 const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,5),ty={dine:0,take:0,del:0};
 for(const s of DB.sales)if(!s.refunded&&s.t>=st&&s.t<=en&&s.ord&&ty[s.ord.type]!==undefined)ty[s.ord.type]++;
 let t=`📊 *تقرير ${plabel(k)}*\n${S().store||''}\n${dt(Date.now())}\n──────────\nعدد الفواتير: ${o.n}\nالمبيعات: ${m(o.rev)}\nكاش: ${m(o.cash)}\nشام كاش: ${m(o.sham)}\n${LITE?'':`ديون جديدة: ${m(o.debt)}\n`}`;
 const pu=KIND==='rest'?purTotal(st,en):0;
 if(LITE){}else if(!S().costOn){if(!hideProfit)t+=`${pu?`مشتريات مواد: ${m(pu)}\n`:''}المصاريف والرواتب: ${m(ex)}\n*الصافي: ${m(o.rev-ex-pu)}*\n`}else if(hideProfit)t+='الربح: •••\n';else t+=`ربح البيع: ${m(o.profit)}${o.nocost?' (بعض الأصناف بلا سعر تكلفة)':''}\nالمصاريف: ${m(ex)}\n*صافي الربح: ${m(o.profit-ex)}*\n`;
 if(KIND==='rest')t+=`صالة: ${ty.dine} · سفري: ${ty.take} · توصيل: ${ty.del}\n`;if(o.disc)t+=`خصومات: ${m(o.disc)}\n`;
 if(refs)t+=`فواتير مُسترجعة: ${refs}\n`;
 if(top.length)t+='──────────\nالأكثر مبيعاً:\n'+top.map(([n,q],i)=>`${i+1}) ${n}: ${fq(r3(q))}`).join('\n')+'\n';
 return t+'──────────\n'+APPNAME}

