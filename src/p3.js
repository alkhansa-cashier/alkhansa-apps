
/* ============ حالة الواجهة والتنقل ============ */
let tab='pos';const stack=[];
const QOPTS=[0.25,0.5,0.75,1,1.5,2,3,5,10];
const ui={rper:'today',ord:null,od:null,kt:null,wk:'shop',ws:true,wst:'',wr:'',pk:{q:'',sort:'name',cat:''},sel:'',inv:{q:'',cat:''},cq:'',sq:'',period:'today',showRef:false,hide:false,unlocked:false,
 saleCust:'',pay:{paid:0,method:'cash'},pd:null,more:false,after:null,last:null,camErr:'',paused:false,torch:false,confirm:null,scroll:{},vk:'',afterPop:null};
const I={pos:'M4 10h16v10H4z M7 4h10v6H7z M8 14h.01 M12 14h.01 M16 14h.01 M8 17h8',box:'M3 8l9-5 9 5v8l-9 5-9-5z M3 8l9 5 9-5 M12 13v8',
 users:'M9 11a4 4 0 100-8 4 4 0 000 8z M2 21a7 7 0 0114 0 M16 3.5a4 4 0 010 7 M22 21a7 7 0 00-4-6.2',chart:'M5 20V11 M11 20V4 M17 20v-7 M2 20h20',
 gear:'M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9L7 7 M17 17l2.1 2.1 M19.1 4.9L17 7 M7 17l-2.1 2.1',
 scan:'M4 8V5a1 1 0 011-1h3 M16 4h3a1 1 0 011 1v3 M20 16v3a1 1 0 01-1 1h-3 M8 20H5a1 1 0 01-1-1v-3 M8 9v6 M12 9v6 M16 9v6',
 plus:'M12 5v14 M5 12h14',minus:'M5 12h14',x:'M6 6l12 12 M18 6L6 18',back:'M5 12h14 M13 6l6 6-6 6',trash:'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13',
 search:'M11 18a7 7 0 100-14 7 7 0 000 14z M20 20l-4-4',check:'M5 12l5 5 9-10',cart:'M3 4h2l3 11h10l2-8H7 M9 20h.01 M17 20h.01',
 edit:'M4 20h4L19 9l-4-4L4 16z',wa:'M4 20l1.4-4.2A8 8 0 1112 20a8 8 0 01-3.8-1z',print:'M7 9V4h10v5 M7 17H4v-7h16v7h-3 M7 14h10v6H7z',
 share:'M12 15V4 M8 8l4-4 4 4 M5 13v6h14v-6',flash:'M13 2L5 14h6l-1 8 8-12h-6z',pause:'M8 5v14 M16 5v14',play:'M7 5l12 7-12 7z',
 grid:'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',list:'M4 6h16 M4 12h16 M4 18h16',undo:'M8 6L3 11l5 5 M3 11h11a6 6 0 010 12h-3',
 lock:'M6 11h12v9H6z M8 11V8a4 4 0 018 0v3',calc:'M6 3h12v18H6z M9 7h6 M9 12h.01 M15 12h.01 M9 16h.01 M15 16h.01 M12 12h.01 M12 16h.01',
 user:'M12 12a4 4 0 100-8 4 4 0 000 8z M4 21a8 8 0 0116 0',copy:'M9 9h11v11H9z M5 15V4h11',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 15a3 3 0 100-6 3 3 0 000 6z',
 tag:'M3 12V4h8l10 10-8 8z M7.5 7.5h.01',money:'M3 7h18v10H3z M12 14a2 2 0 100-4 2 2 0 000 4z',down:'M12 4v11 M8 11l4 4 4-4 M5 19h14',dots:'M5 12h.01 M12 12h.01 M19 12h.01',
 img:'M4 5h16v14H4z M4 16l5-5 4 4 3-3 4 4 M9 9h.01',table:'M3 9h18 M6 9v11 M18 9v11 M8 9V5h8v4',bag:'M5 8h14l-1 12H6z M9 8V6a3 3 0 016 0v2',bike:'M5 19a3 3 0 100-6 3 3 0 000 6z M19 19a3 3 0 100-6 3 3 0 000 6z M5 16l4-7h5l5 7 M12 9l2-4h3',bell:'M6 17V11a6 6 0 0112 0v6l2 2H4z M10 21h4'};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="${I[n]||''}"/></svg>`;
const fullPage=()=>{for(let i=stack.length-1;i>=0;i--)if(!stack[i].sheet)return stack[i];return null};
const topE=()=>stack[stack.length-1];
function open(name,p,sheet){if(!sheet)delete ui.scroll[name];stack.push({name,p:p||{},sheet:!!sheet});try{history.pushState({n:stack.length},'')}catch(e){}render()}
function swap(name,p,sheet){stack[stack.length-1]={name,p:p||{},sheet:!!sheet};render()}
function back(fn,n){n=n||1;if(!stack.length){if(fn)fn();render();return}ui.afterPop=fn||null;n=Math.min(n,stack.length);try{history.go(-n)}catch(e){stack.length-=n;afterPop()}}
function afterPop(){if(!stack.some(x=>x.name==='scan'))camStop();const f=ui.afterPop;ui.afterPop=null;if(f)f();render()}
window.addEventListener('popstate',e=>{const n=(e.state&&e.state.n)||0;while(stack.length>n)stack.pop();afterPop()});
function home(t){const n=stack.length;back(()=>{tab=t},n)}
function ask(msg,yes,fn,bad){ui.confirm={msg,yes,fn,bad};open('confirm',{},true)}
function applyTheme(){try{app.style.zoom=S().fs||1}catch(e){}document.documentElement.classList.toggle('wide',S().wide!==false);const t=S().theme;document.documentElement.dataset.theme=t==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t}

function render(){if(!DB.ready&&!stack.length&&window.__booted){open('welcome',{},true);return}const m=$('.main');if(m&&ui.vk)ui.scroll[ui.vk]=m.scrollTop;
 const f=fullPage(),top=topE();let h=f?P[f.name](f.p):tabView();
 if(top&&top.sheet)h+=`<div class="shade" data-a="shade"><div class="sheet">${SH[top.name](top.p)}</div></div>`;
 app.innerHTML=h;ui.vk=f?f.name:'tab-'+tab;const m2=$('.main');if(m2&&ui.scroll[ui.vk])m2.scrollTop=ui.scroll[ui.vk];
 if(f&&f.name==='scan'&&!(top&&top.sheet))camAttach();
 if(top&&top.name==='rcpt')drawPreview(top.p.id);
 if(top&&top.name==='kt')drawKitchen();
 const af=$('[data-focus]');if(af)setTimeout(()=>{try{af.focus()}catch(e){}},80)}

/* ============ عناصر مشتركة ============ */
const head=(title,right,bk)=>`<header class="hd">${bk?`<button class="ib" data-a="back" aria-label="رجوع">${ic('back')}</button>`:''}<h1>${esc(title)}</h1><div class="hr">${right||''}</div></header>`;
const navBar=()=>`<nav class="nav">${(LITE?[['pos','الطلبات','pos'],['inv','المنيو','list'],['sales','المبيعات','chart'],['set','الإعدادات','gear']]:[['pos',KIND==='rest'?'الطلبات':'الكاشير','pos'],['inv',KIND==='rest'?'المنيو':'المخزون','box'],['cust','الزبائن','users'],['sales','المبيعات','chart']].concat((EDITION==='acc'||EDITION==='shop')?[['acc','الحسابات','money']]:EDITION==='stone'?[['stone','المنشرة','box'],['acc','الحسابات','money']]:EDITION==='phone'?[['mnt','الصيانة','gear']]:EDITION==='pharm'?[['phx','الصيدلية','box']]:EDITION==='cloth'?[['vars','المقاسات','tag']]:(EDITION==='build'||EDITION==='whole')?[['vars','الوحدات','box'],['acc','الحسابات','money']]:EDITION==='solar'?[['solar','الحاسبة','calc'],['acc','الحسابات','money']]:EDITION==='stat'?[['lists','القوائم','list']]:EDITION==='sweet'?[['pre','الطلبيات','calc']]:EDITION==='bake'?[['pre','الطلبيات','calc'],['prod','الإنتاج','list']]:EDITION==='vet'?[['phx','الصيدلية','box']]:[],[['set','الإعدادات','gear']]))
 .map(([k,t,i])=>`<button class="${tab===k?'on':''}" data-a="tab" data-v="${k}">${ic(i)}<span>${t}</span></button>`).join('')}</nav>`;
const rateChip=()=>userChip()+`<button class="ratechip" data-a="tab" data-v="set">1$ = ${fmt(S().rate)} ل.س</button>`;
const licBanner=()=>`<button class="lic" data-a="open" data-v="act">${ic('tag')}<span>${esc(licText())}</span><u>تفعيل</u></button>`;
const sw=(on,a,k)=>`<button class="sw ${on?'on':''}" data-a="${a}" data-k="${k}" role="switch" aria-checked="${!!on}"></button>`;
const opt=(title,sub,ctl)=>`<div class="opt"><div class="gr"><b>${title}</b>${sub?`<small>${sub}</small>`:''}</div>${ctl}</div>`;
const seg=(a,cur,items,k)=>`<div class="seg">${items.map(([v,t])=>`<button class="${String(cur)===String(v)?'on':''}" data-a="${a}" data-v="${v}"${k?` data-k="${k}"`:''}>${t}</button>`).join('')}</div>`;
const empty=(icn,t,sub)=>`<div class="empty">${ic(icn)}<div><b>${t}</b></div>${sub?`<div>${sub}</div>`:''}</div>`;
function stockBadge(p,used,long){if(!p.track)return long?'<span class="badge neu">بلا متابعة</span>':'';const left=r3(p.stock-(used||0));
 const cls=left<=0?'out':(S().lowAlert&&left<=S().lowAt?'low':'');return `<span class="badge ${cls}">${fmt(left)}${long?' متوفر':''}</span>`}
const lowCount=()=>S().lowAlert?DB.products.filter(p=>p.track&&p.stock<=S().lowAt).length:0;
const saleLi=s=>`<button class="li ${s.refunded?'off':''}" data-a="sale" data-id="${s.id}"><span class="av">${ic('money')}</span><div class="gr"><b>بيع رقم ${s.no}</b><small>${dt(s.t)}، ${s.items.length} ${s.items.length>1?'أصناف':'صنف'}</small></div>
 <div class="lt"><b class="num">${money(s.total,s.cur)}</b>${s.refunded?'<span class="badge out">مُسترجعة</span>':s.remaining>0?'<span class="badge low">عليها دين</span>':''}</div></button>`;
const cartLine=(it,i,cn)=>`<div class="li"><div class="gr"${KIND==='rest'?` data-a="iedit" data-cn="${cn}" data-i="${i}" style="cursor:pointer"`:''}><b>${esc(it.name)}</b><small>${money(it.price)} للوحدة</small>${it.note?`<small class="nt">${esc(it.note)}</small>`:''}${it.sent&&(it.note||'')!==(it.sentNote||'')?'<small class="nt">⚠ الملاحظة تغيرت، ابعت للمطبخ</small>':''}</div>
 <div class="qty"><button class="ib sm" data-a="cq" data-cn="${cn}" data-i="${i}" data-d="-1" aria-label="إنقاص">${ic('minus')}</button><button class="qv" data-a="qedit" data-cn="${cn}" data-i="${i}">${fq(it.qty)}</button><button class="ib sm" data-a="cq" data-cn="${cn}" data-i="${i}" data-d="1" aria-label="زيادة">${ic('plus')}</button></div>
 <div class="lt"><b class="num">${money(roundM(it.price*it.qty))}</b>${KIND==='rest'?`<button class="ib sm" data-a="iedit" data-cn="${cn}" data-i="${i}" aria-label="تعديل">${ic('edit')}</button>`:''}<button class="ib sm bad" data-a="cdel" data-cn="${cn}" data-i="${i}" aria-label="حذف">${ic('trash')}</button></div></div>`;

/* ============ التبويبات الرئيسية ============ */
function tabView(){if(tab==='acc'&&['acc','build','solar','whole','shop','stone'].includes(EDITION))return vAcc();if(tab==='vars'&&(EDITION==='cloth'||(EDITION==='build'||EDITION==='whole')||EDITION==='shop'))return vVars();if(tab==='solar'&&EDITION==='solar')return vSolar();if(tab==='lists'&&EDITION==='stat')return vLists();if(tab==='stone'&&EDITION==='stone')return vStone();if(tab==='pre'&&(EDITION==='sweet'||EDITION==='bake'))return vPre();if(tab==='prod'&&EDITION==='bake')return vProd();if(tab==='phx'&&EDITION==='vet')return vPhx();if(tab==='mnt'&&EDITION==='phone')return vMnt();if(tab==='phx'&&EDITION==='pharm')return vPhx();if(tab==='inv')return vInv();if(tab==='cust')return vCust();if(tab==='sales')return vSales();if(tab==='set')return vSet();return vPos()}
const ordLi=o=>{const n=o.items.length;return `<button class="li" data-a="loadord" data-id="${o.id}"><span class="av">${o.no}</span><div class="gr"><b>${esc(ordLabel(Object.assign({},o,{no:0})))}</b><small>${n} ${n>1?'أصناف':'صنف'}، منذ ${ago(o.t)}</small></div>
 <div class="lt"><b class="num">${money(ordTotal(o))}</b><span class="badge ${o.kprints?'low':'neu'}">${o.kprints?'بالمطبخ':'محفوظ'}</span></div></button>`};
function vRest(){const cart=carts.sale,o=ui.ord,c=cart.length,lc=lowCount();
 let h=head(APPNAME,rateChip())+`<main class="main">${licBanner()}`;
 if(!o&&!c){h+=tablesGrid()+`<div class="g3">${[['dine','صالة','table'],['take','سفري','bag'],['del','توصيل','bike']].map(([v,t,i])=>`<button class="big" data-a="neword" data-v="${v}">${ic(i)}<b>${t}</b></button>`).join('')}</div>
  <div class="${LITE?'':'g2 '}mt">${LITE?'':`<button class="btn ghost" data-a="open" data-v="quick">${ic('calc')} الحساب السريع</button>`}<button class="btn ghost${LITE?' wide':''}" data-a="tab" data-v="inv">${ic('list')} المنيو</button></div>`;
  if(lc)h+=`<button class="warn mt" data-a="lowlist">${ic('bell')} ${lc} ${lc>1?'أصناف قاربت':'صنف قارب'} على النفاد</button>`;
  const op=DB.orders;h+=`<h2 class="sec">الطلبات المفتوحة ${op.length?`<span class="cnt">${op.length}</span>`:''}</h2>`+(op.length?op.map(ordLi).join(''):empty('list','لا توجد طلبات مفتوحة','ابدأ طلباً من الأزرار بالأعلى: صالة أو سفري أو توصيل'))}
 else{const sub=o&&o.type==='del'?[o.phone,o.addr].filter(Boolean).join('، '):(o&&o.id?'مفتوح منذ '+ago(o.t):'طلب جديد');
  h+=`<div class="ordhd"><div class="gr"><b>${esc(ordLabel(o||{type:'take'}))}</b><small>${esc(sub)}</small></div><button class="ib sm" data-a="editord" aria-label="تعديل بيانات الطلب">${ic('edit')}</button></div>
  <div class="g2 mt"><button class="btn pri" data-a="pick" data-v="sale">${ic('plus')} إضافة أصناف</button><button class="btn ghost" data-a="manual" data-v="sale">${ic('plus')} صنف يدوي</button></div>`;
  h+=c?`<h2 class="sec">الأصناف <span class="cnt">${c}</span></h2>`+cart.map((it,i)=>cartLine(it,i,'sale')).join(''):empty('cart','الطلب فارغ','أضف الأصناف من زر "إضافة أصناف"')}
 h+='</main>';
 if(o||c)h+=`<div class="pay"><div class="payrow"><button class="btn ghost sm bad" data-a="cancelord">${ic('x')} إلغاء</button><button class="btn ghost sm" data-a="holdord" ${c?'':'disabled'}>${ic('list')} حفظ</button><button class="btn ghost sm" data-a="sendk" ${c?'':'disabled'}>${ic('print')} للمطبخ</button></div>
 <div class="payrow"><div class="tag lg"><small>الإجمالي</small><span>${money(cartTotal(cart))}${dualSmall(cartTotal(cart))}</span></div><button class="btn pri" data-a="checkout" ${c?'':'disabled'}>${ic('check')} دفع</button></div></div>`;
 return h+navBar()}
function vPos(){if(S().kind==='rest')return vRest();const cart=carts.sale,c=cart.length,cu=ui.saleCust&&custById(ui.saleCust),lc=lowCount();
 let h=head(APPNAME,rateChip())+`<main class="main">${licBanner()}
 <div class="g2"><button class="big" data-a="scan" data-v="sale">${ic('scan')}<b>مسح الباركود</b></button><button class="big" data-a="pick" data-v="sale">${ic('box')}<b>اختيار المنتجات</b></button></div>
 <div class="g2 mt"><button class="btn ghost" data-a="manual" data-v="sale">${ic('plus')} منتج يدوي</button><button class="btn ghost" data-a="open" data-v="quick">${ic('calc')} الحساب السريع</button></div>`;
 if(lc)h+=`<button class="warn mt" data-a="lowlist">${ic('bell')} ${lc} ${lc>1?'منتجات قاربت':'منتج قارب'} على النفاد، اضغط للعرض</button>`;
 if(S().whole)h+=`<div class="mt">${opt('نوع البيع',ui.whole?'بأسعار الجملة':'بأسعار المفرق',seg('wmode',ui.whole?1:0,[[0,'مفرق'],[1,'جملة']]))}</div>`;
 if(c)h+=`<h2 class="sec">السلة <span class="cnt">${c}</span></h2>`+cart.map((it,i)=>cartLine(it,i,'sale')).join('');
 else{const rs=DB.sales.slice(0,6);h+=`<h2 class="sec">آخر المبيعات${rs.length?`<button class="lk" data-a="tab" data-v="sales">عرض الكل</button>`:''}</h2>`+(rs.length?rs.map(saleLi).join(''):empty('cart','لا توجد مبيعات بعد','امسح باركود أو اختر منتجاً لتبدأ أول عملية بيع'))}
 h+='</main>';
 if(c)h+=`<div class="pay"><div class="payrow"><button class="btn ghost sm" data-a="choosecust">${ic('user')} ${cu?esc(cu.name):'اختيار زبون'}</button><button class="btn ghost sm bad" data-a="cancelsale">${ic('x')} إلغاء البيع</button></div>
 <div class="payrow"><div class="tag lg"><small>الإجمالي</small><span>${money(cartTotal(cart))}${dualSmall(cartTotal(cart))}</span></div><button class="btn pri" data-a="checkout">${ic('check')} إنهاء البيع</button></div></div>`;
 return h+navBar()}

function invFiltered(){const q=norm(ui.inv.q),cat=ui.inv.cat;let l=DB.products.filter(p=>(!q||norm(p.name).includes(q)||(p.barcode||'').includes(q))&&(!cat||(cat==='~low'?(p.track&&p.stock<=S().lowAt):p.cat===cat)));
 return l.sort((a,b)=>cat==='~low'?a.stock-b.stock:a.name.localeCompare(b.name,'ar'))}
const prodLi=p=>`<button class="li" data-a="editprod" data-id="${p.id}"><span class="av">${esc((p.name||'?').trim()[0]||'?')}</span><div class="gr"><b>${esc(p.name)}</b><small>${esc(p.barcode||'بدون باركود')}${p.cat?'، '+esc(p.cat):''}</small>
 <small><b class="num">${money(pPrice(p))}</b>${p.cur!==S().cur?' ('+money(p.price,p.cur)+')':''}${p.cost||!S().costOn?'':'، بدون سعر تكلفة'}</small></div><div class="lt">${stockBadge(p,0,true)}</div></button>`;
const invList=()=>{const l=invFiltered();return l.length?l.map(prodLi).join(''):(DB.products.length?empty('search','لا يوجد منتج مطابق'):empty('box','المخزون فارغ','أضف أول منتج بزر "إضافة منتج" أو استورد قائمة جاهزة من الأدوات'))};
function vInv(){const cats=[['','الكل']].concat(DB.cats.map(c=>[c,c]));if(S().lowAlert)cats.push(['~low','قارب على النفاد']);
 return head(KIND==='rest'?'المنيو':'المخزون',`<span class="badge neu">${DB.products.length} ${KIND==='rest'?'صنف':'منتج'}</span><button class="ib" data-a="opensheet" data-v="tools" aria-label="أدوات">${ic('dots')}</button>`)+`<main class="main">
 <div class="srch">${ic('search')}<input data-i="invq" value="${esc(ui.inv.q)}" placeholder="ابحث بالاسم أو الباركود"></div>
 <div class="chips">${cats.map(([v,t])=>`<button class="chip ${ui.inv.cat===v?'on':''}" data-a="invcat" data-v="${esc(v)}">${esc(t)}</button>`).join('')}</div>
 <div id="invlist">${invList()}</div><div style="height:70px"></div></main><button class="fab" data-a="newprod">${ic('plus')} إضافة منتج</button>`+navBar()}

const custLi=c=>{const b=balance(c.id);return `<button class="li" data-a="cust" data-id="${c.id}"><span class="av">${esc((c.name||'?')[0])}</span><div class="gr"><b>${esc(c.name)}</b><small>${esc(c.phone||'بدون رقم')}</small></div>
 <div class="lt">${b>0?`<span class="tag">${money(b)}</span>`:'<span class="badge">لا دين</span>'}</div></button>`};
const custFiltered=q=>{q=norm(q);return DB.customers.filter(c=>!q||norm(c.name).includes(q)||(c.phone||'').includes(q)).sort((a,b)=>a.name.localeCompare(b.name,'ar'))};
const custList=()=>{const l=custFiltered(ui.cq);return l.length?l.map(custLi).join(''):empty('users',DB.customers.length?'لا يوجد زبون مطابق':'لا يوجد زبائن بعد','أضف الزبائن لتسجيل الديون عليهم ومتابعتها')};
function vCust(){const tot=roundM(DB.customers.reduce((s,c)=>s+Math.max(0,balance(c.id)),0));
 return head('الزبائن',tot>0?`<span class="tag"><small>الديون</small>${money(tot)}</span>`:'')+`<main class="main"><div class="srch">${ic('search')}<input data-i="custq" value="${esc(ui.cq)}" placeholder="ابحث بالاسم أو الهاتف"></div>
 <div id="custlist">${custList()}</div><div style="height:70px"></div></main><button class="fab" data-a="newcust">${ic('plus')} إضافة زبون</button>`+navBar()}

const ownerLocked=()=>{if(ui.unlocked)return false;const u=curUser();if(u)return u.role!=='admin';return !!S().pin};
const locked=()=>false;
function salesList(){const q=toLatin(ui.sq).trim();const l=DB.sales.filter(s=>(ui.showRef||!s.refunded)&&(!q||String(s.no).includes(q)));
 return l.length?l.slice(0,300).map(saleLi).join(''):empty('chart','لا توجد فواتير')}
function vSales(){return salesView()}

function vSet(){return setView()}

/* ============ الصفحات الكاملة ============ */
const P={};
function pkFiltered(){const k=ui.pk,q=norm(k.q);let l=DB.products.filter(p=>(!q||norm(p.name).includes(q)||(p.barcode||'').includes(q))&&(!k.cat||p.cat===k.cat));
 const s=k.sort;return l.sort((a,b)=>s==='sold'?(b.sold||0)-(a.sold||0):s==='new'?b.t-a.t:s==='low'?(a.track?a.stock:1e12)-(b.track?b.stock:1e12):a.name.localeCompare(b.name,'ar'))}
function pkGrid(cn){const l=pkFiltered();if(!l.length)return DB.products.length?empty('search','لا يوجد منتج مطابق'):empty('box','لا توجد منتجات','أضف منتجاتك أولاً بزر + في الأعلى');
 if(S().list)return l.map(p=>{const q=inCart(cn,p.id);return `<button class="li" data-a="padd" data-id="${p.id}" style="${ui.sel===p.id?'border-color:var(--tag)':''}"><span class="av">${esc(p.name.trim()[0]||'?')}</span><div class="gr"><b>${esc(p.name)}</b><small class="num">${money(pPrice(p))}</small></div><div class="lt">${q?`<i class="bq">${fq(q)}×</i>`:''}${stockBadge(p,q)}</div></button>`}).join('');
 return `<div class="pg ${S().view==='small'?'c4 sm':'c'+S().cols}">`+l.map(p=>{const q=inCart(cn,p.id);return `<button class="pc ${ui.sel===p.id?'sel':''}" data-a="padd" data-id="${p.id}"><span class="av">${esc(p.name.trim()[0]||'?')}</span><b>${esc(p.name)}</b><span class="pr">${money(pPrice(p))}</span><span class="bs">${q?`<i class="bq">${fq(q)}×</i>`:''}${stockBadge(p,q)}</span></button>`}).join('')+'</div>'}
function qbar(cn){const it=ui.sel&&carts[cn].find(x=>x.pid===ui.sel);if(!it)return '';
 return `<div class="qbar"><div class="top"><div class="gr"><b>${esc(it.name)}</b><small class="num" style="display:block;color:var(--mut)">${money(it.price)} للوحدة، المجموع ${money(roundM(it.price*it.qty))}</small></div>
 <button class="ib sm bad" data-a="qdel" data-cn="${cn}" aria-label="حذف من السلة">${ic('trash')}</button><button class="ib sm" data-a="qclose" aria-label="إغلاق">${ic('x')}</button></div>
 <div class="ctl"><button class="rb" data-a="q" data-cn="${cn}" data-d="-1">${ic('minus')}</button><button class="rb" data-a="q" data-cn="${cn}" data-d="-0.5">½−</button>
 <input data-c="qin" data-cn="${cn}" inputmode="decimal" value="${it.qty}" aria-label="الكمية"><button class="rb" data-a="q" data-cn="${cn}" data-d="0.5">½+</button><button class="rb" data-a="q" data-cn="${cn}" data-d="1">${ic('plus')}</button></div>
 <div class="chips" style="padding:10px 0 0">${S().quick.map(v=>`<button class="chip ${it.qty===v?'on':''}" data-a="qset" data-cn="${cn}" data-v="${v}">${fq(v)}</button>`).join('')}</div>
 ${S().kind==='rest'&&cn==='sale'?`<input class="inp" data-c="qnote" data-cn="${cn}" value="${esc(it.note||'')}" placeholder="ملاحظة للمطبخ: بدون بصل، زيادة ثوم…" style="margin-top:4px"><div class="chips" style="padding:8px 0 0">${notesL().map(n=>`<button class="chip ${(it.note||'').includes(n)?'on':''}" data-a="qnadd" data-cn="${cn}" data-v="${n}">${n}</button>`).join('')}</div>`:''}</div>`}
P.pick=p=>{const cn=p.cn,c=carts[cn],k=ui.pk;
 return head('اختر المنتج',`<button class="ib" data-a="tglist" aria-label="تغيير العرض">${ic(S().list?'grid':S().view==='small'?'list':'grid')}</button><button class="ib" data-a="newprod" aria-label="إضافة منتج">${ic('plus')}</button>${LITE?'':`<button class="ib" data-a="scan" data-v="${cn}" aria-label="مسح">${ic('scan')}</button>`}`,true)+`<main class="main">
 <div class="srch">${ic('search')}<input data-i="pkq" data-cn="${cn}" value="${esc(k.q)}" placeholder="ابحث بالاسم أو الباركود"></div>
 <div class="chips">${[['name','بالاسم'],['sold','الأكثر مبيعاً'],['new','الأحدث'],['low','الأقل كمية']].map(([v,t])=>`<button class="chip ${k.sort===v?'on':''}" data-a="pksort" data-v="${v}">${t}</button>`).join('')}</div>
 ${DB.cats.length?`<div class="chips">${[['','كل الأقسام']].concat(DB.cats.map(x=>[x,x])).map(([v,t])=>`<button class="chip ${k.cat===v?'on':''}" data-a="pkcat" data-v="${esc(v)}">${esc(t)}</button>`).join('')}</div>`:''}
 <div id="pkgrid">${pkGrid(cn)}</div></main>${qbar(cn)}
 <div class="donebar"><button class="btn pri wide" data-a="back">${ic('cart')} تم${c.length?`، ${c.length} ${c.length>1?'أصناف':'صنف'} بقيمة ${money(cartTotal(c))}`:''}</button></div>`};

P.quick=()=>{const c=carts.quick;
 return head('الحساب السريع','',true)+`<main class="main"><div class="card" style="text-align:center"><div class="note">لا يُحفظ شيء في هذا الوضع، ولا ينقص المخزون</div>
 <div class="tag lg" style="font-size:30px;margin:8px 0">${money(cartTotal(c))}</div><div class="note">${c.length} ${c.length===1?'صنف':'أصناف'}، ${fq(cartCount(c))} قطعة</div></div>
 <div class="g2"><button class="big" data-a="scan" data-v="quick">${ic('scan')}<b>مسح</b></button><button class="big" data-a="pick" data-v="quick">${ic('search')}<b>بحث بالاسم</b></button></div>
 ${c.length?`<h2 class="sec">الأصناف<button class="lk" data-a="quickclear">حساب جديد</button></h2>`+c.map((it,i)=>cartLine(it,i,'quick')).join(''):empty('calc','ابدأ بمسح أول منتج','يظهر السعر والمجموع فوراً')}</main>`};

P.scan=p=>{const cn=p.cn,title=p.field?'مسح باركود المنتج':cn==='quick'?'الحساب السريع':'مسح الباركود';
 return `<div class="scan"><video id="cam" playsinline muted autoplay></video>
 <div class="sctop"><button class="ib" data-a="back" aria-label="رجوع">${ic('back')}</button><b>${title}</b><span id="sctot"></span></div>
 <div class="frame"><i></i></div><div class="scmsg" id="scmsg"></div>
 <div class="scbot"><div class="scin"><input id="mcode" inputmode="numeric" placeholder="أو اكتب الباركود هنا" enterkeyhint="done"><button class="btn sm" data-a="mcode" style="background:var(--tag);color:var(--ontag)">إضافة</button></div>
 <div class="scbtns"><button class="rb ${ui.torch?'on':''}" data-a="torch" aria-label="الفلاش">${ic('flash')}</button><button class="rb ${ui.paused?'on':''}" data-a="campause" aria-label="إيقاف مؤقت">${ic(ui.paused?'play':'pause')}</button><button class="rb" data-a="back" aria-label="تم">${ic('check')}</button></div></div></div>`};

function newDraft(code){return {id:'',barcode:code||'',name:'',price:'',cur:S().lastCur||S().cur,link:true,cost:'',ccur:S().lastCur||S().cur,stock:'',track:true,cat:'',more:ui.more}}
function readProd(){const d=ui.pd||newDraft(),g=id=>{const e=$('#'+id);return e?e.value:''};
 if($('#pn')){d.barcode=toLatin(g('pb')).trim();d.name=g('pn').trim();d.price=g('pp');if($('#pw'))d.wp=g('pw');if($('#pc'))d.cost=g('pc');d.stock=g('ps');d.cat=g('pcat').trim()}const ex=$('#pexp');if(ex)d.exp=ex.value;return d}
P.prod=()=>{const d=ui.pd||(ui.pd=newDraft()),cs=[['USD','$ دولار'],['SYP','ل.س']];
 return head(d.id?'تعديل منتج':'إضافة منتج','',true)+`<main class="main">
 ${d.id?'':`<div class="card">${opt('إضافة عدة منتجات','البقاء هنا بعد الحفظ لإضافة المنتج التالي',sw(d.more,'ptg','more'))}</div>`}
 <div class="card"><div class="frow"${LITE?' style="display:none"':''}><label class="f">الباركود (اختياري)<input id="pb" inputmode="numeric" value="${esc(d.barcode)}" placeholder="امسح أو اكتب"></label><button class="btn pri" data-a="scanfield" style="margin-bottom:12px" aria-label="مسح الباركود">${ic('scan')}</button></div>
 <label class="f">اسم المنتج<input id="pn" value="${esc(d.name)}"></label>
 <label class="f" style="margin:0">القسم (اختياري)<input id="pcat" list="catsdl" value="${esc(d.cat)}" placeholder="مثال: مشروبات"><datalist id="catsdl">${DB.cats.map(c=>`<option value="${esc(c)}">`).join('')}</datalist></label>${S().expiry?`<label class="f" style="margin:12px 0 0">تاريخ انتهاء الصلاحية (اختياري)<input id="pexp" type="date" value="${esc(d.exp||'')}"></label>`:''}</div>
 <div class="card"><div class="frow"><label class="f">سعر البيع<input id="pp" inputmode="decimal" value="${esc(d.price)}" placeholder="0"></label><div style="margin-bottom:12px">${seg('pseg',d.cur,cs,'cur')}</div></div>
 ${S().whole?`<label class="f" style="margin:0 0 10px">سعر الجملة (اختياري، بنفس عملة السعر)<input id="pw" inputmode="decimal" value="${esc(d.wp||'')}" placeholder="اتركه فاضي إذا ما في"></label>`:''}
 ${d.cur==='USD'?opt('ربط السعر بسعر الصرف',d.link?'السعر بالليرة يتغير تلقائياً مع الدولار':'يُحفظ السعر بالليرة الآن ولا يتغير',sw(d.link,'ptg','link')):''}</div>
 ${S().costOn?`<div class="card"><div class="frow"><label class="f">سعر التكلفة (اختياري)<input id="pc" inputmode="decimal" value="${esc(d.cost)}" placeholder="0"></label><div style="margin-bottom:12px">${seg('pseg',d.ccur,cs,'ccur')}</div></div>
 <div class="note">اتركه فارغاً إذا غير معروف، ولن يُحسب ربح هذا المنتج</div></div>`:''}
 <div class="card"${LITE?' style="display:none"':''}>${opt('متابعة المخزون','إنقاص الكمية مع كل عملية بيع',sw(d.track,'ptg','track'))}
 <label class="f mt" style="${d.track?'':'display:none'}">الكمية المتوفرة<input id="ps" inputmode="decimal" value="${esc(d.stock)}" placeholder="0"></label></div>
 <button class="btn pri wide" data-a="saveprod">${ic('check')} حفظ المنتج</button>
 ${d.id?`<button class="btn ghost bad wide mt" data-a="delprod">${ic('trash')} حذف المنتج</button>`:''}</main>`};

P.sale=p=>{const s=DB.sales.find(x=>x.id===p.id);if(!s)return head('فاتورة','',true)+'<main class="main">'+empty('chart','الفاتورة غير موجودة')+'</main>';
 const m=v=>money(v,s.cur),c=s.cid&&custById(s.cid);
 return head('بيع رقم '+s.no,'',true)+`<main class="main">${s.refunded?`<div class="warn err">${ic('undo')} فاتورة مُسترجعة بتاريخ ${dt(s.refunded)}، مستثناة من الإحصائيات</div>`:''}
 <div class="card"><div class="kv"><span>التاريخ</span><b class="num">${dt(s.t)}</b></div>${c?`<div class="kv"><span>الزبون</span><b>${esc(c.name)}</b></div>`:''}
 ${s.ord?`<div class="kv"><span>الطلب</span><b>${esc(ordLabel(s.ord))}</b></div>${s.ord.addr?`<div class="kv"><span>العنوان</span><b>${esc(s.ord.addr)}</b></div>`:''}`:''}<div class="kv"><span>طريقة الدفع</span><b>${s.method==='sham'?'شام كاش':s.method==='mix'?`كاش ${money(cashPart(s),s.cur)} + شام كاش ${money(shamPart(s),s.cur)}`:'كاش'}</b></div><div class="kv"><span>المدفوع</span><b class="num">${m(s.paid)}</b></div>
 ${s.remaining>0?`<div class="kv"><span>المتبقي (دين)</span><b class="num" style="color:var(--bad)">${m(s.remaining)}</b></div>`:''}
 <div class="kv"><span>سعر الصرف وقت البيع</span><b class="num">${fmt(s.rate)}</b></div></div>
 <div class="card"><table class="tbl"><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr>
 ${s.items.map(i=>`<tr><td>${esc(i.name)}</td><td class="num">${fq(i.qty)}</td><td class="num">${m(i.price)}</td><td class="num">${m(roundM(i.price*i.qty,s.cur))}</td></tr>`).join('')}</table>
 ${s.disc?`<div class="kv mt"><span>المجموع</span><b class="num">${m(s.sub)}</b></div><div class="kv"><span>الخصم${s.dpct?' '+s.dpct+'%':''}</span><b class="num" style="color:var(--bad)">−${m(s.disc)}</b></div>`:''}<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px"><b>الإجمالي${s.whole?' (جملة)':''}</b><span class="tag lg">${m(s.total)}</span></div></div>
 <div class="card"><h3>إرسال الفاتورة عبر واتساب</h3><p class="sub">اكتب رقم الزبون، أو اتركه فارغاً لتختار جهة من واتساب</p>
 <div class="frow"><label class="f" style="margin:0"><input id="waph" inputmode="tel" value="${esc(c&&c.phone||'')}" placeholder="رقم الهاتف"></label><button class="btn wa" data-a="wasale" data-id="${s.id}">${ic('wa')} إرسال</button></div></div>
 <div class="acts"><button class="btn ghost" data-a="preview" data-id="${s.id}">${ic('eye')}معاينة الإيصال</button><button class="btn ghost" data-a="printsale" data-id="${s.id}">${ic('print')}طباعة حرارية</button>
 <button class="btn ghost" data-a="shareimg" data-id="${s.id}">${ic('img')}مشاركة كصورة</button><button class="btn ghost" data-a="sharetxt" data-id="${s.id}">${ic('share')}مشاركة كنص</button>
 <button class="btn ghost" data-a="dupsale" data-id="${s.id}">${ic('copy')}نسخ إلى السلة</button>${s.refunded?'':`<button class="btn ghost bad" data-a="refund" data-id="${s.id}">${ic('undo')}إرجاع الفاتورة</button>`}</div>
 <button class="btn pri wide mt" data-a="donesale">${ic('check')} تم</button></main>`};

P.cust=p=>{const c=custById(p.id);if(!c)return head('زبون','',true)+'<main class="main"></main>';const b=balance(c.id),led=DB.ledger.filter(l=>l.cid===c.id).sort((a,z)=>z.t-a.t);
 return head(c.name,`<button class="ib" data-a="editcust" data-id="${c.id}" aria-label="تعديل">${ic('edit')}</button>`,true)+`<main class="main">
 <div class="card" style="text-align:center"><div class="note">${esc(c.phone||'بدون رقم هاتف')}</div><div class="note">الرصيد المستحق عليه</div><div class="tag lg" style="font-size:26px;margin:6px 0">${money(Math.max(0,b))}</div>${b<0?`<div class="badge">رصيد له عندنا (دفع زيادة): ${money(-b)}</div>`:''}
 <div class="g2 mt"><button class="btn pri" data-a="opensheet" data-v="paydebt" data-id="${c.id}" ${b>0?'':'disabled'}>${ic('money')} تسجيل دفعة</button><button class="btn wa" data-a="remind" data-id="${c.id}" ${b>0?'':'disabled'}>${ic('wa')} تذكير</button></div></div>
 <h2 class="sec">سجل الحركات</h2>${led.length?led.map(l=>`<${l.sid?'button data-a="sale" data-id="'+l.sid+'"':'div'} class="li"><div class="gr"><b>${esc(l.note||'')}</b><small>${dt(l.t)}</small></div><div class="lt"><b class="num" style="color:var(--${l.amt>0?'bad':'ok'})">${l.amt>0?'+':'−'} ${money(Math.abs(l.amt),l.cur)}</b></div></${l.sid?'button':'div'}>`).join(''):empty('money','لا توجد حركات')}
 <button class="btn ghost bad wide mt" data-a="delcust" data-id="${c.id}">${ic('trash')} حذف الزبون</button></main>`};

P.act=()=>{const l=DB.lic;
 return head('تفعيل الاشتراك','',true)+`<main class="main"><div class="card" style="text-align:center">${ic('lock')}<h3>${esc(licText())}</h3>
 <p class="sub">اختر باقة وأرسل الطلب عبر واتساب، ثم أدخل كود التفعيل الذي يصلك</p>
 <div class="kv"><span>رقم الطلب لهذا الجهاز</span><b class="num">${reqCode()}</b></div>
 <label class="f mt">كود التفعيل<textarea id="actcode" rows="3" autocomplete="off" spellcheck="false" placeholder="الصق هون كود التفعيل اللي وصلك على واتساب" style="width:100%;box-sizing:border-box;font-size:14px;direction:ltr;text-align:left;border-radius:12px;padding:10px;border:1.5px solid var(--line);background:var(--soft);color:inherit"></textarea></label><button class="btn ghost wide mb" data-a="pastecode">لصق الكود</button>
 <button class="btn pri wide" data-a="doact">${ic('check')} تفعيل</button></div>
 <h2 class="sec">الباقات</h2>${PACKS.map(k=>`<div class="li"${k.best?' style="border:2px solid var(--tag)"':''}><div class="gr"><b>${k.name}${k.best?' <span class="badge low">الأوفر</span>':''}</b><small>${k.desc}</small></div><span class="tag">$${k.price}</span><button class="btn wa sm" data-a="askpack" data-v="${k.id}">${ic('wa')} طلب</button></div>`).join('')}
 <div class="note">الدفع عبر شام كاش، وبعد الدفع يصلك كود التفعيل على واتساب.</div></main>`};

P.printer=()=>{const rest=S().kind==='rest',slot=(k,t)=>`<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h3 style="margin:0">${t}</h3><span class="badge ${bs(k).ch?'':'out'}" style="font-size:13px;padding:5px 12px">${bs(k).ch?'✓ متصلة':'✕ غير متصلة'}</span></div><p class="sub">${bs(k).ch?esc(bs(k).name)+(bs(k).id?' · '+esc(bs(k).id):''):(S().bt&&S().bt[k]?'آخر طابعة: '+esc(S().bt[k].name)+' · اكبس بحث واتصال':'شغّل الطابعة وقرّبها من الهاتف ثم ابحث')}</p>${bs(k).ch&&NB()?`<button class="btn ghost wide mb" data-a="btdisc" data-v="${k}">قطع الاتصال</button>`:''}<div class="g2"><button class="btn pri" data-a="bleconn" data-v="${k}">${ic('search')} بحث واتصال</button><button class="btn ghost" data-a="bletest" data-v="${k}">${ic('print')} طباعة تجريبية</button></div></div>`;
 return head('الطابعة الحرارية','',true)+`<main class="main">${canBLE()?(rest?`<div class="card">${opt('طابعة وحدة للمطبخ والكاشير','ورقة المطبخ والفاتورة بيطلعوا من نفس الطابعة',sw(S().onePr,'tg','onePr'))}</div>`:'')+slot('c',rest?(S().onePr?'الطابعة (مطبخ + كاشير)':'طابعة الكاشير'):'الطابعة')+(rest&&!S().onePr?slot('k','طابعة المطبخ الرئيسي')+`<div class="note" style="margin:-6px 4px 12px">أي صنف ما إله طابعة خاصة بيروح لهالطابعة.</div>`+(S().kst||[]).map(s=>slot(s.id,'طابعة '+esc(s.name))+`<button class="btn ghost wide mb" style="margin-top:-6px" data-a="opensheet" data-v="ksform" data-id="${s.id}">${ic('edit')} أقسام ${esc(s.name)}: ${s.cats.length?esc(s.cats.join('، ')):'ما في أقسام'}</button>`).join('')+`<button class="btn ghost wide mb" data-a="opensheet" data-v="ksform">${ic('plus')} إضافة طابعة مطبخ تانية (مشاوي، مشروبات…)</button>`:''):`<div class="warn">${ic('bell')} الطباعة عبر البلوتوث غير مفعّلة في هذه النسخة بعد. حالياً أرسل الفاتورة عبر واتساب أو شاركها كصورة.</div>`}<div class="card"><h3>إعدادات الطباعة</h3><p class="sub">يُطبع العربي كصورة لضمان ظهور الأحرف بشكل صحيح</p>${opt('مقاس الورق','',seg('paper',S().paper,[[80,'80 مم'],[58,'58 مم']]))}
 ${S().paper===80?opt('عرض الطباعة','إذا انقصّ طرف الكتابة اختر رقماً أصغر',seg('pw',S().pw||576,[[512,'512'],[544,'544'],[576,'576'],[640,'640']])):''}
 ${opt('جودة الطباعة',(S().pq||'fast')==='fast'?'سريعة: نص البيانات، والكتابة أخف شوي':'عالية: أوضح، بس أبطأ بمرتين',seg('pq',S().pq||'fast',[['fast','⚡ سريعة'],['hq','عالية']]))}${opt('غمق الكتابة','',seg('dark',S().dark||0,[[0,'عادي'],[1,'غامق'],[2,'أغمق']]))}${NB()?opt('سرعة الطباعة',(S().pspeed||'f')==='f'?'إذا طلع خطوط بيضا أو كلام ناقص رجّعها عادي':'جرّب السريع، وإذا طلع الورق مضبوط خليه',seg('pspeed',S().pspeed||'f',[['n','عادي'],['f','سريع'],['x','🔥 أسرع']])):''}</div>
 ${canBLE()?`<div class="card"><h3>تجارب الطباعة</h3><p class="sub">اتصل بالطابعة أولاً، ثم جرّب كل زر وقارن الورق. الزر الذي تختاره يصير طريقة الطباعة الدائمة.</p>${opt('المسافة المعتمدة','',seg('ls',S().ls||24,[[24,'24'],[23,'23'],[22,'22']]))}<div class="g2">${[[1,'تجربة أ: المسافة 24'],[2,'تجربة ب: المسافة 23'],[3,'تجربة ج: المسافة 22'],[4,'نص مباشر']].map(([v,t])=>`<button class="btn ghost" data-a="ptest" data-v="${v}">${t}</button>`).join('')}</div></div>`:''}
 </main>`};

P.cats=()=>head('الأقسام','',true)+`<main class="main"><div class="card"><div class="frow"><label class="f" style="margin:0"><input id="newcat" placeholder="اسم القسم الجديد"></label><button class="btn pri" data-a="addcat">${ic('plus')} إضافة</button></div></div>
 ${DB.cats.length?DB.cats.map(c=>`<div class="li"><div class="gr"><b>${esc(c)}</b><small>${DB.products.filter(p=>p.cat===c).length} منتج</small></div><button class="ib sm bad" data-a="delcat" data-v="${esc(c)}" aria-label="حذف القسم">${ic('trash')}</button></div>`).join(''):empty('list','لا توجد أقسام','الأقسام ترتّب منتجاتك مثل: مشروبات، منظفات، معلبات')}</main>`;

P.log=()=>head('سجل النشاطات',DB.log.length?`<button class="ib" data-a="clearlog" aria-label="مسح السجل">${ic('trash')}</button>`:'',true)+`<main class="main">${DB.log.length?DB.log.map(l=>`<div class="li"><div class="gr"><b style="white-space:normal">${esc(l.x)}</b><small>${dt(l.t)}</small></div></div>`).join(''):empty('eye','السجل فارغ')}</main>`;

/* ============ النوافذ السفلية ============ */
const SH={};
SH.confirm=()=>{const c=ui.confirm||{};return `<h3>${esc(c.msg||'')}</h3><div class="g2"><button class="btn ghost" data-a="back">تراجع</button><button class="btn ${c.bad?'ghost bad':'pri'}" data-a="yes">${esc(c.yes||'نعم')}</button></div>`};
SH.pay=()=>{const sub=cartTotal(carts.sale),t=payTotal(),cu=ui.saleCust&&custById(ui.saleCust);
 return `<h3>إنهاء البيع</h3>${discBox(sub)}<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b>الإجمالي${t<sub?' بعد الخصم':''}</b><span class="tag lg">${money(t)}</span></div>
 ${opt('طريقة الدفع','',seg('paym',ui.pay.method,[['cash','كاش'],['sham','شام كاش'],['mix','الطريقتين']]))}
 ${ui.pay.method==='mix'?`<div class="g2"><label class="f">كاش<input id="pcash" data-i="pmix" inputmode="decimal" value="${roundM(ui.pay.paid-(ui.pay.ps||0))}"></label><label class="f">شام كاش<input id="psham" data-i="pmix" inputmode="decimal" value="${ui.pay.ps||0}" data-focus></label></div><input type="hidden" id="paid" value="${ui.pay.paid}">`
 :`<label class="f">المبلغ المدفوع<input id="paid" data-i="paid" inputmode="decimal" value="${ui.pay.paid}"></label>`}<div class="note" id="rem">${remText()}</div>
 ${LITE?'':opt('الزبون',cu?esc(cu.phone||''):'مطلوب فقط عند وجود دين',`<button class="btn sm" data-a="choosecust">${ic('user')} ${cu?esc(cu.name):'اختيار'}</button>`)}
 <button class="btn pri wide mt" data-a="dosale">${ic('check')} تأكيد البيع</button>`};
function remText(){const t=payTotal(),p=ui.pay.paid;if(p<t)return `المتبقي كدين على الزبون: ${money(roundM(t-p))}`;if(p>t)return `الباقي للزبون: ${money(roundM(p-t))}`;return 'المبلغ مدفوع كاملاً'}
const cpList=()=>{const l=custFiltered(ui.cpq||'');return l.length?l.map(c=>`<button class="li" data-a="pickcust" data-id="${c.id}"><span class="av">${esc(c.name[0])}</span><div class="gr"><b>${esc(c.name)}</b><small>${esc(c.phone||'')}</small></div></button>`).join(''):'<div class="note">لا يوجد زبون مطابق</div>'};
SH.custpick=()=>`<h3>اختيار زبون</h3><div class="srch">${ic('search')}<input data-i="cpq" value="${esc(ui.cpq||'')}" placeholder="ابحث بالاسم أو الهاتف"></div>
 <div id="cplist">${cpList()}</div><div class="g2 mt"><button class="btn ghost" data-a="nocust">بدون زبون</button><button class="btn pri" data-a="newcust" data-v="pick">${ic('plus')} زبون جديد</button></div>`;
SH.custform=p=>{const c=p.id?custById(p.id):{name:'',phone:''};return `<h3>${p.id?'تعديل زبون':'إضافة زبون'}</h3><label class="f">الاسم<input id="cname" value="${esc(c.name)}" data-focus></label>
 <label class="f">رقم الهاتف (اختياري)<input id="cphone" inputmode="tel" value="${esc(c.phone)}"></label><button class="btn pri wide" data-a="savecust">${ic('check')} حفظ الزبون</button>`};
SH.qty=p=>{const it=carts[p.cn][p.i];if(!it)return '';return `<h3>${esc(it.name)}</h3><label class="f">الكمية<input id="qval" inputmode="decimal" value="${it.qty}" data-focus></label>
 <div class="chips">${S().quick.map(v=>`<button class="chip" data-a="qpick" data-v="${v}">${fq(v)}</button>`).join('')}</div>
 ${it.pid?'':`<label class="f">سعر الوحدة<input id="qprice" inputmode="decimal" value="${it.price}"></label>`}<button class="btn pri wide" data-a="qsave">${ic('check')} حفظ</button>`};
SH.manual=()=>`<h3>منتج يدوي</h3><p class="note">يُضاف للفاتورة فقط ولا يُحفظ في المخزون، مثل: توصيل، كيس، خدمة</p>
 <label class="f">الاسم<input id="mname" placeholder="مثال: خدمة توصيل" data-focus></label>
 <div class="frow"><label class="f">سعر الوحدة (${S().cur==='USD'?'$':'ل.س'})<input id="mprice" inputmode="decimal" placeholder="0"></label><label class="f">الكمية<input id="mqty" inputmode="decimal" value="1"></label></div>
 ${S().costOn?'<label class="f">سعر التكلفة (اختياري)<input id="mcost" inputmode="decimal" placeholder="0"></label>':''}<button class="btn pri wide" data-a="addmanual">${ic('cart')} أضف إلى السلة</button>`;
SH.pin=()=>`<h3>تعيين رمز القفل</h3><p class="note">سيُطلب الرمز عند فتح الإعدادات وعرض الأرباح. احفظه جيداً.</p><label class="f">الرمز (4 أرقام على الأقل)<input id="newpin" inputmode="numeric" type="password" maxlength="8" data-focus></label><button class="btn pri wide" data-a="savepin">${ic('lock')} حفظ الرمز</button>`;
SH.unlock=()=>`<h3>أدخل رمز القفل</h3><label class="f"><input id="pinin" inputmode="numeric" type="password" maxlength="8" data-focus></label><button class="btn pri wide" data-a="unlock">فتح</button>`;
SH.paydebt=p=>{const b=balance(p.id);return `<h3>تسجيل دفعة</h3><p class="note">الرصيد المستحق: ${money(b)}</p><label class="f">المبلغ المدفوع<input id="dpay" inputmode="decimal" value="${b}" data-focus></label><button class="btn pri wide" data-a="savedebt" data-id="${p.id}">${ic('check')} تسجيل الدفعة</button>`};
SH.tools=()=>`<h3>الأدوات</h3>
 <button class="li" data-a="backup">${ic('down')}<div class="gr"><b>نسخة احتياطية</b><small>حفظ كل البيانات في ملف واحد</small></div></button>
 <label class="li">${ic('share')}<div class="gr"><b>استعادة نسخة احتياطية</b><small>تستبدل البيانات الحالية بالملف</small></div><input type="file" accept=".json,application/json" data-c="restore" hidden></label>
 <button class="li" data-a="exportcsv">${ic('list')}<div class="gr"><b>تصدير المنتجات</b><small>ملف يفتح في إكسل</small></div></button>
 <label class="li">${ic('box')}<div class="gr"><b>استيراد منتجات</b><small>من ملف CSV بنفس أعمدة ملف التصدير</small></div><input type="file" accept=".csv,text/csv,text/plain" data-c="importcsv" hidden></label>
 <button class="li" data-a="opensheet" data-v="bulk">${ic('tag')}<div class="gr"><b>تعديل الأسعار بالجملة</b><small>رفع أو خفض الأسعار بنسبة مئوية</small></div></button>`;
SH.bulk=()=>`<h3>تعديل الأسعار بالجملة</h3><label class="f">القسم<select id="bcat"><option value="">كل المنتجات</option>${DB.cats.map(c=>`<option>${esc(c)}</option>`).join('')}</select></label>
 <label class="f">النسبة المئوية<input id="bpct" inputmode="decimal" placeholder="مثال: 10" data-focus></label>
 <div class="g2"><button class="btn ghost bad" data-a="bulk" data-v="-1">خفض الأسعار</button><button class="btn pri" data-a="bulk" data-v="1">رفع الأسعار</button></div>`;
SH.rcpt=()=>`<h3>معاينة الإيصال</h3><img id="rcptimg" class="rcpt" alt="معاينة الإيصال"><div class="note">هذا شكل الإيصال على ورق ${S().paper} مم</div>`;
SH.welcome=()=>`<h3>أهلاً بك في الخنساء كاشير</h3><p class="note">خطوات سريعة قبل البدء. يمكنك تغييرها لاحقاً من الإعدادات.</p>
 ${opt('نوع النشاط','',seg('wkind',ui.wk,[['shop','محل'],['rest','مطعم']]))}
 <label class="f mt">اسم ${ui.wk==='rest'?'المطعم':'المتجر'}<input id="w_store" value="${esc(ui.wst)}" placeholder="${ui.wk==='rest'?'مثال: مطعم الأصيل':'مثال: سوبر ماركت الأمل'}"></label><label class="f">سعر صرف الدولار اليوم (ل.س)<input id="w_rate" inputmode="decimal" value="${esc(ui.wr||S().rate)}"></label>
 ${opt('إضافة أصناف مثال','لتجربة التطبيق مباشرة، ويمكن حذفها لاحقاً',sw(ui.ws,'wsample',''))}
 <button class="btn pri wide" data-a="savewelcome">${ic('check')} ابدأ</button>`;
async function drawPreview(id){const s=DB.sales.find(x=>x.id===id);if(!s)return;try{const cv=await receiptCanvas(s),im=$('#rcptimg');if(im)im.src=cv.toDataURL('image/png')}catch(e){}}

SH.ordinfo=()=>{const d=ui.od;
 let h=`<h3>${d.edit?'بيانات الطلب':'طلب جديد'}</h3>${seg('otype',d.type,[['dine','صالة'],['take','سفري'],['del','توصيل']])}`;
 if(d.type==='dine')h+=`<label class="f mt">رقم الطاولة<input id="otable" inputmode="numeric" value="${esc(d.table||'')}"></label><div class="chips" style="flex-wrap:wrap">${Array.from({length:12},(_,i)=>i+1).map(n=>`<button class="chip ${String(d.table)===String(n)?'on':''}" data-a="otab" data-v="${n}">${n}</button>`).join('')}</div>`;
 if(d.type==='del')h+=`<label class="f mt">اسم الزبون<input id="oname" value="${esc(d.name||'')}"></label><label class="f">رقم الهاتف<input id="ophone" inputmode="tel" value="${esc(d.phone||'')}"></label><label class="f">العنوان<input id="oaddr" value="${esc(d.addr||'')}" placeholder="الحي، الشارع، علامة مميزة"></label>${d.edit?'':`<label class="f">أجرة التوصيل (اختياري)<input id="ofee" inputmode="decimal" placeholder="0"></label>`}`;
 if(d.type==='take')h+=`<p class="note mt">طلب سفري يُستلم من المحل.</p>`;
 return h+`<button class="btn pri wide mt" data-a="saveord">${ic(d.edit?'check':'plus')} ${d.edit?'حفظ':'اختيار الأصناف'}</button>`};
SH.kt=()=>{const k=ui.kt;if(!k)return '';return `<h3>ورقة المطبخ: طلب ${k.o.no}</h3><img id="ktimg" class="rcpt" alt="ورقة المطبخ"><div class="g2 mt"><button class="btn ghost" data-a="ktprint">${ic('print')} طباعة</button><button class="btn pri" data-a="back">${ic('check')} تم</button></div>`};
async function drawKitchen(){const k=ui.kt;if(!k)return;try{const cv=await kitchenCanvas(k.o,k.lines,k.add),im=$('#ktimg');if(im)im.src=cv.toDataURL('image/png')}catch(e){}}

SH.report=()=>`<h3>إرسال تقرير</h3>${seg('rper',ui.rper,[['today','اليوم'],['week','آخر 7 أيام'],['month','آخر 30 يوم']])}
 <div class="card mt" style="white-space:pre-wrap;font-size:14px;line-height:1.6">${esc(reportText(ui.rper,locked()))}</div>
 <label class="f">رقم واتساب صاحب المحل<input id="rowner" inputmode="tel" value="${esc(S().owner||'')}"></label>
 <button class="btn wa wide" data-a="sendreport">${ic('wa')} إرسال على واتساب</button>`;
