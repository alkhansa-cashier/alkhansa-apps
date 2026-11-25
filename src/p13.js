/* ============ p13: ملصقات الباركود (A4 وحراري)، العملة المحلية (ليرة تركية)، جهاز المراقبة، استعادة المخزون ============ */
/* ---------- باركود Code128 ---------- */
const C128=['212222','222122','222221','121223','121322','131222','122213','122312','132212','221213','221312','231212','112232','122132','122231','113222','123122','123221','223211','221132','221231','213212','223112','312131','311222','321122','321221','312212','322112','322211','212123','212321','232121','111323','131123','131321','112313','132113','132311','211313','231113','231311','112133','112331','132131','113123','113321','133121','313121','211331','231131','213113','213311','213131','311123','311321','331121','312113','312311','332111','314111','221411','431111','111224','111422','121124','121421','141122','141221','112214','112412','122114','122411','142112','142211','241211','221114','413111','241112','134111','111242','121142','121241','114212','124112','124211','411212','421112','421211','212141','214121','412121','111143','111341','131141','114113','114311','411113','411311','113141','114131','311141','411131','211412','211214','211232','2331112'];
function c128(str){str=String(str);const v=[];
 if(/^\d+$/.test(str)&&str.length>=4){let s=str;if(s.length%2){v.push(104,s.charCodeAt(0)-32,99);s=s.slice(1)}else v.push(105);for(let i=0;i<s.length;i+=2)v.push(+s.slice(i,i+2))}
 else{v.push(104);for(const ch of str){const c=ch.charCodeAt(0);v.push(c>=32&&c<128?c-32:0)}}
 let sum=v[0];for(let i=1;i<v.length;i++)sum+=i*v[i];v.push(sum%103,106);return v.map(x=>C128[x]).join('')}
function drawBars(x,code,bx,by,bw,bh){const pat=c128(code),mods=[...pat].reduce((a,c)=>a+ +c,0)+20,mw=Math.max(1,Math.floor(bw/mods));let cx=bx+Math.round((bw-mw*(mods-20))/2),bar=true;
 x.fillStyle='#000';for(const c of pat){const w=+c*mw;if(bar)x.fillRect(cx,by,w,bh);cx+=w;bar=!bar}}
function fitText(x,t,maxW,px,bold){let s=String(t);x.font=`${bold?'800':'600'} ${px}px Tahoma,system-ui,sans-serif`;while(px>10&&x.measureText(s).width>maxW){px-=1;x.font=`${bold?'800':'600'} ${px}px Tahoma,system-ui,sans-serif`}
 if(x.measureText(s).width>maxW){while(s.length>3&&x.measureText(s+'…').width>maxW)s=s.slice(0,-1);s+='…'}return s}
/* رسم ملصق واحد: الاسم فوق، الباركود بالنص، السعر تحت */
function drawLabel(x,p,X,Y,W,H){const o=S(),pad=Math.round(Math.min(W,H)*.06),showN=o.labName!==false,showP=o.labPrice!==false;x.save();x.direction='rtl';x.textAlign='center';x.fillStyle='#000';
 let top=Y+pad,bot=Y+H-pad;const big=Math.round(H*.15);
 if(showN){const t=fitText(x,p.name,W-2*pad,big,true);x.fillText(t,X+W/2,top+big*.9);top+=big*1.15}
 if(showP){x.font=`800 ${big}px Tahoma,system-ui,sans-serif`;const t=fitText(x,money(pPrice(p)),W-2*pad,big,true);x.fillText(t,X+W/2,bot-big*.15);bot-=big*1.1}
 const num=Math.round(H*.085);bot-=num*1.15;const bh=Math.max(10,bot-top-num*.2);drawBars(x,p.barcode,X+pad,top+num*.1,W-2*pad,bh);
 x.font=`600 ${num}px Tahoma,system-ui,sans-serif`;x.fillText(p.barcode,X+W/2,bot+num);x.restore()}
