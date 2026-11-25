/* ============ p14: المناشر ومعامل الحجر (البلوكات، أوامر النشر، المردود، تكلفة المتر) ============ */
if(EDITION==='stone'){
const STY=['حلبي','جبلي','رخام','غرانيت','بازلت','ترافرتين','كلسي'];
const blocks=()=>DB.blocks||(DB.blocks=[]),cuts=()=>DB.cuts||(DB.cuts=[]);
const bVol=b=>r3((+b.l||0)*(+b.w||0)*(+b.h||0));
const bOut=b=>r3(cuts().filter(c=>c.bid===b.id).reduce((a,c)=>a+c.outs.reduce((x,o)=>x+(+o.q||0),0),0));
const bUsed=b=>roundM(cuts().filter(c=>c.bid===b.id).reduce((a,c)=>a+(+c.cost||0),0));
const BST={in:['بالمخزن','ok'],cut:['قيد النشر','low'],done:['منتهي','']};
const yld=()=>+S().yld||25;
const mo=()=>{const d=new Date();d.setDate(1);d.setHours(0,0,0,0);return d.getTime()};
function vStone(){const bl=blocks(),f=ui.bf||'open',l=bl.filter(b=>f==='all'||(f==='open'?b.st!=='done':b.st===f)).sort((a,b)=>b.t-a.t),m0=mo();
 const stockV=r3(bl.filter(b=>b.st==='in').reduce((a,b)=>a+bVol(b),0)),outM=r3(cuts().filter(c=>c.t>=m0).reduce((a,c)=>a+c.outs.reduce((x,o)=>x+(+o.q||0),0),0)),
  done=bl.filter(b=>b.st==='done'&&bVol(b)>0),avg=done.length?r3(done.reduce((a,b)=>a+bOut(b),0)/done.reduce((a,b)=>a+bVol(b),0)):0,val=roundM(bl.filter(b=>b.st!=='done').reduce((a,b)=>a+Math.max(0,conv(b.cost,b.cur||S().cur,S().cur)-bUsed(b)),0));
 return head('المنشرة',rateChip())+`<main class="main">${licBanner()}${notices()}
 <div class="g2 accg">${kpi('بلوكات بالمخزن',`${bl.filter(b=>b.st==='in').length} · ${fmt(stockV)} م³`)}${kpi('إنتاج هالشهر',fmt(outM)+' م²')}${kpi('متوسط المردود',avg?fmt(avg)+' م²/م³':'—')}${kpi('قيمة المواد الخام',money(val))}</div>
 <div class="g2 mt"><button class="btn pri" data-a="opensheet" data-v="blockform">${ic('plus')} بلوك جديد (مواد خام)</button><button class="btn ghost" data-a="cutnew">${ic('box')} أمر نشر / إنتاج</button></div>
 <div class="chips mt">${[['open','المفتوحة'],['in','بالمخزن'],['cut','قيد النشر'],['done','المنتهية'],['all','الكل']].map(([k,t])=>`<button class="chip ${f===k?'on':''}" data-a="bfilt" data-v="${k}">${t}</button>`).join('')}</div>
 ${l.map(b=>`<button class="li" data-a="open" data-v="block" data-id="${b.id}"><span class="av">${esc(b.no)}</span><div class="gr"><b>${esc(b.type)} · ${fmt(bVol(b))} م³</b><small>${fmt(b.l)}×${fmt(b.w)}×${fmt(b.h)} م${b.sid?' · '+esc((DB.suppliers.find(s=>s.id===b.sid)||{}).name||''):''} · ${money(b.cost,b.cur)}${bOut(b)?' · إنتاج '+fmt(bOut(b))+' م²':''}</small></div><span class="badge ${BST[b.st][1]}">${BST[b.st][0]}</span></button>`).join('')||empty('box','ما في بلوكات','سجّل أول بلوك حجر بزر "بلوك جديد"')}
 ${cuts().length?`<h2 class="sec">آخر أوامر النشر</h2>${cuts().slice().reverse().slice(0,15).map(c=>{const b=bl.find(x=>x.id===c.bid)||{};return `<div class="li"><div class="gr"><b>أمر ${c.no} · بلوك ${esc(b.no||'')}</b><small>${dt(c.t)} · ${c.outs.map(o=>esc((prodById(o.pid)||{}).name||'')+' '+fmt(o.q)+' م²').join('، ')}</small></div><b class="num">${money(c.cost)}</b></div>`}).join('')}`:''}
 <div style="height:70px"></div></main>`+navBar()}
window.vStone=vStone;
A.bfilt=d=>{ui.bf=d.v;render()};
SH.blockform=p=>{const b=p.id?blocks().find(x=>x.id===p.id):{no:String((DB.bseq||0)+1),type:'',l:'',w:'',h:'',cost:'',cur:S().cur,sid:''};
 return `<h3>${p.id?'تعديل بلوك':'بلوك جديد (مواد خام)'}</h3><div class="g2"><label class="f">رقم البلوك<input id="bk_no" value="${esc(b.no)}"></label><label class="f">نوع الحجر<input id="bk_type" list="stypes" value="${esc(b.type)}" placeholder="حلبي، جبلي، رخام…"><datalist id="stypes">${STY.map(x=>`<option value="${x}">`).join('')}</datalist></label></div>
 <p class="note" style="margin:0 0 6px">المقاسات بالمتر</p><div class="g2" style="grid-template-columns:1fr 1fr 1fr"><label class="f">الطول<input id="bk_l" data-i="bkv" inputmode="decimal" value="${esc(b.l)}"></label><label class="f">العرض<input id="bk_w" data-i="bkv" inputmode="decimal" value="${esc(b.w)}"></label><label class="f">الارتفاع<input id="bk_h" data-i="bkv" inputmode="decimal" value="${esc(b.h)}"></label></div>
 <p class="note" id="bkvol">${b.l?'الحجم: '+fmt(bVol(b))+' م³':''}</p>
 <div class="frow"><label class="f">التكلفة الكاملة للبلوك<input id="bk_cost" inputmode="decimal" value="${esc(b.cost)}"></label><div style="margin-bottom:12px">${seg('uset',ui.bkcur||b.cur||S().cur,[['SYP','ل.س'],['USD','$']],'bkcur')}</div></div>
 <label class="f">المورّد / المقلع (اختياري)<select id="bk_sid" class="inp"><option value="">—</option>${DB.suppliers.map(s=>`<option value="${s.id}" ${b.sid===s.id?'selected':''}>${esc(s.name)}</option>`).join('')}</select></label>
 ${p.id?'':`<label class="f">المدفوع هلأ<input id="bk_paid" inputmode="decimal" placeholder="اتركه فاضي إذا كلها دين للمورد"></label>${opt('المدفوع من صندوق الكاشير','',sw(ui.bkdr!==false,'bkdr',''))}`}
 <label class="f">ملاحظات<input id="bk_note" value="${esc(b.note||'')}" placeholder="اللون، العروق، الجودة…"></label>
 <button class="btn pri wide" data-a="blocksave" data-id="${p.id||''}">${ic('check')} حفظ</button>${p.id&&!cuts().some(c=>c.bid===p.id)?`<button class="btn ghost bad wide mt" data-a="blockdel" data-id="${p.id}">${ic('trash')} حذف</button>`:''}`};
IN.bkv=()=>{const v=r3(num(val('bk_l'))*num(val('bk_w'))*num(val('bk_h'))),e=$('#bkvol');if(e)e.textContent=v?'الحجم: '+fmt(v)+' م³':''};
A.bkdr=()=>{ui.bkdr=ui.bkdr===false;render()};
A.blocksave=d=>need('buy',()=>{const no=val('bk_no').trim(),type=val('bk_type').trim(),l=num(val('bk_l')),w=num(val('bk_w')),h=num(val('bk_h')),cost=num(val('bk_cost')),cur=ui.bkcur||S().cur,sid=val('bk_sid');
 if(!type)return toast('اكتب نوع الحجر');if(!(l>0&&w>0&&h>0))return toast('اكتب المقاسات الثلاثة');
 if(d.id){const b=blocks().find(x=>x.id===d.id);Object.assign(b,{no,type,l,w,h,cost,cur,sid,note:val('bk_note')});logA('تعديل بلوك '+no)}
 else{const t=Date.now(),b={id:uid(),no:no||String((DB.bseq||0)+1),type,l,w,h,cost,cur,sid,note:val('bk_note'),t,st:'in'};DB.bseq=(DB.bseq||0)+1;blocks().push(b);
  const pd=Math.min(cost,num(val('bk_paid')));
  if(sid){DB.sledger.push({id:uid(),sid,amt:cost,cur,note:`بلوك ${b.no} (${type} ${fmt(bVol(b))} م³)`,t});if(pd>0)DB.sledger.push({id:uid(),sid,amt:-pd,cur,note:'دفعة مع البلوك '+b.no,t:t+1,drawer:ui.bkdr!==false})}
  else if(pd>0)DB.expenses.push({id:uid(),amt:pd,cur,cat:'مواد خام',note:'بلوك '+b.no,t,drawer:ui.bkdr!==false});
  logA(`بلوك جديد ${b.no}: ${type} ${fmt(bVol(b))} م³ بـ ${money(cost,cur)}`)}
 ui.bkcur=null;flush();back();toast('انحفظ البلوك ✅')});
A.blockdel=d=>ask('حذف البلوك؟ (بدون حذف دفعات المورد)','حذف',()=>{DB.blocks=blocks().filter(b=>b.id!==d.id);flush();back(()=>{})},true);
P.block=p=>{const b=blocks().find(x=>x.id===p.id);if(!b)return head('بلوك','',true)+'<main class="main"></main>';const v=bVol(b),o=bOut(b),used=bUsed(b),cs=cuts().filter(c=>c.bid===b.id),bc=roundM(conv(b.cost,b.cur||S().cur,S().cur));
 return head('بلوك '+b.no,`<button class="ib" data-a="opensheet" data-v="blockform" data-id="${b.id}">${ic('edit')}</button>`,true)+`<main class="main">
 <div class="card"><div class="kv"><span>الحالة</span><span class="badge ${BST[b.st][1]}">${BST[b.st][0]}</span></div><div class="kv"><span>النوع</span><b>${esc(b.type)}</b></div><div class="kv"><span>المقاسات</span><b>${fmt(b.l)}×${fmt(b.w)}×${fmt(b.h)} م = ${fmt(v)} م³</b></div>
 <div class="kv"><span>التكلفة</span><b>${money(b.cost,b.cur)}</b></div>${b.sid?`<div class="kv"><span>المورد</span><b>${esc((DB.suppliers.find(s=>s.id===b.sid)||{}).name||'')}</b></div>`:''}<div class="kv"><span>تاريخ الدخول</span><b>${dt(b.t)}</b></div>${b.note?`<div class="kv"><span>ملاحظات</span><b>${esc(b.note)}</b></div>`:''}</div>
 <div class="card"><h3>${ic('chart')}المردود</h3><div class="kv"><span>الإنتاج حتى الآن</span><b>${fmt(o)} م²</b></div><div class="kv"><span>المردود</span><b>${v?fmt(r3(o/v)):'—'} م²/م³</b></div>
 <div class="kv"><span>تكلفة انحسبت على الإنتاج</span><b>${money(used)}</b></div><div class="kv"><span>باقي من تكلفة البلوك</span><b>${money(Math.max(0,bc-used))}</b></div>${o?`<div class="kv"><span>تكلفة المتر المربع</span><b>${money(roundM(used/o))}</b></div>`:''}</div>
 ${b.st!=='done'?`<button class="btn pri wide" data-a="cutnew" data-id="${b.id}">${ic('box')} أمر نشر من هالبلوك</button>`:''}
 ${cs.length?`<h2 class="sec">أوامر النشر</h2>${cs.map(c=>`<div class="li"><div class="gr"><b>أمر ${c.no} · ${dt(c.t)}</b><small>${c.outs.map(x=>esc((prodById(x.pid)||{}).name||'')+' '+fmt(x.q)+' م²').join('، ')}${c.extra?' · أجور '+money(c.extra):''}${c.note?' · '+esc(c.note):''}</small></div><b class="num">${money(c.cost)}</b></div>`).join('')}`:''}</main>`};
/* أمر النشر */
A.cutnew=d=>need('stock',()=>{const ob=blocks().filter(b=>b.st!=='done');if(!ob.length)return toast('سجّل بلوك أول');ui.cut={bid:d.id||(ob[0]||{}).id,outs:[{pid:'',q:''}],extra:'',done:false};open('cutform',{},true)});
const cutBlk=()=>blocks().find(b=>b.id===ui.cut.bid);
function cutAuto(){const b=cutBlk();if(!b)return 0;const bc=roundM(conv(b.cost,b.cur||S().cur,S().cur)),left=Math.max(0,bc-bUsed(b)),q=ui.cut.outs.reduce((a,o)=>a+num(o.q),0);
 if(ui.cut.done)return roundM(left);const est=Math.max(1,bVol(b)*yld()-bOut(b));return roundM(Math.min(left,bc/Math.max(1,bVol(b)*yld())*q))}
SH.cutform=()=>{const c=ui.cut,b=cutBlk(),prods=DB.products;return `<h3>أمر نشر / إنتاج</h3>
 <label class="f">البلوك<select class="inp" data-c="cutb">${blocks().filter(x=>x.st!=='done').map(x=>`<option value="${x.id}" ${x.id===c.bid?'selected':''}>بلوك ${esc(x.no)} · ${esc(x.type)} · ${fmt(bVol(x))} م³</option>`).join('')}</select></label>
 <p class="note" style="margin:0 0 6px">الإنتاج (بالمتر المربع). المنتج بيزيد بالمخزون لحاله.</p>
 ${c.outs.map((o,i)=>`<div class="g2" style="grid-template-columns:2fr 1fr auto;align-items:end"><label class="f" style="margin:0 0 8px">المنتج<select class="inp" data-c="cutp" data-n="${i}" style="margin:0"><option value="">اختار…</option>${prods.map(p=>`<option value="${p.id}" ${o.pid===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><label class="f" style="margin:0 0 8px">م²<input data-i="cutq" data-n="${i}" inputmode="decimal" value="${esc(o.q)}"></label><button class="ib sm" data-a="cutrm" data-v="${i}" style="margin-bottom:10px">${ic('x')}</button></div>`).join('')}
 <button class="btn ghost sm" data-a="cutadd">${ic('plus')} سطر إنتاج</button>
 <div class="card mt" style="padding:10px 12px"><b>منتج جديد</b><div class="g2" style="grid-template-columns:2fr 1fr auto;align-items:end"><label class="f" style="margin:0">الاسم<input id="np_n" placeholder="حلبي مسمسم 3 سم"></label><label class="f" style="margin:0">سعر المتر<input id="np_p" inputmode="decimal"></label><button class="btn sm pri" data-a="cutnp">${ic('plus')}</button></div></div>
 <label class="f mt">أجور النشر والعمال لهالأمر (اختياري، بتنسجل مصروف من الصندوق)<input id="cut_x" inputmode="decimal" value="${esc(c.extra)}"></label>
 ${opt('خلص البلوك','بتنحسب كل تكلفته الباقية على هالإنتاج',sw(c.done,'cutdone',''))}
 <div class="kv"><span>تكلفة المواد على هالإنتاج</span><b id="cutc">${money(cutAuto())}</b></div>${b?`<p class="note">المردود المتوقع ${fmt(yld())} م² لكل م³ (بتعدّله من الإعدادات)</p>`:''}
 <label class="f">ملاحظة<input id="cut_n" placeholder="سماكة، تشطيب…"></label><button class="btn pri wide" data-a="cutsave">${ic('check')} حفظ أمر النشر</button>`};
const cutKeep=()=>{const x=$('#cut_x');if(x)ui.cut.extra=x.value};
CH.cutb=v=>{cutKeep();ui.cut.bid=v;render()};CH.cutp=(v,el)=>{cutKeep();ui.cut.outs[+el.dataset.n].pid=v;render()};
IN.cutq=(v,el)=>{ui.cut.outs[+el.dataset.n].q=v;const e=$('#cutc');if(e)e.textContent=money(cutAuto())};
A.cutadd=()=>{cutKeep();ui.cut.outs.push({pid:'',q:''});render()};A.cutrm=d=>{cutKeep();ui.cut.outs.splice(+d.v,1);if(!ui.cut.outs.length)ui.cut.outs.push({pid:'',q:''});render()};
A.cutdone=()=>{cutKeep();ui.cut.done=!ui.cut.done;render()};
A.cutnp=()=>{cutKeep();const n=val('np_n').trim();if(!n)return toast('اكتب اسم المنتج');const pr=num(val('np_p'));
 const p={id:uid(),name:n,barcode:'',price:pr,cur:S().cur,cost:0,ccur:S().cur,track:true,stock:0,cat:'حجر',sold:0,t:Date.now()};DB.products.push(p);if(!DB.cats.includes('حجر'))DB.cats.push('حجر');
 const e=ui.cut.outs.find(o=>!o.pid);if(e)e.pid=p.id;else ui.cut.outs.push({pid:p.id,q:''});flush();render()};
A.cutsave=()=>need('stock',()=>{cutKeep();const c=ui.cut,b=cutBlk();if(!b)return toast('اختار البلوك');const outs=c.outs.filter(o=>o.pid&&num(o.q)>0).map(o=>({pid:o.pid,q:r3(num(o.q))}));
 if(!outs.length)return toast('اكتب منتج وكمية واحدة على الأقل');const mat=cutAuto(),extra=num(c.extra),tot=roundM(mat),qs=outs.reduce((a,o)=>a+o.q,0),t=Date.now();
 for(const o of outs){const p=prodById(o.pid);if(!p)continue;const share=tot*(o.q/qs),uc=conv(share/o.q,S().cur,p.ccur||p.cur),s0=p.track?Math.max(0,p.stock):0;
  p.cost=Math.round((s0>0&&p.cost>0?(s0*p.cost+o.q*uc)/(s0+o.q):uc)*100)/100;p.ccur=p.ccur||p.cur;p.track=true;p.stock=r3((p.stock||0)+o.q)}
 DB.cseq=(DB.cseq||0)+1;cuts().push({id:uid(),no:DB.cseq,bid:b.id,t,outs,cost:mat,extra,note:val('cut_n')});
 if(extra>0)DB.expenses.push({id:uid(),amt:extra,cur:S().cur,cat:'أجور نشر',note:'أمر نشر '+DB.cseq+' بلوك '+b.no,t,drawer:true});
 b.st=c.done?'done':'cut';logA(`أمر نشر ${DB.cseq}: بلوك ${b.no} ← ${fmt(qs)} م²`);ui.cut=null;flush();back();toast(`انضاف ${fmt(qs)} م² للمخزون ✅`)});
/* إعداد المردود */
{const f=setView;setView=function(){let h=f();const c=card('المنشرة','',`<label class="f" style="margin:0">المردود المتوقع (م² لكل م³)<input data-c="yld" inputmode="decimal" value="${yld()}"></label><p class="note">بيستعمله البرنامج ليوزّع تكلفة البلوك على الإنتاج قبل ما يخلص البلوك. لما تكبس "خلص البلوك" بينحسب الباقي بالضبط.</p>`);
 const mk='<div class="card"><h3>الدعم الفني</h3>';return h.includes(mk)?h.replace(mk,c+mk):h+c}}
CH.yld=v=>{S().yld=Math.max(1,num(v))||25;save()};
}
/* نهاية p14.js */
