import * as THREE from './assets/three.module.js';
export function addLivingPlisses(scene){
  const group=new THREE.Group();group.name='living-veneta-plisses';
  group.userData.reference='Veneta Luxury Linnen One Tone 7051, semi-transparant';
  const cloth=new THREE.MeshStandardMaterial({color:'#bcb5a9',roughness:.98,side:THREE.DoubleSide,transparent:true,opacity:.83,depthWrite:false});
  const rail=new THREE.MeshStandardMaterial({color:'#c7c0b4',roughness:.6});
  function blind(name,width,x,z,rotation){
    const g=new THREE.Group();g.name=name;g.position.set(x,0,z);g.rotation.y=rotation;
    const top=2.50,bottom=.56,rows=156,vertices=[],uv=[],indices=[];
    for(let i=0;i<=rows;i++){const y=top-(top-bottom)*i/rows,depth=i%2?.008:-.008;for(const side of[-1,1]){vertices.push(side*width/2,y,depth);uv.push((side+1)/2,i/rows);}}
    for(let i=0;i<rows;i++){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
    const fabric=new THREE.Mesh(geo,cloth);fabric.name='7051-pleated-fabric';fabric.receiveShadow=true;g.add(fabric);
    for(const y of[top+.015,bottom-.015]){const r=new THREE.Mesh(new THREE.BoxGeometry(width+.012,.03,.03),rail);r.position.y=y;g.add(r);}
    const handle=new THREE.Mesh(new THREE.BoxGeometry(.065,.018,.035),rail);handle.position.set(0,bottom-.037,.02);g.add(handle);group.add(g);
  }
  // Mount in the fixed plan frame, matching both front windows and the side window.
  blind('living-front-plisse-1',1.62,1.375,.035,0);
  blind('living-front-plisse-2',1.62,4.085,.035,0);
  blind('living-side-plisse',.954,5.365,2.947,-Math.PI/2);
  scene.add(group);return group;
}
