import assert from 'node:assert/strict';
import * as THREE from '../dist/assets/three.module.js';
import {furnish} from '../dist/furniture.js';
import {furnishUpper} from '../dist/interiors.js';
import {buildShell} from '../dist/architecture.js';
import {levels,atticCeilingHeight} from '../dist/plans.js';

// Canvas drawing is irrelevant to the real mesh/obstacle geometry under test.
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>new Proxy({},{get:()=>()=>{},set:()=>true})})};
const material=new THREE.MeshStandardMaterial({color:'#d4c2a6'});
const shared=Object.fromEntries(['wood','wall','wallAccent','ceiling','trim','metal','stone','glass','ceramic'].map(role=>[role,material.clone()]));
const storeys=levels.map(level=>{
  const shell=buildShell(level,shared,material);
  const furniture=level.id==='ground'?furnish(shell.group,shared,{skipSofa:true,skipArmchair:true}):furnishUpper(shell.group,level,shared);
  return {...shell,obstacles:[...shell.obstacles,...furniture.obstacles]};
});
const ground=storeys[0],scene=ground.group,radius=.17;
scene.updateMatrixWorld(true);
const withinObstacle=(x,z,obstacles)=>obstacles.some(o=>x+radius>o.minX&&x-radius<o.maxX&&z+radius>o.minZ&&z-radius<o.maxZ);
for(let index=0;index<levels.length;index++){
  for(const room of levels[index].rooms.filter(room=>room.spawn)){
    const [x,,z]=room.spawn;
    assert.ok(!withinObstacle(x,z,storeys[index].obstacles),`spawn intersects shell or furniture: ${room.id}`);
    if(index===2)assert.ok(atticCeilingHeight(z)>=1.94,`spawn head clearance: ${room.id}`);
  }
}
const table=scene.getObjectByName('original-oval-dining-table');
assert.ok(table,'original dining table is retained');
assert.equal(table.geometry.parameters.radiusTop,.52);
assert.equal(table.scale.z,1.65);
assert.ok(table.position.z>9&&table.position.x<2.65,'table is in kitchen before island');
assert.equal(scene.getObjectByName('dining-set-in-kitchen').children.filter(o=>o.name.startsWith('original-dining-chair-')).length,4);
assert.ok(!withinObstacle(1.04,6.7,ground.obstacles),'old dining position is clear');
const island=ground.obstacles.find(o=>Math.abs(o.minX-2.65)<1e-8&&Math.abs(o.maxX-3.84)<1e-8);
assert.ok(island,'unchanged island collider');
assert.ok(island.minX-(table.position.x+.74+.24)>radius*2,'walking space between original chair and island');
const lamp=scene.getObjectByName('dining-seven-pendant-lamp');
const shades=lamp.children.filter(o=>o.userData.feature==='warm-ribbed-shade');
const slim=lamp.children.filter(o=>o.userData.feature==='slim-pendant');
assert.equal(shades.length,4,'four ribbed shades');assert.equal(slim.length,3,'three slim pendants');
assert.equal(new Set(slim.map(o=>o.userData.bottomHeight)).size,3,'different slim pendant heights');
const plate=scene.getObjectByName('dining-oval-ceiling-plate');
const plateBounds=new THREE.Box3().setFromObject(plate);
assert.ok(plateBounds.max.z-plateBounds.min.z>(plateBounds.max.x-plateBounds.min.x)*2,'oval plate along long table axis');
const lampBounds=new THREE.Box3().setFromObject(lamp),tableBounds=new THREE.Box3().setFromObject(table);
assert.ok(lampBounds.max.y<=2.7+1e-6,'ceiling attachment below ceiling');
assert.ok(lampBounds.min.y>tableBounds.max.y+.9,'clearance above tabletop');
assert.ok(lampBounds.min.x>tableBounds.min.x&&lampBounds.max.x<tableBounds.max.x,'lamp centred over table width');
assert.ok(lampBounds.min.z>tableBounds.min.z&&lampBounds.max.z<tableBounds.max.z,'lamp centred over table length');
for(const shade of shades){
  const mesh=shade.children.find(o=>o.geometry?.type==='LatheGeometry');
  assert.ok(mesh,'ribbed shade geometry');
  const positions=mesh.geometry.attributes.position,radial=[];
  // One complete profile ring has 145 vertices; radius must vary physically.
  for(let i=0;i<145;i++)radial.push(Math.hypot(positions.getX(i),positions.getZ(i)));
  assert.ok(Math.max(...radial)/Math.min(...radial)>1.08,'physical ribs, not a texture');
  assert.ok(mesh.material.emissiveIntensity>0,'warm luminous shade');
  for(const other of slim){
    const stem=other.children[0];
    assert.ok(Math.hypot(stem.position.x-mesh.position.x,stem.position.z-mesh.position.z)>.2,'slim hanger clears shade');
  }
}
scene.traverse(o=>{if(o.isMesh){
  assert.ok(o.geometry.attributes.position.array.every(Number.isFinite),`finite geometry: ${o.name}`);
  if(o.geometry.attributes.normal)assert.ok(o.geometry.attributes.normal.array.every(Number.isFinite),`finite normals: ${o.name}`);
}});
assert.equal(scene.getObjectByName('dining-pendant-light').userData.diningPendant,true,'warm lighting hook');

// Real shell + furniture colliders, same 17 cm radius as normal walking.
// The modest grid resolves the narrow aisle next to the retained chairs.
const step=.05,width=109,depth=346;
const open=(ix,iz)=>{
  const x=ix*step,z=iz*step;
  return x>.17&&x<5.32&&z>.17&&z<17.25&&!withinObstacle(x,z,ground.obstacles);
};
const origin=levels[0].rooms.find(room=>room.id==='living').spawn;
const start=[Math.round(origin[0]/step),Math.round(origin[2]/step)];
const visited=new Uint8Array(width*depth),queue=[start];visited[start[1]*width+start[0]]=1;
for(let cursor=0;cursor<queue.length;cursor++){
  const [x,z]=queue[cursor];
  for(const [xx,zz] of [[x-1,z],[x+1,z],[x,z-1],[x,z+1]]){
    const id=zz*width+xx;
    if(xx<0||xx>=width||zz<0||zz>=depth||visited[id]||!open(xx,zz))continue;
    visited[id]=1;queue.push([xx,zz]);
  }
}
for(const id of ['hall','dining','kitchen','garden']){
  const room=levels[0].rooms.find(room=>room.id===id),[x,,z]=room.spawn;
  assert.ok(visited[Math.round(z/step)*width+Math.round(x/step)],`normal walking route from living to ${id}`);
}
console.log('Dining passed: original table/four chairs in kitchen, four physical ribbed shades + three slim pendants, oval plate, all room spawns clear, and normal walking routes to dining, kitchen, hall and garden.');
