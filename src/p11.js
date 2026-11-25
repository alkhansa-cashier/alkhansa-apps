/* ============ p11: الشام كاش بالدولار أو بالليرة ============ */
const shcOf=()=>(ui.pay&&ui.pay.shc)||S().cur;
const shF=()=>shcOf()!==S().cur;
const rF=(v,c)=>c==='USD'?Math.round(v*100)/100:Math.round(v);
const toF=v=>rF(conv(v,S().cur,shcOf(),S().rate),shcOf()),fromF=u=>roundM(conv(u,shcOf(),S().cur,S().rate));
const shuSum=(st,en)=>DB.sales.reduce((a,s)=>a+(!s.refunded&&s.shc==='USD'&&s.t>st&&s.t<=en?(+s.shu||0):0),0);
const usd=v=>'$'+fmt(Math.round(v*100)/100);
if(!LITE){
 {const f=SH.pay;SH.pay=p=>{let h=f(p);const m=ui.pay.method;if(m!=='sham'&&m!=='mix')return h;const c=shcOf(),oth=S().cur==='USD'?'SYP':'USD';
  const sg=opt('الشام كاش انحوّل بـ','',seg('shcur',c,[[S().cur,S().cur==='USD'?'دولار $':'ليرة'],[oth,oth==='USD'?'دولار $':'ليرة']]));
  h=h.replace(/(<div class="opt"><div class="gr"><b>طريقة الدفع<\/b>[\s\S]*?<\/div><\/div>)/,'$1'+sg);
  if(!shF())return h;
  if(m==='sham'){const t=payTotal();return h.replace('<div class="note" id="rem">',`<div class="card" style="padding:10px 12px;margin:0 0 10px;background:var(--lowbg)"><div class="kv"><span>المطلوب على شام كاش</span><b class="num" style="font-size:20px">${money(toF(t),c)}</b></div><small class="sub">بسعر الصرف ${fmt(S().rate)}، وبينحسب بالصندوق ${money(t)}</small></div><div class="note" id="rem">`)}
  const ps=ui.pay.ps||0;return h.replace(/<label class="f">شام كاش<input id="psham"[^>]*><\/label>/,`<label class="f">شام كاش (${c==='USD'?'$':'ل.س'})<input id="pshu" data-i="pshu" inputmode="decimal" value="${ps?toF(ps):''}" data-focus><input type="hidden" id="psham" value="${ps}"></label>`)+`<p class="note" id="shuh" style="margin-top:-6px">${ps?'= '+money(ps):''}</p>`}}
 {const f=A.paym;A.paym=(d,el,e)=>{const was=ui.pay.method;f(d,el,e);if(was!==d.v&&(d.v==='sham'||was==='sham'))render()}}
 A.shcur=d=>{ui.pay.shc=d.v;ui.pay.shu=0;if(ui.pay.method==='mix'){ui.pay.ps=0;ui.pay.paid=payTotal()}render()};
 IN.pshu=v=>{const u=num(v),e=$('#psham');ui.pay.shu=u;if(e)e.value=Math.min(payTotal(),fromF(u));IN.pmix(e.value,e);const hh=$('#shuh');if(hh)hh.textContent=u?'= '+money(num(e.value)):''};
 {const f=IN.pmix;IN.pmix=(v,el)=>{f(v,el);if(shF()&&el&&el.id==='pcash'){const u=$('#pshu');ui.pay.shu=0;if(u)u.value=ui.pay.ps?toF(ui.pay.ps):'';const hh=$('#shuh');if(hh)hh.textContent=ui.pay.ps?'= '+money(ui.pay.ps):''}}}
 {const f=makeSale;makeSale=function(...a){const shc=ui.pay&&ui.pay.shc,shu=ui.pay&&ui.pay.shu,s=f(...a);
  if(s&&shc&&shc!==s.cur&&(s.method==='sham'||s.method==='mix')){const sp=shamPart(s);if(sp>0){s.shc=shc;s.shu=(s.method==='mix'&&shu>0&&Math.abs(roundM(conv(shu,shc,s.cur,s.rate))-sp)<=1)?shu:rF(conv(sp,s.cur,shc,s.rate),shc);logA(`فاتورة ${s.no}: شام كاش ${money(s.shu,shc)}`);flush()}}return s}}
 {const f=A.editpaysave;if(f)A.editpaysave=(d,el,e)=>{f(d,el,e);const s=DB.sales.find(x=>x.id===d.id);if(s&&s.shc){if(s.method==='cash'){delete s.shc;delete s.shu}else s.shu=rF(conv(shamPart(s),s.cur,s.shc,s.rate),s.shc);flush()}}}
 {const f=P.sale;P.sale=p=>{let h=f(p);const s=DB.sales.find(x=>x.id===p.id);if(!s||!s.shc||!(s.shu>0))return h;
  return h.replace('<div class="kv"><span>المدفوع</span>',`<div class="kv"><span>وصل على شام كاش</span><b class="num">${money(s.shu,s.shc)}</b></div><div class="kv"><span>المدفوع</span>`)}}
 {const f=receiptText;receiptText=function(s){let t=f(s);if(s&&s.shc&&s.shu>0){const ft=S().footer||'';const line=`شام كاش: ${money(s.shu,s.shc)}\n`;t=ft&&t.endsWith(ft)?t.slice(0,t.length-ft.length)+line+ft:t+'\n'+line}return t}}
 {const f=tabClose;tabClose=function(){let h=f();const c=drawerCalc(),u=shuSum(c.since,Date.now()+1);if(!(u>0))return h;
  return h.replace(/(<span>شام كاش مستلم \(مو بالدرج\)<\/span><b>[^<]*<\/b><\/div>)/,`$1<div class="kv"><span>&nbsp;&nbsp;منها وصلت بالدولار</span><b class="num">${usd(u)}</b></div>`)}}
 {const f=monText;monText=function(since){const t=f(since),u=shuSum(since,Date.now()+1);return u>0?t+`\n💵 شام كاش وصل بالدولار: ${usd(u)}`:t}}
 {const f=reportText;reportText=function(k,hp){let t=f(k,hp);const [st,en]=prange(k),u=shuSum(st-1,en);if(!(u>0))return t;return t.replace(/(شام كاش: [^\n]*\n)/,`$1   منها بالدولار: ${usd(u)}\n`)}}
 {const f=repData;repData=function(k){const o=f(k);o.shu=shuSum(o.st-1,o.en);return o}}
}
/* نهاية p11.js */
