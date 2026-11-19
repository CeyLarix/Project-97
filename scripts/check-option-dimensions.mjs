import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/assets/three.module.js';
import {GLTFLoader} from '../dist/assets/addons/loaders/GLTFLoader.js';
import {levels} from '../dist/plans.js';
import {buildShell} from '../dist/architecture.js';
import {loadSeating} from '../dist/models.js';
const near=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-5,`${label}: ${a} != ${b}`);
const base=new T.MeshStandardMaterial();
const materials=Object.fromEntries(['wood','wall','wallAccent','ceiling','trim','metal','stone','glass','ceramic'].map(k=>[k,base.clone()]));
const shells=levels.map(l=>{const s=buildShell(l,materials,base);s.group.position.set(0,0,0);s.group.updateMatrixWorld(true);return s;});
function clearSpan(index,x,z,axis,expected,label){
 const walls=[];shells[index].group.traverse(o=>{if(o.isMesh&&o.material===materials.wall)walls.push(o)});
 const point=new T.Vector3(x,1,z),direction=axis==='x'?new T.Vector3(1,0,0):new T.Vector3(0,0,1);
 const a=new T.Raycaster(point,direction).intersectObjects(walls,false)[0];
 const b=new T.Raycaster(point,direction.clone().negate()).intersectObjects(walls,false)[0];
 assert.ok(a&&b,label+' bounded by visible wall faces');near(a.distance+b.distance,expected,label);
}
clearSpan(0,2,2,'x',5.4,'living width');clearSpan(0,3,2,'z',4.55,'living depth to stair core');
clearSpan(0,1,6,'x',2.63,'passage beside stair core');
clearSpan(0,2,10,'x',5.4,'kitchen width');clearSpan(0,5,10,'z',5.2,'kitchen depth');
clearSpan(0,7,11,'x',3,'workroom width');clearSpan(0,8.5,11,'z',3.55,'workroom depth');
clearSpan(0,7,9,'x',3,'storage width');clearSpan(0,7,9,'z',1.85,'storage depth');
clearSpan(1,1,8,'x',3.1,'bedroom 1 width');clearSpan(1,2.5,8,'z',4,'bedroom 1 depth');
clearSpan(1,.3,8,'z',5.81,'bedroom 1 L leg');
clearSpan(1,1,1,'x',2.63,'bedroom 2 width');clearSpan(1,.3,1,'z',4.09,'bedroom 2 depth');
clearSpan(1,.7,3.8,'x',1.43,'bedroom 2 narrow leg');clearSpan(1,2,1,'z',2.2,'bedroom 2 recess');
clearSpan(1,2,3.32,'x',1.1,'landing between girls rooms');
clearSpan(1,4,1,'x',2.67,'bedroom 3 width');clearSpan(1,3,1,'z',3.35,'bedroom 3 depth');
clearSpan(1,4,8,'x',2.2,'bathroom width');clearSpan(1,4.6,8,'z',4,'bathroom depth');
clearSpan(2,1,3,'x',5.37,'attic clear width');clearSpan(2,1,3,'z',7.435,'attic knee-wall span');
clearSpan(2,4.5,7,'x',2.77,'utility width');clearSpan(2,4.5,7,'z',2.72,'utility depth');
for(const [i,s]of shells.entries())near(s.orderedDoors.length,i===0?5:i===1?4:1,'retained ordered doors');
// Validate the requested single Japandi corner, replacing both old straight sofas.
globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>{},set:()=>true})})};
const scene=new T.Group(),models=await loadSeating(scene);scene.updateMatrixWorld(true);assert.deepEqual(Object.keys(models),['corner']);const b=new T.Box3().setFromObject(models.corner),size=b.getSize(new T.Vector3());near(size.z,4.3,'corner length');near(size.x,2.15,'corner depth');assert.ok(b.max.y<.94&&b.min.y>=0);assert.ok(b.min.x>0&&b.max.x<5.4&&b.min.z>0&&b.max.z<4.55);
console.log('Option audit passed: 24 clear spans, 10 ordered doors, one 4.30×2.15m Japandi corner inside living room.');
