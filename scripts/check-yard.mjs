import assert from 'node:assert/strict';
import * as THREE from '../dist/assets/three.module.js';
import {createForecourt} from '../dist/forecourt.js';
import {PLOT97,FORECOURT97,outsideWalkable} from '../dist/plot97.js';
import {levels} from '../dist/plans.js';
const m=new THREE.MeshBasicMaterial();const yard=createForecourt({paving:m,timber:m,soil:m,leaves:m});yard.updateMatrixWorld(true);
const box=new THREE.Box3().setFromObject(yard);
assert.ok(box.min.x>=PLOT97.minX&&box.max.x<=PLOT97.maxX,'forecourt exceeds parcel width');assert.ok(box.min.z>=PLOT97.frontZ&&box.max.z<=PLOT97.rearZ,'forecourt exceeds parcel depth');
assert.ok(yard.userData.gate.userData.open&&Math.abs(yard.userData.gate.rotation.y)>1.5,'gate leaf leaves passage open');
assert.equal(FORECOURT97.sidepath.x2-FORECOURT97.sidepath.x1,1.1999999999999993);
for(let z=6;z<14.2;z+=.1){assert.ok(outsideWalkable(10.02,z),'disconnected side path '+z);assert.ok(!yard.userData.obstacles.some(o=>10.19>o.minX&&9.85<o.maxX&&z+.17>o.minZ&&z-.17<o.maxZ),'side path obstacle '+z);}
for(const [x,z]of [[11.2,10],[4,-4],[4,22]])assert.equal(outsideWalkable(x,z),false,'parcel boundary');
const windows=levels.flatMap(l=>l.walls.flatMap(w=>w.openings.filter(o=>o.type==='window').map(o=>({level:l.id,...o}))));
assert.equal(windows.filter(w=>w.level==='ground').length,3);for(const w of windows){assert.ok(Math.abs(w.bottom-(w.level==='ground'?.02:.366))<1e-8,'incorrect sill '+w.level);assert.equal(w.top,2.546);}
assert.equal(levels[0].walls.find(w=>w.from[1]===-.1&&w.to[1]===-.1).openings[0].mullion,false,'fixed front glazing has no centre bar');
const rear=levels[0].walls.find(w=>w.from[0]===5.61&&w.from[1]===13.7);assert.equal(rear.openings[0].type,'glazed-door');assert.equal(rear.openings[0].mullion,7.27);
console.log('Yard/openings passed:',{plotWidth:PLOT97.width,plotDepth:PLOT97.depth,designBounds:box.min.toArray().concat(box.max.toArray()),sidePathClear:true,windowsAudited:windows.length});
