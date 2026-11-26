/* ============ النسخة 1.1: الأساسيات الجديدة ============ */
const TRIAL_DAYS=10,ADMIN_URL='https://script.google.com/macros/s/AKfycbzfo2BIbPxgGWHWsYUlHpydeEcgHPaXKgLr0YiquyufVBnyOKY3oRq8yOEaQOOa49Swdg/exec',SITE='https://alkhansatech.com',DAY=864e5;
function trialLeft(){return Math.max(0,Math.ceil(((DB.lic.first||Date.now())+TRIAL_DAYS*DAY-licNow())/DAY))}
const curUser=()=>ui.user?S().users.find(u=>u.id===ui.user)||null:null;
const curUserName=()=>{const u=curUser();return u?u.name:(S().cashier||'')};
const userChip=()=>S().users.length?`<button class="ratechip" style="margin-inline-end:6px" data-a="opensheet" data-v="who">${ic('user')} ${esc(curUserName()||'كاشير')}</button>`:'';
const dualSmall=v=>{if(!S().dual)return '';const o=otherAmt(v,S().cur,S().rate);return `<small style="display:block;font-size:12px;opacity:.85">≈ ${money(o.v,o.c)}</small>`};
const inR=(t,st,en)=>t>=st&&t<=en;
const expTotal=(st,en)=>DB.expenses.filter(e=>inR(e.t,st,en)).reduce((a,e)=>a+conv(e.amt,e.cur,S().cur),0);
const EXPCATS=['مواد غذائية','غاز','إيجار','كهرباء','مياه','إنترنت','مواصلات','صيانة','بضاعة','رواتب','سلف','ضيافة','أخرى'];
const isoToday=()=>isoD(Date.now());
const dayStart=s=>new Date(s+'T12:00:00').getTime();
const mStart=()=>{const d=new Date();d.setDate(1);d.setHours(0,0,0,0);return d.getTime()};
const isAdminView=()=>!locked();

/* ---------- التفعيل عبر الإنترنت ---------- */
async function onlineActivate(code){if(!ADMIN_URL)return 'التفعيل عبر الإنترنت غير متاح بعد. اطلب كود من 8 أرقام';
 if(!navigator.onLine)return 'لا يوجد اتصال بالإنترنت';
 try{const r=await (await fetch(`${ADMIN_URL}?a=activate&code=${code}&dev=${DB.lic.dev}&store=${encodeURIComponent(S().store||'')}`)).json();
  if(!r||!r.ok)return (r&&r.msg)||'الكود غير صحيح أو مستخدم';
  const l=DB.lic,days=r.type==='life'?200*365:(+r.days||30);l.until=Math.max(l.until,licNow())+days*DAY;logA('تفعيل عبر الإنترنت: '+(r.name||days+' يوم'));flush();return ''}
 catch(e){return 'تعذّر الاتصال بالخادم، حاول لاحقاً'}}

/* ---------- لوحة الإدارة: تسجيل وإعدادات ---------- */
async function sendReg(){const r=DB.reg;if(!ADMIN_URL||!r||r.sent||!navigator.onLine)return;
 try{await fetch(ADMIN_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify({a:'reg',dev:DB.lic.dev,owner:r.owner,store:r.store,phone:r.phone,kind:r.kind,t:r.t,ver:VERSION})});r.sent=Date.now();save()}catch(e){}}
async function fetchRemote(){if(!ADMIN_URL||!navigator.onLine)return;
 try{const r=await (await fetch(`${ADMIN_URL}?a=config&dev=${DB.lic.dev}&ver=${VERSION}`)).json();if(!r)return;DB.remote=Object.assign({t:Date.now()},r);
  const rt=+r.rate;if(rt>0&&rt!==S().rate&&S().rateAuto){S().rate=rt;S().rateAt=Date.now();logA('تحديث سعر الصرف تلقائياً إلى '+fmt(rt));toast('تم تحديث سعر الصرف إلى '+fmt(rt))}
  save();if(r.force&&verNewer(r.ver))open('upd',{},true);else render()}catch(e){}}
const verNewer=v=>{if(!v)return false;const a=String(v).split('.').map(Number),b=VERSION.split('.').map(Number);for(let i=0;i<3;i++){if((a[i]||0)>(b[i]||0))return true;if((a[i]||0)<(b[i]||0))return false}return false};

/* ---------- النسخ الاحتياطي التلقائي ---------- */
const bkName=t=>`khansa-backup-${dday(t)}.khansa`;
async function autoBackup(){const today=dday(Date.now());if(String(S().lastAuto)===today||!DB.ready)return;
 const data=JSON.stringify(Object.assign({kh:'backup',v:VERSION},DB));
 try{if(isNative()&&window.Capacitor.Plugins.Filesystem){const F=window.Capacitor.Plugins.Filesystem,dir='AlKhansaCashier';
   try{await F.mkdir({path:dir,directory:'DOCUMENTS',recursive:true})}catch(e){}
   await F.writeFile({path:`${dir}/${bkName(Date.now())}`,data:b64utf(data),directory:'DOCUMENTS'});
   try{const l=(await F.readdir({path:dir,directory:'DOCUMENTS'})).files.map(f=>f.name||f).filter(n=>/^khansa-backup-\d{8}\.khansa$/.test(n)).sort();for(const n of l.slice(0,-7))await F.deleteFile({path:`${dir}/${n}`,directory:'DOCUMENTS'})}catch(e){}}
  else{const keys=Object.keys(localStorage).filter(k=>k.startsWith('khbk_')).sort();for(const k of keys.slice(0,Math.max(0,keys.length-2)))localStorage.removeItem(k);
   localStorage.setItem('khbk_'+today,data)}
  S().lastAuto=today;save()}catch(e){}}
async function listAutoBk(){try{if(isNative()&&window.Capacitor.Plugins.Filesystem){const F=window.Capacitor.Plugins.Filesystem;
  return (await F.readdir({path:'AlKhansaCashier',directory:'DOCUMENTS'})).files.map(f=>f.name||f).filter(n=>/\.khansa$/.test(n)).sort().reverse().map(n=>({k:'f:'+n,d:n.replace(/\D/g,'')}))}
 return Object.keys(localStorage).filter(k=>k.startsWith('khbk_')).sort().reverse().map(k=>({k:'l:'+k,d:k.slice(5)}))}catch(e){return []}}
async function readAutoBk(k){if(k.startsWith('l:'))return localStorage.getItem(k.slice(2));
 const F=window.Capacitor.Plugins.Filesystem,r=await F.readFile({path:'AlKhansaCashier/'+k.slice(2),directory:'DOCUMENTS',encoding:'utf8'});return r.data}
const fmtD=d=>d&&d.length===8?`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6)}`:d;
function restoreData(d){const lic=DB.lic;adopt(d);DB.lic=lic;DB.ready=true;carts.sale=[];carts.quick=[];ui.user=null;applyTheme();logA('استعادة نسخة احتياطية');flush();toast('تمت استعادة البيانات')}
function bkDue(){const r=S().bkRemind;if(r==='off')return false;const lim=r==='day'?1:7;return Date.now()-(S().lastShare||DB.lic.first||0)>lim*DAY}

/* ---------- نقل البيانات بين الأجهزة ---------- */
function mergeXfer(d){const c={p:0,c:0,s:0};
 for(const p of d.products||[]){if(DB.products.some(x=>x.id===p.id||(p.barcode&&x.barcode===p.barcode)))continue;DB.products.push(p);c.p++;if(p.cat&&!DB.cats.includes(p.cat))DB.cats.push(p.cat)}
 for(const k of d.cats||[])if(!DB.cats.includes(k))DB.cats.push(k);
 for(const x of d.customers||[]){if(DB.customers.some(y=>y.id===x.id||(x.phone&&y.phone===x.phone)))continue;DB.customers.push(x);c.c++}
 for(const l of d.ledger||[])if(!DB.ledger.some(y=>y.id===l.id)&&DB.customers.some(y=>y.id===l.cid))DB.ledger.push(l);
 for(const s of d.sales||[]){if(DB.sales.some(y=>y.id===s.id))continue;DB.sales.push(s);c.s++}
 DB.sales.sort((a,b)=>b.t-a.t);logA(`استلام بيانات من جهاز آخر: ${c.p} منتج، ${c.c} زبون، ${c.s} فاتورة`);flush();return c}

/* ---------- الطباعة ---------- */
const cutTail=b=>b.slice(0,b.length-8);
async function receiptBytes(s){return escStarBytes(await receiptCanvas(s))}
async function printSale(s,auto){if(DESK()){const n=Math.max(1,S().copies||1);for(let i=0;i<n;i++)await deskPrint(await receiptCanvas(s),S().wprinter);return}if(!canBLE())return toast('الطباعة عبر البلوتوث غير مفعّلة في هذه النسخة بعد');
 try{toast('جارٍ الطباعة…');const b=await receiptBytes(s),n=Math.max(1,S().copies||1);for(let i=0;i<n;i++)await blePrint(b,'c');
  if(S().drawer&&cashPart(s)>0)await blePrint(new Uint8Array([0x1B,0x70,0,25,250]),'c');toast('تمت الطباعة')}
 catch(e){toast('تعذّرت الطباعة. تأكد من تشغيل الطابعة'+errT(e),9000)}}
async function labelBytes(list){const out=[];
 for(const {p,n} of list){const cv=document.createElement('canvas'),W=S().paper===58?384:(S().pw||576);cv.width=W;cv.height=96;const x=cv.getContext('2d');
  x.fillStyle='#fff';x.fillRect(0,0,W,96);x.fillStyle='#000';x.direction='rtl';x.textAlign='center';x.font='800 30px system-ui,Tahoma,sans-serif';x.fillText(p.name.slice(0,28),W/2,38);
  x.font='800 28px system-ui,Tahoma,sans-serif';x.fillText(money(pPrice(p)),W/2,80);const t=cutTail(escStarBytes(cv)),code=String(p.barcode);
  for(let i=0;i<n;i++){out.push(...t,0x1B,0x61,1,0x1D,0x68,70,0x1D,0x77,2,0x1D,0x48,2,0x1D,0x6B,73,code.length+2,0x7B,0x42,...[...code].map(ch=>ch.charCodeAt(0)),0x0A,0x1B,0x61,0,0x1B,0x64,3)}}
 out.push(0x1D,0x56,1);return new Uint8Array(out)}
function ensureCode(p){if(p.barcode)return;let n=0,c;do{c='20'+String(Date.now()%1e9+(n++)).padStart(10,'0')}while(prodByCode(c));p.barcode=c}

/* ---------- الصلاحية ---------- */
const expSoon=()=>{const lim=Date.now()+(S().expDays||30)*DAY;return DB.products.filter(p=>p.exp&&dayStart(p.exp)<=lim).sort((a,b)=>a.exp<b.exp?-1:1)};

/* ---------- الدرج ---------- */
function drawerCalc(){const last=DB.closes[0],since=last?last.t:0,cur=S().cur;let sales=0,debts=0,exp=0,sham=0;for(const s of DB.sales)if(!s.refunded&&s.t>since)sham+=conv(shamPart(s),s.cur,cur,s.rate);let tips=0;for(const x of DB.tips||[])if(x.t>since&&x.box==='cash')tips+=(x.kind==='out'?-1:1)*conv(x.amt,x.cur,cur);
 for(const s of DB.sales)if(!s.refunded&&s.t>since)sales+=conv(cashPart(s),s.cur,cur,s.rate);
 for(const l of DB.ledger)if(l.t>since&&l.amt<0&&!l.sid)debts+=conv(-l.amt,l.cur,cur);
 for(const e of DB.expenses)if(e.t>since&&e.drawer)exp+=conv(e.amt,e.cur,cur);
 for(const l of DB.sledger)if(l.t>since&&l.drawer&&l.amt<0)exp+=conv(-l.amt,l.cur,cur);
 return {since,sales:roundM(sales),debts:roundM(debts),exp:roundM(exp),exp2:roundM(sales+debts-exp+tips),sham:roundM(sham),tips:roundM(tips)}}

/* ---------- العمال والموردين ---------- */
const wkStart=w=>{if(w.per!=='week')return mStart();const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+1)%7));return d.getTime()};
const wkLbl=w=>w.per==='week'?'الأسبوعي':'الشهري',wkNow=w=>w.per==='week'?'هالأسبوع':'هالشهر';
const wkPaid=(w,from)=>DB.expenses.filter(e=>e.wid===w.id&&e.t>=from).reduce((a,e)=>a+conv(e.amt,e.cur,w.cur||S().cur),0);
const supBal=id=>DB.sledger.filter(l=>l.sid===id).reduce((a,l)=>a+conv(l.amt,l.cur,S().cur),0);
async function squeezeImg(f){const im=await loadImg(await readFile(f,true));if(!im)throw 0;const k=Math.min(1,1000/Math.max(im.width,im.height)),cv=document.createElement('canvas');
 cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);return cv.toDataURL('image/jpeg',.6)}
/* نهاية الدفعة 1 من p5 */

/* ============ تنبيهات أعلى الشاشة ============ */
function notices(){const r=DB.remote||{},h=[];
 if(r.ver&&verNewer(r.ver)&&!ui.updLater)h.push(`<div class="warn" style="flex-wrap:wrap">${ic('bell')}<span style="flex:1">يوجد تحديث جديد ${esc(r.ver)}${r.notes?': '+esc(r.notes):''}</span><button class="btn sm pri" data-a="doupd">تحديث الآن</button><button class="btn sm ghost" data-a="updlater">لاحقاً</button></div>`);
 if(r.msg&&r.msg.id&&S().seenMsg!==r.msg.id)h.push(`<div class="warn">${ic('bell')}<span style="flex:1">${esc(r.msg.text||'')}</span><button class="ib sm" data-a="seenmsg" aria-label="إغلاق">${ic('x')}</button></div>`);
 if(+r.rate>0&&+r.rate!==S().rate&&!S().rateAuto)h.push(`<div class="warn">${ic('money')}<span style="flex:1">سعر الصرف المقترح اليوم: ${fmt(+r.rate)} ل.س</span><button class="btn sm pri" data-a="applyrate">اعتماد</button></div>`);
 if(bkDue())h.push(`<button class="warn" data-a="sharebk">${ic('down')}<span style="flex:1">ما في نسخة احتياطية من فترة. اكبس هون لحفظ نسخة على Drive أو واتساب</span></button>`);
 if(isAdminView()){const now=Date.now();
  if(S().repWeek&&now-(S().lastRepW||now)>7*DAY)h.push(`<button class="warn" data-a="repnow" data-v="week">${ic('chart')}<span style="flex:1">صار وقت التقرير الأسبوعي</span></button>`);
  if(S().repMonth&&now-(S().lastRepM||now)>30*DAY)h.push(`<button class="warn" data-a="repnow" data-v="month">${ic('chart')}<span style="flex:1">صار وقت التقرير الشهري</span></button>`)}
 if(S().expiry){const n=expSoon().length;if(n)h.push(`<button class="warn" data-a="open" data-v="expiring">${ic('bell')}<span style="flex:1">${n} منتج قرب ينتهي أو منتهي الصلاحية</span></button>`)}
 return h.join('')}

