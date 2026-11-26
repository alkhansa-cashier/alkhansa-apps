
/* ============ الكاميرا وقراءة الباركود ============ */
let camStream=null,detector=null,scanT=0,lastCode='',lastT=0,camTried=false;
async function camStart(){if(camStream||camTried)return;camTried=true;ui.camErr='';
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){ui.camErr='الكاميرا غير متاحة على هذا الجهاز. اكتب الباركود في الخانة بالأسفل.';return}
 try{camStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280}},audio:false})}
 catch(e){ui.camErr='لم يُسمح باستخدام الكاميرا. اسمح بها من إعدادات الهاتف، أو اكتب الباركود في الخانة بالأسفل.';return}
 if('BarcodeDetector' in window){try{const want=['ean_13','ean_8','upc_a','upc_e','code_128','code_39','itf','codabar','qr_code'];let f=want;
   try{const sup=await window.BarcodeDetector.getSupportedFormats();f=want.filter(x=>sup.includes(x))}catch(e){}
   detector=new window.BarcodeDetector({formats:f})}catch(e){detector=null}}
 if(!detector)ui.camErr='قراءة الباركود بالكاميرا غير مدعومة على هذا الجهاز. اكتب الباركود بالأسفل أو استخدم قارئ باركود خارجي.'}
function camStop(){clearTimeout(scanT);if(camStream){try{camStream.getTracks().forEach(t=>t.stop())}catch(e){}camStream=null}camTried=false;ui.torch=false;ui.paused=false}
async function camAttach(){await camStart();const t=topE();if(!t||t.name!=='scan')return;const v=$('#cam');
 if(v&&camStream&&v.srcObject!==camStream){v.srcObject=camStream;v.play().catch(()=>{})}scanUI();clearTimeout(scanT);scanT=setTimeout(scanTick,300)}
async function scanTick(){const t=topE();if(!t||t.name!=='scan')return;const v=$('#cam');
 if(detector&&v&&v.readyState>=2&&!ui.paused){try{const r=await detector.detect(v);if(r.length){const code=r[0].rawValue,n=Date.now();
   if(code&&!(code===lastCode&&n-lastT<2500)){lastCode=code;lastT=n;onCode(code)}}}catch(e){}}
 scanT=setTimeout(scanTick,220)}
function handleScan(code,cn){code=toLatin(code).trim();if(!code)return null;const p=prodByCode(code);
 if(!p){beep(false);ui.last={unknown:code};return null}addCart(cn,p,1);beep();buzz();ui.last={name:p.name,price:pPrice(p)};return p}
function onCode(code){const t=topE();if(!t||t.name!=='scan')return;
 if(t.p.field){if(!ui.pd)ui.pd=newDraft();ui.pd.barcode=toLatin(code).trim();beep();buzz();back();return}
 handleScan(code,t.p.cn);scanUI()}
function scanUI(){const t=topE();if(!t||t.name!=='scan')return;const cn=t.p.cn,tot=$('#sctot'),m=$('#scmsg'),L=ui.last;
 if(tot)tot.innerHTML=t.p.field?'':`<span class="tag">${fq(cartCount(carts[cn]))} قطعة، ${money(cartTotal(carts[cn]))}</span>`;if(!m)return;
 if(L&&L.unknown)m.innerHTML=`<div class="m un"><div class="gr">باركود غير مسجّل<br><small>${esc(L.unknown)}</small></div><button class="btn sm" data-a="addunknown">إضافة للمخزون</button></div>`;
 else if(L&&S().showLast)m.innerHTML=`<div class="m"><div class="gr">${esc(L.name)}</div><span class="tag">${money(L.price)}</span></div>`;
 else if(ui.camErr)m.innerHTML=`<div class="m un"><div class="gr">${esc(ui.camErr)}</div></div>`;else m.innerHTML=''}
/* قارئ باركود خارجي (بلوتوث أو USB) يعمل كلوحة مفاتيح */
let kb='',kbT=0;
document.addEventListener('keydown',e=>{const g=e.target;if(g&&/^(INPUT|TEXTAREA|SELECT)$/.test(g.tagName)){
  if(e.key==='Enter'){if(g.id==='mcode'){e.preventDefault();A.mcode()}else if(g.id==='actcode')A.doact();else if(g.id==='pinin')A.unlock()}return}
 const n=Date.now();if(n-kbT>90)kb='';kbT=n;
 if(e.key==='Enter'){const code=kb;kb='';if(code.length>=4)extScan(code)}else if(e.key&&e.key.length===1)kb+=e.key});
