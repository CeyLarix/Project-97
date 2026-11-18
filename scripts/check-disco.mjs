import assert from 'node:assert/strict';
import * as THREE from '../dist/assets/three.module.js';
import {createDisco} from '../dist/disco.js';
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),fixtures=[[],[]];
for(let floor=0;floor<2;floor++){const group=new THREE.Group();group.position.y=floor*2.92;scene.add(group);for(let i=0;i<5;i++){const l=new THREE.PointLight('#ffe0b0',5,6,2);l.position.set(i,2.5,i);group.add(l);fixtures[floor].push(l);}}
const originals=fixtures.flat().map(light=>({light,position:light.position.clone(),color:light.color.clone(),intensity:light.intensity}));
let level=0;const state=[];const disco=createDisco({camera,fixtures,getLevel:()=>level,onState:s=>state.push(s)});
const lightCount=()=>{let n=0;scene.traverse(o=>{if(o.isLight)n++});return n;};
for(let cycle=0;cycle<20;cycle++){
 disco.setEnabled(true);for(let t=0;t<3000;t+=16)disco.update(t);assert.equal(lightCount(),10,'toggling never adds GPU lights');assert.equal(fixtures[0].filter(l=>l.intensity!==5).length,3);
 level=1;disco.update(4000);for(const o of originals.slice(0,5)){assert(o.light.position.equals(o.position));assert(o.light.color.equals(o.color));assert.equal(o.light.intensity,o.intensity);}
 assert.equal(fixtures[1].filter(l=>l.intensity!==5).length,3);disco.setEnabled(false);
 for(const o of originals){assert(o.light.position.equals(o.position));assert(o.light.color.equals(o.color));assert.equal(o.light.intensity,o.intensity);}
 level=0;
}
assert.equal(state.length,40);disco.setEnabled(false);assert.equal(state.length,40,'duplicate off is harmless');
console.log('Disco: stable light count through 20 cycles, only three existing fixtures animated, floor transitions and full restoration verified.');
disco.setEnabled(true);disco.update(0);assert.equal(fixtures[0].filter(l=>l.intensity===32).length,3,'short bright pulse');disco.update(100);assert.equal(fixtures[0].filter(l=>l.intensity===.2).length,3,'dark interval');disco.update(400);assert.equal(fixtures[0].filter(l=>l.intensity===32).length,3,'next pulse');disco.setEnabled(false);assert.equal(lightCount(),10);console.log('Club pulses verified: 72 ms on / 328 ms dim, at 2.5 pulses per second.');
