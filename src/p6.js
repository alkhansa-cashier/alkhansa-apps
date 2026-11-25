/* ============ الخنساء محاسب: الحسابات ============ */
const ACC=EDITION==='acc';
function accInit(){for(const k of ['vouchers','partners','pledger','assets','quotes','offers'])if(!Array.isArray(DB[k]))DB[k]=[]}
const cv=(a,c,r)=>conv(a,c||S().cur,S().cur,r);
const BOXES=[['cash','الصندوق (كاش)'],['sham','شام كاش']];
const boxName=b=>b==='sham'?'شام كاش':'الصندوق';
/* حركات الصناديق مجمعة من كل الدفاتر */
function boxMoves(){accInit();const m=[];
 for(const s of DB.sales)if(!s.refunded&&s.paid>0){const sp=shamPart(s),cp=cashPart(s);if(cp)m.push({t:s.t,box:'cash',v:cv(cp,s.cur,s.rate),txt:'بيع فاتورة '+s.no});if(sp)m.push({t:s.t,box:'sham',v:cv(sp,s.cur,s.rate),txt:'بيع فاتورة '+s.no})}
 for(const l of DB.ledger)if(l.amt<0&&!l.sid)m.push({t:l.t,box:l.box||'cash',v:cv(-l.amt,l.cur),txt:'قبض دين: '+((custById(l.cid)||{}).name||'')});
 for(const e of DB.expenses)if(e.drawer)m.push({t:e.t,box:e.box||'cash',v:-cv(e.amt,e.cur),txt:e.cat+(e.note?' · '+e.note:'')});
 for(const l of DB.sledger)if(l.drawer&&l.amt<0){const s=DB.suppliers.find(x=>x.id===l.sid);m.push({t:l.t,box:l.box||'cash',v:-cv(-l.amt,l.cur),txt:'دفعة للمورد '+(s?s.name:'')})}
 for(const v of DB.vouchers)m.push({t:v.t,box:v.box,v:(v.type==='in'?1:-1)*cv(v.amt,v.cur),txt:(v.type==='in'?'سند قبض':'سند دفع')+(v.party?' · '+v.party:'')+(v.note?' · '+v.note:''),vid:v.id});
 for(const l of DB.pledger)if(l.kind!=='profit'&&l.box){const p=DB.partners.find(x=>x.id===l.pid);m.push({t:l.t,box:l.box,v:l.kind==='cap'?cv(l.amt,l.cur):-cv(l.amt,l.cur),txt:(l.kind==='cap'?'رأس مال من ':'مسحوبات ')+(p?p.name:'')})}
 for(const x of DB.tips||[])m.push({t:x.t,box:x.box,v:(x.kind==='out'?-1:1)*cv(x.amt,x.cur),txt:x.kind==='out'?'توزيع بخشيش':'بخشيش فاتورة '+x.no});
 for(const a of DB.assets)if(a.box)m.push({t:a.t,box:a.box,v:-cv(a.cost,a.cur),txt:'شراء أصل: '+a.name});
 return m.sort((a,b)=>b.t-a.t)}
const boxBal=b=>roundM((S().open&&S().open[b]||0)+boxMoves().filter(x=>x.box===b).reduce((a,x)=>a+x.v,0));
const custDebts=()=>roundM(DB.customers.reduce((s,c)=>s+Math.max(0,balance(c.id)),0));
const supDebts=()=>roundM(DB.suppliers.reduce((a,s)=>a+Math.max(0,supBal(s.id)),0));
const stockVal=()=>roundM(DB.products.reduce((a,p)=>a+((p.track&&p.stock>0?p.stock:0)+Object.values(p.ws||{}).reduce((x,v)=>x+Math.max(0,v),0))*pCost(p),0));
/* الأصول: قسط اهتلاك ثابت */
function assetBook(a){const yrs=Math.max(0,(Date.now()-a.t)/(365.25*864e5)),c=cv(a.cost,a.cur),dep=a.life>0?Math.min(c,c/a.life*yrs):0;return {cost:roundM(c),dep:roundM(dep),book:roundM(c-dep)}}
/* الشركاء */
const pBal=pid=>roundM(DB.pledger.filter(l=>l.pid===pid).reduce((a,l)=>a+(l.kind==='wd'?-1:1)*cv(l.amt,l.cur),0));
const pCap=pid=>roundM(DB.pledger.filter(l=>l.pid===pid&&l.kind==='cap').reduce((a,l)=>a+cv(l.amt,l.cur),0));
function netProfit(k){const o=stats(k),[st,en]=prange(k),ex=expTotal(st,en);return roundM(S().costOn?o.profit-ex:o.rev-ex-purTotal(st,en))}
/* العروض على المنتجات */
function offerOf(p){if(!DB.offers||!DB.offers.length||!p)return null;const n=Date.now();return DB.offers.find(o=>o.pid===p.id&&(!o.from||o.from<=n)&&(!o.to||o.to>=n))||null}

/* ============ الشاشة الرئيسية للحسابات ============ */
const kpi=(t,v,bad)=>`<div class="card" style="margin:0;padding:12px"><small style="color:var(--mut)">${t}</small><div class="num" style="font-size:19px;font-weight:800;${bad?'color:var(--bad)':''}">${v}</div></div>`;
function vAcc(){accInit();
 const tiles=[['box','money','الصندوق والسندات'],['partners','users','الشركاء والأرباح'],['assets','tag','الأصول الثابتة'],['quotes','list','عروض الأسعار'],['offers','flash','العروض'],['pcount','box','جرد المخزن'],['stores','box','المستودعات'],['fin','chart','المركز المالي'],['hr','user','الموارد البشرية (الموظفين والرواتب)'],['sups','bag','الموردين والمشتريات'],['exps','calc','المصاريف'],['closes','lock','إغلاق الصندوق'],['tmpl','print','أنماط الفواتير']];
 return head('الحسابات',rateChip())+`<main class="main">${licBanner()}
 <div class="g2 accg">${kpi('الصندوق (كاش)',money(boxBal('cash')))}${kpi('شام كاش',money(boxBal('sham')))}${kpi('ديون الزبائن',money(custDebts()))}${kpi('ديون علينا للموردين',money(supDebts()),1)}</div>
 <div class="g2 mt accg">${tiles.map(([k,i,t])=>`<button class="big" style="background:var(--card);color:var(--txt);border:1px solid var(--line);align-items:center" data-a="accgo" data-v="${k}">${ic(i)}<b style="font-size:15px">${t}</b></button>`).join('')}</div><div style="height:80px"></div></main>`+navBar()}

/* ============ الصندوق والسندات ============ */
P.box=()=>{const f=ui.boxf||'all',l=boxMoves().filter(x=>f==='all'||x.box===f).slice(0,400);
 return head('الصندوق والسندات','',true)+`<main class="main"><div class="g2">${kpi('الصندوق (كاش)',money(boxBal('cash')))}${kpi('شام كاش',money(boxBal('sham')))}</div>
 <div class="g2 mt"><button class="btn pri" data-a="vnew" data-v="in">${ic('plus')} سند قبض</button><button class="btn ghost" data-a="vnew" data-v="out">${ic('minus')} سند دفع</button></div>
 <div class="mt">${seg('uset',f,[['all','الكل'],['cash','الصندوق'],['sham','شام كاش']],'boxf')}</div>
 ${l.length?l.map(x=>`<${x.vid?'button data-a="delv" data-id="'+x.vid+'"':'div'} class="li"><div class="gr"><b>${esc(x.txt)}</b><small>${dt(x.t)} · ${boxName(x.box)}</small></div><b class="num" style="color:${x.v<0?'var(--bad)':'var(--ok,#1a7f37)'}">${x.v<0?'−':'+'} ${money(roundM(Math.abs(x.v)))}</b></${x.vid?'button':'div'}>`).join(''):empty('money','لا توجد حركات')}
 <button class="btn ghost wide mt" data-a="opensheet" data-v="boxopen">${ic('edit')} رصيد أول المدة</button><div style="height:40px"></div></main>`};
