import {createAngryEntrance} from './door-woman100.js';
import * as THREE from './assets/three.module.js';
import {PERSON100} from './neighborhood.js';
export const ESCORT_ROUTE=[[35.10,-2.60],[35.70,-.40],[36.05,3.80],[36.18,5.4263]];
const clamp=THREE.MathUtils.clamp;
function makeMan(color,skin){
 const g=new THREE.Group(),shirt=new THREE.MeshStandardMaterial({color,roughness:.95}),pants=new THREE.MeshStandardMaterial({color:'#252a30',roughness:.9}),face=new THREE.MeshStandardMaterial({color:skin,roughness:.85}),hair=new THREE.MeshStandardMaterial({color:'#302a26',roughness:.95}),shoe=new THREE.MeshStandardMaterial({color:'#272420',roughness:.8});
 function part(geo,mat,x,y,z,parent=g){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 part(new THREE.CapsuleGeometry(.18,.37,5,10),shirt,0,1.19,0);part(new THREE.CylinderGeometry(.072,.082,.11,10),face,0,1.53,0);part(new THREE.SphereGeometry(.125,14,10),face,0,1.69,.006).scale.set(.85,1.16,.9);part(new THREE.SphereGeometry(.127,14,8,0,Math.PI*2,0,Math.PI*.48),hair,0,1.73,0);
 for(const x of[-.04,.04])part(new THREE.SphereGeometry(.009,6,4),hair,x,1.71,.108);part(new THREE.SphereGeometry(.022,8,6),face,0,1.67,.12);
 const legs=[];for(const side of[-1,1]){const leg=new THREE.Group();leg.position.set(side*.105,.92,0);g.add(leg);part(new THREE.CapsuleGeometry(.069,.65,4,8),pants,0,-.39,0,leg);part(new THREE.BoxGeometry(.14,.095,.25),shoe,0,-.855,.058,leg);legs.push(leg);}
 const arms=[];for(const side of[-1,1]){const a=new THREE.Group();a.position.set(side*.21,1.43,0);g.add(a);const upper=part(new THREE.CylinderGeometry(.055,.047,.29,8),shirt,0,-.145,0,a);const elbow=new THREE.Group();elbow.position.y=-.29;a.add(elbow);part(new THREE.CylinderGeometry(.044,.033,.27,8),face,0,-.135,0,elbow);part(new THREE.SphereGeometry(.044,8,6),face,0,-.283,0,elbow).name='escort-hand';arms.push({root:a,elbow,upper});}
 g.userData={legs,arms,shirtMaterial:shirt};return g;
}
function shirtPrint(actor,text,back=false,y=1.29,width=.34,height=.26){
 const lines=text==='Irish Guy'?['IRISH','GUY']:[text.toUpperCase()],c=document.createElement('canvas');c.width=768;c.height=lines.length>1?512:256;const a=c.getContext('2d');
 a.fillStyle='rgba(12,13,12,.9)';a.fillRect(5,5,758,c.height-10);a.fillStyle='#cdb98c';a.fillRect(18,10,732,5);a.fillRect(18,c.height-15,732,5);
 a.textAlign='center';a.textBaseline='middle';a.lineJoin='round';a.font='900 '+(lines.length>1?208:196)+'px "Arial Black", Impact, sans-serif';a.lineWidth=13;a.strokeStyle='#101010';a.fillStyle='#fffdf4';
 for(let i=0;i<lines.length;i++){const cy=(i+.5)*c.height/lines.length+4;a.strokeText(lines[i],384,cy,708);a.fillText(lines[i],384,cy,708);}
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;const geo=new THREE.PlaneGeometry(width,height,24,1),p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sqrt(Math.max(.001,.188*.188-p.getX(i)*p.getX(i))));geo.computeVertexNormals();
 const print=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));print.name='shirt-print-'+text.replaceAll(' ','-')+(back?'-back':'-front');print.position.y=y;print.rotation.y=back?Math.PI:0;print.scale.x=-1;print.userData={text,displayText:lines.join(' '),bold:true,unmirroredUnderHouseRoot:true};actor.add(print);return print;
}
function acMilanShirt(actor){const c=document.createElement('canvas');c.width=c.height=256;const a=c.getContext('2d');for(let i=0;i<8;i++){a.fillStyle=i%2?'#141414':'#b21f2b';a.fillRect(i*32,0,32,256);}const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const kit=new THREE.MeshStandardMaterial({map:texture,roughness:.95});kit.name='AC-Milan-red-black-shirt';const original=actor.userData.shirtMaterial;actor.traverse(o=>{if(o.isMesh&&o.material===original)o.material=kit;});actor.userData.shirtMaterial=kit;actor.userData.kit='AC Milan classic red-black';actor.userData.shirtName='Milan';
 shirtPrint(actor,'Milan',true,1.28,.34,.16);shirtPrint(actor,'Milan',false,1.23,.33,.15);shirtPrint(actor,'AC MILAN',true,1.43,.30,.055);
 const badgeCanvas=document.createElement('canvas');badgeCanvas.width=192;badgeCanvas.height=288;const b=badgeCanvas.getContext('2d');b.fillStyle='#121212';b.beginPath();b.ellipse(96,144,88,137,0,0,Math.PI*2);b.fill();b.fillStyle='#f3e8d2';b.beginPath();b.ellipse(96,144,80,128,0,0,Math.PI*2);b.fill();b.fillStyle='#b21f2b';for(let i=0;i<3;i++)b.fillRect(35+i*20,90,11,110);b.fillRect(120,90,12,110);b.fillRect(104,129,47,13);b.fillStyle='#171717';b.font='bold 37px Arial';b.textAlign='center';b.fillText('ACM',96,65);b.font='bold 28px Arial';b.fillText('1899',96,246);const map=new THREE.CanvasTexture(badgeCanvas);map.colorSpace=THREE.SRGBColorSpace;const badge=new THREE.Mesh(new THREE.PlaneGeometry(.052,.077),new THREE.MeshStandardMaterial({map,transparent:true,roughness:.9,depthWrite:false}));badge.name='AC-Milan-shirt-crest';badge.position.set(-.075,1.385,.17);badge.scale.x=-1;actor.add(badge);
}
function reach(man,armIndex,target){const {root,elbow}=man.userData.arms[armIndex];man.updateWorldMatrix(true,true);const delta=man.worldToLocal(target.clone()).sub(root.position),distance=clamp(delta.length(),.08,.57),dir=delta.clone().normalize(),a=.29,b=.283;
 const cos=clamp((distance*distance+a*a-b*b)/(2*distance*a),-1,1),perp=new THREE.Vector3(0,0,1).addScaledVector(dir,-dir.z).normalize(),joint=dir.clone().multiplyScalar(a*cos).addScaledVector(perp,a*Math.sqrt(1-cos*cos));
 root.scale.set(1,1,1);root.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),joint.clone().normalize());elbow.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),delta.sub(joint).applyQuaternion(root.quaternion.clone().invert()).normalize());
}
export function createEscort100({street,dance,onBell,onShout=()=>{},onFrame=()=>{},onError=()=>{}}){
 const carrier=new THREE.Group();carrier.name='Akin escorted from street to doorbell';street.add(carrier);
 const men=[makeMan('#4c5355','#c39776'),makeMan('#948b76','#cba889')];men.forEach((m,i)=>{m.name='escort-man-'+(i+1);street.add(m);m.visible=false;});
 men[0].userData.shirtName='Irish Guy';shirtPrint(men[0],'Irish Guy');shirtPrint(men[0],'Irish Guy',true);
 const filmer=makeMan('#53634b','#ba8d6e');filmer.name='cameraman-following-100';street.add(filmer);filmer.visible=false;acMilanShirt(filmer);
 const filmCamera=new THREE.Group();filmCamera.name='filming-camera';filmCamera.position.set(0,1.58,.29);filmer.add(filmCamera);
 const cameraMat=new THREE.MeshStandardMaterial({color:'#1d2022',roughness:.46}),lensMat=new THREE.MeshStandardMaterial({color:'#163342',metalness:.55,roughness:.12});
 function cameraPart(geo,mat,x,y,z){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;filmCamera.add(o);return o;}
 cameraPart(new THREE.BoxGeometry(.23,.15,.12),cameraMat,0,0,0);cameraPart(new THREE.BoxGeometry(.07,.035,.07),cameraMat,.025,.09,-.015);
 const lens=cameraPart(new THREE.CylinderGeometry(.057,.061,.12,16),cameraMat,0,0,.11);lens.rotation.x=Math.PI/2;cameraPart(new THREE.CircleGeometry(.048,20),lensMat,0,0,.172);
 cameraPart(new THREE.SphereGeometry(.008,6,4),new THREE.MeshStandardMaterial({color:'#d63223',emissive:'#d63223',emissiveIntensity:.8}),.086,.046,.066).name='camera-recording-light';
 const fallRig=new THREE.Group(),counter=new THREE.Group();fallRig.name='Akin-fall-pivot';fallRig.position.set(PERSON100.x,0,PERSON100.z);counter.position.set(-PERSON100.x,0,-PERSON100.z);fallRig.add(counter);carrier.add(fallRig);
 const fallBounds=new THREE.Box3();
 const entrance=createAngryEntrance({street,makeActor:makeMan});let bellRung=false,shouted=false;
 function resetFall(){street.userData.person.fallenBounds=null;fallRig.rotation.set(0,0,0);fallRig.position.y=0;}
 function film(p,walking,time,tilt=0){filmer.position.set(p.x-Math.sin(p.heading)*2.4,walking?Math.abs(Math.sin(time*.008+.8))*.012:0,p.z-Math.cos(p.heading)*2.4);filmer.rotation.y=p.heading;filmer.visible=true;filmCamera.rotation.x=tilt;
  for(const [j,l]of filmer.userData.legs.entries())l.rotation.x=walking?Math.sin(time*.008+.8+j*Math.PI)*.3:0;
  filmCamera.updateWorldMatrix(true,true);for(let i=0;i<2;i++)reach(filmer,i,filmCamera.localToWorld(new THREE.Vector3(i===0?-.10:.10,-.06,0)));
 }
 function colliders(){street.userData.escortObstacles=[...men,filmer,...(entrance.woman.visible?[entrance.woman]:[])].filter(m=>m.visible).map(m=>({x:m.position.x,z:m.position.z,radius:.24}));}
 let state='idle',started=0,request=0,lastPoint=null,attached=null;
 const final=ESCORT_ROUTE.at(-1),segments=ESCORT_ROUTE.slice(1).map((p,i)=>Math.hypot(p[0]-ESCORT_ROUTE[i][0],p[1]-ESCORT_ROUTE[i][1])),length=segments.reduce((a,b)=>a+b,0),walkSeconds=length/.85;
 function point(t){let d=clamp(t,0,1)*length;for(let i=0;i<segments.length;i++){if(d<=segments[i]||i===segments.length-1){const a=ESCORT_ROUTE[i],b=ESCORT_ROUTE[i+1],u=clamp(d/segments[i],0,1);return{x:THREE.MathUtils.lerp(a[0],b[0],u),z:THREE.MathUtils.lerp(a[1],b[1],u),heading:Math.atan2(b[0]-a[0],b[1]-a[1])};}d-=segments[i];}}
 function position(p,walking,time){carrier.position.set(p.x-PERSON100.x,0,p.z-PERSON100.z);street.userData.person.travelPosition={x:p.x,z:p.z};
  men.forEach((m,i)=>{const side=i===0?-1:1;m.position.set(p.x+side*.62*Math.cos(p.heading),walking?Math.abs(Math.sin(time*.008))*.012:0,p.z-side*.62*Math.sin(p.heading));m.rotation.y=p.heading;m.visible=true;for(const [j,l]of m.userData.legs.entries())l.rotation.x=walking?Math.sin(time*.008+j*Math.PI)*.30:0;for(const a of m.userData.arms){a.root.rotation.set(0,0,0);a.root.scale.set(1,1,1);a.elbow.rotation.set(0,0,0);}const target=street.localToWorld(new THREE.Vector3(p.x+side*.20,1.31,p.z));reach(m,i===0?1:0,target);});
  film(p,walking,time);colliders();lastPoint=p;
 }
 function stop(){entrance.reset(false);request++;state='idle';carrier.position.set(0,0,0);street.userData.person.travelPosition=null;street.userData.escortObstacles=[];men.forEach(m=>m.visible=false);filmer.visible=false;resetFall();dance.setEscort(null);dance.cancelRing();}
 async function start(){if(state!=='idle'&&state!=='done')return false;state='loading';const id=++request;dance.cancelRing();try{const model=await street.userData.loadPerson();if(id!==request)return false;if(model!==attached){counter.add(model);attached=model;}resetFall();entrance.reset();bellRung=false;shouted=false;started=null;state='walking';return true;}catch{if(id===request){stop();onError();}return false;}}
 function update(now){if(['idle','loading','done'].includes(state))return;if(started===null)started=now;const elapsed=(now-started)/1000;
  if(elapsed<walkSeconds){state='walking';const p=point(elapsed/walkSeconds);position(p,true,now);dance.setEscort({walking:true,heading:p.heading,phase:now*.008});onFrame({...p,state});return;}
  const t=elapsed-walkSeconds,p={x:final[0],z:final[1],heading:0};position(p,false,now);
  if(t<1.2){state='pressing';dance.setEscort({walking:false,heading:0,phase:0});const man=men[1],handStart=street.localToWorld(new THREE.Vector3(man.position.x+.21,1.18,man.position.z+.1)),target=street.localToWorld(new THREE.Vector3(37.3889,1.368,5.4263));reach(man,1,handStart.lerp(target,Math.sin(clamp(t/.8,0,1)*Math.PI/2)));}
  else{if(!bellRung){bellRung=true;state='dancing';dance.setEscort(null);dance.ring(now);onBell();}const backoff=clamp((t-1.2)/.8,0,1);men.forEach((m,i)=>{m.position.x+=(i===0?-1:1)*.20*backoff;for(const a of m.userData.arms){a.root.rotation.set(0,0,0);a.root.scale.set(1,1,1);}});if(t>10.2){const opening=clamp(t-10.2,0,1);entrance.update(opening,t>=11.2&&t<13.6,now,clamp((t-13.6)/.6,0,1));state=t<11.2?'opening-door':'shouting';dance.setEscort({walking:false,heading:Math.PI,phase:0});if(t>=11.2&&!shouted){shouted=true;onShout();}}if(t>13.6){const u=clamp((t-13.6)/1.2,0,1);state=u<1?'falling':'fallen';dance.setEscort({walking:false,heading:Math.PI,phase:0});fallRig.rotation.x=-Math.PI/2*u*u;fallRig.position.y=0;fallRig.updateWorldMatrix(true,true);fallBounds.setFromObject(attached);fallRig.position.y=Math.max(0,.008-fallBounds.min.y);film(p,false,now,.55*u);fallRig.updateWorldMatrix(true,true);const body=new THREE.Box3().setFromObject(attached).applyMatrix4(street.matrixWorld.clone().invert());street.userData.person.fallenBounds={minX:body.min.x,maxX:body.max.x,minZ:body.min.z,maxZ:body.max.z};if(t>16.8)state='done';}}
  colliders();
  onFrame({...p,state});
 }
 return {start,stop,update,get state(){return state},get busy(){return !['idle','done'].includes(state)},get men(){return men},get filmer(){return filmer},get filmCamera(){return filmCamera},get entrance(){return entrance},get fallRig(){return fallRig},get carrier(){return carrier},get duration(){return walkSeconds+16.8}};
}
