/* ============ p10: تطوير نسخة المحلات (الصلاحيات، التعليق، الإرجاع الجزئي، فاتورة الشراء بالأصناف، PDF، السحابة، البيانات التجريبية) ============ */
const SX=KIND==='shop'&&!LITE;
const r2=x=>Math.round((+x||0)*100)/100;

/* ---------- 1) صلاحيات مفصلة لكل كاشير ---------- */
const PERMS=[['disc','الخصم على الفاتورة'],['price','تعديل سعر المنتج بالسلة'],['debt','البيع بالدين'],['refund','إرجاع الفواتير'],['prod','إضافة وتعديل وحذف المنتجات'],['stock','الجرد وتعديل الكميات'],['buy','فواتير الشراء من الموردين'],['exp','تسجيل المصاريف'],['close','إغلاق الصندوق'],['editpay','تعديل طريقة الدفع بعد البيع'],['cancel','إلغاء البيع وحذف صنف من السلة']];
const can=k=>{const u=curUser();if(!u||u.role==='admin'||ui.unlocked||Date.now()<(ui.pinUntil||0))return true;return !(u.perm&&u.perm[k]===false)};
function need(k,fn){if(can(k))return fn();const t=(PERMS.find(x=>x[0]===k)||[,''])[1];logA(`محاولة بدون صلاحية (${t}): ${curUserName()}`);
 if(ownerPinSet()){toast('هالشغلة بدها رمز صاحب المحل');return guardPin(fn)}toast('ما عندك صلاحية: '+t)}
const wrapA=(n,k,cond)=>{const f=A[n];if(f)A[n]=(d,el,e)=>(!cond||cond(d))?need(k,()=>f(d,el,e)):f(d,el,e)};
[['dsc','disc',d=>+d.v>0],['refund','refund'],['newprod','prod'],['editprod','prod'],['saveprod','prod'],['delprod','prod'],['bulk','prod'],['pcsave','stock'],['newcount','stock'],['savecount','stock'],
 ['savebill','buy'],['savespay','buy'],['saveexp','exp'],['doclose','close'],['editpay','editpay'],['cancelsale','cancel']].forEach(([n,k,c])=>wrapA(n,k,c));
{const fp=CH.dpi,fa=CH.dai;if(fp)CH.dpi=v=>num(v)>0?need('disc',()=>fp(v)):fp(v);if(fa)CH.dai=v=>num(v)>0?need('disc',()=>fa(v)):fa(v)}
{const f=A.qsave;A.qsave=(d,el,e)=>{const p=topE().p,it=carts[p.cn]&&carts[p.cn][p.i];const q=num(($('#qval')||{}).value),pe=$('#qprice');
 if(it&&q<=0)return need('cancel',()=>{logA(`حذف صنف من السلة: ${it.name} × ${fq(it.qty)} (${curUserName()})`);f(d,el,e)});
 if(it&&pe&&num(pe.value)!==it.price)return need('price',()=>{logA(`تعديل سعر بالسلة: ${it.name} من ${fmt(it.price)} إلى ${fmt(num(pe.value))}`);f(d,el,e)});return f(d,el,e)}}
{const f=A.dosale;A.dosale=(d,el,e)=>{const pe=$('#paid');if(pe&&ui.saleCust&&num(pe.value)<payTotal())return need('debt',()=>f(d,el,e));return f(d,el,e)}}
{const f=A.cancelsale;A.cancelsale=(d,el,e)=>{if(carts.sale.length)logA(`طلب إلغاء بيع فيه ${carts.sale.length} صنف بقيمة ${money(cartTotal(carts.sale))} (${curUserName()})`);return f(d,el,e)}}
/* تعديل الكاشير بيحتاج رمز صاحب المحل */
{const f=A.opensheet;A.opensheet=(d,el,e)=>{if(d.v==='userform'){ui.uperm=null;if(ownerPinSet()&&!ui.unlocked)return guardPin(()=>f(d,el,e))}return f(d,el,e)}}
{const f=SH.userform;SH.userform=p=>{let h=f(p);const u=p.id&&S().users.find(x=>x.id===p.id)||{};const role=p.id?(ui.urole||u.role):ui.urole;
 if(!ui.uperm)ui.uperm=Object.assign({},u.perm||{});if(role==='admin')return h;
 const box=`<div class="card" style="margin:10px 0 0;padding:10px 12px"><b>صلاحيات هالكاشير</b><p class="sub" style="margin:4px 0 6px">الشغلة المطفية بيطلب فيها التطبيق رمز صاحب المحل</p>${PERMS.map(([k,t])=>opt(t,'',sw(ui.uperm[k]!==false,'uperm',k))).join('')}</div>`;
 return h.replace('<button class="btn pri wide mt" data-a="saveuser"',box+'<button class="btn pri wide mt" data-a="saveuser"')}}
A.uperm=d=>{ui.uperm[d.k]=ui.uperm[d.k]===false;const n=$('#uname'),pi=$('#upin');const nv=n&&n.value,pv=pi&&pi.value;render();if(n&&$('#uname'))$('#uname').value=nv;if(pi&&$('#upin'))$('#upin').value=pv};
{const f=A.saveuser;A.saveuser=(d,el,e)=>{const name=val('uname'),pin=toLatin(val('upin')).replace(/\D/g,''),pm=Object.assign({},ui.uperm||{});f(d,el,e);
 const u=S().users.find(x=>x.id===d.id)||S().users.find(x=>x.name===name&&x.pin===pin);if(u){u.perm=pm;flush()}}}

