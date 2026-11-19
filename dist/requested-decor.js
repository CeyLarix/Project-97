import * as THREE from './assets/three.module.js';
import {mergeGeometries} from './assets/addons/utils/BufferGeometryUtils.js';
function patina(color){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,256,256);let seed=18763;const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
 for(let i=0;i<11000;i++){ctx.fillStyle=i%3?`rgba(53,49,39,${.03+random()*.24})`:`rgba(242,237,220,${.1+random()*.35})`;const r=.3+random()*1.8;ctx.fillRect(random()*256,random()*256,r,r);}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
export function addChampsVase(parent){const g=new THREE.Group();g.name='loberon-champs-18763';g.position.set(3.34,.945,9.60);g.userData={brand:'LOBERON',product:'Vaas Champs',article:'18763',height:.30,diameter:.37,sourceUrl:'https://www.loberon.nl/Accessoires/Planten-Vazen/Vazen/Vaas-Champs-18763-4-1.html',visualInterpretation:true};parent.add(g);
 const map=patina('#a5a393'),m=new THREE.MeshStandardMaterial({map,bumpMap:map,bumpScale:.0025,roughness:.98});m.userData.fixedDecor=true;
 // Closed base, rounded belly, short neck, thick open rim and an inner bowl.
 const profile=[[0,0],[.110,0],[.122,.009],[.146,.058],[.176,.123],[.185,.169],[.176,.216],[.144,.259],[.105,.279],[.097,.289],[.099,.30],[.087,.30],[.085,.287],[.093,.272],[.132,.249],[.160,.208],[.170,.166],[.157,.110],[.128,.057],[.104,.025],[0,.025]].map(p=>new THREE.Vector2(...p));
 const body=new THREE.Mesh(new THREE.LatheGeometry(profile,64),m);body.castShadow=body.receiveShadow=true;g.add(body);addChampsFlowers(g);return g;}
