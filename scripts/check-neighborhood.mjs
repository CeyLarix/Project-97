import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/assets/three.module.js';
import {GLTFLoader} from '../dist/assets/addons/loaders/GLTFLoader.js';
import {createNeighborhood,HOUSES} from '../dist/neighborhood.js';
globalThis.self=globalThis;globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>new Proxy({},{get:()=>()=>{},set:()=>true})})};
const parsed=new Map();for(const h of HOUSES){const b=fs.readFileSync(new URL('../dist/'+h.file,import.meta.url));const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');let count=0;g.scene.traverse(o=>{if(o.isMesh){count++;assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));assert.ok(o.geometry.attributes.normal.array.every(Number.isFinite));}});assert.equal(count,h.meshCount);parsed.set(h.number,g);}
const group=createNeighborhood({loadModel:async h=>parsed.get(h.number),loadTexture:()=>new THREE.Texture(),loadPersonModel:async()=>({scene:new THREE.Group().add(new THREE.Mesh(new THREE.BoxGeometry(.6,1.8,.4),new THREE.MeshStandardMaterial()))})});const n=group.userData;
await n.loadAll();assert.ok([...n.states.values()].every(s=>s.state==='ready'));assert.equal(group.children.filter(o=>/^Bouwnummer /.test(o.name)).length,4);
for(const h of HOUSES){assert.ok(!n.blocked(h.approach[0],h.approach[2]),'blocked front approach '+h.number);const e=h.entry;for(let t=-.95;t<=.5;t+=.04){const x=e.x+(e.axis==='x'?-e.outward*t:0),z=e.z+(e.axis==='z'?-e.outward*t:0);assert.ok(!n.blocked(x,z),'blocked entry '+h.number+' at '+t);}}
assert.ok(HOUSES[0].bounds.maxX<1,'96 shares party wall with97');assert.ok(HOUSES[1].bounds.minX>14&&HOUSES[2].bounds.minX>21&&HOUSES[3].bounds.minX>33,'BPD street ordering');
const h=HOUSES.find(h=>h.number===100);assert.equal(n.portalAt(h.approach[0],h.approach[2]),false);assert.equal(n.portalAt(h.inside[0],h.inside[2]),true);assert.equal(n.portalAt(7,-5),false);
for(const h of HOUSES)assert.ok(n.walkable(h.approach[0],h.approach[2]),'entrance route allowed '+h.number);
console.log('Neighborhood passed: four original models, placement, doorway clearance, CasaBakici trigger.');
