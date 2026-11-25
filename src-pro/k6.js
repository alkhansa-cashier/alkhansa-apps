/* ============ الطلبات (المطابع، الأثاث) ============ */
NAVI.ords=[L.ordP||'الطلبات','file'];
const oStN=k=>((CFG.oSt||[]).find(x=>x[0]===k)||[,''])[1];
const oBadge=k=>k==='done'?'ok':k==='ready'?'blue':k==='new'?'':'low';
const oTot=o=>Math.round(o.total!=null&&o.total!==''?+o.total:((+o.qty||1)*(+o.unit||0)+(+o.design||0)));
const oPaid=o=>DB.pays.filter(p=>p.ord===o.id).reduce((a,p)=>a+p.amt,0);
const oLate=o=>o.due&&o.st!=='done'&&dOf(o.due)<dOf(today());
const ordLi=o=>`<button class="li" data-a="open" data-v="ord" data-id="${o.id}"><span class="av">${o.no}</span><div class="gr"><b>${esc(o.title||'')} · ${esc(cName(o.cid))}</b><small>${o.due?'التسليم '+o.due:''}${o.sid?' · '+esc((stById(o.sid)||{}).name||''):''} · ${money(oTot(o))}${oTot(o)-oPaid(o)>0?' · باقي '+money(oTot(o)-oPaid(o)):''}</small></div>${oLate(o)?'<span class="badge bad">متأخر</span>':''}<span class="badge ${oBadge(o.st)}">${oStN(o.st)}</span></button>`;
V.ords=()=>{const f=ui.of||'open',q=norm(ui.oq||''),l=DB.ords.filter(o=>(f==='open'?o.st!=='done':f==='late'?oLate(o):o.st===f||f==='all')&&(!q||norm(o.no+' '+(o.title||'')+' '+cName(o.cid)).includes(q))).sort((a,b)=>(a.due||'9').localeCompare(b.due||'9'));
 return head(L.ordP)+`<main class="main"><div class="srch">${ic('search')}<input data-i="oq" value="${esc(ui.oq||'')}" placeholder="رقم الطلب، الزبون، العمل"></div>
 <div class="chips"><button class="chip ${f==='open'?'on':''}" data-a="set" data-k="of" data-v="open" data-r="1">المفتوحة (${DB.ords.filter(o=>o.st!=='done').length})</button><button class="chip ${f==='late'?'on':''}" data-a="set" data-k="of" data-v="late" data-r="1">المتأخرة (${DB.ords.filter(oLate).length})</button>${CFG.oSt.map(([k,t])=>`<button class="chip ${f===k?'on':''}" data-a="set" data-k="of" data-v="${k}" data-r="1">${t} (${DB.ords.filter(o=>o.st===k).length})</button>`).join('')}<button class="chip ${f==='all'?'on':''}" data-a="set" data-k="of" data-v="all" data-r="1">الكل</button></div>
 ${l.slice(0,300).map(ordLi).join('')||empty('file','ما في طلبات')}</main><button class="fab" data-a="ordnew">${ic('plus')} ${L.ord} جديد${L.ord==='طلبية'?'ة':''}</button>`};
IN.oq=v=>{ui.oq=v;render()};
A.ordnew=d=>{const o=c=>{ui.oc=c.id;go('ordform',{},true)};if(d&&d.k)o(cById(d.k));else if(d&&d.id&&cById(d.id))o(cById(d.id));else pickClient(o)};
SH.ordform=p=>{const o=p.id?DB.ords.find(x=>x.id===p.id):{};return `<h3>${p.id?'تعديل '+L.ord+' '+o.no:L.ord+' جديد: '+esc(cName(ui.oc))}</h3>
 <label class="f">اختيار سريع من الأسعار<select id="o_sv" data-a2="1" onchange="A.osv()"><option value="">—</option>${DB.svcs.map(s=>`<option value="${s.id}">${esc(s.n)} · ${money(s.p)}</option>`).join('')}</select></label>
 <div class="g2">${CFG.oF.map(([k,t,ty])=>`<label class="f">${t}<input id="o_${k}" ${ty==='n'?'inputmode="decimal" data-i="otot"':ty==='date'?'type="date"':''} value="${esc(o[k]??(k==='qty'?1:''))}"></label>`).join('')}</div>
 <div class="g2"><label class="f">موعد التسليم<input id="o_due" type="date" value="${esc(o.due||'')}"></label><label class="f">${L.st}<select id="o_sid">${stOpts(o.sid,'—')}</select></label></div>
 <div class="g2"><label class="f">الإجمالي<input id="o_total" inputmode="decimal" value="${p.id?oTot(o):''}" placeholder="بيتحسب لحالو"></label>${p.id?'':`<label class="f">العربون المدفوع<input id="o_dep" inputmode="decimal"></label>`}</div>
 <button class="btn pri wide" data-a="ordsave" data-id="${p.id||''}">${ic('check')} حفظ${p.id?'':' وطباعة الوصل'}</button>`};
