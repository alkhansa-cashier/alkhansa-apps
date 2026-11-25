/* ============ p12: وحدات التعبئة (قطعة، دزينة، كرتونة…) من نموذج المنتج ============ */
const UPK=EDITION==='shop'||BUILD;
const unitsOf=p=>String(p&&p.units||'').split(/[،,]/).map(x=>x.trim()).filter(Boolean).map(parseOpt).filter(u=>u.f>0);
const bigUnit=p=>unitsOf(p).filter(u=>u.f>1).sort((a,b)=>b.f-a.f)[0];
function unitBreak(p,q){const u=bigUnit(p);if(!u||!(q>0))return '';const n=Math.floor(q/u.f+1e-9),r=r3(q-n*u.f);return n?`${fmt(n)} ${u.n}${r?' + '+fq(r):''}`:''}
if(UPK){
 {const f=stockBadge;stockBadge=function(p,used,long){const h=f(p,used,long);if(!long||!p.track)return h;const b=unitBreak(p,r3(p.stock-(used||0)));return b?h+`<small style="display:block;margin-top:3px;color:var(--mut)">${esc(b)}</small>`:h}}
 {const f=readProd;readProd=function(){const d=f();const e=$('#pu');if(e)d.units=e.value.trim();return d}}
 {const f=P.prod;P.prod=p=>{const d=ui.pd||(ui.pd=newDraft());let h=f(p);
  h=h.replace('</datalist></label>',`</datalist></label><label class="f" style="margin:12px 0 0">وحدات التعبئة (اختياري)<input id="pu" data-i="pu" value="${esc(d.units||'')}" placeholder="مثال: دزينة=12, كرتونة=24"><small class="sub">الاسم=كم قطعة فيها. وإذا إلها سعر خاص: كرتونة=24@3400</small></label>`);
  const us=unitsOf({units:d.units}).filter(u=>u.f>1);
  if(us.length)h=h.replace(/(<label class="f mt" style="[^"]*">الكمية المتوفرة<input id="ps"[^>]*><\/label>)/,`$1<div class="g2" style="${d.track?'':'display:none'}"><label class="f" style="margin:0">أو اكتب العدد<input id="psn" data-i="psn" inputmode="decimal" placeholder="مثلاً 10"></label><label class="f" style="margin:0">من<select id="psu" class="inp" data-i="psn" style="margin:0">${us.map(u=>`<option value="${u.f}">${esc(u.n)} (${u.f})</option>`).join('')}</select></label></div><p class="note" id="psh"></p>`);
  return h}}
 IN.pu=v=>{if(ui.pd)ui.pd.units=v};
 IN.psn=()=>{const n=num(val('psn')),f=num(val('psu'))||1,e=$('#ps'),h=$('#psh');if(!e)return;if(n>0){e.value=r3(n*f);if(h)h.textContent=`= ${fmt(r3(n*f))} قطعة`}else if(h)h.textContent=''};
 /* بعد كتابة الوحدات، نعيد رسم النموذج لتظهر خانة الإدخال بالوحدة */
 document.addEventListener('change',e=>{if(e.target&&e.target.id==='pu'&&ui.pd){ui.pd=readProd();render()}});
 {const f=A.editprod;A.editprod=(d,el,e)=>{f(d,el,e);const p=prodById(d.id);if(p&&ui.pd&&ui.pd.id===p.id){ui.pd.units=p.units||'';render()}}}
 {const f=A.saveprod;A.saveprod=(d,el,e)=>{const x=readProd(),n=DB.products.length;f(d,el,e);
  const p=x.id?prodById(x.id):(DB.products.length>n?DB.products[DB.products.length-1]:null);if(p&&p.name===x.name){p.units=x.units||'';flush()}}}
 /* فاتورة الشراء: الكمية بالوحدة */
 if(typeof piLines==='function'){
  const _pl=piLines;piLines=function(){let h=_pl();ui.pi.lines.forEach((l,i)=>{const us=unitsOf(prodById(l.pid)).filter(u=>u.f>1);if(!us.length)return;
   const sel=`<label class="f" style="margin:6px 0 0">الكمية بـ<select class="inp" data-i="pilu" data-n="${i}" style="margin:0"><option value="1">قطعة</option>${us.map(u=>`<option value="${u.f}" ${+l.u===u.f?'selected':''}>${esc(u.n)} (${u.f})</option>`).join('')}</select></label>`;
   const mk=`data-k="c" data-n="${i}" inputmode="decimal" value="${esc(l.c)}"></label></div>`;h=h.replace(mk,mk+sel)});return h};
  IN.pilu=(v,el)=>{const l=ui.pi.lines[+el.dataset.n];if(l)l.u=+v||1};
  {const f=A.pisave;A.pisave=(d,el,e)=>{if(ui.pi)ui.pi.lines.forEach(l=>{if(+l.u>1){l.q=String(r3(num(l.q)*l.u));l.c=String(Math.round(num(l.c)/l.u*1e4)/1e4);l.u=1}});return f(d,el,e)}}
 }
}
/* نهاية p12.js */
