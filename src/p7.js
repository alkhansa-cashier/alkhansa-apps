/* ============ نسخ الموبايلات والصيدليات ============ */
const PHONE=EDITION==='phone',PHARM=EDITION==='pharm'||EDITION==='vet';
/* ورقة حرارية بسيطة من أسطر */
function linesCanvas(rows){const W=S().paper===58?384:576,k=W/576,pad=Math.round(18*k);let y=pad;const ops=[];
 for(const r of rows){if(r==='-'){y+=10*k;ops.push({l:1,y});y+=14*k;continue}const sz=Math.round((r.s||24)*k);y+=sz*1.35;ops.push(Object.assign({y,sz},r))}
 const cv=document.createElement('canvas');cv.width=W;cv.height=Math.ceil(y+pad);const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,cv.height);x.fillStyle='#000';x.direction='rtl';
 for(const o of ops){if(o.l){x.fillRect(pad,o.y,W-2*pad,Math.max(1,2*k));continue}x.font=`${o.b?'bold ':''}${o.sz}px Tahoma, Arial, sans-serif`;
  if(o.v!=null){x.textAlign='right';x.fillText(o.t,W-pad,o.y);x.textAlign='left';x.fillText(String(o.v),pad,o.y)}else{x.textAlign=o.c?'center':'right';x.fillText(o.t,o.c?W/2:W-pad,o.y)}}
 return cv}
async function printLines(rows){const cv=linesCanvas(rows);try{if(DESK()){await deskPrint(cv,S().wprinter);return}if(!canBLE())return toast('الطباعة غير متاحة');if(!ble.c.ch)await bleConnect('c');await blePrint(escStarBytes(cv),'c');toast('تمت الطباعة')}catch(e){toast('تعذّرت الطباعة: تأكد من الطابعة'+errT(e),7000)}}
/* بيع سريع بصنف يدوي (للصيانة وغيرها) */
function quickSale(name,amt,method){const keep=carts.sale.slice();carts.sale.splice(0,carts.sale.length,{pid:'',name,price:amt,cost:0,qty:1});const s=makeSale(amt,method||'cash','',null);carts.sale.splice(0,carts.sale.length,...keep);flush();return s}

/* ================= محلات الموبايلات ================= */
const MST=[['in','مستلم'],['work','قيد الإصلاح'],['ready','جاهز للتسليم'],['done','مُسلّم'],['fail','ما انصلح']];
const mstName=k=>(MST.find(x=>x[0]===k)||[,''])[1];
const mstBadge=k=>({in:'neu',work:'low',ready:'ok',done:'',fail:'out'})[k]||'';
function vMnt(){if(!DB.mnt)DB.mnt=[];const f=ui.mf||'open',q=norm(ui.mq||'');
 const l=DB.mnt.filter(m=>(f==='open'?!['done','fail'].includes(m.st):f==='all'||m.st===f)&&(!q||norm(m.name+' '+m.phone+' '+m.dev+' '+(m.imei||'')+' '+m.no).includes(q))).sort((a,b)=>b.t-a.t);
 const cnt=k=>DB.mnt.filter(m=>m.st===k).length;
 return head('الصيانة',rateChip())+`<main class="main">${licBanner()}
 <div class="g2">${[['in','مستلم'],['work','قيد الإصلاح'],['ready','جاهز'],['done','مُسلّم']].map(([k,t])=>`<div class="card" style="margin:0;padding:12px"><small style="color:var(--mut)">${t}</small><div style="font-size:22px;font-weight:800">${cnt(k)}</div></div>`).join('')}</div>
 <div class="g2 mt"><button class="btn ghost" data-a="open" data-v="imei">${ic('search')} بحث IMEI / كفالة</button><button class="btn ghost" data-a="opensheet" data-v="usedform">${ic('plus')} شراء جهاز مستعمل</button></div>
 <div class="srch mt">${ic('search')}<input data-i="mq" value="${esc(ui.mq||'')}" placeholder="ابحث بالاسم أو الهاتف أو الجهاز أو رقم الوصل"></div>
 <div class="chips">${[['open','المفتوحة'],['ready','الجاهزة'],['done','المسلّمة'],['all','الكل']].map(([k,t])=>`<button class="chip ${f===k?'on':''}" data-a="uset" data-k="mf" data-v="${k}">${t}</button>`).join('')}</div>
 <div id="mntl">${mntList(l)}</div><div style="height:80px"></div></main><button class="fab" data-a="mntnew">${ic('plus')} استلام جهاز</button>`+navBar()}