/* ---------- 2) تعليق الفاتورة ---------- */
const held=()=>DB.held||(DB.held=[]);
{const f=vPos;vPos=function(){let h=f();if(!SX||S().kind==='rest')return h;if(DB.products.some(p=>p.d)&&!carts.sale.length)h=h.replace('<h2 class="sec">',`<button class="warn" data-a="demodel">${ic('box')}<span style="flex:1">هي بيانات تجريبية للتجربة بس، امسحها قبل ما تبلش شغل</span><u>مسح</u></button><h2 class="sec">`);if(S().hold===false)return h;
 h=h.replace('<button class="btn ghost sm bad" data-a="cancelsale">',`<button class="btn ghost sm" data-a="holdsale">${ic('pause')} تعليق</button><button class="btn ghost sm bad" data-a="cancelsale">`);
 const n=held().length;if(n)h=h.replace('<h2 class="sec">',`<button class="warn" data-a="opensheet" data-v="held">${ic('pause')}<span style="flex:1">فواتير معلقة: ${n}</span><u>عرض</u></button><h2 class="sec">`);return h}}
function holdCur(){if(!carts.sale.length)return false;const c=ui.saleCust&&custById(ui.saleCust);
 held().unshift({id:uid(),t:Date.now(),items:JSON.parse(JSON.stringify(carts.sale)),cid:ui.saleCust||'',name:c?c.name:'زبون '+(held().length+1),by:curUserName()});
 logA(`تعليق فاتورة بقيمة ${money(cartTotal(carts.sale))}`);carts.sale=[];ui.saleCust='';ui.sel='';flush();return true}
A.holdsale=()=>{if(holdCur()){render();toast('تم تعليق الفاتورة، فيك تخدم زبون تاني')}};
SH.held=()=>`<h3>الفواتير المعلقة</h3><p class="note">اضغط على الفاتورة لترجع للسلة. إذا السلة فيها شي، بتتعلق هي كمان.</p>
 ${held().map(x=>`<div class="li" style="margin:0 0 8px"><button class="gr" data-a="heldload" data-id="${x.id}" style="text-align:start;background:none;border:0;color:inherit;font:inherit;padding:0"><b>${esc(x.name)}</b><small>${dt(x.t)} · ${x.items.length} صنف · ${money(cartTotal(x.items))}${x.by?' · '+esc(x.by):''}</small></button><button class="ib sm" data-a="helddel" data-id="${x.id}">${ic('trash')}</button></div>`).join('')||empty('pause','ما في فواتير معلقة')}`;
A.heldload=d=>{const x=held().find(h=>h.id===d.id);if(!x)return;if(carts.sale.length)holdCur();DB.held=held().filter(h=>h.id!==x.id);carts.sale=x.items;ui.saleCust=x.cid||'';flush();back(()=>{tab='pos'});toast('رجعت الفاتورة للسلة')};
A.helddel=d=>need('cancel',()=>ask('حذف الفاتورة المعلقة؟','حذف',()=>{const x=held().find(h=>h.id===d.id);DB.held=held().filter(h=>h.id!==d.id);if(x)logA(`حذف فاتورة معلقة: ${x.name} ${money(cartTotal(x.items))}`);flush()},true));

