import {createJapandiCorner} from './japandi-seating.js';
import * as THREE from './assets/three.module.js';
import { GLTFLoader } from './assets/addons/loaders/GLTFLoader.js';
const loader=new GLTFLoader();
const cache=new Map();
async function get(name){if(!cache.has(name))cache.set(name,loader.loadAsync('assets/models/'+name).then(g=>g.scene));return cache.get(name);}
function prepare(source,width,position,rotation=0){const model=source.clone(true);const b=new THREE.Box3().setFromObject(model),size=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3()),scale=width/size.x;model.scale.setScalar(scale);model.position.set(-center.x*scale,-b.min.y*scale,-center.z*scale);const root=new THREE.Group();root.add(model);root.position.fromArray(position);root.rotation.y=rotation;model.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;const array=Array.isArray(o.material)?o.material:[o.material];const mapped=array.map(original=>{const m=original.clone(),n=(m.name||'').toLowerCase();let role=null;if(/wood|walnut|oak/.test(n))role='wood';else if(/textile|linen|flax|pillow|upholstery|bedding|woven/.test(n))role=/sage|teal|blue/.test(n)?'secondaryFabric':'fabric';else if(/metal|bronze|steel|legs/.test(n))role='metal';if(role)m.userData.role=role;if(role==='fabric'||role==='secondaryFabric'){m.roughness=.94;if(m.isMeshPhysicalMaterial){m.sheen=.35;m.sheenRoughness=.9;}}m.userData.modelMaterial=true;return m;});o.material=Array.isArray(o.material)?mapped:mapped[0];});return root;}
export async function loadSeating(group,onProgress=()=>{}){
 const seating=new THREE.Group();seating.name='living-seating';seating.position.x=5.4;seating.scale.x=-1;group.add(seating);
 const corner=createJapandiCorner(seating);onProgress(1,1);return {corner};
}
export function updateModels(models,style){for(const root of Object.values(models))root.visible=true;}
export async function loadMasterBed(group){const source=await get('oak-bed.glb');return prepare(source,1.72,[1.45,0,8.6],Math.PI);}

export async function loadSourceBathroom(){const gltf=await loader.loadAsync('assets/badkamer/visoft-097.glb');const root=new THREE.Group();root.name='visoft-source-bathroom';root.position.set(2.3,0,9.9);root.scale.z=-1;gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=!(Array.isArray(o.material)?o.material.some(m=>m.transparent):o.material.transparent);o.receiveShadow=true;}});root.add(gltf.scene);return root;}