const mntList=l=>l.map(m=>`<button class="li" data-a="open" data-v="mnt" data-id="${m.id}"><span class="av">${m.no}</span><div class="gr"><b>${esc(m.dev)} · ${esc(m.name)}</b><small>${esc(m.issue||'')} · ${dt(m.t)}</small></div><span class="badge ${mstBadge(m.st)}">${mstName(m.st)}</span></button>`).join('')||empty('box','ما في أجهزة');
IN.mq=v=>{ui.mq=v;const q=norm(v),f=ui.mf||'open',e=$('#mntl');if(e)e.innerHTML=mntList(DB.mnt.filter(m=>(f==='open'?!['done','fail'].includes(m.st):f==='all'||m.st===f)&&(!q||norm(m.name+' '+m.phone+' '+m.dev+' '+(m.imei||'')+' '+m.no).includes(q))).sort((a,b)=>b.t-a.t))};
SH.mntform=p=>{const m=p.id?DB.mnt.find(x=>x.id===p.id):{};return `<h3>${p.id?'تعديل وصل '+m.no:'استلام جهاز للصيانة'}</h3>
 <div class="g2"><label class="f">اسم الزبون<input id="m_name" value="${esc(m.name||'')}" data-focus></label><label class="f">هاتفه<input id="m_phone" inputmode="tel" value="${esc(m.phone||'')}"></label></div>
 <div class="g2"><label class="f">الجهاز (النوع والموديل)<input id="m_dev" value="${esc(m.dev||'')}" placeholder="Samsung A52"></label><label class="f">IMEI / سيريال<input id="m_imei" value="${esc(m.imei||'')}"></label></div>
 <label class="f">العطل<input id="m_issue" value="${esc(m.issue||'')}" placeholder="شاشة مكسورة، ما بيشحن…"></label>
 <div class="g2"><label class="f">رمز القفل / النمط<input id="m_pass" value="${esc(m.pass||'')}"></label><label class="f">المستلَم مع الجهاز<input id="m_acc" value="${esc(m.acc||'')}" placeholder="شريحة، كفر، شاحن"></label></div>
 <div class="g2"><label class="f">الكلفة المتوقعة<input id="m_cost" inputmode="decimal" value="${m.cost||''}"></label><label class="f">عربون مدفوع<input id="m_dep" inputmode="decimal" value="${m.dep||''}" ${p.id?'disabled':''}></label></div>
 <div class="g2"><label class="f">الفني<input id="m_tech" value="${esc(m.tech||curUserName()||'')}"></label><label class="f">موعد التسليم<input id="m_due" type="date" value="${esc(m.due||'')}"></label></div>
 <label class="f">ملاحظات<input id="m_note" value="${esc(m.note||'')}"></label><button class="btn pri wide" data-a="mntsave" data-id="${p.id||''}">${ic('check')} حفظ${p.id?'':' وطباعة الوصل'}</button>`};
