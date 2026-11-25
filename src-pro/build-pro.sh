cd /home/claude/pro
cat k0.js k2.js k3.js k4.js k6.js k7.js k5.js > all.js && node --check all.js || exit 1
python3 - <<'PY'
import re
s=open('all.js',encoding='utf8').read();h=open('k1.html',encoding='utf8').read()
names=dict(re.findall(r"\n (\w+):\{app:'([^']+)'",s))
for ed,t in names.items():
    import os;d=f'/home/claude/app/www-{ed}';os.makedirs(d,exist_ok=True)
    open(d+'/index.html','w',encoding='utf8').write(h.replace('__TITLE__',t)+s.replace("const ED='__ED__'",f"const ED='{ed}'")+f"</script>\n</body>\n</html>\n<!-- نهاية الملف: {t} -->\n")
print('PRO OK',list(names))
PY
