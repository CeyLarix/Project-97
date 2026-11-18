import * as THREE from './assets/three.module.js';
export const formatDistance=metres=>metres<1?`${Math.round(metres*100)} cm`:`${metres.toFixed(2).replace('.',',')} m`;
export function createMeasureLayer({holder,camera,getTargets,getElevation=()=>0,onState=()=>{}}){
 let mode='auto',lastScan=0,automatic=[],enabled=false,points=[],down=null,levelKey=null;
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
 const panel=document.createElement('div');panel.className='measure-panel';panel.hidden=true;panel.innerHTML='<label><select class="measure-mode" aria-label="Meetwijze"><option value="auto">Automatisch</option><option value="manual">Punten kiezen</option></select></label><span class="measure-instruction" role="status">Kies twee punten op muren of objecten.</span><button type="button" aria-label="Nieuwe meting" title="Nieuwe meting">↺</button><small>Modelmaat · controleer ter plaatse</small>';holder.parentElement.append(panel);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('measure-overlay');svg.setAttribute('aria-hidden','true');svg.innerHTML='<defs><marker id="measure-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10" fill="none" stroke="white" stroke-width="2"/></marker></defs><g class="measure-drawing"><line marker-start="url(#measure-arrow)" marker-end="url(#measure-arrow)"/><circle r="4"/><circle r="4"/><text text-anchor="middle"/></g>';holder.append(svg);
 const drawing=svg.querySelector('g'),line=svg.querySelector('line'),circles=[...svg.querySelectorAll('circle')],label=svg.querySelector('text'),instruction=panel.querySelector('span');
 function reset(){points=[];instruction.textContent='Kies twee punten op muren of objecten.';drawing.style.display='none';}
 panel.querySelector('button').onclick=()=>{automatic=[];lastScan=0;reset();};
 panel.querySelector('select').onchange=e=>{mode=e.target.value;lastScan=0;automatic=[];reset();update();};
 const autoDrawing=document.createElementNS('http://www.w3.org/2000/svg','g');svg.append(autoDrawing);
 function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
 function pick(e){if(!enabled||mode!=='manual')return;const bounds=holder.getBoundingClientRect();pointer.set((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1);camera.updateMatrixWorld();ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(getTargets(),true);const hit=hits.find(h=>h.object.isMesh&&visible(h.object)&&h.distance>.08&&!(Array.isArray(h.object.material)?h.object.material.some(m=>m.transparent):h.object.material.transparent));if(!hit){instruction.textContent='Richt op een muur, vloer of meubel.';return;}if(points.length===2)reset();points.push(hit.point.clone());instruction.textContent=points.length===1?'Eerste punt gekozen. Kies het tweede punt.':`${formatDistance(points[0].distanceTo(points[1]))} · rechte afstand tussen de punten`;update();}
 holder.addEventListener('pointerdown',e=>{if(enabled&&e.isPrimary!==false)down={x:e.clientX,y:e.clientY,id:e.pointerId};});
 holder.addEventListener('pointerup',e=>{if(down&&down.id===e.pointerId&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<6)pick(e);down=null;});holder.addEventListener('pointercancel',()=>down=null);
 function updateManual(key){if(key!==undefined&&key!==levelKey){levelKey=key;reset();}svg.style.display=enabled?'block':'none';if(!enabled||!points.length)return;const b=holder.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${b.width} ${b.height}`);const projected=points.map(p=>p.clone().project(camera));if(projected.some(p=>p.z>1||p.z< -1)){drawing.style.display='none';return;}drawing.style.display='';const a=projected[0],c=projected[1]||a,x=(a.x+1)*b.width/2,y=(1-a.y)*b.height/2,xx=(c.x+1)*b.width/2,yy=(1-c.y)*b.height/2;circles[0].setAttribute('cx',x);circles[0].setAttribute('cy',y);circles[1].setAttribute('cx',xx);circles[1].setAttribute('cy',yy);line.setAttribute('x1',x);line.setAttribute('y1',y);line.setAttribute('x2',xx);line.setAttribute('y2',yy);label.setAttribute('x',(x+xx)/2);label.setAttribute('y',(y+yy)/2-12);label.textContent=points.length===2?formatDistance(points[0].distanceTo(points[1])):'';line.style.display=points.length===2?'':'none';}
 function update(key){
  if(mode==='manual'){autoDrawing.style.display='none';panel.querySelector('button').hidden=false;return updateManual(key);}
  if(key!==undefined&&key!==levelKey){levelKey=key;automatic=[];lastScan=0;}
  drawing.style.display='none';autoDrawing.style.display=enabled?'':'none';svg.style.display=enabled?'block':'none';panel.querySelector('button').hidden=true;if(!enabled)return;
  instruction.textContent='Automatische vrije breedtes tussen oppervlakken op 60 cm hoogte. Loop of kijk rond voor andere afstanden.';
  const now=performance.now();if(now-lastScan>350||!lastScan){lastScan=now;const targets=getTargets();targets.forEach(o=>o.updateWorldMatrix(true,true));automatic=automaticGaps(camera,targets,getElevation()+.6);}
  const b=holder.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${b.width} ${b.height}`);camera.updateMatrixWorld();let html='';
  for(const pair of automatic){const a=pair[0].clone().project(camera),c=pair[1].clone().project(camera);if([a,c].some(p=>p.z>1||p.z< -1))continue;const x=(a.x+1)*b.width/2,y=(1-a.y)*b.height/2,xx=(c.x+1)*b.width/2,yy=(1-c.y)*b.height/2;if(Math.hypot(x-xx,y-yy)<45)continue;html+=`<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" marker-start="url(#measure-arrow)" marker-end="url(#measure-arrow)"/><text text-anchor="middle" x="${(x+xx)/2}" y="${(y+yy)/2-10}">${formatDistance(pair[0].distanceTo(pair[1]))}</text>`;}
  autoDrawing.innerHTML=html;if(!automatic.length)instruction.textContent='Geen vrije breedte gevonden. Kijk naar de ruimte of kies Zelf punten kiezen.';
 }
 return{update,reset,setEnabled(value){enabled=Boolean(value);if(enabled){mode='auto';panel.querySelector('select').value='auto';lastScan=0;}panel.hidden=!enabled;if(!enabled)reset();onState(enabled);update();},get enabled(){return enabled}};
}

export function automaticGaps(camera,targets,height){
 const forward=new THREE.Vector3();camera.getWorldDirection(forward);forward.y=0;if(forward.lengthSq()<.01)forward.set(0,0,-1);forward.normalize();const side=new THREE.Vector3(-forward.z,0,forward.x),ray=new THREE.Raycaster(),results=[];
 const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
 const hit=(origin,direction)=>{ray.set(origin,direction);ray.far=20;return ray.intersectObjects(targets,true).find(h=>h.distance>.025&&visible(h.object)&&h.object.isMesh&&!(Array.isArray(h.object.material)?h.object.material.some(m=>m.transparent):h.object.material.transparent));};
 const base=camera.position.clone();base.y=height;const obstruction=hit(base,forward);const limit=obstruction?Math.max(.1,obstruction.distance-.08):3;
 for(const depth of [.45,.9,1.5,2.4]){if(depth>=limit)continue;const origin=base.clone().addScaledVector(forward,depth),a=hit(origin,side),b=hit(origin,side.clone().negate());if(!a||!b)continue;const length=a.point.distanceTo(b.point);if(length<.15||length>20)continue;if(results.some(p=>Math.abs(p[0].distanceTo(p[1])-length)<.04))continue;results.push([a.point.clone(),b.point.clone()]);if(results.length===3)break;}
 return results;
}