/* ============ المبيعات والحسابات ============ */
const STABS=()=>{if(LITE)return [['inv','الفواتير']];const t=[['inv','الفواتير'],['exp','المصاريف'],['work','العمال'],['sup',KIND==='rest'?'المشتريات':'الموردين']];if(KIND==='rest')t.push(['stock','الجرد']);t.push(['net','الصافي']);if(S().closeOn)t.push(['close','إغلاق الصندوق']);t.push(['meals','الضيافة']);if(KIND==='rest')t.push(['tips','البخشيش']);if(KIND==='rest')t.push(['voids','الإلغاءات']);return t};
const perSel=()=>`<select class="inp" data-c="period" style="width:auto;margin:0;padding:8px 10px">${Object.entries(PERIODS).map(([k,t])=>`<option value="${k}" ${ui.period===k?'selected':''}>${t}</option>`).join('')}</select>`;
const custRange=()=>ui.period==='custom'?`<div class="g2 mt"><label class="f" style="margin:0">من<input type="date" data-c="rfrom" value="${ui.rfrom||isoToday()}"></label><label class="f" style="margin:0">إلى<input type="date" data-c="rto" value="${ui.rto||isoToday()}"></label></div>`:'';
function salesView(){const st=ui.stab||'inv',lk=locked();
 let h=head('المبيعات',rateChip())+`<main class="main">${notices()}<div class="chips"${LITE?' style="display:none"':''}>${STABS().map(([k,t])=>`<button class="chip ${st===k?'on':''}" data-a="stab" data-v="${k}">${t}</button>`).join('')}</div>`;
 const nl=S().netLock||(/عوافي/.test(S().store||'')?'long':'all');if(st==='net'&&ownerLocked()&&!(nl==='long'&&ui.period==='today'))return h+`<div class="lock">${ic('lock')}<b>${nl==='long'?'الصافي الأسبوعي والشهري لصاحب المحل فقط':'هذا القسم لصاحب المحل فقط'}</b>${nl==='long'?`<button class="btn ghost" data-a="uset" data-k="period" data-v="today">صافي اليوم</button>`:''}<button class="btn pri" data-a="opensheet" data-v="unlock">فتح بالرمز</button></div></main>`+navBar();
 return h+({inv:tabInv,exp:tabExp,work:tabWork,sup:tabSup,net:tabNet,close:tabClose,stock:tabStock,meals:tabMeals,voids:tabVoids,tips:tabTips}[st]||tabInv)()+'</main>'+navBar()}
function tabInv(){const o=stats(ui.period),hid=ui.hide||locked(),v=x=>hid?'•••':money(roundM(x));
 return `<div class="card"><div class="opt" style="padding-top:0"><div class="gr"><b>الإحصائيات</b></div>${perSel()}
 <button class="ib sm" data-a="hidestats" aria-label="إخفاء الأرقام">${ic(locked()?'lock':'eye')}</button></div>${custRange()}
 <div class="st3"><div class="st"><small>الفواتير</small><b>${hid?'•••':fmt(o.n)}</b></div><div class="st"><small>الإيراد</small><b>${v(o.rev)}</b></div>${S().costOn?`<div class="st"><small>ربح البيع</small><b>${v(o.profit)}</b></div>`:LITE?`<div class="st"><small>متوسط الطلب</small><b>${v(o.n?o.rev/o.n:0)}</b></div>`:`<div class="st"><small>ديون</small><b>${v(o.debt)}</b></div>`}</div>
 <div class="kv"><span>كاش</span><b>${v(o.cash)}</b></div><div class="kv"><span>شام كاش</span><b>${v(o.sham)}</b></div>${LITE?'':`<div class="kv"><span>ديون غير مدفوعة</span><b>${v(o.debt)}</b></div>`}
 ${o.nocost&&!hid&&S().costOn?`<div class="note">${o.nocost} صنف مباع بلا سعر تكلفة، وربحه غير محسوب. أدخل التكلفة من المخزون.</div>`:''}</div>
 <button class="btn wa wide mb" data-a="opensheet" data-v="report">${ic('wa')} إرسال تقرير لصاحب المحل</button>
 <div class="srch">${ic('search')}<input data-i="salesq" inputmode="numeric" value="${esc(ui.sq)}" placeholder="ابحث برقم الفاتورة"></div>
 ${opt('إظهار الفواتير المُسترجعة','',sw(ui.showRef,'showref',''))}<div id="saleslist" class="mt">${salesList()}</div>`}
