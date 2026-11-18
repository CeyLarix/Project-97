import assert from 'node:assert/strict';
import * as THREE from '../dist/assets/three.module.js';
import {furnishMancave} from '../dist/mancave.js';
import {buildShell} from '../dist/architecture.js';
import {levels} from '../dist/plans.js';
import {outsideWalkable} from '../dist/plot97.js';

const material=new THREE.MeshStandardMaterial({color:'#c7bba8'}),shared=Object.fromEntries(['wood','wall','wallAccent','ceiling','trim','metal','stone','glass','ceramic'].map(role=>[role,material.clone()]));
const shell=buildShell(levels[0],shared,material),content=furnishMancave(shell.group,shared),g=content.group;
g.updateMatrixWorld(true);
assert.equal(g.userData.room,'office');
for(const name of ['mancave-chill-sofa','mancave-tv','mancave-playstation','mancave-playstation-controller','mancave-fridge-freezer','mancave-fridge-door','mancave-freezer-door','mancave-table-football'])assert.ok(g.getObjectByName(name),'missing requested prop: '+name);
let rods=0,handles=0,players=0,goals=0;
g.traverse(o=>{if(o.name.startsWith('foosball-rod-'))rods++;if(o.name.startsWith('foosball-handle-'))handles++;if(o.name==='foosball-player')players++;if(o.name==='foosball-goal')goals++;if(o.isMesh){assert.ok(o.geometry.attributes.position.array.every(Number.isFinite),'finite prop mesh');if(o.geometry.attributes.normal)assert.ok(o.geometry.attributes.normal.array.every(Number.isFinite),'finite prop normals');}assert.ok(o.position.toArray().every(Number.isFinite)&&o.scale.toArray().every(Number.isFinite),'finite transform');});
assert.equal(rods,8);assert.equal(handles,8);assert.equal(players,22);assert.equal(goals,2);
const bounds=new THREE.Box3().setFromObject(g);assert.ok(bounds.min.x>=5.82-1e-6&&bounds.max.x<=8.82+1e-6,'furniture within room width');assert.ok(bounds.min.z>=10.05-1e-6&&bounds.max.z<=13.6+1e-6,'furniture within room depth');assert.ok(bounds.max.y<2.7,'below ceiling');
const footballBounds=new THREE.Box3().setFromObject(g.getObjectByName('mancave-table-football')),footballObstacle=content.obstacles.find(o=>o.name==='table-football-including-handles');assert.ok(footballObstacle.minX<=footballBounds.min.x&&footballObstacle.maxX>=footballBounds.max.x&&footballObstacle.minZ<=footballBounds.min.z&&footballObstacle.maxZ>=footballBounds.max.z,'football collision includes projecting handles and goals');
const sofa=g.getObjectByName('mancave-chill-sofa'),tv=g.getObjectByName('mancave-tv');const forward=new THREE.Vector3(0,0,-1).applyQuaternion(sofa.quaternion);assert.ok(forward.x<-.99&&tv.position.x<sofa.position.x,'seat faces the television');
assert.equal(content.obstacles.length,4,'four furniture footprints');
const obstacles=[...shell.obstacles,...content.obstacles],r=.17;
const blocked=(x,z)=>{
 const within=(x>.17&&x<5.32&&z>.17&&z<13.43)||(x>=5.32&&x<8.65&&z>8.27&&z<13.43)||outsideWalkable(x,z,r);
 return !within||obstacles.some(o=>x+r>o.minX&&x-r<o.maxX&&z+r>o.minZ&&z-r<o.maxZ);
};
const step=.025,minX=4.8,minZ=9.9,width=157,depth=189,visited=new Uint8Array(width*depth),queue=[];
const cell=(x,z)=>[Math.round((x-minX)/step),Math.round((z-minZ)/step)],enqueue=(ix,iz)=>{if(ix<0||ix>=width||iz<0||iz>=depth)return;const id=iz*width+ix;if(visited[id]||blocked(minX+ix*step,minZ+iz*step))return;visited[id]=1;queue.push([ix,iz]);};
enqueue(...cell(5.1,12.65));assert.equal(queue.length,1,'clear kitchen start');
for(let cursor=0;cursor<queue.length;cursor++){const [x,z]=queue[cursor];for(const [xx,zz]of [[x-1,z],[x+1,z],[x,z-1],[x,z+1]])enqueue(xx,zz);}
for(const [name,x,z]of [['room viewpoint',6,12.65],['chill seat front',7.3,11.1],['fridge front',6.8,11.03],['table player front',7.18,11.5],['table player rear',7.18,13.35],['garden doorway',7.5,14.15]]){assert.ok(!blocked(x,z),'unblocked '+name);const [ix,iz]=cell(x,z);assert.ok(visited[iz*width+ix],'walk from kitchen to '+name);}
console.log('Mancave passed: compact sofa faces TV, games console/controller, two-door fridge/freezer, actual 8-rod/22-player table football, contained geometry/handles and normal walking from kitchen to play/chill zones and garden.');