SH.vform=()=>{const t=ui.vt||'in';return `<h3>${t==='in'?'سند قبض':'سند دفع'}</h3>
 ${opt('الصندوق','',seg('uset',ui.vbox||'cash',BOXES.map(([k,n])=>[k,n]),'vbox'))}
 <label class="f">المبلغ<input id="vamt" inputmode="decimal" data-focus></label>${opt('العملة','',seg('uset',ui.vcur||S().cur,[['SYP','ليرة'],['USD','دولار']],'vcur'))}
 <label class="f">${t==='in'?'من (اسم الشخص أو الجهة)':'إلى (اسم الشخص أو الجهة)'}<input id="vparty"></label><label class="f">البيان<input id="vnote"></label>
 <button class="btn pri wide" data-a="vsave">${ic('check')} حفظ السند</button>`};
SH.boxopen=()=>{const o=S().open||{};return `<h3>رصيد أول المدة</h3><p class="note">المبلغ اللي كان موجود بالصندوق قبل ما تبلش بالبرنامج، بالعملة الأساسية.</p>
 <label class="f">الصندوق (كاش)<input id="ocash" inputmode="decimal" value="${o.cash||''}"></label><label class="f">شام كاش<input id="osham" inputmode="decimal" value="${o.sham||''}"></label>
 <button class="btn pri wide" data-a="boxopensave">${ic('check')} حفظ</button>`};

/* ============ الشركاء وتوزيع الأرباح ============ */
P.partners=()=>{accInit();const tot=DB.partners.reduce((a,p)=>a+(+p.share||0),0),k=ui.pper||'mon',np=netProfit(k);
 return head('الشركاء والأرباح','',true)+`<main class="main">
 ${DB.partners.length?DB.partners.map(p=>`<button class="li" data-a="open" data-v="partner" data-id="${p.id}"><span class="av">${esc(p.name[0]||'?')}</span><div class="gr"><b>${esc(p.name)}</b><small>النسبة ${fmt(+p.share||0)}% · رأس المال ${money(pCap(p.id))}</small></div><span class="badge ${pBal(p.id)<0?'out':''}">الرصيد ${money(pBal(p.id))}</span></button>`).join(''):empty('users','لا يوجد شركاء','أضف الشركاء ونسبة كل واحد')}
 ${tot&&tot!==100?`<div class="note" style="color:var(--bad)">مجموع النسب ${fmt(tot)}% ولازم يكون 100%</div>`:''}
 <div class="card mt"><h3>توزيع الأرباح</h3>${seg('uset',k,[['mon','هالشهر'],['month','آخر 30 يوم'],['all','الكل']],'pper')}
 <div class="kv mt"><span>صافي الربح للفترة</span><b>${money(np)}</b></div>${DB.partners.map(p=>`<div class="kv"><span>${esc(p.name)} (${fmt(+p.share||0)}%)</span><b>${money(roundM(np*(+p.share||0)/100))}</b></div>`).join('')}
 <button class="btn pri wide mt" data-a="pdist">${ic('check')} اعتماد التوزيع وإضافته لأرصدة الشركاء</button></div>
 <div style="height:70px"></div></main><button class="fab" data-a="opensheet" data-v="pform">${ic('plus')} إضافة شريك</button>`};
P.partner=p=>{const x=DB.partners.find(y=>y.id===p.id);if(!x)return head('شريك','',true)+'<main class="main"></main>';const l=DB.pledger.filter(y=>y.pid===x.id).sort((a,b)=>b.t-a.t),K={cap:'رأس مال',wd:'مسحوبات',profit:'حصة أرباح'};
 return head(x.name,'',true)+`<main class="main"><div class="g2">${kpi('رأس المال',money(pCap(x.id)))}${kpi('الرصيد الحالي',money(pBal(x.id)))}</div>
 <div class="g2 mt"><button class="btn pri" data-a="pmove" data-v="cap" data-id="${x.id}">${ic('plus')} إيداع رأس مال</button><button class="btn ghost" data-a="pmove" data-v="wd" data-id="${x.id}">${ic('minus')} مسحوبات</button></div>
 ${l.map(y=>`<button class="li" data-a="delpl" data-id="${y.id}"><div class="gr"><b>${K[y.kind]}${y.note?' · '+esc(y.note):''}</b><small>${dt(y.t)}${y.box?' · '+boxName(y.box):''}</small></div><b class="num" style="color:${y.kind==='wd'?'var(--bad)':'inherit'}">${money(y.amt,y.cur)}</b></button>`).join('')||empty('money','لا توجد حركات')}
 <button class="btn ghost wide bad mt" data-a="delpartner" data-id="${x.id}">${ic('trash')} حذف الشريك</button></main>`};
SH.pform=()=>`<h3>إضافة شريك</h3><label class="f">الاسم<input id="pname" data-focus></label><label class="f">نسبة الأرباح %<input id="pshare" inputmode="decimal"></label><button class="btn pri wide" data-a="psave">${ic('check')} حفظ</button>`;
SH.pmove=p=>`<h3>${p.k==='cap'?'إيداع رأس مال':'مسحوبات شريك'}</h3>${opt('الصندوق','',seg('uset',ui.vbox||'cash',BOXES,'vbox'))}
 <label class="f">المبلغ<input id="pmamt" inputmode="decimal" data-focus></label>${opt('العملة','',seg('uset',ui.vcur||S().cur,[['SYP','ليرة'],['USD','دولار']],'vcur'))}<label class="f">ملاحظة<input id="pmnote"></label>
 <button class="btn pri wide" data-a="pmsave" data-id="${p.id}" data-v="${p.k}">${ic('check')} حفظ</button>`;

/* ============ الأصول الثابتة ============ */
P.assets=()=>{accInit();let c=0,b=0;const rows=DB.assets.map(a=>{const x=assetBook(a);c+=x.cost;b+=x.book;return `<button class="li" data-a="delasset" data-id="${a.id}"><div class="gr"><b>${esc(a.name)}</b><small>${dt(a.t)} · العمر ${fmt(a.life||0)} سنة · الاهتلاك ${money(x.dep)}</small></div><div class="lt"><b class="num">${money(x.book)}</b><small>من ${money(x.cost)}</small></div></button>`}).join('');
 return head('الأصول الثابتة','',true)+`<main class="main"><div class="g2">${kpi('الكلفة',money(roundM(c)))}${kpi('القيمة الحالية',money(roundM(b)))}</div><p class="note">متل: سيارة، برادات، مكيفات، معدات. البرنامج بيحسب الاهتلاك كل سنة لحالو.</p>
 ${rows||empty('tag','لا توجد أصول')}<div style="height:70px"></div></main><button class="fab" data-a="opensheet" data-v="aform">${ic('plus')} إضافة أصل</button>`};
SH.aform=()=>`<h3>إضافة أصل ثابت</h3><label class="f">الاسم<input id="aname" data-focus></label><label class="f">الكلفة<input id="acost" inputmode="decimal"></label>${opt('العملة','',seg('uset',ui.vcur||S().cur,[['SYP','ليرة'],['USD','دولار']],'vcur'))}
 <label class="f">العمر الإنتاجي (سنوات)<input id="alife" inputmode="decimal" value="5"></label><label class="f">تاريخ الشراء<input id="adate" type="date" value="${isoD(Date.now())}"></label>
 ${opt('مدفوع من','',seg('uset',ui.abox??'cash',[['cash','الصندوق'],['sham','شام كاش'],['','لا (مسجل سابقاً)']],'abox'))}<button class="btn pri wide" data-a="asave">${ic('check')} حفظ</button>`;

