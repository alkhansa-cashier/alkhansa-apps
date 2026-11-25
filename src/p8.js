/* ============ الألبسة، مواد البناء، الطاقة الشمسية ============ */
const CLOTH=EDITION==='cloth',BUILD=(EDITION==='build'||EDITION==='whole'),SOLAR=EDITION==='solar',UNITQ=()=>BUILD||(EDITION==='shop'&&S().units!==false);
/* المقاسات والألوان / الوحدات: اختيار عند الإضافة للسلة */
const optsOf=p=>String((CLOTH?p.vars:p.units)||'').split(/[،,]/).map(x=>x.trim()).filter(Boolean);
if(CLOTH||BUILD||EDITION==='shop'){const _ac=addCart;addCart=function(cn,p,q){const o=p&&(CLOTH||UNITQ())&&optsOf(p);if(o&&o.length&&!ui.varPick){ui.varP={cn,p,q};open('varpick',{},true);return null}const v=ui.varPick;ui.varPick=null;
 if(!v)return _ac(cn,p,q);const cart=carts[cn];let it=cart.find(x=>x.pid===p.id&&x.v===v.n);
 if(it){it.qty=r3(it.qty+q);return it}it={pid:p.id,name:p.name+' · '+v.n,price:v.p>0?roundM(v.p):roundM(curPrice(p)*v.f),cost:roundM(pCost(p)*v.f),qty:q,v:v.n,f:v.f};cart.push(it);if(UNITQ())it.uq=v.f;return it}}
const parseOpt=s=>{s=toLatin(s);const m=s.match(/^(.+?)\s*[=:]\s*([\d.]+)(?:\s*[@بـ]+\s*([\d.]+))?$/);return m?{n:m[1].trim(),f:+m[2],p:m[3]?+m[3]:0}:{n:s,f:1,p:0}};
SH.varpick=()=>{const {p}=ui.varP||{};if(!p)return '';const o=optsOf(p).map(parseOpt);return `<h3>${esc(p.name)}</h3><p class="note">${CLOTH?'اختار المقاس / اللون':'اختار الوحدة'}</p><div class="g2">${(UNITQ()?[{n:'قطعة',f:1}].concat(o):o).map(x=>`<button class="btn ghost" data-a="varok" data-v="${esc(x.n)}" data-k="${x.f}" data-p="${x.p||0}">${esc(x.n)}${UNITQ()&&x.f!==1?`<small> (${x.f})</small>`:''}<br><b class="num">${money(x.p>0?roundM(x.p):roundM(curPrice(p)*x.f))}</b></button>`).join('')}</div>`};
A.varok=d=>{const {cn,p,q}=ui.varP;ui.varPick={n:d.v,f:+d.k||1,p:+d.p||0};back();const it=addCart(cn,p,q);if(it&&p.track&&BUILD){}beep();render()};
/* تعديل المقاسات / الوحدات للمنتج */
SH.varform=p=>{const m=DB.products.find(x=>x.id===p.id);return `<h3>${esc(m.name)}</h3><label class="f">${CLOTH?'المقاسات والألوان (افصل بفاصلة)':'الوحدات: الاسم=العدد (افصل بفاصلة)'}<input id="vr" value="${esc((CLOTH?m.vars:m.units)||'')}" placeholder="${CLOTH?'S, M, L, XL, أسود 42, أبيض 43':'كرتونة=24, ربطة=10, متر=1, طن=1000'}" data-focus></label>${UNITQ()?`<p class="note">السعر بالمخزون هو سعر القطعة، وسعر الوحدة = السعر × العدد. وإذا الكرتونة إلها سعر جملة خاص اكتبه بعد @، مثال: كرتونة=24@3400</p>`:''}<button class="btn pri wide" data-a="varsave" data-id="${m.id}">${ic('check')} حفظ</button>`};
A.varsave=d=>{const m=DB.products.find(x=>x.id===d.id);m[CLOTH?'vars':'units']=val('vr');flush();back();toast('تم الحفظ')};
function vVars(){const q=norm(ui.vq||''),l=DB.products.filter(p=>!q||norm(p.name).includes(q)).slice(0,200);
 return head(CLOTH?'المقاسات والألوان':'الوحدات',rateChip())+`<main class="main">${licBanner()}<p class="note">${CLOTH?'حدد لكل موديل مقاساتو وألوانو، والكاشير بيسألك وقت البيع.':'حدد لكل مادة وحداتها (كرتونة، ربطة، طن…)، والكاشير بيحسب السعر لحالو.'}</p><div class="srch">${ic('search')}<input data-i="vq" value="${esc(ui.vq||'')}" placeholder="ابحث"></div><div id="vl">${varList(l)}</div><div style="height:70px"></div></main>`+navBar()}
