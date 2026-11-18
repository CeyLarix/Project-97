import * as THREE from './assets/three.module.js';
// Sculpted interpretation of Zara Home 6367/047/251, in metres.
export function addLivingFlowerLamp(scene){
  const group=new THREE.Group();group.name='living-zara-flower-pendant';
  group.position.set(2.36,0,2.38);group.userData.reference='Zara Home grote bloemvormige hanglamp 6367/047/251';
  group.userData.shadeDimensions={width:.78,depth:.73};group.userData.shortenedSuspension=true;
  const paper=new THREE.MeshPhysicalMaterial({color:'#efe8da',roughness:.92,side:THREE.DoubleSide,transmission:.08,thickness:.001,emissive:'#fff0d1',emissiveIntensity:.045});
  const gold=new THREE.MeshStandardMaterial({color:'#bc975a',metalness:.72,roughness:.36});
  const white=new THREE.MeshStandardMaterial({color:'#eeeae0',roughness:.8});
  function cylinder(name,r1,r2,h,y,material){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,32),material);mesh.name=name;mesh.position.y=y;mesh.castShadow=true;group.add(mesh);return mesh;}
  cylinder('gold-ceiling-canopy',.052,.052,.025,2.68,gold);
  cylinder('white-adjustable-cable',.003,.003,.348,2.493,white);
  cylinder('gold-upper-socket',.019,.025,.065,2.2875,gold);
  function leaf(name,width,depth,y,phase){
    const positions=[],uvs=[],indices=[],rings=14,segments=192;
    for(let j=0;j<=rings;j++){const t=j/rings;for(let i=0;i<=segments;i++){
      const a=i/segments*Math.PI*2,wave=1+.08*Math.cos(5*a+phase)+.025*Math.sin(3*a-.3);
      const r=.018+t*(.39*wave-.018);
      const lift=-.065*t*t+.026*t*t*Math.sin(5*a+phase)+.0028*t*Math.cos(80*a);
      positions.push(r*Math.cos(a),y+lift,r*Math.sin(a));uvs.push(t,i/segments);
    }}
    for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,a+1,b,b+1);}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeBoundingBox();
    const size=geometry.boundingBox.getSize(new THREE.Vector3()),center=geometry.boundingBox.getCenter(new THREE.Vector3());geometry.translate(-center.x,0,-center.z);geometry.scale(width/size.x,1,depth/size.z);geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,paper);mesh.name=name;mesh.castShadow=false;mesh.receiveShadow=true;group.add(mesh);
  }
  leaf('flower-upper-paper-leaf',.78,.73,2.275,0);
  leaf('flower-lower-paper-leaf',.70,.66,2.220,1.1);
  cylinder('gold-lower-socket',.022,.022,.04,2.202,gold);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.028,20,14),new THREE.MeshStandardMaterial({color:'#fff2d5',emissive:'#ffe2a3',emissiveIntensity:.9}));bulb.name='warm-led-bulb';bulb.position.y=2.155;group.add(bulb);
  const light=new THREE.PointLight('#ffe1b2',5,5,2);light.name='living-flower-pendant-light';light.position.y=2.12;light.userData.livingFlowerPendant=true;group.add(light);
  scene.add(group);return {group,light};
}
