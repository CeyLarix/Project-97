import sys,json,struct,gzip,math
from pathlib import Path
import numpy as np
from read_bpd import read
ROOT=Path(__file__).resolve().parents[1];SRC=ROOT/'sources/neighborhood';OUT=ROOT/'dist/assets/neighborhood'
models=json.loads((SRC/'model-versions.json').read_text());ref=json.loads((ROOT/'sources/exterior/model-versions.json').read_text())[1]
# E_00_Base is the local reference used by the existing house97 scene.
ref=next(m for m in json.loads((ROOT/'sources/exterior/model-versions.json').read_text()) if m.get('buildingIndex')==97)
def rot(a):return np.array([[math.cos(a),-math.sin(a)],[math.sin(a),math.cos(a)]])
def transform(v,m):
 delta=np.array([(m['refLongitude']-ref['refLongitude'])*111194.9266*math.cos(math.radians(ref['refLatitude'])),(m['refLatitude']-ref['refLatitude'])*111194.9266]);p=(v[:,:2]*[-1 if m['flippedX'] else 1,-1 if m['flippedY'] else 1])@rot(m['rotation']).T;p=(p+delta)@rot(-ref['rotation']).T
 return np.stack([135.55+p[:,0],v[:,2]+m['heightOffset']-ref['heightOffset'],p[:,1]-58.95],axis=-1)
def load(m):
 b=(SRC/f'{m["targetId"]}.json').read_bytes();j=json.loads(gzip.decompress(b) if b[:2]==b'\x1f\x8b' else b);lookup={}
 def walk(x):
  if isinstance(x,dict):
   if 'ifc_guid'in x:lookup[x['ifc_guid']]=x['ifc_class']
   for v in x.values():walk(v)
  elif isinstance(x,list):
   for v in x:walk(v)
 walk(j)
 return [(o,lookup.get(o['object']['guid'],'unknown')) for o in read(SRC/f'{m["targetId"]}.bin')]
def lin(x):return x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4
def material_info(raw):
 name=raw['name'];category=None
 if 'baksteen'in name:category=('brown' if 'Chiara'in name and 'Zagora'not in name else 'orange' if 'Cerite'in name and 'Zagora'not in name else 'beige')+('-vertical' if 'rollaag'in name else '')
 if 'keramisch_pan'in name or 'Kokerpan'in name:category='roof'
 if 'isolatie_eps_plaat_dak'in name:category='flat-roof'
 color=raw.get('color',[.7,.7,.7]);glass='glas'in name.lower() or 'glass'in name.lower()
 if any(x in name for x in ['RAL7039','RAL 7039','Window_Grey']):color=[.525,.463,.376]
 if glass:color=[.44,.57,.61]
 if category:color=[1,1,1] if 'roof'not in category else [.4,.42,.44]
 return {'name':category or name,'pbrMetallicRoughness':{'baseColorFactor':[*(lin(float(x)) for x in color),.65 if glass else 1],'metallicFactor':.2 if glass else 0,'roughnessFactor':.14 if glass else .88},**({'alphaMode':'BLEND','doubleSided':True} if glass else {}),'extras':{'sourceMaterial':name,'category':category}}
