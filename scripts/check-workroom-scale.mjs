import assert from 'node:assert/strict';
import * as THREE from '../dist/assets/three.module.js';
import {furnish} from '../dist/furniture.js';import {buildShell} from '../dist/architecture.js';import {levels} from '../dist/plans.js';
globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>{},set:()=>true})})};
const mat=new THREE.MeshStandardMaterial(),shared=Object.fromEntries(['wood','wall','wallAccent','ceiling','trim','metal','stone','glass','ceramic'].map(r=>[r,mat.clone()]));const shell=buildShell(levels[0],shared,mat),content=furnish(shell.group,shared,{skipSofa:true});const room=shell.group.getObjectByName('annex-workroom');shell.group.updateMatrixWorld(true);
// Hidden folded parts must not count toward the current furniture envelope.
function bounds(name){const root=shell.group.getObjectByName(name),b=new THREE.Box3();root.traverseVisible(o=>{if(o.isMesh){o.geometry.computeBoundingBox();b.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));}});return b;}
const near=(a,b)=>assert(Math.abs(a-b)<.003,`${a} != ${b}`);
const cabinet=bounds('ikea-besta-19421699');near(cabinet.max.x-cabinet.min.x,1.20);near(cabinet.max.z-cabinet.min.z,.42);near(cabinet.max.y-cabinet.min.y,2.02);
const wall=bounds('workroom-full-cabinet-wall');near(wall.max.x-wall.min.x,2.92);near(wall.max.y,2.68);assert(wall.min.x>=5.82&&wall.max.x<=8.82&&wall.min.z>=10.05&&wall.max.z<=10.77);
const desktop=bounds('work-niche-desktop');near(desktop.max.x-desktop.min.x,1.06);near(desktop.max.z-desktop.min.z,.60);near(desktop.max.y,.75);
assert(shell.group.getObjectByName('integrated-fridge-door'));assert(shell.group.getObjectByName('integrated-freezer-door'));assert(shell.group.getObjectByName('fridge-vent-slot'));
const obstacles=[...shell.obstacles,...content.obstacles],blocked=(x,z)=>obstacles.some(o=>x+.17>o.minX&&x-.17<o.maxX&&z+.17>o.minZ&&z-.17<o.maxZ);
function routes(){assert(!blocked(6,12.65));const queue=[[120,253]],visited=new Set(['120,253']);for(let i=0;i<queue.length;i++){const[x,z]=queue[i];for(const[a,b]of[[x-1,z],[x+1,z],[x,z-1],[x,z+1]]){const k=a+','+b;if(visited.has(k)||a<116||a>173||b<204||b>268||blocked(a*.05,b*.05))continue;visited.add(k);queue.push([a,b]);}}for(const[x,z]of[[6.3,12.65],[6.5,11.8],[6.7,11.2],[7.5,11.15],[7.7,11.05]])assert(visited.has(Math.round(x/.05)+','+Math.round(z/.05)),'reachable '+[x,z]);}
const sofa=bounds('workroom-sleeper-sofa');near(sofa.max.x-sofa.min.x,.84);near(sofa.max.z-sofa.min.z,1.40);assert(!sofa.intersectsBox(wall));routes();assert(!blocked(7,12.5));
room.userData.setSleepMode(true);assert(room.userData.getSleepMode());shell.group.updateMatrixWorld(true);const bed=bounds('workroom-sleeper-sofa');near(bed.max.x-bed.min.x,2.08);near(bed.max.z-bed.min.z,1.40);const mattress=bounds('sleeper-mattress');near(mattress.max.x-mattress.min.x,2);near(mattress.max.z-mattress.min.z,1.2);assert(bed.min.x>=6.69&&bed.max.x<=8.79&&bed.max.z<13.6);assert(bed.min.x-bounds('workroom-tv-cabinet').max.x>=.60);assert(blocked(7,12.5),'open bed has matching collision');routes();room.userData.setSleepMode(false);assert(!blocked(7,12.5),'folding frees the floor');
console.log('292cm cabinet wall, retained exact BESTÅ, integrated fridge/freezer, work niche, 140cm sofa / 120×200cm bed, ≥60cm aisle and both-state routes verified.');
