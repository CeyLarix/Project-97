import * as THREE from './assets/three.module.js';
// Sanitized design facts only; the signed/private confirmation is not published.
export const confirmedOptions={document:'9649',date:'2026-09-25',rearExtension:{depth:2.4,width:5.4},annex:'060C + 102',rearSlider:'101A',stairCupboard:'201',extraDoubleSockets:{living:4,bedroom2:1,attic:3},emptyConduits:['storage','bedroom1','utility','attic'],cat6:'bedroom1',outdoorSockets:{count:2,height:.35,type:'Busch-Jaeger Ocean IP44'},outdoorTap:{height:.60,frostFree:true},drain:'rear facade near tap',sleeveDiameter:.075,windowSill:'Iceberg White Micro',doors:'704 / supplied door order',stairs:'607 / supplied stair order 4604',locationNote:'Service positions indicative where not dimensioned in the supplied drawings.'};
export function addConfirmedOutdoorDetails(parent){
 const g=new THREE.Group();g.name='confirmed-9649-outdoor-services';g.userData.locationNote=confirmedOptions.locationNote;parent.add(g);
 const steel=new THREE.MeshStandardMaterial({color:'#a6aeaa',roughness:.35,metalness:.8}),grey=new THREE.MeshStandardMaterial({color:'#9b9e97',roughness:.8}),dark=new THREE.MeshStandardMaterial({color:'#333b36',roughness:.8});
 const box=(w,h,d,x,y,z,m,name)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.name=name;o.position.set(x,y,z);g.add(o);return o;};
 const tap=new THREE.Group();tap.name='frost-free-outdoor-tap';tap.position.set(5.02,.6,13.83);g.add(tap);
 for(const[r,h,y,z]of[[.025,.11,0,.04],[.014,.08,-.05,.09]]){const p=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),steel);p.position.set(0,y,z);p.rotation.x=y===0?Math.PI/2:0;tap.add(p);}box(.09,.014,.018,5.02,.64,13.88,steel,'tap-handle');
 box(.25,.015,.25,5.02,-.015,14.08,dark,'rear-scrub-drain');for(let i=0;i<7;i++)box(.21,.008,.012,5.02,-.003,13.99+i*.03,steel,'drain-grating');
 for(const[x,z,side]of[[5.29,13.82,false],[5.63,7.58,true]]){const socket=new THREE.Group();socket.name='Ocean-IP44-double-socket';socket.position.set(x,.35,z);socket.rotation.y=side?Math.PI/2:0;g.add(socket);for(const y of[-.043,.043]){const cover=new THREE.Mesh(new THREE.BoxGeometry(.073,.073,.035),grey);cover.position.y=y;socket.add(cover);const hinge=new THREE.Mesh(new THREE.BoxGeometry(.055,.008,.009),dark);hinge.position.set(0,y+.029,.023);socket.add(hinge);}}
 return g;
}
