import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../dist/assets/three.module.js';
import {levels,atticCeilingHeight} from '../dist/plans.js';
import {planWorldX,planStepX} from '../dist/orientation.js';
import {outsideWalkable} from '../dist/plot97.js';
const source=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const line=name=>source.split('\n').find(s=>s.startsWith('function '+name+'('));
const buttons=new Map(),element=id=>{if(!buttons.has(id))buttons.set(id,{textContent:'',title:'',attrs:{},setAttribute(k,v){this.attrs[k]=v},classList:{remove(){}}});return buttons.get(id)};
const ctx=vm.createContext({THREE,levels,atticCeilingHeight,planWorldX,planStepX,outsideWalkable,camera:new THREE.PerspectiveCamera(),prefs:{moveSpeed:2},active:0,ghostMode:false,mode:'walk',currentRoom:'kitchen',neighborPortalOpen:false,changingLevel:false,yaw:0,keys:new Set(),held:new Set(),touchMove:{forward:0,side:0},view:{classList:{contains:()=>false}},outside:{userData:{obstacles:[]}},street:{userData:{walkable:()=>false,blocked:()=>false,portalAt:()=>false}},storeys:levels.map(()=>({obstacles:[{minX:2.4,maxX:2.6,minZ:2,maxZ:12},{minX:1,maxX:1.5,minZ:4.5,maxZ:5.5}]})),$:element,$$:()=>[],stopTour(){},clearKeys(){ctx.keys.clear();ctx.held.clear();ctx.touchMove={forward:0,side:0}},toast(){},updateStatus(){},markRoom(id){ctx.currentRoom=id},aim(pos){ctx.camera.position.set(planWorldX(pos[0]),pos[1]+levels[ctx.active].floorElevation,pos[2]+levels[ctx.active].origin.z)},openNeighbor100(){throw Error('Unexpected portal')}});
const toggle=source.slice(source.indexOf('function restoreSolidPosition()'),source.indexOf("$('#ghost-mode').onclick"));
vm.runInContext(['pointInPolygon','localPosition','blocked','move'].map(line).join('\n')+'\n'+toggle,ctx);
const at=(x,z)=>ctx.camera.position.set(planWorldX(x),levels[ctx.active].floorElevation+1.65,z+levels[ctx.active].origin.z);
for(const index of [0,1,2]){
 ctx.active=index;at(2,5);assert.equal(ctx.blocked(2.5,5),true);
 ctx.setGhost(true);assert.equal(ctx.ghostMode,true);assert.equal(element('#ghost-mode').attrs['aria-pressed'],'true');
 // Every input shares move(): cross a real-sized partition, then a furniture AABB.
 for(const input of ['keyboard','buttons','joystick']){
  at(2,5);ctx.keys.clear();ctx.held.clear();ctx.touchMove={forward:0,side:0};
  if(input==='keyboard')ctx.keys.add('a');else if(input==='buttons')ctx.held.add('left');else ctx.touchMove.side=-1;
  for(let i=0;i<15;i++)ctx.move(.04);
  assert.ok(ctx.localPosition().x>2.7,'ghost crosses partition via '+input);
 }
 at(.65,5);ctx.keys.clear();ctx.held.clear();ctx.touchMove={forward:0,side:-1};for(let i=0;i<20;i++)ctx.move(.04);assert.ok(ctx.localPosition().x>1.7,'ghost crosses furniture');
 at(1.25,5);ctx.setGhost(false);assert.equal(ctx.ghostMode,false);let p=ctx.localPosition();assert.equal(ctx.blocked(p.x,p.z),false,'off escapes furniture on level '+index);
 at(2.5,5);ctx.setGhost(true);ctx.setGhost(false);p=ctx.localPosition();assert.equal(ctx.blocked(p.x,p.z),false,'off escapes wall');
 // Normal walking collides again, preserving the existing movement path.
 at(2,5);ctx.keys.add('a');for(let i=0;i<30;i++)ctx.move(.04);assert.ok(ctx.localPosition().x<2.24,'solid blocks partition');ctx.keys.clear();
}
ctx.active=0;at(2,5);ctx.setGhost(true);ctx.mode='overview';const before=ctx.camera.position.clone();ctx.keys.add('a');ctx.move(.04);assert.ok(before.equals(ctx.camera.position),'overview does not walk');ctx.mode='walk';ctx.keys.clear();
// Far outside the navigable floor, disabling falls back to a clear room spawn.
at(100,100);ctx.setGhost(false);const p=ctx.localPosition();assert.equal(ctx.blocked(p.x,p.z),false);assert.equal(element('#ghost-mode').attrs['aria-pressed'],'false');
console.log('Ghost passed: all levels, keyboard/buttons/joystick, wall/furniture passage, solid recovery, boundaries and overview.');