def export(num):
 ms=[m for m in models if m['buildingIndex']==num];m=ms[0];records=[];doorpts=[]
 if num==100:
  s=(SRC/'casabakici-bpd-data.js').read_text();levels=json.loads(s.split('export const BPD_LEVELS=',1)[1].rstrip(';\n '))
  for level in levels:
   for o in level['meshes']:
    v=np.array(o['position']).reshape(-1,3);raw=np.stack([v[:,0]+50.12,222.72-v[:,2],v[:,1]+level['elevation']],axis=-1)
    records.append(({'object':{'name':o['name'],'guid':o['id'],'elevation':level['elevation']},'verts':raw,'idx':np.array(o['index'],dtype=np.uint32),'mat':o['material']},o['ifcClass'],m))
 else:
  for model in ms:
   for o,cls in load(model):records.append((o,cls,model))
 # Door location comes from the public original frame, independent of personal finish data.
 for model in ms:
  for o,cls in load(model):
   if cls=='IfcWindow' and 'Kegro_voordeur'in o['object']['name'] and 'hout_meranti'in o['mat']['name']:doorpts.extend(transform(o['verts'],model))
 doorpts=np.array(doorpts);entry=(doorpts.min(0)+doorpts.max(0))/2
 g={'asset':{'version':'2.0','generator':'BPD street geometry conversion'},'scene':0,'scenes':[{'nodes':[]}],'nodes':[],'meshes':[],'materials':[],'accessors':[],'bufferViews':[],'buffers':[{'byteLength':0}]};buf=bytearray();mats={};bounds=[];segments={};ground=[]
 def access(a,typ):
  a=np.asarray(a,dtype='<f4');
  while len(buf)%4:buf.append(0)
  bv=len(g['bufferViews']);g['bufferViews'].append({'buffer':0,'byteOffset':len(buf),'byteLength':a.nbytes,'target':34962});buf.extend(a.tobytes());i=len(g['accessors']);g['accessors'].append({'bufferView':bv,'componentType':5126,'count':len(a),'type':typ,'min':a.min(0).tolist(),'max':a.max(0).tolist()});return i
 for mesh,cls,model in records:
  if cls in ['IfcOpeningElement','IfcSpace']:continue
  # Door leaf removal exposes the actual openings for the virtual walking visit.
  if cls=='IfcDoor':continue
  o=mesh['object'];a=transform(mesh['verts'],model)[mesh['idx']].reshape(-1,3,3)
  # Changing Z-up to Y-up combined with the family mirror can reverse winding.
  det=-(-1 if model['flippedX'] else 1)*(-1 if model['flippedY'] else 1)
  if det<0:a=a[:,[0,2,1]]
  n=np.cross(a[:,1]-a[:,0],a[:,2]-a[:,0]);ln=np.linalg.norm(n,axis=1);valid=ln>1e-10;a=a[valid];n=n[valid]/ln[valid,None]
  if not len(a):continue
  mi=material_info(mesh['mat']);key=mi['name']
  if key not in mats:mats[key]=len(g['materials']);g['materials'].append(mi)
  uv=np.zeros((len(a),3,2));axis=np.argmax(abs(n),axis=1)
  for k in [0,1,2]:
   sel=axis==k;v=a[sel];uv[sel,:,0]=v[:,:,2] if k==0 else v[:,:,0];uv[sel,:,1]=v[:,:,2] if k==1 else v[:,:,1]
  cat=mi['extras']['category'];scale=(2,.7) if cat and 'vertical'in cat else (1,1.62) if cat=='roof' else (3,2.5) if cat and 'roof'not in cat else (1,1)
  if cat=='roof':uv[:,:,1]=a[:,:,2]*2**.5
  uv/=scale
  prim={'attributes':{'POSITION':access(a.reshape(-1,3),'VEC3'),'NORMAL':access(np.repeat(n,3,axis=0),'VEC3'),'TEXCOORD_0':access(uv.reshape(-1,2),'VEC2')},'material':mats[key]};i=len(g['nodes']);g['nodes'].append({'mesh':len(g['meshes']),'name':o['name'],'extras':{'ifcClass':cls,'floorElevation':o['elevation'],'house':num}});g['scenes'][0]['nodes'].append(i);g['meshes'].append({'primitives':[prim]});bounds.extend(a.reshape(-1,3))
  if a[:,:,1].min()<.1:ground.extend(a.reshape(-1,3))
  if cls in ['IfcWall','IfcWallStandardCase','IfcWindow','IfcStair','IfcStairFlight','IfcFurnishingElement','IfcBuildingElementProxy']:
   for tri in a:
    pts=[]
    for u,v in [(0,1),(1,2),(2,0)]:
     p,q=tri[u],tri[v]
     if (p[1]-1.1)*(q[1]-1.1)<0:pts.append((p+(q-p)*((1.1-p[1])/(q[1]-p[1])))[[0,2]])
    if len(pts)==2 and np.linalg.norm(pts[0]-pts[1])>.005:
     row=sorted([tuple(np.round(p,4)) for p in pts]);segments[tuple(sum((list(p) for p in row),[]))]=1
 b=np.array(bounds);floor=np.array(ground);mn=floor.min(0);mx=floor.max(0);axis=int(np.argmin((doorpts.max(0)-doorpts.min(0))[[0,2]]));axis=[0,2][axis];out=1 if entry[axis]>(mn[axis]+mx[axis])/2 else -1;approach=entry.copy();approach[axis]+=out*1.15;inside=entry.copy();inside[axis]-=out*.5
 # Merge static geometry by material: original partitions remain geometrically
 # identical, while each neighbour uses tens rather than hundreds of draw calls.
 sourceMeshCount=len(g['meshes']);packed=bytes(buf);batches={}
 for mesh in g['meshes']:
  pr=mesh['primitives'][0];row=batches.setdefault(pr['material'],{'POSITION':[],'NORMAL':[],'TEXCOORD_0':[]})
  for name,ai in pr['attributes'].items():
   ac=g['accessors'][ai];bv=g['bufferViews'][ac['bufferView']];width=2 if name=='TEXCOORD_0' else 3;row[name].append(np.frombuffer(packed,dtype='<f4',count=ac['count']*width,offset=bv['byteOffset']).reshape(-1,width))
 buf=bytearray();g['bufferViews']=[];g['accessors']=[];g['meshes']=[];g['nodes']=[];g['scenes'][0]['nodes']=[]
 for mat,row in batches.items():
  attrs={name:access(np.concatenate(arrays),'VEC2' if name=='TEXCOORD_0' else 'VEC3') for name,arrays in row.items()};i=len(g['nodes']);g['nodes'].append({'mesh':i,'name':f'Bouwnummer {num} · '+g['materials'][mat]['name'],'extras':{'house':num,'originalMeshCount':sourceMeshCount}});g['scenes'][0]['nodes'].append(i);g['meshes'].append({'primitives':[{'attributes':attrs,'material':mat}]})
 g['buffers'][0]['byteLength']=len(buf)
 while len(buf)%4:buf.append(0)
 js=json.dumps(g,separators=(',',':')).encode();js+=b' '*((-len(js))%4);glb=struct.pack('<III',0x46546c67,2,12+8+len(js)+8+len(buf))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(buf),0x004e4942)+buf;(OUT/f'{num}.glb').write_bytes(glb)
 meta={'number':num,'type':m['projectName'],'file':f'assets/neighborhood/{num}.glb','bounds':{'minX':round(float(mn[0]),4),'maxX':round(float(mx[0]),4),'minZ':round(float(mn[2]),4),'maxZ':round(float(mx[2]),4)},'entry':{'x':round(float(entry[0]),4),'z':round(float(entry[2]),4),'axis':'x' if axis==0 else 'z','outward':out},'approach':[round(float(approach[0]),4),1.65,round(float(approach[2]),4)],'inside':[round(float(inside[0]),4),1.65,round(float(inside[2]),4)],'segments':[list(s) for s in segments],'sourceMeshCount':sourceMeshCount,'meshCount':len(g['meshes']),'source':'CasaBakici chosen BPD geometry' if num==100 else 'BPD public default configuration','visitUrl':'https://casabakici.upliftingbeetle5.chatgpt.site/' if num==100 else None}
 print(num,len(glb),meta['entry'],meta['bounds'],len(segments));return meta
houses=[export(n) for n in [96,98,99,100]]
(ROOT/'dist/neighborhood-data.js').write_text('// Public BPD model placement relative to house97; WGS84 latitude/longitude and model transforms.\nexport const HOUSES='+json.dumps(houses,separators=(',',':'))+';\n')
(OUT/'source.json').write_text(json.dumps({'sourceUrl':'https://bpd4.ogdb.nl/bpd/configurator/238/Lint%20fase%202','house100Url':'https://casabakici.upliftingbeetle5.chatgpt.site/','date':'2026-11-17','note':'96/98/99 public standard building models; 100 selected shell from CasaBakici public BPD data, original furnished experience opens at its front door. Public placement coordinates and family rotation/mirror are preserved. Interiors of96/98/99 are unfurnished building-model visits; door leaves removed for passage.','houses':[{k:v for k,v in h.items() if k!='segments'} for h in houses]},indent=2))