/* ============ عروض الأسعار ============ */
P.quotes=()=>{accInit();return head('عروض الأسعار','',true)+`<main class="main"><p class="note">جهّز الأصناف بالكاشير متل الفاتورة، وبعدين ارجع لهون واكبس "عرض سعر من السلة".</p>
 <button class="btn pri wide" data-a="qnew">${ic('plus')} عرض سعر من السلة (${carts.sale.length} صنف)</button>
 ${DB.quotes.map(q=>`<div class="card mt"><div class="kv" style="margin:0"><b>عرض رقم ${q.no}${q.cname?' · '+esc(q.cname):''}</b><b class="num">${money(q.total,q.cur)}</b></div><small style="color:var(--mut)">${dt(q.t)} · ${q.items.length} صنف</small>
  <div class="g3 mt" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px"><button class="btn ghost" data-a="qprint" data-id="${q.id}">${ic('print')} طباعة</button><button class="btn ghost" data-a="qload" data-id="${q.id}">${ic('cart')} تحويل لفاتورة</button><button class="btn ghost bad" data-a="qdel" data-id="${q.id}">${ic('trash')}</button></div></div>`).join('')||empty('list','لا توجد عروض أسعار')}</main>`};
SH.qform=()=>`<h3>عرض سعر جديد</h3><p class="note">${carts.sale.length} صنف · ${money(cartTotal(carts.sale))}</p><label class="f">اسم الزبون (اختياري)<input id="qcname" data-focus></label><button class="btn pri wide" data-a="qsave">${ic('check')} حفظ وطباعة</button>`;

/* ============ العروض (أسعار مخفضة لفترة) ============ */
P.offers=()=>{accInit();const n=Date.now();return head('العروض','',true)+`<main class="main"><p class="note">حط سعر عرض لمنتج لفترة محددة، والكاشير بيبيع بسعر العرض لحالو.</p>
 ${DB.offers.map(o=>{const p=DB.products.find(x=>x.id===o.pid),on=(!o.from||o.from<=n)&&(!o.to||o.to>=n);return `<button class="li" data-a="deloffer" data-id="${o.id}"><div class="gr"><b>${esc(p?p.name:'منتج محذوف')}</b><small>${o.to?'لغاية '+isoD(o.to):'بدون نهاية'}${p?' · السعر العادي '+money(pPrice(p)):''}</small></div><div class="lt"><b class="num">${money(o.price,o.cur)}</b><span class="badge ${on?'':'out'}">${on?'شغال':'منتهي'}</span></div></button>`}).join('')||empty('flash','لا توجد عروض')}
 <div style="height:70px"></div></main><button class="fab" data-a="opensheet" data-v="oform">${ic('plus')} عرض جديد</button>`};
SH.oform=()=>{const q=norm(ui.oq||''),l=DB.products.filter(p=>!q||norm(p.name).includes(q)).slice(0,30),sel=DB.products.find(p=>p.id===ui.opid);
 return `<h3>عرض جديد</h3>${sel?`<div class="kv"><b>${esc(sel.name)}</b><span>السعر العادي ${money(pPrice(sel))}</span></div><label class="f">سعر العرض (${S().cur==='USD'?'دولار':'ليرة'})<input id="oprice" inputmode="decimal" data-focus></label><label class="f">لغاية تاريخ<input id="oto" type="date"></label><button class="btn pri wide" data-a="osave">${ic('check')} حفظ العرض</button><button class="btn ghost wide mt" data-a="opick" data-id="">تغيير المنتج</button>`
 :`<div class="srch">${ic('search')}<input id="oq" value="${esc(ui.oq||'')}" placeholder="ابحث عن المنتج" data-focus></div><button class="btn ghost wide" data-a="osearch">${ic('search')} بحث</button>${l.map(p=>`<button class="li" data-a="opick" data-id="${p.id}"><div class="gr"><b>${esc(p.name)}</b></div><b class="num">${money(pPrice(p))}</b></button>`).join('')}`}`};

/* ============ جرد المخزن (المنتجات) ============ */
P.pcount=()=>{const l=DB.products.filter(p=>p.track);return head('جرد المخزن','',true)+`<main class="main"><p class="note">اكتب الكمية الموجودة فعلياً على الرف. اللي بتتركه فاضي ما بيتغير.</p>
 ${l.map(p=>`<div class="li"><div class="gr"><b>${esc(p.name)}</b><small>بالبرنامج: ${fmt(p.stock)}</small></div><input class="inp" style="width:90px;margin:0" inputmode="decimal" data-pc="${p.id}" placeholder="${fmt(p.stock)}"></div>`).join('')||empty('box','لا توجد منتجات بمخزون','فعّل تتبع المخزون للمنتجات أولاً')}
 ${l.length?`<button class="btn pri wide mt" data-a="pcsave">${ic('check')} اعتماد الجرد</button>`:''}
 ${(DB.pcounts||[]).slice(0,10).map(c=>`<div class="card mt"><div class="kv" style="margin:0"><b>جرد ${dt(c.t)}</b><b class="num" style="color:${c.diff<0?'var(--bad)':'inherit'}">${c.diff<0?'عجز':'زيادة'} ${money(Math.abs(c.diff))}</b></div><small style="color:var(--mut)">${c.n} صنف تغير</small></div>`).join('')}<div style="height:40px"></div></main>`};

/* ============ المركز المالي ============ */
P.fin=()=>{accInit();const cash=boxBal('cash'),sham=boxBal('sham'),cd=custDebts(),sv=stockVal(),fa=roundM(DB.assets.reduce((a,x)=>a+assetBook(x).book,0)),A1=roundM(cash+sham+cd+sv+fa),sd=supDebts(),cap=roundM(DB.partners.reduce((a,p)=>a+pBal(p.id),0)),eq=roundM(A1-sd);
 const r=(t,v,b)=>`<div class="kv"><span>${t}</span><b class="num"${b?' style="color:var(--bad)"':''}>${money(v)}</b></div>`;
 return head('المركز المالي','',true)+`<main class="main"><div class="card"><h3>الموجودات (شو عنا)</h3>${r('الصندوق (كاش)',cash)}${r('شام كاش',sham)}${r('ديون لنا على الزبائن',cd)}${r('قيمة البضاعة بالمخزن (بسعر الكلفة)',sv)}${r('الأصول الثابتة (بعد الاهتلاك)',fa)}<div class="tag lg mt" style="display:flex;justify-content:space-between;padding:12px"><span>المجموع</span><span>${money(A1)}</span></div></div>
 <div class="card"><h3>المطاليب (شو علينا)</h3>${r('ديون للموردين',sd,1)}</div>
 <div class="card"><h3>حقوق الملكية</h3>${r('صافي قيمة المحل (الموجودات − المطاليب)',eq)}${DB.partners.length?r('أرصدة الشركاء المسجلة',cap):''}
 <div class="kv"><span>صافي ربح هالشهر</span><b class="num">${money(netProfit('mon'))}</b></div></div>
 <button class="btn wa wide" data-a="finshare">${ic('wa')} إرسال المركز المالي</button><div style="height:40px"></div></main>`};

/* ============ الدفع بالطريقتين ============ */
IN.pmix=(v,el)=>{const t=payTotal();let s=num(val('psham')),c=num(val('pcash'));if(el&&el.id==='psham'){c=Math.max(0,roundM(t-s));const ce=$('#pcash');if(ce)ce.value=c}
 ui.pay.ps=s;ui.pay.paid=roundM(c+s);const h=$('#paid');if(h)h.value=ui.pay.paid;$('#rem').textContent=remText()};
/* ============ الربط بالنظام ============ */
Object.assign(A,{
 uset:(d,el)=>{ui[d.k]=d.v;if(el&&el.parentNode)el.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));if(!topE()||!topE().sheet||d.k==='epm')render()},
 accgo:d=>{const k=d.v;if(k==='hr'){ui.stab='work';tab='sales';render()}else if(k==='sups'){ui.stab='sup';tab='sales';render()}else if(k==='exps'){ui.stab='exp';tab='sales';render()}else if(k==='closes'){S().closeOn=true;save();ui.stab='close';tab='sales';render()}else if(k==='tmpl'){tab='set';render()}else open(k)},
 vnew:d=>{ui.vt=d.v;ui.vbox='cash';ui.vcur=S().cur;open('vform',{},true)},
 vsave:()=>{const a=num(val('vamt'));if(!(a>0))return toast('اكتب المبلغ');accInit();DB.vouchers.push({id:uid(),type:ui.vt||'in',box:ui.vbox||'cash',amt:a,cur:ui.vcur||S().cur,party:val('vparty'),note:val('vnote'),t:Date.now(),by:curUserName()});logA((ui.vt==='out'?'سند دفع ':'سند قبض ')+money(a,ui.vcur));flush();toast('تم حفظ السند');back()},
 delv:d=>ask('حذف هالسند؟','حذف',()=>{DB.vouchers=DB.vouchers.filter(v=>v.id!==d.id);flush();render()},true),
 boxopensave:()=>{S().open={cash:num(val('ocash')),sham:num(val('osham'))};save();toast('تم الحفظ');back()},
 psave:()=>{const n=val('pname');if(!n)return toast('اكتب الاسم');accInit();DB.partners.push({id:uid(),name:n,share:num(val('pshare'))});flush();back()},
 pmove:d=>{ui.vbox='cash';ui.vcur=S().cur;open('pmove',{id:d.id,k:d.v},true)},
 pmsave:d=>{const a=num(val('pmamt'));if(!(a>0))return toast('اكتب المبلغ');DB.pledger.push({id:uid(),pid:d.id,kind:d.v,amt:a,cur:ui.vcur||S().cur,box:ui.vbox||'cash',note:val('pmnote'),t:Date.now()});flush();toast('تم الحفظ');back()},
 delpl:d=>ask('حذف هالحركة؟','حذف',()=>{DB.pledger=DB.pledger.filter(v=>v.id!==d.id);flush();render()},true),
 delpartner:d=>guardPin(()=>ask('حذف الشريك وكل حركاته؟','حذف',()=>{DB.partners=DB.partners.filter(p=>p.id!==d.id);DB.pledger=DB.pledger.filter(l=>l.pid!==d.id);flush();back()},true)),
 pdist:()=>{const k=ui.pper||'mon',np=netProfit(k);if(!DB.partners.length)return toast('أضف الشركاء أولاً');if(np<=0)return toast('ما في ربح بهالفترة');
  ask(`توزيع ${money(np)} على الشركاء؟`,'توزيع',()=>{const t=Date.now();for(const p of DB.partners){const v=roundM(np*(+p.share||0)/100);if(v)DB.pledger.push({id:uid(),pid:p.id,kind:'profit',amt:v,cur:S().cur,note:'أرباح '+({mon:'هالشهر',month:'آخر 30 يوم',all:'الكل'})[k],t})}flush();toast('تم التوزيع');render()})},
 asave:()=>{const n=val('aname'),c=num(val('acost'));if(!n||!(c>0))return toast('اكتب الاسم والكلفة');const t=new Date((val('adate')||isoD(Date.now()))+'T12:00:00').getTime();
  DB.assets.push({id:uid(),name:n,cost:c,cur:ui.vcur||S().cur,life:num(val('alife')),t,box:ui.abox??'cash'});flush();back()},
 delasset:d=>guardPin(()=>ask('حذف هالأصل؟','حذف',()=>{DB.assets=DB.assets.filter(a=>a.id!==d.id);flush();render()},true)),
 qnew:()=>{if(!carts.sale.length)return toast('السلة فاضية، ضيف الأصناف من الكاشير أولاً');open('qform',{},true)},
 qsave:()=>{accInit();const c=carts.sale,q={id:uid(),no:(DB.quotes[0]?DB.quotes[0].no:0)+1,t:Date.now(),cur:S().cur,rate:S().rate,cname:val('qcname'),items:c.map(i=>({pid:i.pid||'',name:i.name,price:i.price,qty:i.qty,note:i.note||''})),total:roundM(cartTotal(c))};
  DB.quotes.unshift(q);carts.sale=[];flush();back();toast('تم حفظ عرض السعر');A.qprint({id:q.id})},
 qprint:d=>{const q=DB.quotes.find(x=>x.id===d.id);if(!q)return;const s=Object.assign({},q,{quote:true,paid:q.total,remaining:0,sub:q.total,disc:0,by:q.cname?'':curUserName()});
  if(DESK()||ble.c.ch)printSale(s,true);else{ui.qpv=s;toast('الطابعة غير متصلة')}},
 qload:d=>{const q=DB.quotes.find(x=>x.id===d.id);if(!q)return;carts.sale.splice(0,carts.sale.length,...q.items.map(i=>Object.assign({cost:0},i)));home('pos');toast('انضاف العرض للسلة')},
 qdel:d=>ask('حذف عرض السعر؟','حذف',()=>{DB.quotes=DB.quotes.filter(x=>x.id!==d.id);flush();render()},true),
 osearch:()=>{ui.oq=val('oq');render()},
 opick:d=>{ui.opid=d.id;render()},
 osave:()=>{const p=num(val('oprice'));if(!ui.opid||!(p>0))return toast('اكتب سعر العرض');const to=val('oto');accInit();DB.offers=DB.offers.filter(o=>o.pid!==ui.opid);
  DB.offers.push({id:uid(),pid:ui.opid,price:p,cur:S().cur,from:Date.now(),to:to?new Date(to+'T23:59:59').getTime():0});ui.opid='';ui.oq='';flush();toast('تم حفظ العرض');back()},
 deloffer:d=>ask('حذف العرض؟','حذف',()=>{DB.offers=DB.offers.filter(o=>o.id!==d.id);flush();render()},true),
 pcsave:()=>{let diff=0,n=0;document.querySelectorAll('[data-pc]').forEach(e=>{const v=e.value.trim();if(v==='')return;const p=DB.products.find(x=>x.id===e.dataset.pc);if(!p)return;const q=num(v);if(q===p.stock)return;diff+=(q-p.stock)*pCost(p);p.stock=q;n++});
  if(!n)return toast('ما تغير شي');if(!DB.pcounts)DB.pcounts=[];DB.pcounts.unshift({t:Date.now(),n,diff:roundM(diff)});flush();toast('تم اعتماد الجرد');render()},
 finshare:()=>{const t=`*المركز المالي - ${S().store||APPNAME}*\n${dt(Date.now())}\nالصندوق: ${money(boxBal('cash'))}\nشام كاش: ${money(boxBal('sham'))}\nديون الزبائن: ${money(custDebts())}\nالبضاعة: ${money(stockVal())}\nديون الموردين: ${money(supDebts())}\nصافي ربح الشهر: ${money(netProfit('mon'))}`;shareText(t)}
});

