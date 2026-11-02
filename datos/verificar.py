import json,re,html,statistics
D=json.load(open('calc-datos.json'))
def txt(b): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',b or '')))
def n(s): return float(s.replace(',','.'))
PAT=re.compile(r'(\d+(?:[.,]\d+)?)\s*(ml|cc|gotas?|drops?|g|gr|gramos)\b[^.\d]{0,45}?(?:por cada|por|para|cada|/|en)\s*(\d+(?:[.,]\d+)?)\s*(litros?|lts?|l\b|galones|gal\b|gallons?)',re.I)
FULL={};L=[]
for d in D:
    j=json.load(open(f"js/{d['h'][:150]}.json")); t=txt(j['description']); FULL[d['h']]={'desc':t,'variants':[(v['title'],v['price']/100,v['available']) for v in j['variants']]}; L.append(len(t))
print('largo descripción: máx',max(L),'mediana',statistics.median(L))
res={'confirma':[],'contradice':[],'sin evidencia':[]}
for d in D:
    t=FULL[d['h']]['desc'];m=re.match(r'^\s*([\d.,]+)\s*(ml|g)?\s*/\s*([\d.,]+)\s*L',d['d'] or '')
    ref=n(m.group(1))/n(m.group(3)) if m else None
    ev=[]
    for x in PAT.finditer(t):
        a=n(x.group(1));u=x.group(2).lower();Lt=n(x.group(3))
        if x.group(4).lower().startswith('gal'):Lt*=3.785
        if u.startswith(('gota','drop')):a/=20
        ev.append((a/Lt,x.group(0)[:100]))
    if ref is None or not ev: res['sin evidencia'].append(d['t'][:62]);continue
    if any(abs(e[0]-ref)/ref<0.15 for e in ev): res['confirma'].append(d['t'][:62])
    else: res['contradice'].append((d['t'][:62],d['d'],d['r'],[round(e[0],4) for e in ev][:4],ev[0][1]))
for k,v in res.items():print(k,len(v))
for r in res['contradice']:print(' ',r)
print('--- SIN EVIDENCIA:');[print('  ',x) for x in res['sin evidencia']]
json.dump(FULL,open('descripciones-completas.json','w'),ensure_ascii=False);json.dump(res,open('verif-body2.json','w'),ensure_ascii=False,indent=1)