function tabExp(){const [st,en]=prange(ui.period),l=DB.expenses.filter(e=>inR(e.t,st,en)).sort((a,b)=>b.t-a.t),by={};
 for(const e of l)by[e.cat]=(by[e.cat]||0)+conv(e.amt,e.cur,S().cur);
 return `<div class="card"><div class="opt" style="padding-top:0"><div class="gr"><b>المصاريف</b></div>${perSel()}</div>${custRange()}
 <div class="kv mt"><span>المجموع</span><b>${money(roundM(expTotal(st,en)))}</b></div>${Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="kv"><span>${esc(k)}</span><b>${money(roundM(v))}</b></div>`).join('')}</div>
 ${l.length?l.slice(0,300).map(e=>`<button class="li" data-a="delexp" data-id="${e.id}"><div class="gr"><b>${esc(e.cat)}${e.note?' · '+esc(e.note):''}</b><small>${dt(e.t)}${e.drawer?' · من الصندوق':''}${e.by?' · '+esc(e.by):''}</small></div><b class="num" style="color:var(--bad)">${money(e.amt,e.cur)}</b></button>`).join(''):empty('money','لا توجد مصاريف بهالفترة')}
 <div style="height:70px"></div><button class="fab" data-a="opensheet" data-v="expform">${ic('plus')} مصروف جديد</button>`}
function tabWork(){
 return (DB.workers.length?DB.workers.map(w=>{const pd=roundM(wkPaid(w,wkStart(w)),w.cur),rem=roundM(w.salary-pd,w.cur);
  return `<button class="li" data-a="open" data-v="worker" data-id="${w.id}"><span class="av">${esc(w.name[0]||'?')}</span><div class="gr"><b>${esc(w.name)}</b><small>الراتب ${wkLbl(w)} ${money(w.salary,w.cur)} · مدفوع ${wkNow(w)} ${money(pd,w.cur)}</small></div><span class="badge ${rem>0?'low':''}">${rem>0?'باقي '+money(rem,w.cur):'مكتمل'}</span></button>`}).join(''):empty('users','لا يوجد عمال','أضف العمال لتسجيل الرواتب والسلف'))
 +`<div style="height:70px"></div><button class="fab" data-a="opensheet" data-v="workform">${ic('plus')} إضافة عامل</button>`}
function tabSup(){const tot=DB.suppliers.reduce((a,s)=>a+Math.max(0,supBal(s.id)),0);
 return `<div class="card"><div class="kv" style="margin:0"><span>مجموع ديون المحل للموردين</span><b style="color:var(--bad)">${money(roundM(tot))}</b></div></div>`
 +(DB.suppliers.length?DB.suppliers.map(s=>{const b=roundM(supBal(s.id));return `<button class="li" data-a="open" data-v="sup" data-id="${s.id}"><span class="av">${esc(s.name[0]||'?')}</span><div class="gr"><b>${esc(s.name)}</b><small>${esc(s.phone||'بدون رقم')}</small></div><span class="badge ${b>0?'out':''}">${b>0?'علينا '+money(b):'لا دين'}</span></button>`}).join(''):empty('box','لا يوجد موردين','سجّل فواتير الشراء والدفعات لكل مورد'))
 +`<div style="height:70px"></div><button class="fab" data-a="opensheet" data-v="supform">${ic('plus')} إضافة مورد</button>`}
function tabNet(){const o=stats(ui.period),[st,en]=prange(ui.period),ex=expTotal(st,en),co=S().costOn,pu=!co&&KIND==='rest'?purTotal(st,en):0,net=co?o.profit-ex:o.rev-ex-pu;
 return `<div class="card"><div class="opt" style="padding-top:0"><div class="gr"><b>صافي الربح</b></div>${perSel()}</div>${custRange()}
 <div class="kv mt"><span>المبيعات</span><b>${money(roundM(o.rev))}</b></div>${co?`<div class="kv"><span>ربح البيع (السعر − التكلفة)</span><b>${money(roundM(o.profit))}</b></div>`:''}
 ${pu?`<div class="kv"><span>مشتريات مواد (فواتير الموردين)</span><b style="color:var(--bad)">− ${money(roundM(pu))}</b></div>`:''}<div class="kv"><span>المصاريف والرواتب</span><b style="color:var(--bad)">− ${money(roundM(ex))}</b></div>
 <div class="tag lg mt" style="display:flex;justify-content:space-between;padding:12px"><span>${co||pu?'صافي الربح':'الصافي بعد المصاريف'}</span><span>${money(roundM(net))}</span></div>
 ${o.nocost&&co?`<div class="note">${o.nocost} صنف بلا سعر تكلفة، فالربح الفعلي أعلى من المعروض.</div>`:''}</div>
 <button class="btn wa wide" data-a="opensheet" data-v="report">${ic('wa')} إرسال التقرير لصاحب المحل</button>`}
function tabClose(){const c=drawerCalc();
 return `<div class="card"><h3>إغلاق الصندوق</h3><p class="sub">${c.since?'منذ آخر إغلاق: '+dt(c.since):'منذ بداية الاستخدام'}</p>
 <div class="kv"><span>مبيعات كاش</span><b>${money(c.sales)}</b></div><div class="kv"><span>دفعات ديون مستلمة</span><b>${money(c.debts)}</b></div><div class="kv"><span>مصاريف من الصندوق</span><b>− ${money(c.exp)}</b></div>${c.tips?`<div class="kv"><span>بخشيش العمال بالدرج (مو للمحل)</span><b>${money(c.tips)}</b></div>`:''}
 <div class="kv"><span><b>المفروض بالصندوق</b></span><b>${money(c.exp2)}</b></div><div class="kv"><span>شام كاش مستلم (مو بالدرج)</span><b>${money(c.sham)}</b></div>
 <label class="f mt">المبلغ الموجود فعلياً<input id="cnt" inputmode="decimal" placeholder="عدّ المصاري واكتب المبلغ"></label>
 <button class="btn pri wide" data-a="doclose">${ic('check')} إغلاق الصندوق وإرسال لصاحب المحل</button></div>
 <h2 class="sec">الإغلاقات السابقة</h2>${DB.closes.length?DB.closes.slice(0,60).map(x=>`<div class="li"><div class="gr"><b>${dt(x.t)}</b><small>المفروض ${money(x.exp,x.cur)} · الموجود ${money(x.cnt,x.cur)}${x.by?' · '+esc(x.by):''}</small></div><span class="badge ${x.diff<0?'out':x.diff>0?'low':''}">${x.diff===0?'مطابق':(x.diff>0?'زيادة ':'نقص ')+money(Math.abs(x.diff),x.cur)}</span></div>`).join(''):empty('money','لا يوجد إغلاقات')}`}
/* نهاية الدفعة 2 من p5 */

/* ============ الإعدادات ============ */
const FSZ=[[0.9,'صغير'],[1,'عادي'],[1.12,'كبير'],[1.25,'أكبر']];
const card=(t,sub,body)=>`<div class="card">${t?`<h3>${t}</h3>`:''}${sub?`<p class="sub">${sub}</p>`:''}${body}</div>`;
const liBtn=(a,v,icn,t,s,id)=>`<button class="li" data-a="${a}" data-v="${v||''}"${id?` data-id="${id}"`:''} style="margin:0 0 8px">${ic(icn)}<div class="gr"><b>${t}</b>${s?`<small>${s}</small>`:''}</div></button>`;
function setView(){const s=S(),rest=s.kind==='rest';
 if(locked())return head('الإعدادات')+`<div class="lock">${ic('lock')}<b>الإعدادات مقفلة</b><input class="inp" id="pinin" inputmode="numeric" type="password" maxlength="8" placeholder="••••"><button class="btn pri" data-a="unlock">فتح</button></div>`+navBar();
 const rx=s.cur==='USD'?'':`<div class="note">مثال: ${fmt(1233)} ← ${fmt(s.rounding?Math.round(1233/5)*5:1233)} ل.س</div>`;
 return head('الإعدادات')+`<main class="main">${notices()}
 ${card('بيانات المتجر','تظهر على الفواتير ورسائل واتساب',`<label class="f">اسم صاحب المحل<input id="s_oname" value="${esc(s.ownerName||'')}"></label>
 <label class="f">اسم ${rest?'المطعم':'المتجر'}<input id="s_store" value="${esc(s.store)}"></label><label class="f">رقم الهاتف<input id="s_phone" inputmode="tel" value="${esc(s.phone)}"></label>
 <label class="f">واتساب صاحب المحل (للتقارير)<input id="s_owner" inputmode="tel" value="${esc(s.owner||'')}" placeholder="مثال: 0934000000"></label>
 <label class="f">اسم الكاشير (بينطبع على الفاتورة)<input id="s_cashier" value="${esc(s.cashier||'')}" placeholder="اتركه فاضي إذا ما بدك اسم"></label>
 <label class="f">عبارة أسفل الفاتورة<input id="s_footer" value="${esc(s.footer)}" placeholder="مثال: شكراً لزيارتكم"></label><button class="btn pri wide" data-a="savestore">حفظ بيانات المتجر</button>`)}
 ${LITE?'':card('الكاشيرية','كل كاشير إله اسم ورمز، واسمه بينطبع على الفاتورة',`${s.users.map(u=>`<button class="li" data-a="opensheet" data-v="userform" data-id="${u.id}" style="margin:0 0 8px">${ic('user')}<div class="gr"><b>${esc(u.name)}</b><small>${u.role==='admin'?'مدير: يشوف كل شي':'كاشير: بيع فقط بدون أرباح وإعدادات'}</small></div></button>`).join('')}
 <button class="btn ghost wide" data-a="opensheet" data-v="userform">${ic('plus')} إضافة كاشير</button>${s.users.length?opt('اسأل مين الكاشير عند فتح التطبيق','',sw(s.askUser,'tg','askUser')):''}`)}
 ${card('العملة وسعر الصرف','الأسعار المدخلة بالدولار تتحول تلقائياً حسب سعر الصرف',`${opt('عملة البيع','',seg('setcur',s.cur,[['SYP','ل.س'],['USD','$']]))}
 <label class="f mt">سعر صرف الدولار (ل.س)<input data-c="rate" inputmode="decimal" value="${s.rate}"></label>${s.rateAt?`<div class="note">آخر تحديث تلقائي: ${dt(s.rateAt)}</div>`:''}
 ${opt('تحديث سعر الصرف تلقائياً','من الإنترنت، وإذا مطفي بيجيك اقتراح وانت بتعتمده',sw(s.rateAuto,'tg','rateAuto'))}
 ${opt('تقريب الأسعار','تقريب السعر بالليرة إلى أقرب 5',sw(s.rounding,'tg','rounding'))}${rx}
 ${opt('عرض المبلغ بالعملتين','الإجمالي بالليرة وما يعادله بالدولار على الشاشة والفاتورة',sw(s.dual,'tg','dual'))}`)}
 ${card('شاشة البيع','',`<div class="f">الكميات السريعة<div class="chips" style="flex-wrap:wrap;margin-top:6px">${QOPTS.map(v=>`<button class="chip ${s.quick.includes(v)?'on':''}" data-a="qopt" data-v="${v}">${fq(v)}</button>`).join('')}</div></div>
 ${opt('عدد المنتجات في السطر','',seg('cols',s.cols,[[2,'2'],[3,'3'],[4,'4']]))}${opt('حجم الخط','',seg('fs',s.fs,FSZ))}${opt('ملء كامل الشاشة','للتابلت والشاشات العريضة',sw(s.wide!==false,'tgw',''))}${rest?`<div class="card" style="margin:10px 0;padding:10px 12px"><b>أرقام الطلبات</b><div class="note">آخر رقم طلب: ${DB.oseq||0}</div>${opt('بترجع من رقم 1','',seg('oreset',s.oreset||(rest?'close':'hour'),[['close','عند إغلاق الصندوق'],['hour','كل يوم']]))}${(s.oreset||(rest?'close':'hour'))==='hour'?opt('ساعة بداية الدوام','الترقيم بيتصفّر بهالساعة، مو 12 بالليل',seg('ohour',s.ohour==null?5:s.ohour,[[0,'12 بالليل'],[3,'3 الفجر'],[5,'5 الصبح'],[8,'8 الصبح']])):'<div class="note">لما تكبس إغلاق الصندوق آخر الدوام (المبيعات ← إغلاق الصندوق) الطلبات بترجع تبلّش من 1.</div>'}<button class="btn ghost wide mt" data-a="oseq0">رجّع الترقيم لـ1 هلق</button></div>`:''}${rest?`<label class="f mt">ملاحظات المطبخ الجاهزة (افصل بينها بفاصلة)<input id="s_notes" value="${esc(notesL().join('، '))}"></label><button class="btn ghost wide mb" data-a="savenotes">حفظ الملاحظات</button>`:''}${rest?`<div class="frow mt"><label class="f" style="margin:0">عدد الطاولات بالشاشة الرئيسية (0 = بدون)<input id="s_tables" inputmode="numeric" value="${+s.tables||0}"></label><button class="btn pri" data-a="tables" style="margin-bottom:0">حفظ</button></div>`:''}`)}
 ${card('الطباعة','',`${liBtn('open','printer','print','الطابعة الحرارية','الاتصال، العرض، الغمق، التجربة')}
 ${opt('شكل الفاتورة','',seg('tmpl',s.tmpl,[['classic','كلاسيك'],['compact','مختصرة'],['big','خط كبير']]))}
 <button class="btn ghost wide mb" data-a="tmplprev">${ic('eye')} معاينة شكل الفاتورة</button>
 ${opt('طباعة تلقائية بعد كل بيع','',sw(s.autoPrint,'tg','autoPrint'))}${opt('عدد النسخ','',seg('copies',s.copies,[[1,'1'],[2,'2']]))}
 ${opt('فتح درج النقود','مع كل فاتورة كاش (إذا الدرج موصول بالطابعة)',sw(s.drawer,'tg','drawer'))}
 ${rest?opt('طباعة ورقة المطبخ مباشرة','بدون معاينة عند إرسال الطلب',sw(s.autoK,'tg','autoK')):''}`)}
 ${card('النسخ الاحتياطي','التطبيق بياخد نسخة تلقائية كل يوم على الجهاز، وانت احفظ نسخة برا الجهاز (Drive أو واتساب)',`
 <div class="kv"><span>آخر نسخة محفوظة برا الجهاز</span><b>${s.lastShare?dt(s.lastShare):'ولا مرة'}</b></div>
 <button class="btn pri wide mb" data-a="sharebk">${ic('share')} حفظ نسخة الآن (Drive / واتساب)</button>
 <label class="btn ghost wide mb">${ic('down')} استعادة من ملف<input type="file" data-c="restore" hidden></label>
 <button class="btn ghost wide mb" data-a="opensheet" data-v="bklist">${ic('list')} النسخ التلقائية على الجهاز</button>
 ${opt('تذكير بالنسخ الاحتياطي','',seg('bkr',s.bkRemind,[['day','يومي'],['week','أسبوعي'],['off','مطفي']]))}`)}
 ${LITE?'':card('نقل البيانات لجهاز تاني','بتطلع ملف فيه المنتجات والزبائن والفواتير، والجهاز التاني بيدمجها بدون تكرار',`<div class="g2"><button class="btn ghost" data-a="xferout">${ic('share')} تصدير</button><label class="btn ghost">${ic('down')} استلام<input type="file" data-c="xfer" hidden></label></div>`)}
 ${card('المنتجات','',`${liBtn('open','cats','list','الأقسام',DB.cats.length+' قسم')}
 <div class="g2 mb"><button class="btn ghost" data-a="exportcsv">${ic('share')} تصدير Excel</button><label class="btn ghost">${ic('down')} استيراد Excel<input type="file" accept=".csv,text/csv,text/plain" data-c="importcsv" hidden></label></div>
 ${liBtn('opensheet','bulk','tag','تعديل الأسعار بالجملة','رفع أو خفض بنسبة مئوية')}
 ${rest?'':opt('سعر الجملة','سعر تاني للمنتج، وبشاشة البيع بتختار مفرق أو جملة',sw(s.whole,'tg','whole'))}
 ${LITE?'':opt('سعر التكلفة والأرباح','إذا طفيته: إضافة المنتج بتصير باركود واسم وسعر بس، وما بيطلع حساب أرباح',sw(s.costOn,'tg','costOn'))}
 ${rest?'':`${opt('ملصقات الباركود','طباعة ملصق باسم المنتج وسعره وباركود',sw(s.labels,'tg','labels'))}${s.labels?liBtn('open','labels','print','طباعة ملصقات',''):''}
 ${opt('تاريخ انتهاء الصلاحية','حقل جديد للمنتج مع تنبيه قبل الانتهاء',sw(s.expiry,'tg','expiry'))}
 ${s.expiry?`<label class="f mt">نبّهني قبل الانتهاء بـ (يوم)<input data-c="expdays" inputmode="numeric" value="${s.expDays}"></label>`:''}`}`)}
 ${card('الخصم','',`${opt('الخصم على الفاتورة','أزرار خصم جاهزة بشاشة إنهاء البيع',sw(s.discOn,'tg','discOn'))}${s.discOn?`<label class="f mt">نسب الخصم الجاهزة<input id="discsin" value="${s.discs.join('، ')}" placeholder="5، 7، 10"></label><button class="btn ghost wide" data-a="discs">حفظ النسب</button>`:''}`)}
 ${LITE?'':card('الحسابات والتقارير','',`${opt('إغلاق الصندوق','مطابقة المصاري آخر الدوام وإرسالها لصاحب المحل',sw(s.closeOn,'tg','closeOn'))}
 ${opt('تذكير بالتقرير الأسبوعي','',sw(s.repWeek,'tg','repWeek'))}${opt('تذكير بالتقرير الشهري','',sw(s.repMonth,'tg','repMonth'))}`)}
 ${card('خيارات إضافية','',`${opt('المظهر','',seg('theme',s.theme,[['light','فاتح'],['dark','داكن'],['auto','تلقائي']]))}
 ${LITE?'':`${opt('صوت عند المسح','',sw(s.beep,'tg','beep'))}${opt('اهتزاز عند المسح','',sw(s.vibrate,'tg','vibrate'))}
 ${opt('إظهار آخر منتج ممسوح','',sw(s.showLast,'tg','showLast'))}${opt('تنبيه قرب نفاد المنتج','',sw(s.lowAlert,'tg','lowAlert'))}`}
 ${s.lowAlert?`<label class="f mt">التنبيه عندما تصل الكمية إلى<input data-c="lowat" inputmode="decimal" value="${s.lowAt}"></label>`:''}
 ${opt('سجل النشاطات','',sw(s.log,'tg','log'))}${s.log?liBtn('open','log','eye','عرض سجل النشاطات',DB.log.length+' حركة'):''}
 ${s.pin?opt('الرمز بيقفل','',seg('sset',s.netLock||(/عوافي/.test(s.store||'')?'long':'all'),[['all','الصافي كلو'],['long','الأسبوعي والشهري بس']],'netLock')):''}${opt('🔒 رمز الصافي','رمز سري لصاحب المحل: صفحة الصافي (الأرباح) ما بتنفتح إلا فيه',s.pin?`<button class="btn sm bad" data-a="rmpin">إلغاء القفل</button>`:`<button class="btn sm" data-a="opensheet" data-v="pin">تعيين رمز</button>`)}`)}
 ${subCard()}
 ${card('الدعم الفني','شركة الخنساء للتصميم والبرمجة',`<button class="btn wa wide mb" data-a="support">${ic('wa')} تواصل معنا على واتساب</button>
 <button class="btn ghost wide mb" data-a="shareapp">${ic('share')} شارك التطبيق مع صديق</button><button class="btn ghost wide mb" data-a="opensheet" data-v="terms" data-id="view">${ic('list')} الشروط والأحكام</button>
 <div class="kv"><span>رقم الجهاز</span><b class="num">${DB.lic.dev}</b></div><div class="kv"><span>الإصدار</span><b class="num">${VERSION}</b></div>`)}
 <div class="card" style="border:1.5px solid var(--bad)"><h3 style="color:var(--bad)">منطقة الخطر</h3><p class="sub">حذف كل المنتجات والفواتير والزبائن من هالجهاز. احفظ نسخة احتياطية قبل.</p><button class="btn ghost bad wide" data-a="opensheet" data-v="wipe">${ic('trash')} حذف كل البيانات</button></div>
 </main>`+navBar()}
function subCard(){const life=licTime()&&DB.lic.until-licNow()>36500*DAY,t=trialLeft(),pct=licTime()?100:Math.round(t/TRIAL_DAYS*100);
 return card('الاشتراك','',`<div class="kv"><span>${esc(licText())}</span></div>${life?'':`<div style="height:8px;border-radius:6px;background:var(--soft);overflow:hidden;margin:6px 0 10px"><div style="height:100%;width:${pct}%;background:var(--${licTime()?'ok':t>3?'pri':'bad'})"></div></div>`}
 ${life?'':`<button class="btn pri wide" data-a="open" data-v="act">${ic('tag')} ${licTime()?'تجديد الاشتراك':'تفعيل الاشتراك'}</button>`}`)}
/* نهاية الدفعة 3 من p5 */

/* ============ صفحات جديدة ============ */
P.worker=p=>{const w=DB.workers.find(x=>x.id===p.id);if(!w)return head('عامل','',true)+'<main class="main"></main>';const pd=roundM(wkPaid(w,wkStart(w)),w.cur),
 l=DB.expenses.filter(e=>e.wid===w.id).sort((a,b)=>b.t-a.t);
 return head(w.name,`<button class="ib" data-a="opensheet" data-v="workform" data-id="${w.id}" aria-label="تعديل">${ic('edit')}</button>`,true)+`<main class="main">
 <div class="card" style="text-align:center"><div class="note">${esc(w.phone||'بدون رقم')} · الراتب ${wkLbl(w)}</div><div class="tag lg" style="font-size:24px;margin:6px 0">${money(w.salary,w.cur)}</div>
 <div class="kv"><span>المدفوع ${wkNow(w)} (رواتب وسلف)</span><b>${money(pd,w.cur)}</b></div><div class="kv"><span>الباقي إله</span><b>${money(roundM(w.salary-pd,w.cur),w.cur)}</b></div>
 <div class="g2 mt"><button class="btn ghost" data-a="opensheet" data-v="wpay" data-id="${w.id}" data-k="adv">${ic('money')} سلفة</button><button class="btn pri" data-a="opensheet" data-v="wpay" data-id="${w.id}" data-k="sal">${ic('check')} دفع راتب</button></div></div>
 <h2 class="sec">السجل</h2>${l.length?l.map(e=>`<button class="li" data-a="delexp" data-id="${e.id}"><div class="gr"><b>${e.kind==='adv'?'سلفة':'راتب'}${e.note?' · '+esc(e.note):''}</b><small>${dt(e.t)}</small></div><b class="num">${money(e.amt,e.cur)}</b></button>`).join(''):empty('money','لا يوجد حركات')}
 <button class="btn ghost bad wide mt" data-a="delworker" data-id="${w.id}">${ic('trash')} حذف العامل</button></main>`};
P.sup=p=>{const s=DB.suppliers.find(x=>x.id===p.id);if(!s)return head('مورد','',true)+'<main class="main"></main>';const b=roundM(supBal(s.id)),l=DB.sledger.filter(x=>x.sid===s.id).sort((a,z)=>z.t-a.t);
 return head(s.name,`<button class="ib" data-a="opensheet" data-v="supform" data-id="${s.id}" aria-label="تعديل">${ic('edit')}</button>`,true)+`<main class="main">
 <div class="card" style="text-align:center"><div class="note">${esc(s.phone||'بدون رقم')} · المبلغ المستحق للمورد</div><div class="tag lg" style="font-size:24px;margin:6px 0">${money(Math.max(0,b))}</div>${b<0?`<div class="badge">رصيد لنا عنده: ${money(-b)}</div>`:''}
 <div class="g2 mt"><button class="btn ghost" data-a="opensheet" data-v="sbill" data-id="${s.id}">${ic('plus')} فاتورة شراء</button><button class="btn pri" data-a="opensheet" data-v="spay" data-id="${s.id}">${ic('money')} دفعة للمورد</button></div>
 ${s.phone?`<button class="btn wa wide mt" data-a="supwa" data-id="${s.id}">${ic('wa')} مراسلة المورد</button>`:''}</div>
 <h2 class="sec">الحركات</h2>${l.length?l.map(x=>`<div class="li">${x.img?`<img src="${x.img}" data-a="simg" data-id="${x.id}" alt="صورة الفاتورة" style="width:44px;height:44px;object-fit:cover;border-radius:8px">`:''}<div class="gr"><b>${x.amt>0?'فاتورة شراء':'دفعة'}${x.note?' · '+esc(x.note):''}</b><small>${dt(x.t)}</small></div><b class="num" style="color:var(--${x.amt>0?'bad':'ok'})">${x.amt>0?'+':'−'} ${money(Math.abs(x.amt),x.cur)}</b><button class="ib sm" data-a="delsl" data-id="${x.id}" aria-label="حذف">${ic('trash')}</button></div>`).join(''):empty('box','لا توجد حركات')}
 <button class="btn ghost bad wide mt" data-a="delsup" data-id="${s.id}">${ic('trash')} حذف المورد</button></main>`};
P.labels=()=>{const q=(ui.lq||'').trim(),L=ui.lab||(ui.lab={}),list=DB.products.filter(p=>!q||p.name.includes(q)||(p.barcode||'').includes(q)).slice(0,150),n=Object.values(L).reduce((a,b)=>a+b,0);
 return head('طباعة ملصقات','',true)+`<main class="main"><div class="note">اختار المنتجات وعدد الملصقات. المنتج اللي ما إله باركود بنعطيه رقم داخلي تلقائي.</div>
 <div class="srch">${ic('search')}<input data-i="lq" value="${esc(q)}" placeholder="ابحث بالاسم أو الباركود"></div>
 <div id="lablist">${labList(list)}</div><div style="height:80px"></div></main><button class="fab" data-a="labprint" ${n?'':'disabled'}>${ic('print')} طباعة ${n||''} ملصق</button>`};
function labList(list){const L=ui.lab||{};list=list||DB.products.filter(p=>!ui.lq||p.name.includes(ui.lq)).slice(0,150);
 return list.length?list.map(p=>`<div class="li"><div class="gr"><b>${esc(p.name)}</b><small>${money(pPrice(p))} · ${esc(p.barcode||'بدون باركود')}</small></div>
 <button class="ib sm" data-a="labq" data-id="${p.id}" data-d="-1">${ic('minus')}</button><b class="num" style="min-width:22px;text-align:center">${L[p.id]||0}</b><button class="ib sm" data-a="labq" data-id="${p.id}" data-d="1">${ic('plus')}</button></div>`).join(''):empty('box','لا توجد منتجات')}
P.expiring=()=>{const l=expSoon(),now=Date.now();return head('الصلاحية','',true)+`<main class="main">${l.length?l.map(p=>{const d=Math.ceil((dayStart(p.exp)-now)/DAY);
 return `<button class="li" data-a="editprod" data-id="${p.id}"><div class="gr"><b>${esc(p.name)}</b><small>ينتهي ${esc(p.exp)}${p.track?' · الكمية '+fmt(p.stock):''}</small></div><span class="badge ${d<0?'out':'low'}">${d<0?'منتهي':d===0?'اليوم':'باقي '+d+' يوم'}</span></button>`}).join(''):empty('check','ما في منتجات قريبة الانتهاء')}</main>`};
/* نهاية الدفعة 4 من p5 */

/* ============ النوافذ المنبثقة ============ */
const TERMS=['بيانات محلك (المنتجات والفواتير والزبائن) محفوظة على هالجهاز فقط، وإنت المسؤول عن أخذ نسخة احتياطية منها.',
 `التطبيق مجاني للتجربة ${TRIAL_DAYS} أيام، وبعدها بيحتاج اشتراك مدفوع حتى تكمل البيع.`,
 'إنت المسؤول عن صحة الأسعار والكميات والبيانات اللي بتدخلها.',
 'ما منتحمل مسؤولية ضياع البيانات إذا انحذف التطبيق أو تعطل الجهاز وما في نسخة احتياطية.',
 'التطبيق أداة مساعدة للبيع والحسابات، وما بيغني عن المحاسب أو الالتزامات القانونية والضريبية.',
 'الطباعة بتشتغل مع الطابعات الحرارية المتوافقة، وما منضمن كل أنواع الطابعات.',
 'كود التفعيل مربوط بجهاز واحد، ما بينشارك وما بينرد ثمنه بعد التفعيل.',
 'التحديثات والأسعار ممكن تتغير، ومنبلغك بأي تغيير مهم داخل التطبيق.'];
SH.welcome=()=>{const w=ui.wd||(ui.wd={owner:'',store:'',phone:'',rate:''});return `<h3>أهلاً بك في ${APPNAME}</h3><p class="note">معلومات بسيطة قبل ما نبلش، وفيك تغيرها بعدين من الإعدادات.</p>
 <label class="f mt">اسمك<input id="w_owner" value="${esc(w.owner)}" placeholder="اسم صاحب المحل"></label>
 <label class="f">اسم ${ui.wk==='rest'?'المطعم':'المتجر'}<input id="w_store" value="${esc(w.store)}" placeholder="${ui.wk==='rest'?'مثال: مطعم الأصيل':'مثال: سوبر ماركت الأمل'}"></label>
 <label class="f">رقم الهاتف<input id="w_phone" inputmode="tel" value="${esc(w.phone)}" placeholder="09xxxxxxxx"></label>
 <label class="f">سعر صرف الدولار اليوم (ل.س)<input id="w_rate" inputmode="decimal" value="${esc(w.rate||S().rate)}"></label>
 ${opt('إضافة أصناف مثال','لتجربة التطبيق مباشرة، ويمكن حذفها لاحقاً',sw(ui.ws,'wsample',''))}
 <button class="btn pri wide" data-a="savewelcome">التالي</button>`};
SH.terms=p=>`<h3>الشروط والأحكام</h3><ol style="margin:0;padding-inline-start:20px;line-height:1.75;font-size:14px">${TERMS.map(t=>`<li>${t}</li>`).join('')}</ol>
 ${p.id==='view'?`<button class="btn pri wide mt" data-a="back">تم</button>${S().agreed?`<div class="note">وافقت عليها بتاريخ ${dt(S().agreed)}</div>`:''}`:
 `<label class="opt mt" style="cursor:pointer"><input type="checkbox" id="agree" style="width:22px;height:22px"><b style="flex:1">قرأت الشروط وأوافق عليها</b></label><button class="btn pri wide" data-a="agree">${ic('check')} أوافق ونبلش</button>`}`;
SH.perms=()=>`<h3>شغلات رح يطلبها التطبيق</h3>
 <div class="li" style="margin:0 0 8px">${ic('scan')}<div class="gr"><b>الكاميرا</b><small>لمسح باركود المنتجات</small></div></div>
 <div class="li" style="margin:0 0 8px">${ic('print')}<div class="gr"><b>البلوتوث</b><small>للاتصال بالطابعة الحرارية</small></div></div>
 <div class="li" style="margin:0 0 8px">${ic('down')}<div class="gr"><b>الملفات</b><small>لحفظ النسخ الاحتياطية ومشاركتها</small></div></div>
 <p class="note">لما يطلب الإذن اكبس "سماح". التطبيق ما بيرسل بياناتك لحدا.</p><button class="btn pri wide" data-a="permsok">${ic('check')} تمام</button>`;
SH.upd=()=>{const r=DB.remote||{};return `<h3>تحديث جديد ${esc(r.ver||'')}</h3><p class="note">${esc(r.notes||'في تحسينات وإصلاحات جديدة.')}</p>
 <button class="btn pri wide" data-a="doupd">${ic('down')} تحديث الآن</button>${r.force?'<div class="note">هالتحديث ضروري حتى تكمل استخدام التطبيق.</div>':`<button class="btn ghost wide mt" data-a="updlater">لاحقاً</button>`}`};
SH.who=()=>{const pk=ui.whoPick&&S().users.find(u=>u.id===ui.whoPick);
 if(pk)return `<h3>${esc(pk.name)}</h3><label class="f">الرمز<input id="whopin" type="password" inputmode="numeric" maxlength="8" data-focus></label><div class="g2"><button class="btn ghost" data-a="whoback">رجوع</button><button class="btn pri" data-a="whook">دخول</button></div>`;
 return `<h3>مين عم يشتغل هلق؟</h3>${S().users.map(u=>`<button class="li" data-a="whopick" data-id="${u.id}" style="margin:0 0 8px">${ic('user')}<div class="gr"><b>${esc(u.name)}</b><small>${u.role==='admin'?'مدير':'كاشير'}</small></div>${ui.user===u.id?'<span class="badge">الحالي</span>':''}</button>`).join('')}`};
SH.userform=p=>{const u=p.id&&S().users.find(x=>x.id===p.id)||{name:'',pin:'',role:ui.urole||'cashier'};if(!p.id&&!ui.urole)ui.urole='cashier';const role=p.id?(ui.urole||u.role):ui.urole;
 return `<h3>${p.id?'تعديل كاشير':'كاشير جديد'}</h3><label class="f">الاسم<input id="uname" value="${esc(u.name)}" data-focus></label><label class="f">رمز الدخول (4 أرقام أو أكثر)<input id="upin" inputmode="numeric" maxlength="8" value="${esc(u.pin)}"></label>
 ${opt('الصلاحية','',seg('urole',role,[['cashier','كاشير'],['admin','مدير']]))}<button class="btn pri wide mt" data-a="saveuser" data-id="${p.id||''}">${ic('check')} حفظ</button>${p.id?`<button class="btn ghost bad wide mt" data-a="deluser" data-id="${p.id}">${ic('trash')} حذف</button>`:''}`};
SH.expform=()=>{const c=ui.ecat||'أخرى';return `<h3>مصروف جديد</h3><div class="frow"><label class="f">المبلغ<input id="eamt" inputmode="decimal" data-focus></label><div style="margin-bottom:12px">${seg('ecur',ui.ecur||S().cur,[['SYP','ل.س'],['USD','$']])}</div></div>
 <div class="f">النوع<div class="chips" style="flex-wrap:wrap;margin-top:6px">${EXPCATS.filter(x=>x!=='رواتب'&&x!=='سلف').map(x=>`<button class="chip ${c===x?'on':''}" data-a="ecat" data-v="${x}">${x}</button>`).join('')}</div></div>
 <label class="f">ملاحظة (اختياري)<input id="enote"></label><label class="f">التاريخ<input id="edate" type="date" value="${isoToday()}"></label>
 ${opt('مدفوع من صندوق الكاشير','بينخصم من مصاري الصندوق عند الإغلاق',sw(ui.edrawer!==false,'edrawer',''))}<button class="btn pri wide mt" data-a="saveexp">${ic('check')} حفظ</button>`};
SH.workform=p=>{const w=p.id&&DB.workers.find(x=>x.id===p.id)||{name:'',phone:'',salary:'',cur:S().cur,per:'month'};if(!ui.wcur)ui.wcur=w.cur;if(!ui.wper)ui.wper=w.per||'month';
 return `<h3>${p.id?'تعديل عامل':'عامل جديد'}</h3><label class="f">الاسم<input id="wname" value="${esc(w.name)}" data-focus></label><label class="f">رقم الهاتف<input id="wphone" inputmode="tel" value="${esc(w.phone)}"></label>
 ${opt('نوع الراتب','',seg('wper',ui.wper,[['month','شهري'],['week','أسبوعي']]))}
 <div class="frow mt"><label class="f">الراتب<input id="wsal" inputmode="decimal" value="${esc(String(w.salary))}"></label><div style="margin-bottom:12px">${seg('wcur',ui.wcur,[['SYP','ل.س'],['USD','$']])}</div></div>
 <button class="btn pri wide" data-a="saveworker" data-id="${p.id||''}">${ic('check')} حفظ</button>`};
SH.wpay=p=>{const w=DB.workers.find(x=>x.id===p.id);if(!w)return '';const sal=p.k==='sal',rem=roundM(w.salary-wkPaid(w,wkStart(w)),w.cur);
 return `<h3>${sal?'دفع راتب':'سلفة'}: ${esc(w.name)}</h3><label class="f">المبلغ (${w.cur==='USD'?'$':'ل.س'})<input id="wamt" inputmode="decimal" value="${sal&&rem>0?rem:''}" data-focus></label><label class="f">ملاحظة (اختياري)<input id="wnote"></label>
 ${opt('من صندوق الكاشير','',sw(ui.edrawer!==false,'edrawer',''))}<button class="btn pri wide mt" data-a="savewpay" data-id="${w.id}" data-k="${p.k}">${ic('check')} حفظ</button>`};
SH.supform=p=>{const s=p.id&&DB.suppliers.find(x=>x.id===p.id)||{name:'',phone:'',note:''};
 return `<h3>${p.id?'تعديل مورد':'مورد جديد'}</h3><label class="f">اسم المورد أو الشركة<input id="sname" value="${esc(s.name)}" data-focus></label><label class="f">رقم الهاتف<input id="sphone" inputmode="tel" value="${esc(s.phone)}"></label>
 <label class="f">ملاحظة<input id="snote" value="${esc(s.note||'')}" placeholder="شو بيورّد؟"></label><button class="btn pri wide" data-a="savesup" data-id="${p.id||''}">${ic('check')} حفظ</button>`};
SH.sbill=p=>`<h3>فاتورة شراء</h3><div class="frow"><label class="f">مبلغ الفاتورة<input id="bamt" inputmode="decimal" data-focus></label><div style="margin-bottom:12px">${seg('ecur',ui.ecur||S().cur,[['SYP','ل.س'],['USD','$']])}</div></div>
 <label class="f">المدفوع منها الآن (اختياري)<input id="bpaid" inputmode="decimal" placeholder="0"></label><label class="f">ملاحظة أو رقم الفاتورة<input id="bnote"></label>
 <label class="btn ghost wide mb">${ic('img')} <span id="bimgt">${ui.bimg?'تم إرفاق الصورة ✓':'صورة الفاتورة (اختياري)'}</span><input type="file" accept="image/*" capture="environment" data-c="bimg" hidden></label>
 <button class="btn pri wide" data-a="savebill" data-id="${p.id}">${ic('check')} حفظ</button>`;
SH.spay=p=>`<h3>دفعة للمورد</h3><div class="frow"><label class="f">المبلغ<input id="pamt" inputmode="decimal" data-focus></label><div style="margin-bottom:12px">${seg('ecur',ui.ecur||S().cur,[['SYP','ل.س'],['USD','$']])}</div></div>
 <label class="f">ملاحظة (اختياري)<input id="pnote"></label>${opt('من صندوق الكاشير','',sw(ui.edrawer!==false,'edrawer',''))}<button class="btn pri wide mt" data-a="savespay" data-id="${p.id}">${ic('check')} حفظ</button>`;
SH.simg=p=>{const x=DB.sledger.find(l=>l.id===p.id);return `<h3>صورة الفاتورة</h3>${x&&x.img?`<img src="${x.img}" alt="صورة الفاتورة" style="width:100%;border-radius:12px">`:''}<button class="btn pri wide mt" data-a="back">إغلاق</button>`};
SH.bklist=()=>`<h3>النسخ التلقائية</h3><p class="note">التطبيق بيحفظ نسخة كل يوم ${isNative()?'بمجلد Documents/AlKhansaCashier ويحتفظ بآخر 7 نسخ':'داخل المتصفح (آخر 3 أيام)'}.</p><div id="bkl">${ui.bkl?ui.bkl.length?ui.bkl.map(b=>`<button class="li" data-a="bkrestore" data-v="${esc(b.k)}" style="margin:0 0 8px">${ic('down')}<div class="gr"><b>${fmtD(b.d)}</b><small>اكبس للاستعادة</small></div></button>`).join(''):empty('down','لا توجد نسخ بعد'):'<div class="note">جارٍ التحميل…</div>'}</div>`;
SH.wipe=()=>`<h3 style="color:var(--bad)">حذف كل البيانات</h3><p class="note">رح ينحذف كل شي: المنتجات، الفواتير، الزبائن، المصاريف. الاشتراك بيضل مفعّل. ما في رجعة!</p>
 <label class="f">اكتب كلمة: حذف<input id="wipew"></label>${S().pin||S().users.some(u=>u.role==='admin')?`<label class="f">رمز المدير<input id="wipep" type="password" inputmode="numeric" maxlength="8"></label>`:''}
 <button class="btn bad wide" data-a="dowipe">${ic('trash')} حذف نهائي</button>`;
SH.report=()=>`<h3>إرسال تقرير</h3><div class="chips" style="flex-wrap:wrap">${[['today','اليوم'],['week','أسبوع'],['month','30 يوم'],['mon','هالشهر'],['custom','فترة محددة']].map(([k,t])=>`<button class="chip ${ui.rper===k?'on':''}" data-a="rper" data-v="${k}">${t}</button>`).join('')}</div>
 ${ui.rper==='custom'?`<div class="g2"><label class="f" style="margin:0">من<input type="date" data-c="rfrom" value="${ui.rfrom||isoToday()}"></label><label class="f" style="margin:0">إلى<input type="date" data-c="rto" value="${ui.rto||isoToday()}"></label></div>`:''}
 <div class="card mt" style="white-space:pre-wrap;font-size:14px;line-height:1.6">${esc(reportText(ui.rper,locked()))}</div>
 <label class="f">رقم واتساب صاحب المحل<input id="rowner" inputmode="tel" value="${esc(S().owner||'')}"></label>
 <button class="btn wa wide" data-a="sendreport">${ic('wa')} إرسال على واتساب</button>`;
/* نهاية الدفعة 5 من p5 */

ui.wk=KIND;
const NOTESDEF=['بدون بصل','زيادة ثوم','حار','بدون مخلل','بدون صوص','زيادة'];
Object.assign(A,{qnadd:d=>{const it=carts[d.cn].find(x=>x.pid===ui.sel);if(!it)return;let l=(it.note||'').split('، ').filter(Boolean);l=l.includes(d.v)?l.filter(x=>x!==d.v):l.concat(d.v);it.note=l.join('، ');render()}});
SH.iedit=p=>{const it=carts[p.cn][p.i];if(!it)return '';const nt=ui.inote!=null?ui.inote:(it.note||'');
 return `<h3>${esc(it.name)}</h3>${it.sent?`<p class="note">هالصنف انبعت للمطبخ. إذا غيرت الملاحظة بتنطبع ورقة "تعديل" لما تكبس للمطبخ.</p>`:''}
 <label class="f">الكمية<input id="ieq" inputmode="decimal" value="${it.qty}"></label>
 <div class="f">ملاحظة للمطبخ<div class="chips" style="flex-wrap:wrap;margin-top:6px">${notesL().map(n=>`<button class="chip ${nt.split('، ').includes(n)?'on':''}" data-a="ienote" data-v="${n}">${n}</button>`).join('')}</div>
 <input class="inp" id="ien" value="${esc(nt)}" placeholder="اكتب ملاحظة"></div>
 ${it.qty>1?`<button class="btn ghost wide mb" data-a="isplit">${ic('copy')} افصل واحد منهم بملاحظة خاصة</button><div class="note" style="margin-top:-4px">مثال: 2 بروستد، واحد منهم بدون مخلل</div>`:''}
 <div class="g2 mt"><button class="btn ghost bad" data-a="idel">${ic('trash')} حذف</button><button class="btn pri" data-a="isave">${ic('check')} حفظ</button></div>`};
const ieCur=()=>{const t=topE();return t&&t.name==='iedit'?carts[t.p.cn][t.p.i]:null};
Object.assign(A,{
 iedit:d=>{ui.inote=null;open('iedit',{cn:d.cn,i:+d.i},true)},
 ienote:d=>{const e=$('#ien');let l=(e?e.value:'').split('، ').map(x=>x.trim()).filter(Boolean);l=l.includes(d.v)?l.filter(x=>x!==d.v):l.concat(d.v);ui.inote=l.join('، ');render()},
 isave:()=>{const it=ieCur();if(!it)return;const q=num(val('ieq'));it.note=val('ien');if(q>0)it.qty=r3(q);ui.inote=null;back()},
 idel:()=>{const t=topE();if(!t)return;const it=ieCur();if(it&&it.sent)return ask('هالصنف انبعت للمطبخ. حذفه من الطلب؟','حذف',()=>{carts[t.p.cn].splice(t.p.i,1);back()},true);carts[t.p.cn].splice(t.p.i,1);back()},
 isplit:()=>{const t=topE(),it=ieCur();if(!it||it.qty<=1)return;const sent=it.sent||0;it.qty=r3(it.qty-1);
  const nw=Object.assign({},it,{qty:1,note:'',sent:0,sentNote:''});if(sent>it.qty){nw.sent=Math.min(1,sent-it.qty);nw.sentNote=it.sentNote||'';it.sent=it.qty}
  carts[t.p.cn].splice(t.p.i+1,0,nw);ui.inote=null;swap('iedit',{cn:t.p.cn,i:t.p.i+1},true);toast('انفصل واحد، اختار ملاحظته')}
});

/* ============ البلوتوث الأصلي داخل تطبيق الأندرويد ============ */
const NB=()=>{try{return isNative()&&window.Capacitor.Plugins.BluetoothLe||null}catch(e){return null}};
const hexOf=u8=>Array.from(u8,b=>b.toString(16).padStart(2,'0')).join('');
async function nbInit(){if(nbInit.ok)return;await NB().initialize({androidNeverForLocation:true});nbInit.ok=1}
async function nbOpen(slot,deviceId,name){const P=NB();bs(slot);await nbInit();
 try{await P.disconnect({deviceId})}catch(e){}
 try{await P.addListener('disconnected|'+deviceId,()=>{if(ble[slot].id===deviceId)ble[slot].ch=null})}catch(e){}
 await P.connect({deviceId,timeout:12000});
 const svs=((await P.getServices({deviceId}))||{}).services||[];let pick=null;
 for(const sv of svs){for(const c of sv.characteristics||[]){const pr=c.properties||{},o={svc:sv.uuid,uuid:c.uuid,write:!!pr.write,wwr:!!pr.writeWithoutResponse};
   if(o.write){pick=o;break}if(!pick&&o.wwr)pick=o}if(pick&&pick.write)break}
 if(!pick)throw new Error('لم يتم العثور على قناة طباعة');
 try{await P.requestConnectionPriority({deviceId,connectionPriority:1})}catch(e){}
 let mtu=0;try{mtu=((await P.getMtu({deviceId}))||{}).value||0}catch(e){}
 const chunk=pick.write?500:(mtu>23?Math.min(180,mtu-3):20);
 const arg=v=>({deviceId,service:pick.svc,characteristic:pick.uuid,value:hexOf(v)});
 ble[slot].ch={chunk,mtu,wchunk:mtu>23?Math.min(509,mtu-3):20,properties:{write:pick.write,writeWithoutResponse:pick.wwr},writeValueWithResponse:v=>P.write(arg(v)),writeValueWithoutResponse:v=>P.writeWithoutResponse(arg(v))};
 ble[slot].id=deviceId;ble[slot].name=name||'طابعة';
 const bt=S().bt||(S().bt={});bt[slot]={id:deviceId,name:ble[slot].name};save()}
async function nbStart(){const P=NB();if(!P)return;try{await nbInit();const r=await P.isEnabled();if(!(r&&r.value))await P.requestEnable()}catch(e){}await nbAuto()}
async function nbAuto(){if(!NB()||!S().bt)return;for(const slot of (S().onePr?['c']:['c'].concat(kStations().map(s=>s.id)))){bs(slot);const x=S().bt[slot];if(!x||ble[slot].ch)continue;
 try{await nbOpen(slot,x.id,x.name);toast('تم الاتصال بـ '+x.name)}catch(e){}}
 if(topE()&&topE().name==='printer'||tab==='set')render()}

/* ============ الخصم وسعر الجملة ============ */
const curPrice=p=>{const o=offerOf(p);return o?roundM(conv(o.price,o.cur,S().cur)):curPrice0(p)},curPrice0=p=>S().whole&&ui.whole&&p.wprice>0?roundM(conv(p.wprice,p.cur,S().cur)):pPrice(p);
function discAmt(sub){const p=ui.pay||{};if(!S().discOn)return 0;if(p.dp>0)return Math.min(sub,roundM(sub*p.dp/100));if(p.da>0)return Math.min(sub,roundM(p.da));return 0}
const payTotal=()=>{const sub=cartTotal(carts.sale),d=discAmt(sub);return roundM(sub-d+taxOf(carts.sale,sub,d).add)};
function discBox(sub){if(!S().discOn)return '';const p=ui.pay,d=discAmt(sub);
 return `<div class="card" style="padding:10px 12px;margin-bottom:10px"><div style="display:flex;justify-content:space-between"><b>الخصم</b>${d?`<span class="badge out">−${money(d)}</span>`:''}</div>
 <div class="chips" style="flex-wrap:wrap;margin-top:6px"><button class="chip ${!p.dp&&!p.da?'on':''}" data-a="dsc" data-v="0">بدون</button>${S().discs.map(v=>`<button class="chip ${p.dp===v?'on':''}" data-a="dsc" data-v="${v}">${fmt(v)}%</button>`).join('')}</div>
 <div class="g2"><label class="f" style="margin:0">نسبة أخرى %<input id="dpi" inputmode="decimal" value="${p.dp&&!S().discs.includes(p.dp)?p.dp:''}" data-c="dpi"></label><label class="f" style="margin:0">أو مبلغ<input id="dai" inputmode="decimal" value="${p.da||''}" data-c="dai"></label></div>
 ${d?`<div class="note">المجموع ${money(sub)} − خصم ${money(d)}</div>`:''}</div>`}
function repriceCart(){for(const it of carts.sale){const p=it.pid&&prodById(it.pid);if(p)it.price=curPrice(p)}}
const setDisc=(dp,da)=>{const old=payTotal(),pd=$('#paid'),pv=pd?num(pd.value):ui.pay.paid;ui.pay.dp=dp;ui.pay.da=da;if(pv===old)ui.pay.paid=payTotal();else ui.pay.paid=pv;render()};
Object.assign(A,{
 dsc:d=>setDisc(+d.v,0),
 wmode:d=>{ui.whole=+d.v===1;repriceCart();render()},
 discs:()=>{const l=[...new Set(val('discsin').split(/[\s,،]+/).map(num).filter(x=>x>0&&x<100))].sort((a,b)=>a-b).slice(0,6);if(!l.length)return toast('اكتب نسبة واحدة على الأقل');S().discs=l;save();toast('تم حفظ نسب الخصم');render()}
});
Object.assign(CH,{dpi:v=>setDisc(Math.min(100,Math.max(0,num(v))),0),dai:v=>setDisc(0,Math.max(0,num(v)))});

/* ============ الأوامر الجديدة ============ */
const segOn=el=>el.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));
const val=id=>{const e=$('#'+id);return e?e.value.trim():''};
const readW=()=>{const w=ui.wd||(ui.wd={});if($('#w_store')){w.owner=val('w_owner');w.store=val('w_store');w.phone=toLatin(val('w_phone'));w.rate=val('w_rate')}return w};
const SHEET_RESET={expform:()=>{ui.ecur=null;ui.ecat=null;ui.edrawer=true},sbill:()=>{ui.ecur=null;ui.bimg=null},spay:()=>{ui.ecur=null;ui.edrawer=true},wpay:()=>{ui.edrawer=true},
 userform:()=>{ui.urole=null},workform:()=>{ui.wcur=null;ui.wper=null},who:()=>{ui.whoPick=null;ui.whoForce=false},
 bklist:()=>{ui.bkl=null;listAutoBk().then(l=>{ui.bkl=l;if(topE()&&topE().name==='bklist')render()})}};
const sampleSale=()=>{const cur=S().cur,pr=cur==='USD'?2.5:3250;return {no:125,t:Date.now(),cur,rate:S().rate,total:pr*3,paid:pr*3,remaining:0,by:curUserName()||'أحمد',items:[{name:'منتج تجريبي أول',price:pr,qty:2},{name:'منتج تجريبي ثاني',price:pr,qty:1}]}};
SH.tprev=()=>`<h3>شكل الفاتورة: ${({classic:'كلاسيك',compact:'مختصرة',big:'خط كبير'})[S().tmpl]}</h3><img id="tpimg" class="rcpt" alt="معاينة"><button class="btn pri wide mt" data-a="back">تم</button>`;
const repStamp=k=>{if(k==='week')S().lastRepW=Date.now();if(k==='month'||k==='mon')S().lastRepM=Date.now()};
Object.assign(A,{
 opensheet:d=>{if(SHEET_RESET[d.v])SHEET_RESET[d.v]();open(d.v,Object.assign(d.id?{id:d.id}:{},d.k?{k:d.k}:{}),true)},
 shade:(d,el,e)=>{const t=topE();if(e.target!==el||!t)return;if(['welcome','perms','upd'].includes(t.name)||(t.name==='terms'&&t.p.id!=='view')||(t.name==='who'&&ui.whoForce))return;back()},
 stab:d=>{ui.stab=d.v;render()},
 seenmsg:()=>{S().seenMsg=(DB.remote&&DB.remote.msg||{}).id;save();render()},
 applyrate:()=>{const r=+(DB.remote||{}).rate;if(r>0){S().rate=r;S().rateAt=Date.now();logA('اعتماد سعر الصرف المقترح '+fmt(r));save();toast('تم اعتماد سعر الصرف');render()}},
 doupd:()=>{const u=(DB.remote||{}).url||SITE;try{window.open(u,'_system')}catch(e){location.href=u}},
 updlater:()=>{ui.updLater=true;if(topE()&&topE().name==='upd')back();else render()},
 sharebk:async()=>{const ok=await shareFile(bkName(Date.now()),'application/json',JSON.stringify(Object.assign({kh:'backup',v:VERSION},DB)));if(ok!==false){S().lastShare=Date.now();logA('حفظ نسخة احتياطية خارج الجهاز');save();render()}},
 backup:()=>A.sharebk(),
 repnow:d=>{ui.rper=d.v;open('report',{},true)},
 sendreport:()=>{const ph=toLatin($('#rowner').value).trim();if(!ph)return toast('اكتب رقم صاحب المحل');S().owner=ph;repStamp(ui.rper);logA('إرسال تقرير '+plabel(ui.rper));save();openWA(ph,reportText(ui.rper))},
 savestore:()=>{const s=S();s.ownerName=val('s_oname');s.store=val('s_store');s.phone=toLatin(val('s_phone'));s.owner=toLatin(val('s_owner'));s.footer=val('s_footer');const ce=$('#s_cashier');if(ce)s.cashier=ce.value.trim();flush();toast('تم حفظ بيانات المتجر')},
 wkind:d=>{readW();ui.wk=d.v;render()},
 wsample:()=>{readW();ui.ws=!ui.ws;render()},
 savewelcome:()=>{const w=readW();if(!w.store)return toast('اكتب اسم '+(ui.wk==='rest'?'المطعم':'المتجر'));swap('terms',{},true)},
 agree:()=>{const c=$('#agree');if(!c||!c.checked)return toast('لازم توافق على الشروط حتى تكمل');const w=ui.wd||{},r=num(w.rate),s=S();
  s.ownerName=w.owner||'';s.store=w.store||'';s.phone=w.phone||'';if(r>0)s.rate=r;s.kind=ui.wk;s.agreed=Date.now();if(ui.ws)seed(ui.wk);
  DB.lic.first=DB.lic.first||Date.now();DB.reg={owner:s.ownerName,store:s.store,phone:s.phone,kind:s.kind,t:Date.now(),sent:0};DB.ready=true;flush();sendReg();swap('perms',{},true)},
 permsok:()=>{back(()=>afterInit())},
 whopick:d=>{ui.whoPick=d.id;render()},
 whoback:()=>{ui.whoPick=null;render()},
 whook:()=>{const u=S().users.find(x=>x.id===ui.whoPick);if(!u)return;if(toLatin(val('whopin'))!==u.pin){$('#whopin').value='';return toast('الرمز غير صحيح')}
  ui.user=u.id;ui.unlocked=false;ui.whoForce=false;ui.whoPick=null;logA('دخول الكاشير: '+u.name);back();toast('أهلاً '+u.name)},
 urole:(d,el)=>{ui.urole=d.v;segOn(el)},
 saveuser:d=>{const name=val('uname'),pin=toLatin(val('upin')).replace(/\D/g,''),role=ui.urole||'cashier',L=S().users;if(!name)return toast('اكتب الاسم');if(pin.length<4)return toast('الرمز لازم يكون 4 أرقام على الأقل');
  if(L.some(u=>u.pin===pin&&u.id!==d.id))return toast('هالرمز مستخدم لكاشير تاني');
  if(d.id){const u=L.find(x=>x.id===d.id);Object.assign(u,{name,pin,role})}else L.push({id:uid(),name,pin,role});
  if(!L.some(u=>u.role==='admin'))toast('انتبه: ما في ولا مدير، فقط رمز القفل بيفتح الإعدادات');logA((d.id?'تعديل':'إضافة')+' كاشير: '+name);flush();back()},
 deluser:d=>ask('حذف هالكاشير؟','حذف',()=>{S().users=S().users.filter(u=>u.id!==d.id);if(ui.user===d.id)ui.user=null;if(!S().users.length)S().askUser=false;flush();back()},true),
 ecat:(d,el)=>{ui.ecat=d.v;el.parentNode.querySelectorAll('.chip').forEach(b=>b.classList.toggle('on',b===el))},
 ecur:(d,el)=>{ui.ecur=d.v;segOn(el)},
 wcur:(d,el)=>{ui.wcur=d.v;segOn(el)},
 edrawer:(d,el)=>{ui.edrawer=ui.edrawer===false;el.classList.toggle('on',ui.edrawer);el.setAttribute('aria-checked',ui.edrawer)},
 saveexp:()=>{const a=num(val('eamt'));if(a<=0)return toast('اكتب المبلغ');const dv=val('edate'),t=!dv||dv===isoToday()?Date.now():dayStart(dv);
  DB.expenses.push({id:uid(),amt:a,cur:ui.ecur||S().cur,cat:ui.ecat||'أخرى',note:val('enote'),t,drawer:ui.edrawer!==false,by:curUserName()});logA(`مصروف ${ui.ecat||'أخرى'}: ${money(a,ui.ecur||S().cur)}`);flush();toast('تم حفظ المصروف');back()},
 delexp:d=>{const e=DB.expenses.find(x=>x.id===d.id);if(!e)return;if(locked())return toast('الحذف لصاحب المحل فقط');ask(`حذف هالحركة (${money(e.amt,e.cur)})؟`,'حذف',()=>{DB.expenses=DB.expenses.filter(x=>x.id!==d.id);logA('حذف مصروف: '+money(e.amt,e.cur));flush()},true)},
 saveworker:d=>{const name=val('wname'),sal=num(val('wsal'));if(!name)return toast('اكتب اسم العامل');const o={name,phone:toLatin(val('wphone')),salary:sal,cur:ui.wcur||S().cur,per:ui.wper||'month'};
  if(d.id)Object.assign(DB.workers.find(x=>x.id===d.id),o);else DB.workers.push(Object.assign({id:uid(),t:Date.now()},o));logA((d.id?'تعديل':'إضافة')+' عامل: '+name);flush();back()},
 delworker:d=>ask('حذف هالعامل؟ حركاته بتضل بالمصاريف.','حذف',()=>{DB.workers=DB.workers.filter(x=>x.id!==d.id);flush();back()},true),
 savewpay:d=>{const w=DB.workers.find(x=>x.id===d.id),a=num(val('wamt'));if(!w)return;if(a<=0)return toast('اكتب المبلغ');const sal=d.k==='sal',n=val('wnote');
  DB.expenses.push({id:uid(),amt:a,cur:w.cur,cat:sal?'رواتب':'سلف',kind:d.k,wid:w.id,note:w.name+(n?' - '+n:''),t:Date.now(),drawer:ui.edrawer!==false,by:curUserName()});
  logA(`${sal?'راتب':'سلفة'} ${w.name}: ${money(a,w.cur)}`);flush();toast('تم الحفظ');back()},
 savesup:d=>{const name=val('sname');if(!name)return toast('اكتب اسم المورد');const o={name,phone:toLatin(val('sphone')),note:val('snote')};
  if(d.id)Object.assign(DB.suppliers.find(x=>x.id===d.id),o);else DB.suppliers.push(Object.assign({id:uid(),t:Date.now()},o));flush();back()},
 delsup:d=>{const b=roundM(supBal(d.id));ask(b>0?`باقي للمورد ${money(b)}. حذفه مع حركاته؟`:'حذف هالمورد مع حركاته؟','حذف',()=>{DB.suppliers=DB.suppliers.filter(x=>x.id!==d.id);DB.sledger=DB.sledger.filter(x=>x.sid!==d.id);flush();back()},true)},
 savebill:d=>{const a=num(val('bamt')),pd=num(val('bpaid')),cur=ui.ecur||S().cur,s=DB.suppliers.find(x=>x.id===d.id);if(a<=0)return toast('اكتب مبلغ الفاتورة');const t=Date.now();
  DB.sledger.push({id:uid(),sid:d.id,amt:a,cur,note:val('bnote'),img:ui.bimg||'',t});if(pd>0)DB.sledger.push({id:uid(),sid:d.id,amt:-Math.min(pd,a),cur,note:'دفعة مع الفاتورة',t:t+1,drawer:true});
  ui.bimg=null;logA(`فاتورة شراء من ${s?s.name:''}: ${money(a,cur)}`);flush();toast('تم حفظ الفاتورة');back()},
 savespay:d=>{const a=num(val('pamt')),cur=ui.ecur||S().cur,s=DB.suppliers.find(x=>x.id===d.id);if(a<=0)return toast('اكتب المبلغ');
  DB.sledger.push({id:uid(),sid:d.id,amt:-a,cur,note:val('pnote'),t:Date.now(),drawer:ui.edrawer!==false});logA(`دفعة للمورد ${s?s.name:''}: ${money(a,cur)}`);flush();toast('تم حفظ الدفعة');back()},
 delsl:d=>{if(locked())return;ask('حذف هالحركة؟','حذف',()=>{DB.sledger=DB.sledger.filter(x=>x.id!==d.id);flush()},true)},
 simg:d=>open('simg',{id:d.id},true),
 supwa:d=>{const s=DB.suppliers.find(x=>x.id===d.id);if(s)openWA(s.phone,`مرحباً ${s.name}،\n`)},
 doclose:()=>{const c=drawerCalc(),cv=val('cnt');if(cv==='')return toast('اكتب المبلغ الموجود بالصندوق');const cnt=num(cv),cur=S().cur,diff=roundM(cnt-c.exp2);
  const x={t:Date.now(),exp:c.exp2,cnt:roundM(cnt),diff,cur,by:curUserName()};DB.closes.unshift(x);if((S().oreset||(KIND==='rest'?'close':'hour'))==='close')DB.oseq=0;logA(`إغلاق الصندوق: المفروض ${money(c.exp2)}، الموجود ${money(cnt)}`);flush();
  const txt=`💰 *إغلاق الصندوق*\n${S().store||''}\n${dt(x.t)}${x.by?'\nالكاشير: '+x.by:''}\n──────────\nمبيعات كاش: ${money(c.sales)}\nدفعات ديون: ${money(c.debts)}\nمصاريف من الصندوق: ${money(c.exp)}\nالمفروض: ${money(c.exp2)}\nالموجود: ${money(x.cnt)}\nشام كاش مستلم: ${money(c.sham)}\n*${diff===0?'مطابق ✅':(diff>0?'زيادة ':'نقص ')+money(Math.abs(diff))}*`+monText(c.since);
  toast('تم إغلاق الصندوق');render();if(S().owner)openWA(S().owner,txt);else shareText(txt)},
 labq:d=>{const L=ui.lab||(ui.lab={});L[d.id]=Math.max(0,(L[d.id]||0)+ +d.d);if(!L[d.id])delete L[d.id];render()},
 labprint:async()=>{if(!canBLE())return toast('الطباعة عبر البلوتوث غير مفعّلة في هذه النسخة بعد');const L=ui.lab||{},list=[];
  for(const [id,n] of Object.entries(L)){const p=prodById(id);if(p&&n>0){ensureCode(p);list.push({p,n})}}if(!list.length)return;flush();
  try{toast('جارٍ طباعة الملصقات…');await blePrint(await labelBytes(list),'c');ui.lab={};toast('تمت الطباعة');render()}catch(e){toast('تعذّرت الطباعة. تأكد من الاتصال بالطابعة'+errT(e),9000)}},
 tmplprev:()=>{open('tprev',{},true);setTimeout(async()=>{try{const im=$('#tpimg');if(im)im.src=(await receiptCanvas(sampleSale())).toDataURL('image/png')}catch(e){}},60)},
 fs:d=>{S().fs=+d.v;applyTheme();save();render()},
 tmpl:d=>{S().tmpl=d.v;save();render()},
 copies:d=>{S().copies=+d.v;save();render()},
 bkr:d=>{S().bkRemind=d.v;save();render()},
 xferout:()=>{const d={kh:'xfer',v:VERSION,from:S().store,t:Date.now(),products:DB.products,cats:DB.cats,customers:DB.customers,ledger:DB.ledger,sales:DB.sales};logA('تصدير بيانات لجهاز آخر');
  shareFile(`khansa-transfer-${dday(Date.now())}.khansa`,'application/json',JSON.stringify(d))},
 bkrestore:async d=>{let x;try{x=JSON.parse(await readAutoBk(d.v))}catch(e){return toast('تعذّرت قراءة النسخة')}if(!x||!x.settings)return toast('النسخة تالفة');
  ask(`استبدال كل البيانات الحالية بنسخة ${fmtD(d.v.replace(/\D/g,''))}؟`,'استعادة',()=>{restoreData(x);back()},true)},
 shareapp:()=>shareText(`جرّب تطبيق *${APPNAME}* 🧾\n${LITE?'نظام طلبات للمطاعم: صالة وسفري وتوصيل، ورقة للمطبخ وفاتورة للزبون.':EDITION==='rest'?'نظام للمطاعم: طلبات صالة وسفري وتوصيل، ورقة للمطبخ، فواتير، تقارير.':'كاشير للمحلات: باركود، فواتير، ديون، طباعة، تقارير.'}\nتجربة مجانية ${TRIAL_DAYS} أيام.\n${SITE}`),
 dowipe:()=>{if(val('wipew')!=='حذف')return toast('اكتب كلمة "حذف" بالضبط');const pe=$('#wipep');if(pe){const pv=toLatin(pe.value);if(!((S().pin&&pv===S().pin)||S().users.some(u=>u.role==='admin'&&u.pin===pv)))return toast('رمز المدير غير صحيح')}
  const lic=DB.lic;DB=fresh();DB.lic=lic;carts.sale=[];carts.quick=[];ui.user=null;ui.unlocked=false;ui.wd=null;flush();stack.length=0;tab='pos';applyTheme();open('welcome',{},true)}
});
Object.assign(IN,{lq:v=>{ui.lq=v;const e=$('#lablist');if(e)e.innerHTML=labList()}});
Object.assign(CH,{
 rfrom:v=>{ui.rfrom=v;render()},rto:v=>{ui.rto=v;render()},
 expdays:v=>{S().expDays=Math.max(1,Math.round(num(v))||30);save();render()},
 bimg:async(v,el)=>{const f=el.files&&el.files[0];if(!f)return;try{ui.bimg=await squeezeImg(f);const t=$('#bimgt');if(t)t.textContent='تم إرفاق الصورة ✓'}catch(e){toast('تعذّر قراءة الصورة'+errT(e),9000)}},
 xfer:async(v,el)=>{const f=el.files&&el.files[0];if(!f)return;let d;try{d=JSON.parse(await readFile(f))}catch(e){return toast('الملف غير صالح')}el.value='';
  if(d&&d.settings&&!d.kh||d&&d.kh==='backup')return toast('هاد ملف نسخة احتياطية، استعيده من "استعادة من ملف"');
  if(!d||d.kh!=='xfer')return toast('هاد الملف مو ملف نقل من '+APPNAME);
  ask(`ملف من "${d.from||'جهاز آخر'}" فيه ${(d.products||[]).length} منتج و${(d.customers||[]).length} زبون و${(d.sales||[]).length} فاتورة. دمجها مع بياناتك بدون تكرار؟`,'دمج',()=>{const c=mergeXfer(d);setTimeout(()=>toast(`تمت الإضافة: ${c.p} منتج، ${c.c} زبون، ${c.s} فاتورة`),300)})}
});
/* ============ المشتريات والجرد (للمطاعم) ============ */
const purTotal=(st,en)=>DB.sledger.filter(l=>l.amt>0&&inR(l.t,st,en)).reduce((a,l)=>a+conv(l.amt,l.cur,S().cur),0);
const UNITS=['كغ','لتر','قطعة','علبة','كيس','كرتونة','جرة غاز'];
const matVal=c=>c.items.reduce((a,i)=>a+conv(i.qty*i.price,i.cur||c.cur,S().cur),0);
function countCalc(i){const c=DB.counts[i],p=DB.counts[i+1];if(!c)return null;const st=p?p.t:0,cv=matVal(c),pv=p?matVal(p):0,
 pu=purTotal(st+1,c.t)+DB.expenses.filter(e=>e.cat==='مواد غذائية'&&inR(e.t,st+1,c.t)).reduce((a,e)=>a+conv(e.amt,e.cur,S().cur),0);
 let rev=0;for(const s of DB.sales)if(!s.refunded&&inR(s.t,st+1,c.t))rev+=conv(s.total,s.cur,S().cur,s.rate);
 const used=pv+pu-cv;return {c,p,cv,pv,pu,used,rev,pct:rev>0?Math.round(used/rev*100):0}}
function tabStock(){const c0=countCalc(0);
 return `<div class="card"><h3>الجرد</h3><p class="sub">سجّل المواد الخام مرة وحدة، وآخر كل شهر اعمل جرد: بتكتب شو باقي من كل مادة، والتطبيق بيحسب قديش استهلكتو.</p>
 ${c0?`<div class="kv"><span>آخر جرد</span><b>${dt(c0.c.t)}</b></div><div class="kv"><span>قيمة البضاعة الباقية</span><b>${money(roundM(c0.cv))}</b></div>
 ${c0.p?`<div class="kv"><span>المواد المستهلكة من الجرد اللي قبله</span><b style="color:var(--bad)">${money(roundM(c0.used))}</b></div><div class="kv"><span>نسبتها من المبيعات</span><b>${c0.pct}%</b></div>${(()=>{const ex=DB.expenses.filter(e=>e.cat!=='مواد غذائية'&&inR(e.t,c0.p.t+1,c0.c.t)).reduce((a,e)=>a+conv(e.amt,e.cur,S().cur),0),net=roundM(c0.rev-c0.used-ex);
  return `<div class="card mt" style="margin-bottom:0"><h3>ربح فترة الجرد (الأدق)</h3><p class="sub">من ${dt(c0.p.t)} لـ ${dt(c0.c.t)}</p><div class="kv"><span>المبيعات</span><b>${money(roundM(c0.rev))}</b></div><div class="kv"><span>المواد المستهلكة فعلياً</span><b style="color:var(--bad)">− ${money(roundM(c0.used))}</b></div><div class="kv"><span>المصاريف والرواتب</span><b style="color:var(--bad)">− ${money(roundM(ex))}</b></div><div class="tag lg mt" style="display:flex;justify-content:space-between;padding:12px"><span>${net>=0?'ربح':'خسارة'}</span><span>${money(Math.abs(net))}</span></div></div>`})()}`:'<div class="note">هاد أول جرد، الاستهلاك بينحسب من الجرد الجاي.</div>'}`:''}
 <button class="btn pri wide mt" data-a="newcount" ${DB.mats.length?'':'disabled'}>${ic('list')} جرد جديد</button></div>
 <h2 class="sec">المواد الخام <span class="cnt">${DB.mats.length}</span></h2>
 ${DB.mats.length?DB.mats.map(m=>`<button class="li" data-a="opensheet" data-v="matform" data-id="${m.id}"><div class="gr"><b>${esc(m.name)}</b><small>سعر ال${esc(m.unit)}: ${money(m.price,m.cur)}</small></div></button>`).join(''):empty('box','ما في مواد بعد','أضف المواد: لحمة، دجاج، زيت، خبز، غاز…')}
 <button class="btn ghost wide mb" data-a="opensheet" data-v="matform">${ic('plus')} إضافة مادة</button>
 <h2 class="sec">الجرودات السابقة</h2>${DB.counts.length?DB.counts.map((c,i)=>{const x=countCalc(i);return `<button class="li" data-a="open" data-v="countv" data-id="${i}"><div class="gr"><b>${dt(c.t)}</b><small>الباقي ${money(roundM(x.cv))}${x.p?' · المستهلك '+money(roundM(x.used)):''}</small></div></button>`}).join(''):empty('list','ما في جرد بعد')}`}
SH.matform=p=>{const m=p.id&&DB.mats.find(x=>x.id===p.id)||{name:'',unit:'كغ',price:'',cur:S().cur};if(ui.munit==null)ui.munit=m.unit;
 return `<h3>${p.id?'تعديل مادة':'مادة خام جديدة'}</h3><label class="f">اسم المادة<input id="mtn" value="${esc(m.name)}" placeholder="مثال: صدر دجاج" data-focus></label>
 <div class="f">الوحدة<div class="chips" style="flex-wrap:wrap;margin-top:6px">${UNITS.map(u=>`<button class="chip ${ui.munit===u?'on':''}" data-a="munit" data-v="${u}">${u}</button>`).join('')}</div></div>
 <div class="frow"><label class="f">سعر الوحدة<input id="mtp" inputmode="decimal" value="${esc(String(m.price))}"></label><div style="margin-bottom:12px">${seg('ecur',ui.ecur||m.cur,[['SYP','ل.س'],['USD','$']])}</div></div>
 <button class="btn pri wide" data-a="savemat" data-id="${p.id||''}">${ic('check')} حفظ</button>${p.id?`<button class="btn ghost bad wide mt" data-a="delmat" data-id="${p.id}">${ic('trash')} حذف</button>`:''}`};
P.count=()=>{const last=DB.counts[0],prev=id=>{const i=last&&last.items.find(x=>x.id===id);return i?i.qty:''};
 return head('جرد جديد','',true)+`<main class="main"><div class="note">اكتب الكمية الموجودة فعلياً هلق من كل مادة. وجنب كل مادة مكتوب كمية الجرد الماضي.</div>
 ${DB.mats.map(m=>`<div class="li"><div class="gr"><b>${esc(m.name)}</b><small>بالـ${esc(m.unit)} · ${money(m.price,m.cur)}${prev(m.id)!==''?' · الماضي: '+fq(prev(m.id)):''}</small></div><input class="inp" id="cq_${m.id}" inputmode="decimal" placeholder="0" style="width:90px;margin:0;text-align:center"></div>`).join('')}
 <button class="btn pri wide mt" data-a="savecount">${ic('check')} حفظ الجرد</button><div style="height:30px"></div></main>`};
P.countv=p=>{const x=countCalc(+p.id);if(!x)return head('جرد','',true)+'<main class="main"></main>';
 return head('جرد '+dt(x.c.t).slice(0,10),'',true)+`<main class="main"><div class="card">
 ${x.p?`<div class="kv"><span>بضاعة الجرد الماضي (${dt(x.p.t).slice(0,10)})</span><b>${money(roundM(x.pv))}</b></div><div class="kv"><span>+ مشتريات بالفترة</span><b>${money(roundM(x.pu))}</b></div><div class="kv"><span>− الباقي هلق</span><b>${money(roundM(x.cv))}</b></div>
 <div class="tag lg mt" style="display:flex;justify-content:space-between;padding:12px"><span>المواد المستهلكة</span><span>${money(roundM(x.used))}</span></div>
 <div class="kv mt"><span>مبيعات نفس الفترة</span><b>${money(roundM(x.rev))}</b></div><div class="kv"><span>نسبة تكلفة المواد من المبيعات</span><b>${x.pct}%</b></div>`:`<div class="kv"><span>قيمة البضاعة الموجودة</span><b>${money(roundM(x.cv))}</b></div><div class="note">أول جرد. الاستهلاك بينحسب من الجرد الجاي.</div>`}</div>
 <div class="card"><table class="tbl"><tr><th>المادة</th><th>الكمية</th><th>القيمة</th></tr>${x.c.items.map(i=>`<tr><td>${esc(i.name)}</td><td class="num">${fq(i.qty)} ${esc(i.unit)}</td><td class="num">${money(roundM(conv(i.qty*i.price,i.cur,S().cur)))}</td></tr>`).join('')}</table></div>
 <button class="btn wa wide" data-a="sharecount" data-id="${p.id}">${ic('wa')} إرسال الجرد لصاحب المطعم</button>
 <button class="btn ghost bad wide mt" data-a="delcount" data-id="${p.id}">${ic('trash')} حذف هالجرد</button></main>`};
Object.assign(A,{
 munit:(d,el)=>{ui.munit=d.v;el.parentNode.querySelectorAll('.chip').forEach(b=>b.classList.toggle('on',b===el))},
 savemat:d=>{const name=val('mtn');if(!name)return toast('اكتب اسم المادة');const o={name,unit:ui.munit||'كغ',price:num(val('mtp')),cur:ui.ecur||S().cur};
  if(d.id)Object.assign(DB.mats.find(x=>x.id===d.id),o);else DB.mats.push(Object.assign({id:uid()},o));ui.munit=null;ui.ecur=null;flush();back()},
 delmat:d=>ask('حذف هالمادة؟ الجرودات القديمة بتضل.','حذف',()=>{DB.mats=DB.mats.filter(x=>x.id!==d.id);flush();back()},true),
 newcount:()=>open('count'),
 savecount:()=>{const items=[];for(const m of DB.mats){const e=$('#cq_'+m.id);if(!e||e.value.trim()==='')continue;items.push({id:m.id,name:m.name,unit:m.unit,price:m.price,cur:m.cur,qty:r3(num(e.value))})}
  if(!items.length)return toast('اكتب كمية مادة وحدة على الأقل');DB.counts.unshift({t:Date.now(),cur:S().cur,items,by:curUserName()});logA('جرد: '+items.length+' مادة');flush();toast('تم حفظ الجرد');swap('countv',{id:'0'})},
 sharecount:d=>{const x=countCalc(+d.id);if(!x)return;let t=`📦 *جرد ${S().store||''}*\n${dt(x.c.t)}\n──────────\n`+x.c.items.map(i=>`${i.name}: ${fq(i.qty)} ${i.unit}`).join('\n')+`\n──────────\nقيمة الباقي: ${money(roundM(x.cv))}\n`;
  if(x.p)t+=`مشتريات الفترة: ${money(roundM(x.pu))}\n*المواد المستهلكة: ${money(roundM(x.used))}*\nمبيعات الفترة: ${money(roundM(x.rev))}\nنسبة تكلفة المواد: ${x.pct}%\n`;
  if(S().owner)openWA(S().owner,t);else shareText(t)},
 delcount:d=>ask('حذف هالجرد؟','حذف',()=>{DB.counts.splice(+d.id,1);flush();back()},true)
});
SHEET_RESET.matform=()=>{ui.munit=null;ui.ecur=null};

/* ============ البحث عن الطابعات داخل التطبيق (بدل نافذة الأندرويد) ============ */
let scanL=null,btT=null;
const btList=()=>{const l=Object.entries(ui.bts||{}).sort((a,b)=>b[1].rssi-a[1].rssi);
 return l.length?l.map(([id,d])=>{const on=Object.values(ble).some(b=>b&&b.id===id);return `<button class="li" data-a="btpick" data-id="${esc(id)}" style="margin:0 0 8px;${on?'border-color:var(--ok);background:var(--okbg)':''}">${ic('print')}<div class="gr"><b>${esc(d.name)}</b><small class="num">${esc(id)} · ${d.rssi} dBm</small></div><span class="badge ${on?'':'neu'}">${on?'متصلة':'اتصال'}</span></button>`}).join(''):`<div class="note" style="text-align:center;padding:14px 0">${ui.btScanning?'جارٍ البحث… شغّل الطابعة وقرّبها':'ما لقينا طابعات. على بعض الأجهزة لازم يكون <b>الموقع (GPS) شغّال</b> حتى يبين البلوتوث.'}</div>${ui.btScanning?'':`<div class="g2"><button class="btn ghost" data-a="btloc">📍 تشغيل الموقع</button><button class="btn ghost" data-a="btdlg">${ic('search')} طريقة بحث تانية</button></div>`}`};
const btRefresh=()=>{const e=$('#btlist');if(e)e.innerHTML=btList();const s=$('#btst');if(s)s.textContent=ui.btScanning?'جارٍ البحث…':'انتهى البحث'};
async function stopScan(){clearTimeout(btT);ui.btScanning=false;try{await NB().stopLEScan()}catch(e){}btRefresh()}
async function startScan(){const P=NB();ui.bts={};ui.btScanning=true;btRefresh();
 try{await nbInit();try{await P.stopLEScan()}catch(e){}
  if(!scanL)scanL=await P.addListener('onScanResult',r=>{const d=(r&&r.device)||{},n=(r&&r.localName)||d.name;if(!n||!d.deviceId)return;ui.bts[d.deviceId]={name:n,rssi:r.rssi||0};btRefresh()});
  await P.requestLEScan({allowDuplicates:false});clearTimeout(btT);btT=setTimeout(stopScan,15000)}
 catch(e){ui.btScanning=false;btRefresh();toast('تعذّر البحث عن الطابعات'+errT(e),9000)}}
function openScan(slot){ui.btSlot=slot||'c';open('btscan',{},true);startScan()}
SH.btscan=()=>`<div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">اختر ${ui.btSlot==='c'?'الطابعة':'طابعة '+esc((kStations().find(s=>s.id===ui.btSlot)||{name:'المطبخ'}).name)}</h3><small id="btst" class="note" style="margin:0">${ui.btScanning?'جارٍ البحث…':'انتهى البحث'}</small></div>
 <p class="note">اكبس على اسم الطابعة مرة وحدة. ما في داعي تعمل اقتران من إعدادات البلوتوث.</p><div id="btlist">${btList()}</div>
 <div class="g2 mt"><button class="btn ghost" data-a="btrescan">${ic('search')} إعادة البحث</button><button class="btn pri" data-a="btclose">إغلاق</button></div>`;
async function nbConnect(slot){const x=S().bt&&S().bt[slot];if(x){try{await nbOpen(slot,x.id,x.name);return}catch(e){}}
 openScan(slot);throw new Error('اختر الطابعة من القائمة')}
const _bleconn=A.bleconn;
Object.assign(A,{
 bleconn:d=>{if(NB())return openScan(d.v||'c');return _bleconn(d)},
 btrescan:()=>startScan(),
 btclose:()=>{stopScan();back()},
 btpick:async d=>{const slot=ui.btSlot||'c',x=(ui.bts||{})[d.id]||{};await stopScan();toast('جارٍ الاتصال بـ '+(x.name||'الطابعة')+'…',15000);
  try{await nbOpen(slot,d.id,x.name);{const ch=ble[slot].ch;toast('تم الاتصال بـ '+(x.name||'الطابعة')+' ✓'+(ch?' ('+(ch.mtu||'?')+')':''))}if(topE()&&topE().name==='btscan')back();else render()}
  catch(e){toast('تعذّر الاتصال بالطابعة'+errT(e),9000)}},
 btdisc:async d=>{const k=d.v||'c',id=ble[k].id;ble[k].ch=null;try{if(id)await NB().disconnect({deviceId:id})}catch(e){}if(S().bt)delete S().bt[k];save();toast('تم قطع الاتصال');render()}
});


/* ============ أكثر من طابعة مطبخ ============ */
const kStations=()=>[{id:'k',name:'المطبخ',cats:[]}].concat(S().kst||[]);
const bs=id=>ble[id]||(ble[id]={ch:null,name:''});
function kGroup(lines){const g={};for(const l of lines){const p=l.pid&&prodById(l.pid),cat=p&&p.cat,st=(S().kst||[]).find(s=>cat&&s.cats.includes(cat)),id=st?st.id:'k';(g[id]=g[id]||[]).push(l)}return g}
async function kSend(o,lines,add){const g=kGroup(lines),bad=[];
 for(const [id,ls] of Object.entries(g)){const st=kStations().find(s=>s.id===id)||{name:'المطبخ'};if(DESK()){await deskPrint(await kitchenCanvas(Object.assign({},o,{st:st.name}),ls,add),S().onePr?S().wprinter:(S().wprinterK||S().wprinter),true);continue}const slot=S().onePr?'c':(bs(id).ch?id:(ble.k.ch?'k':(ble.c.ch?'c':(S().bt&&S().bt.c?'c':null))));
  if(!slot){bad.push(st.name);continue}
  try{await blePrint(escStarBytes(await kitchenCanvas(Object.assign({},o,{st:st.name}),ls,add)),slot)}catch(e){bad.push(st.name)}}
 toast(bad.length?'ما انطبعت ورقة: '+bad.join('، ')+'. تأكد من الطابعة':'أُرسل الطلب '+o.no+' للمطبخ',bad.length?8000:2600)}
SH.ksform=p=>{const s=p.id&&(S().kst||[]).find(x=>x.id===p.id)||{name:'',cats:[]};if(!ui.kcats)ui.kcats=s.cats.slice();
 return `<h3>${p.id?'تعديل طابعة':'طابعة مطبخ جديدة'}</h3><label class="f">اسم القسم بالمطبخ<input id="ksn" value="${esc(s.name)}" placeholder="مثال: المشاوي، المشروبات، الحلويات" data-focus></label>
 <div class="f">أصناف أي أقسام من المنيو بتنطبع عليها؟${DB.cats.length?`<div class="chips" style="flex-wrap:wrap;margin-top:6px">${DB.cats.map(c=>`<button class="chip ${ui.kcats.includes(c)?'on':''}" data-a="kcat" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>`:'<div class="note">ما في أقسام بالمنيو. أضف أقسام للأصناف أول.</div>'}</div>
 <div class="note">الأصناف من هالأقسام بتنطبع على هالطابعة، والباقي على المطبخ الرئيسي.</div>
 <button class="btn pri wide mt" data-a="saveks" data-id="${p.id||''}">${ic('check')} حفظ</button>${p.id?`<button class="btn ghost bad wide mt" data-a="delks" data-id="${p.id}">${ic('trash')} حذف هالطابعة</button>`:''}`};