/* ============ واجهة الكمبيوتر ============ */
const DT=()=>DESK()||!!S().deskUI;
document.head.insertAdjacentHTML('beforeend',`<style>
html.desk #app{max-width:none;display:grid;grid-template-columns:210px minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto}
html.desk #app:not(:has(>.nav)){grid-template-columns:minmax(0,1fr)}
html.desk #app>.hd,html.desk #app>.main,html.desk #app>.pay{grid-column:-2/-1}
html.desk #app>.hd{grid-row:1}html.desk #app>.main{grid-row:2}html.desk #app>.pay{grid-row:3}
html.desk #app>.nav{grid-column:1;grid-row:1/4;flex-direction:column;border-top:0;border-inline-end:1px solid var(--line);padding:16px 10px;gap:4px}
html.desk .nav button{flex:none;flex-direction:row;gap:12px;padding:13px 16px;font-size:15px;justify-content:flex-start}
html.desk .shade{align-items:center;justify-content:center}html.desk .sheet{max-width:560px;border-radius:22px}
html.desk .fab{bottom:24px}
html.desk .accg{grid-template-columns:repeat(4,minmax(0,1fr))}
.dpos{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px}
.dq{width:100%;font-size:20px;padding:14px 16px;border:2px solid var(--pri);border-radius:14px;background:var(--card);color:var(--txt)}
.dres{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-top:10px}
.dres button{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px;text-align:start;display:flex;flex-direction:column;gap:4px}
.dres button:first-child{border-color:var(--pri)}.dres small{color:var(--mut)}
.kbd{font-size:11px;border:1px solid var(--line);border-radius:5px;padding:0 5px;margin-inline-start:6px;color:var(--mut)}
</style>`);
{const _at=applyTheme;applyTheme=function(){_at();document.documentElement.classList.toggle('desk',DT())}}
const dCats=()=>DB.cats.slice(0,9);
function dList(){const q=norm(ui.dq||''),cat=ui.dcat||'';return DB.products.filter(p=>(!cat||p.cat===cat)&&(!q||norm(p.name).includes(q)||(p.barcode||'').startsWith(q))).slice(0,40)}
const dRes=()=>{const l=dList();return l.length?l.map(p=>`<button data-a="dadd" data-id="${p.id}"><b>${esc(p.name)}</b><span class="num">${money(curPrice(p))}</span>${p.track?`<small>المتوفر ${fmt(p.stock)}</small>`:''}</button>`).join(''):`<div class="note">${DB.products.length?'ما في مادة بهالاسم':'ما في مواد، ضيفها من المخزون'}</div>`};
function vPosD(){const cart=carts.sale,c=cart.length,cu=ui.saleCust&&custById(ui.saleCust),sh=topE()&&topE().sheet;
 let h=head(APPNAME,rateChip())+`<main class="main">${licBanner()}<div class="dpos"><div>
 <input id="dq" class="dq" data-i="dq" value="${esc(ui.dq||'')}" placeholder="اكتب اسم المادة أو امسح الباركود… (F2)" autocomplete="off"${sh?'':' data-focus'}>
 <div class="chips mt"><button class="chip ${!ui.dcat?'on':''}" data-a="dcat" data-v="">الكل<span class="kbd">Alt+0</span></button>${dCats().map((k,i)=>`<button class="chip ${ui.dcat===k?'on':''}" data-a="dcat" data-v="${esc(k)}">${esc(k)}<span class="kbd">Alt+${i+1}</span></button>`).join('')}</div>
 <div id="dres" class="dres">${dRes()}</div>
 <div class="g2 mt"><button class="btn ghost" data-a="manual" data-v="sale">${ic('plus')} منتج يدوي</button><button class="btn ghost" data-a="open" data-v="quick">${ic('calc')} الحساب السريع</button></div></div>
 <div>${S().whole?opt('نوع البيع',ui.whole?'بأسعار الجملة':'بأسعار المفرق',seg('wmode',ui.whole?1:0,[[0,'مفرق'],[1,'جملة']])):''}
 <h2 class="sec">الفاتورة <span class="cnt">${c}</span></h2>${c?cart.map((it,i)=>cartLine(it,i,'sale')).join(''):empty('cart','الفاتورة فاضية','اكتب اسم المادة واكبس Enter')}</div></div></main>`;
 if(c)h+=`<div class="pay"><div class="payrow"><button class="btn ghost sm" data-a="choosecust">${ic('user')} ${cu?esc(cu.name):'اختيار زبون'}</button><button class="btn ghost sm bad" data-a="cancelsale">${ic('x')} إلغاء البيع</button></div>
 <div class="payrow"><div class="tag lg"><small>الإجمالي</small><span>${money(cartTotal(cart))}${dualSmall(cartTotal(cart))}</span></div><button class="btn pri" data-a="checkout">${ic('check')} إنهاء البيع <span class="kbd" style="color:inherit">F9</span></button></div></div>`;
 return h+navBar()}
{const _vp=vPos;vPos=function(){return DT()&&S().kind!=='rest'?vPosD():_vp()}}
IN.dq=v=>{ui.dq=v;const r=$('#dres');if(r)r.innerHTML=dRes()};
function dAdd(p){if(!p)return;addCart('sale',p,1);ui.dq='';beep();render()}
document.addEventListener('keydown',e=>{if(!DT()||!DB.ready)return;const t=topE(),free=!t||!t.sheet;
 if(e.target&&e.target.id==='dq'&&e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();const v=toLatin(e.target.value).trim();if(!v)return;
  const p=prodByCode(v)||dList()[0];if(p)dAdd(p);else toast('ما في مادة: '+v);return}
 if(!free||tab!=='pos'||stack.length)return;
 if(e.key==='F2'){e.preventDefault();const q=$('#dq');if(q){q.focus();q.select()}}
 else if(e.key==='F9'){e.preventDefault();A.checkout()}
 else if(e.altKey&&/^Digit\d$/.test(e.code)){e.preventDefault();const i=+e.code.slice(5);ui.dcat=i?dCats()[i-1]||'':'';render()}},true);
