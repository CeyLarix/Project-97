import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from '../dist/assets/three.module.js';
import {GLTFLoader} from '../dist/assets/addons/loaders/GLTFLoader.js';
import {createNeighborhood,HOUSES,PERSON100} from '../dist/neighborhood.js';
import {orientGroup} from '../dist/orientation.js';

globalThis.self=globalThis;
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>new Proxy({},{get:()=>()=>{},set:()=>true})})};
const bytes=fs.readFileSync(new URL('../dist/'+PERSON100.file,import.meta.url));
assert.equal(createHash('sha256').update(bytes).digest('hex'),'eb91e06bb027babbf4070cb3d9d665228d05698dc9de5e0a3e866e510ed43584','uploaded GLB bytes/textures retained exactly');
const jsonLength=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
assert.equal(json.scenes[0].extras.units,'meters');assert.equal(json.images.length,2);assert.ok(json.images.every(i=>i.mimeType==='image/png'&&Number.isInteger(i.bufferView)));assert.ok(!json.animations?.length);
const loader=new GLTFLoader();
// Pixel decoding is browser-owned; retain each embedded image's mapping identity
// while parsing all actual model geometry and PBR materials in Node.
loader.register(parser=>({name:'node_image_decode_stub',loadTexture(index){const texture=new THREE.Texture();texture.userData.embeddedSource=parser.json.textures[index].source;return Promise.resolve(texture)}}));
const parsed=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const originalMaterials=new Set(),originalMaps=new Set();let meshCount=0;
parsed.scene.traverse(o=>{if(o.isMesh){meshCount++;assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));if(o.geometry.attributes.normal)assert.ok(o.geometry.attributes.normal.array.every(Number.isFinite));for(const m of Array.isArray(o.material)?o.material:[o.material]){originalMaterials.add(m);if(m.map)originalMaps.add(m.map);}}});
assert.equal(meshCount,66);assert.equal(originalMaterials.size,17);assert.equal(originalMaps.size,2);
const sourceBounds=new THREE.Box3().setFromObject(parsed.scene),height=sourceBounds.max.y-sourceBounds.min.y;
assert.ok(height>1.8&&height<1.85,'source human is already life-sized');
const sourceScene=parsed.scene.clone();
let calls=0;
const street=createNeighborhood({loadModel:async()=>({scene:new THREE.Group()}),loadTexture:()=>new THREE.Texture(),loadPersonModel:async()=>{calls++;return parsed}});
const oriented=orientGroup(new THREE.Group());oriented.add(street);
await Promise.all([street.userData.loadAll(),street.userData.loadPerson()]);
assert.equal(calls,1,'concurrent requests reuse person load');await street.userData.loadPerson();assert.equal(calls,1,'person model reused');
const person=street.userData.person.model;assert.equal(street.userData.person.state,'ready');oriented.updateMatrixWorld(true);
const placedBounds=new THREE.Box3().setFromObject(person);assert.ok(Math.abs(placedBounds.min.y-PERSON100.groundY)<1e-7,'feet rest on entry paving');assert.ok(Math.abs(placedBounds.max.y-placedBounds.min.y-height)<1e-7,'unchanged source scale');assert.ok(person.matrixWorld.determinant()<0&&parsed.scene.matrixWorld.determinant()>0,'source handedness preserved below reflected houseRoot');
parsed.scene.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material]){assert.ok(originalMaterials.has(m),'no replacement PBR materials');if(m.map)assert.ok(originalMaps.has(m.map),'no replacement textures');}});
assert.ok(street.userData.blocked(PERSON100.x,PERSON100.z),'person has a body collider');
const parcelBounds=street.userData.person.parcelBounds;assert.ok(parcelBounds&&!parcelBounds.isEmpty(),'original package has its own collider');const parcelCentre=parcelBounds.getCenter(new THREE.Vector3());assert.ok(street.userData.blocked(parcelCentre.x,parcelCentre.z),'package also blocks walking');
assert.equal(street.userData.portalAt(PERSON100.x,PERSON100.z),false,'person outside CasaBakici trigger');
// Walk a complete circle with the real 17 cm visitor radius and source wall
// collision segments; the person sits beside the path rather than in its centre.
for(let i=0;i<120;i++){const angle=i/120*Math.PI*2,x=PERSON100.x+Math.cos(angle)*.9,z=PERSON100.z+Math.sin(angle)*.9;assert.ok(street.userData.walkable(x,z),'ring inside walking area');assert.ok(!street.userData.blocked(x,z),'full loop around person at '+angle);assert.ok(!street.userData.portalAt(x,z),'ring avoids automatic portal');}
const h=HOUSES.find(h=>h.number===100),e=h.entry;
assert.ok(!street.userData.blocked(h.approach[0],h.approach[2]),'existing entrance viewpoint remains clear');
for(let t=-.95;t<=.5;t+=.04){const x=e.x+(e.axis==='x'?-e.outward*t:0),z=e.z+(e.axis==='z'?-e.outward*t:0);assert.ok(!street.userData.blocked(x,z),'doorway remains clear at '+t);}
let attempts=0;const retryStreet=createNeighborhood({loadModel:async()=>({scene:new THREE.Group()}),loadTexture:()=>new THREE.Texture(),loadPersonModel:async()=>{if(++attempts===1)throw Error('temporary person load failure');return {scene:sourceScene.clone()}}});
await assert.rejects(retryStreet.userData.loadAll(),/temporary person/);assert.equal(retryStreet.userData.person.state,'error');await retryStreet.userData.loadAll();assert.equal(attempts,2);assert.equal(retryStreet.userData.person.state,'ready');
console.log('Person100 passed: identical GLB/two embedded textures, 66 meshes/17 PBR materials, 1:1 human scale ('+height.toFixed(3)+' m), feet grounded, unmirrored face/parcel, body collision, full surrounding loop and clear entrance.');