function extScan(code){if(!DB.ready)return;const t=topE();
 if(t&&t.name==='prod'){ui.pd=readProd();ui.pd.barcode=toLatin(code).trim();render();return}
 if(t&&t.name==='scan'){onCode(code);return}
 if(t&&t.sheet)return;
 const cn=t&&(t.name==='quick'||(t.p&&t.p.cn==='quick'))?'quick':'sale';const p=handleScan(code,cn);
 toast(p?`${p.name}، ${money(pPrice(p))}`:'باركود غير مسجّل: '+code);render()}

/* ============ الأزرار ============ */
const readFile=(f,asData)=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;asData?r.readAsDataURL(f):r.readAsText(f)});
const saleOf=id=>DB.sales.find(x=>x.id===id);
const rmFromCarts=pid=>{for(const k of ['sale','quick'])carts[k]=carts[k].filter(i=>i.pid!==pid)};
const A={
 tab:d=>{tab=d.v;render()},
 open:d=>open(d.v,d.id?{id:d.id}:{}),
 opensheet:d=>open(d.v,d.id?{id:d.id}:{},true),
 back:()=>back(),
 shade:(d,el,e)=>{if(e.target===el&&topE()&&topE().name!=='welcome')back()},
 yes:()=>{const c=ui.confirm;ui.confirm=null;back(c&&c.fn)},

 /* الكاشير والسلة */
 scan:d=>{ui.last=null;lastCode='';open('scan',{cn:d.v})},
 scanfield:()=>{ui.pd=readProd();ui.last=null;lastCode='';open('scan',{field:true,cn:'sale'})},
 pick:d=>{ui.sel='';ui.pk.q='';open('pick',{cn:d.v})},
 manual:d=>open('manual',{cn:d.v||'sale'},true),
 addmanual:()=>{const cn=topE().p.cn,price=num($('#mprice').value),qty=num($('#mqty').value)||1;
  carts[cn].push({pid:'',name:$('#mname').value.trim()||'منتج يدوي',price,cost:num(($('#mcost')||{}).value||''),qty:r3(qty)});back()},
 cq:d=>{const c=carts[d.cn],it=c[+d.i];if(!it)return;it.qty=r3(it.qty+ +d.d);if(it.qty<=0)c.splice(+d.i,1);render()},
 cdel:d=>{carts[d.cn].splice(+d.i,1);render()},
 qedit:d=>open('qty',{cn:d.cn,i:+d.i},true),
 qpick:d=>{$('#qval').value=d.v},
 qsave:()=>{const p=topE().p,c=carts[p.cn],it=c[p.i];if(it){const q=num($('#qval').value);if(q<=0)c.splice(p.i,1);else{it.qty=r3(q);const pr=$('#qprice');if(pr)it.price=num(pr.value)}}back()},
 cancelsale:()=>ask('إلغاء عملية البيع وتفريغ السلة؟','إلغاء البيع',()=>{carts.sale=[];ui.saleCust=''},true),
 quickclear:()=>{carts.quick=[];ui.last=null;render()},
 checkout:()=>{if(!carts.sale.length)return;if(!licCan()){toast(licText(),6000);open('act');return}
  ui.pay={paid:0,method:'cash',dp:0,da:0};ui.pay.paid=payTotal();open('pay',{},true)},
 paym:(d,el)=>{const was=ui.pay.method;ui.pay.method=d.v;if(d.v==='mix'||was==='mix'){if(d.v==='mix')ui.pay.ps=0;render()}else el.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el))},
 dosale:()=>{const t=payTotal(),paid=num($('#paid').value);if(!carts.sale.length)return back();
  let meta=null;if(S().kind==='rest'){meta=Object.assign({type:'take'},ui.ord||{});if(!meta.no)meta.no=nextOrderNo()}
  if(paid<t&&!ui.saleCust)return toast(LITE?'المبلغ المدفوع أقل من الإجمالي':'اختر الزبون لتسجيل المبلغ المتبقي كدين عليه');
  if(!licCan())return toast(licText(),6000);
  const s=makeSale(paid,ui.pay.method,ui.saleCust,meta);ui.saleCust='';ui.ord=null;if(S().autoPrint){if(ble.c.ch||DESK())printSale(s,true);else setTimeout(()=>toast('الطابعة غير متصلة، اتصل بها من الإعدادات'),2700)}ui.sel='';beep();swap('sale',{id:s.id});toast('تم إتمام البيع رقم '+s.no)},

 /* الزبائن */
 choosecust:()=>{const pd=$('#paid');if(pd)ui.pay.paid=num(pd.value);ui.cpq='';open('custpick',{},true)},
 pickcust:d=>{ui.saleCust=d.id;back()},
 nocust:()=>{ui.saleCust='';back()},
 newcust:d=>open('custform',d.v==='pick'?{pick:true}:{},true),
 editcust:d=>open('custform',{id:d.id},true),
 savecust:()=>{const p=topE().p,name=$('#cname').value.trim(),phone=toLatin($('#cphone').value).trim();if(!name)return toast('اكتب اسم الزبون');let c;
  if(p.id){c=custById(p.id);c.name=name;c.phone=phone}else{c={id:uid(),name,phone,t:Date.now()};DB.customers.push(c);logA('إضافة زبون: '+name)}
  flush();if(p.pick){ui.saleCust=c.id;back(null,2)}else back()},
 cust:d=>open('cust',{id:d.id}),
 delcust:d=>{const b=balance(d.id);ask(b>0?`على هذا الزبون دين ${money(b)}. حذفه مع سجل ديونه؟`:'حذف هذا الزبون؟','حذف',()=>{const c=custById(d.id);
  DB.customers=DB.customers.filter(x=>x.id!==d.id);DB.ledger=DB.ledger.filter(l=>l.cid!==d.id);if(ui.saleCust===d.id)ui.saleCust='';logA('حذف زبون: '+(c?c.name:''));flush();back()},true)},
 savedebt:d=>{const a=num($('#dpay').value);if(a<=0)return toast('اكتب مبلغ الدفعة');const c=custById(d.id);
  DB.ledger.push({id:uid(),cid:d.id,sid:'',amt:-a,cur:S().cur,t:Date.now(),note:'دفعة مستلمة'});logA(`دفعة من ${c?c.name:''}: ${money(a)}`);flush();toast('تم تسجيل الدفعة');back()},
 remind:d=>{const c=custById(d.id);if(!c)return;openWA(c.phone,`مرحباً ${c.name}،\nنذكّركم بأن المبلغ المتبقي عليكم لدى ${S().store||'متجرنا'} هو ${money(balance(c.id))}.\nشكراً لكم.`)},

 /* الفواتير */
 sale:d=>open('sale',{id:d.id}),
 donesale:()=>back(),
 wasale:d=>{const s=saleOf(d.id);if(s)openWA($('#waph').value,receiptText(s))},
 sharetxt:d=>{const s=saleOf(d.id);if(s)shareText(receiptText(s))},
 preview:d=>open('rcpt',{id:d.id},true),
 shareimg:async d=>{const s=saleOf(d.id);if(!s)return;try{const cv=await receiptCanvas(s);await shareFile(`invoice-${s.no}.png`,'image/png',cv.toDataURL('image/png').split(',')[1],true)}catch(e){toast('تعذّر إنشاء الصورة'+errT(e),9000)}},
 printsale:async d=>{const s=saleOf(d.id);if(s)printSale(s)},
 dupsale:d=>{const s=saleOf(d.id);if(!s)return;const cur=S().cur;for(const i of s.items){const ex=i.pid&&carts.sale.find(x=>x.pid===i.pid);
   if(ex)ex.qty=r3(ex.qty+i.qty);else carts.sale.push({pid:i.pid,name:i.name,price:roundM(conv(i.price,s.cur,cur)),cost:i.cost?roundM(conv(i.cost,s.cur,cur)):0,qty:i.qty})}
  toast('تم نسخ الأصناف إلى السلة');home('pos')},
 refund:d=>{const s=saleOf(d.id);if(s)ask('إرجاع الفاتورة وإعادة الكميات إلى المخزون؟','إرجاع الفاتورة',()=>{refundSale(s);toast('تم إرجاع الفاتورة')},true)},
 showref:()=>{ui.showRef=!ui.showRef;render()},
 hidestats:()=>{if(locked())open('unlock',{},true);else{ui.hide=!ui.hide;render()}},

 /* المنتجات والمخزون */
 newprod:()=>{ui.pd=newDraft();ui.after=null;open('prod')},
 editprod:d=>{const p=prodById(d.id);if(!p)return;ui.after=null;
  ui.pd={id:p.id,barcode:p.barcode||'',name:p.name,price:String(p.price),cur:p.cur,link:true,cost:p.cost?String(p.cost):'',ccur:p.ccur||p.cur,stock:p.track?String(p.stock):'',track:!!p.track,cat:p.cat||'',exp:p.exp||'',wp:p.wprice?String(p.wprice):'',more:false};open('prod')},
 addunknown:()=>{const t=topE(),code=ui.last&&ui.last.unknown;ui.pd=newDraft(code);ui.after={cn:t.p.cn};ui.last=null;open('prod')},
 ptg:d=>{ui.pd=readProd();ui.pd[d.k]=!ui.pd[d.k];if(d.k==='more')ui.more=ui.pd.more;render()},
 pseg:d=>{ui.pd=readProd();ui.pd[d.k]=d.v;if(d.k==='cur'&&!num(ui.pd.cost))ui.pd.ccur=d.v;render()},
 saveprod:()=>{const d=readProd();if(!d.name)return toast('اكتب اسم المنتج');let price=num(d.price),cur=d.cur;
  if(d.barcode){const o=prodByCode(d.barcode);if(o&&o.id!==d.id)return toast('هذا الباركود مسجّل لمنتج آخر: '+o.name)}
  if(cur==='USD'&&!d.link){price=roundM(price*S().rate,'SYP');cur='SYP'}
  const data={name:d.name,barcode:d.barcode,price,cur,cost:num(d.cost),ccur:d.ccur,track:!!d.track,stock:d.track?num(d.stock):0,cat:d.cat,exp:d.exp||'',wprice:num(d.wp||'')};
  if(d.cat&&!DB.cats.includes(d.cat))DB.cats.push(d.cat);S().lastCur=d.cur;let p;
  if(d.id){p=prodById(d.id);const old=p.price,oc=p.cur;Object.assign(p,data);logA(`تعديل منتج: ${p.name}`+((old!==price||oc!==cur)?`، السعر من ${money(old,oc)} إلى ${money(price,cur)}`:''))}
  else{p=Object.assign({id:uid(),sold:0,t:Date.now()},data);DB.products.push(p);logA('إضافة منتج: '+p.name);if(ui.after){addCart(ui.after.cn,p,1);ui.after=null}}
  flush();toast('تم حفظ المنتج');if(!d.id&&d.more){ui.pd=newDraft();render()}else{ui.pd=null;back()}},
 delprod:()=>{const d=ui.pd;if(!d||!d.id)return;ask('حذف هذا المنتج من المخزون؟','حذف المنتج',()=>{DB.products=DB.products.filter(p=>p.id!==d.id);rmFromCarts(d.id);logA('حذف منتج: '+d.name);flush();ui.pd=null;back()},true)},
 invcat:d=>{ui.inv.cat=d.v;render()},
 lowlist:()=>{tab='inv';ui.inv.cat='~low';ui.inv.q='';render()},
 backup:()=>{logA('إنشاء نسخة احتياطية');shareFile(`khansa-backup-${dday(Date.now())}.json`,'application/json',JSON.stringify(DB))},
 exportcsv:()=>shareFile(`khansa-products-${dday(Date.now())}.csv`,'text/csv',productsCSV()),
 bulk:d=>{const pct=num($('#bpct').value),cat=$('#bcat').value;if(pct<=0)return toast('اكتب النسبة المئوية');const f=1+ +d.v*pct/100;let n=0;
  for(const p of DB.products)if(!cat||p.cat===cat){p.price=p.cur==='USD'?Math.round(p.price*f*100)/100:roundM(p.price*f,'SYP');n++}
  logA(`${+d.v>0?'رفع':'خفض'} أسعار ${n} منتج بنسبة ${pct}%${cat?' في قسم '+cat:''}`);flush();toast(`تم تعديل أسعار ${n} منتج`);back(null,2)},

 /* اختيار المنتجات */
 padd:d=>{const cn=fullPage().p.cn,p=prodById(d.id);if(!p)return;addCart(cn,p,1);buzz();ui.sel=p.id;render()},
 q:d=>{const c=carts[d.cn],it=c.find(x=>x.pid===ui.sel);if(!it)return;it.qty=r3(it.qty+ +d.d);if(it.qty<=0){c.splice(c.indexOf(it),1);ui.sel=''}render()},
 qset:d=>{const it=carts[d.cn].find(x=>x.pid===ui.sel);if(it){it.qty=+d.v;render()}},
 qdel:d=>{const c=carts[d.cn],it=c.find(x=>x.pid===ui.sel);if(it)c.splice(c.indexOf(it),1);ui.sel='';render()},
 qclose:()=>{ui.sel='';render()},
 pksort:d=>{ui.pk.sort=d.v;render()},
 pkcat:d=>{ui.pk.cat=d.v;render()},
 tglist:()=>{const s=S(),v=s.list?'list':(s.view==='small'?'small':'grid'),n={grid:'small',small:'list',list:'grid'}[v];s.view=n;s.list=n==='list';save();toast({grid:'عرض عادي',small:'عرض صغير: 4 بالسطر',list:'عرض قائمة'}[n]);render()},

 /* الماسح */
 mcode:()=>{const e=$('#mcode');if(!e||!e.value.trim())return;onCode(e.value);const e2=$('#mcode');if(e2)e2.value=''},
 torch:async()=>{if(!camStream)return toast('الكاميرا غير مفعّلة');ui.torch=!ui.torch;
  try{await camStream.getVideoTracks()[0].applyConstraints({advanced:[{torch:ui.torch}]});render()}catch(e){ui.torch=false;toast('الفلاش غير مدعوم على هذا الجهاز')}},
 campause:()=>{ui.paused=!ui.paused;render()},

 /* الإعدادات */
 tg:d=>{S()[d.k]=!S()[d.k];save();render()},
 setcur:d=>{if(S().cur===d.v)return;const go=()=>{S().cur=d.v;carts.sale=[];carts.quick=[];logA('تغيير عملة البيع إلى '+(d.v==='USD'?'الدولار':'الليرة'));save()};
  if(carts.sale.length||carts.quick.length)ask('تغيير العملة يفرّغ السلة الحالية. متابعة؟','تغيير العملة',go);else{go();render()}},
 cols:d=>{S().cols=+d.v;save();render()},
 theme:d=>{S().theme=d.v;applyTheme();save();render()},
 paper:d=>{S().paper=+d.v;delete S().pmm;save();render()},
 pw:d=>{S().pw=+d.v;save();render()},
 pspeed:d=>{S().pspeed=d.v;save();render()},
 pq:d=>{S().pq=d.v;save();render()},
 ptest:async d=>{const v=+d.v,cur=S().cur,pr=cur==='USD'?5:650;
  try{toast('جارٍ الطباعة…');let bytes;
   if(v===4)bytes=textTestBytes();
   else{const ls=[24,23,22][v-1],cv=await receiptCanvas({no:v,t:Date.now(),cur,rate:S().rate,total:pr*2,paid:pr*2,remaining:0,items:[{name:'تجربة المسافة '+ls,price:pr,qty:1},{name:'وجبة شاورما عربي',price:pr,qty:1}]});bytes=escStarBytes(cv,ls)}
   const t0=Date.now();await blePrint(bytes,'c');toast(`تمت الطباعة خلال ${((Date.now()-t0)/1000).toFixed(1)} ثانية`)}
  catch(e){toast('تعذّرت الطباعة. اكبس "بحث واتصال" أولاً'+errT(e),9000)}},
 ls:d=>{S().ls=+d.v;save();render()},
 dark:d=>{S().dark=+d.v;save();render()},
 rper:d=>{ui.rper=d.v;render()},
 sendreport:()=>{const ph=toLatin($('#rowner').value).trim();if(!ph)return toast('اكتب رقم صاحب المحل');S().owner=ph;logA('إرسال تقرير '+PERIODS[ui.rper]);save();openWA(ph,reportText(ui.rper))},
 savestore:()=>{const s=S();s.store=$('#s_store').value.trim();s.phone=toLatin($('#s_phone').value).trim();s.owner=toLatin($('#s_owner').value).trim();s.footer=$('#s_footer').value.trim();flush();toast('تم حفظ بيانات المتجر')},
 rmlogo:()=>{S().logo='';save();render()},
 savepin:()=>{const v=toLatin($('#newpin').value).replace(/\D/g,'');if(v.length<4)return toast('الرمز لازم يكون 4 أرقام على الأقل');S().pin=v;ui.unlocked=true;logA('تفعيل قفل الإعدادات');flush();toast('تم تفعيل القفل');back()},
 rmpin:()=>ask('إلغاء قفل الإعدادات والأرباح؟','إلغاء القفل',()=>{S().pin='';logA('إلغاء قفل الإعدادات');flush()}),
 unlock:()=>{const e=$('#pinin');if(!e)return;const pv=toLatin(e.value);if((S().pin&&pv===S().pin)||S().users.some(u=>u.role==='admin'&&u.pin===pv)){ui.unlocked=true;if(topE()&&topE().name==='unlock')back();else render()}else{e.value='';toast('الرمز غير صحيح')}},
 addcat:()=>{const v=$('#newcat').value.trim();if(!v)return;if(DB.cats.includes(v))return toast('القسم موجود');DB.cats.push(v);save();render()},
 delcat:d=>ask(`حذف قسم "${d.v}"؟ المنتجات تبقى بدون قسم.`,'حذف القسم',()=>{DB.cats=DB.cats.filter(c=>c!==d.v);DB.products.forEach(p=>{if(p.cat===d.v)p.cat=''});if(ui.inv.cat===d.v)ui.inv.cat='';if(ui.pk.cat===d.v)ui.pk.cat='';flush()},true),
 clearlog:()=>ask('مسح سجل النشاطات كاملاً؟','مسح السجل',()=>{DB.log=[];flush()},true),
 support:()=>openWA(SUPPORT,`مرحباً، أحتاج مساعدة في تطبيق ${APPNAME}.\nالمتجر: ${S().store||'-'}\nرقم الجهاز: ${DB.lic.dev}\nالإصدار: ${VERSION}`),
 pastecode:async()=>{try{const t=await navigator.clipboard.readText();const e=$('#actcode');if(e&&t){e.value=t.trim();toast('تم اللصق')}}catch(x){toast('اكبس مطوّل على الخانة واختار لصق')}},
 askpack:d=>{const k=PACKS.find(x=>x.id===+d.v);if(k)openWA(SUPPORT,`مرحباً، أريد تفعيل "${k.name}" بسعر $${k.price} في تطبيق ${APPNAME}.\nالمتجر: ${S().store||'-'}\nرقم الطلب: ${reqCode()}`)},
 doact:async()=>{const e=$('#actcode');if(!e)return;const raw=toLatin(e.value).replace(/\s+/g,''),c=raw.replace(/\D/g,'');const err=/^KH/i.test(raw)?await activateSigned(raw):c.length===10?await onlineActivate(c):'هاد الكود من النوع القديم وما عاد مقبول. اطلب كود جديد';if(err)return toast(err);beep();toast('تم التفعيل بنجاح');render()},
 bleconn:async d=>{try{await bleConnect(d.v||'c');const ch=ble[d.v||'c'].ch;toast('تم الاتصال بالطابعة'+(ch&&ch.chunk?' ('+ch.chunk+'/'+(ch.mtu||'?')+')':''));render()}catch(e){toast('تعذّر الاتصال بالطابعة'+errT(e),9000)}},
 bletest:async d=>{const cur=S().cur,pr=cur==='USD'?1:100;try{toast('جارٍ الطباعة…');
  if(d.v&&d.v!=='c'){const st=kStations().find(s=>s.id===d.v)||{name:'المطبخ'};await blePrint(escStarBytes(await kitchenCanvas({no:0,type:'dine',table:'1',st:st.name},[{name:'تجربة طباعة '+st.name,qty:1,note:''}],false)),d.v);toast('تمت الطباعة');return}
  const t0=Date.now();await blePrint(escStarBytes(await receiptCanvas({no:0,t:Date.now(),cur,rate:S().rate,total:pr,paid:pr,remaining:0,items:[{name:'تجربة طباعة',price:pr,qty:1}]})));toast(`تمت الطباعة خلال ${((Date.now()-t0)/1000).toFixed(1)} ثانية`)}catch(e){toast('تعذّرت الطباعة. تأكد من تشغيل الطابعة'+errT(e),9000)}},
 savewelcome:()=>{const r=num($('#w_rate').value);S().store=$('#w_store').value.trim();if(r>0)S().rate=r;S().kind=ui.wk;if(ui.ws)seed(ui.wk);DB.ready=true;flush();back()},
 wkind:d=>{ui.wst=$('#w_store').value;ui.wr=$('#w_rate').value;ui.wk=d.v;render()},
 wsample:()=>{ui.wst=$('#w_store').value;ui.wr=$('#w_rate').value;ui.ws=!ui.ws;render()},
 qopt:d=>{const v=+d.v,q=S().quick,i=q.indexOf(v);if(i>=0){if(q.length===1)return toast('اترك زراً واحداً على الأقل');q.splice(i,1)}else{q.push(v);q.sort((a,b)=>a-b)}save();render()},
 kind:d=>{if(S().kind===d.v)return;const go=()=>{S().kind=d.v;carts.sale=[];ui.ord=null;ui.saleCust='';logA('تغيير نوع النشاط إلى '+(d.v==='rest'?'مطعم':'محل'));save()};
  if(carts.sale.length)ask('تغيير نوع النشاط يفرّغ الطلب الحالي. متابعة؟','تغيير',go);else{go();render()}},

 /* المطعم */
 neword:d=>{ui.saleCust='';if(d.v==='take'){ui.ord={type:'take'};ui.sel='';ui.pk.q='';open('pick',{cn:'sale'});return}ui.od={type:d.v};open('ordinfo',{},true)},
 editord:()=>{ui.od=Object.assign({},ui.ord||{type:'take'},{edit:true});open('ordinfo',{},true)},
 otype:d=>{readOd();ui.od.type=d.v;render()},
 otab:d=>{readOd();ui.od.table=d.v;render()},
 saveord:()=>{const d=readOd();if(d.type==='dine'&&!d.table)return toast('اختر رقم الطاولة');if(d.type==='del'&&!d.name&&!d.phone)return toast('اكتب اسم الزبون أو رقمه');
  ui.ord=Object.assign(ui.ord||{},{type:d.type,table:d.type==='dine'?d.table:'',name:d.type==='del'?d.name||'':'',phone:d.type==='del'?d.phone||'':'',addr:d.type==='del'?d.addr||'':''});
  if(!d.edit&&d.fee>0)carts.sale.push({pid:'',name:'أجرة توصيل',price:roundM(d.fee),cost:0,qty:1});
  if(d.edit)back();else{ui.sel='';ui.pk.q='';swap('pick',{cn:'sale'})}},
 holdord:()=>{if(!carts.sale.length)return;const o=saveOrder();flush();carts.sale=[];ui.ord=null;toast('تم حفظ الطلب رقم '+o.no);render()},
 sendk:()=>{const cart=carts.sale;if(!cart.length)return;const lines=[];
  for(const it of cart){const d=r3(it.qty-(it.sent||0)),ch=it.sent>0&&(it.note||'')!==(it.sentNote||'');
   if(ch)lines.push({name:'تعديل: '+it.name,qty:Math.min(it.sent,it.qty),note:it.note||'بدون ملاحظة'});if(d>0)lines.push({name:it.name,qty:d,note:it.note||'',pid:it.pid||''});it.sent=it.qty;it.sentNote=it.note||''}
  const o=saveOrder(),add=(o.kprints||0)>0;if(lines.length)o.kprints=(o.kprints||0)+1;logA(`إرسال طلب ${o.no} للمطبخ`);flush();
  carts.sale=[];ui.ord=null;if(!lines.length){toast('لا أصناف جديدة للمطبخ، تم حفظ الطلب');render();return}
  ui.kt={o:JSON.parse(JSON.stringify(o)),lines,add};
  if(S().onePr||(S().kst||[]).length||(S().autoK&&(ble.k.ch||ble.c.ch))){render();kSend(ui.kt.o,lines,add);return}
  open('kt',{},true)},
 ktprint:async()=>{const k=ui.kt;if(!k)return;if(!canBLE())return toast('الطباعة عبر البلوتوث غير مفعّلة في هذه النسخة بعد');
  try{toast('جارٍ الطباعة…');await blePrint(escStarBytes(await kitchenCanvas(k.o,k.lines,k.add)),'k');toast('تمت الطباعة')}catch(e){toast('تعذّرت الطباعة. تأكد من تشغيل طابعة المطبخ'+errT(e),9000)}},
 loadord:d=>{const o=DB.orders.find(x=>x.id===d.id);if(!o)return;const cur=S().cur;
  carts.sale=JSON.parse(JSON.stringify(o.items)).map(i=>Object.assign(i,{price:roundM(conv(i.price,o.cur||cur,cur)),cost:i.cost?roundM(conv(i.cost,o.cur||cur,cur)):0}));
  ui.ord={id:o.id,no:o.no,t:o.t,type:o.type,table:o.table,name:o.name,phone:o.phone,addr:o.addr};ui.saleCust='';render()},
 cancelord:()=>{const o=ui.ord,clr=()=>{carts.sale=[];ui.ord=null};
  if(o&&o.id)ask(`إلغاء الطلب رقم ${o.no} نهائياً؟`,'إلغاء الطلب',()=>{DB.orders=DB.orders.filter(x=>x.id!==o.id);logA(`إلغاء طلب رقم ${o.no}`);clr();flush()},true);
  else if(carts.sale.length)ask('إلغاء هذا الطلب؟','إلغاء الطلب',clr,true);else{clr();render()}}
};