Object.assign(A,{dadd:d=>dAdd(DB.products.find(p=>p.id===d.id)),dcat:d=>{ui.dcat=d.v;render()}});
/* الطباعة: لا تطبع على PDF إذا ما في طابعة مختارة */
{const _dp=deskPrint;deskPrint=async function(cv,printer,quiet){try{if(!printer){const l=await window.khDesktop.printers(),d=(l||[]).find(x=>x.isDefault);
  if(!d||/pdf|xps|onenote|fax/i.test(d.name)){toast('اختار الطابعة أولاً من الإعدادات ← الطابعة',6000);return}}}catch(e){}return _dp(cv,printer,quiet)}}

/* ============ سجل الإلغاءات (المطاعم) ============ */
function voidCheck(all){if(KIND!=='rest')return;const o=ui.ord&&ui.ord.id&&DB.orders.find(x=>x.id===ui.ord.id);if(!o)return;if(!DB.voids)DB.voids=[];
 const key=i=>i.pid||i.name,was={},nm={},cur={};for(const i of o.items||[]){if(!i.sent)continue;was[key(i)]=(was[key(i)]||0)+i.sent;nm[key(i)]=i.name}
 if(!all)for(const i of carts.sale)cur[key(i)]=(cur[key(i)]||0)+i.qty;
 for(const [k,q] of Object.entries(was)){const d=r3(q-(cur[k]||0));if(d>0)DB.voids.unshift({id:uid(),t:Date.now(),no:o.no,ord:ordLabel(Object.assign({},o,{no:0})),name:nm[k],qty:d,by:curUserName(),all:!!all})}
 if(DB.voids.length>3000)DB.voids.length=3000}
{const _sk=A.sendk;A.sendk=()=>{voidCheck();return _sk()}}
{const _ds=A.dosale;A.dosale=()=>{voidCheck();return _ds()}}
A.cancelord=()=>{const o=ui.ord,clr=()=>{carts.sale=[];ui.ord=null};
 if(o&&o.id)ask(`إلغاء الطلب رقم ${o.no} نهائياً؟`,'إلغاء الطلب',()=>{voidCheck(true);DB.orders=DB.orders.filter(x=>x.id!==o.id);logA(`إلغاء طلب رقم ${o.no}`);clr();flush()},true);
 else if(carts.sale.length)ask('إلغاء هذا الطلب؟','إلغاء الطلب',clr,true);else{clr();render()}};
