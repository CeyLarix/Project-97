import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/assets/three.module.js';
import {levels}from '../dist/plans.js';
import {buildShell}from '../dist/architecture.js';
const records=JSON.parse(fs.readFileSync(new URL('../sources/exterior/geometry-audit.json',import.meta.url))),audit=JSON.parse(fs.readFileSync(new URL('../dist/assets/woning97/raamcontrole.json',import.meta.url)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<.001,`${a} != ${b}`);
const frame=id=>records.find(r=>r.name.endsWith(':'+id)&&r.material==='hout_meranti_profiel_RAL7039_mix');
const openings=(level,wallFrom)=>levels[level].walls.find(w=>Math.abs(w.from[wallFrom.axis]-wallFrom.value)<1e-8&&w.openings.some(o=>o.type==='window')).openings.filter(o=>o.type==='window');
const front0=openings(0,{axis:1,value:-.1}),front1=openings(1,{axis:1,value:-.1}),rear1=openings(1,{axis:1,value:10.1}),side0=openings(0,{axis:0,value:5.5}),side2=openings(2,{axis:0,value:5.47});
for(const [op,id,axis,elevation]of [[front0[0],5517286,0,0],[front0[1],5517261,0,0],[side0[0],5517543,2,0],[front1[0],5517738,0,2.92],[front1[1],5517747,0,2.92],[rear1[0],5517664,0,2.92],[rear1[1],5517654,0,2.92],[side2[0],5517782,2,5.84]]){const r=frame(id);assert.ok(r);const origin=axis===2&&elevation>0?1.2:0;near(op.from,r.min[axis]-origin);near(op.to,r.max[axis]-origin);near(op.top,r.max[1]-elevation);if(elevation)near(op.bottom,r.min[1]-elevation);}
const frontDoor=levels[0].walls.find(w=>w.from[0]===5.5&&w.from[1]===-.1).openings.find(o=>o.type==='door');near(frontDoor.from,audit.externalDoors.entrance.from);near(frontDoor.to,audit.externalDoors.entrance.to);
const base=new T.MeshStandardMaterial(),materials=Object.fromEntries(['wood','wall','wallAccent','ceiling','trim','metal','stone','glass','ceramic'].map(k=>[k,base.clone()]));const shell=buildShell(levels[1],materials,base);let marked=0,otherGlass=0;shell.group.traverse(o=>{if(o.userData.bathroomOpening){marked++;o.visible=false;}else if(o.material===materials.glass&&o.visible)otherGlass++;});assert.ok(marked>=6,'bathroom frame, glazing and sill all hidden together');assert.equal(otherGlass,3,'other three bedroom windows unaffected');
assert.ok(audit.bathroomSourceDifference.retainedViSoftDesign.top>audit.bathroomSourceDifference.constructionModel.top,'design difference explicitly recorded');
console.log('Window audit passed: all 8 builder-model window positions/widths/heights, entrance alignment, complete duplicate bathroom opening hidden, bedroom windows untouched and ViSoft discrepancy recorded.');
