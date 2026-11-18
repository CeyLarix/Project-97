import assert from 'node:assert/strict';
import * as THREE from '../dist/assets/three.module.js';
import {furnishKitchen} from '../dist/kitchen.js';
import {orientGroup,planWorldX} from '../dist/orientation.js';
const root=orientGroup(new THREE.Group()),floor=new THREE.Group();root.add(floor);
const k=furnishKitchen(floor);k.group.position.z=.15;root.updateMatrixWorld(true);
assert.equal(k.features.upperCabinetFronts.length,3);
for(const front of k.features.upperCabinetFronts){const b=new THREE.Box3().setFromObject(front);assert.ok(b.max.y-b.min.y>.5,'recognisable tall upper door');assert.equal(front.material.userData.fixedKitchen,true);}
const shelf=k.features.sinkShelf,b=new THREE.Box3().setFromObject(shelf);
assert.ok(b.min.y>1.60&&b.max.y<1.70,'shelf above faucet');
// Shoot in actual street-oriented coordinates through the open niche, rather
// than accepting an opaque block whose name merely says shelf.
const cameraPosition=new THREE.Vector3(planWorldX(.65),1.82,10.675);
const target=new THREE.Vector3(planWorldX(5.378),1.82,10.675);
const ray=new THREE.Raycaster(cameraPosition,target.clone().sub(cameraPosition).normalize(),0,5.5);
const hits=ray.intersectObject(k.group,true).filter(h=>h.object.isMesh);
assert.ok(hits.length,'walnut rear of cubby is visible');
const localHit=floor.worldToLocal(hits[0].point.clone());
assert.ok(localHit.x>5.3,'open niche has no front slab hiding the shelf');
const lamp=k.features.islandSpotbar;assert.equal(lamp.userData.article,'46244');assert.equal(lamp.userData.length,1.2);assert.equal(lamp.userData.barWidth,.03);
const heads=lamp.children.filter(o=>o.userData.feature==='island-spot-head');assert.equal(heads.length,6);
assert.equal(k.lights.filter(l=>l.userData.kitchenIslandSpot).length,6);
const bar=lamp.getObjectByName('spotbar-120cm-bar');assert.equal(bar.geometry.parameters.height,1.2);
const mount=lamp.getObjectByName('spotbar-10cm-mount');assert.equal(mount.geometry.parameters.width,.1);
const bounds=new THREE.Box3().setFromObject(lamp);assert.ok(bounds.max.y<=2.7&&bounds.min.y>2.4,'ceiling fitting stays high');
const centre=lamp.getWorldPosition(new THREE.Vector3());assert.ok(Math.abs(centre.x-planWorldX(3.245))<1e-7);assert.ok(Math.abs(centre.z-10.675)<1e-7,'centred on island with retained parent offset');
for(const light of k.lights.filter(l=>l.userData.kitchenIslandSpot)){const p=light.getWorldPosition(new THREE.Vector3()),t=light.target.getWorldPosition(new THREE.Vector3());assert.ok(t.y<p.y-1&&t.x>planWorldX(3.84)&&t.x<planWorldX(2.65),'spots aimed into island work zone');}
k.group.traverse(o=>{if(o.isMesh){assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));if(o.geometry.attributes.normal)assert.ok(o.geometry.attributes.normal.array.every(Number.isFinite));}});
assert.deepEqual(k.obstacles,[{minX:4.7,minZ:8.35,maxX:5.4,maxZ:12},{minX:2.65,minZ:9.27,maxX:3.84,maxZ:11.78}]);
console.log('Kitchen completion passed: visible upper cupboard fronts/open walnut shelf, warm lighting, exact 120cm six-head sand spotbar, island placement and retained collision footprint.');