/* ---------- 3) الإرجاع الجزئي ---------- */
const retLeft=(s,i)=>r3(s.items[i].qty-((s.retq||{})[i]||0));
{const f=P.sale;P.sale=p=>{let h=f(p);const s=DB.sales.find(x=>x.id===p.id);if(!s)return h;
 if(s.ret){const o=DB.sales.find(x=>x.id===s.ret);h=h.replace('<div class="card">',`<div class="warn">${ic('undo')} فاتورة مرتجع جزئي من الفاتورة رقم ${o?o.no:'؟'}، بتنخصم من المبيعات والصندوق</div><div class="card">`);
  return h.replace(/<button class="btn ghost[^"]*" data-a="(editpay|refund|dupsale|pretopen)"[^>]*>.*?<\/button>/g,'')}
 if(SX&&S().pret&&!s.refunded&&s.items.some((_,i)=>retLeft(s,i)>0))h=h.replace('<div class="acts">',`<div class="acts"><button class="btn ghost" data-a="pretopen" data-id="${s.id}">${ic('undo')}إرجاع جزئي</button>`);
 if(s.retq)h=h.replace('<div class="acts">',`<div class="note">عليها إرجاع جزئي: ${s.items.map((it,i)=>(s.retq[i]?`${esc(it.name)} × ${fq(s.retq[i])}`:'')).filter(Boolean).join('، ')}</div><div class="acts">`);return h}}
A.pretopen=d=>need('refund',()=>{ui.prm='cash';open('pret',{id:d.id},true)});
SH.pret=p=>{const s=DB.sales.find(x=>x.id===p.id);if(!s)return '';return `<h3>إرجاع جزئي من الفاتورة ${s.no}</h3><p class="note">اكتب الكمية المرتجعة من كل صنف</p>
 ${s.items.map((it,i)=>{const l=retLeft(s,i);return l>0?`<div class="opt"><div class="gr"><b>${esc(it.name)}</b><small>${money(it.price,s.cur)} · الباقي ${fq(l)}</small></div><input class="inp" id="pr_${i}" inputmode="decimal" placeholder="0" style="width:80px;text-align:center"></div>`:''}).join('')}
 ${opt('رجّعنا المبلغ','',seg('prm',ui.prm||'cash',[['cash','كاش'],['sham','شام كاش']]))}<button class="btn pri wide mt" data-a="prsave" data-id="${s.id}">${ic('undo')} تأكيد الإرجاع</button>`};
A.prm=(d,el)=>{ui.prm=d.v;segOn(el)};
A.prsave=d=>{const s=DB.sales.find(x=>x.id===d.id);if(!s)return back();const k=s.sub>0?s.total/s.sub:1,its=[];
 s.items.forEach((it,i)=>{const e=$('#pr_'+i);if(!e)return;const q=Math.min(retLeft(s,i),r3(num(e.value)));if(q>0)its.push({i,q,it})});
 if(!its.length)return toast('اكتب كمية صنف واحد على الأقل');
 const items=its.map(({q,it})=>Object.assign({pid:it.pid,name:it.name,price:roundM(it.price*k,s.cur),cost:it.cost||0,qty:-q,note:'مرتجع'},it.uq>1?{uq:it.uq}:{}));
 const amt=roundM(items.reduce((a,x)=>a-x.price*x.qty,0),s.cur),done=DB.sales.filter(x=>x.ret===s.id).reduce((a,x)=>a-(x.remaining||0),0),dr=s.cid&&s.remaining>0?Math.min(amt,roundM(s.remaining-done)):0,back$=roundM(amt-dr);
 const r={id:uid(),no:++DB.seq,t:Date.now(),cur:s.cur,rate:s.rate,total:-amt,paid:-back$,remaining:-dr,method:ui.prm||'cash',ps:0,cid:s.cid||'',by:curUserName(),sub:-amt,disc:0,dpct:0,ret:s.id,items};
 s.retq=s.retq||{};for(const {i,q,it} of its){s.retq[i]=r3((s.retq[i]||0)+q);const pr=it.pid&&prodById(it.pid),qq=r3(q*(it.uq||1));if(pr){if(pr.track)pr.stock=r3(pr.stock+qq);pr.sold=Math.max(0,r3((pr.sold||0)-qq))}}
 if(dr>0)DB.ledger.push({id:uid(),cid:s.cid,sid:r.id,amt:-dr,cur:s.cur,t:r.t,note:'إرجاع جزئي من فاتورة رقم '+s.no});
 DB.sales.unshift(r);logA(`إرجاع جزئي من فاتورة ${s.no}: ${money(amt,s.cur)}`);flush();back(()=>{});setTimeout(()=>{open('sale',{id:r.id});toast(`تم الإرجاع: ${money(amt,s.cur)}${back$>0?' رجّع للزبون '+money(back$,s.cur):''}`,4000)},80)};
{const f=refundSale;refundSale=function(s){if(s&&(s.ret||s.retq))return toast(s.ret?'هي فاتورة مرتجع':'على هالفاتورة إرجاع جزئي، كمّل من "إرجاع جزئي"');return f(s)}}

/* ---------- 4) فاتورة شراء بالأصناف (بتزيد المخزون وبتحدّث سعر التكلفة) ---------- */
{const f=P.sup;P.sup=p=>{let h=f(p);if(!SX)return h;const btn=`<button class="btn pri wide" data-a="pinvnew" data-id="${p.id}" style="margin-bottom:10px">${ic('box')} فاتورة شراء بالأصناف (بتزيد المخزون)</button>`;
 return h.replace('<main class="main">','<main class="main">'+btn)}}
A.pinvnew=d=>need('buy',()=>{ui.pi={sid:d.id,lines:[],q:'',paid:'',drawer:true};open('pinv',{id:d.id})});
const piTot=()=>roundM(ui.pi.lines.reduce((a,l)=>a+num(l.q)*num(l.c),0));
function piRes(){const q=norm(ui.pi.q||'');if(!q)return '';const l=DB.products.filter(p=>norm(p.name).includes(q)||(p.barcode||'').includes(q)).slice(0,8);
 return l.map(p=>`<button class="li" data-a="piadd" data-id="${p.id}" style="margin:0 0 6px"><div class="gr"><b>${esc(p.name)}</b><small>المخزون ${p.track?fq(p.stock):'—'} · التكلفة ${p.cost?money(roundM(conv(p.cost,p.ccur||p.cur,S().cur))):'—'}</small></div>${ic('plus')}</button>`).join('')||'<p class="note">ما لقينا منتج بهالاسم، ضيفه من المخزون أول</p>'}
function piLines(){return ui.pi.lines.map((l,i)=>{const p=prodById(l.pid);return `<div class="card" style="padding:10px 12px;margin-bottom:8px"><div class="opt" style="padding:0"><div class="gr"><b>${esc(p?p.name:'')}</b></div><button class="ib sm" data-a="pidel" data-v="${i}">${ic('trash')}</button></div>
 <div class="g2"><label class="f" style="margin:0">الكمية<input data-i="pil" data-k="q" data-n="${i}" inputmode="decimal" value="${esc(l.q)}"></label><label class="f" style="margin:0">تكلفة القطعة<input data-i="pil" data-k="c" data-n="${i}" inputmode="decimal" value="${esc(l.c)}"></label></div></div>`}).join('')}
P.pinv=p=>{const s=DB.suppliers.find(x=>x.id===p.id),pi=ui.pi;if(!s||!pi)return head('فاتورة شراء','',true)+'<main class="main"></main>';
 return head('فاتورة شراء: '+s.name,'',true)+`<main class="main"><div class="srch">${ic('search')}<input data-i="piq" value="${esc(pi.q)}" placeholder="ابحث عن المنتج بالاسم أو الباركود"></div><div id="pires">${piRes()}</div>
 <h2 class="sec">الأصناف <span class="cnt">${pi.lines.length}</span></h2><div id="pilines">${piLines()||empty('box','ابحث عن منتج وضيفه')}</div>
 <div class="card"><div class="kv"><span>إجمالي الفاتورة</span><b id="pitot">${money(piTot())}</b></div><label class="f mt">المدفوع للمورد هلأ<input id="pipaid" inputmode="decimal" placeholder="0 = كلها دين للمورد" value="${esc(pi.paid)}"></label>
 ${opt('المدفوع من صندوق الكاشير','',sw(pi.drawer,'pidr',''))}${opt('سعر التكلفة الجديد','',seg('costmode',S().costMode||'avg',[['avg','المتوسط'],['last','آخر سعر']]))}<label class="f">ملاحظة<input id="pinote" placeholder="رقم فاتورة المورد مثلاً"></label></div>
 <div style="height:80px"></div></main><button class="fab" data-a="pisave">${ic('check')} حفظ الفاتورة</button>`};
IN.piq=v=>{ui.pi.q=v;$('#pires').innerHTML=piRes()};
IN.pil=(v,el)=>{const l=ui.pi.lines[+el.dataset.n];if(l)l[el.dataset.k]=v;const t=$('#pitot');if(t)t.textContent=money(piTot())};
const piKeep=()=>{const e=$('#pipaid');if(e&&ui.pi)ui.pi.paid=e.value};
A.piadd=d=>{piKeep();const p=prodById(d.id);if(!p)return;if(!ui.pi.lines.some(l=>l.pid===p.id))ui.pi.lines.push({pid:p.id,q:'1',c:p.cost?String(r2(conv(p.cost,p.ccur||p.cur,S().cur))):''});ui.pi.q='';render()};
A.pidel=d=>{piKeep();ui.pi.lines.splice(+d.v,1);render()};
A.pidr=()=>{piKeep();ui.pi.drawer=!ui.pi.drawer;render()};
A.costmode=d=>{piKeep();S().costMode=d.v;save();render()};
A.pisave=()=>need('buy',()=>{const pi=ui.pi,s=DB.suppliers.find(x=>x.id===pi.sid),cur=S().cur;const ls=pi.lines.filter(l=>num(l.q)>0);if(!ls.length)return toast('ضيف صنف واحد على الأقل بكمية');
 if(ls.some(l=>!(num(l.c)>0)))return toast('اكتب تكلفة كل صنف');const tot=piTot(),pd=Math.min(tot,num(val('pipaid'))),t=Date.now(),avg=(S().costMode||'avg')==='avg';
 for(const l of ls){const p=prodById(l.pid);if(!p)continue;const q=num(l.q),cc=p.ccur||p.cur,nc=conv(num(l.c),cur,cc),s0=p.track?Math.max(0,p.stock):0,oc=+p.cost||0;
  p.cost=r2(avg&&oc>0&&s0>0?(s0*oc+q*nc)/(s0+q):nc);p.ccur=cc;if(p.track)p.stock=r3(p.stock+q);else{p.track=true;p.stock=q}}
 const note=`فاتورة شراء ${ls.length} صنف${val('pinote')?' · '+val('pinote'):''}`;
 DB.sledger.push({id:uid(),sid:pi.sid,amt:tot,cur,note,items:ls.map(l=>({pid:l.pid,name:(prodById(l.pid)||{}).name||'',q:num(l.q),c:num(l.c)})),t});
 if(pd>0)DB.sledger.push({id:uid(),sid:pi.sid,amt:-pd,cur,note:'دفعة مع الفاتورة',t:t+1,drawer:!!pi.drawer});
 logA(`فاتورة شراء بالأصناف من ${s?s.name:''}: ${money(tot)}`);ui.pi=null;flush();back();toast('تم حفظ الفاتورة وزاد المخزون')});

/* ---------- 5) تقرير PDF ---------- */
{const f=salesView;salesView=function(){let h=f();if(LITE||ownerLocked())return h;
 return h.replace(/(<div class="chips"[^>]*>[\s\S]*?<\/div>)/,`$1<div style="display:flex;justify-content:flex-end;margin:-2px 0 8px"><button class="btn ghost sm" data-a="pdfrep">${ic('down')} تقرير PDF (${esc(plabel(ui.period||'today'))})</button></div>`)}}
function repData(k){const [st,en]=prange(k),cur=S().cur,o={n:0,rev:0,cash:0,sham:0,debt:0,disc:0,profit:0,ret:0,retN:0,ref:0,refN:0,top:{},list:[]};
 for(const s of DB.sales){if(s.t<st||s.t>en)continue;if(s.refunded){o.refN++;o.ref+=conv(s.total,s.cur,cur,s.rate);continue}const c=v=>conv(v,s.cur,cur,s.rate);
  if(s.ret){o.retN++;o.ret-=c(s.total)}else o.n++;o.rev+=c(s.total);o.cash+=c(cashPart(s));o.sham+=c(shamPart(s));o.debt+=c(s.remaining||0);o.disc+=c(s.disc||0);
  for(const i of s.items){if(i.cost>0)o.profit+=c((i.price-i.cost)*i.qty);const t=o.top[i.name]||(o.top[i.name]={q:0,v:0});t.q+=i.qty;t.v+=c(i.price*i.qty)}o.profit-=c(s.disc||0);o.list.push(s)}
 o.exp=expTotal(st,en);o.ecat={};for(const e of DB.expenses)if(e.t>=st&&e.t<=en)o.ecat[e.cat]=(o.ecat[e.cat]||0)+conv(e.amt,e.cur,cur);o.st=st;o.en=en;return o}
async function repPDF(k){const o=repData(k),W=1240,H=1754,M=80,pages=[];let cv,x,y;const FN='Tahoma, "Segoe UI", Arial, sans-serif';
 const T=(s,px,py,sz,al,col,bold)=>{x.font=`${bold?'bold ':''}${sz}px ${FN}`;x.fillStyle=col||'#121A2B';x.textAlign=al||'right';x.fillText(String(s),px,py)};
 const page=()=>{cv=document.createElement('canvas');cv.width=W;cv.height=H;x=cv.getContext('2d');x.direction='rtl';x.fillStyle='#fff';x.fillRect(0,0,W,H);pages.push(cv);
  x.fillStyle='#14233F';x.fillRect(0,0,W,120);T(S().store||APPNAME,W-M,72,40,'right','#fff',1);T('تقرير المبيعات',M,72,30,'left','#F2A71B',1);y=170;
  x.fillStyle='#5E6A80';x.textAlign='center';x.font=`20px ${FN}`;x.fillText(`${APPNAME} · صفحة ${pages.length}`,W/2,H-40)};
 const need_=h=>{if(y+h>H-90)page()};
 const sec=t=>{need_(70);y+=14;T(t,W-M,y+30,30,'right','#14233F',1);x.fillStyle='#F2A71B';x.fillRect(W-M-120,y+42,120,5);y+=66};
 const row=(cols,ws,o2)=>{o2=o2||{};need_(48);if(o2.bg){x.fillStyle=o2.bg;x.fillRect(M,y,W-2*M,46)}let cx=W-M-12;cols.forEach((c,i)=>{const w=ws[i]*(W-2*M-24);const al=i===0?'right':'left';T(c,al==='right'?cx:cx-w+12,y+32,o2.sz||24,al,o2.col,o2.bold);cx-=w});x.fillStyle='#DCE1EA';x.fillRect(M,y+46,W-2*M,1);y+=48};
 page();const m=v=>money(roundM(v));
 T(`الفترة: ${plabel(k)}  (${isoD(o.st||Date.now())} ← ${isoD(Math.min(o.en,Date.now()))})`,W-M,y,26,'right','#5E6A80');T('تاريخ الطباعة: '+dt(Date.now()),M,y,22,'left','#5E6A80');y+=40;
 const net=S().costOn?o.profit-o.exp:o.rev-o.exp,kp=[['عدد الفواتير',fmt(o.n)],['المبيعات',m(o.rev)],['كاش',m(o.cash)],['شام كاش',m(o.sham)+(o.shu>0?` (منها $${fmt(Math.round(o.shu*100)/100)})`:'')],['ديون جديدة',m(o.debt)],['الخصومات',m(o.disc)],['المرتجعات',`${o.retN+o.refN} · ${m(o.ret+o.ref)}`],['المصاريف',m(o.exp)]].concat(S().costOn?[['ربح البيع',m(o.profit)]]:[]).concat([['الصافي',m(net)]]);
 const bw=(W-2*M-30)/2;kp.forEach(([a,b],i)=>{const cx=W-M-(i%2)*(bw+30),cy=y+Math.floor(i/2)*92;x.fillStyle=i===kp.length-1?'#14233F':'#EEF1F6';x.fillRect(cx-bw,cy,bw,80);T(a,cx-18,cy+32,22,'right',i===kp.length-1?'#F2A71B':'#5E6A80');T(b,cx-18,cy+66,30,'right',i===kp.length-1?'#fff':'#121A2B',1)});
 y+=Math.ceil(kp.length/2)*92+10;
 const top=Object.entries(o.top).filter(([,v])=>v.q>0).sort((a,b)=>b[1].v-a[1].v).slice(0,15);
 if(top.length){sec('الأكثر مبيعاً');row(['المنتج','الكمية','القيمة'],[.6,.15,.25],{bold:1,bg:'#EEF1F6'});top.forEach(([n,v])=>row([n.slice(0,40),fq(r3(v.q)),m(v.v)],[.6,.15,.25]))}
 const ec=Object.entries(o.ecat).sort((a,b)=>b[1]-a[1]);if(ec.length){sec('المصاريف حسب النوع');ec.forEach(([n,v])=>row([n,m(v)],[.7,.3]))}
 sec(`الفواتير (${o.list.length})`);row(['رقم','الوقت','الأصناف','الدفع','الإجمالي'],[.12,.3,.14,.2,.24],{bold:1,bg:'#EEF1F6'});
 for(const s of o.list.slice(0,600))row([s.no+(s.ret?' ↩':''),dt(s.t),String(s.items.length),s.method==='sham'?'شام كاش':s.method==='mix'?'الطريقتين':'كاش',money(s.total,s.cur)],[.12,.3,.14,.2,.24],{col:s.total<0?'#C93B2B':null});
 if(o.list.length>600)row([`و${o.list.length-600} فاتورة كمان…`],[1]);
 const imgs=pages.map(c=>{const b=atob(c.toDataURL('image/jpeg',.72).split(',')[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return {b:u,w:W,h:H}});return pdfBytes(imgs)}
function pdfBytes(imgs){const enc=new TextEncoder(),parts=[],offs=[];let len=0;const push=v=>{const u=typeof v==='string'?enc.encode(v):v;parts.push(u);len+=u.length};
 const obj=(id,body)=>{offs[id]=len;push(id+' 0 obj\n'+body+'\nendobj\n')};push('%PDF-1.4\n');
 obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,`<< /Type /Pages /Kids [${imgs.map((_,i)=>(3+3*i)+' 0 R').join(' ')}] /Count ${imgs.length} >>`);
 imgs.forEach((im,i)=>{const p=3+3*i,cs=`q 595 0 0 842 0 0 cm /Im${i} Do Q`;obj(p,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im${i} ${p+2} 0 R >> >> /Contents ${p+1} 0 R >>`);
  obj(p+1,`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);offs[p+2]=len;push(`${p+2} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.b.length} >>\nstream\n`);push(im.b);push('\nendstream\nendobj\n')});
 const n=3+3*imgs.length,xr=len;let t=`xref\n0 ${n}\n0000000000 65535 f \n`;for(let i=1;i<n;i++)t+=String(offs[i]).padStart(10,'0')+' 00000 n \n';push(t+`trailer\n<< /Size ${n} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF\n`);
 const out=new Uint8Array(len);let o=0;for(const p of parts){out.set(p,o);o+=p.length}return out}
const u8b64=u=>{let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s)};
A.pdfrep=async()=>{if(ownerLocked())return open('unlock',{},true);toast('عم نجهّز التقرير…',8000);try{const k=ui.period||'today',u=await repPDF(k);window.__lastPdf=u;
 await shareFile(`تقرير-${(S().store||'المحل').replace(/[\\/:*?"<>|\s]+/g,'-')}-${isoD(Date.now())}.pdf`,'application/pdf',u8b64(u),true);logA('تصدير تقرير PDF: '+plabel(k));toast('جاهز التقرير ✅')}catch(e){toast('ما زبط تجهيز التقرير: '+(e&&e.message||e),5000)}};

/* ---------- 6) التقرير اليومي ---------- */
{const f=notices;notices=function(){let h=f();const now=new Date(),add=[];
 if(S().repDay&&isAdminView()&&!LITE&&now.getHours()>=(+S().repHour||22)&&S().lastRepD!==dday(Date.now()))add.push(`<button class="warn" data-a="repnow" data-v="today">${ic('chart')}<span style="flex:1">صار وقت التقرير اليومي، ابعته لصاحب المحل</span><u>إرسال</u></button>`);
 if(DB.products.some(p=>p.d))add.push(`<button class="warn" data-a="demodel">${ic('box')}<span style="flex:1">هي بيانات تجريبية للتجربة بس، امسحها قبل ما تبلش شغل</span><u>مسح</u></button>`);
 return add.join('')+h}}
{const f=A.sendreport;A.sendreport=(d,el,e)=>{const k=ui.rper;f(d,el,e);if(k==='today'&&S().owner){S().lastRepD=dday(Date.now());save()}}}
A.rephour=d=>{S().repHour=+d.v;save();render()};

/* ---------- 7) النسخ الاحتياطي السحابي (Google Drive عن طريق لوحة الخنساء) ---------- */
const ckey=()=>{if(!DB.lic.ck){DB.lic.ck=String(100000+Math.floor(Math.random()*900000));flush()}return DB.lic.ck};
async function cloudUp(force){if(LITE||!ADMIN_URL||!DB.ready||ui.cloudBusy)return false;if(!force&&(S().cloud===false||!navigator.onLine||(S().cloudAt&&dday(S().cloudAt)===dday(Date.now()))))return false;
 ui.cloudBusy=1;try{const data=JSON.stringify(Object.assign({kh:'backup',v:VERSION},DB));
  const r=await (await fetch(ADMIN_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({a:'bk',dev:DB.lic.dev,key:ckey(),store:S().store||'',kind:EDITION,data})})).json();
  if(r&&r.ok&&r.bk){S().cloudAt=Date.now();S().cloudErr='';flush();return true}S().cloudErr=(r&&r.msg&&r.msg!=='no dev')?r.msg:'لوحة الخنساء لسا ما فيها خاصية النسخ السحابي';flush();return false}
 catch(e){S().cloudErr='تعذّر الاتصال بالإنترنت';flush();return false}finally{ui.cloudBusy=0}}
