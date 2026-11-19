import * as THREE from './assets/three.module.js';
// Finishes and room assignments from the owner's order, 24 September 2026.
// Opening dimensions follow the retained house plan; no order/customer data is hosted.
export function buildOrderedDoors(parent,level){
 const white=new THREE.MeshStandardMaterial({color:'#f1eee5',roughness:.64}),bronze=new THREE.MeshStandardMaterial({color:'#8b7256',roughness:.4,metalness:.7}),steel=new THREE.MeshStandardMaterial({color:'#a9aeac',roughness:.3,metalness:.85}),glass=new THREE.MeshPhysicalMaterial({color:'#737b79',transparent:true,opacity:.38,roughness:.13,metalness:.05,depthWrite:false,side:THREE.DoubleSide});
 const doors=[];
 const definitions=level.id==='ground'?[[2.665,6.07,'Vision 3',true],[7.335,2.75,'Toilet'],[7.865,4.15,'Meterkast'],[6.05,2.75,'Trapkast'],[5.61,12.15,'Mancave']]:level.id==='first'?[[1.48,4.95,'Slaapkamer 1'],[1.48,2.35,'Meisjeskamer 2'],[2.68,2.35,'Meisjeskamer 3'],[5.95,3.3,'Badkamer']]:[[5.945,3.3,'Technische ruimte']];
 const box=(p,w,h,d,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=!m.transparent;o.receiveShadow=true;p.add(o);return o;};
 for(const[fixed,from,name,vision=false]of definitions){
  let wall,op;for(const w of level.walls){const hor=w.from[1]===w.to[1];const f=hor?w.from[1]:w.from[0];const hit=w.openings.find(o=>o.type==='door'&&Math.abs(o.from-from)<.001);if(Math.abs(f-fixed)<.001&&hit){wall=w;op=hit;break;}}
  if(!wall)continue;const horizontal=wall.from[1]===wall.to[1],width=op.to-op.from-.045,height=(op.top||2.3)-.035;
  const assembly=new THREE.Group();assembly.name='ordered-door-'+name;assembly.position.set(horizontal?from:fixed,0,horizontal?fixed:from);assembly.rotation.y=horizontal?0:-Math.PI/2;parent.add(assembly);
  Object.assign(assembly.userData,{orderedDoor:true,model:vision?'VISION 3':'Vlakke deur celrooster',finish:vision?'Brons / grijs glas':'Classic White Lion',frame:vision?'Vision Brons':'MP1 RAL 9010',hardware:vision?'Vision Kort Brons':name==='Technische ruimte'?'Diana RVS F69':'Neptunus RVS F69',lock:['Toilet','Badkamer'].includes(name)?'Vrijbezetslot':name==='Meterkast'?'Kastslot':'Loopslot'});
  const frame=vision?bronze:white;for(const x of[0,width+.045])box(assembly,.035,height+.035,.06,x,height/2,0,frame);box(assembly,width+.08,.035,.06,(width+.045)/2,height+.017,0,frame);
  const pivot=new THREE.Group();pivot.position.set(.022,.015,0);assembly.add(pivot);
  if(vision){box(pivot,width-.04,height-.04,.008,width/2,height/2,0,glass);for(const x of[.014,width-.014,width*.73])box(pivot,.027,height,.035,x,height/2,0,bronze);for(const y of[.018,height*.43,height-.018])box(pivot,width,.027,.035,width/2,y,0,bronze);for(const z of[-.04,.04])box(pivot,.016,.21,.024,width-.09,1.05,z,bronze);}
  else{box(pivot,width,height,.04,width/2,height/2,0,white);for(const z of[-.035,.035]){const rose=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.012,16),steel);rose.rotation.x=Math.PI/2;rose.position.set(width-.075,1.02,z);pivot.add(rose);box(pivot,.105,.016,.018,width-.115,1.02,z*1.25,steel);if(['Toilet','Badkamer','Meterkast'].includes(name))box(pivot,.025,.025,.013,width-.075,.91,z,steel);}for(const y of[.2,height-.2])box(pivot,.018,.075,.06,.006,y,0,steel);}
  doors.push({assembly,pivot,angle:0});
 }
 return doors;
}
export function updateOrderedDoors(doors,planX,worldZ,dt){for(const d of doors){const p=d.assembly.getWorldPosition(new THREE.Vector3());const target=Math.hypot(p.x-planX,p.z-worldZ)<1.9?Math.PI*.48:0;d.angle+=(target-d.angle)*Math.min(1,dt*7);d.pivot.rotation.y=d.angle;}}