A.osv=()=>{const s=svById(val('o_sv'));if(!s)return;const t=$('#o_title');if(t&&!t.value)t.value=s.n;const u=$('#o_unit');if(u)u.value=s.p;IN.otot()};
IN.otot=()=>{const q=num(val('o_qty'))||1,u=num(val('o_unit')),d=num(val('o_design')),e=$('#o_total');if(e)e.placeholder=fmt(q*u+d)};
A.ordsave=d=>{const o={due:val('o_due'),sid:val('o_sid')};CFG.oF.forEach(([k,t,ty])=>o[k]=ty==='n'?num(val('o_'+k)):val('o_'+k));const tv=val('o_total');o.total=tv===''?'':num(tv);if(!o.title)return toast('اكتب العمل / القطعة');
 if(d.id){Object.assign(DB.ords.find(x=>x.id===d.id),o);flush();back();return}
 const r=Object.assign({id:uid(),no:++DB.seq.k,cid:ui.oc,t:Date.now(),st:'new',log:[{t:Date.now(),x:'إنشاء'}]},o);DB.ords.push(r);const tot=oTot(r);
 DB.invs.push({id:uid(),no:++DB.seq.i,cid:r.cid,t:Date.now(),items:[{n:L.ord+' '+r.no+': '+r.title,p:tot,q:1,sid:r.sid}],disc:0,total:tot,ord:r.id});
 const dep=num(val('o_dep'));if(dep>0)DB.pays.push({id:uid(),cid:r.cid,ord:r.id,amt:dep,t:Date.now(),method:'cash',no:++DB.seq.r});logA(L.ord+' '+r.no+': '+r.title);flush();back();go('ord',{id:r.id});prOrd(r)};
P.ord=p=>{const o=DB.ords.find(x=>x.id===p.id);if(!o)return head(L.ord,'',true)+'<main class="main"></main>';const c=cById(o.cid),tot=oTot(o),pd=oPaid(o);
 return head(L.ord+' '+o.no,`<button class="ib" data-a="sheet" data-v="ordform" data-id="${o.id}">${ic('edit')}</button>`,true)+`<main class="main"><div class="card"><div class="kv"><span>الحالة</span><span class="badge ${oBadge(o.st)}">${oStN(o.st)}</span></div><div class="kv"><span>${L.cl}</span><b>${esc(c?c.name:'')} ${esc(c&&c.phone||'')}</b></div>
 ${CFG.oF.filter(([k])=>o[k]!==''&&o[k]!=null).map(([k,t,ty])=>`<div class="kv"><span>${t}</span><b>${esc(ty==='n'&&k!=='qty'?money(o[k]):o[k])}</b></div>`).join('')}${o.due?`<div class="kv"><span>موعد التسليم</span><b style="${oLate(o)?'color:var(--bad)':''}">${o.due}</b></div>`:''}${o.sid?`<div class="kv"><span>${L.st}</span><b>${esc((stById(o.sid)||{}).name||'')}</b></div>`:''}
 <div class="kv"><span>الإجمالي</span><b>${money(tot)}</b></div><div class="kv"><span>المدفوع</span><b style="color:var(--ok)">${money(pd)}</b></div><div class="kv"><span>الباقي</span><b style="color:var(--bad)">${money(Math.max(0,tot-pd))}</b></div></div>
 <div class="pipe">${CFG.oSt.map(([k,t])=>`<button class="btn sm ${o.st===k?'pri':''}" data-a="ost" data-id="${o.id}" data-v="${k}">${t}</button>`).join('')}</div>
 <div class="g2 mt"><button class="btn pri" data-a="opay" data-id="${o.id}">${ic('money')} قبض دفعة</button><button class="btn" data-a="pord" data-id="${o.id}">${ic('print')} طباعة الوصل</button></div>${c&&c.phone?`<button class="btn wa wide mt" data-a="owa" data-id="${o.id}">${ic('wa')} إرسال للزبون</button>`:''}
 <div class="card mt"><h3>${ic('clock')}السجل</h3>${(o.log||[]).map(x=>`<div class="kv"><span>${dt(x.t)}</span><b>${esc(x.x)}</b></div>`).join('')}</div></main>`};