P.mnt=p=>{const m=(DB.mnt||[]).find(x=>x.id===p.id);if(!m)return head('صيانة','',true)+'<main class="main"></main>';const rem=Math.max(0,roundM((m.price||m.cost||0)-(m.dep||0)));
 return head('وصل صيانة '+m.no,`<button class="ib" data-a="opensheet" data-v="mntform" data-id="${m.id}">${ic('edit')}</button>`,true)+`<main class="main"><div class="card"><div class="kv"><span>الحالة</span><span class="badge ${mstBadge(m.st)}">${mstName(m.st)}</span></div>
 ${[['الزبون',m.name],['الهاتف',m.phone],['الجهاز',m.dev],['IMEI',m.imei],['العطل',m.issue],['رمز القفل',m.pass],['المستلَم معه',m.acc],['الفني',m.tech],['موعد التسليم',m.due],['ملاحظات',m.note],['تاريخ الاستلام',dt(m.t)]].filter(x=>x[1]).map(([k,v])=>`<div class="kv"><span>${k}</span><b>${esc(v)}</b></div>`).join('')}
 <div class="kv"><span>الكلفة</span><b>${money(m.price||m.cost||0)}</b></div><div class="kv"><span>العربون</span><b>${money(m.dep||0)}</b></div><div class="kv"><span>الباقي عند التسليم</span><b style="color:var(--bad)">${money(rem)}</b></div></div>
 <h2 class="sec">تغيير الحالة</h2><div class="g2">${MST.map(([k,t])=>`<button class="btn ${m.st===k?'pri':'ghost'}" data-a="mntst" data-id="${m.id}" data-v="${k}">${t}</button>`).join('')}</div>
 <div class="g2 mt"><button class="btn ghost" data-a="mntprint" data-id="${m.id}">${ic('print')} طباعة الوصل</button>${m.phone?`<button class="btn wa" data-a="mntwa" data-id="${m.id}">${ic('wa')} إبلاغ الزبون</button>`:''}</div>
 ${m.log&&m.log.length?`<h2 class="sec">السجل</h2>${m.log.map(x=>`<div class="kv"><span>${dt(x.t)}</span><b>${esc(x.x)}</b></div>`).join('')}`:''}</main>`};
P.imei=()=>{const q=norm(ui.iq||'');let r=[];if(q.length>=3){for(const s of DB.sales)for(const i of s.items)if(norm(i.name+' '+(i.note||'')).includes(q))r.push([s,i]);}
 const wm=+S().warM||12,used=(DB.used||[]).filter(u=>q.length>=3&&norm(u.dev+' '+u.imei+' '+u.seller).includes(q)),mn=(DB.mnt||[]).filter(m=>q.length>=3&&norm(m.imei||'').includes(q));
 return head('بحث IMEI / كفالة','',true)+`<main class="main"><div class="srch">${ic('search')}<input id="iq" value="${esc(ui.iq||'')}" placeholder="اكتب IMEI أو اسم الجهاز (3 أحرف على الأقل)" data-focus></div><button class="btn pri wide" data-a="iqgo">${ic('search')} بحث</button>
 <p class="note">سجّل IMEI بملاحظة الصنف وقت البيع (اكبس على الصنف بالسلة)، وهون بتلاقي تاريخ البيع والكفالة. مدة الكفالة: ${wm} شهر <button class="lk" data-a="warset">تغيير</button></p>
 ${r.map(([s,i])=>{const end=s.t+wm*30.44*864e5,ok=Date.now()<end,c=s.cid&&custById(s.cid);return `<button class="li" data-a="sale" data-id="${s.id}"><div class="gr"><b>${esc(i.name)}${i.note?' · '+esc(i.note):''}</b><small>فاتورة ${s.no} · ${dt(s.t)}${c?' · '+esc(c.name):''}</small></div><span class="badge ${ok?'':'out'}">${ok?'بالكفالة لـ '+isoD(end):'انتهت الكفالة'}</span></button>`}).join('')}
 ${used.map(u=>`<div class="li"><div class="gr"><b>مستعمل: ${esc(u.dev)} · ${esc(u.imei)}</b><small>اشتريناه من ${esc(u.seller)} (${esc(u.sid||'')}) · ${dt(u.t)}</small></div><b>${money(u.price)}</b></div>`).join('')}
 ${mn.map(m=>`<button class="li" data-a="open" data-v="mnt" data-id="${m.id}"><div class="gr"><b>صيانة: ${esc(m.dev)}</b><small>وصل ${m.no} · ${dt(m.t)}</small></div><span class="badge">${mstName(m.st)}</span></button>`).join('')}
 ${q.length>=3&&!r.length&&!used.length&&!mn.length?empty('search','ما في نتائج'):''}</main>`};
