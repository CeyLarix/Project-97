import * as THREE from './assets/three.module.js';
export function addKerPinkArt(scene){
  const group=new THREE.Group();group.name='living-ker-pink-wall-art';group.position.set(.045,1.95,1.38);
  group.userData.reference='Things I Like Things I Love – Handgeschilderd Schilderij Landschap Roze';
  group.userData.dimensions={width:.776,height:1.176,depth:.043};
  const frame=new THREE.Mesh(new THREE.BoxGeometry(.043,1.176,.776),new THREE.MeshStandardMaterial({color:'#684635',roughness:.78}));frame.castShadow=frame.receiveShadow=true;group.add(frame);
  const material=new THREE.MeshStandardMaterial({color:'#d8b3ab',roughness:.94});
  const canvas=new THREE.Mesh(new THREE.PlaneGeometry(.744,1.144),material);canvas.rotation.y=Math.PI/2;canvas.position.x=.022;canvas.receiveShadow=true;group.add(canvas);
  if(typeof Image!=='undefined')new THREE.TextureLoader().load('assets/references/ker-landscape-pink.jpg',texture=>{
    texture.colorSpace=THREE.SRGBColorSpace;
    // Isolate the canvas within the supplier's nearly frontal photograph using UVs.
    texture.offset.set(.232,.167);texture.repeat.set(.534,.656);
    material.map=texture;material.bumpMap=texture;material.bumpScale=.001;material.color.set('#ffffff');material.needsUpdate=true;
  });
  scene.add(group);return group;
}
