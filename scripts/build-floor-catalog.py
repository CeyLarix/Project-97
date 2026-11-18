from pathlib import Path
import json,re,collections,datetime
root=Path(__file__).resolve().parents[1]
floer=json.loads((root/'dist/catalog-floer.json').read_text())
rm=json.loads((root/'dist/catalog-riviera.json').read_text())
palette={'brown':'#9e8061','natural':'#b69c79','beige':'#c3b299','grey':'#aaa59b','white':'#d6cabb','black':'#5b5750','terracotta':'#b17455','unknown':'#b49b7d','green':'#7f927d','blue':'#879da9','red':'#b17d69','silver':'#b8b8b1'}
material_map={'pvc':'pvc','laminate':'laminate','hybrid-wood':'hybrid','wood':'wood','ceramic':'ceramic','terracotta':'terracotta'}
labels={'pvc':'PVC','laminate':'Hybride laminaat','hybrid':'Hybride hout','wood':'Eiken parket','ceramic':'Keramiek','terracotta':'Terracotta'}

def clean(text):return re.sub(r'\s+',' ',str(text or '')).strip()
def adjusted(color,factor):
 rgb=[int(color[i:i+2],16)for i in [1,3,5]]
 return '#'+''.join(f'{max(0,min(255,round(v*factor))):02x}'for v in rgb)
def fallback_color(p):
 tone=p.get('tone',{});family=tone.get('family','unknown')if isinstance(tone,dict)else'unknown';name=clean(p.get('name')).lower();names=clean(p.get('color')).lower()
 if p.get('floorType')=='terracotta':return '#b37e60'if'beige'in name else'#a2674b'
 if 'groen'in names:return palette['green']
 if 'blauw'in names:return palette['blue']
 if 'rood'in names:return palette['red']
 if 'zilver'in names:return palette['silver']
 if any(v in name for v in ['onbehandeld','natuur eik','naturel']):return palette['natural']
 if any(v in name for v in ['donker','gerookt','robuust']):return '#8c735b'
 if any(v in name for v in ['crème','creme','beige','zand']):return palette['beige']
 return palette.get(family,palette['unknown'])
def entry(p,is_rm=False):
 material='pvc'if is_rm else material_map[p['floorType']]
 source=p['officialURL']if is_rm else p['sourceUrl']
 fmt=p.get('dimensionsMetres',{})if is_rm else p.get('format',{})
 length=fmt.get('length')if is_rm else fmt.get('lengthM');width=fmt.get('width')if is_rm else fmt.get('widthM')
 variants=[]if is_rm else fmt.get('variants',[])
 if (not length or not width)and variants:length=variants[0].get('lengthM');width=variants[0].get('widthM')
 color=p.get('swatch')if is_rm else p.get('sampleColor')or fallback_color(p)
 color=color if isinstance(color,str)and re.fullmatch('#[a-fA-F0-9]{6}',color)else'#b49b7d'
 tone=p.get('tone','');tone=tone.get('name')or tone.get('family')or''if isinstance(tone,dict)else tone
 installation=p.get('installation','');install_label={'glue-down':'Dryback','click':'Click','Dryback (te verlijmen)':'Dryback'}.get(installation,installation)
 pattern=p['pattern'];name=clean(p['name']);display=re.sub(r'^Floer\s+','',name)if not is_rm else name
 return {
  'id':p['id'],'brand':'Rivièra Maison'if is_rm else'Floer','name':display,'officialName':name,
  'sku':p.get('sku')or p.get('manufacturerSKU'),'collection':p.get('collection',''),
  'subtitle':' · '.join(filter(None,[p.get('patternLabel',''),clean(install_label)])),
  'description':clean(p.get('color','')),'color':clean(p.get('color','')),'tone':clean(tone),
  'pattern':pattern,'material':material,'materialLabel':labels[material],
  'surface':'stone'if material=='terracotta'or pattern=='tile'else'wood',
  'swatch':color,'colors':[color,adjusted(color,1.055),adjusted(color,.945)],
  'dimensions':{'length':length,'width':width,'unit':'m'},'formats':variants,
  'dimensionsApproximate':not(bool(length)and bool(width)),
  'preview':p['thumbnail'],'imageKind':p.get('thumbnailType')or p.get('imageKind','product-photo'),
  'textureImage':None,'source':{'title':('Rivièra Maison · 'if is_rm else'Floer · ')+display,'url':source},
  'note':'Officieel productbeeld; de vloer in 3D is een digitale benadering van kleur, structuur en patroon.',
  'colorBasis':'Approximate interpretation of supplier photo and colour description'if is_rm else('Uncalibrated supplier-product-image RGB sample'if p.get('sampleColor')else'Supplier colour description, approximate digital palette'),
  'discontinued':bool(p.get('discontinued',False)),'sourceImageWarning':('De leverancier hergebruikt bij deze kleur een detailfoto. De digitale tint volgt de omschrijving warmgrijs.' if p.get('sourceImageWarning') else p.get('imageWarning')),
 }
products=[entry(p,True)for p in rm['products']]+[entry(p)for p in floer['products']]
products.sort(key=lambda p:(0 if p['brand']=='Rivièra Maison' else 1,p['collection'],p['name']))
ids=[p['id']for p in products];assert len(ids)==len(set(ids))
assert len(rm['products'])==12 and len(floer['products'])==floer['counts']['total']
meta={'verifiedAt':'2026-11-17','riviera':{'products':12,'pvc':12,'designs':6,'source':rm['officialCollectionURL']},'floer':{'products':floer['counts']['total'],'pvc':floer['counts']['byFloorType']['pvc'],'byMaterial':floer['counts']['byFloorType'],'source':'https://floer.nl/','coverage':floer['coverage']},'note':'Op 17 november 2026 gecontroleerde officiële publieke collecties. Accessoires en wandproducten zijn uitgesloten. Productfoto’s zijn geen gekalibreerde 3D-materiaalscans.'}
out='// Generated by scripts/build-floor-catalog.py from the checked official catalogues.\n'
out+='export const BRAND_CATALOG='+json.dumps(products,ensure_ascii=False,separators=(',',':'))+';\n'
out+='export const CATALOG_META='+json.dumps(meta,ensure_ascii=False,separators=(',',':'))+';\n'
out+="export const FLOOR_ALIASES={'greige-tile':'floer-143021','light-chevron':'floer-124494'};\n"
(root/'dist/catalog.js').write_text(out)
print('Normalized',len(products),'brand choices;',collections.Counter(p['brand']for p in products))