A.ost=d=>{const o=DB.ords.find(x=>x.id===d.id);if(o.st===d.v)return;o.st=d.v;o.log=o.log||[];o.log.unshift({t:Date.now(),x:oStN(d.v)});flush();render();const c=cById(o.cid);if((d.v==='ready'||d.v==='approve')&&c&&c.phone&&confirm('إبلاغ الزبون بالواتساب؟'))A.owa(d)};
A.opay=d=>{const o=DB.ords.find(x=>x.id===d.id),r=Math.max(0,oTot(o)-oPaid(o));const v=prompt('المبلغ المقبوض',r);if(v==null)return;const a=num(v);if(!a)return;const p={id:uid(),cid:o.cid,ord:o.id,amt:a,t:Date.now(),method:'cash',no:++DB.seq.r};DB.pays.push(p);logA('قبض '+money(a)+' '+L.ord+' '+o.no);flush();render();prPay(p)};
A.owa=d=>{const o=DB.ords.find(x=>x.id===d.id),c=cById(o.cid),r=Math.max(0,oTot(o)-oPaid(o));openWA(c.phone,o.st==='approve'?`مرحبا ${c.name} 🌷\nتصميم ${o.title} (طلب ${o.no}) جاهز للمراجعة، نرجو الموافقة أو إرسال التعديلات.\n${S().name||''}`:o.st==='ready'?`مرحبا ${c.name} 🌷\n${L.ord} ${o.title} (رقم ${o.no}) صار${L.ord==='طلبية'?'ت':''} جاهز${L.ord==='طلبية'?'ة':''} ✅${r?'\nالمبلغ المتبقي: '+money(r):''}\n${S().name||''}`:`مرحبا ${c.name}\n${L.ord} رقم ${o.no} (${o.title}): ${oStN(o.st)}\n${S().name||''}`)};
function prOrd(o){const c=cById(o.cid)||{},tot=oTot(o),pd=oPaid(o);doPrint(`<div class="pg">${phd('وصل '+L.ord+' رقم '+o.no)}<div class="pkv"><div>${L.cl}: <b>${esc(c.name||'')}</b></div><div>الهاتف: ${esc(c.phone||'')}</div><div>تاريخ الطلب: ${dt(o.t)}</div><div>موعد التسليم: <b>${esc(o.due||'—')}</b></div></div>
 <table class="pt">${CFG.oF.filter(([k])=>o[k]!==''&&o[k]!=null).map(([k,t,ty])=>`<tr><th style="width:35%">${t}</th><td style="text-align:right">${esc(ty==='n'&&k!=='qty'?money(o[k]):o[k])}</td></tr>`).join('')}<tr><th>الإجمالي</th><td style="text-align:right"><b>${money(tot)}</b></td></tr><tr><th>العربون / المدفوع</th><td style="text-align:right">${money(pd)}</td></tr><tr><th>الباقي عند الاستلام</th><td style="text-align:right"><b>${money(Math.max(0,tot-pd))}</b></td></tr></table>
 <p>${esc(S().terms||'العربون غير مسترد بعد بدء العمل. يرجى إحضار الوصل عند الاستلام.')}</p><div class="sig"><div>توقيع الزبون</div><div>الختم</div></div></div>`)}
A.pord=d=>{const o=DB.ords.find(x=>x.id===d.id);if(o)prOrd(o)};
if(!Array.isArray(DB.ords))DB.ords=[];
/* نهاية k6.js */