/* ============ ربط الأحداث ============ */
document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el||el.disabled)return;const f=A[el.dataset.a];if(f)f(el.dataset,el,e)});
const IN={invq:v=>{ui.inv.q=v;$('#invlist').innerHTML=invList()},custq:v=>{ui.cq=v;$('#custlist').innerHTML=custList()},cpq:v=>{ui.cpq=v;$('#cplist').innerHTML=cpList()},
 pkq:(v,el)=>{ui.pk.q=v;$('#pkgrid').innerHTML=pkGrid(el.dataset.cn)},salesq:v=>{ui.sq=v;$('#saleslist').innerHTML=salesList()},
 paid:v=>{ui.pay.paid=num(v);$('#rem').textContent=remText()}};
document.addEventListener('input',e=>{const el=e.target.closest('[data-i]');if(el&&IN[el.dataset.i])IN[el.dataset.i](el.value,el)});
const CH={period:v=>{ui.period=v;render()},
 rate:v=>{const r=num(v);if(r>0&&r!==S().rate){S().rate=r;logA('تغيير سعر الصرف إلى '+fmt(r));save();toast('تم تحديث سعر الصرف')}render()},
 quick:v=>{const l=[...new Set(String(v).split(/[\s,،]+/).map(num).filter(x=>x>0).map(r3))].sort((a,b)=>a-b).slice(0,8);if(l.length){S().quick=l;save()}render()},
 lowat:v=>{S().lowAt=Math.max(0,num(v));save();render()},
 qnote:(v,el)=>{const it=carts[el.dataset.cn].find(x=>x.pid===ui.sel);if(it){it.note=v.trim();render()}},
 qin:(v,el)=>{const c=carts[el.dataset.cn],it=c.find(x=>x.pid===ui.sel),q=num(v);if(it&&q>0)it.qty=r3(q);render()},
 logo:async(v,el)=>{const f=el.files&&el.files[0];if(!f)return;try{const im=await loadImg(await readFile(f,true));if(!im)throw 0;const k=Math.min(1,320/Math.max(im.width,im.height)),cv=document.createElement('canvas');
   cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);x.drawImage(im,0,0,cv.width,cv.height);
   S().logo=cv.toDataURL('image/jpeg',.85);save();render()}catch(e){toast('تعذّر قراءة الصورة'+errT(e),9000)}},
 restore:async(v,el)=>{const f=el.files&&el.files[0];if(!f)return;let d;try{d=JSON.parse(await readFile(f))}catch(e){return toast('الملف غير صالح')}
  if(!d||!d.settings||!Array.isArray(d.products))return toast('هذا الملف ليس نسخة احتياطية من '+APPNAME);
  ask('استبدال كل البيانات الحالية بالنسخة الاحتياطية؟','استعادة النسخة',()=>{const lic=DB.lic;adopt(d);DB.lic=lic;DB.ready=true;carts.sale=[];carts.quick=[];applyTheme();logA('استعادة نسخة احتياطية');flush();toast('تمت استعادة البيانات');back()},true)},
 importcsv:async(v,el)=>{const f=el.files&&el.files[0];if(!f)return;try{const r=importCSV(await readFile(f));if(!r)return toast('الملف فارغ');toast(`تمت إضافة ${r.add} منتج وتحديث ${r.upd}`);back()}catch(e){toast('تعذّرت قراءة الملف'+errT(e),9000)}}};
