import sys,json,gzip,struct,hashlib
from pathlib import Path
import numpy as np
sys.path.insert(0,str(Path(__file__).resolve().parent));from read_bpd import read
ROOT=Path(__file__).resolve().parents[1];SOURCE=ROOT/'sources/exterior'
out=ROOT/'dist/assets/exterior'
models=['base',286215,286230,273840,286265,286290,286305,286325]
assign={a['payload']['originalMaterialName']:a['payload']['material'] for a in json.loads((SOURCE/'texture-assignments.json').read_text())}
g={'asset':{'version':'2.0','generator':'House97 BPD public geometry conversion'},'scene':0,'scenes':[{'nodes':[]}],'nodes':[],'meshes':[],'materials':[],'accessors':[],'bufferViews':[],'buffers':[{'byteLength':0}],'samplers':[{'wrapS':10497,'wrapT':10497,'magFilter':9729,'minFilter':9987}],'images':[],'textures':[]}
buf=bytearray();matmap={};images={};records=[]
def view(b,target=None):
 while len(buf)%4:buf.append(0)
 i=len(g['bufferViews']);v={'buffer':0,'byteOffset':len(buf),'byteLength':len(b)}
 if target:v['target']=target
 g['bufferViews'].append(v);buf.extend(b);return i
def accessor(a,typ):
 a=np.asarray(a,dtype='<f4');i=len(g['accessors']);g['accessors'].append({'bufferView':view(a.tobytes(),34962),'componentType':5126,'count':len(a),'type':typ,'min':a.min(0).tolist(),'max':a.max(0).tolist()});return i
def linear(x):return x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4
def material(raw):
 name=raw['name'];m=assign.get(name,{});category=None
 if 'baksteen' in name:category='rollaag' if 'rollaag' in name else 'baksteen'
 if 'keramisch_pan' in name or name=='Kokerpan_HP10':category='dakpannen'
 if name=='isolatie_eps_plaat_dak_mix':category='plat-dak'
 key=category or name
 if key in matmap:return matmap[key]
 rgb=raw['color'];c=m.get('diffuseColor')
 if c:rgb=[int(c[i:i+2],16)/255 for i in (1,3,5)]
 if 'Window_Grey'==name:rgb=[.525,.463,.376]
 glass='glas' in name.lower() or 'glass' in name.lower()
 if glass:rgb=[.44,.57,.61]
 d={'name':key,'pbrMetallicRoughness':{'baseColorFactor':[*(linear(x) for x in rgb),.72 if glass else 1],'metallicFactor':.25 if glass or 'aluminium' in name.lower() else 0,'roughnessFactor':.14 if glass else .9 if category else .68},'extras':{'sourceMaterial':name,'fixedExterior':True}}
 if glass:d['alphaMode']='BLEND';d['doubleSided']=True
 if category:
  if category not in images:
   i=len(g['images']);g['images'].append({'bufferView':view((out/(category+'.jpg')).read_bytes()),'mimeType':'image/jpeg'});g['textures'].append({'source':i,'sampler':0});images[category]=i
  d['pbrMetallicRoughness']['baseColorTexture']={'index':images[category]}
  tint=assign.get('steenachtig_keramisch_pan_antraciet_mix',{}).get('diffuseColor','#3F4346') if category=='dakpannen' else m.get('diffuseColor','#ffffff')
  tintRgb=[int(tint[i:i+2],16)/255 for i in (1,3,5)]
  d['pbrMetallicRoughness']['baseColorFactor']=[*(linear(x) for x in tintRgb),1]
 i=len(g['materials']);g['materials'].append(d);matmap[key]=i;return i
# Rear facade overrides from signed 9648 option sheet: the generic BPD sliding
# option is only 2.78 m, whereas the chosen 101A spans approximately 4.07 m.
def chosen_rear():
 result=[]
 def box(x1,y1,z1,x2,y2,z2,mat,label):
  p=np.array([[x1,y1,z1],[x2,y1,z1],[x2,y2,z1],[x1,y2,z1],[x1,y1,z2],[x2,y1,z2],[x2,y2,z2],[x1,y2,z2]],float)
  idx=np.array([0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5],dtype=np.uint32)
  raw=np.stack([135.55-p[:,0],58.95+p[:,2],p[:,1]],axis=-1).astype('<f4')
  result.append({'verts':raw,'idx':idx,'object':{'guid':'signed-'+str(len(result)),'name':'Optietekening 9648 · '+label},'mat':{'name':mat,'color':[.52,.46,.38],'opacity':1}})
 brick='steenachtig_baksteen_steen_Ogenagaat_mix_Orange_wall';band='steenachtig_baksteen_steen_Ogenagaat_rollaag_mix_Orange_wall';frame='NLRS_i3_kozijn_meranti geschilderd RAL 7039';glass='glas_helder_plaat_mix'
 for x1,x2,a,b,label in [(-.12,5.55,.55,4.62,'brede schuifpui 101A'),(5.55,9.13,6.62,8.32,'tuindeur extra kamer 102')]:
  box(x1,-.425,13.55,a,2.56,13.93,brick,label+' linkerdam')
  box(b,-.425,13.55,x2,2.56,13.93,brick,label+' rechterdam')
  box(x1,2.56,13.55,x2,3.23,13.93,band,label+' rollaag')
  box(x1,3.23,13.86,x2,3.265,13.96,frame,label+' daktrim')
  for x in [a,b]:box(x-.035,0,13.76,x+.035,2.56,13.87,frame,label+' kozijn')
  for y in [.025,2.525]:box(a,y-.025,13.76,b,y+.025,13.87,frame,label+' ligger')
  mid=(a+b)/2 if label.startswith('brede') else a+.65
  box(mid-.028,0,13.77,mid+.028,2.55,13.87,frame,label+' middenstijl')
  box(a+.035,.05,13.805,mid-.028,2.5,13.82,glass,label+' glas links')
  box(mid+.028,.05,13.815,b-.035,2.5,13.83,glass,label+' glas rechts')
  box(mid+.06,.96,13.865,mid+.08,1.12,13.90,frame,label+' greep')
 return result
