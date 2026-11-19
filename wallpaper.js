import * as THREE from './assets/three.module.js';
export const WALLPAPERS={offWhite:{id:'4325768',name:'River Off White',url:'https://www.kwantum.nl/behang-river-off-white-4325768',crop:[262,5,436,950],metres:[.53,1.15],fallback:'#e5dfd3'},warmSand:{id:'4327738',name:'River Warm Zand',url:'https://www.kwantum.nl/behang-river-warm-zand-4327738',crop:[82,0,796,960],metres:[1.06,1.28],fallback:'#bba08d'}};
// Source product photographs, framed at an indicative real-world pattern scale.
function wallpaperMaterial(spec){const material=new THREE.MeshStandardMaterial({color:spec.fallback,roughness:.97});material.name='Kwantum '+spec.name;material.userData={fixedWallpaper:true,productUrl:spec.url,article:spec.id};
 if(typeof Image!=='undefined')new THREE.TextureLoader().load('assets/wallpaper/river-'+spec.id+'.jpg',source=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=1024;canvas.getContext('2d').drawImage(source.image,...spec.crop,0,0,512,1024);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.MirroredRepeatWrapping;map.anisotropy=4;material.map=map;material.bumpMap=map;material.bumpScale=.0012;material.color.set('#ffffff');material.needsUpdate=true;source.dispose();});return material;
}
function cover(parent,material,spec,name,axis,fixed,start,end,facing,openings=[]){
 const root=new THREE.Group();root.name=name;root.userData={wallpaper:true,article:spec.id};parent.add(root);
 function piece(a,b,low=.08,high=2.7){if(b-a<.002||high-low<.002)return;const g=new THREE.PlaneGeometry(b-a,high-low),uv=g.attributes.uv,p=g.attributes.position;
  for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+(a+b)/2)/spec.metres[0],(p.getY(i)+(low+high)/2)/spec.metres[1]);
  const o=new THREE.Mesh(g,material);o.position.set(axis==='x'?(a+b)/2:fixed,(low+high)/2,axis==='x'?fixed:(a+b)/2);o.rotation.y=axis==='x'?(facing>0?0:Math.PI):(facing>0?Math.PI/2:-Math.PI/2);o.receiveShadow=true;root.add(o);
 }
 let cursor=start;for(const op of openings){piece(cursor,op.from);piece(op.from,op.to,.08,op.bottom??0);piece(op.from,op.to,op.top??2.35,2.7);cursor=op.to;}piece(cursor,end);return root;
}
export function addRequestedWallpapers(storeys){const off=WALLPAPERS.offWhite,sand=WALLPAPERS.warmSand,white=wallpaperMaterial(off),warm=wallpaperMaterial(sand),g=storeys[0].group,f=storeys[1].group;
 cover(g,white,off,'river-off-white-living-core','x',4.548,2.63,5.4,-1);
 cover(g,white,off,'river-off-white-kitchen-core','x',8.402,2.63,5.4,1);
 cover(g,white,off,'river-off-white-passage-core','z',2.628,4.55,8.4,-1,[{from:6.07,to:7.07,top:2.35}]);
 cover(f,warm,sand,'river-sand-bedroom1-left','z',.003,4.19,10,1);
 cover(f,warm,sand,'river-sand-bedroom1-rear','x',9.997,0,3.1,-1,[{from:.51,to:2.21,bottom:.366,top:2.546}]);
 cover(f,warm,sand,'river-sand-bedroom1-right','z',3.097,6,10,-1);
 cover(f,warm,sand,'river-sand-bedroom1-front','x',6.003,1.43,3.1,1);
 cover(f,warm,sand,'river-sand-bedroom1-entry-front','x',4.193,0,1.43,1);
 cover(f,warm,sand,'river-sand-bedroom1-entry-side','z',1.427,4.19,6,-1,[{from:4.95,to:5.9,top:2.3}]);
 // The old accent sheet and decorative slats would mask the requested paper.
 f.traverse(o=>{if(o.userData?.feature==='accentWall'||o.name==='slatPanel'){o.visible=false;o.userData.coveredByWallpaper=true;}});
 return {white,warm};
}
