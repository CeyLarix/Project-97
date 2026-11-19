import * as THREE from './assets/three.module.js';
// Reference-image interpretation; dimensions selected to fit the wall before the hall door.
export function addPassageShelf(scene){const g=new THREE.Group();g.name='dark-open-passage-shelf';g.position.set(.19,0,5.31);g.rotation.y=Math.PI/2;g.userData={reference:'User open dark wood display shelf photo',dimensions:{width:1.35,height:2.05,depth:.34},approximate:true};scene.add(g);
 const wood=new THREE.MeshStandardMaterial({color:'#44362d',roughness:.8}),stone=new THREE.MeshStandardMaterial({color:'#d8caba',roughness:.88}),cream=new THREE.MeshStandardMaterial({color:'#eee4d7',roughness:.8}),amber=new THREE.MeshStandardMaterial({color:'#876143',roughness:.3,transparent:true,opacity:.75}),gold=new THREE.MeshStandardMaterial({color:'#ba9c63',roughness:.48,metalness:.5});
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#44362d';ctx.fillRect(0,0,128,512);for(let i=0;i<130;i++){ctx.strokeStyle=i%3?'rgba(149,119,87,.18)':'rgba(18,14,11,.16)';ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(i,0);ctx.bezierCurveTo(i+3,170,i-2,340,i+1,512);ctx.stroke();}const grain=new THREE.CanvasTexture(canvas);grain.colorSpace=THREE.SRGBColorSpace;wood.color.set('#ffffff');wood.map=grain;wood.bumpMap=grain;wood.bumpScale=.0008;
 function mesh(geo,mat,x,y,z){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=!mat.transparent;o.receiveShadow=true;g.add(o);return o;}
 function box(w,h,d,x,y,z,m=wood){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);}
 for(const y of[.10,.48,.86,1.24,1.62,2.02])box(1.35,.026,.34,0,y,0);
 box(.25,2.04,.30,-.465,1.025,-.012);box(.024,2.04,.30,.015,1.025,-.012);box(.026,2.05,.045,.60,1.025,-.12);
 function crystal(x,y){for(let i=0;i<6;i++){const h=.07+(i%3)*.025,o=mesh(new THREE.ConeGeometry(.021,h,5),cream,x+(i%3)*.028,y+h/2,.015+Math.floor(i/3)*.025);o.rotation.z=(i-2.5)*.06;}}
 crystal(-.20,1.633);crystal(-.22,.493);
 for(let i=0;i<3;i++){const ring=mesh(new THREE.TorusGeometry(.058,.017,8,24),cream,.30+(i-1)*.028,1.70,.025);ring.rotation.set(i*.85,i*.75,i*.6);}
 for(const [x,y]of [[-.21,1.253],[-.11,1.253],[.39,1.253]]){mesh(new THREE.CylinderGeometry(.034,.035,.14,20),amber,x,y+.07,.04);mesh(new THREE.CylinderGeometry(.023,.023,.09,16),cream,x,y+.055,.04);}
 const bowl=mesh(new THREE.LatheGeometry([[0,0],[.09,0],[.14,.06],[.13,.066],[.08,.014],[0,.014]].map(p=>new THREE.Vector2(...p)),28),stone,.30,.875,.015);
 for(let i=0;i<3;i++)box(.20-i*.015,.025,.12,.29,.506+i*.027,0,stone);
 const geode=mesh(new THREE.TorusGeometry(.077,.022,5,12),stone,-.18,.975,.05);geode.rotation.z=.2;mesh(new THREE.CircleGeometry(.055,12),cream,-.18,.975,.038);box(.09,.01,.07,-.18,.883,.04,gold);
 return {group:g,obstacle:{minX:.02,maxX:.36,minZ:4.635,maxZ:5.985}};
}
export function addCornerReturn(parent){const g=new THREE.Group();g.name='living-corner-chaise';g.userData={length:1.15,depth:1.04,extension:true};parent.add(g);const fabric=new THREE.MeshStandardMaterial({color:'#d8cfbd',roughness:.96});fabric.userData={role:'fabric',modelMaterial:true};
 const box=(w,h,d,x,y,z)=>{const geo=new THREE.BoxGeometry(w,h,d,4,3,4),p=geo.attributes.position;const half=[w/2,h/2,d/2],r=.055;for(let i=0;i<p.count;i++){const v=[p.getX(i),p.getY(i),p.getZ(i)],q=v.map((a,j)=>Math.max(-half[j]+r,Math.min(half[j]-r,a))),delta=new THREE.Vector3(v[0]-q[0],v[1]-q[1],v[2]-q[2]).normalize().multiplyScalar(r);p.setXYZ(i,q[0]+delta.x,q[1]+delta.y,q[2]+delta.z);}geo.computeVertexNormals();const o=new THREE.Mesh(geo,fabric);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;};
 box(1.15,.34,1.04,1.70,.35,.74);box(1.03,.16,.91,1.73,.60,.74);box(1.12,.46,.16,1.70,.60,.28);return g;
}
