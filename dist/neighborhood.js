import * as THREE from './assets/three.module.js';
import {GLTFLoader} from './assets/addons/loaders/GLTFLoader.js';
import {HOUSES} from './neighborhood-data.js';
export {HOUSES};
const entrance100=HOUSES.find(h=>h.number===100).entry;
// Original upload declares metres/Y-up/+Z-forward. Keep its 1:1 human scale.
export const PERSON100={file:'assets/person100/persoon_met_pakket.glb',x:entrance100.x+entrance100.outward*1.6,z:entrance100.z-1.15,groundY:.008,rotationY:Math.PI,bodyRadius:.36};
const textures=new Map();
const paths={beige:'assets/exterior/baksteen.jpg','beige-vertical':'assets/exterior/rollaag.jpg',roof:'assets/exterior/dakpannen.jpg','flat-roof':'assets/exterior/plat-dak.jpg'};
function distanceToSegment(x,z,s){const [ax,az,bx,bz]=s,dx=bx-ax,dz=bz-az,l=dx*dx+dz*dz,t=l?THREE.MathUtils.clamp(((x-ax)*dx+(z-az)*dz)/l,0,1):0;return Math.hypot(x-ax-t*dx,z-az-t*dz);}
export function createNeighborhood({loadModel,loadTexture,loadPersonModel}={}){
 const group=new THREE.Group();group.name='Het Lint · bouwnummers 96 98 99 100';
 const states=new Map(HOUSES.map(h=>[h.number,{state:'idle',model:null,promise:null}]));
 const collisionGrids=new Map(HOUSES.map(h=>{const grid=new Map();for(const seg of h.segments){const [ax,az,bx,bz]=seg;for(let ix=Math.floor((Math.min(ax,bx)-.2)/.75);ix<=Math.floor((Math.max(ax,bx)+.2)/.75);ix++)for(let iz=Math.floor((Math.min(az,bz)-.2)/.75);iz<=Math.floor((Math.max(az,bz)+.2)/.75);iz++){const key=ix+','+iz;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(seg);}}return[h.number,grid];}));
 const loader=new GLTFLoader();
 const person={state:'idle',model:null,promise:null,parcelBounds:null};
 function loadPerson(){
  if(person.promise)return person.promise;person.state='loading';
  person.promise=Promise.resolve().then(()=>loadPersonModel?loadPersonModel(PERSON100):loader.loadAsync(PERSON100.file)).then(g=>{
   const model=g.scene,bounds=new THREE.Box3().setFromObject(model);
   if(bounds.isEmpty()||!Number.isFinite(bounds.max.y-bounds.min.y))throw Error('Persoonsmodel bevat geen bruikbare geometrie');
   const root=new THREE.Group();root.name='Persoon met pakket · ingang 100';root.position.set(PERSON100.x,0,PERSON100.z);root.rotation.y=PERSON100.rotationY;
   // houseRoot reflects X for the BPD street. Counter it only for this imported
   // person, so the photographed face and printed parcel keep their handedness.
   model.scale.x*=-1;model.position.y+=PERSON100.groundY-bounds.min.y;root.add(model);
   root.userData={sourceFile:PERSON100.file,scaleMetres:1,sourceHeight:bounds.max.y-bounds.min.y};
   model.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material])m.userData.fixedPerson100=true;}});
   group.add(root);group.updateMatrixWorld(true);
   const parcel=model.getObjectByName('delivery_parcel_3d');
   if(parcel)person.parcelBounds=new THREE.Box3().setFromObject(parcel).applyMatrix4(group.matrixWorld.clone().invert());
   person.model=root;person.state='ready';return root;
  }).catch(e=>{person.state='error';person.promise=null;throw e;});return person.promise;
 }

 function load(number){const h=HOUSES.find(h=>h.number===number),s=states.get(number);if(!h)return Promise.reject(Error('Onbekend bouwnummer'));if(s.promise)return s.promise;s.state='loading';
  s.promise=Promise.resolve().then(()=>loadModel?loadModel(h):loader.loadAsync(h.file)).then(g=>{
   s.model=g.scene;s.model.name='Bouwnummer '+number;s.model.traverse(o=>{if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;
    for(const m of Array.isArray(o.material)?o.material:[o.material]){m.userData.fixedNeighborhood=true;const cat=m.userData.category;if(cat){const path=paths[cat]||'assets/neighborhood/'+cat+'.jpg';if(!textures.has(cat)){const tex=loadTexture?loadTexture(path):new THREE.TextureLoader().load(path);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=4;textures.set(cat,tex);}m.map=textures.get(cat);m.needsUpdate=true;}if(m.transparent){m.depthWrite=false;o.castShadow=false;}}
   });group.add(s.model);s.state='ready';return s.model;
  }).catch(e=>{s.state='error';s.promise=null;throw e;});return s.promise;
 }
 let loadAllPromise=null;
 function loadAll(){if(!loadAllPromise)loadAllPromise=(async()=>{for(const h of HOUSES)await load(h.number);await loadPerson();})().catch(e=>{loadAllPromise=null;throw e;});return loadAllPromise;}
 function blocked(x,z,r=.17){
  if(person.state==='ready'){
   const fallen=person.fallenBounds;if(fallen&&x+r>fallen.minX&&x-r<fallen.maxX&&z+r>fallen.minZ&&z-r<fallen.maxZ)return true;
   const travel=person.travelPosition,px=travel?.x??PERSON100.x,pz=travel?.z??PERSON100.z;if(Math.hypot(x-px,z-pz)<(travel ? .55 : PERSON100.bodyRadius)+r)return true;
   if((group.userData.escortObstacles||[]).some(o=>Math.hypot(x-o.x,z-o.z)<o.radius+r))return true;
   const b=person.travelPosition?null:person.parcelBounds;if(b&&x+r>b.min.x-.12&&x-r<b.max.x+.12&&z+r>b.min.z-.12&&z-r<b.max.z+.12)return true;
  }
  for(const h of HOUSES){const b=h.bounds;if(x<b.minX-r||x>b.maxX+r||z<b.minZ-r||z>b.maxZ+r)continue;const s=states.get(h.number);if(s.state!=='ready')return true;if((collisionGrids.get(h.number).get(Math.floor(x/.75)+','+Math.floor(z/.75))||[]).some(seg=>distanceToSegment(x,z,seg)<r))return true;}return false;}
 function walkable(x,z){return x>-12&&x<49&&z>-11.2&&z<14.15&&(z<-.16||x<-.22||x>11.05);}
 function portalAt(x,z){const h=HOUSES.find(h=>h.number===100),e=h.entry,along=e.axis==='x'?x-e.x:z-e.z,side=e.axis==='x'?z-e.z:x-e.x;return along*e.outward<-.12&&along*e.outward>-.9&&Math.abs(side)<.45;}
 group.userData={load,loadAll,loadPerson,blocked,walkable,portalAt,states,person};
 // Quiet front aprons and real entrance paths. Building placement is from BPD;
 // garden/parking surfaces of other owners are an indicative street treatment.
 const paving=new THREE.MeshStandardMaterial({color:'#b5b1a4',roughness:.94}),edge=new THREE.MeshStandardMaterial({color:'#878976',roughness:1});
 const box=(w,h,d,x,y,z,mat)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);o.receiveShadow=true;group.add(o);return o;};
 for(const h of HOUSES){const b=h.bounds,apron={96:[-10.8,-.24],98:[11.08,21.5402],99:[21.5402,32],100:[32,47]}[h.number];box(apron[1]-apron[0],.025,3.5,(apron[0]+apron[1])/2,-.04,-1.85,edge);const e=h.entry;
  if(e.axis==='x'){const x=h.approach[0];box(1.3,.04,e.z+3.65,x,-.012,(e.z-3.65)/2,paving);box(Math.abs(e.x-x)+.2,.04,1.3,(e.x+x)/2,-.01,e.z,paving);}
  else box(1.3,.04,e.z+3.65,e.x,-.012,(e.z-3.65)/2,paving);
  const c=document.createElement('canvas');c.width=256;c.height=128;const a=c.getContext('2d');a.fillStyle='#3c4636';a.fillRect(0,0,256,128);a.fillStyle='#faf8ef';a.font='600 76px sans-serif';a.textAlign='center';a.textBaseline='middle';a.fillText(String(h.number),128,66);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const plate=new THREE.Mesh(new THREE.PlaneGeometry(.72,.36),new THREE.MeshStandardMaterial({map,roughness:.9,side:THREE.DoubleSide}));plate.position.set(h.approach[0]+.72,1.15,Math.min(h.approach[2],-.48));plate.rotation.y=Math.PI;plate.scale.x=-1;group.add(plate);box(.045,1.32,.045,plate.position.x,.66,plate.position.z,edge);
 }
 return group;
}
