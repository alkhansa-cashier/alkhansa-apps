cd /home/claude/edu
cat e2.js e3.js e4.js e5.js > all.js && node --check all.js || exit 1
for ED in school quran; do
 case $ED in school) OUT=/home/claude/app/www-school; T='الخنساء لإدارة المدارس';; quran) OUT=/home/claude/app/www-quran; T='الخنساء للمعاهد والحلقات';; esac
 mkdir -p $OUT
 (sed "s|__TITLE__|$T|" e1.html; sed "s/const ED='__ED__'/const ED='$ED'/" all.js; printf "</script>\n</body>\n</html>\n<!-- نهاية الملف: $T -->\n") > $OUT/index.html
done
echo EDU OK
