import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/assets/three.module.js';
import {GLTFLoader} from '../dist/assets/addons/loaders/GLTFLoader.js';
import {loadSeating,updateModels} from '../dist/models.js';
import {furnish} from '../dist/furniture.js';
import {buildShell} from '../dist/architecture.js';
import {levels} from '../dist/plans.js';
import {STYLES} from '../dist/styles.js';

globalThis.self=globalThis;
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>new Proxy({},{get:()=>()=>{},set:()=>true})})};
const material=new THREE.MeshStandardMaterial({color:'#d4c2a6'});
const shared=Object.fromEntries(['wood','wall','wallAccent','ceiling','trim','metal','stone','glass','ceramic'].map(role=>[role,material.clone()]));
const near=(a,b,message)=>assert.ok(Math.abs(a-b)<1e-5,message||`${a} != ${b}`);
const atX=(scene,name,x)=>{const o=scene.getObjectByName(name);assert.ok(o,name);near(o.getWorldPosition(new THREE.Vector3()).x,x,`${name} reflected position`);return o;};
const fallback=new THREE.Group();furnish(fallback,shared);fallback.updateMatrixWorld(true);
atX(fallback,'living-fallback-sofa',4.69);atX(fallback,'living-fallback-armchair',1.47);
const shell=buildShell(levels[0],shared,material),content=furnish(shell.group,shared,{skipSofa:true,skipArmchair:true});
const scene=shell.group,obstacles=[...shell.obstacles,...content.obstacles];scene.updateMatrixWorld(true);
const living=scene.getObjectByName('living-arrangement');near(living.position.x,5.4);near(living.scale.x,-1);
atX(scene,'living-tv',.12);atX(scene,'living-tv-console',.25);
atX(scene,'living-coffee-table-large',2.95);atX(scene,'living-coffee-table-small',2.26);atX(scene,'living-rug',2.8);
near(scene.getObjectByName('original-oval-dining-table').getWorldPosition(new THREE.Vector3()).x,1.25);
near(scene.getObjectByName('original-oval-dining-table').getWorldPosition(new THREE.Vector3()).z,10.1);
assert.equal(scene.getObjectByName('dining-set-in-kitchen').parent,scene,'kitchen dining set is outside living reflection');
assert.equal(scene.getObjectByName('reference-kitchen').parent,scene,'fixed kitchen is outside living reflection');
const livingObstacles=content.obstacles.filter(o=>o.living);assert.equal(livingObstacles.length,4);
for(const x of [4.57,2.7,.25,1.47])assert.ok(livingObstacles.some(o=>Math.abs((o.minX+o.maxX)/2-x)<1e-5),'reflected living collider '+x);
assert.ok(content.lights.some(light=>light.parent===living&&Math.abs(light.getWorldPosition(new THREE.Vector3()).x-4.03)<1e-5),'reading lamp and its light move together');
assert.equal(living.children.filter(o=>o.geometry?.type==='PlaneGeometry'&&o.position.z===.15).length,4,'front living curtains move with the room');
assert.equal(scene.children.filter(o=>o.geometry?.type==='PlaneGeometry'&&o.position.z===13.45).length,3,'rear curtains stay in place');

// Parse the actual retained GLBs; no stand-in meshes or network requests.
const originalLoad=GLTFLoader.prototype.loadAsync;
GLTFLoader.prototype.loadAsync=async function(path){
 const bytes=fs.readFileSync(new URL('../dist/'+path,import.meta.url));
 this.register(parser=>({name:'node_image_decode_stub',loadTexture(index){const t=new THREE.Texture();t.userData.embeddedSource=parser.json.textures[index].source;return Promise.resolve(t);}}));
 return this.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
};
const models=await loadSeating(scene);assert.equal(Object.keys(models).length,3,'all three real seating models load');
scene.updateMatrixWorld(true);
for(const [id,x] of [['haven',4.62],['curved',4.57],['armchair',1.47]]){
 const root=models[id],bounds=new THREE.Box3().setFromObject(root);
 near(root.getWorldPosition(new THREE.Vector3()).x,x,`real GLB ${id} reflected placement`);
 assert.ok(Math.abs(bounds.getCenter(new THREE.Vector3()).x-x)<.08,`real GLB ${id} stays centred on placement`);
 assert.equal(root.parent.name,'living-seating');near(root.parent.scale.x,-1);
 assert.ok(bounds.min.x>.1&&bounds.max.x<5.3&&bounds.min.z>.1&&bounds.max.z<4.55,`${id} remains inside living room`);
 if(id!=='armchair'){
  const collider=livingObstacles.find(o=>Math.abs((o.minX+o.maxX)/2-4.57)<1e-5);
  assert.ok(bounds.min.x>=collider.minX-.02&&bounds.max.x<=collider.maxX+.02,'sofa bounds and mirrored collision agree');
 }
}
for(const style of STYLES){updateModels(models,style);assert.ok(models.haven.visible||models.curved.visible,'selected sofa remains visible');}
// The same reflected placement applies if GLB loading fails.
GLTFLoader.prototype.loadAsync=async()=>{throw Error('forced load failure');};
const fallbackModels=await import('../dist/models.js?forced-fallback');
const fallbackScene=new THREE.Group(),result=await fallbackModels.loadSeating(fallbackScene);fallbackScene.updateMatrixWorld(true);
assert.ok(result.haven);near(new THREE.Box3().setFromObject(result.haven).getCenter(new THREE.Vector3()).x,4.695);
GLTFLoader.prototype.loadAsync=originalLoad;

const radius=.17,blocked=(x,z)=>obstacles.some(o=>x+radius>o.minX&&x-radius<o.maxX&&z+radius>o.minZ&&z-radius<o.maxZ);
for(const room of levels[0].rooms.filter(room=>room.spawn))assert.ok(!blocked(room.spawn[0],room.spawn[2]),`free spawn ${room.id}`);
// A 5cm grid validates the entry route with the same walking radius as the app.
const step=.05,width=109,depth=270,start=levels[0].rooms.find(r=>r.id==='living').spawn;
const queue=[[Math.round(start[0]/step),Math.round(start[2]/step)]],visited=new Uint8Array(width*depth);visited[queue[0][1]*width+queue[0][0]]=1;
for(let i=0;i<queue.length;i++){
 const [x,z]=queue[i];for(const [xx,zz] of [[x-1,z],[x+1,z],[x,z-1],[x,z+1]]){
  const px=xx*step,pz=zz*step,key=zz*width+xx;
  if(xx<0||xx>=width||zz<0||zz>=depth||visited[key]||px<=.17||px>=5.32||pz<=.17||pz>=13.43||blocked(px,pz))continue;
  visited[key]=1;queue.push([xx,zz]);
 }
}
for(const id of ['hall','dining','kitchen']){const r=levels[0].rooms.find(r=>r.id===id);assert.ok(visited[Math.round(r.spawn[2]/step)*width+Math.round(r.spawn[0]/step)],`living route to ${id}`);}
console.log('Living passed: TV/sofas on opposite walls, reflected retained GLBs/fallbacks/furniture/lights/colliders, kitchen dining unchanged, clear spawn and routes to hall/kitchen.');
