// لوحة الخنساء: الدفعة 3 (النسخ الاحتياطي السحابي على Google Drive)
const SH_BK = 'النسخ السحابية', BK_ROOT = 'الخنساء - نسخ احتياطية', BK_KEEP = 10;
function route_(p) {
  if (p.a === 'bk') return bk_(p);
  if (p.a === 'bkget') return bkget_(p);
  return handle_(p);
}
function bkSheet_() {
  const ss = SpreadsheetApp.getActive();
  let s = ss.getSheetByName(SH_BK);
  if (!s) {
    s = ss.insertSheet(SH_BK);
    s.setRightToLeft(true);
    s.getRange(1, 1, 1, 7).setValues([['رقم الجهاز', 'المحل', 'رمز الاسترجاع', 'آخر نسخة', 'الحجم (KB)', 'عدد النسخ', 'التطبيق']])
      .setFontWeight('bold').setBackground('#14233F').setFontColor('#ffffff');
    s.setFrozenRows(1);
    s.getRange(2, 4, 1000, 1).setNumberFormat('yyyy-mm-dd hh:mm');
  }
  return s;
}
function bkFolder_(dev) {
  const it = DriveApp.getFoldersByName(BK_ROOT);
  const root = it.hasNext() ? it.next() : DriveApp.createFolder(BK_ROOT);
  const f = root.getFoldersByName(dev);
  return f.hasNext() ? f.next() : root.createFolder(dev);
}
function bkFiles_(fo) {
  const files = [], it = fo.getFiles();
  while (it.hasNext()) files.push(it.next());
  files.sort((a, b) => b.getDateCreated().getTime() - a.getDateCreated().getTime());
  return files;
}
function bk_(p) {
  const dev = String(p.dev || '').replace(/\D/g, '').slice(0, 10), key = String(p.key || '').replace(/\D/g, '');
  if (!dev || key.length < 6 || !p.data) return { ok: false, msg: 'بيانات النسخة ناقصة' };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const s = bkSheet_(), r = find_(s, dev);
    if (r) {
      const k = String(s.getRange(r, 3).getDisplayValue()).replace(/\D/g, '');
      if (k && k !== key) return { ok: false, msg: 'رمز الاسترجاع ما بيطابق، تواصل مع الدعم' };
    }
    const fo = bkFolder_(dev);
    fo.setDescription(String(p.store || ''));
    fo.createFile('backup-' + Utilities.formatDate(new Date(), 'Asia/Damascus', 'yyyy-MM-dd_HH-mm') + '.json', p.data, 'application/json');
    const files = bkFiles_(fo);
    files.slice(BK_KEEP).forEach(f => f.setTrashed(true));
    const row = ["'" + dev, p.store || '', "'" + key, new Date(), Math.round(p.data.length / 1024), Math.min(files.length, BK_KEEP), p.kind || ''];
    if (r) s.getRange(r, 1, 1, 7).setValues([row]); else s.appendRow(row);
    return { ok: true, bk: true };
  } finally {
    lock.releaseLock();
  }
}
function bkget_(p) {
  const dev = String(p.dev || '').replace(/\D/g, '').slice(0, 10), key = String(p.key || '').replace(/\D/g, '');
  const s = bkSheet_(), r = find_(s, dev);
  if (!r) return { ok: false, msg: 'ما في نسخ لهالجهاز' };
  const k = String(s.getRange(r, 3).getDisplayValue()).replace(/\D/g, '');
  if (k !== key) return { ok: false, msg: 'رمز الاسترجاع غلط' };
  const files = bkFiles_(bkFolder_(dev));
  if (!files.length) return { ok: false, msg: 'ما في نسخ لهالجهاز' };
  return { ok: true, data: files[0].getBlob().getDataAsString(), t: files[0].getDateCreated().getTime() };
}
// نهاية الدفعة 3
