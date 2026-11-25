/* ============ النماذج والإجراءات ============ */
P.setup=()=>`<header class="hd"><h1>أهلاً بك في ${APPNAME}</h1></header><main class="main"><div class="card"><h3>${ic('star')}معلومات ${Q?'المعهد':'المدرسة'}</h3>
 <label class="f">اسم ${Q?'المعهد / المسجد':'المدرسة'}<input id="w_name" data-focus></label><label class="f">${Q?'اسم المشرف':'اسم المدير'}<input id="w_mgr"></label><label class="f">رقم الهاتف<input id="w_phone" inputmode="tel"></label><label class="f">العنوان<input id="w_addr"></label>
 <label class="f">العام الدراسي<input id="w_year" value="${esc(S().year)}"></label><button class="btn pri wide" data-a="setupok">${ic('check')} ابدأ</button></div>
 <p style="text-align:center;color:var(--mut);font-size:13px">${Q?'هذا النظام مقدّم مجاناً من':'من تطوير'} شركة الخنساء للتصميم والبرمجة · 0934664381</p></main>`;
A.setupok=()=>{const n=val('w_name');if(!n)return toast('اكتب الاسم');Object.assign(S(),{name:n,manager:val('w_mgr'),phone:val('w_phone'),addr:val('w_addr'),year:val('w_year')||S().year});DB.ready=true;flush();stack.length=0;render()};
P.settings=()=>{const s=S();return head('الإعدادات','',true)+`<main class="main"><div class="card"><h3>${ic('star')}المعلومات</h3>
 <div class="prof"><div class="ph" data-a="logo">${s.logo?`<img src="${s.logo}">`:ic('plus')}</div><small style="color:var(--mut)">اكبس لتغيير الشعار<br>بيطلع بالطباعة والبطاقات</small></div>
 <label class="f mt">الاسم<input id="s_name" value="${esc(s.name)}"></label><label class="f">${Q?'المشرف':'المدير'}<input id="s_mgr" value="${esc(s.manager)}"></label><label class="f">الهاتف<input id="s_phone" value="${esc(s.phone)}"></label><label class="f">العنوان<input id="s_addr" value="${esc(s.addr)}"></label>
 <div class="g2"><label class="f">العام الدراسي<input id="s_year" value="${esc(s.year)}"></label><label class="f">العملة<input id="s_cur" value="${esc(s.cur)}"></label></div>
 <div class="g2"><label class="f">عدد الحصص باليوم<input id="s_per" inputmode="numeric" value="${s.periods}"></label><label class="f">علامة النجاح %<input id="s_pass" inputmode="numeric" value="${s.pass}"></label></div>
 <label class="f">أيام الدوام (افصل بفاصلة)<input id="s_days" value="${esc((s.days||[]).join('، '))}"></label><label class="f">الفصول (افصل بفاصلة)<input id="s_terms" value="${esc((s.terms||[]).join('، '))}"></label>
 <label class="f">الأوراق المطلوبة عند التسجيل (افصل بفاصلة)<textarea id="s_docs">${esc((s.docs||[]).join('، '))}</textarea></label>
 <label class="f">${L.fees}</label>${seg('feeon',s.feesOn?1:0,[[1,'مفعّلة'],[0,'مخفية']])}
 <button class="btn pri wide mt" data-a="setsave">${ic('check')} حفظ</button></div>
 <div class="card"><h3>${ic('trash')}منطقة الخطر</h3><button class="btn bad wide" data-a="wipe">${ic('trash')} مسح كل البيانات</button></div></main>`};
const splitL=v=>v.split(/[،,]/).map(x=>x.trim()).filter(Boolean);
A.setsave=()=>{Object.assign(S(),{name:val('s_name'),manager:val('s_mgr'),phone:val('s_phone'),addr:val('s_addr'),year:val('s_year'),cur:val('s_cur')||'ل.س',periods:Math.max(1,Math.min(12,num(val('s_per'))||7)),pass:num(val('s_pass'))||50,days:splitL(val('s_days')),terms:splitL(val('s_terms')),docs:splitL(val('s_docs'))});flush();toast('تم الحفظ');render()};
A.feeon=(d,el)=>{S().feesOn=d.v==='1';flush();render()};
function pickImg(max,cb){const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.8))};im.src=r.result};r.readAsDataURL(f)};i.click()}
A.logo=()=>pickImg(300,u=>{S().logo=u;flush();render()});
A.wipe=()=>{if(prompt('للتأكيد اكتب: مسح')!=='مسح')return;localStorage.removeItem(KEY);location.reload()};

