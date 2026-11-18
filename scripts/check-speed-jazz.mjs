import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../dist/assets/three.module.js';
import {createJazzAmbience} from '../dist/ambience.js';
import {planWorldX,planStepX} from '../dist/orientation.js';

// Exercise the actual shared movement function with all three input paths.
const app=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8'),line=name=>app.split('\n').find(s=>s.startsWith('function '+name+'('));
const ctx=vm.createContext({THREE,planWorldX,planStepX,prefs:{moveSpeed:2},camera:new THREE.PerspectiveCamera(),active:0,neighborPortalOpen:false,mode:'walk',changingLevel:false,view:{classList:{contains:()=>false}},$$:()=>[],keys:new Set(),held:new Set(),touchMove:{forward:0,side:0},yaw:0,ghostMode:false,levels:[{origin:{x:0,z:0},rooms:[]}],currentRoom:null,street:{userData:{portalAt:()=>false}},pointInPolygon:()=>false,markRoom(){},openNeighbor100(){this.neighborPortalOpen=true},blocked:(x,z)=>x>.98&&x<1.02});
vm.runInContext(line('localPosition')+'\n'+line('move'),ctx);
for(const speed of [2,3.2,5])for(const input of ['keyboard','buttons','joystick']){
 ctx.prefs.moveSpeed=speed;ctx.camera.position.set(planWorldX(2),1.65,5);ctx.keys.clear();ctx.held.clear();ctx.touchMove={forward:0,side:0};if(input==='keyboard')ctx.keys.add('w');else if(input==='buttons')ctx.held.add('forward');else ctx.touchMove.forward=1;
 for(let i=0;i<20;i++)ctx.move(.04);assert.ok(Math.abs(ctx.camera.position.z-(5-speed*.8))<1e-8,'selected speed applies to '+input);
}
ctx.prefs.moveSpeed=5;ctx.keys.clear();ctx.held.clear();ctx.touchMove={forward:0,side:-1};ctx.camera.position.set(planWorldX(.6),1.65,5);for(let i=0;i<10;i++)ctx.move(.045);assert.ok(ctx.localPosition().x<.98,'running cannot tunnel through a 4 cm wall');
ctx.ghostMode=true;for(let i=0;i<10;i++)ctx.move(.045);assert.ok(ctx.localPosition().x>2,'Ghost mode still passes walls when running');
ctx.camera.position.set(planWorldX(2),1.65,5);ctx.keys.add('w');ctx.keys.add('a');ctx.touchMove={forward:0,side:0};ctx.move(.04);assert.ok(Math.abs(ctx.camera.position.distanceTo(new THREE.Vector3(planWorldX(2),1.65,5))-.2)<1e-8,'diagonal input retains selected speed');

let contexts=0,nodes=0;const oscillators=[],sources=[],timers=new Map(),events=new Map(),states=[];let nextTimer=0;
class Param {constructor(){this.value=0}setValueAtTime(v){this.value=v}linearRampToValueAtTime(v){this.value=v}exponentialRampToValueAtTime(v){this.value=v}cancelScheduledValues(){}}
class Node {constructor(){nodes++;this.gain=new Param();this.frequency=new Param();this.Q=new Param();this.threshold=new Param();this.knee=new Param();this.ratio=new Param();this.attack=new Param();this.release=new Param()}connect(){}disconnect(){}start(time){this.startTime=time;assert.ok(Number.isFinite(time))}stop(){this.stopped=true}}
class Audio {constructor(){contexts++;this.currentTime=0;this.sampleRate=8000;this.state='suspended';this.destination=new Node();Audio.instance=this}createGain(){return new Node()}createDynamicsCompressor(){return new Node()}createOscillator(){const n=new Node();oscillators.push(n);return n}createBufferSource(){const n=new Node();sources.push(n);return n}createBiquadFilter(){return new Node()}createBuffer(channels,length){const data=new Float32Array(length);return{getChannelData:()=>data}}async resume(){this.state='running'}async suspend(){this.state='suspended'}async close(){this.state='closed'}}
const doc={hidden:false,addEventListener:(type,fn)=>events.set(type,fn),removeEventListener:type=>events.delete(type)};
const jazz=createJazzAmbience({AudioContextClass:Audio,documentRef:doc,onState:s=>states.push(s),onError:e=>{throw e},setIntervalFn:fn=>{const id=++nextTimer;timers.set(id,fn);return id},clearIntervalFn:id=>timers.delete(id),wait:()=>Promise.resolve()});
assert.equal(contexts,0,'music defaults off without creating an audio context');assert.equal(jazz.enabled,false);await jazz.setEnabled(true);assert.equal(contexts,1);assert.equal(jazz.playing,true);assert.equal(timers.size,1);assert.ok(oscillators.length>=9&&sources.length>0,'jazz schedules chords, bass and brushes');assert.ok(oscillators.every(o=>o.frequency.value>20&&o.frequency.value<2000));assert.ok(nodes<80,'initial audio scheduling remains bounded');
await jazz.setEnabled(true);assert.equal(timers.size,1,'enabling twice cannot create duplicate schedulers');assert.equal(contexts,1,'reuse the audio context');
Audio.instance.currentTime=20;for(const pump of timers.values())pump();assert.ok(oscillators.length<40,'background stall does not schedule a backlog');
doc.hidden=true;events.get('visibilitychange')();await jazz.setEnabled(true);assert.equal(jazz.enabled,true);assert.equal(jazz.playing,false);assert.equal(timers.size,0);assert.equal(Audio.instance.state,'suspended');
doc.hidden=false;events.get('visibilitychange')();await jazz.setEnabled(true);assert.equal(jazz.playing,true);assert.equal(timers.size,1);await jazz.setEnabled(false);assert.equal(jazz.playing,false);assert.equal(timers.size,0);assert.equal(Audio.instance.state,'suspended');assert.ok(oscillators.every(n=>n.stopped));
await Promise.all([jazz.setEnabled(true),jazz.setEnabled(false),jazz.setEnabled(true)]);assert.equal(jazz.enabled,true);assert.equal(timers.size,1);assert.equal(contexts,1);await jazz.dispose();assert.equal(timers.size,0);assert.equal(Audio.instance.state,'closed');assert.equal(events.size,0);
let errors=0;const unavailable=createJazzAmbience({AudioContextClass:null,documentRef:null,onError:()=>errors++});assert.equal(await unavailable.setEnabled(true),false);assert.equal(unavailable.enabled,false);assert.equal(errors,1,'unsupported browser fails gracefully');await unavailable.dispose();
console.log('Speed/jazz passed: selectable speed across inputs, safe running collision, Ghost/diagonal behavior, opt-in jazz, bounded scheduling, visibility pause/resume, cleanup and unavailable-audio handling.');
