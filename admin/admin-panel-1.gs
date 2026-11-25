// لوحة الخنساء: الدفعة 1 من 2
const SH_SHOPS = 'المحلات', SH_SET = 'الإعدادات', SH_LOG = 'السجل';
const COLS = ['رقم الجهاز','المحل','صاحب المحل','الهاتف','التطبيق','الحالة','ينتهي في','الباقة','أول ظهور','آخر ظهور','الإصدار','ملاحظات'];
const TRIAL_DAYS = 10;

// شغّل هالدالة مرة وحدة بس: بتجهز الأوراق
function setup() {
  const ss = SpreadsheetApp.getActive();
  const s = ss.getSheetByName(SH_SHOPS) || ss.insertSheet(SH_SHOPS);
  s.getRange(1, 1, 1, COLS.length).setValues([COLS]).setFontWeight('bold').setBackground('#14233F').setFontColor('#ffffff');
  s.setFrozenRows(1); s.setRightToLeft(true);
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(['تجربة','فعّال','موقوف'], true).build();
  s.getRange(2, 6, 1000, 1).setDataValidation(rule);
  s.getRange(2, 7, 1000, 1).setNumberFormat('yyyy-mm-dd');
  s.getRange(2, 9, 1000, 2).setNumberFormat('yyyy-mm-dd hh:mm');
  const t = ss.getSheetByName(SH_SET) || ss.insertSheet(SH_SET);
  t.setRightToLeft(true);
  if (!t.getRange('A1').getValue()) {
    t.getRange(1, 1, 7, 2).setValues([
      ['سعر الصرف', ''], ['رسالة للزبائن', ''], ['رقم الرسالة', 1], ['آخر إصدار', ''],
      ['رابط التحديث', 'https://alkhansaa-tech.com'], ['تحديث إجباري', 'لا'], ['ملاحظات التحديث', '']
    ]);
    t.getRange('A1:A7').setFontWeight('bold');
  }
  const l = ss.getSheetByName(SH_LOG) || ss.insertSheet(SH_LOG);
  l.setRightToLeft(true);
  if (!l.getRange('A1').getValue()) l.getRange(1, 1, 1, 4).setValues([['الوقت','رقم الجهاز','الحدث','تفاصيل']]).setFontWeight('bold');
  ['Sheet1','ورقة1','الورقة1'].forEach(n => { const d = ss.getSheetByName(n); if (d && ss.getSheets().length > 1) ss.deleteSheet(d); });
}

// قائمة الخنساء فوق بالجدول
function onOpen() {
  SpreadsheetApp.getUi().createMenu('⭐ الخنساء')
    .addItem('تفعيل شهري (30 يوم)', 'actMonth')
    .addItem('تفعيل سنوي (365 يوم)', 'actYear')
    .addItem('تفعيل مدى الحياة', 'actLife')
    .addItem('تمديد أيام…', 'actDays')
    .addSeparator()
    .addItem('⛔ إيقاف الاشتراك', 'actStop')
    .addItem('✅ إعادة تشغيل', 'actResume')
    .addToUi();
}

function row_() {
  const s = SpreadsheetApp.getActiveSheet();
  if (s.getName() !== SH_SHOPS) throw new Error('افتح ورقة المحلات وحدد سطر المحل');
  const r = s.getActiveRange().getRow();
  if (r < 2) throw new Error('حدد سطر محل');
  return { s, r };
}
function extend_(days, pack) {
  const { s, r } = row_();
  const cur = s.getRange(r, 7).getValue();
  const base = Math.max(Date.now(), cur instanceof Date ? cur.getTime() : 0);
  s.getRange(r, 7).setValue(new Date(base + days * 864e5));
  s.getRange(r, 6).setValue('فعّال');
  if (pack) s.getRange(r, 8).setValue(pack);
  log_(s.getRange(r, 1).getDisplayValue(), 'تفعيل', pack || (days + ' يوم'));
  SpreadsheetApp.getActive().toast('تم التفعيل ✓ ' + s.getRange(r, 2).getValue());
}
function actMonth() { extend_(30, 'شهري'); }
function actYear() { extend_(365, 'سنوي'); }
function actLife() { extend_(365 * 200, 'مدى الحياة'); }
function actDays() {
  const ui = SpreadsheetApp.getUi(), a = ui.prompt('كم يوم بدك تمدد؟');
  if (a.getSelectedButton() !== ui.Button.OK) return;
  const n = parseInt(a.getResponseText(), 10);
  if (n > 0) extend_(n, '');
}
function actStop() {
  const { s, r } = row_();
  s.getRange(r, 6).setValue('موقوف');
  log_(s.getRange(r, 1).getDisplayValue(), 'إيقاف', '');
  SpreadsheetApp.getActive().toast('تم الإيقاف ⛔');
}
function actResume() {
  const { s, r } = row_();
  const u = s.getRange(r, 7).getValue();
  s.getRange(r, 6).setValue(u instanceof Date && u.getTime() > Date.now() ? 'فعّال' : 'تجربة');
  log_(s.getRange(r, 1).getDisplayValue(), 'إعادة تشغيل', '');
  SpreadsheetApp.getActive().toast('تم ✓');
}
function log_(dev, ev, det) {
  const l = SpreadsheetApp.getActive().getSheetByName(SH_LOG);
  if (l) l.appendRow([new Date(), "'" + dev, ev, det || '']);
}
// نهاية الدفعة 1