SH.usedform=()=>`<h3>شراء جهاز مستعمل</h3><p class="note">بيتسجّل البائع ورقم هويتو لحمايتك، والجهاز بينضاف للمخزون.</p>
 <div class="g2"><label class="f">اسم البائع<input id="u_seller" data-focus></label><label class="f">رقم الهوية<input id="u_sid"></label></div><label class="f">هاتف البائع<input id="u_phone" inputmode="tel"></label>
 <div class="g2"><label class="f">الجهاز<input id="u_dev"></label><label class="f">IMEI<input id="u_imei"></label></div>
 <div class="g2"><label class="f">سعر الشراء<input id="u_price" inputmode="decimal"></label><label class="f">سعر البيع المقترح<input id="u_sell" inputmode="decimal"></label></div>
 <button class="btn pri wide" data-a="usedsave">${ic('check')} حفظ</button>`;
Object.assign(A,{
 mntnew:()=>open('mntform',{},true),
 mntsave:async d=>{if(!DB.mnt)DB.mnt=[];const o={name:val('m_name'),phone:val('m_phone'),dev:val('m_dev'),imei:val('m_imei'),issue:val('m_issue'),pass:val('m_pass'),acc:val('m_acc'),cost:num(val('m_cost')),tech:val('m_tech'),due:val('m_due'),note:val('m_note')};
  if(!o.dev||!o.name)return toast('اكتب اسم الزبون والجهاز');
  if(d.id){Object.assign(DB.mnt.find(x=>x.id===d.id),o);flush();back();return}
  const m=Object.assign({id:uid(),no:(DB.mseq=(DB.mseq||0)+1),t:Date.now(),st:'in',dep:num(val('m_dep')),log:[{t:Date.now(),x:'استلام'}]},o);DB.mnt.push(m);
  if(m.dep>0)quickSale('عربون صيانة وصل '+m.no,m.dep);logA('استلام صيانة '+m.no+': '+m.dev);flush();back();toast('تم الاستلام، وصل رقم '+m.no);A.mntprint({id:m.id})},
 mntst:d=>{const m=DB.mnt.find(x=>x.id===d.id);if(!m||m.st===d.v)return;
  if(d.v==='done'){const tot=m.price||m.cost||0,rem=Math.max(0,roundM(tot-(m.dep||0)));const v=prompt(`المبلغ المقبوض عند التسليم (الباقي ${fmt(rem)})`,rem);if(v==null)return;const a=num(v);if(a>0)quickSale('صيانة وصل '+m.no+' · '+m.dev,a);m.paid=a}
  if(d.v==='ready'&&!m.price){const v=prompt('الكلفة النهائية للإصلاح',m.cost||'');if(v!=null)m.price=num(v)}
  m.st=d.v;m.log=m.log||[];m.log.unshift({t:Date.now(),x:mstName(d.v)});logA(`صيانة ${m.no}: ${mstName(d.v)}`);flush();render();if(d.v==='ready'&&m.phone)A.mntwa(d)},
 mntwa:d=>{const m=DB.mnt.find(x=>x.id===d.id);if(!m)return;const rem=Math.max(0,roundM((m.price||m.cost||0)-(m.dep||0)));
  openWA(m.phone,m.st==='ready'?`مرحبا ${m.name} 👋\nجهازك *${m.dev}* صار جاهز ✅\nالمبلغ المتبقي: ${money(rem)}\nرقم الوصل: ${m.no}\n${S().store||''}`:`مرحبا ${m.name}، بخصوص جهازك ${m.dev} (وصل ${m.no}): حالته الآن ${mstName(m.st)}.\n${S().store||''}`)},
 mntprint:d=>{const m=DB.mnt.find(x=>x.id===d.id);if(!m)return;printLines([{t:S().store||'وصل صيانة',s:32,b:1,c:1},S().phone?{t:S().phone,s:22,c:1}:null,'-',{t:'وصل صيانة رقم',v:m.no,s:26,b:1},{t:'التاريخ',v:dt(m.t),s:22},{t:'الزبون',v:m.name,s:24},{t:'الهاتف',v:m.phone||'',s:22},{t:'الجهاز',v:m.dev,s:24,b:1},m.imei?{t:'IMEI',v:m.imei,s:22}:null,{t:'العطل: '+(m.issue||''),s:22},m.acc?{t:'مع الجهاز: '+m.acc,s:22}:null,'-',{t:'الكلفة المتوقعة',v:money(m.cost||0),s:24},{t:'العربون',v:money(m.dep||0),s:24},m.due?{t:'موعد التسليم',v:m.due,s:22}:null,'-',{t:'الجهاز مسؤوليتنا 30 يوم من جاهزيته',s:20,c:1},{t:'يرجى إحضار الوصل عند الاستلام',s:20,c:1}].filter(Boolean))},
 iqgo:()=>{ui.iq=val('iq');render()},
 warset:()=>{const v=prompt('مدة الكفالة بالأشهر',S().warM||12);if(v!=null){S().warM=num(v)||12;save();render()}},
 usedsave:()=>{const o={seller:val('u_seller'),sid:val('u_sid'),phone:val('u_phone'),dev:val('u_dev'),imei:val('u_imei'),price:num(val('u_price')),sell:num(val('u_sell')),t:Date.now()};if(!o.dev||!o.seller||!(o.price>0))return toast('اكتب البائع والجهاز والسعر');
  if(!DB.used)DB.used=[];DB.used.unshift(o);DB.products.push({id:uid(),name:o.dev+' مستعمل',barcode:o.imei||'',price:o.sell||o.price,cur:S().cur,cost:o.price,ccur:S().cur,track:true,stock:1,cat:'مستعمل',sold:0,t:Date.now()});if(!DB.cats.includes('مستعمل'))DB.cats.push('مستعمل');
  DB.expenses.push({id:uid(),amt:o.price,cur:S().cur,cat:'شراء مستعمل',note:o.dev+' من '+o.seller,t:Date.now(),drawer:true,by:curUserName()});logA('شراء مستعمل: '+o.dev+' من '+o.seller);flush();back();toast('تم، والجهاز صار بالمخزون')}
});

