import {createCarport} from './carport.js';
import * as THREE from './assets/three.module.js';
import {PLOT97,FORECOURT97 as D} from './plot97.js';

export function createForecourt({paving,timber,soil,leaves}){
 const group=new THREE.Group();group.name='Voortuin, oprit en tuinpoort';group.userData.obstacles=[];
 const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.9,...extra});
 const edge=material('#827765'),clinker=material('#a99a87'),dark=material('#514d42'),leaf=material('#667258'),lamp=material('#30352e');
 const glow=new THREE.MeshStandardMaterial({color:'#e7d4a8',emissive:'#edca8c',emissiveIntensity:.7});
 const box=(w,h,d,x,y,z,m,name)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;if(name)o.name=name;group.add(o);return o;};
 const obstacle=(x1,z1,x2,z2)=>group.userData.obstacles.push({minX:x1,minZ:z1,maxX:x2,maxZ:z2,outdoor:true});
 const sprigs=[],grasses=[];
 const bed=(x1,z1,x2,z2)=>{
  box(x2-x1,.06,z2-z1,(x1+x2)/2,-.015,(z1+z2)/2,soil,'plantvak');
  for(const x of [x1,x2])box(.035,.12,z2-z1,x,.025,(z1+z2)/2,edge);
  for(const z of [z1,z2])box(x2-x1,.12,.035,(x1+x2)/2,.025,z,edge);
  obstacle(x1,z1,x2,z2);
  for(let x=x1+.18;x<x2-.12;x+=.26)for(let z=z1+.16;z<z2-.08;z+=.27){
   sprigs.push([x,.14,z,0,1]);
   for(let k=0;k<3;k++)grasses.push([x+(k-1)*.05,.28,z,(k-1)*.18,1+k*.06]);
  }
 };
 // Front garden: a clear cross-path, low beds and one light multi-stem tree.
 box(5.6,.035,3.15,2.95,-.055,-2.02,paving,'voortuin ondergrond');
 bed(.35,-3.45,2.15,-2.4);bed(2.48,-3.45,4.65,-2.4);
 bed(.35,-.88,4.65,-.44);
 const plantMatrix=new THREE.Object3D();
 for(const [rows,geometry,mat]of [[sprigs,new THREE.SphereGeometry(.12,8,6),leaf],[grasses,new THREE.ConeGeometry(.026,.4,4),material('#8b9274')]]){
  const plants=new THREE.InstancedMesh(geometry,mat,rows.length);rows.forEach(([x,y,z,rz,sy],i)=>{plantMatrix.position.set(x,y,z);plantMatrix.rotation.set(0,0,rz);plantMatrix.scale.set(1,sy,1);plantMatrix.updateMatrix();plants.setMatrixAt(i,plantMatrix.matrix);});plants.castShadow=plants.receiveShadow=true;group.add(plants);
 }
 const fp=D.frontPath;box(fp.x2-fp.x1,.045,fp.z2-fp.z1,(fp.x1+fp.x2)/2,-.015,(fp.z1+fp.z2)/2,paving,'voordeurpad');
 for(let x=.4;x<5.8;x+=.8)box(.006,.004,1.06,x,.011,-1.65,edge);
 // A multi-stem Amelanchier impression, kept entirely inside its planting bed.
 for(const [dx,dz,tilt]of [[-.08,0,-.07],[.05,.06,.06],[.02,-.05,.015]]){
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.015,.035,2.2,7),timber);trunk.position.set(1.2+dx,1.08,-2.88+dz);trunk.rotation.z=tilt;trunk.castShadow=true;group.add(trunk);
 }
 let seed=97;const rnd=()=>((seed=seed*16807%2147483647)-1)/2147483646;
 const cards=new THREE.InstancedMesh(new THREE.PlaneGeometry(.43,.43),leaves,150),dummy=new THREE.Object3D();
 for(let i=0;i<150;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*.55;dummy.position.set(1.2+Math.cos(a)*r,2.1+rnd()*.9,-2.88+Math.sin(a)*r*.55);dummy.rotation.set(rnd()*2,rnd()*6,rnd()*3);dummy.updateMatrix();cards.setMatrixAt(i,dummy.matrix);}cards.castShadow=cards.receiveShadow=true;group.add(cards);
 const d=D.driveway;
 box(d.x2-d.x1,.06,d.z2-d.z1,(d.x1+d.x2)/2,-.045,(d.z1+d.z2)/2,edge,'oprit fundering');
 const positions=[];let row=0;for(let z=d.z1+.055;z<d.z2-.05;z+=.105,row++)for(let x=d.x1+.13+(row%2)*.125;x<d.x2-.12;x+=.25)positions.push([x,z]);
 const pavers=new THREE.InstancedMesh(new THREE.BoxGeometry(.245,.035,.10),clinker,positions.length);pavers.name='warme klinkeroprit';
 positions.forEach(([x,z],i)=>{dummy.position.set(x,-.0075,z);dummy.rotation.set(0,0,0);dummy.updateMatrix();pavers.setMatrixAt(i,dummy.matrix);const c=.88+rnd()*.19;pavers.setColorAt(i,new THREE.Color(c,c,c));});pavers.castShadow=pavers.receiveShadow=true;group.add(pavers);
 for(const x of [d.x1-.025,d.x2+.025])box(.045,.08,d.z2-d.z1,x,-.015,(d.z1+d.z2)/2,edge);
 // Two parking bays beneath the carport at the storage entrance.
 for(const [x1,x2] of [[6.05,8.30],[8.45,10.70]])for(const x of [x1,x2])box(.025,.008,5.10,x,.014,5.17,dark,'parkeervak rand');
 for(let z=PLOT97.frontZ+.25;z<7.6;z+=.35)box(.17,.52,.32,10.81,.25,z,leaf,'lage erfhaag');
 obstacle(10.72,PLOT97.frontZ+.1,10.91,7.75);
 obstacle(9.285,7.99,9.445,9.38);obstacle(10.685,7.99,10.775,8.11);
 const p=D.sidepath;box(p.x2-p.x1,.045,p.z2-p.z1,(p.x1+p.x2)/2,-.015,(p.z1+p.z2)/2,paving,'pad naar achtertuin');
 for(let z=p.z1+.6;z<p.z2;z+=.8)box(p.x2-p.x1,.004,.006,(p.x1+p.x2)/2,.01,z,edge);
 // Open gate leaf faces along the annex wall, preserving a walkable side passage.
 const g=D.gate;for(const x of [9.33,10.73])box(.09,1.85,.09,x,.9,g.z,dark,'poortpaal');
 const gate=new THREE.Group();gate.name='Tuinpoort · open';gate.position.set(g.hingeX,0,g.z);gate.rotation.y=-Math.PI/2;gate.userData.open=true;group.add(gate);
 const part=(w,h,d,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;gate.add(o);return o;};
 for(let x=.045;x<g.width;x+=.075)part(.057,g.height,.035,x,g.height/2,0,timber);
 for(const y of [.25,1.5])part(g.width,.055,.055,g.width/2,y,.025,dark);
 part(.025,.16,.055,g.width-.08,.95,-.035,dark);
 for(const [a,b]of [[9.15,9.285],[10.775,10.90]])box(b-a,1.75,.04,(a+b)/2,.875,g.z,timber);
 for(let z=g.z+.06;z<13.66;z+=.14)box(.035,1.8,.125,10.88,.9,z,timber,'zijschutting');
 obstacle(10.84,g.z,10.915,13.7);
 for(const [x,z]of [[5.73,-2.75],[6.10,4.8],[10.58,7.3],[10.58,12.6]]){box(.065,.62,.065,x,.29,z,lamp,'padlamp');box(.07,.045,.07,x,.55,z,glow);}
 const carport=createCarport();group.add(carport);group.userData.obstacles.push(...carport.userData.obstacles);group.userData.gate=gate;return group;
}
