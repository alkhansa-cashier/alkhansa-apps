// لوحة الخنساء: الدفعة 2 من 2 (الاتصال مع التطبيق)
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function find_(s, dev) {
  const n = s.getLastRow();
  if (n < 2) return 0;
  const v = s.getRange(2, 1, n - 1, 1).getDisplayValues();
  for (let i = 0; i < v.length; i++) if (String(v[i][0]).replace(/\D/g, '') === dev) return i + 2;
  return 0;
}
function settings_() {
  const t = SpreadsheetApp.getActive().getSheetByName(SH_SET);
  const v = t.getRange(1, 2, 7, 1).getValues().map(r => r[0]);
  return {
    rate: +v[0] || 0,
    msg: v[1] ? { id: String(v[2] || 1), text: String(v[1]) } : null,
    ver: String(v[3] || ''), url: String(v[4] || ''),
    force: v[5] === 'نعم', notes: String(v[6] || '')
  };
}
function handle_(p) {
  const dev = String(p.dev || '').replace(/\D/g, '').slice(0, 10);
  if (!dev) return { ok: false, msg: 'no dev' };
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const s = SpreadsheetApp.getActive().getSheetByName(SH_SHOPS), now = new Date();
    let r = find_(s, dev);
    if (!r) {
      const pf = +p.first || 0;
      const first = pf > 1.6e12 && pf < now.getTime() ? new Date(pf) : now;
      s.appendRow(["'" + dev, p.store || '', p.owner || '', p.phone ? "'" + p.phone : '', p.kind || '', 'تجربة', '', '', first, now, p.ver || '', '']);
      r = s.getLastRow();
      log_(dev, 'تسجيل جديد', p.store || '');
    }
    const row = s.getRange(r, 1, 1, 12).getValues()[0];
    if (p.store && p.store !== row[1]) s.getRange(r, 2).setValue(p.store);
    if (p.owner && !row[2]) s.getRange(r, 3).setValue(p.owner);
    if (p.phone && !row[3]) s.getRange(r, 4).setValue("'" + p.phone);
    if (p.kind) s.getRange(r, 5).setValue(p.kind);
    s.getRange(r, 10).setValue(now);
    if (p.ver) s.getRange(r, 11).setValue(p.ver);
    let until = row[6] instanceof Date ? row[6].getTime() : 0;
    const local = +p.until || 0;
    if (!until && local > Date.now()) {
      until = local;
      s.getRange(r, 7).setValue(new Date(local));
      s.getRange(r, 6).setValue('فعّال');
      s.getRange(r, 8).setValue('كود');
      log_(dev, 'تفعيل بكود', '');
    }
    const first = row[8] instanceof Date ? row[8].getTime() : now.getTime();
    const st = s.getRange(r, 6).getValue();
    return Object.assign({
      ok: true,
      status: st === 'موقوف' ? 'stop' : (until > Date.now() ? 'active' : 'trial'),
      until: until, first: first, trialDays: TRIAL_DAYS
    }, settings_());
  } finally {
    lock.releaseLock();
  }
}
function doGet(e) {
  try { return out_(route_(e.parameter || {})); } catch (err) { return out_({ ok: false, msg: String(err) }); }
}
function doPost(e) {
  try { return out_(route_(JSON.parse(e.postData.contents || '{}'))); } catch (err) { return out_({ ok: false, msg: String(err) }); }
}
// نهاية الدفعة 2