function addChampsFlowers(vase){
 const bouquet=new THREE.Group();bouquet.name='champs-cream-pink-bouquet';bouquet.userData.visualInterpretation='Cream hydrangeas, dusty rose foliage and rust-pink flower sprays from product photo';vase.add(bouquet);
 let seed=187634;const rnd=()=>((seed=seed*16807%2147483647)-1)/2147483646,stems=[],petals=[],leaves=[],palette=['#e8d6bd','#e1cbb2','#f0dfca','#b77478','#b16a60','#d2958e'];
 function stem(x,y,z){stems.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(x*.05,.15,z*.05),new THREE.Vector3(x*.4,.36,z*.4),new THREE.Vector3(x,y,z)]),6,.0025,5,false));}
 function floret(x,y,z,size,color){for(let k=0;k<4;k++){const a=k*Math.PI/2;petals.push({x:x+Math.cos(a)*size*.55,y:y+Math.sin(a)*size*.55,z:z+(rnd()-.5)*.012,sx:size*.63,sy:size*.82,rx:(rnd()-.5)*.65,rz:-a+.5,color});}}
 for(const [cx,cy,cz,r]of [[-.12,.43,-.04,.11],[.10,.47,-.02,.115],[.01,.39,.11,.085]]){stem(cx,cy,cz);for(let i=0;i<64;i++){const a=rnd()*Math.PI*2,h=rnd()*2-1,rr=r*Math.sqrt(1-h*h);floret(cx+Math.cos(a)*rr,cy+h*r,cz+Math.sin(a)*rr,.020+rnd()*.006,palette[i%3]);}}
 for(const [x,y,z]of [[-.28,.64,.02],[.27,.72,.02],[.19,.58,.13],[-.07,.83,.08]]){stem(x,y,z);for(let i=0;i<32;i++){const t=.45+rnd()*.55,a=i*2.4,spread=.035*(1-t)+.018;floret(x*t+Math.cos(a)*spread,.28+(y-.28)*t,z*t+Math.sin(a)*spread,.012+rnd()*.007,palette[3+i%3]);}}
 for(const [x,y,z]of [[-.29,.74,-.07],[.04,.89,.01],[.29,.61,-.09]]){stem(x,y,z);for(let i=0;i<16;i++){const t=.33+i*.039,side=i%2?1:-1;leaves.push({x:x*t+side*.025,y:.29+(y-.29)*t,z:z*t,sx:.019,sy:.030,rx:.1,rz:side*.7,color:i%3?'#ad7881':'#c58d98'});}}
 function instances(name,list){const geo=new THREE.CircleGeometry(1,8),mat=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.93,side:THREE.DoubleSide}),mesh=new THREE.InstancedMesh(geo,mat,list.length),o=new THREE.Object3D();mesh.name=name;mesh.receiveShadow=true;for(const [i,p]of list.entries()){o.position.set(p.x,p.y,p.z);o.rotation.set(p.rx,0,p.rz);o.scale.set(p.sx,p.sy,1);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);mesh.setColorAt(i,new THREE.Color(p.color));}mesh.instanceMatrix.needsUpdate=true;bouquet.add(mesh);}
 instances('cream-pink-flower-petals',petals);instances('dusty-pink-eucalyptus',leaves);const wood=new THREE.Mesh(mergeGeometries(stems),new THREE.MeshStandardMaterial({color:'#7c6f50',roughness:.95}));bouquet.add(wood);for(const geo of stems)geo.dispose();return bouquet;
}
export function addNorvetaOlive(parent){const g=new THREE.Group();g.name='norveta-olive-210';g.position.set(4.90,0,4.10);g.userData={brand:'Norveta',height:2.10,sourceUrl:'https://www.norveta.nl/en/products/olijfboom-210-cm-ultra-realistische-zijden-kunstboom?variant=71480648106237',visualInterpretation:true,heightBasis:'210 cm product title; description inconsistently says 170 cm'};parent.add(g);
 const potMap=patina('#dfd7c7'),potMat=new THREE.MeshStandardMaterial({map:potMap,bumpMap:potMap,bumpScale:.0015,roughness:.96});
 const pot=new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.142,0],[.184,.03],[.212,.16],[.205,.30],[.175,.41],[.159,.41],[.178,.30],[.184,.16],[.16,.05],[0,.05]].map(p=>new THREE.Vector2(...p)),48),potMat);pot.name='olive-cream-planter';pot.castShadow=pot.receiveShadow=true;g.add(pot);
 const soil=new THREE.Mesh(new THREE.CircleGeometry(.164,32),new THREE.MeshStandardMaterial({color:'#44382a',roughness:1}));soil.rotation.x=-Math.PI/2;soil.position.y=.389;g.add(soil);
 let seed=21097;const rnd=()=>((seed=seed*16807%2147483647)-1)/2147483646,branches=[];
 const bark=new THREE.MeshStandardMaterial({color:'#81735a',roughness:.98,map:patina('#9b8a6b')});
 function branch(points,radius){const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),8,radius,6,false);branches.push(geo);}
 branch([[0,.38,0],[-.03,.60,.01],[.01,.85,0],[.07,1.12,.02],[.03,1.50,0]],.033);
 const leafGeo=new THREE.PlaneGeometry(.026,.095,2,4),p=leafGeo.attributes.position;
 for(let i=0;i<p.count;i++){const y=p.getY(i),t=(y+.0475)/.095;p.setX(i,p.getX(i)*Math.sin(Math.PI*t));p.setZ(i,.006*Math.sin(Math.PI*t));}leafGeo.computeVertexNormals();
 const leaves=new THREE.InstancedMesh(leafGeo,new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.8,side:THREE.DoubleSide}),864);leaves.name='olive-silk-leaves';leaves.castShadow=false;leaves.receiveShadow=true;g.add(leaves);let index=0;const dummy=new THREE.Object3D();
 for(let i=0;i<24;i++){const a=i*2.39996,y=.90+(i%8)*.12,reach=.19+rnd()*.17;
  const start=[.03,y-.32,0],end=[Math.cos(a)*reach,y+.25,Math.sin(a)*reach];branch([start,[Math.cos(a)*reach*.4,y-.04,Math.sin(a)*reach*.4],end],.004+(i%4)*.0018);
  for(let j=0;j<36;j++){const t=.12+rnd()*.88,spread=(rnd()-.5)*.13;dummy.position.set(end[0]*t+Math.cos(a+Math.PI/2)*spread,y-.25+t*.5+(rnd()-.5)*.13,end[2]*t+Math.sin(a+Math.PI/2)*spread);dummy.rotation.set(rnd()*1.7,a+(j%2?1:-1)*.9,rnd()*.9-.45);dummy.scale.setScalar(.7+rnd()*.5);dummy.updateMatrix();leaves.setMatrixAt(index,dummy.matrix);leaves.setColorAt(index++,new THREE.Color().setHSL(.21+rnd()*.035,.18+rnd()*.16,.19+rnd()*.22));}
 }
 branch([[.03,1.45,0],[0,1.76,0],[.02,2.05,.005]],.004);
 // The tallest upright leaf fixes the overall height to the selected 210 cm size.
 const tip=new THREE.Mesh(leafGeo,leaves.material);tip.position.set(.02,2.0525,.005);tip.rotation.y=.5;g.add(tip);
 const wood=new THREE.Mesh(mergeGeometries(branches),bark);wood.castShadow=wood.receiveShadow=true;g.add(wood);for(const b of branches)b.dispose();
 leaves.instanceMatrix.needsUpdate=true;leaves.instanceColor.needsUpdate=true;return g;
}