setTimeout(()=>cloudUp(),20000);setInterval(()=>cloudUp(),3600e3);
{const f=A.doclose;A.doclose=(d,el,e)=>{const n=DB.closes.length;f(d,el,e);if(DB.closes.length>n)setTimeout(()=>cloudUp(true),1500)}}
A.cloudtg=()=>{S().cloud=S().cloud===false;flush();render();if(S().cloud!==false)cloudUp()};
A.cloudnow=async()=>{if(!navigator.onLine)return toast('ما في إنترنت');toast('عم نرفع النسخة…',9000);const ok=await cloudUp(true);toast(ok?'انرفعت النسخة على السحابة ✅':'ما انرفعت: '+(S().cloudErr||''),5000);render()};
SH.cloudget=()=>`<h3>استرجاع نسخة من السحابة</h3><p class="note">اكتب رقم الجهاز القديم ورمز الاسترجاع تبعه (موجودين بالإعدادات بالجهاز القديم، أو اطلبهم من الدعم الفني).</p>
 <label class="f">رقم الجهاز<input id="cg_dev" inputmode="numeric" value="${esc(DB.lic.dev)}"></label><label class="f">رمز الاسترجاع<input id="cg_key" inputmode="numeric" maxlength="6"></label>
 <button class="btn pri wide" data-a="cloudget">${ic('down')} جيب النسخة</button>`;
