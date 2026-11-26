/* ============ p15: الضرائب (فوق السعر، ضمن السعر، مقطوعة شهرية) ============ */
if(!LITE){
const TXM=[['off','بلا ضريبة'],['excl','فوق السعر'],['incl','ضمن السعر'],['fixed','مقطوعة شهرية']];
const txOn=()=>S().taxMode==='excl'||S().taxMode==='incl';
const txName=()=>S().taxName||'الضريبة';
const ym=t=>{const d=new Date(t);return d.getFullYear()*100+d.getMonth()+1};
const taxSum=(st,en)=>DB.sales.reduce((a,s)=>a+(!s.refunded&&s.tax&&s.t>st&&s.t<=en?conv(s.tax,s.cur,S().cur,s.rate):0),0);
if(!EXPCATS.includes('ضرائب'))EXPCATS.splice(Math.max(0,EXPCATS.length-1),0,'ضرائب');
/* الإعدادات */
{const f=setView;setView=function(){let h=f();const o=S(),m=o.taxMode||'off';
 const body=`${opt('نوع الضريبة','',seg('taxm',m,TXM))}
  ${m==='excl'?'<p class="note">بتنضاف على سعر المنتج: منتج بـ 100 والضريبة 10% ← الزبون بيدفع 110</p>':m==='incl'?'<p class="note">السعر شامل الضريبة: منتج بـ 110 والضريبة 10% ← الفاتورة بتبيّن إنو منها 10 ضريبة</p>':m==='fixed'?'<p class="note">مبلغ ثابت كل شهر (متل الإيجار)، بينسجل مصروف لما تدفعه، وبيجيك تذكير</p>':''}
  ${txOn()?`<div class="g2"><label class="f">النسبة %<input data-c="taxrate" inputmode="decimal" value="${o.taxRate||''}" placeholder="مثلاً 10"></label><label class="f">اسمها بالفاتورة<input data-c="taxname" value="${esc(o.taxName||'')}" placeholder="الضريبة"></label></div>
   <label class="f">الرقم الضريبي (اختياري، بيطبع بالفاتورة)<input data-c="taxno" value="${esc(o.taxNo||'')}"></label><p class="note">فيك تعفي منتج معيّن من صفحة المنتج.</p>`:''}
  ${m==='fixed'?`<div class="g2"><label class="f">المبلغ الشهري<input data-c="taxfix" inputmode="decimal" value="${o.taxFix||''}"></label><label class="f">يوم الدفع بالشهر<input data-c="taxday" inputmode="numeric" value="${o.taxDay||1}"></label></div>
   <div class="kv"><span>هالشهر</span><b>${o.taxPaidM===ym(Date.now())?'✅ مدفوعة':'⏳ لسا ما ندفعت'}</b></div>${o.taxPaidM!==ym(Date.now())&&+o.taxFix>0?`<button class="btn ghost wide" data-a="taxpay">${ic('money')} سجّل دفع ضريبة هالشهر</button>`:''}`:''}`;
 const c=card('الضريبة','',body),mk='<div class="card"><h3>الدعم الفني</h3>';return h.includes(mk)?h.replace(mk,c+mk):h+c}}
A.taxm=d=>{S().taxMode=d.v;logA('نوع الضريبة: '+TXM.find(x=>x[0]===d.v)[1]);save();render()};
CH.taxrate=v=>{S().taxRate=Math.max(0,Math.min(100,num(v)));logA('نسبة الضريبة '+S().taxRate+'%');save()};
CH.taxname=v=>{S().taxName=v.trim();save()};CH.taxno=v=>{S().taxNo=v.trim();save()};
CH.taxfix=v=>{S().taxFix=Math.max(0,num(v));save();render()};CH.taxday=v=>{S().taxDay=Math.min(28,Math.max(1,Math.round(num(v))||1));save()};
A.taxpay=()=>{const a=+S().taxFix||0;if(!a)return;ask(`تسجيل دفع ${txName()} الشهرية ${money(a)} كمصروف؟`,'تسجيل',()=>{DB.expenses.push({id:uid(),amt:a,cur:S().cur,cat:'ضرائب',note:txName()+' شهر '+(new Date().getMonth()+1),t:Date.now(),drawer:false});S().taxPaidM=ym(Date.now());logA(`دفع ${txName()} الشهرية ${money(a)}`);flush();toast('انسجلت ✅')})};
/* تذكير الضريبة الشهرية */
{const f=notices;notices=function(){const h=f(),o=S();if(o.taxMode!=='fixed'||!(+o.taxFix>0)||o.taxPaidM===ym(Date.now())||new Date().getDate()<(+o.taxDay||1)||!isAdminView())return h;
 return `<button class="warn" data-a="taxpay">${ic('money')}<span style="flex:1">صار وقت دفع ${esc(txName())} الشهرية: ${money(+o.taxFix)}</span><u>تسجيل</u></button>`+h}}
/* إعفاء منتج */
{const f=P.prod;P.prod=p=>{let h=f(p);if(!txOn())return h;const d=ui.pd||{};
 return h.replace('<button class="btn pri wide" data-a="saveprod">',`<div class="card">${opt('معفى من '+esc(txName()),'ما بتنحسب عليه ضريبة',sw(d.taxEx,'ptg','taxEx'))}</div><button class="btn pri wide" data-a="saveprod">`)}}
{const f=A.editprod;A.editprod=(d,el,e)=>{f(d,el,e);const p=prodById(d.id);if(p&&ui.pd&&ui.pd.id===p.id){ui.pd.taxEx=!!p.taxEx;render()}}}
{const f=A.saveprod;A.saveprod=(d,el,e)=>{const x=readProd(),n=DB.products.length;f(d,el,e);const p=x.id?prodById(x.id):(DB.products.length>n?DB.products[DB.products.length-1]:null);if(p&&p.name===x.name){p.taxEx=!!x.taxEx;flush()}}}
/* شاشة الدفع والكاشير */
{const f=SH.pay;SH.pay=p=>{let h=f(p);if(!txOn())return h;const sub=cartTotal(carts.sale),d=discAmt(sub),t=taxOf(carts.sale,sub,d);if(!t.tax)return h;
 return h.replace(/(<span class="tag lg">[^<]*<\/span><\/div>)/,`$1<div class="kv" style="margin:-6px 0 10px"><span>${S().taxMode==='excl'?'منها':'شامل'} ${esc(txName())} ${S().taxRate}%</span><b>${money(t.tax)}</b></div>`)}}
{const f=vPos;vPos=function(){const h=f();return S().taxMode==='excl'&&+S().taxRate?h.replace('<small>الإجمالي</small>',`<small>الإجمالي (قبل ${esc(txName())})</small>`):h}}
/* نص الفاتورة */
{const f=receiptText;receiptText=function(s){let t=f(s);if(!s||!s.tax)return t;const m=v=>money(v,s.cur),L=`${s.taxM==='excl'?'':'شامل '}${txName()} ${s.taxR}%: ${m(s.tax)}\n`;
 return t.replace(/(\*الإجمالي: )/,s.taxM==='excl'?L+'$1':'$1').replace(/(\*الإجمالي: [^\n]*\n)/,s.taxM==='incl'?'$1'+L:'$1')}}
/* التقارير */
{const f=stats;stats=function(k){const o=f(k),[st,en]=prange(k);o.tax=0;for(const s of DB.sales){if(s.refunded||!s.tax||s.t<st||s.t>en)continue;const v=conv(s.tax,s.cur,S().cur,s.rate);o.tax+=v;if(s.taxM==='incl')o.profit-=v}return o}}
{const f=tabNet;tabNet=function(){const h=f(),[st,en]=prange(ui.period),t=taxSum(st-1,en);if(!(t>0))return h;
 return h.replace(/(<div class="kv[^"]*"><span>المبيعات<\/span><b>[^<]*<\/b><\/div>)/,`$1<div class="kv"><span>${esc(txName())} المحصّلة (للمالية، مو ربح)</span><b style="color:var(--low)">${money(roundM(t))}</b></div>`)}}
{const f=tabClose;tabClose=function(){const h=f(),c=drawerCalc(),t=taxSum(c.since,Date.now()+1);if(!(t>0))return h;
 return h.replace(/(<span>مبيعات كاش<\/span><b>[^<]*<\/b><\/div>)/,`$1<div class="kv"><span>&nbsp;&nbsp;${esc(txName())} المحصّلة بالفترة</span><b>${money(roundM(t))}</b></div>`)}}
{const f=monText;monText=function(since){const t=f(since),x=taxSum(since,Date.now()+1);return x>0?t+`\n🧾 ${txName()} المحصّلة: ${money(roundM(x))}`:t}}
{const f=reportText;reportText=function(k,hp){const t=f(k,hp),[st,en]=prange(k),x=taxSum(st-1,en);if(!(x>0))return t;return t.replace(/(المبيعات: [^\n]*\n)/,`$1${txName()} المحصّلة: ${money(roundM(x))}\n`)}}
{const f=repData;repData=function(k){const o=f(k);o.tax=taxSum(o.st-1,o.en);if(o.tax>0){/* ضمن السعر: الضريبة مو ربح */const inc=DB.sales.reduce((a,s)=>a+(!s.refunded&&s.taxM==='incl'&&s.t>=o.st&&s.t<=o.en?conv(s.tax,s.cur,S().cur,s.rate):0),0);o.profit-=inc}return o}}
window.__k15={taxSum};
}
/* نهاية p15.js */
