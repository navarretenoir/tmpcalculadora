#!/usr/bin/env python3
"""Arma dist/tmp-calculadora-flotante.js (un solo archivo autocontenido) para inyectar en la app de Tu Mundo Pet:
flotante/flotante.js + flotante/flotante.css + app/js/calc.js + los datos de productos (con la miniatura de la tienda)."""
import json,re,os,sys
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));os.chdir(R)
prod=json.loads(re.search(r'window\.TMP_PRODUCTOS=(\[.*?\]);window\.TMP_FECHA',open('app/datos/productos.js',encoding='utf-8').read(),re.S).group(1))
fecha=re.search(r'TMP_FECHA="([^"]+)"',open('app/datos/productos.js').read()).group(1)
calc={d['h']:d for d in json.load(open('datos/calc-datos.json'))}
P=[]
for p in prod:
    img=calc[p['h']]['img'].split('&width')[0]; img=('https:'+img if img.startswith('//') else img)+'&width=160'
    P.append({k:p[k] for k in ('h','n','p','r','ml','u','d','fam','agua','est','nota','ficha','vend')}|{'img':img})
f=fecha.split('-'); import datetime
fh=datetime.date(int(f[0]),int(f[1]),int(f[2])); meses=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
fecha_txt=f"{fh.day} de {meses[fh.month-1]} de {fh.year}"
js=open('flotante/flotante.js',encoding='utf-8').read()
js=js.replace('/*@@CALC@@*/',open('app/js/calc.js',encoding='utf-8').read())
js=js.replace('/*@@DATOS@@*/',json.dumps(P,ensure_ascii=False,separators=(',',':')))
js=js.replace('/*@@CSS@@*/',json.dumps(open('flotante/flotante.css',encoding='utf-8').read()))
js=js.replace('/*@@FECHA@@*/',json.dumps(fecha_txt))
os.makedirs('dist',exist_ok=True);open('dist/tmp-calculadora-flotante.js','w',encoding='utf-8').write(js)
print('dist/tmp-calculadora-flotante.js',len(js)//1024,'KB;',len(P),'productos')