/* ================= الصيدليات ================= */
const daysTo=d=>Math.ceil((new Date(d+'T00:00:00')-Date.now())/864e5);
function vPhx(){if(!DB.batches)DB.batches=[];const ex=DB.batches.filter(b=>b.qty>0&&b.exp),expd=ex.filter(b=>daysTo(b.exp)<0),soon=ex.filter(b=>daysTo(b.exp)>=0&&daysTo(b.exp)<=(+S().expD||90)),low=DB.products.filter(p=>p.track&&p.stock<=(+p.min||S().lowAt||5));
 return head('الصيدلية',rateChip())+`<main class="main">${licBanner()}<div class="g2">${[['منتهية الصلاحية',expd.length,'out'],['تنتهي خلال '+(S().expD||90)+' يوم',soon.length,'low'],['نواقص',low.length,'low'],['طلبات الزبائن',(DB.reqs||[]).filter(r=>!r.done).length,'']].map(([t,n,c])=>`<div class="card" style="margin:0;padding:12px"><small style="color:var(--mut)">${t}</small><div style="font-size:22px;font-weight:800;${n&&c?'color:var(--bad)':''}">${n}</div></div>`).join('')}</div>
 <div class="g2 mt">${[['alts','search','البدائل (الاسم العلمي)'],['expiry','bell','الصلاحيات والدفعات'],['short','list','النواقص وطلبيات الموردين'],['rx','user','الوصفات الطبية'],['meds','box','بطاقات الأدوية'],['reqs','bell','طلبات الزبائن']].map(([k,i,t])=>`<button class="big" style="background:var(--card);color:var(--ink);border:1px solid var(--line);align-items:center" data-a="open" data-v="${k}">${ic(i)}<b style="font-size:15px">${t}</b></button>`).join('')}</div><div style="height:80px"></div></main>`+navBar()}