function tabVoids(){const [st,en]=prange(ui.period),l=(DB.voids||[]).filter(v=>inR(v.t,st,en));
 return `<div class="card"><div class="opt" style="padding-top:0"><div class="gr"><b>الإلغاءات بعد الطباعة للمطبخ</b><small>أي صنف انبعت للمطبخ وبعدين انشال أو نقصت كميتو</small></div>${perSel()}</div>${custRange()}<div class="kv mt"><span>عدد الإلغاءات</span><b>${l.length}</b></div></div>
 ${l.map(v=>`<div class="li"><div class="gr"><b>${esc(v.name)} × ${fmt(v.qty)}${v.all?' (إلغاء الطلب كامل)':''}</b><small>${dt(v.t)} · طلب ${v.no} · ${esc(v.ord||'')}${v.by?' · '+esc(v.by):''}</small></div></div>`).join('')||empty('check','ما في إلغاءات بهالفترة')}`}

/* ============ الضيافة ووجبات العمال ============ */
const MK={hosp:'ضيافة',staff:'وجبة عمال'};
{const _sp=SH.pay;SH.pay=()=>_sp()+(LITE?'':`<button class="btn ghost wide mt" data-a="mealopen">${ic('user')} ضيافة / وجبة عمال (بدون دفع)</button>`)}
SH.mealform=()=>`<h3>ضيافة أو وجبة عمال</h3><p class="note">ما بتنحسب مبيعات، بس بتنسجّل لحال لتعرف قديش عم يطلع ضيافة ووجبات.</p>
 ${opt('النوع','',seg('uset',ui.mk||'hosp',[['hosp','ضيافة'],['staff','وجبة عمال']],'mk'))}<label class="f">لمين؟ (اسم الضيف أو العامل)<input id="mnote" data-focus></label>
 <div class="kv"><span>القيمة بسعر المنيو</span><b>${money(cartTotal(carts.sale))}</b></div><button class="btn pri wide" data-a="mealsave">${ic('check')} تسجيل</button>`;
function tabMeals(){const [st,en]=prange(ui.period),l=(DB.meals||[]).filter(v=>inR(v.t,st,en)),by={hosp:0,staff:0},co={hosp:0,staff:0};
 for(const m of l){by[m.kind]+=cv(m.val,m.cur);co[m.kind]+=cv(m.cost||0,m.cur)}
 return `<div class="card"><div class="opt" style="padding-top:0"><div class="gr"><b>الضيافة ووجبات العمال</b></div>${perSel()}</div>${custRange()}
 <div class="kv mt"><span>ضيافة (بسعر المنيو)</span><b>${money(roundM(by.hosp))}</b></div><div class="kv"><span>وجبات عمال (بسعر المنيو)</span><b>${money(roundM(by.staff))}</b></div>${S().costOn?`<div class="kv"><span>كلفتها الفعلية</span><b>${money(roundM(co.hosp+co.staff))}</b></div>`:''}</div>
 ${l.map(m=>`<button class="li" data-a="delmeal" data-id="${m.id}"><div class="gr"><b>${MK[m.kind]}${m.note?' · '+esc(m.note):''}</b><small>${dt(m.t)} · ${m.items.map(i=>esc(i.name)+(i.qty!==1?' ×'+fmt(i.qty):'')).join('، ')}${m.by?' · '+esc(m.by):''}</small></div><b class="num">${money(m.val,m.cur)}</b></button>`).join('')||empty('user','ما في ضيافة بهالفترة')}`}
Object.assign(A,{
 mealopen:()=>{if(!carts.sale.length)return;ui.mk=ui.mk||'hosp';swap('mealform',{},true)},
 mealsave:()=>{const c=carts.sale;if(!c.length)return back();if(!DB.meals)DB.meals=[];
  const unsent=[];for(const it of c){const q=r3(it.qty-(it.sent||0));if(q>0)unsent.push({name:it.name,qty:q,note:it.note||'',pid:it.pid||''})}
  const m={id:uid(),t:Date.now(),kind:ui.mk||'hosp',note:val('mnote'),cur:S().cur,items:c.map(i=>({name:i.name,qty:i.qty,price:i.price})),val:roundM(cartTotal(c)),cost:roundM(c.reduce((a,i)=>a+(i.cost||0)*i.qty,0)),by:curUserName()};
  DB.meals.unshift(m);for(const it of c){const p=it.pid&&DB.products.find(x=>x.id===it.pid);if(p&&p.track)p.stock=r3(p.stock-it.qty)}
  const o=ui.ord;if(o&&o.id)DB.orders=DB.orders.filter(x=>x.id!==o.id);
  if(KIND==='rest'&&unsent.length&&(S().onePr||(S().kst||[]).length||(S().autoK&&(ble.k.ch||ble.c.ch))||DESK())){const ko=Object.assign({type:'take'},o||{},{no:(o&&o.no)||nextOrderNo(),t:Date.now()});try{kSend(ko,unsent,false)}catch(e){}}
  carts.sale=[];ui.ord=null;logA(`${MK[m.kind]}: ${money(m.val)}`);flush();back();toast('تم تسجيل '+MK[m.kind])},
 delmeal:d=>guardPin(()=>ask('حذف هالتسجيل؟','حذف',()=>{DB.meals=DB.meals.filter(x=>x.id!==d.id);flush();render()},true))
});

/* ============ المستودعات (المحاسب) ============ */
const stQ=(p,sid)=>sid?((p.ws||{})[sid]||0):(p.stock||0);
const stName=sid=>sid?((DB.stores||[]).find(x=>x.id===sid)||{}).name||'مستودع':'المحل';
P.stores=()=>{if(!DB.stores)DB.stores=[];const val=sid=>roundM(DB.products.reduce((a,p)=>a+Math.max(0,stQ(p,sid))*pCost(p),0));
 return head('المستودعات','',true)+`<main class="main"><p class="note">المحل هو المستودع الأساسي اللي بينباع منو. ضيف مستودعات تانية وانقل البضاعة بيناتها.</p>
 ${[''].concat(DB.stores.map(x=>x.id)).map(sid=>`<button class="li" data-a="open" data-v="store" data-id="${sid||'main'}"><span class="av">${ic('box')}</span><div class="gr"><b>${esc(stName(sid))}</b><small>${DB.products.filter(p=>stQ(p,sid)>0).length} مادة · القيمة ${money(val(sid))}</small></div></button>`).join('')}
 <div class="g2 mt"><button class="btn pri" data-a="trnew">${ic('undo')} مناقلة بضاعة</button><button class="btn ghost" data-a="opensheet" data-v="storeform">${ic('plus')} مستودع جديد</button></div>
 <h2 class="sec">آخر المناقلات</h2>${(DB.transfers||[]).slice(0,50).map(t=>`<div class="li"><div class="gr"><b>${esc(t.name)} × ${fmt(t.qty)}</b><small>${dt(t.t)} · من ${esc(t.from==='new'?'توريد جديد':stName(t.from))} إلى ${esc(stName(t.to))}</small></div></div>`).join('')||empty('box','ما في مناقلات')}</main>`};
