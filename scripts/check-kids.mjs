import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import * as THREE from '../dist/assets/three.module.js';
import {furnishUpper} from '../dist/interiors.js';
import {buildShell} from '../dist/architecture.js';
import {levels} from '../dist/plans.js';
import {STYLES} from '../dist/styles.js';
const oldCode=fs.readFileSync(0,'utf8').replace("'./assets/three.module.js'",JSON.stringify(new URL('../dist/assets/three.module.js',import.meta.url).href));
const oldFurnish=(await import('data:text/javascript;base64,'+Buffer.from(oldCode).toString('base64'))).furnishUpper;
const radius=.17;
const makeMaterials=style=>Object.fromEntries(Object.entries({...style.colors,trim:'#f1eae0',ceramic:'#eeece4',glass:'#dce3dc'}).map(([role,color])=>{const m=new THREE.MeshStandardMaterial({color});m.userData.role=role;return[role,m]}));
const snapshot=(group,excludeChildren=false)=>{
 group.updateMatrixWorld(true);const parts=[];
 group.traverse(o=>{if(!o.isMesh)return;const pos=o.getWorldPosition(new THREE.Vector3());if(excludeChildren&&pos.z<4.15&&((pos.x<2.65)||(pos.x>=2.73&&pos.z<3.4)))return;
  const material=Array.isArray(o.material)?o.material:[o.material],hash=crypto.createHash('sha256');hash.update(Buffer.from(o.geometry.attributes.position.array.buffer));if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
  parts.push(JSON.stringify([hash.digest('hex'),o.matrixWorld.elements,material.map(m=>[m.color?.getHexString(),m.roughness,m.metalness,m.userData.role])]));
 });return parts.sort();
};
for(const style of STYLES){
 const materials=makeMaterials(style),group=new THREE.Group(),result=furnishUpper(group,levels[1],materials);group.updateMatrixWorld(true);
 const original=new THREE.Group();oldFurnish(original,levels[1],makeMaterials(style));
 assert.deepEqual(snapshot(group,true),snapshot(original,true),'master, bathroom and landing retained in '+style.id);
 const oldAttic=new THREE.Group(),attic=new THREE.Group();oldFurnish(oldAttic,levels[2],makeMaterials(style));furnishUpper(attic,levels[2],makeMaterials(style));assert.deepEqual(snapshot(attic),snapshot(oldAttic),'attic unchanged');
 for(const [roomId,width] of [['bedroom2',.75],['bedroom3',1]]){
  const roomGroup=group.children.find(o=>o.userData.room===roomId);assert.ok(roomGroup,'room group '+roomId);
  const beds=[],wardrobes=[];roomGroup.traverse(o=>{if(o.userData.mattressWidth)beds.push(o);if(o.userData.range==='PAX')wardrobes.push(o)});
  assert.equal(beds.length,1);assert.equal(beds[0].userData.mattressWidth,.9);assert.equal(beds[0].userData.mattressLength,2);
  const mattress=beds[0].getObjectByName('single-mattress');assert.ok(mattress);mattress.geometry.computeBoundingBox();const mb=mattress.geometry.boundingBox;assert.ok(Math.abs((mb.max.x-mb.min.x)*mattress.scale.x-.9)<1e-6);assert.ok(Math.abs((mb.max.z-mb.min.z)*mattress.scale.z-2)<1e-6);assert.equal(beds[0].children.filter(o=>o.name==='sleeping-pillow').length,1);
  assert.equal(wardrobes.length,1);const pax=wardrobes[0];assert.equal(pax.userData.brand,'IKEA');assert.equal(pax.userData.width,width);assert.equal(pax.userData.depth,.58);assert.equal(pax.userData.height,2.01);assert.ok(pax.userData.sourceUrl.startsWith('https://www.ikea.com/nl/nl/'));
  const pb=new THREE.Box3().setFromObject(pax);assert.ok(pb.max.y<2.7&&pb.min.y>=-.001,'PAX below ceiling and on floor');
  const bb=new THREE.Box3().setFromObject(beds[0]);assert.ok(!pb.intersectsBox(bb),'bed and wardrobe do not overlap');
  const room=levels[1].rooms.find(r=>r.id===roomId),b=room.bounds;assert.ok(pb.min.x>=b.x1-.005&&pb.max.x<=b.x2+.005&&pb.min.z>=b.z1-.005&&pb.max.z<=b.z2+.005,'PAX within bedroom');
  const before=[];roomGroup.traverse(o=>{if(o.isMesh&&o.material.userData.fixedChildRoom)before.push([o,o.material.color.getHexString()])});
  assert.ok(before.length>20,'fixed child furnishings');
  for(const targetStyle of STYLES){for(const [o] of before){const m=o.material,role=m.userData.role;if(role&&targetStyle.colors[role])m.color.set(targetStyle.colors[role]);}for(const[o,color]of before)assert.equal(o.material.color.getHexString(),color,'child palette and white PAX remain across style choices');}
 }
 group.traverse(o=>{if(o.isMesh){assert.ok(o.geometry.attributes.position.array.every(Number.isFinite),'finite mesh');if(o.geometry.attributes.normal)assert.ok(o.geometry.attributes.normal.array.every(Number.isFinite),'finite normals');}});
 const shell=buildShell(levels[1],materials,materials.wood),obstacles=[...shell.obstacles,...result.obstacles];
 const blocked=(x,z)=>obstacles.some(o=>x+radius>o.minX&&x-radius<o.maxX&&z+radius>o.minZ&&z-radius<o.maxZ);
 for(const r of levels[1].rooms.filter(r=>r.spawn))assert.ok(!blocked(r.spawn[0],r.spawn[2]),'clear room spawn '+r.id);
 const step=.04,width=136,depth=251,visited=new Uint8Array(width*depth),spawn=levels[1].rooms.find(r=>r.id==='landing').spawn,start=[Math.round(spawn[0]/step),Math.round(spawn[2]/step)],queue=[start];visited[start[1]*width+start[0]]=1;
 for(let i=0;i<queue.length;i++){const[x,z]=queue[i];for(const[xx,zz]of[[x-1,z],[x+1,z],[x,z-1],[x,z+1]]){if(xx<5||zz<5||xx>=width-5||zz>=depth-5)continue;const key=zz*width+xx;if(visited[key]||blocked(xx*step,zz*step))continue;visited[key]=1;queue.push([xx,zz]);}}
 for(const id of ['bedroom2','bedroom3']){const r=levels[1].rooms.find(r=>r.id===id);assert.ok(visited[Math.round(r.spawn[2]/step)*width+Math.round(r.spawn[0]/step)],'walk from landing to '+id);}
 // Walk up to both PAX fronts and beds without Ghost mode.
 for(const[x,z]of[[1,3.55],[4.3,2.78],[1.3,1.5],[3.3,1.4]])assert.ok(visited[Math.round(z/step)*width+Math.round(x/step)],'bed/wardrobe approach '+[x,z]);
}
console.log('Kids rooms passed: two 90x200 single beds, IKEA PAX dimensions, fixed child palettes, finite geometry, free doors/routes, master/bathroom/attic preserved.');
