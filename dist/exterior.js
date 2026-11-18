import * as THREE from './assets/three.module.js';
import {GLTFLoader} from './assets/addons/loaders/GLTFLoader.js';

// Original public BPD Type-E/97 geometry, in metre-scaled plan coordinates.
// Source versions, option selection and drawing overrides: assets/exterior/source.json.
// The owning houseRoot applies the existing street-side handedness exactly once.
export function createExterior(levels,{loadScene}={}){
 const group=new THREE.Group();group.name='exterior-envelope';group.visible=false;
 let pending=null;group.userData.state='idle';
 group.userData.load=()=>{
  if(pending)return pending;
  group.userData.state='loading';
  pending=Promise.resolve().then(()=>loadScene?loadScene():new GLTFLoader().loadAsync('assets/exterior/woning97.glb')).then(gltf=>{
   const model=gltf.scene;model.name='bpd-type-e-097';
   model.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
    for(const m of Array.isArray(o.material)?o.material:[o.material]){
     m.userData.fixedExterior=true;
     for(const texture of [m.map,m.normalMap,m.roughnessMap])if(texture)texture.anisotropy=4;
     if(m.transparent){m.depthWrite=false;o.castShadow=false;m.roughness=.16;m.envMapIntensity=1.2;}
    }
   });
   group.add(model);group.userData.state='ready';return model;
  }).catch(error=>{group.userData.state='error';pending=null;throw error;});
  return pending;
 };
 return group;
}