P.store=p=>{const sid=p.id==='main'?'':p.id,l=DB.products.filter(x=>stQ(x,sid)!==0);
 return head(stName(sid),'',true)+`<main class="main">${l.map(x=>`<div class="li"><div class="gr"><b>${esc(x.name)}</b><small>${money(pCost(x))} كلفة</small></div><b class="num">${fmt(stQ(x,sid))}</b></div>`).join('')||empty('box','المستودع فاضي')}</main>`};
SH.storeform=()=>`<h3>مستودع جديد</h3><label class="f">اسم المستودع<input id="stname" data-focus placeholder="مستودع الزيوت"></label><button class="btn pri wide" data-a="storesave">${ic('check')} حفظ</button>`;
SH.transfer=()=>{const t=ui.tr||{},q=norm(t.q||''),sel=DB.products.find(p=>p.id===t.pid),opts=[['','المحل']].concat((DB.stores||[]).map(x=>[x.id,x.name]));
 return `<h3>مناقلة بضاعة</h3>${sel?`<div class="kv"><b>${esc(sel.name)}</b><button class="lk" data-a="trpick" data-id="">تغيير</button></div>
 <label class="f">من<select id="trfrom" class="inp"><option value="new">توريد جديد (بضاعة واصلة)</option>${opts.map(([v,n])=>`<option value="${v}" ${v===(t.from??'')?'selected':''}>${esc(n)} (فيه ${fmt(stQ(sel,v))})</option>`).join('')}</select></label>
 <label class="f">إلى<select id="trto" class="inp">${opts.map(([v,n])=>`<option value="${v}">${esc(n)}</option>`).join('')}</select></label><label class="f">الكمية<input id="trqty" inputmode="decimal" data-focus></label><button class="btn pri wide" data-a="trsave">${ic('check')} نقل</button>`
 :`<div class="srch">${ic('search')}<input id="trq" value="${esc(t.q||'')}" placeholder="ابحث عن المادة" data-focus></div><button class="btn ghost wide" data-a="trsearch">${ic('search')} بحث</button>${DB.products.filter(p=>!q||norm(p.name).includes(q)).slice(0,30).map(p=>`<button class="li" data-a="trpick" data-id="${p.id}"><div class="gr"><b>${esc(p.name)}</b></div></button>`).join('')}`}`};
Object.assign(A,{
 storesave:()=>{const n=val('stname');if(!n)return toast('اكتب الاسم');if(!DB.stores)DB.stores=[];DB.stores.push({id:uid(),name:n});flush();back()},
 trnew:()=>{ui.tr={};open('transfer',{},true)},trsearch:()=>{ui.tr.q=val('trq');render()},trpick:d=>{ui.tr.pid=d.id;render()},
 trsave:()=>{const p=DB.products.find(x=>x.id===ui.tr.pid),from=val('trfrom'),to=$('#trto').value,q=num(val('trqty'));if(!p||!(q>0))return toast('اكتب الكمية');if(from===to)return toast('اختار مستودعين مختلفين');
  if(from!=='new'&&stQ(p,from)<q)return toast('الكمية بـ '+stName(from)+' ما بتكفي');const adj=(sid,v)=>{if(sid){p.ws=p.ws||{};p.ws[sid]=r3((p.ws[sid]||0)+v)}else{p.stock=r3((p.stock||0)+v);p.track=true}};
  if(from!=='new')adj(from,-q);adj(to,q);if(!DB.transfers)DB.transfers=[];DB.transfers.unshift({t:Date.now(),pid:p.id,name:p.name,qty:q,from,to,by:curUserName()});flush();back();toast('تمت المناقلة')}
});

/* ============ تعديل طريقة الدفع بعد البيع ============ */
{const _ps=P.sale;P.sale=p=>{const h=_ps(p),s=DB.sales.find(x=>x.id===p.id);if(!s||s.refunded||!(s.paid>0))return h;
 return h.replace('<div class="acts">',`<div class="acts"><button class="btn ghost" data-a="editpay" data-id="${s.id}">${ic('edit')}تعديل طريقة الدفع</button>`)}}
SH.editpay=p=>{const s=DB.sales.find(x=>x.id===p.id);if(!s)return '';const m=ui.epm||s.method||'cash';
 return `<h3>تعديل طريقة الدفع، فاتورة ${s.no}</h3><p class="note">المدفوع: ${money(s.paid,s.cur)}</p>${opt('طريقة الدفع','',seg('uset',m,[['cash','كاش'],['sham','شام كاش'],['mix','الطريقتين']],'epm'))}
 <label class="f">${m==='mix'?'قديش اندفع شام كاش؟ (والباقي كاش)':'—'}<input id="eps" inputmode="decimal" value="${m==='mix'?(s.method==='mix'?s.ps:''):''}" ${m==='mix'?'data-focus':'disabled'}></label>
 <button class="btn pri wide" data-a="editpaysave" data-id="${s.id}">${ic('check')} حفظ</button>`};
Object.assign(A,{
 editpay:d=>{const s=DB.sales.find(x=>x.id===d.id);ui.epm=s?s.method||'cash':'cash';open('editpay',{id:d.id},true)},
 editpaysave:d=>{const s=DB.sales.find(x=>x.id===d.id);if(!s)return back();const m=ui.epm||'cash',old=s.method==='mix'?`كاش ${money(cashPart(s),s.cur)} + شام ${money(shamPart(s),s.cur)}`:(s.method==='sham'?'شام كاش':'كاش');
  let ps=0;if(m==='mix'){ps=num(val('eps'));if(!(ps>0)||ps>=s.paid)return toast('اكتب مبلغ الشام كاش (أقل من المدفوع)')}
  s.method=m;s.ps=m==='mix'?roundM(ps):0;s.payEdit={t:Date.now(),by:curUserName(),old};
  const nw=m==='mix'?`كاش ${money(cashPart(s),s.cur)} + شام ${money(shamPart(s),s.cur)}`:(m==='sham'?'شام كاش':'كاش');
  if(!DB.log)DB.log=[];DB.log.unshift({t:Date.now(),x:`تعديل دفع فاتورة ${s.no}: من ${old} إلى ${nw}${curUserName()?' ('+curUserName()+')':''}`});flush();back();toast('تم تعديل طريقة الدفع')}
});

/* ============ بخشيش العمال ============ */
const tipDiff=()=>roundM(Math.max(0,(ui.pay.paid||0)-payTotal()));
const tipBoxHTML=()=>{const d=tipDiff();if(!d||LITE)return '';const on=!!ui.pay.tip,b=ui.pay.tbox||(ui.pay.method==='cash'?'cash':'sham');
 return `<div class="card" style="margin:8px 0;padding:10px">${opt('الزيادة بخشيش للعمال',money(d),`<button class="btn sm ${on?'pri':''}" data-a="tiptg">${on?'✓ بخشيش':'لا، باقي للزبون'}</button>`)}${on?opt('البخشيش انحط','',seg('tipbx',b,[['cash','كاش'],['sham','شام كاش']])):''}</div>`};
{const _sp=SH.pay;SH.pay=()=>_sp().replace('<button class="btn pri wide mt" data-a="dosale">','<div id="tipbox">'+tipBoxHTML()+'</div><button class="btn pri wide mt" data-a="dosale">')}
const tipRef=()=>{const e=$('#tipbox');if(e)e.innerHTML=tipBoxHTML()};
{const _p=IN.paid;IN.paid=(v,el)=>{_p(v,el);tipRef()}}{const _m=IN.pmix;IN.pmix=(v,el)=>{_m(v,el);tipRef()}}
{const _ck=A.checkout;A.checkout=(...a)=>{const r=_ck(...a);if(ui.pay){ui.pay.tip=false;ui.pay.tbox=''}return r}}
{const _ds=A.dosale;A.dosale=()=>{const t=payTotal(),pe=$('#paid'),paid=pe?num(pe.value):0,tip=ui.pay.tip&&paid>t?roundM(paid-t):0,box=ui.pay.tbox||(ui.pay.method==='cash'?'cash':'sham'),seq=DB.seq;
 const r=_ds();if(tip&&DB.seq>seq){const s=DB.sales.find(x=>x.no===DB.seq);if(!DB.tips)DB.tips=[];DB.tips.unshift({id:uid(),t:Date.now(),kind:'in',amt:tip,cur:S().cur,box,no:s?s.no:'',by:curUserName()});if(s)s.tip=tip;flush()}return r}}