SHEET_RESET.ksform=()=>{ui.kcats=null};
Object.assign(A,{
 kcat:(d,el)=>{const l=ui.kcats||(ui.kcats=[]),i=l.indexOf(d.v);if(i>=0)l.splice(i,1);else l.push(d.v);el.classList.toggle('on',i<0)},
 saveks:d=>{const name=val('ksn');if(!name)return toast('اكتب اسم القسم');const L=S().kst||(S().kst=[]);
  if(d.id){Object.assign(L.find(x=>x.id===d.id),{name,cats:ui.kcats||[]})}else L.push({id:'k'+(Date.now()%1e6),name,cats:ui.kcats||[]});ui.kcats=null;save();back()},
 delks:d=>ask('حذف طابعة هالقسم؟ أصنافه بترجع للمطبخ الرئيسي.','حذف',()=>{S().kst=(S().kst||[]).filter(x=>x.id!==d.id);if(S().bt)delete S().bt[d.id];delete ble[d.id];save();back()},true)
});


/* ============ التفعيل بالتوقيع الرقمي (ECDSA P-256) ============ */
const LIC_PUB={"kty":"EC","x":"NJh46vFPpcxir6kF0SnZNMuBgAh5PShcHfGhZ7TSGgs","y":"FQ0ySKDeyUrA3bSVjP5wTWWSZCDXOSodKKeHRDELJhQ","crv":"P-256"};
const b64u=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
async function activateSigned(raw){const m=String(raw).trim().match(/^KH1-([123])-([A-Za-z0-9_-]{80,90})$/);if(!m)return 'الكود ناقص أو فيه غلط. انسخه كامل من الرسالة';
 if(!(window.crypto&&crypto.subtle))return 'هالجهاز ما بيدعم التحقق من الكود';
 const l=DB.lic,pk=PACKS.find(p=>p.id===+m[1]);
 try{const key=await crypto.subtle.importKey('jwk',LIC_PUB,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
  const ok=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,b64u(m[2]),new TextEncoder().encode(`KH1|${l.dev}|${l.serial+1}|${pk.id}`));
  if(!ok)return 'الكود مو لهالجهاز أو مستعمل قبل';}catch(e){return 'تعذّر التحقق من الكود'+errT(e)}
 l.serial++;if(pk.type==='life')l.until=Math.max(l.until,licNow())+200*365*DAY;else l.until=Math.max(l.until,licNow())+pk.n*DAY;
 logA('تفعيل: '+pk.name);flush();setTimeout(adminCheck,500);return ''}
