cd /home/claude/app && python3 - <<'PY'
s=open('p4.js',encoding='utf8').read();m='/* ============ التشغيل ============ */';i=s.index(m)
open('all.js','w',encoding='utf8').write(open('p2.js',encoding='utf8').read()+open('p3.js',encoding='utf8').read()+s[:i]+open('p5.js',encoding='utf8').read()+'\n'+open('p6.js',encoding='utf8').read()+'\n'+open('p7.js',encoding='utf8').read()+'\n'+open('p8.js',encoding='utf8').read()+'\n'+open('p9.js',encoding='utf8').read()+'\n'+open('p10.js',encoding='utf8').read()+'\n'+open('p11.js',encoding='utf8').read()+'\n'+s[i:])
PY
node --check all.js || exit 1
mkdir -p www www-rest www-orders www-acc www-phone www-pharm www-cloth www-build www-solar www-stat www-sweet www-bake www-vet www-whole
for ED in shop rest orders acc phone pharm cloth build solar stat sweet bake vet whole; do
 case $ED in shop) OUT=www/index.html; NAME='الخنساء كاشير';; rest) OUT=www-rest/index.html; NAME='الخنساء للمطاعم';; orders) OUT=www-orders/index.html; NAME='الخنساء طلبات';; acc) OUT=www-acc/index.html; NAME='الخنساء محاسب';; phone) OUT=www-phone/index.html; NAME='الخنساء موبايل';; pharm) OUT=www-pharm/index.html; NAME='الخنساء صيدلية';; cloth) OUT=www-cloth/index.html; NAME='الخنساء للألبسة والأحذية';; build) OUT=www-build/index.html; NAME='الخنساء لمواد البناء';; solar) OUT=www-solar/index.html; NAME='الخنساء للطاقة الشمسية';; stat) OUT=www-stat/index.html; NAME='الخنساء للمكتبات والقرطاسية';; sweet) OUT=www-sweet/index.html; NAME='الخنساء للحلويات';; bake) OUT=www-bake/index.html; NAME='الخنساء للأفران';; vet) OUT=www-vet/index.html; NAME='الخنساء للصيدليات البيطرية';; whole) OUT=www-whole/index.html; NAME='الخنساء لتجار الجملة والموزعين';; esac
 (sed "s|<title>الخنساء كاشير</title>|<title>$NAME</title>|" p1.html; sed "s/const EDITION='__ED__'/const EDITION='$ED'/" all.js; printf "</script>\n</body>\n</html>\n<!-- نهاية الملف: index.html ($NAME 1.1.0) -->\n") > $OUT
done
grep -c "EDITION='shop'" www/index.html; grep -c "EDITION='rest'" www-rest/index.html; echo BUILD OK
