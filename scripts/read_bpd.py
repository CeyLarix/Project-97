import struct,json,gzip
from pathlib import Path
import numpy as np
class Reader:
 def __init__(self,p):
  self.b=Path(p).read_bytes();self.p=0
  if self.b[:2]==b'\x1f\x8b':self.b=gzip.decompress(self.b)
 def take(self,n):p=self.p;self.p+=n;return self.b[p:self.p]
 def u(self):return struct.unpack('<I',self.take(4))[0]
 def i(self):return struct.unpack('<i',self.take(4))[0]
 def f(self):return struct.unpack('<f',self.take(4))[0]
 def s(self,n):return self.take(n).split(b'\0')[0].decode('utf8',errors='replace')
 def arr(self,n,dtype):return np.frombuffer(self.take(n*4),dtype=dtype).copy()
def read(p):
 r=Reader(p);assert r.u()==115017435;assert r.s(12)=='OGDB--BINFMT';v=r.i();assert v==11
 strings=[r.s(r.u()) for _ in range(r.u())];mats={}
 for _ in range(r.u()):
  mid=r.i();orig=r.i();name=r.s(256);ambient=r.arr(3,'<f4');color=r.arr(3,'<f4');opacity=r.f();mats[mid]={'id':mid,'originalId':orig,'name':name,'color':color.tolist(),'opacity':opacity}
 objects={}
 for _ in range(r.u()):
  oid=r.i();cls=r.i();guid=r.s(22);r.take(2);name,typ,variant=[strings[r.u()-1] for _ in range(3)];bb=r.arr(6,'<f4');storey=r.i();elevation=r.f()
  for _ in range(r.u()):rel=r.i();r.take(r.u()*4)
  objects[oid]={'id':oid,'cls':cls,'guid':guid,'name':name,'type':typ,'variant':variant,'bbox':bb.tolist(),'elevation':elevation}
 meshes=[]
 for _ in range(r.u()):
  oid=r.i();mat=r.i();verts=r.arr(r.u(),'<f4').reshape(-1,3);idx=r.arr(r.u(),'<u4');meshes.append({'object':objects[oid],'mat':mats.get(mat,{'name':'default','color':[.7,.7,.7],'opacity':1}),'verts':verts,'idx':idx})
 assert r.p==len(r.b),(r.p,len(r.b));return meshes
if __name__=='__main__':
 import sys
 ms=read(sys.argv[1]);a=np.concatenate([m['verts'] for m in ms]);print('meshes',len(ms),'bounds',a.min(0),a.max(0));print(*[(m['object']['name'],m['mat']['name'],m['verts'].min(0).round(3).tolist(),m['verts'].max(0).round(3).tolist()) for m in ms if 'metselwerk' in m['object']['name'].lower() or 'pannen' in m['object']['name'].lower()],sep='\n')
