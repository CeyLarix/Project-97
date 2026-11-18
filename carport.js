import * as THREE from './assets/three.module.js';
// Modern flat-roof design proposal within the retained driveway/plot outline.
export const CARPORT97={x1:5.85,x2:10.72,z1:2.36,z2:7.98,roofTop:2.80,clearHeight:2.55,posts:[[5.95,2.58],[10.61,2.58],[5.95,7.76],[10.61,7.76]],postWidth:.15};
export function createCarport(){
 const g=new THREE.Group();g.name='Moderne dubbele carport';g.userData.obstacles=[];g.userData.design=CARPORT97;
 const frame=new THREE.MeshStandardMaterial({color:'#383c38',metalness:.55,roughness:.57}),wood=new THREE.MeshStandardMaterial({color:'#ab8b64',roughness:.83}),roof=new THREE.MeshStandardMaterial({color:'#656960',roughness:.95}),light=new THREE.MeshStandardMaterial({color:'#ffedce',emissive:'#ffd09a',emissiveIntensity:1.1,roughness:.4});
 const box=(w,h,d,x,y,z,m,name)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;g.add(o);return o;};
 const c=CARPORT97,cx=(c.x1+c.x2)/2,cz=(c.z1+c.z2)/2,w=c.x2-c.x1,d=c.z2-c.z1;
 box(w,.08,d,cx,2.75,cz,roof,'carport-flat-roof');
 for(const z of[c.z1+.055,c.z2-.055])box(w,.25,.11,cx,2.675,z,frame,'slim-roof-fascia');
 for(const x of[c.x1+.055,c.x2-.055])box(.11,.25,d,x,2.675,cz,frame,'slim-roof-fascia');
 // Fine timber soffit strips keep the broad ceiling warm and visually light.
 const count=46,slats=new THREE.InstancedMesh(new THREE.BoxGeometry((w-.24)/count-.009,.028,d-.24),wood,count),dummy=new THREE.Object3D();
 for(let i=0;i<count;i++){dummy.position.set(c.x1+.12+(i+.5)*(w-.24)/count,2.613,cz);dummy.updateMatrix();slats.setMatrixAt(i,dummy.matrix);}slats.name='timber-carport-soffit';slats.castShadow=slats.receiveShadow=true;g.add(slats);
 for(const[x,z]of c.posts){box(.15,2.55,.15,x,1.275,z,frame,'carport-post');box(.20,.018,.20,x,.009,z,frame,'carport-post-base');g.userData.obstacles.push({minX:x-.10,maxX:x+.10,minZ:z-.10,maxZ:z+.10,carport:true});}
 for(const x of[6.70,9.85])box(.018,.012,d-.55,x,2.590,cz,light,'carport-warm-led');
 // Recessed rear gutter and drain integrated into the outer rear support.
 box(w-.18,.045,.075,cx,2.72,c.z2-.12,frame,'concealed-carport-gutter');
 const drain=new THREE.Mesh(new THREE.CylinderGeometry(.023,.023,2.48,12),frame);drain.position.set(10.61,1.24,7.82);drain.name='carport-integrated-drain';g.add(drain);
 return g;
}