/* رقم جهاز ثابت من معرّف الأندرويد، ما بيتغير لو انحذف التطبيق */
async function stableDev(){try{const D=isNative()&&window.Capacitor.Plugins.Device;if(!D)return;const r=await D.getId();const id=r&&(r.identifier||r.uuid);if(!id)return;
 const dv=String(hash('KHDEV|'+id)%1e8).padStart(8,'0');if(DB.lic.dev!==dv){DB.lic.dev=dv;flush();render()}}catch(e){}}


/* ============ الاتصال بلوحة الإدارة (Google Sheet) ============ */
async function adminCheck(){if(!ADMIN_URL||!navigator.onLine||!DB.ready)return;const l=DB.lic;
 const q=new URLSearchParams({a:'check',dev:l.dev,store:S().store||'',owner:S().ownerName||'',phone:S().phone||'',kind:APPNAME,ver:VERSION,until:String(l.until||0),first:String(l.first||0)});
 try{const r=await (await fetch(ADMIN_URL+'?'+q.toString())).json();if(!r||!r.ok)return;
  const was=licCan();l.lastOk=Date.now();l.blocked=r.status==='stop';l.until=+r.until||0;if(r.first&&r.first<(l.first||Infinity))l.first=+r.first;
  DB.remote=Object.assign({t:Date.now()},r);const rt=+r.rate;
  if(rt>0&&rt!==S().rate&&S().rateAuto){S().rate=rt;S().rateAt=Date.now();logA('تحديث سعر الصرف تلقائياً إلى '+fmt(rt));toast('تم تحديث سعر الصرف إلى '+fmt(rt))}
  flush();if(was&&!licCan())toast(licText(),8000);
  if(r.force&&verNewer(r.ver)&&!(topE()&&topE().name==='upd'))open('upd',{},true);else render()}catch(e){}}


