import * as THREE from './assets/three.module.js';
export function addYoriRug(scene){
  // Selected Volero variant 65407659245917: 200 × 290 cm, 15 mm pile.
  const group=new THREE.Group();group.name='living-volero-yori-rug';group.position.set(2.10,0,2.35);
  group.userData.reference='Volero Yori Abstract Lines Crème';group.userData.dimensions={width:2,length:2.9,pile:.015};
  const edge=new THREE.Mesh(new THREE.BoxGeometry(2,.014,2.9),new THREE.MeshStandardMaterial({color:'#e0d7c6',roughness:1}));edge.position.y=.008;edge.receiveShadow=true;group.add(edge);
  const material=new THREE.MeshStandardMaterial({color:'#f4ede0',roughness:1});
  const top=new THREE.Mesh(new THREE.PlaneGeometry(2,2.9),material);top.rotation.x=-Math.PI/2;top.position.y=.0155;top.receiveShadow=true;group.add(top);
  if(typeof Image!=='undefined')new THREE.TextureLoader().load('assets/references/volero-yori-abstract-lines-creme.jpg',texture=>{
    texture.colorSpace=THREE.SRGBColorSpace;
    // Use only the rug in the supplier's overhead photograph, excluding its white surround.
    texture.offset.set(.186,.066);texture.repeat.set(.624,.866);
    material.map=texture;material.bumpMap=texture;material.bumpScale=.006;material.color.set('#ffffff');material.needsUpdate=true;
  });
  scene.add(group);return group;
}