for model in models:
 p=(SOURCE/f'bpd-{model}.json');b=p.read_bytes();j=json.loads(gzip.decompress(b) if b[:2]==b'\x1f\x8b' else b);lookup={}
 def walk(x):
  if isinstance(x,dict):
   if 'ifc_guid' in x:lookup[x['ifc_guid']]=x['ifc_class']
   for v in x.values():walk(v)
  elif isinstance(x,list):
   for v in x:walk(v)
 walk(j)
 for mesh in (chosen_rear() if model==286265 else read(SOURCE/f'bpd-{model}.bin')):
  if model in [286215,286230] and mesh['verts'][:,1].min()>=72.45:continue
  o=mesh['object'];cls=lookup.get(o['guid'],'unknown')
  if cls in ['IfcOpeningElement','IfcSpace']:continue
  a=mesh['verts'][mesh['idx']].reshape(-1,3,3).astype(np.float64)
  # Original coordinates are metres with Z up, facade front at Y58.95.
  a=np.stack([135.55-a[:,:,0],a[:,:,2],a[:,:,1]-58.95],axis=-1)
  n=np.cross(a[:,1]-a[:,0],a[:,2]-a[:,0]);length=np.linalg.norm(n,axis=1);valid=length>1e-10;a=a[valid];n=n[valid]/length[valid,None]
  if not len(a):continue
  mi=material(mesh['mat']);cat=g['materials'][mi]['name'];scale={'baksteen':(3,2.5),'rollaag':(2,.7),'dakpannen':(1,1.62),'plat-dak':(1,1)}.get(cat,(1,1))
  # Facade UVs remain metre-scaled on every wall, including the actual gable triangles.
  dominant=np.argmax(abs(n),axis=1);uv=np.zeros((len(a),3,2))
  for axis in [0,1,2]:
   sel=dominant==axis;t=a[sel]
   uv[sel,:,0]=t[:,:,2] if axis==0 else t[:,:,0]
   uv[sel,:,1]=t[:,:,2] if axis==1 else t[:,:,1]
  if cat=='dakpannen':uv[:,:,1]=a[:,:,2]*2**.5
  uv/=scale
  prim={'attributes':{'POSITION':accessor(a.reshape(-1,3),'VEC3'),'NORMAL':accessor(np.repeat(n,3,axis=0),'VEC3'),'TEXCOORD_0':accessor(uv.reshape(-1,2),'VEC2')},'material':mi}
  i=len(g['nodes']);g['nodes'].append({'mesh':len(g['meshes']),'name':o['name'],'extras':{'ifcGuid':o['guid'],'ifcClass':cls,'sourceModel':str(model)}});g['scenes'][0]['nodes'].append(i);g['meshes'].append({'primitives':[prim]});records.append({'model':model,'guid':o['guid'],'name':o['name'],'class':cls,'material':cat,'min':a.reshape(-1,3).min(0).tolist(),'max':a.reshape(-1,3).max(0).tolist(),'triangles':len(a)})
g['buffers'][0]['byteLength']=len(buf)
while len(buf)%4:buf.append(0)
js=json.dumps(g,separators=(',',':')).encode();js+=b' '*((-len(js))%4)
glb=struct.pack('<III',0x46546c67,2,12+8+len(js)+8+len(buf))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(buf),0x004e4942)+buf
(out/'woning97.glb').write_bytes(glb)
meta={'source':'BPD configurator Type-E bouwnummer 97','sourceUrl':'https://bpd4.ogdb.nl/bpd/configurator/238/Lint%20fase%202/house/Type-E/97/39825/?uint=2506fcab-9993-45dc-96d5-30335b6e540d','retrieved':'2026-11-17','selectedOptions':{'extension':'2400 mm','annex':'Berging added to home','roof':'Default Roof','rearDoor':'Sliding Door','storageDoor':'Default Berging Door'},'coordinateTransform':'planX=135.55-sourceX; planY=sourceZ; planZ=sourceY-58.95; metres, no scale','materials':'Original public project texture assignments, source texture images resized to max1024.','meshCount':len(records),'triangleCount':sum(r['triangles'] for r in records),'bounds':{'min':np.array([r['min'] for r in records]).min(0).tolist(),'max':np.array([r['max'] for r in records]).max(0).tolist()},'rearFacadeOverride':{'source':'Signed 9648 option drawing page1, options101A/102','slidingClearWidthApprox':4.07,'annexRearGlazingApprox':1.7},'notes':'BPD configurable options are combined to match the supplied drawings; the signed option sheet takes precedence for the wider rear sliding window and annex rear door. Interior remains the measured independent walkthrough.'}
(out/'source.json').write_text(json.dumps(meta,indent=2));(SOURCE/'geometry-audit.json').write_text(json.dumps(records));print(json.dumps(meta,indent=2));print('GLB bytes',len(glb))