document.addEventListener('change',e=>{const el=e.target.closest('[data-c]');if(el&&CH[el.dataset.c])CH[el.dataset.c](el.value,el)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){flush();ui.unlocked=false}});
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme)}catch(e){}

function readOd(){const d=ui.od,g=id=>{const e=$('#'+id);return e?e.value.trim():null};let v;
 if((v=g('otable'))!==null)d.table=toLatin(v);if((v=g('oname'))!==null)d.name=v;if((v=g('ophone'))!==null)d.phone=toLatin(v);if((v=g('oaddr'))!==null)d.addr=v;if((v=g('ofee'))!==null)d.fee=num(v);return d}
function saveOrder(){let o=ui.ord&&ui.ord.id&&DB.orders.find(x=>x.id===ui.ord.id);
 if(!o){o=Object.assign({kprints:0},ui.ord||{type:'take'},{id:uid(),no:nextOrderNo(),t:Date.now()});DB.orders.push(o)}
 else Object.assign(o,ui.ord,{id:o.id,no:o.no,t:o.t});
 o.cur=S().cur;o.items=JSON.parse(JSON.stringify(carts.sale));return o}
function seed(kind){const L=kind==='rest'?[['سندويش شاورما دجاج',250,'شاورما'],['وجبة شاورما عربي',650,'شاورما'],['صحن شاورما',800,'شاورما'],['بروستد 4 قطع',900,'بروستد'],['بروستد 8 قطع',1700,'بروستد'],['بطاطا مقلية',150,'مقبلات'],['صحن حمص',200,'مقبلات'],['كيلو قشة',1300,'حلويات'],['كيلو كنافة',1100,'حلويات'],['بيبسي',100,'مشروبات'],['عصير برتقال طبيعي',250,'مشروبات'],['مياه صغيرة',50,'مشروبات']]
 :[['عصير برتقال 1 لتر',130,'مشروبات',40],['مياه 1.5 لتر',50,'مشروبات',100],['محارم 500 ورقة',130,'منظفات',3],['سكر 1 كغ',150,'مونة',25],['رز 1 كغ',180,'مونة',30],['شاي 400 غ',350,'مونة',12]];
 L.forEach(([name,price,cat,stock],i)=>{DB.products.push({id:uid(),name,barcode:'',price,cur:'SYP',cost:0,ccur:'SYP',track:stock!=null,stock:stock||0,cat,sold:0,t:Date.now()+i});if(!DB.cats.includes(cat))DB.cats.push(cat)})}

/* ============ التشغيل ============ */
async function init(){await store.open();const d=await store.get();if(d&&d.settings)adopt(d);applyTheme();
 try{history.replaceState({n:0},'')}catch(e){}
 try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
 licNow();window.__booted=true;render();if(DB.ready)afterInit()}
window.__khansa={get DB(){return DB},carts,A,codeFor,reqCode};
init();
})();
