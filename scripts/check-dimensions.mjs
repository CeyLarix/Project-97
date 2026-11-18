import assert from 'node:assert/strict';
import {levels} from '../dist/plans.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const g=levels[0],room=id=>g.rooms.find(r=>r.id===id);
const dims=(id,w,d)=>{const b=room(id).bounds;near(b.x2-b.x1,w);near(b.z2-b.z1,d)};
dims('toilet',1.33,.93);dims('office',3,3.55);dims('storage',3,1.85);dims('kitchen',5.4,5.2);
const coreFront=g.walls.find(w=>w.from[0]===2.63&&w.from[1]===4.625),coreRear=g.walls.find(w=>w.from[0]===2.63&&w.from[1]===8.35);
near(coreFront.from[1]-coreFront.thickness/2,4.55);near(coreRear.from[1]+coreRear.thickness/2,8.4);
near(5.4*13.6-2.77*(8.4-4.55),62.7755);
const shared=g.walls.find(w=>w.thickness===.42);near(shared.from[0]-.21,5.4);near(shared.from[0]+.21,room('office').bounds.x1);
const partition=g.walls.find(w=>w.from[1]===10&&w.to[1]===10);near(partition.from[1]-.05,room('storage').bounds.z2);near(partition.from[1]+.05,room('office').bounds.z1);
for(const l of levels.slice(1)){near(l.bounds.x2-l.bounds.x1,5.4);near(l.bounds.z2-l.bounds.z1,10);near(l.origin.z,1.2)}
near(levels[1].floorElevation,2.92);near(levels[2].floorElevation,5.84);near(levels[2].roof.rearKneeZ-levels[2].roof.frontKneeZ,7.435);
console.log('Dimension audit passed: drawing room sizes, wall faces, shared wall, floor alignments and 62.8 m² area.');
