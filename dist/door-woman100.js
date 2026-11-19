import * as THREE from './assets/three.module.js';
// Fictional resident and animated door leaf in the existing BPD entrance opening.
export function createAngryEntrance({street,makeActor}){
 const group=new THREE.Group();group.name='100-opening-door-and-angry-resident';group.visible=false;street.add(group);
 const pivot=new THREE.Group();pivot.name='100-front-door-hinge';pivot.position.set(37.44,.025,5.73);group.add(pivot);
 const wood=new THREE.MeshStandardMaterial({color:'#827363',roughness:.75}),dark=new THREE.MeshStandardMaterial({color:'#3e3b37',metalness:.5,roughness:.38});
 function part(parent,geo,mat,x,y,z){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 part(pivot,new THREE.BoxGeometry(.052,2.44,1.03),wood,0,1.22,.515);
 part(pivot,new THREE.BoxGeometry(.008,.15,.032),dark,-.036,1.05,.90);part(pivot,new THREE.BoxGeometry(.026,.02,.12),dark,-.05,1.05,.85);
 const woman=makeActor('#a95f4d','#d4a485');woman.name='angry-woman-at-100';woman.scale.setScalar(.94);woman.rotation.y=-Math.PI/2;group.add(woman);
 const dress=new THREE.MeshStandardMaterial({color:'#77483f',roughness:.95}),hair=new THREE.MeshStandardMaterial({color:'#3b2c25',roughness:.92}),mouthMat=new THREE.MeshStandardMaterial({color:'#512c2c',roughness:.9});
 part(woman,new THREE.CylinderGeometry(.16,.27,.68,16),dress,0,.80,0);const longHair=part(woman,new THREE.SphereGeometry(1,12,10),hair,0,1.63,-.065);longHair.scale.set(.143,.23,.10);
 const mouth=part(woman,new THREE.SphereGeometry(1,10,8),mouthMat,0,1.635,.121);mouth.scale.set(.025,.015,.008);mouth.name='shouting-mouth';
 for(const side of[-1,1])part(woman,new THREE.BoxGeometry(.056,.009,.011),hair,side*.040,1.747,.108).rotation.z=side*.3;
 function reset(visible=true){group.visible=visible;pivot.rotation.y=0;woman.visible=false;mouth.scale.y=.015;}
 function update(open,shouting,now,aside=0){group.visible=true;pivot.rotation.y=THREE.MathUtils.smoothstep(open,0,1)*1.35;woman.visible=open>.35;woman.position.set(THREE.MathUtils.lerp(37.82,37.23,THREE.MathUtils.smoothstep(open,.35,1))-.12*aside,.01,6.25+.95*aside);
  for(const [i,leg]of woman.userData.legs.entries())leg.rotation.x=(i?1:-1)*Math.sin(aside*Math.PI)*.22;
  const arms=woman.userData.arms;arms[0].root.rotation.set(-.25,0,-.38);arms[0].elbow.rotation.set(0,0,-.7);arms[1].root.rotation.set(shouting?-1.25+Math.sin(now*.023)*.10:-.35,0,.18);arms[1].elbow.rotation.set(-.35,0,0);mouth.scale.y=shouting?.031+Math.abs(Math.sin(now*.03))*.015:.015;
 }
 reset(false);return {group,woman,pivot,reset,update};
}
// A generated fictional female shout, preloaded locally and unlocked on the scene click.
export function createWomanShout(){let context=null,buffer=null,source=null;
 const bytes=typeof window!=='undefined'?fetch('assets/audio/woman-shout.mp3').then(r=>{if(!r.ok)throw Error('shout');return r.arrayBuffer()}).catch(()=>null):Promise.resolve(null);
 function unlock(){try{context??=new (globalThis.AudioContext||globalThis.webkitAudioContext)();context.resume().catch(()=>{});if(!buffer)bytes.then(b=>b&&context.decodeAudioData(b.slice(0))).then(b=>{buffer=b}).catch(()=>{});}catch{}}
 function stop(){if(source){try{source.stop()}catch{}source.disconnect();source=null;}}
 return {unlock,stop,play(){if(!context||!buffer)return false;stop();const node=context.createBufferSource();source=node;node.buffer=buffer;node.connect(context.destination);node.onended=()=>{node.disconnect();if(source===node)source=null;};node.start();return true;}};
}
