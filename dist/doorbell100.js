import {createWomanShout} from './door-woman100.js';
import {createEscort100} from './escort100.js';
import * as THREE from './assets/three.module.js';
import {HOUSES} from './neighborhood-data.js';
export const BELL100={...HOUSES.find(h=>h.number===100).entry,height:1.4,offsetZ:-.82};
export function buildDoorbell100(parent){
 const g=new THREE.Group();g.name='Eufy video doorbell · 100';g.position.set(BELL100.x-.045,BELL100.height,BELL100.z+BELL100.offsetZ);g.rotation.y=-Math.PI/2;parent.add(g);
 const black=new THREE.MeshStandardMaterial({color:'#171a1c',roughness:.42}),metal=new THREE.MeshStandardMaterial({color:'#5a6063',metalness:.6,roughness:.32});
 const part=(geo,mat,x,y,z)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);g.add(o);return o};
 part(new THREE.BoxGeometry(.058,.155,.028),black,0,0,0);
 part(new THREE.BoxGeometry(.049,.145,.003),metal,0,0,.015);
 const lens=part(new THREE.CircleGeometry(.015,28),black,0,.043,.018);lens.name='eufy-camera';
 const led=new THREE.MeshStandardMaterial({color:'#8ed2ef',emissive:'#3daaf1',emissiveIntensity:.5});
 part(new THREE.TorusGeometry(.016,.002,6,32),led,0,-.032,.020);
 part(new THREE.CircleGeometry(.013,24),black,0,-.032,.020);
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=128;c.height=48;const ctx=c.getContext('2d');ctx.fillStyle='#ddd';ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText('eufy',64,35);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;part(new THREE.PlaneGeometry(.033,.012),new THREE.MeshBasicMaterial({map:t,transparent:true}),0,.008,.019);}
 g.userData={brand:'eufy',simulation:true};return {group:g,led};
}
// A locally synthesized two-note chime; no external media or autoplay dependency.
export function createDoorbellChime(getContext=()=>new (globalThis.AudioContext||globalThis.webkitAudioContext)()){
 let context=null;
 const play=function(){try{context??=getContext();const resume=context.resume();const start=()=>{const now=context.currentTime+.025;
  for(const [delay,freq]of [[0,660],[.42,523.25]])for(const [ratio,volume]of [[1,.17],[2,.035],[3,.012]]){const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type='sine';oscillator.frequency.value=freq*ratio;gain.gain.setValueAtTime(.0001,now+delay);gain.gain.exponentialRampToValueAtTime(volume,now+delay+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+delay+1.3);oscillator.connect(gain);gain.connect(context.destination);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};oscillator.start(now+delay);oscillator.stop(now+delay+1.35);}
  };if(context.state==='running')start();else Promise.resolve(resume).then(start).catch(()=>{});return true;}catch{return false;}};
 play.unlock=()=>{try{context??=getContext();Promise.resolve(context.resume()).catch(()=>{});}catch{}};return play;
}
export function setupDoorbell100({street,camera,canvas,button,dance,canInteract,onApproach=()=>{},onRing=()=>{},onSceneFrame=()=>{},onShout=()=>{},onStart=()=>{},onStop=()=>{},onError=()=>{}}){
 const bell=buildDoorbell100(street),chime=createDoorbellChime();let lastRing=-Infinity,down=null,near=false;
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),p=new THREE.Vector3();
 function available(){street.updateWorldMatrix(true,false);street.worldToLocal(p.copy(camera.position));return canInteract()&&(p.x-BELL100.x)*BELL100.outward>.05&&Math.hypot(p.x-BELL100.x,p.z-BELL100.z)<3.4;}
 const shout=createWomanShout();
 const sequence=createEscort100({street,dance,onShout:()=>{shout.play();onShout();},onBell:()=>{lastRing=performance.now();chime();onRing();},onFrame:onSceneFrame,onError:()=>{onStop();onError();}});
 function stop(){shout.stop();sequence.stop();onStop();}
 function ring(){if(!available()||sequence.busy)return false;chime.unlock();shout.unlock();onApproach();onStart();sequence.start();return true;}
 button.onclick=()=>{if(sequence.busy){stop();return false;}chime.unlock();if(!available())onApproach();return ring();};
 canvas.addEventListener('pointerdown',e=>{if(e.button>0)return;down={x:e.clientX,y:e.clientY,id:e.pointerId}});
 canvas.addEventListener('pointerup',e=>{const d=down;down=null;if(!d||d.id!==e.pointerId||Math.hypot(e.clientX-d.x,e.clientY-d.y)>8||!available())return;const b=canvas.getBoundingClientRect();pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);bell.group.updateWorldMatrix(true,true);ray.setFromCamera(pointer,camera);if(ray.intersectObject(bell.group,true).length)ring();});
 canvas.addEventListener('pointercancel',()=>{down=null});
 globalThis.addEventListener('keydown',e=>{if(e.code!=='KeyE'||e.repeat||/INPUT|SELECT|TEXTAREA/.test(e.target?.tagName)||!available())return;e.preventDefault();ring();});
 return {ring,stop,get busy(){return sequence.busy},get state(){return sequence.state},update(now){if(sequence.busy&&!canInteract())stop();sequence.update(now);near=available();button.hidden=false;button.disabled=false;button.textContent=sequence.busy?'■ Scène stoppen':'🔔 Aanbellen bij 100';bell.led.emissiveIntensity=now-lastRing<1700?1.1+.4*Math.sin(now*.012):.5;},get nearby(){return near;}};
}