/* ============ شبكة الطاولات + البحث البديل عن الطابعة ============ */
function tablesGrid(){const n=+S().tables||0;if(KIND!=='rest'||!n)return '';let h='<div class="tbls">';
 for(let i=1;i<=n;i++){const o=DB.orders.find(x=>x.type==='dine'&&String(x.table)===String(i));
  h+=o?`<button class="tb busy" data-a="loadord" data-id="${o.id}"><b>${i}</b><small>${money(ordTotal(o))}</small><small>${ago(o.t)}</small></button>`:`<button class="tb" data-a="tbl" data-v="${i}"><b>${i}</b><small>فاضية</small></button>`}
 return h+'</div>'}
Object.assign(A,{
 oreset:d=>{S().oreset=d.v;if(d.v==='close')S().closeOn=true;save();render()},
 ohour:d=>{S().ohour=+d.v;save();render()},
 oseq0:()=>ask('ترجيع أرقام الطلبات لتبلّش من 1؟','ترجيع',()=>{DB.oseq=0;DB.oday=dday(Date.now()-(S().ohour==null?5:+S().ohour)*3600e3);logA('تصفير أرقام الطلبات');flush()}),
 savenotes:()=>{const l=[...new Set(val('s_notes').split(/[,،]+/).map(x=>x.trim()).filter(Boolean))].slice(0,20);S().notes=l;save();toast('تم حفظ الملاحظات');render()},
 tgw:()=>{S().wide=S().wide===false;applyTheme();save();render()},
 tbl:d=>{ui.saleCust='';ui.ord={type:'dine',table:String(d.v)};ui.sel='';ui.pk.q='';open('pick',{cn:'sale'})},
 tables:()=>{const v=Math.max(0,Math.min(60,Math.round(num(val('s_tables')))||0));S().tables=v;save();toast(v?'تم: '+v+' طاولة':'انشالت الطاولات');render()},
 btloc:async()=>{try{await NB().openLocationSettings()}catch(e){toast('افتح الموقع (GPS) من الإعدادات'+errT(e),8000)}},
 btdlg:async()=>{const slot=ui.btSlot||'c';await stopScan();try{const P=NB();await nbInit();const d=await P.requestDevice({optionalServices:BLE_SVC});if(!d||!d.deviceId)return;
  toast('جارٍ الاتصال…',15000);await nbOpen(slot,d.deviceId,d.name);toast('تم الاتصال بـ '+(d.name||'الطابعة')+' ✓');if(topE()&&topE().name==='btscan')back();else render()}catch(e){toast('تعذّر الاتصال بالطابعة'+errT(e),9000)}}
});