A.cloudget=async()=>{const dev=toLatin(val('cg_dev')).replace(/\D/g,''),key=toLatin(val('cg_key')).replace(/\D/g,'');if(!dev||key.length<6)return toast('اكتب رقم الجهاز ورمز الاسترجاع (6 أرقام)');
 if(!navigator.onLine)return toast('ما في إنترنت');toast('عم نجيب النسخة…',9000);let r;try{r=await (await fetch(`${ADMIN_URL}?a=bkget&dev=${dev}&key=${key}`)).json()}catch(e){return toast('تعذّر الاتصال')}
 if(!r||!r.ok||!r.data)return toast((r&&r.msg&&r.msg!=='no dev')?r.msg:'ما لقينا نسخة لهالجهاز',5000);let x;try{x=JSON.parse(r.data)}catch(e){return toast('النسخة تالفة')}if(!x||!x.settings)return toast('النسخة تالفة');
 back(()=>{});setTimeout(()=>ask(`لقينا نسخة بتاريخ ${dt(r.t)} (${(x.sales||[]).length} فاتورة، ${(x.products||[]).length} منتج). استبدال كل البيانات الحالية فيها؟`,'استرجاع',()=>{restoreData(x);logA('استرجاع نسخة من السحابة')},true),80)};

/* ---------- 8) البيانات التجريبية ---------- */
function rng(a){return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const DEMO_P=[['سكر 1 كغ',150,120,'مونة'],['رز مصري 1 كغ',180,140,'مونة'],['رز بسمتي 2 كغ',520,430,'مونة'],['زيت دوار الشمس 1 لتر',260,215,'مونة'],['برغل خشن 1 كغ',110,85,'مونة'],['عدس أحمر 1 كغ',160,125,'مونة'],['شاي سيلاني 400 غ',350,290,'مونة'],['قهوة بالهيل 200 غ',300,240,'مونة'],['معكرونة 500 غ',65,48,'مونة'],['رب البندورة 800 غ',140,110,'معلبات'],['تونة 160 غ',120,95,'معلبات'],['حمص حب معلب',70,52,'معلبات'],['حليب بودرة 900 غ',780,690,'ألبان'],['لبنة 1 كغ',240,190,'ألبان'],['جبنة بيضاء 1 كغ',420,350,'ألبان'],['بيض (طبق 30)',380,330,'ألبان'],['مياه 1.5 لتر',50,35,'مشروبات'],['عصير برتقال 1 لتر',130,100,'مشروبات'],['كولا 330 مل',60,42,'مشروبات'],['شيبس عائلي',90,65,'سكاكر'],['بسكويت شاي',45,32,'سكاكر'],['شوكولا بالبندق',110,82,'سكاكر'],['محارم 500 ورقة',130,100,'منظفات'],['مسحوق غسيل 3 كغ',650,540,'منظفات'],['سائل جلي 1 لتر',120,90,'منظفات'],['شامبو 400 مل',230,180,'منظفات']];
function demoSeed(){const R=rng(20261124),pick=a=>a[Math.floor(R()*a.length)],ri=(a,b)=>a+Math.floor(R()*(b-a+1)),D=864e5,now=Date.now(),t0=new Date();t0.setHours(0,0,0,0);
 const P0=DEMO_P.map(([name,price,cost,cat],i)=>({id:'dm'+i+uid(),name,barcode:'62100'+String(1000000+i*7919).slice(-7),price,cur:'SYP',cost,ccur:'SYP',track:true,stock:0,cat,sold:0,t:now-40*D+i,d:1}));
 P0.forEach(p=>{DB.products.push(p);if(!DB.cats.includes(p.cat))DB.cats.push(p.cat)});
 const C0=[['أبو أحمد','0944123456'],['أم خالد','0933221144'],['محل الأمانة','0955667788'],['أبو سامر','0988112233'],['مطعم الريف','0966554433'],['أبو علي','0999887766']].map(([name,phone],i)=>({id:'dc'+i+uid(),name,phone,t:now-35*D,d:1}));C0.forEach(c=>DB.customers.push(c));
 const S0=[['شركة الشرق للمواد الغذائية','0112233445'],['مؤسسة النظافة','0113344556'],['موزع المشروبات أبو ماهر','0944556677']].map(([name,phone],i)=>({id:'ds'+i+uid(),name,phone,t:now-35*D,d:1}));S0.forEach(s=>DB.suppliers.push(s));
 const sold={},cnt={},by=S().users.length?S().users[0].name:(S().cashier||'');const sales=[];
 for(let day=30;day>=0;day--){const base=t0.getTime()-day*D,n=day===0?Math.min(ri(10,18),Math.max(0,new Date().getHours()-8)):ri(12,24);let dc=0;
  for(let k=0;k<n;k++){const t=base+ri(9,21)*3600e3+ri(0,59)*6e4;if(t>now-6e4)continue;const its=[],m=ri(1,4);
   for(let j=0;j<m;j++){const p=pick(P0);if(its.some(x=>x.pid===p.id))continue;const q=R()<.75?1:ri(2,4);its.push({pid:p.id,name:p.name,price:p.price,cost:p.cost,qty:q,note:''});sold[p.id]=(sold[p.id]||0)+q}
   const sub=its.reduce((a,i)=>a+i.price*i.qty,0),disc=R()<.07?Math.round(sub*.05):0,total=sub-disc,r=R();let method='cash',paid=total,ps=0,cid='';
   if(r<.2)method='sham';else if(r<.27){method='mix';ps=Math.round(total*.5)}else if(r<.32){cid=pick(C0).id;paid=Math.round(total*.4/10)*10;dc++}
   sales.push({id:uid()+k,t,cur:'SYP',rate:S().rate,total,paid,remaining:total-paid,method,ps,cid,by,sub,disc,dpct:disc?5:0,whole:false,items:its,d:1})}
  if(day%7===3)DB.expenses.push({id:uid(),amt:ri(3,8)*100,cur:'SYP',cat:'مواصلات',note:'نقل بضاعة',t:base+17*3600e3,drawer:true,d:1});
  if(day%10===5)DB.expenses.push({id:uid(),amt:ri(8,15)*100,cur:'SYP',cat:'كهرباء',note:'أمبيرات',t:base+12*3600e3,drawer:true,d:1});
  if(day===28)DB.expenses.push({id:uid(),amt:25000,cur:'SYP',cat:'إيجار',note:'إيجار المحل',t:base+11*3600e3,drawer:false,d:1});
  if(day%6===2){const s=pick(S0),a=ri(30,90)*1000;DB.sledger.push({id:uid(),sid:s.id,amt:a,cur:'SYP',note:'فاتورة بضاعة',t:base+10*3600e3,d:1});DB.sledger.push({id:uid(),sid:s.id,amt:-Math.round(a*.6),cur:'SYP',note:'دفعة مع الفاتورة',t:base+10*3600e3+1,drawer:true,d:1})}}
 sales.sort((a,b)=>a.t-b.t);for(const s of sales){s.no=++DB.seq;if(s.remaining>0&&s.cid)DB.ledger.push({id:uid(),cid:s.cid,sid:s.id,amt:s.remaining,cur:'SYP',t:s.t,note:'فاتورة رقم '+s.no,d:1})}
 C0.slice(0,3).forEach((c,i)=>{const owe=DB.ledger.filter(l=>l.cid===c.id).reduce((a,l)=>a+l.amt,0);if(owe>200)DB.ledger.push({id:uid(),cid:c.id,amt:-Math.round(owe/2/10)*10,cur:'SYP',t:now-(i+2)*D,note:'دفعة',d:1})});
 DB.sales=sales.reverse().concat(DB.sales).sort((a,b)=>b.t-a.t);
 P0.forEach((p,i)=>{p.sold=sold[p.id]||0;p.stock=i%9===4?ri(1,3):ri(12,60)});
 for(let day=30;day>=1;day--){const e=t0.getTime()-day*D+23*3600e3,st=e-D;let c=0;for(const s of DB.sales)if(s.d&&s.t>st&&s.t<=e)c+=cashPart(s);
  for(const x of DB.expenses)if(x.d&&x.drawer&&x.t>st&&x.t<=e)c-=x.amt;for(const l of DB.sledger)if(l.d&&l.drawer&&l.amt<0&&l.t>st&&l.t<=e)c+=l.amt;for(const l of DB.ledger)if(l.d&&l.amt<0&&!l.sid&&l.t>st&&l.t<=e)c-=l.amt;
  const diff=day%11===0?-ri(1,5)*100:0;DB.closes.unshift({t:e,exp:roundM(c),cnt:roundM(c+diff),diff,cur:'SYP',by,d:1})}
 DB.closes.sort((a,b)=>b.t-a.t);if(!S().costOn)S().costOn=true;logA('تعبئة بيانات تجريبية');flush()}
function demoClear(){const K=['products','customers','suppliers','sales','ledger','sledger','expenses','closes','held','offers','quotes','vouchers'];
 for(const k of K)if(Array.isArray(DB[k]))DB[k]=DB[k].filter(x=>!x.d);DB.cats=DB.cats.filter(c=>DB.products.some(p=>p.cat===c)||!DEMO_P.some(x=>x[3]===c));
 DB.seq=DB.sales.reduce((a,s)=>Math.max(a,s.no||0),0);carts.sale=carts.sale.filter(i=>!i.pid||prodById(i.pid));carts.quick=carts.quick.filter(i=>!i.pid||prodById(i.pid));
 logA('مسح البيانات التجريبية');flush()}
A.demoadd=()=>ask('تعبئة منتجات وزبائن وفواتير شهر كامل للتجربة؟ (بتنمسح بكبسة وحدة بعدين)','تعبئة',()=>{demoSeed();toast('تمت تعبئة البيانات التجريبية')});
A.demodel=()=>ask('مسح كل البيانات التجريبية (المنتجات والفواتير والزبائن التجريبيين)؟ بياناتك الحقيقية ما بتتأثر.','مسح',()=>{demoClear();toast('انمسحت البيانات التجريبية، بالتوفيق 🌹')},true);
{const f=seed;seed=function(kind){if(EDITION==='shop'&&kind!=='rest')return demoSeed();return f(kind)}}
if(EDITION==='shop'&&ui.ws===undefined)ui.ws=true;

/* ---------- 9) الإعدادات ---------- */
{const f=setView;setView=function(){let h=f();if(LITE)return h;const s=S();
 const cloud=card('النسخ السحابي (Google Drive)','نسخة من بياناتك بتنحفظ كل يوم على السحابة، إذا ضاع الجهاز أو انكسر بترجّعها',`${opt('نسخة يومية تلقائية','',sw(s.cloud!==false,'cloudtg',''))}
  <div class="kv"><span>آخر نسخة</span><b>${s.cloudAt?dt(s.cloudAt):'لسا ما انرفعت'}</b></div>${s.cloudErr?`<p class="note" style="color:var(--bad)">${esc(s.cloudErr)}</p>`:''}
  <div class="kv"><span>رقم الجهاز</span><b class="num">${esc(DB.lic.dev)}</b></div><div class="kv"><span>رمز الاسترجاع</span><b class="num">${ckey()}</b></div><p class="note">احتفظ بالرقمين، بتحتاجهن لترجّع النسخة على جهاز جديد</p>
  <div class="g2 mt"><button class="btn ghost" data-a="cloudnow">${ic('share')} ارفع نسخة هلأ</button><button class="btn ghost" data-a="opensheet" data-v="cloudget">${ic('down')} استرجاع</button></div>`);
 const ex=SX?card('مميزات المحل','شغّل يلي بتحتاجه',`${opt('تعليق الفواتير','بتوقف فاتورة زبون وبتخدم غيره وبترجعلها',sw(s.hold!==false,'tgon','hold'))}${opt('الإرجاع الجزئي','إرجاع قطعة أو أكتر من الفاتورة بدل الفاتورة كلها',sw(s.pret,'tg','pret'))}
  ${opt('التقرير اليومي','تذكير كل يوم ببعت تقرير اليوم لصاحب المحل واتساب',sw(s.repDay,'tg','repDay'))}${s.repDay?opt('وقت التذكير','',seg('rephour',s.repHour||22,[[20,'8 م'],[21,'9 م'],[22,'10 م'],[23,'11 م']])):''}
  ${EDITION==='shop'?opt('البيع بالوحدات (جملة)','أول ما تكبس على المنتج بيسألك: قطعة، كرتونة، طرد… حسب ما بتحدد لكل منتج',sw(s.units,'tg','units')):''}${opt('سعر التكلفة بفواتير الشراء','',seg('costmode',s.costMode||'avg',[['avg','المتوسط'],['last','آخر سعر']]))}`):'';
 const demo=EDITION==='shop'?card('البيانات التجريبية','منتجات وزبائن وفواتير شهر كامل لتجرّب التطبيق، وبتنمسح بكبسة',DB.products.some(p=>p.d)?`<button class="btn ghost bad wide" data-a="demodel">${ic('trash')} مسح البيانات التجريبية</button>`:`<button class="btn ghost wide" data-a="demoadd">${ic('plus')} تعبئة بيانات تجريبية</button>`):'';
 const mk='<div class="card"><h3>الدعم الفني</h3>';return h.includes(mk)?h.replace(mk,ex+cloud+demo+mk):h+ex+cloud+demo}}
A.tgon=d=>{S()[d.k]=S()[d.k]===false;save();render()};
window.__k10={repData,repPDF,pdfBytes,demoSeed,demoClear,cloudUp,can,held,ui,render:()=>render(),flush:()=>flush(),open:(a,b,c)=>open(a,b,c),home:t=>home(t)};
/* نهاية p10.js */