/* ---- الطالب ---- */
A.newstu=()=>{if(!DB.classes.length){toast('أضف '+L.cls+' أولاً');go('clsform',{},true);return}ui.ph='';go('stuform',{},true)};
SH.stuform=p=>{const s=p.id?stuById(p.id):{name:'',cid:ui.cf&&ui.cf!=='~left'?ui.cf:'',gender:'m',join:today()};if(ui.ph==null||ui.ph==='')ui.ph=s.photo||'';
 return `<h3>${p.id?'تعديل بيانات':'تسجيل '+L.stu+' جديد'}</h3><div class="prof"><div class="ph" data-a="stuph">${ui.ph?`<img src="${ui.ph}">`:ic('plus')}</div><small style="color:var(--mut)">اكبس لإضافة صورة<br>(كاميرا أو ملف)</small></div>
 <label class="f mt">الاسم الثلاثي *<input id="f_name" value="${esc(s.name)}" data-focus></label><div class="g2"><label class="f">اسم الأب<input id="f_father" value="${esc(s.father||'')}"></label><label class="f">اسم الأم<input id="f_mother" value="${esc(s.mother||'')}"></label></div>
 <div class="g2"><label class="f">${L.cls} *<select id="f_cid">${clsOpts(s.cid)}</select></label><label class="f">الجنس<select id="f_gender"><option value="m" ${s.gender!=='f'?'selected':''}>ذكر</option><option value="f" ${s.gender==='f'?'selected':''}>أنثى</option></select></label></div>
 <div class="g2"><label class="f">تاريخ الميلاد<input id="f_birth" type="date" value="${esc(s.birth||'')}"></label><label class="f">مكان الولادة<input id="f_bplace" value="${esc(s.bplace||'')}"></label></div>
 <div class="g2"><label class="f">هاتف ولي الأمر (واتساب)<input id="f_phone" inputmode="tel" value="${esc(s.phone||'')}"></label><label class="f">هاتف آخر<input id="f_phone2" inputmode="tel" value="${esc(s.phone2||'')}"></label></div>
 <label class="f">العنوان<input id="f_addr" value="${esc(s.addr||'')}"></label><div class="g2"><label class="f">الرقم الوطني<input id="f_nid" value="${esc(s.nid||'')}"></label><label class="f">تاريخ التسجيل<input id="f_join" type="date" value="${esc(s.join||today())}"></label></div>
 ${Q?'':`<label class="f">المدرسة السابقة<input id="f_prev" value="${esc(s.prev||'')}"></label>`}<label class="f">ملاحظات صحية (حساسية، أمراض…)<input id="f_health" value="${esc(s.health||'')}"></label>
 ${S().feesOn?`<div class="g2"><label class="f">${Q?'الاشتراك':'القسط'} الخاص (فاضي = قسط ال${L.cls})<input id="f_fee" inputmode="decimal" value="${s.fee??''}"></label><label class="f">حسم (إخوة، أيتام…)<input id="f_disc" inputmode="decimal" value="${s.disc||''}"></label></div>`:''}
 <label class="f">ملاحظات<textarea id="f_notes">${esc(s.notes||'')}</textarea></label><button class="btn pri wide" data-a="stusave" data-id="${p.id||''}">${ic('check')} حفظ</button>`};
A.stuph=()=>pickImg(360,u=>{ui.ph=u;const e=$('.sheet .ph');if(e)e.innerHTML=`<img src="${u}">`});
A.stusave=d=>{const n=val('f_name');if(!n)return toast('اكتب الاسم');const cid=val('f_cid');if(!cid)return toast('اختار ال'+L.cls);
 const o={name:n,father:val('f_father'),mother:val('f_mother'),cid,gender:val('f_gender'),birth:val('f_birth'),bplace:val('f_bplace'),phone:val('f_phone'),phone2:val('f_phone2'),addr:val('f_addr'),nid:val('f_nid'),join:val('f_join'),prev:val('f_prev'),health:val('f_health'),notes:val('f_notes'),photo:ui.ph||''};
 if(S().feesOn){const f=val('f_fee');o.fee=f===''?'':num(f);o.disc=num(val('f_disc'))}
 if(d.id){Object.assign(stuById(d.id),o);logA('تعديل بيانات: '+n)}else{DB.students.push(Object.assign({id:uid(),no:++DB.seq,status:'active',docs:{}},o));logA('تسجيل '+L.stu+': '+n)}
 ui.ph='';flush();back();toast('تم الحفظ')};