const LSIZES=[['a4','A4 (24 بالورقة)'],['t4030','حراري 40×30'],['t5025','حراري 50×25'],['roll','ورق الفواتير']];
function labItems(){const L=ui.lab||{},list=[];for(const [id,n] of Object.entries(L)){const p=prodById(id);if(p&&n>0){ensureCode(p);for(let i=0;i<n;i++)list.push(p)}}return list}
function labA4Pages(items){const PX=11.811,W=Math.round(210*PX),H=Math.round(297*PX),cw=Math.round(70*PX),ch=Math.round(37.125*PX),pages=[];let cv,x;
 items.forEach((p,i)=>{const k=i%24;if(!k){cv=document.createElement('canvas');cv.width=W;cv.height=H;x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);pages.push(cv)}
  const col=k%3,row=Math.floor(k/3),X=W-(col+1)*cw,Y=row*ch;drawLabel(x,p,X+8,Y+8,cw-16,ch-16);if(S().labBorder){x.strokeStyle='#bbb';x.strokeRect(X+1,Y+1,cw-2,ch-2)}});return pages}
function labThermalCanvas(p,wmm,hmm){const D=8,cv=document.createElement('canvas'),gap=Math.max(0,Math.round((+S().labGap||0)*D));cv.width=wmm*D;cv.height=hmm*D+gap;const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);drawLabel(x,p,0,0,wmm*D,hmm*D);return cv}
const jpg=cv=>{const b=atob(cv.toDataURL('image/jpeg',.95).split(',')[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return {b:u,w:cv.width,h:cv.height}};
async function labelsA4PDF(items){return pdfBytes(labA4Pages(items).map(jpg))}
{const f=P.labels;P.labels=p=>{let h=f(p);const o=S(),sz=o.labSize||(DESK()?'a4':'roll'),
  bar=`<div class="card" style="margin:0 0 10px"><b>شكل الملصق</b><div class="chips" style="flex-wrap:wrap;margin-top:8px">${LSIZES.map(([k,t])=>`<button class="chip ${sz===k?'on':''}" data-a="labsz" data-v="${k}">${t}</button>`).join('')}</div>
  <div class="chips" style="margin-top:6px"><button class="chip ${o.labName!==false?'on':''}" data-a="labopt" data-k="labName">✓ اسم المنتج</button><button class="chip ${o.labPrice!==false?'on':''}" data-a="labopt" data-k="labPrice">✓ السعر</button>${sz==='a4'?`<button class="chip ${o.labBorder?'on':''}" data-a="labopt" data-k="labBorder">إطار</button>`:''}</div>
  ${sz==='a4'?'<p class="note">بتنطبع على أي طابعة عادية (حبر أو ليزر) على ورق لاصق A4 مقسوم 24 (70×37 ملم)، بينباع بالمكتبات.</p>':sz!=='roll'?`<label class="f" style="margin:8px 0 0">مسافة بين الملصقات (ملم)<input data-c="labgap" inputmode="decimal" value="${o.labGap||0}"></label><p class="note">للطابعة الحرارية بوضع الفواتير. إذا الملصقات عم تزحط، عدّل المسافة.</p>`:''}
  ${DESK()&&sz!=='a4'?'':''}</div>`;
  h=h.replace('<div class="srch">',bar+'<div class="srch">');
  return h.replace(/<button class="fab" data-a="labprint"/,'<button class="fab" data-a="labgo"')}}
A.labsz=d=>{S().labSize=d.v;save();render()};
A.labopt=d=>{S()[d.k]=S()[d.k]===false?true:(d.k==='labBorder'?!S()[d.k]:false);save();render()};
CH.labgap=v=>{S().labGap=Math.max(0,num(v));save()};
A.labgo=async()=>{const items=labItems();if(!items.length)return toast('اختار المنتجات وعدد الملصقات');flush();const sz=S().labSize||(DESK()?'a4':'roll');
 try{if(sz==='a4'){toast('عم نجهّز ملف الملصقات…',8000);const u=await labelsA4PDF(items);window.__lastLabels=u;await shareFile(`ملصقات-${isoD(Date.now())}.pdf`,'application/pdf',u8b64(u),true);toast('جاهز ✅ افتح الملف واطبعه على ورق A4 لاصق',5000)}
  else if(sz==='roll'){if(DESK()){for(const p of items){const cv=labThermalCanvas(p,S().paper===58?48:72,30);await deskPrint(cv,S().lprinter||S().wprinter,true)}toast('تمت الطباعة')}else return A.labprint()}
  else{const [w,hh]=sz==='t4030'?[40,30]:[50,25];toast('جارٍ طباعة الملصقات…');
   if(DESK()){for(const p of items){const cv=labThermalCanvas(p,w,hh);const r=await window.khDesktop.print({img:cv.toDataURL('image/png'),printer:S().lprinter||S().wprinter||'',widthMm:w,printMm:w,offMm:0,ratio:cv.height/cv.width,hMm:hh+(+S().labGap||0)});if(r&&r.ok===false)throw new Error(r.err||'')}}
   else{if(!canBLE())return toast('الطباعة غير متاحة');const out=[];for(const p of items)out.push(...cutTail(escStarBytes(labThermalCanvas(p,w,hh))));out.push(0x1D,0x56,1);await blePrint(new Uint8Array(out),'c')}
   toast('تمت الطباعة')}
  logA(`طباعة ${items.length} ملصق باركود`);ui.lab={};render()}catch(e){toast('تعذّرت الطباعة'+errT(e),8000)}};
/* اختيار طابعة الملصقات على الكمبيوتر */
if(DESK()){const f=P.labels;P.labels=p=>{const L=ui.wpl2;if(!L){ui.wpl2=[];window.khDesktop.printers().then(l=>{ui.wpl2=l||[];render()}).catch(()=>{})}
 const sz=S().labSize||'a4';if(sz==='a4')return f(p);
 return f(p).replace('<div class="srch">',`<div class="card" style="margin:0 0 10px"><label class="f" style="margin:0">طابعة الملصقات<select class="inp" data-c="lprinter" style="margin:0"><option value="">نفس طابعة الفواتير</option>${(ui.wpl2||[]).map(x=>`<option ${S().lprinter===x.name?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label></div><div class="srch">`)};
 CH.lprinter=v=>{S().lprinter=v;save()}}

/* ---------- العملة المحلية (ليرة سورية / ليرة تركية) ---------- */
const LC={SYP:{sym:'ل.س',name:'ليرة سورية'},TRY:{sym:'ل.ت',name:'ليرة تركية'}};
const lcOn=()=>S().lc&&S().lc!=='SYP';
const lcFix=t=>lcOn()&&t&&typeof t==='string'?t.replace(/ل\.س/g,LC[S().lc].sym).replace(/ليرة سورية/g,LC[S().lc].name).replace(/الليرة السورية/g,'ال'+LC[S().lc].name):t;
{const P2=CanvasRenderingContext2D.prototype,ft=P2.fillText,mt=P2.measureText;P2.fillText=function(t,...a){return ft.call(this,lcFix(t),...a)};P2.measureText=function(t){return mt.call(this,lcFix(t))}}
function lcWalk(root){if(!lcOn()||!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){if(n.parentElement&&n.parentElement.closest('.nolc'))continue;const v=n.nodeValue;if(/ل\.س|ليرة سورية/.test(v)){const nv=lcFix(v);if(nv!==v)n.nodeValue=nv}}
 if(root.querySelectorAll)root.querySelectorAll('[placeholder]').forEach(e=>{const v=e.getAttribute('placeholder');if(/ل\.س/.test(v))e.setAttribute('placeholder',lcFix(v))})}
new MutationObserver(ms=>{if(!lcOn())return;for(const m of ms){if(m.type==='characterData')lcWalk(m.target.parentNode);else m.addedNodes.forEach(n=>n.nodeType===3?lcWalk(n.parentNode):lcWalk(n))}}).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
{const f=openWA;openWA=function(ph,t){return f(ph,lcFix(t))}}
{const f=shareText;shareText=function(t){return f(lcFix(t))}}
{const f=notices;notices=function(){let h=f();if(lcOn())h=h.replace(/<div class="warn">(?:(?!<div class="warn">)[\s\S])*?سعر الصرف المقترح اليوم[\s\S]*?<\/button><\/div>/,'');return h}}
{const f=setView;setView=function(){let h=f();if(LITE)return h;const c=S().lc||'SYP';
 const row=`<div class="nolc">${opt('العملة المحلية','العملة يلي بيتعامل فيها المحل غير الدولار',seg('setlc',c,[['SYP','ليرة سورية'],['TRY','ليرة تركية']]))}</div>${c==='TRY'?'<p class="note">بالتركي حط سعر الصرف بإيدك (كم ليرة تركية بالدولار). التحديث التلقائي للتركي بيجي بتحديث قريب.</p>':''}`;
 return h.replace('<h3>العملة وسعر الصرف</h3>','<h3>العملة وسعر الصرف</h3>'+row)}}
A.setlc=d=>{if((S().lc||'SYP')===d.v)return;S().lc=d.v;if(d.v!=='SYP'){S().rateAuto=false;toast('غيّر سعر الصرف: كم '+LC[d.v].name+' بالدولار',6000)}logA('العملة المحلية: '+LC[d.v].name);save();render()};
{const f=A.tg;A.tg=(d,el,e)=>{if(d.k==='rateAuto'&&lcOn()&&!S().rateAuto)return toast('التحديث التلقائي متاح لليرة السورية بس حالياً');return f(d,el,e)}}

/* ---------- استعادة المخزون بس ---------- */
function restoreInv(x){const n=(x.products||[]).length;DB.products=JSON.parse(JSON.stringify(x.products||[]));DB.cats=[...new Set((x.cats||[]).concat(DB.products.map(p=>p.cat).filter(Boolean)))];
 carts.sale=[];carts.quick=[];logA(`استعادة المخزون بس: ${n} منتج`);flush();toast(`انرجع المخزون: ${n} منتج ✅`)}
A.cloudget=async()=>{const dev=toLatin(val('cg_dev')).replace(/\D/g,''),key=toLatin(val('cg_key')).replace(/\D/g,'');if(!dev||key.length<6)return toast('اكتب رقم الجهاز ورمز الاسترجاع (6 أرقام)');
 if(!navigator.onLine)return toast('ما في إنترنت');toast('عم نجيب النسخة…',9000);let r;try{r=await (await fetch(`${ADMIN_URL}?a=bkget&dev=${dev}&key=${key}`)).json()}catch(e){return toast('تعذّر الاتصال')}
 if(!r||!r.ok||!r.data)return toast((r&&r.msg&&r.msg!=='no dev')?r.msg:'ما لقينا نسخة لهالجهاز',5000);let x;try{x=JSON.parse(r.data)}catch(e){return toast('النسخة تالفة')}if(!x||!x.settings)return toast('النسخة تالفة');
 ui.rsx={x,t:r.t};back(()=>{});setTimeout(()=>open('rspick',{},true),80)};
SH.rspick=()=>{const o=ui.rsx;if(!o)return '';const x=o.x;return `<h3>شو بدك ترجّع؟</h3><p class="note">نسخة ${o.t?'بتاريخ '+dt(o.t):''}: ${(x.products||[]).length} منتج، ${(x.sales||[]).length} فاتورة، ${(x.customers||[]).length} زبون</p>
 <button class="li" data-a="rsall" style="margin:0 0 8px">${ic('down')}<div class="gr"><b>كل البيانات</b><small>المنتجات والفواتير والزبائن والإعدادات. بتنمسح البيانات الحالية</small></div></button>
 <button class="li" data-a="rsinv" style="margin:0 0 8px">${ic('box')}<div class="gr"><b>المخزون بس</b><small>المنتجات بأسعارها وباركوداتها ووحداتها، بلا فواتير ولا زبائن. للفرع الجديد أو بداية حسابات جديدة</small></div></button>`};
A.rsall=()=>{const o=ui.rsx;if(!o)return;back(()=>{});setTimeout(()=>ask('استبدال كل البيانات الحالية بالنسخة؟','استرجاع',()=>{restoreData(o.x);ui.rsx=null},true),80)};
A.rsinv=()=>{const o=ui.rsx;if(!o)return;back(()=>{});setTimeout(()=>ask(`استبدال المنتجات الحالية (${DB.products.length}) بمنتجات النسخة (${(o.x.products||[]).length})؟ الفواتير والزبائن ما بتتأثر.`,'استرجاع المخزون',()=>{restoreInv(o.x);ui.rsx=null},true),80)};
/* من ملف نسخة احتياطية على الجهاز */
CH.invfile=async(v,el)=>{const f=el.files&&el.files[0];if(!f)return;try{const x=JSON.parse(await f.text());if(!x||!Array.isArray(x.products))throw 0;ui.rsx={x,t:x.t||0};open('rspick',{},true)}catch(e){toast('الملف مو نسخة احتياطية صحيحة')}};

/* ---------- جهاز المراقبة ---------- */
const MONK='kh_mon';const mon=()=>{try{return JSON.parse(localStorage.getItem(MONK)||'null')}catch(e){return null}};
const monOn=()=>!!(mon()&&mon().on);
async function monSync(quiet){const m=mon();if(!m||!m.on||!ADMIN_URL)return false;if(!navigator.onLine){if(!quiet)toast('ما في إنترنت');return false}
 try{const r=await (await fetch(`${ADMIN_URL}?a=bkget&dev=${m.dev}&key=${m.key}`)).json();if(!r||!r.ok||!r.data){if(!quiet)toast((r&&r.msg)||'ما في نسخة لهالمحل');return false}
  const x=JSON.parse(r.data);if(!x||!x.settings)return false;const lic=DB.lic;adopt(x);DB.lic=lic;DB.ready=true;S().cloud=false;carts.sale=[];carts.quick=[];ui.user=null;
  m.at=Date.now();m.bt=r.t||0;m.store=S().store||'';localStorage.setItem(MONK,JSON.stringify(m));applyTheme();flush();render();if(!quiet)toast('تحدّثت البيانات ✅');return true}
 catch(e){if(!quiet)toast('تعذّر الاتصال');return false}}
const MON_OK=new Set(['tab','open','opensheet','back','shade','sale','stab','uset','accgo','invcat','lowlist','pdfrep','monsync','monoff','hidestats','unlock','showref','dcat','rper','repnow','cust','yes','pick','pkcat','pksort','sharetxt','preview','wasale','sendreport','expdset']);
document.addEventListener('click',e=>{if(!monOn())return;const el=e.target.closest('[data-a]');if(!el||MON_OK.has(el.dataset.a))return;
 if(el.closest('.sheet')&&/^(close|cancel)$/.test(el.dataset.a))return;e.stopImmediatePropagation();e.preventDefault();toast('هاد جهاز مراقبة: للعرض بس 👀')},true);
document.addEventListener('keydown',e=>{if(monOn()&&(e.key==='F9'||e.key==='F2')){e.stopImmediatePropagation();e.preventDefault()}},true);
{const f=notices;notices=function(){const h=f(),m=mon();if(!m||!m.on)return h;
 return `<div class="warn" style="background:var(--okbg);color:var(--ok)">👀<span style="flex:1">جهاز مراقبة: ${esc(m.store||'')} · آخر تحديث ${m.at?dt(m.at).slice(11):'—'}${m.bt?` (نسخة المحل ${dt(m.bt).slice(11)})`:''}</span><button class="btn sm" data-a="monsync">تحديث</button></div>`+h}}
A.monsync=async()=>{toast('عم نجيب آخر البيانات…',8000);await monSync(false)};
A.monoff=()=>ask('إيقاف وضع المراقبة؟ البيانات المعروضة بتضل على الجهاز.','إيقاف',()=>{localStorage.removeItem(MONK);render();toast('انطفى وضع المراقبة')},true);
SH.monform=()=>`<h3>جهاز مراقبة لصاحب المحل</h3><p class="note">من موبايل المحل: الإعدادات ← النسخ السحابي، انسخ "رقم الجهاز" و"رمز الاسترجاع" واكتبهن هون. هالجهاز رح يعرض بيانات المحل للقراءة بس، وما بيقدر يبيع أو يعدّل.</p>
 <label class="f">رقم جهاز المحل<input id="mn_dev" inputmode="numeric"></label><label class="f">رمز الاسترجاع<input id="mn_key" inputmode="numeric" maxlength="6"></label>
 <p class="note" style="color:var(--bad)">⚠️ البيانات الحالية على هالجهاز رح تتبدّل ببيانات المحل.</p><button class="btn pri wide" data-a="monsave">${ic('check')} تشغيل المراقبة</button>`;
A.monsave=async()=>{const dev=toLatin(val('mn_dev')).replace(/\D/g,''),key=toLatin(val('mn_key')).replace(/\D/g,'');if(!dev||key.length<6)return toast('اكتب رقم الجهاز ورمز الاسترجاع');
 if(dev===String(DB.lic.dev))return toast('هاد رقم هالجهاز نفسه، اكتب رقم موبايل المحل');localStorage.setItem(MONK,JSON.stringify({on:true,dev,key}));toast('عم نجيب بيانات المحل…',9000);
 const ok=await monSync(false);if(!ok){localStorage.removeItem(MONK);return}back(()=>{tab='sales'});logA('تشغيل وضع المراقبة')};
{const f=setView;setView=function(){let h=f();if(LITE)return h;const m=mon();
 const c=card('جهاز المراقبة','صاحب المحل بيشوف المبيعات والصافي والمخزون من موبايله وهو برّا المحل',m&&m.on?`<div class="kv"><span>المحل</span><b>${esc(m.store||'')}</b></div><div class="kv"><span>آخر تحديث</span><b>${m.at?dt(m.at):'—'}</b></div><div class="g2 mt"><button class="btn ghost" data-a="monsync">${ic('down')} تحديث هلأ</button><button class="btn ghost bad" data-a="monoff">إيقاف المراقبة</button></div>`
  :`<button class="btn ghost wide" data-a="opensheet" data-v="monform">👀 خلّي هالجهاز جهاز مراقبة</button><p class="note">بيشتغل بعد ما يكون "النسخ السحابي" شغال على موبايل المحل.</p>`);
 const inv=card('استيراد المخزون من ملف','من ملف نسخة احتياطية: بترجّع المنتجات بس أو كل شي',`<label class="btn ghost wide" style="position:relative;overflow:hidden">${ic('box')} اختيار ملف النسخة<input type="file" accept=".json,.khansa,application/json" data-c="invfile" style="position:absolute;inset:0;opacity:0"></label>`);
 const mk='<div class="card"><h3>الدعم الفني</h3>';return h.includes(mk)?h.replace(mk,c+inv+mk):h+c+inv}}
/* المزامنة: جهاز المراقبة بيسحب كل 5 دقايق، وجهاز المحل بيرفع كل ربع ساعة إذا في جديد */
setTimeout(()=>{if(monOn())monSync(true)},3000);setInterval(()=>{if(monOn())monSync(true)},5*60e3);
{const f=cloudUp;cloudUp=function(force){if(monOn())return Promise.resolve(false);const at=S().cloudAt||0,now=Date.now(),last=(DB.sales[0]||{}).t||0;
 if(!force&&at&&dday(at)===dday(now)&&last>at&&now-at>15*60e3&&S().cloud!==false&&navigator.onLine)return f(true);return f(force)}}
setInterval(()=>cloudUp(),15*60e3);
window.__k13={c128,labA4Pages,labelsA4PDF,labThermalCanvas,lcFix,monSync,restoreInv,mon};
/* نهاية p13.js */
