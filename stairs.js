import * as THREE from './assets/three.module.js';
// Walking centreline retained; finish/order describes no replacement CAD dimensions.
export const stairPath=Array.from({length:33},(_,i)=>{const t=i/32,a=Math.PI*t;return{x:4.03-.7*Math.cos(a),z:6.05-1.0*Math.sin(a),y:2.92*t};});
export function buildStairs(group,level,m){
 const primer=new THREE.MeshStandardMaterial({color:'#eeeae1',roughness:.92});primer.name='white-stair-primer';primer.userData.orderedStairFinish='grondverf';
 const stair=new THREE.Group();stair.name=level.id==='ground'?'ordered-stair-1-trapkast':'ordered-stair-2-closed-attic';stair.userData={treads:'grondverf',risers:'MDF wit gegrond',closed:true,execution:level.id==='ground'?'Trapkast':'Basis'};group.add(stair);
 const part=(w,h,d,x,y,z,name,angle=0)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),primer);mesh.position.set(x,y,z-level.origin.z);mesh.rotation.y=angle;mesh.name=name;mesh.castShadow=mesh.receiveShadow=true;stair.add(mesh);return mesh;};
 for(let i=0;i<16;i++){
  const a=stairPath[i*2],b=stairPath[i*2+2],dx=b.x-a.x,dz=b.z-a.z,run=Math.hypot(dx,dz),angle=Math.atan2(dx,dz),rise=b.y-a.y;
  part(.72,.045,run+.025,(a.x+b.x)/2,b.y-.0225,(a.z+b.z)/2,'primed-stair-tread',angle);
  part(.72,rise,.018,a.x,(a.y+b.y)/2,a.z,'white-mdf-closed-riser',angle);
  for(const side of[-1,1]){
   const x=(a.x+b.x)/2+side*.34*Math.cos(angle),z=(a.z+b.z)/2-side*.34*Math.sin(angle);
   part(.022,.9,.022,x,b.y+.45,z,'primed-baluster');
   part(.035,.045,run+.04,x,b.y+.91,z,'primed-handrail',angle);
   if(level.id==='ground'&&i>1)part(.018,Math.max(.05,b.y-.06),run+.015,x,(b.y-.06)/2,z,'under-stair-cupboard-side',angle);
  }
 }
 return stair;
}