A.doc=(d,el)=>{const s=stuById(d.id);if(!s)return;s.docs=s.docs||{};s.docs[d.v]=el.checked;flush()};
A.stuleft=d=>{const s=stuById(d.id);if(!s)return;s.status=s.status==='left'?'active':'left';logA((s.status==='left'?'انقطاع: ':'إعادة: ')+s.name);flush();render()};
A.studel=d=>{const s=stuById(d.id);if(!s||!confirm('حذف '+s.name+' نهائياً مع كل سجلاته؟'))return;DB.students=DB.students.filter(x=>x.id!==s.id);DB.pays=DB.pays.filter(x=>x.sid!==s.id);DB.hifz=DB.hifz.filter(x=>x.sid!==s.id);logA('حذف: '+s.name);flush();back()};
A.wa=d=>{const s=stuById(d.id);if(s)openWA(s.phone,`السلام عليكم، معكم ${S().name} بخصوص ${L.stu=='طالب'?'الطالب':''} ${s.name}: `)};
function waNum(p){let n=toLatin(p).replace(/\D/g,'');if(n.startsWith('00'))n=n.slice(2);else if(n.startsWith('0'))n='963'+n.slice(1);return n}
function openWA(p,t){window.open(`https://wa.me/${waNum(p||'')}?text=${encodeURIComponent(t)}`,'_blank')}