P.alts=()=>{const q=norm(ui.aq||''),l=q?DB.products.filter(p=>norm(p.name+' '+(p.sci||'')+' '+(p.co||'')).includes(q)):[],scis=[...new Set(l.map(p=>p.sci).filter(Boolean))],al=DB.products.filter(p=>p.sci&&scis.some(s=>norm(s)===norm(p.sci)));
 return head('البدائل','',true)+`<main class="main"><div class="srch">${ic('search')}<input id="aq" value="${esc(ui.aq||'')}" placeholder="اسم الدواء التجاري أو العلمي" data-focus></div><button class="btn pri wide" data-a="aqgo">${ic('search')} بحث</button>
 ${scis.map(sc=>`<h2 class="sec">${esc(sc)}</h2>${al.filter(p=>norm(p.sci)===norm(sc)).sort((a,b)=>pPrice(a)-pPrice(b)).map(p=>`<button class="li" data-a="opensheet" data-v="medform" data-id="${p.id}"><div class="gr"><b>${esc(p.name)}</b><small>${esc(p.co||'')}${p.form?' · '+esc(p.form):''}</small></div><div class="lt"><b class="num">${money(pPrice(p))}</b><span class="badge ${p.track&&p.stock<=0?'out':''}">${p.track?'متوفر '+fmt(p.stock):'—'}</span></div></button>`).join('')}`).join('')}
 ${q&&!scis.length?empty('search','ما في نتيجة، أو الدواء ما عليه اسم علمي','حط الاسم العلمي من "بطاقات الأدوية"'):''}</main>`};
P.meds=()=>{const q=norm(ui.mdq||''),l=DB.products.filter(p=>!q||norm(p.name+' '+(p.sci||'')).includes(q)).slice(0,200);
 return head('بطاقات الأدوية','',true)+`<main class="main"><div class="srch">${ic('search')}<input data-i="mdq" value="${esc(ui.mdq||'')}" placeholder="ابحث"></div><div id="mdl">${medList(l)}</div></main>`};
const medList=l=>l.map(p=>`<button class="li" data-a="opensheet" data-v="medform" data-id="${p.id}"><div class="gr"><b>${esc(p.name)}</b><small>${p.sci?esc(p.sci):'<span style="color:var(--bad)">بدون اسم علمي</span>'}${p.co?' · '+esc(p.co):''}${p.form?' · '+esc(p.form):''}</small></div><b class="num">${money(pPrice(p))}</b></button>`).join('')||empty('box','ما في أدوية، ضيفها من المخزون');
IN.mdq=v=>{ui.mdq=v;const q=norm(v),e=$('#mdl');if(e)e.innerHTML=medList(DB.products.filter(p=>!q||norm(p.name+' '+(p.sci||'')).includes(q)).slice(0,200))};
SH.medform=p=>{const m=DB.products.find(x=>x.id===p.id);if(!m)return '';const bs=(DB.batches||[]).filter(b=>b.pid===m.id&&b.qty>0).sort((a,b)=>(a.exp||'').localeCompare(b.exp||''));
 return `<h3>${esc(m.name)}</h3><label class="f">الاسم العلمي (المادة الفعالة)<input id="md_sci" value="${esc(m.sci||'')}" placeholder="Paracetamol 500mg" data-focus></label><div class="g2"><label class="f">الشركة<input id="md_co" value="${esc(m.co||'')}"></label><label class="f">الشكل<input id="md_form" value="${esc(m.form||'')}" placeholder="حب، شراب، إبر…"></label></div>
 <div class="g2"><label class="f">حد النواقص<input id="md_min" inputmode="decimal" value="${m.min||''}"></label><label class="f">يحتاج وصفة<select id="md_rx"><option value="">لا</option><option value="1" ${m.rx?'selected':''}>نعم</option></select></label></div>
 <button class="btn pri wide" data-a="medsave" data-id="${m.id}">${ic('check')} حفظ</button>
 <h2 class="sec">الدفعات (${bs.length}) · المخزون ${fmt(m.stock||0)}</h2>${bs.map(b=>`<div class="kv"><span>${b.lot?'دفعة '+esc(b.lot)+' · ':''}ينتهي ${esc(b.exp||'—')}${b.exp&&daysTo(b.exp)<0?' <b style="color:var(--bad)">منتهي</b>':''}</span><b>${fmt(b.qty)} <button class="lk" data-a="batchdel" data-id="${b.id}">حذف</button></b></div>`).join('')}
 <div class="g2 mt"><label class="f">الكمية<input id="b_qty" inputmode="decimal"></label><label class="f">تاريخ الانتهاء<input id="b_exp" type="date"></label></div><label class="f">رقم الدفعة (اختياري)<input id="b_lot"></label><button class="btn ghost wide" data-a="batchadd" data-id="${m.id}">${ic('plus')} إضافة دفعة للمخزون</button>`};