const varList=l=>l.map(p=>`<button class="li" data-a="opensheet" data-v="varform" data-id="${p.id}"><div class="gr"><b>${esc(p.name)}</b><small>${esc((CLOTH?p.vars:p.units)||'— بدون')}</small></div><b class="num">${money(pPrice(p))}</b></button>`).join('')||empty('box','ضيف المنتجات من المخزون أولاً');
IN.vq=v=>{ui.vq=v;const q=norm(v),e=$('#vl');if(e)e.innerHTML=varList(DB.products.filter(p=>!q||norm(p.name).includes(q)).slice(0,200))};

/* ============ حاسبة الطاقة الشمسية ============ */
const DEV=[['براد',150,24],['غسالة',500,1],['تلفزيون',100,6],['إنارة LED (لمبة)',12,8],['مروحة',70,8],['راوتر إنترنت',15,24],['شاحن موبايلات',20,4],['مكيف 1 طن',1100,6],['ميكرويف',1000,0.3],['مضخة مي',750,1],['لابتوب',65,6],['سخان مي',1500,1]];
function solarCalc(){const L=ui.sl||(ui.sl=[]);let w=0,wh=0;L.forEach(x=>{w+=x.w*x.n;wh+=x.w*x.n*x.h});const psh=+S().psh||5,pw=+S().panelW||550,bv=+S().battV||48,bah=+S().battAh||200,dod=0.8;
 const inv=Math.ceil(w*1.3/500)*500,pv=Math.ceil(wh*1.25/psh),panels=Math.ceil(pv/pw),bWh=wh*0.6/dod,batts=Math.max(1,Math.ceil(bWh/(bv*bah)));return {w,wh,inv,pv,panels,batts,pw,bv,bah}}
function vSolar(){const L=ui.sl||(ui.sl=[]),r=solarCalc();
 return head('حاسبة الطاقة الشمسية',rateChip())+`<main class="main">${licBanner()}<div class="card"><h3>أحمال الزبون</h3>
 ${L.map((x,i)=>`<div class="kv"><span>${esc(x.d)} · ${x.w} واط × ${x.n} × ${x.h} ساعة</span><b>${fmt(x.w*x.n*x.h)} واط/ساعة <button class="lk" data-a="slrm" data-v="${i}">حذف</button></b></div>`).join('')||'<p class="note">ضيف الأجهزة اللي بدو يشغلها الزبون</p>'}
 <div class="g2 mt"><select id="sl_d" class="inp" style="margin:0">${DEV.map((d,i)=>`<option value="${i}">${d[0]} (${d[1]} واط)</option>`).join('')}<option value="x">جهاز آخر…</option></select><div class="g2"><input id="sl_n" class="inp" style="margin:0" inputmode="numeric" placeholder="العدد" value="1"><input id="sl_h" class="inp" style="margin:0" inputmode="decimal" placeholder="ساعات"></div></div><button class="btn ghost wide mt" data-a="sladd">${ic('plus')} إضافة جهاز</button></div>
 <div class="card"><h3>النظام المقترح</h3><div class="kv"><span>الحمل اللحظي الأقصى</span><b>${fmt(r.w)} واط</b></div><div class="kv"><span>الاستهلاك اليومي</span><b>${fmt(r.wh)} واط/ساعة</b></div>
 <div class="kv"><span>🔌 الإنفرتر</span><b>${fmt(r.inv)} واط</b></div><div class="kv"><span>☀️ الألواح</span><b>${r.panels} لوح × ${r.pw} واط</b></div><div class="kv"><span>🔋 البطاريات</span><b>${r.batts} × ${r.bv}V ${r.bah}Ah</b></div>
 <p class="note">الحساب تقريبي: 5 ساعات شمس، و60% من الاستهلاك عالبطاريات ليلاً، وتفريغ 80%. عدّل الإعدادات من <button class="lk" data-a="opensheet" data-v="solarset">هون</button>.</p>
 <div class="g2"><button class="btn pri" data-a="sl2cart">${ic('cart')} حطّ النظام بالسلة (عرض سعر)</button><button class="btn wa" data-a="slwa">${ic('wa')} إرسال للزبون</button></div><button class="btn ghost wide mt" data-a="slclr">مسح</button></div>
 <div style="height:70px"></div></main>`+navBar()}
