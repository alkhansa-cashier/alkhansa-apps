// لوحة الخنساء: الدفعة 4 (سعر الليرة اليوم من موقع الليرة اليوم)
// إذا كتبت رقم بخانة "سعر الصرف" بالإعدادات بيعتمدو، وإذا فاضية بيجيب السعر من الموقع لحالو
function spToday_() {
  const c = CacheService.getScriptCache(), k = 'sp_usd';
  const hit = c.get(k);
  if (hit) return JSON.parse(hit);
  let o = { buy: 0, sell: 0 };
  try {
    const r = UrlFetchApp.fetch('https://sp-today.com/', { muteHttpExceptions: true, followRedirects: true, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'ar' } });
    if (r.getResponseCode() === 200) {
      const t = r.getContentText().replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
      const m = t.match(/الدولار الأمريكي[\s\S]{0,300}?شراء\s*([0-9][0-9.,]*)[\s\S]{0,120}?مبيع\s*([0-9][0-9.,]*)/) || t.match(/الدولار[\s\S]{0,300}?شراء\s*([0-9][0-9.,]*)[\s\S]{0,120}?مبيع\s*([0-9][0-9.,]*)/);
      if (m) { o.buy = +m[1].replace(/,/g, ''); o.sell = +m[2].replace(/,/g, ''); }
      // الموقع بيكتب بالليرة الجديدة، إذا طلع رقم كبير يعني قديمة
      if (o.buy > 2000) o.buy = o.buy / 100;
      if (o.sell > 2000) o.sell = o.sell / 100;
    }
  } catch (e) {}
  if (o.sell > 20 && o.sell < 2000) c.put(k, JSON.stringify(o), 3600);
  return o;
}
function rateInfo_() {
  const t = SpreadsheetApp.getActive().getSheetByName(SH_SET);
  const man = +t.getRange(1, 2).getValue() || 0;
  if (man > 0) return { rate: man, src: 'يدوي من الجدول' };
  const o = spToday_();
  if (o.sell > 0) return { rate: o.sell, buy: o.buy, src: 'الليرة اليوم' };
  return { rate: 0, src: 'ما قدرنا نجيب السعر' };
}
function rateNow_(man) {
  if (+man > 0) return +man;
  return rateInfo_().rate || 0;
}
// نهاية الدفعة 4