P.expiry=()=>{if(!DB.batches)DB.batches=[];const l=DB.batches.filter(b=>b.qty>0&&b.exp).sort((a,b)=>a.exp.localeCompare(b.exp));
 return head('الصلاحيات','',true)+`<main class="main"><p class="note">مرتبة من الأقرب للانتهاء. التنبيه قبل ${S().expD||90} يوم <button class="lk" data-a="expdset">تغيير</button></p>${l.map(b=>{const p=DB.products.find(x=>x.id===b.pid),d=daysTo(b.exp);return `<button class="li" data-a="opensheet" data-v="medform" data-id="${b.pid}"><div class="gr"><b>${esc(p?p.name:'محذوف')}</b><small>${b.lot?'دفعة '+esc(b.lot)+' · ':''}الكمية ${fmt(b.qty)}</small></div><span class="badge ${d<0?'out':d<=(+S().expD||90)?'low':''}">${d<0?'منتهي من '+(-d)+' يوم':'باقي '+d+' يوم'}</span></button>`}).join('')||empty('bell','ما في دفعات مسجلة','سجّل الدفعات وتواريخها من بطاقة الدواء')}</main>`};
P.short=()=>{const low=DB.products.filter(p=>p.track&&p.stock<=(+p.min||S().lowAt||5)).sort((a,b)=>a.stock-b.stock),rq=(DB.reqs||[]).filter(r=>!r.done);
 return head('النواقص','',true)+`<main class="main">${low.map(p=>`<div class="li"><div class="gr"><b>${esc(p.name)}</b><small>${esc(p.co||'')}</small></div><span class="badge out">باقي ${fmt(p.stock)}</span></div>`).join('')||empty('check','ما في نواقص')}
 ${rq.length?`<h2 class="sec">طلبات الزبائن غير المتوفرة</h2>${rq.map(r=>`<div class="kv"><span>${esc(r.name)}</span><b>${r.n||1}×</b></div>`).join('')}`:''}
 <button class="btn wa wide mt" data-a="shortwa">${ic('wa')} إرسال الطلبية للمورد</button></main>`};
P.reqs=()=>{if(!DB.reqs)DB.reqs=[];return head('طلبات الزبائن','',true)+`<main class="main"><p class="note">سجّل كل دواء بيطلبو زبون وما بيكون عندك، لتعرف شو لازم تجيب.</p><div class="row" style="display:flex;gap:8px"><input id="rq_n" class="inp" style="margin:0" placeholder="اسم الدواء"><button class="btn pri" data-a="reqadd">${ic('plus')}</button></div>
 ${DB.reqs.filter(r=>!r.done).map(r=>`<div class="li"><div class="gr"><b>${esc(r.name)}</b><small>انطلب ${r.n} مرة · آخر مرة ${dt(r.t)}</small></div><button class="btn sm ghost" data-a="reqdone" data-id="${r.id}">${ic('check')} وصل</button></div>`).join('')||empty('check','ما في طلبات')}</main>`};