SH.solarset=()=>`<h3>إعدادات الحاسبة</h3><div class="g2"><label class="f">ساعات الشمس الفعلية<input id="ss1" value="${S().psh||5}"></label><label class="f">قدرة اللوح (واط)<input id="ss2" value="${S().panelW||550}"></label></div><div class="g2"><label class="f">جهد البطارية (V)<input id="ss3" value="${S().battV||48}"></label><label class="f">سعة البطارية (Ah)<input id="ss4" value="${S().battAh||200}"></label></div><p class="note">لربط الحاسبة بالمخزون: سمِّ منتجاتك بحيث يكون فيها كلمة "لوح" و"بطارية" و"انفرتر".</p><button class="btn pri wide" data-a="solarsave">${ic('check')} حفظ</button>`;
Object.assign(A,{
 sladd:()=>{const i=val('sl_d'),n=num(val('sl_n'))||1;let d=DEV[+i];if(i==='x'){const nm=prompt('اسم الجهاز');if(!nm)return;const w=num(prompt('القدرة بالواط'));if(!w)return;d=[nm,w,4]}const h=val('sl_h')===''?d[2]:num(val('sl_h'));ui.sl.push({d:d[0],w:d[1],n,h});render()},
 slrm:d=>{ui.sl.splice(+d.v,1);render()},slclr:()=>{ui.sl=[];render()},
 solarsave:()=>{Object.assign(S(),{psh:num(val('ss1'))||5,panelW:num(val('ss2'))||550,battV:num(val('ss3'))||48,battAh:num(val('ss4'))||200});save();back()},
 sl2cart:()=>{const r=solarCalc();if(!r.wh)return toast('ضيف أجهزة أولاً');const f=k=>DB.products.find(p=>norm(p.name).includes(norm(k)));const add=(k,q,nm)=>{const p=f(k);if(p)addCart('sale',p,q);else carts.sale.push({pid:'',name:nm,price:0,cost:0,qty:q})};
  add('لوح',r.panels,`لوح شمسي ${r.pw} واط`);add('بطاري',r.batts,`بطارية ${r.bv}V ${r.bah}Ah`);add('انفرتر',1,`انفرتر ${r.inv} واط`);carts.sale.push({pid:'',name:'تركيب وتمديدات',price:0,cost:0,qty:1});tab='pos';render();toast('انضاف النظام للسلة، عدّل الأسعار وكمّل أو احفظو كعرض سعر')},
 slwa:()=>{const r=solarCalc();shareText(`☀️ *نظام طاقة شمسية مقترح*\n${S().store||''}\n──────────\n${ui.sl.map(x=>`• ${x.d} ×${x.n} (${x.h} ساعة)`).join('\n')}\n\nالاستهلاك اليومي: ${fmt(r.wh)} واط/ساعة\n🔌 إنفرتر ${fmt(r.inv)} واط\n☀️ ${r.panels} ألواح × ${r.pw} واط\n🔋 ${r.batts} بطاريات ${r.bv}V ${r.bah}Ah\n\n📞 ${S().phone||''}`)}
});
window.__k8={add:(cn,p,q)=>addCart(cn,p,q)};
/* نهاية p8.js */
