import json,re,urllib.request,urllib.parse,concurrent.futures,collections
from pathlib import Path
from PIL import Image,ImageStat
root=Path(__file__).resolve().parents[1];dest=root/'dist/assets/catalog/belakos';dest.mkdir(parents=True,exist_ok=True)
# Read the same public product index used by the official catalogue. Never save its key.
html=urllib.request.urlopen('https://www.belakos.nl/catalogus?categorie=PVC&type=Dryback').read().decode()
settings=json.loads(re.search(r'<script[^>]*id="algolia-index-data"[^>]*>(.*?)</script>',html,re.S)[1])
app=settings['algoliaApplicationId'];index=settings['algoliaIndexName']
request=urllib.request.Request('https://'+app.lower()+'-dsn.algolia.net/1/indexes/'+index+'/query',data=json.dumps({'query':'','hitsPerPage':1000}).encode(),headers={'X-Algolia-Application-Id':app,'X-Algolia-API-Key':settings['algoliaApiKey'],'Content-Type':'application/json'})
allhits=json.load(urllib.request.urlopen(request))
hits=[x for x in allhits['hits']if x['productId']=='PVC'and x['floorType']=='Dryback'and x['pattern']!='Traptredenset']
urls={x['productID']:x['productUrl']for x in settings['productUrls']}
assert len(allhits['hits'])==allhits['nbHits'];assert hits, 'No Dryback floor products returned'
cdn='https://cdn.media.belakos.index.nl/'
def download(p):
 key='belakos-'+str(p['bcId']).lower();file=dest/(key+'.jpg');url=cdn+urllib.parse.quote(p['mainImage'],safe='/')
 if not file.exists():
  urllib.request.urlretrieve(url,file)
 with Image.open(file)as im:
  im.verify()
 with Image.open(file).convert('RGB')as im:
  w,h=im.size;crop=im.crop((w*.2,h*.2,w*.8,h*.8));rgb=ImageStat.Stat(crop).median;swatch='#'+''.join(f'{round(v):02x}'for v in rgb)
  im.thumbnail((480,480));im.save(file,quality=83,optimize=True)
 return { 'id':key,'brand':'Belakos','name':p['name'].strip(),'sku':p['bcId'],'collection':p['serieCollection'].strip(),'series':p['serieName'].strip(),'installation':'glue-down','floorType':'Dryback','material':'pvc','pattern':{'Rechte plank':'plank','Visgraat':'herringbone','Walvisgraat':'herringbone','Hongaarse punt':'chevron','Tegel':'tile'}[p['pattern']],'patternLabel':p['pattern'],'dimensionsMetres':{'length':float(p['length'])/1000,'width':float(p['width'])/1000},'thicknessMm':p['thickness'],'color':', '.join(p['colors']),'swatch':swatch,'thumbnail':'assets/catalog/belakos/'+file.name,'imageKind':'product-photo','officialURL':'https://www.belakos.nl'+urls[p['NlPlateId']],'sourceImageURL':url,'sourceRecordId':p['NlPlateId'],'imageWarning':'De officiële catalogus gebruikt voor Puro visgraat XL 42 dezelfde afbeelding als voor 44; het productbeeld kan afwijken.' if p['name'].strip()=='Puro visgraat XL 42' else None}
with concurrent.futures.ThreadPoolExecutor(max_workers=6)as pool:products=list(pool.map(download,hits))
products.sort(key=lambda p:(p['collection'],p['name']));result={'brand':'Belakos','verifiedAt':'2026-11-18','officialCollectionURL':'https://www.belakos.nl/catalogus?categorie=PVC&type=Dryback','coverage':'Alle 120 publieke PVC Dryback vloerproducten uit de officiële catalogus. Rigid Click, tapijt en 8 traptredensets uitgesloten. Kleuren en legvarianten apart opgenomen.','counts':{'total':len(products),'byPattern':dict(collections.Counter(p['patternLabel']for p in products)),'collections':len(set(p['collection']for p in products))},'products':products}
(root/'dist/catalog-belakos.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print('Imported',len(products),'Dryback floors;',result['counts']);print('Images bytes',sum(f.stat().st_size for f in dest.glob('*.jpg')))