/* ============ رمز صاحب المحل قبل الحذف والتعديلات الحساسة ============ */
const ownerPinSet=()=>!!(S().pin||S().users.some(u=>u.role==='admin'));
const notesL=()=>Array.isArray(S().notes)&&S().notes.length?S().notes:NOTESDEF;
const pinOk=pv=>(S().pin&&pv===S().pin)||S().users.some(u=>u.role==='admin'&&u.pin===pv);
function guardPin(fn){if(!ownerPinSet()||Date.now()<(ui.pinUntil||0))return fn();ui.pinFn=fn;open('pinask',{},true)}
SH.pinask=()=>`<h3>🔒 رمز صاحب المحل</h3><p class="note">هالعملية بدها رمز صاحب المحل.</p><input class="inp" id="pinq" type="password" inputmode="numeric" maxlength="8" placeholder="••••" style="text-align:center;letter-spacing:8px;font-size:24px" data-focus>
 <div class="g2 mt"><button class="btn ghost" data-a="back">إلغاء</button><button class="btn pri" data-a="pinok">تأكيد</button></div>`;
A.pinok=()=>{const e=$('#pinq');if(!e)return;if(!pinOk(toLatin(e.value))){e.value='';return toast('الرمز غير صحيح')}ui.pinUntil=Date.now()+120000;const f=ui.pinFn;ui.pinFn=null;back(()=>{if(f)setTimeout(f,60)})};
A.wper=(d,el)=>{ui.wper=d.v;segOn(el)};
['rmpin'].forEach(n=>{const f=A[n];if(f)A[n]=(d,el,e)=>guardPin(()=>f(d,el,e))});