P.rx=()=>{if(!DB.rx)DB.rx=[];return head('الوصفات الطبية','',true)+`<main class="main">${DB.rx.map(r=>`<div class="li">${r.img?`<img src="${r.img}" style="width:54px;height:54px;object-fit:cover;border-radius:10px">`:''}<div class="gr"><b>${esc(r.patient)}${r.doctor?' · د. '+esc(r.doctor):''}</b><small>${dt(r.t)}${r.items?' · '+esc(r.items):''}</small></div></div>`).join('')||empty('user','ما في وصفات')}<div style="height:70px"></div></main><button class="fab" data-a="opensheet" data-v="rxform">${ic('plus')} وصفة</button>`};
SH.rxform=()=>`<h3>تسجيل وصفة</h3><div class="g2"><label class="f">اسم المريض<input id="rx_p" data-focus></label><label class="f">الطبيب<input id="rx_d"></label></div><label class="f">الأدوية المصروفة<input id="rx_i"></label><button class="btn ghost wide" data-a="rximg">${ic('img')} ${ui.rximg?'✓ تمت إضافة الصورة':'صورة الوصفة'}</button><button class="btn pri wide mt" data-a="rxsave">${ic('check')} حفظ</button>`;
Object.assign(A,{
 aqgo:()=>{ui.aq=val('aq');render()},
 medsave:d=>{const p=DB.products.find(x=>x.id===d.id);Object.assign(p,{sci:val('md_sci'),co:val('md_co'),form:val('md_form'),min:num(val('md_min')),rx:val('md_rx')==='1'});flush();toast('تم الحفظ');back()},
 batchadd:d=>{const p=DB.products.find(x=>x.id===d.id),q=num(val('b_qty'));if(!(q>0))return toast('اكتب الكمية');if(!DB.batches)DB.batches=[];DB.batches.push({id:uid(),pid:p.id,qty:q,exp:val('b_exp'),lot:val('b_lot'),t:Date.now()});p.track=true;p.stock=r3((p.stock||0)+q);logA('دفعة '+p.name+': '+q);flush();render()},
 batchdel:d=>{const b=DB.batches.find(x=>x.id===d.id);if(!b)return;ask('حذف الدفعة وإنقاص كميتها من المخزون؟','حذف',()=>{const p=DB.products.find(x=>x.id===b.pid);if(p)p.stock=r3(Math.max(0,(p.stock||0)-b.qty));DB.batches=DB.batches.filter(x=>x.id!==b.id);flush()},true)},
 expdset:()=>{const v=prompt('التنبيه قبل كم يوم من الانتهاء؟',S().expD||90);if(v!=null){S().expD=num(v)||90;save();render()}},
 shortwa:()=>{const low=DB.products.filter(p=>p.track&&p.stock<=(+p.min||S().lowAt||5)),rq=(DB.reqs||[]).filter(r=>!r.done);shareText(`*طلبية ${S().store||''}*\n${dt(Date.now())}\n──────────\n${low.map(p=>'• '+p.name+(p.co?' ('+p.co+')':'')).join('\n')}${rq.length?'\n\n*طلبات زبائن:*\n'+rq.map(r=>'• '+r.name).join('\n'):''}`)},
 reqadd:()=>{const n=val('rq_n');if(!n)return;if(!DB.reqs)DB.reqs=[];const r=DB.reqs.find(x=>!x.done&&norm(x.name)===norm(n));if(r){r.n++;r.t=Date.now()}else DB.reqs.unshift({id:uid(),name:n,n:1,t:Date.now()});flush();render()},
 reqdone:d=>{const r=DB.reqs.find(x=>x.id===d.id);if(r)r.done=true;flush();render()},
 rximg:()=>{const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=()=>{const f=i.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,700/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);ui.rximg=c.toDataURL('image/jpeg',.7);render()};im.src=rd.result};rd.readAsDataURL(f)};i.click()},
 rxsave:()=>{const pt=val('rx_p');if(!pt)return toast('اكتب اسم المريض');if(!DB.rx)DB.rx=[];DB.rx.unshift({patient:pt,doctor:val('rx_d'),items:val('rx_i'),img:ui.rximg||'',t:Date.now()});ui.rximg='';flush();back()}
});
/* تنبيه الصلاحية بالكاشير: لما ينضاف دواء دفعته قربت تخلص */
if(PHARM){const _ac=addCart;addCart=function(cn,p,q){const it=_ac(cn,p,q);try{const b=(DB.batches||[]).filter(x=>x.pid===p.id&&x.qty>0&&x.exp).sort((a,c)=>a.exp.localeCompare(c.exp))[0];if(b&&daysTo(b.exp)<0)toast('⚠️ '+p.name+': في دفعة منتهية الصلاحية!',4000);if(p.rx)toast('💊 '+p.name+' يحتاج وصفة طبية',3500)}catch(e){}return it}}
/* نهاية p7.js */