/* ---- الصفوف والمعلمين ---- */
SH.clsform=p=>{const c=p.id?clsById(p.id):{name:'',fee:''};return `<h3>${p.id?'تعديل':'إضافة'} ${L.cls}</h3><label class="f">الاسم<input id="c_name" value="${esc(c.name)}" placeholder="${Q?'حلقة أبي بكر الصديق':'الصف الأول - شعبة أ'}" data-focus></label>
 <label class="f">${L.tch} المسؤول<select id="c_tid"><option value="">—</option>${DB.teachers.map(t=>`<option value="${t.id}" ${t.id===c.tid?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label>
 ${S().feesOn?`<label class="f">${Q?'الاشتراك':'القسط السنوي'}<input id="c_fee" inputmode="decimal" value="${c.fee||''}"></label>`:''}<button class="btn pri wide" data-a="clssave" data-id="${p.id||''}">${ic('check')} حفظ</button>${p.id?`<button class="btn bad wide mt" data-a="clsdel" data-id="${p.id}">${ic('trash')} حذف</button>`:''}`};
A.clssave=d=>{const n=val('c_name');if(!n)return toast('اكتب الاسم');const o={name:n,tid:val('c_tid'),fee:num(val('c_fee'))};if(d.id)Object.assign(clsById(d.id),o);else DB.classes.push(Object.assign({id:uid(),subs:Q?[]:SUBJ.slice(0,6).map(x=>({n:x,max:100}))},o));flush();back()};
A.clsdel=d=>{if(inCls(d.id).length)return toast('انقل ال'+L.stuP+' أولاً');DB.classes=DB.classes.filter(c=>c.id!==d.id);flush();stack.length=0;render()};
SH.subform=p=>{const c=clsById(p.id);return `<h3>مواد ${esc(c.name)}</h3><p style="color:var(--mut);margin:0 0 8px">كل سطر: اسم المادة - العلامة العظمى</p><textarea id="sb" class="inp" style="min-height:220px">${(c.subs||[]).map(s=>s.n+' - '+s.max).join('\n')}</textarea><button class="btn pri wide mt" data-a="subsave" data-id="${c.id}">${ic('check')} حفظ</button>`};
A.subsave=d=>{const c=clsById(d.id);c.subs=val('sb').split('\n').map(l=>{const m=l.split(/\s+-\s+|\s*:\s*/);return {n:(m[0]||'').trim(),max:num(m[1])||100}}).filter(x=>x.n);flush();back()};
SH.tchform=p=>{const t=p.id?tchById(p.id):{name:''};return `<h3>${p.id?'تعديل':'إضافة'} ${L.tch}</h3><label class="f">الاسم<input id="t_name" value="${esc(t.name)}" data-focus></label><label class="f">الهاتف<input id="t_phone" value="${esc(t.phone||'')}"></label><label class="f">${Q?'التخصص':'المواد'}<input id="t_subj" value="${esc(t.subj||'')}"></label><label class="f">الراتب الشهري<input id="t_sal" inputmode="decimal" value="${t.salary||''}"></label><button class="btn pri wide" data-a="tchsave" data-id="${p.id||''}">${ic('check')} حفظ</button>${p.id?`<button class="btn bad wide mt" data-a="tchdel" data-id="${p.id}">${ic('trash')} حذف</button>`:''}`};
A.tchsave=d=>{const n=val('t_name');if(!n)return toast('اكتب الاسم');const o={name:n,phone:val('t_phone'),subj:val('t_subj'),salary:num(val('t_sal'))};if(d.id)Object.assign(tchById(d.id),o);else DB.teachers.push(Object.assign({id:uid()},o));flush();back()};
A.tchdel=d=>{DB.teachers=DB.teachers.filter(t=>t.id!==d.id);flush();back()};
A.tpay=(d,el,e)=>{e.stopPropagation();const t=tchById(d.id),v=prompt('المبلغ المدفوع لـ '+t.name,t.salary||'');if(v==null)return;const a=num(v);if(!a)return;DB.tpays.push({id:uid(),tid:t.id,amt:a,t:Date.now(),note:''});logA('دفع راتب '+t.name+': '+money(a));flush();toast('تم التسجيل');render()};
SH.expform=()=>`<h3>مصروف جديد</h3><label class="f">البند<input id="x_cat" placeholder="كهرباء، قرطاسية، صيانة…" data-focus></label><label class="f">المبلغ<input id="x_amt" inputmode="decimal"></label><label class="f">ملاحظة<input id="x_note"></label><button class="btn pri wide" data-a="expsave">${ic('check')} حفظ</button>`;
A.expsave=()=>{const a=num(val('x_amt'));if(!a)return toast('اكتب المبلغ');DB.exps.push({id:uid(),cat:val('x_cat')||'مصروف',amt:a,note:val('x_note'),t:Date.now()});flush();back()};
A.expdel=d=>{if(!confirm('حذف؟'))return;if(d.k==='t')DB.tpays=DB.tpays.filter(x=>x.id!==d.id);else DB.exps=DB.exps.filter(x=>x.id!==d.id);flush();render()};
A.ttcell=d=>{const g=DB.tt[d.id]=DB.tt[d.id]||{},v=prompt('المادة / المعلم لهالحصة',g[d.v]||'');if(v==null)return;g[d.v]=v.trim();flush();render()};

/* ---- الحضور ---- */
const curAtt=()=>{const c=ui.ac||(DB.classes[0]||{}).id||'',d=ui.ad||today();ui.ac=c;return DB.att[attKey(d,c)]=DB.att[attKey(d,c)]||{}};
A.attset=d=>{const r=curAtt();r[d.id]=d.v;save();render()};
A.attall=()=>{const r=curAtt();inCls(ui.ac).forEach(s=>{if(!r[s.id])r[s.id]='p'});save();render()};
A.attsave=()=>{const r=curAtt(),l=inCls(ui.ac),miss=l.filter(s=>!r[s.id]).length;if(miss)return toast(`باقي ${miss} بدون تحديد`);logA('تفقّد '+clsName(ui.ac)+' '+(ui.ad||today()));flush();toast('تم حفظ التفقّد ✓')};
A.attwa=()=>{const r=curAtt(),ab=inCls(ui.ac).filter(s=>r[s.id]==='a'&&s.phone);if(!ab.length)return toast('ما في غائبين عندهم رقم');ui.waq=ab.map(s=>s.id);go('waq',{},true)};
SH.waq=()=>`<h3>إبلاغ أهالي الغائبين</h3><p style="color:var(--mut);margin:0 0 8px">اكبس على كل اسم ليفتح واتساب برسالة جاهزة</p>${(ui.waq||[]).map(id=>{const s=stuById(id);return `<button class="li" data-a="wa1" data-id="${id}">${avatar(s)}<div class="gr"><b>${esc(s.name)}</b><small>${esc(s.phone)}</small></div>${ic('wa')}</button>`}).join('')}`;
A.wa1=(d,el)=>{const s=stuById(d.id);openWA(s.phone,`السلام عليكم ورحمة الله\nنعلمكم أن ${s.gender==='f'?'ابنتكم':'ابنكم'} *${s.name}* ${s.gender==='f'?'غائبة':'غائب'} اليوم ${ui.ad||today()} عن ${S().name}.\nنرجو التواصل معنا لمعرفة السبب.`);el.style.opacity=.45};

/* ---- الامتحانات ---- */
SH.examform=()=>`<h3>امتحان جديد</h3><label class="f">الاسم<input id="e_name" placeholder="مذاكرة أولى، امتحان نهائي…" data-focus></label><label class="f">${L.cls}<select id="e_cid">${clsOpts(ui.ac)}</select></label><label class="f">الفصل<select id="e_term">${(S().terms||[]).map(t=>`<option>${esc(t)}</option>`).join('')}</select></label><button class="btn pri wide" data-a="examsave">${ic('check')} حفظ</button>`;
A.examsave=()=>{const n=val('e_name'),c=val('e_cid');if(!n||!c)return toast('اكتب الاسم واختار ال'+L.cls);const e={id:uid(),name:n,cid:c,term:val('e_term'),t:Date.now()};DB.exams.push(e);ui.ec=e.id;flush();back()};
A.mksave=d=>{const m=DB.marks[d.id]=DB.marks[d.id]||{};document.querySelectorAll('[data-mk]').forEach(i=>{const [sid,sub]=i.dataset.mk.split('|');m[sid]=m[sid]||{};m[sid][sub]=i.value.trim()===''?'':num(i.value)});logA('حفظ علامات: '+(DB.exams.find(x=>x.id===d.id)||{}).name);flush();toast('تم حفظ العلامات ✓');render()};
A.examdel=d=>{if(!confirm('حذف الامتحان مع علاماته؟'))return;DB.exams=DB.exams.filter(x=>x.id!==d.id);delete DB.marks[d.id];ui.ec='';flush();render()};

/* ---- الأقساط ---- */
A.paynew=d=>go('payform',{id:d.id},true);
SH.payform=p=>{const s=stuById(p.id);return `<h3>قبض من ${esc(s.name)}</h3><div class="kv"><span>المتبقي عليه</span><b style="color:var(--bad)">${money(dueOf(s))}</b></div><label class="f mt">المبلغ<input id="py_amt" inputmode="decimal" value="${dueOf(s)||''}" data-focus></label><label class="f">ملاحظة (القسط الأول، كتب…)<input id="py_note"></label><button class="btn pri wide" data-a="paysave" data-id="${s.id}">${ic('check')} قبض وطباعة الإيصال</button>`};
A.paysave=d=>{const a=num(val('py_amt'));if(!(a>0))return toast('اكتب المبلغ');const p={id:uid(),sid:d.id,amt:a,note:val('py_note'),t:Date.now(),no:++DB.rseq};DB.pays.push(p);logA('قبض إيصال '+p.no+': '+money(a));flush();back();toast('تم القبض ✓');prRcpt(p)};
A.prcpt=d=>{const p=DB.pays.find(x=>x.id===d.id);if(p)prRcpt(p)};

/* ---- الحفظ ---- */
A.hnew=d=>{const last=hifzOf(d.id).find(x=>x.type==='h');ui.hs=last?last.s2:0;ui.hf=last?last.a2+1:1;go('hform',{id:d.id},true)};
const suraOpts=sel=>SURAS.map((n,i)=>`<option value="${i}" ${i==sel?'selected':''}>${i+1}. ${n}</option>`).join('');
SH.hform=p=>{const s=stuById(p.id);return `<h3>تسميع: ${esc(s.name)}</h3>${seg('set',ui.ht||'h',[['h','حفظ جديد'],['m','مراجعة']],'ht')}
 <div class="g2 mt"><label class="f">من سورة<select id="h_s1">${suraOpts(ui.hs||0)}</select></label><label class="f">من آية<input id="h_a1" inputmode="numeric" value="${ui.hf||1}"></label></div>
 <div class="g2"><label class="f">إلى سورة<select id="h_s2">${suraOpts(ui.hs||0)}</select></label><label class="f">إلى آية<input id="h_a2" inputmode="numeric" data-focus></label></div>
 <label class="f">عدد الصفحات<input id="h_pg" inputmode="decimal" placeholder="مثلاً 1 أو 0.5"></label><label class="f">التقدير</label>${seg('set',ui.hg||GRADES[0],GRADES.map(g=>[g,g]),'hg')}
 <label class="f mt">ملاحظة<input id="h_note"></label><button class="btn pri wide" data-a="hsave" data-id="${s.id}">${ic('check')} حفظ</button>`};
A.hsave=d=>{const s1=+val('h_s1'),s2=+val('h_s2'),a1=num(val('h_a1')),a2=num(val('h_a2'));if(!a2)return toast('اكتب إلى آية');if(a2>AYAT[s2])return toast(`سورة ${SURAS[s2]} آياتها ${AYAT[s2]}`);
 DB.hifz.push({id:uid(),sid:d.id,t:Date.now(),type:ui.ht||'h',s1,a1,s2,a2,pages:num(val('h_pg')),grade:ui.hg||GRADES[0],note:val('h_note')});flush();back();toast('تم ✓')};
SH.testform=p=>`<h3>سبر جزء</h3><label class="f">رقم الجزء<input id="ts_j" inputmode="numeric" data-focus></label><label class="f">العلامة من 100<input id="ts_m" inputmode="decimal"></label><button class="btn pri wide" data-a="testsave" data-id="${p.id}">${ic('check')} حفظ</button>`;
A.testsave=d=>{const j=num(val('ts_j')),m=num(val('ts_m'));if(!j||j>30)return toast('رقم الجزء من 1 لـ 30');DB.tests.push({id:uid(),sid:d.id,juz:j,mark:m,grade:m>=90?'ممتاز':m>=80?'جيد جداً':m>=70?'جيد':m>=60?'مقبول':'يعاد',t:Date.now()});flush();back()};

/* ---- استيراد ونسخ احتياطي ---- */
SH.import=()=>`<h3>استيراد ${L.stuP} من إكسل</h3><p style="color:var(--mut);margin:0 0 8px">انسخ الأعمدة من إكسل والصقها هون بهالترتيب:<br><b>الاسم - اسم الأب - هاتف الولي - ${L.cls}</b></p><textarea id="imp" class="inp" style="min-height:200px" placeholder="أحمد محمد	محمد	0944...	الصف الأول"></textarea><button class="btn pri wide mt" data-a="impok">${ic('down')} استيراد</button>`;
A.impok=()=>{let n=0;val('imp').split('\n').forEach(l=>{const c=l.split(/\t|;|,/).map(x=>x.trim());if(!c[0])return;let cl=DB.classes.find(x=>norm(x.name)===norm(c[3]||''));if(!cl&&c[3]){cl={id:uid(),name:c[3],fee:0,subs:Q?[]:SUBJ.slice(0,6).map(x=>({n:x,max:100}))};DB.classes.push(cl)}
 DB.students.push({id:uid(),no:++DB.seq,name:c[0],father:c[1]||'',phone:c[2]||'',cid:cl?cl.id:(DB.classes[0]||{}).id||'',gender:'m',join:today(),status:'active',docs:{}});n++});flush();back();toast(`تم استيراد ${n} ${L.stu}`)};
A.backup=()=>{const b=new Blob([JSON.stringify(DB)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`نسخة-${S().name||'الخنساء'}-${today()}.json`;a.click();toast('تم حفظ النسخة')};
A.restore=()=>{const i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.onchange=()=>{const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.set||!d.students)throw 0;if(!confirm('رح تنمسح البيانات الحالية وتنحط النسخة. متأكد؟'))return;DB=Object.assign(fresh(),d);flush();location.reload()}catch(e){toast('الملف مو نسخة صحيحة')}};r.readAsText(i.files[0])};i.click()};
/* نهاية e4.js */
