#!/usr/bin/env python3
"""Arma app/datos/productos.js a partir de lo que publica la tienda (datos/calc-datos.json = lo que usa su calculadora,
datos/descripciones-completas.json = fichas) + la auditoría (verificar.py) y las correcciones documentadas en AUDITORIA.md.
Descarga también las miniaturas (240 px) a app/img/. Desarrollado por Javiera Navarrete para Tu Mundo Pet."""
import json,re,os,time,subprocess,collections
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));os.chdir(R)
D=json.load(open('datos/calc-datos.json'));F=json.load(open('datos/descripciones-completas.json'));V=json.load(open('datos/verif-body2.json'))
CAT={p['handle']:p for p in json.load(open('datos/catalogo-completo.json'))}
UA="Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0"
conf=set(V['confirma']);sin=set(V['sin evidencia'])
# --- correcciones y marcas de la auditoría (ver AUDITORIA.md) ---
FRITZPOND_OK=("FRITZPOND Algae Clean Out",)          # la ficha trae "5 ml por cada 227 L": coincide con 2,5 ml/114 L
def corregir(d,t):
    """devuelve (r, dosis_texto, estado, nota)"""
    r,dd=d['r'],d['d'];est=None;nota=''
    if 'Aquasana Prodac - 100ml' in t: return 5000.0,'10 ml / 500 L','corregido','La tienda mostraba 25.000 L (copiado del envase de 500 ml); la ficha dice 10 ml por 500 L, así que 100 ml rinden 5.000 L.'
    if 'Fritzzyme Monster 360' in t: return r*2,'2.5 ml / 95 L','corregido','La ficha del proveedor declara el doble de rendimiento que la calculadora de la tienda; se usa el de la ficha.'
    if 'Parashield' in t: return round(118/5*100,1),'5 ml / 100 L','corregido','Dosis de la ficha para agua dulce (5 ml por 100 L). En acuarios de arrecife la ficha pide la mitad.'
    if t.startswith('Abono específico - Fosfo'): return r,dd,'porconfirmar','La ficha habla de subir el PO4 (10 ml por 500 L aumentan 0,1 mg/L), no de una dosis fija: depende de tu medición.'
    if t.startswith('eSHa2000'): return r,dd,'porconfirmar','El rendimiento (800 L) y la dosis (1 ml/100 L → 2.000 L) no coinciden entre sí y la ficha no trae dosis.'
    if 'Stress Defense F' in t: return 1900.0,'5 ml / 38 L','corregido','La ficha dice «250 ml rinde 1.900 litros».'
    if any(k in t for k in FRITZPOND_OK) or t in conf or t[:62] in conf: est='ficha'
    elif t[:62] in sin: est='sinficha'
    else: est='ficha'
    return r,dd,est,nota
def familia(t,f,tipo):
    s=t.lower()
    reglas=[('Antialgas',r'antialga|algae|algexit|vamoss|remalgae|bioxit|fuzzout|excital'),
            ('Acondicionadores y anticloro',r'anticloro|acondicionador|aquasana|guard|fraction|dark water|complete|flora viv|elevador|estabilizador'),
            ('Bacterias y filtración biológica',r'bacteri|fritzzyme|turbo ?clean|bactergen|nitribiotic|probi|360|canutillos'),
            ('Medicamentos',r'medicament|rescue|copper|voogle|fixick|parashield|levamicil|esha|stress defense|flatworm|punto blanco|parasit|parásit|antihongo'),
            ('Plantas, abonos y CO₂',r'abono|easycarbo|co2|fosfo|profito|greenscape|ferro|nitrat'),
            ('Minerales y suplementos marinos',r'reeflowers|elements|b-color|f-color|minerals|all for reef|tropic marin|calcio|magnes|strontium|iodide|aqua ocean|rpm|shrimps|minaroll'),
            ('Alimento para corales',r'blast|ocean snow|coral|bioviv|garlic'),
            ('Aclarantes y filtración química',r'clarifer|clarion|aclar|blue dye|mutacal|removedor|neutralizer|fuzz')]
    for n,rx in reglas:
        if re.search(rx,s):return n
    return f or 'Otros tratamientos'
def agua(t):
    s=t.lower()
    if re.search(r'pileta|estanque|pond|koi',s):return 'estanque'
    if re.search(r'marin|reef|coral|tropic marin|reeflowers|aqua ocean|rpm|zoo|micro ?blast|chroma|nitribiotic|bactergen|clarion|ocean snow|rescue fish m',s):return 'marino'
    return 'dulce'
def dosis_ficha(desc):
    ss=re.split(r'(?<=[.!?])\s+',desc);hit=[s for s in ss if re.search(r'(ml|gota|cucharad|tapa|\bg\b|gramos)',s,re.I) and re.search(r'(litro|gal[oó]n|\bL\b|gal\b|lts)',s,re.I)]
    return ' '.join(hit[:2])[:320]
os.makedirs('app/img',exist_ok=True);out=[];i=0
for d in D:
    j=json.load(open(f"datos/js/{d['h'][:150]}.json"));t=d['t'];i+=1
    r,dd,est,nota=corregir(d,t)
    m=re.match(r'^\s*([\d.,]+)\s*(ml|g)\s*/\s*([\d.,]+)\s*L',dd or '');ratio=None;unidad='ml'
    if m: ratio=float(m.group(1).replace(',','.'))/float(m.group(3).replace(',','.'));unidad=m.group(2)
    if est=='porconfirmar' and t.startswith('Abono específico - Fosfo'): ratio=None
    img=f"img/{i:03d}.webp";fn='app/'+img
    if not os.path.exists(fn) or os.path.getsize(fn)<500:
        u='https:'+d['img'].split('&width')[0]+'&width=240'
        subprocess.run(['curl','-s','-A',UA,'-o',fn,u]);time.sleep(0.15)
    v=j['variants'][0];tipo=CAT[d['h']]['product_type']
    out.append({'id':i,'h':d['h'],'n':t,'p':d['p'],'r':r,'ml':round(ratio,6) if ratio else None,'u':unidad,'d':dd,'fam':familia(t,d['f'],tipo),'agua':agua(t),'est':est,'nota':nota,'ficha':dosis_ficha(F[d['h']]['desc']),'disp':bool(v['available']),'img':img,'vend':CAT[d['h']]['vendor']})
cnt=collections.Counter(o['est'] for o in out);print(cnt,collections.Counter(o['fam'] for o in out).most_common(),collections.Counter(o['agua'] for o in out))
open('app/datos/productos.js','w').write('window.TMP_PRODUCTOS='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';window.TMP_FECHA="2026-11-02";')
print('productos.js',os.path.getsize('app/datos/productos.js')//1024,'KB; imágenes',len(os.listdir('app/img')))
