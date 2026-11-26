// لوحة الخنساء: الدفعة 4 (سعر الليرة اليوم + الليرة التركية)
// إذا كتبت رقم بخانة "سعر الصرف" بالإعدادات بيعتمدو، وإذا فاضية بيجيب السعر من الإنترنت لحالو
function get_(url) {
  try {
    const r = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'Accept-Language': 'ar,en;q=0.8' } });
    return { code: r.getResponseCode(), text: r.getContentText() };
  } catch (e) { return { code: 0, text: String(e) }; }
}
function plain_(h) {
  return h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
}
function newL_(x) { x = +String(x).replace(/,/g, '') || 0; return x > 2000 ? x / 100 : x; }
function spToday_() {
  const c = CacheService.getScriptCache(), k = 'sp_usd2';
  const hit = c.get(k);
  if (hit) return JSON.parse(hit);
  if (c.get('sp_fail')) return { buy: 0, sell: 0, dbg: ['انتظار 10 دقايق'] };
  const o = { buy: 0, sell: 0, dbg: [] };
  // المصدر 1: صفحة الدولار بالإنكليزي
  let g = get_('https://sp-today.com/en/currency/us_dollar');
  o.dbg.push('en:' + g.code);
  if (g.code === 200) {
    const t = plain_(g.text);
    const m = t.match(/([0-9][0-9,.]*)\s*SYP\s*for\s*buying\s*and\s*([0-9][0-9,.]*)\s*SYP\s*for\s*selling/i);
    if (m) { o.buy = newL_(m[1]); o.sell = newL_(m[2]); }
  }
  // المصدر 2: الصفحة الرئيسية
  if (!o.sell) {
    g = get_('https://sp-today.com/');
    o.dbg.push('home:' + g.code);
    if (g.code === 200) {
      const t = plain_(g.text);
      const m = t.match(/الدولار الأمريكي[\s\S]{0,300}?شراء\s*([0-9][0-9.,]*)[\s\S]{0,120}?مبيع\s*([0-9][0-9.,]*)/) || t.match(/الدولار[\s\S]{0,300}?شراء\s*([0-9][0-9.,]*)[\s\S]{0,120}?مبيع\s*([0-9][0-9.,]*)/);
      if (m) { o.buy = newL_(m[1]); o.sell = newL_(m[2]); }
      else { const i = t.indexOf('شراء'); o.dbg.push(i >= 0 ? t.slice(Math.max(0, i - 80), i + 80) : t.slice(0, 160)); }
    }
  }
  if (o.sell > 20 && o.sell < 2000) { o.dbg = []; c.put(k, JSON.stringify(o), 3600); } else c.put('sp_fail', '1', 600);
  return o;
}
function tryRate_() {
  const c = CacheService.getScriptCache(), k = 'try_usd';
  const hit = c.get(k);
  if (hit) return +hit;
  const g = get_('https://open.er-api.com/v6/latest/USD');
  let v = 0;
  try { v = +JSON.parse(g.text).rates.TRY || 0; } catch (e) {}
  v = Math.round(v * 100) / 100;
  if (v > 1) c.put(k, String(v), 3600);
  return v;
}
function rateInfo_() {
  const t = SpreadsheetApp.getActive().getSheetByName(SH_SET);
  const man = +t.getRange(1, 2).getValue() || 0;
  const tr = tryRate_();
  if (man > 0) return { rate: man, rateTry: tr, src: 'يدوي من الجدول' };
  const o = spToday_();
  if (o.sell > 0) return { rate: o.sell, buy: o.buy, rateTry: tr, src: 'الليرة اليوم' };
  return { rate: 0, rateTry: tr, src: 'ما قدرنا نجيب السعر', dbg: o.dbg };
}
function rateNow_(man) {
  const i = rateInfo_();
  return { rate: +man > 0 ? +man : (i.rate || 0), rateTry: i.rateTry || 0 };
}
// نهاية الدفعة 4
