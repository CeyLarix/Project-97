import assert from 'node:assert/strict';
import * as T from '../dist/assets/three.module.js';
import {furnish}from '../dist/furniture.js';
import {buildShell}from '../dist/architecture.js';
import {levels}from '../dist/plans.js';
globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>{},set:()=>true})})};
const base=new T.MeshStandardMaterial(),m=Object.fromEntries(['wood','wall','wallAccent','ceiling','trim','metal','stone','glass','ceramic'].map(k=>[k,base.clone()]));const shell=buildShell(levels[0],m,base),f=furnish(shell.group,m);shell.group.updateMatrixWorld(true);
const shelf=shell.group.getObjectByName('dark-open-passage-shelf'),b=new T.Box3().setFromObject(shelf);assert.ok(b.min.z>=4.55&&b.max.z<6.07,'shelf before hall doorway');assert.ok(b.min.x>=.015&&b.max.x<.37);assert.ok(Math.abs(b.max.y-2.05)<.01);assert.ok(2.63-b.max.x>2.2,'more than 2.2m passage remains');
const chaise=shell.group.getObjectByName('living-corner-chaise'),c=new T.Box3().setFromObject(chaise);assert.ok(c.min.z>3.2&&c.max.z<4.5&&c.min.x>2.3&&c.max.x<4.1,'L extension stays inside room');
const obstacles=[...shell.obstacles,...f.obstacles],radius=.17,blocked=(x,z)=>obstacles.some(b=>x+radius>b.minX&&x-radius<b.maxX&&z+radius>b.minZ&&z-radius<b.maxZ);
const step=.05,width=109,depth=270,start=levels[0].rooms.find(r=>r.id==='living').spawn,queue=[[Math.round(start[0]/step),Math.round(start[2]/step)]],seen=new Set([queue[0].join(',')]);for(let i=0;i<queue.length;i++){const[x,z]=queue[i];for(const[xx,zz]of[[x+1,z],[x-1,z],[x,z+1],[x,z-1]]){const key=xx+','+zz,px=xx*step,pz=zz*step;if(xx<4||xx>104||zz<4||zz>266||seen.has(key)||blocked(px,pz))continue;seen.add(key);queue.push([xx,zz]);}}
for(const id of['hall','dining','kitchen']){const r=levels[0].rooms.find(r=>r.id===id);assert.ok(seen.has(Math.round(r.spawn[0]/step)+','+Math.round(r.spawn[2]/step)),id+' remains reachable from living room');}
console.log('Corner sofa + reference shelf passed: room fit, shelf outside doorway, >2.2m passage, actual chaise footprint and walking routes to hall, kitchen and dining.');