{const f=A.unlock;A.unlock=(d,el,e)=>{f(d,el,e);if(ui.unlocked)ui.pinUntil=Date.now()+120000}}

{const f=A.tg;A.tg=(d,el,e)=>{if(d.k==='onePr'&&!S().onePr){S().autoPrint=true;S().autoK=true}f(d,el,e)}}

/* عند الدفع بمطعم: الأصناف اللي ما انبعتت للمطبخ بتنطبع ورقتها أول، وبعدها الفاتورة */
{const f=A.dosale;A.dosale=(d,el,e)=>{if(KIND!=='rest')return f(d,el,e);
 const lines=[];for(const it of carts.sale){const q=r3(it.qty-(it.sent||0));if(q>0)lines.push({name:it.name,qty:q,note:it.note||'',pid:it.pid||''})}
 const n0=DB.sales.length,ap=S().autoPrint;S().autoPrint=false;try{f(d,el,e)}finally{S().autoPrint=ap}
 if(DB.sales.length===n0)return;const s=DB.sales[0];
 (async()=>{if(lines.length&&s.ord)await kSend(Object.assign({},s.ord,{t:s.t}),lines,false);if(ap)await printSale(s,true)})()}}

/* ============ نسخة الويندوز: الطباعة عن طريق طابعات ويندوز (USB) ============ */
async function deskPrint(cv,printer,quiet){try{const t0=Date.now();const r=await window.khDesktop.print({img:cv.toDataURL('image/png'),printer:printer||'',widthMm:S().paper===58?58:80,printMm:S().pmm||(S().paper===58?48:72),offMm:+S().poff||0,ratio:cv.height/cv.width});
  if(r&&r.ok===false)throw new Error(r.err||'فشل');if(!quiet)toast(`تمت الطباعة (${((Date.now()-t0)/1000).toFixed(1)} ث)`)}catch(e){toast('تعذّرت الطباعة'+errT(e),9000)}}
{const P0=P.printer;P.printer=()=>{if(!DESK())return P0();const rest=S().kind==='rest',L=ui.wpl||[];if(!ui.wpl){ui.wpl=[];window.khDesktop.printers().then(l=>{ui.wpl=l||[];render()}).catch(()=>{})}
 const sel=(k,t)=>`<div class="card"><h3>${t}</h3><select class="inp" data-c="${k}" style="margin:8px 0">${['<option value="">الطابعة الافتراضية بويندوز</option>'].concat(L.map(p=>`<option ${S()[k]===p.name?'selected':''} value="${esc(p.name)}">${esc(p.name)}${p.isDefault?' (الافتراضية)':''}</option>`)).join('')}</select><button class="btn ghost wide" data-a="desktest" data-v="${k}">${ic('print')} طباعة تجريبية</button></div>`;
 return head('الطابعة',`<button class="ib" data-a="wprefresh" aria-label="تحديث">${ic('undo')}</button>`,true)+`<main class="main"><div class="note">وصّل الطابعة بكابل USB وثبّت تعريفها (Driver) على ويندوز، وبعدين اختارها من القائمة.</div>
 ${rest?`<div class="card">${opt('طابعة وحدة للمطبخ والكاشير','',sw(S().onePr,'tg','onePr'))}</div>`:''}${sel('wprinter',rest&&!S().onePr?'طابعة الكاشير':'الطابعة')}${rest&&!S().onePr?sel('wprinterK','طابعة المطبخ'):''}
 <div class="card"><h3>إعدادات الطباعة</h3>${opt('مقاس الورق','',seg('paper',S().paper,[[80,'80 مم'],[58,'58 مم']]))}
 ${opt('عرض الطباعة الفعلي','إذا الكتابة مقصوصة من الأطراف، صغّر الرقم',seg('sset',S().pmm||(S().paper===58?48:72),(S().paper===58?[44,46,48,50,52]:[64,68,70,72,74,76]).map(v=>[v,v+' مم']),'pmm'))}
 ${opt('إزاحة لليمين','إذا في فراغ كبير على اليسار، زيحها شوي',seg('sset',+S().poff||0,[[0,'بدون'],[1,'1 مم'],[2,'2 مم'],[3,'3 مم'],[4,'4 مم']],'poff'))}
 ${opt('شكل الفاتورة','',seg('sset',S().tmpl||'classic',[['classic','كلاسيك'],['compact','مختصرة'],['big','خط كبير']],'tmpl'))}
 ${opt('غمقة الكتابة','',seg('sset',S().dark||0,[[0,'عادي'],[1,'غامق'],[2,'غامق جداً']],'dark'))}
 ${opt('عدد النسخ','',seg('copies',S().copies||1,[[1,'1'],[2,'2']]))}${opt('طباعة تلقائية بعد كل بيع','',sw(S().autoPrint,'tg','autoPrint'))}</div>
</main>`}}
Object.assign(A,{
 wprefresh:()=>{ui.wpl=null;render()},
 sset:d=>{const v=d.v,n=+v;S()[d.k]=(v!==''&&isFinite(n))?n:v;save();render()},
 desktest:async d=>{const cur=S().cur,pr=cur==='USD'?1:100;await deskPrint(await receiptCanvas({no:0,t:Date.now(),cur,rate:S().rate,total:pr,paid:pr,remaining:0,items:[{name:'تجربة طباعة',price:pr,qty:1}]}),S()[d.v])}
});
Object.assign(CH,{wprinter:v=>{S().wprinter=v;save()},wprinterK:v=>{S().wprinterK=v;save()}});
function afterInit(){if(KIND==='rest'&&(S().oreset||'close')==='close'&&!S().closeOn){S().closeOn=true;save()}stableDev().then(adminCheck);if(!window.__chk){window.__chk=setInterval(adminCheck,6*3600e3)}const s=S(),now=Date.now();if(!s.lastRepW)s.lastRepW=now;if(!s.lastRepM)s.lastRepM=now;
 if(s.users.length&&s.askUser&&!ui.user){SHEET_RESET.who();ui.whoForce=true;open('who',{},true)}
 setTimeout(autoBackup,1500);setTimeout(nbStart,800);
 if(!window.__onl){window.__onl=1;window.addEventListener('online',()=>adminCheck())}}
/* نهاية الدفعة 6 من p5 */