function tabTips(){const [st,en]=prange(ui.period),l=(DB.tips||[]).filter(x=>inR(x.t,st,en)),o={cash:0,sham:0,out:0};let all=0;
 for(const x of l){const v=cv(x.amt,x.cur);if(x.kind==='out')o.out+=v;else o[x.box]+=v}
 for(const x of DB.tips||[])all+=(x.kind==='out'?-1:1)*cv(x.amt,x.cur);
 return `<div class="card"><div class="opt" style="padding-top:0"><div class="gr"><b>بخشيش العمال</b><small>مو من مبيعات المحل، هو حق العمال</small></div>${perSel()}</div>${custRange()}
 <div class="kv mt"><span>بخشيش كاش</span><b>${money(roundM(o.cash))}</b></div><div class="kv"><span>بخشيش شام كاش</span><b>${money(roundM(o.sham))}</b></div><div class="kv"><span>انوزع على العمال</span><b style="color:var(--bad)">− ${money(roundM(o.out))}</b></div>
 <div class="tag lg mt" style="display:flex;justify-content:space-between;padding:12px"><span>باقي ما توزع (كل الفترات)</span><span>${money(roundM(all))}</span></div>
 <button class="btn pri wide mt" data-a="opensheet" data-v="tipout">${ic('users')} توزيع البخشيش على العمال</button></div>
 ${l.map(x=>`<button class="li" data-a="deltip" data-id="${x.id}"><div class="gr"><b>${x.kind==='out'?'توزيع على العمال'+(x.note?' · '+esc(x.note):''):'بخشيش فاتورة '+x.no}</b><small>${dt(x.t)} · ${x.box==='sham'?'شام كاش':'كاش'}${x.by?' · '+esc(x.by):''}</small></div><b class="num" style="color:${x.kind==='out'?'var(--bad)':'inherit'}">${x.kind==='out'?'− ':''}${money(x.amt,x.cur)}</b></button>`).join('')||empty('money','ما في بخشيش بهالفترة')}`}
SH.tipout=()=>`<h3>توزيع البخشيش</h3>${opt('من','',seg('uset',ui.vbox||'cash',BOXES,'vbox'))}<label class="f">المبلغ<input id="toamt" inputmode="decimal" data-focus></label><label class="f">ملاحظة (مثلاً: للمطبخ والصالة)<input id="tonote"></label><button class="btn pri wide" data-a="tipoutsave">${ic('check')} تسجيل</button>`;
Object.assign(A,{
 tiptg:()=>{ui.pay.tip=!ui.pay.tip;tipRef()},
 tipbx:d=>{ui.pay.tbox=d.v;tipRef()},
 tipoutsave:()=>{const a=num(val('toamt'));if(!(a>0))return toast('اكتب المبلغ');if(!DB.tips)DB.tips=[];DB.tips.unshift({id:uid(),t:Date.now(),kind:'out',amt:a,cur:S().cur,box:ui.vbox||'cash',note:val('tonote'),by:curUserName()});flush();back();toast('تم التسجيل')},
 deltip:d=>guardPin(()=>ask('حذف هالتسجيل؟','حذف',()=>{DB.tips=DB.tips.filter(x=>x.id!==d.id);flush();render()},true))
});

/* ============ قسم المراقبة بإغلاق الصندوق ============ */
function monCalc(since){const C=S().cur,o={ref:[0,0],meal:[0,0],disc:[0,0],man:[0,0],void:[0,0],pe:0,exp:[0,0],tip:[0,0]};
 for(const s of DB.sales){if(s.refunded&&s.refunded>since){o.ref[0]++;o.ref[1]+=conv(s.total,s.cur,C,s.rate)}
  if(s.t>since&&!s.refunded){if(s.disc>0){o.disc[0]++;o.disc[1]+=conv(s.disc,s.cur,C,s.rate)}for(const i of s.items)if(!i.pid){o.man[0]++;o.man[1]+=conv(i.price*i.qty,s.cur,C,s.rate)}}
  if(s.payEdit&&s.payEdit.t>since)o.pe++}
 for(const m of DB.meals||[])if(m.t>since){o.meal[0]++;o.meal[1]+=conv(m.val,m.cur,C)}
 for(const v of DB.voids||[])if(v.t>since){o.void[0]++;o.void[1]+=v.qty}
 for(const e of DB.expenses)if(e.t>since){o.exp[0]++;o.exp[1]+=conv(e.amt,e.cur,C)}
 for(const x of DB.tips||[])if(x.t>since&&x.kind==='out'){o.tip[0]++;o.tip[1]+=conv(x.amt,x.cur,C)}
 return o}
const monRows=since=>{const o=monCalc(since),m=v=>money(roundM(v));return [
 ['إرجاع فواتير',o.ref[0],o.ref[0]?m(o.ref[1]):''],['ضيافة ووجبات عمال',o.meal[0],o.meal[0]?m(o.meal[1]):''],['فواتير فيها خصم',o.disc[0],o.disc[0]?m(o.disc[1]):''],
 ['أصناف يدوية (سعر مكتوب باليد)',o.man[0],o.man[0]?m(o.man[1]):''],['إلغاءات بعد المطبخ',o.void[0],o.void[0]?fmt(o.void[1])+' قطعة':''],['تعديل طريقة الدفع',o.pe,''],
 ['مصاريف',o.exp[0],o.exp[0]?m(o.exp[1]):''],['بخشيش موزّع',o.tip[0],o.tip[0]?m(o.tip[1]):'']].filter(r=>KIND==='rest'||!/المطبخ|بخشيش|ضيافة/.test(r[0]))};
function monText(since){if(LITE)return '';return '\n──────────\n🔎 *المراقبة*\n'+monRows(since).map(([t,n,v])=>`${n?'⚠️':'✅'} ${t}: ${n}${v?' ('+v+')':''}`).join('\n')}
{const _tc=tabClose;tabClose=function(){const h=_tc();if(LITE)return h;const c=drawerCalc(),rows=monRows(c.since);
 return h.replace('<label class="f mt">المبلغ الموجود فعلياً',`<div class="card mt" style="margin-bottom:0;padding:10px 12px"><b>🔎 المراقبة (بتوصل لصاحب المحل)</b>${rows.map(([t,n,v])=>`<div class="kv"><span>${t}</span><b${n?' style="color:var(--bad)"':''}>${n}${v?' · '+v:''}</b></div>`).join('')}</div><label class="f mt">المبلغ الموجود فعلياً`)}}

/* ============ إعادة القفل تلقائياً ============ */
{const _st=A.stab;A.stab=(d,...r)=>{if(d.v!=='net')ui.unlocked=false;return _st(d,...r)}}
{const _t=A.tab;A.tab=(d,...r)=>{ui.unlocked=false;return _t(d,...r)}}
{const _sp=A.savepin;A.savepin=(...r)=>{const x=_sp(...r);ui.unlocked=false;return x}}
window.__acc={boxBal,pBal,assetBook,curPrice,makeSale,receiptCanvas,render,flush,netProfit,get tab(){return tab},get carts(){return carts}};
/* نهاية p6.js */
