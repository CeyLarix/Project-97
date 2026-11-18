import * as THREE from './assets/three.module.js';
import {PLOT97} from './plot97.js';
export function createJapandiGarden(){
 const group=new THREE.Group();group.name='Japandi achtertuin';const obstacles=[];
 const mat=(color,roughness=.85,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
 const oak=mat('#aa8964'),dark=mat('#4c4940'),fabric=mat('#ded6c6',.98),cushion=mat('#b9b09d',.98),stone=mat('#c8c0b2'),grout=mat('#9e9687');
 const box=(w,h,d,x,y,z,m,name='')=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.name=name;group.add(o);return o;};
 const block=(x,z,w,d)=>obstacles.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,garden:true});
 const soft=(w,h,d,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(1,24,14),m);o.scale.set(w/2,h/2,d/2);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;group.add(o);return o;};
 const cyl=(r,h,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;group.add(o);return o;};
 const a=PLOT97.minX,b=PLOT97.maxX,c=13.7,d=PLOT97.rearZ;
 box(b-a,.045,d-c,(a+b)/2,-.05,(c+d)/2,grout,'fully-paved-garden-base');
 const tiles=[];for(let x=a;x<b;x+=.8)for(let z=c;z<d;z+=.8)tiles.push({x,z,w:Math.min(.8,b-x),depth:Math.min(.8,d-z)});
 // Shared unit slab geometry, trimmed at the unchanged plot boundaries.
 const paving=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.035,1),stone,tiles.length),dummy=new THREE.Object3D();
 tiles.forEach((t,i)=>{dummy.position.set(t.x+t.w/2,-.02,t.z+t.depth/2);dummy.scale.set(t.w-.005,1,t.depth-.005);dummy.updateMatrix();paving.setMatrixAt(i,dummy.matrix);const shade=.96+(i%7)*.009;paving.setColorAt(i,new THREE.Color(shade,shade,shade));});paving.receiveShadow=true;paving.name='large-format-sand-tiles';group.add(paving);
 // Horizontal warm timber privacy screens; no planting or trees.
 for(let y=.13;y<1.82;y+=.12){box(b-a,.105,.035,(a+b)/2,y,d-.025,oak);for(const x of[a+.025,b-.025])box(.035,.105,d-c,x,y,(c+d)/2,oak);}
 for(const x of[a+.055,b-.055])for(let z=c+.1;z<d;z+=1.8)box(.07,1.85,.07,x,.925,z,dark);
 // Attached veranda with a light-filtering roof and warm timber rafters.
 const roof=mat('#e3ddd0',.35,{transparent:true,opacity:.64,side:THREE.DoubleSide,depthWrite:false});
 box(10.5,.035,3.05,5.5,2.81,19.6,roof,'veranda-roof');
 for(const z of[18.1,21.1])box(10.5,.18,.14,5.5,2.70,z,oak,'veranda-beam');
 for(let x=.4;x<10.7;x+=.64)box(.07,.12,3.05,x,2.71,19.6,oak,'veranda-rafter');
 for(const x of[.42,5.50,10.58])for(const z of[18.25,20.95]){box(.13,2.65,.13,x,1.325,z,oak,'veranda-post');block(x,z,.15,.15);}
 const glow=mat('#ffe7be',.5,{emissive:'#ffce8e',emissiveIntensity:.8});box(10.1,.014,.025,5.5,2.59,21.06,glow,'veranda-warm-led');
 // Low teak lounge with generous woven cushions, facing into the garden.
 const sx=2.0,sz=15.3;
 box(2.75,.15,.9,sx,.29,sz,oak,'garden-lounge-sofa');box(2.75,.47,.10,sx,.62,sz-.40,oak);
 for(const x of[sx-1.30,sx+1.30])box(.10,.44,.9,x,.48,sz,oak);
 for(let i=0;i<3;i++){soft(.84,.23,.78,sx-.88+i*.88,.47,sz+.02,fabric);soft(.79,.42,.17,sx-.88+i*.88,.73,sz-.29,fabric);}
 soft(.45,.36,.19,sx-.96,.71,sz-.12,cushion);soft(.38,.34,.18,sx+.98,.71,sz-.12,cushion);block(sx,sz,2.8,1.0);
 cyl(.57,.07,2.0,.43,16.56,stone);cyl(.22,.37,2.0,.21,16.56,oak);block(2,16.56,1.16,1.16);
 // Outdoor dining set; the middle garden passage stays open.
 box(1.85,.065,.9,8.20,.77,19.65,oak,'garden-dining-table');for(const x of[7.43,8.97])for(const z of[19.33,19.97])box(.055,.72,.055,x,.38,z,dark);block(8.20,19.65,1.9,.95);
 for(const[x,z,angle]of[[7.7,18.86,0],[8.7,18.86,0],[7.7,20.44,Math.PI],[8.7,20.44,Math.PI]]){const chair=new THREE.Group();chair.position.set(x,0,z);chair.rotation.y=angle;group.add(chair);const part=(w,h,d,xx,y,zz,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(xx,y,zz);o.castShadow=true;chair.add(o);};part(.5,.09,.5,0,.45,0,fabric);part(.5,.42,.055,0,.69,-.24,oak);for(const xx of[-.19,.19])for(const zz of[-.19,.19])part(.035,.43,.035,xx,.22,zz,oak);block(x,z,.54,.56);}
 for(const[x,z]of[[4.8,20.6],[10.45,17.9]]){box(.16,.36,.16,x,.18,z,dark,'garden-lantern');box(.11,.23,.11,x,.22,z,glow);}
 // Covered outdoor kitchen in the rear-left corner of the retained garden.
 const kitchenDark=mat('#40443e',.65,{metalness:.35}),metal=mat('#a2aaa5',.3,{metalness:.8}),worktop=mat('#d5cdbf',.6);
 box(3.10,.80,.64,2.2,.43,20.60,kitchenDark,'outdoor-kitchen-base');block(2.2,20.60,3.14,.68);
 box(3.20,.065,.72,2.2,.865,20.60,worktop,'outdoor-kitchen-worktop');
 for(const x of[.94,1.56,2.18,2.80,3.42]){box(.59,.69,.025,x,.46,20.265,oak,'outdoor-kitchen-door');box(.24,.015,.03,x,.70,20.24,dark);}
 // Integrated gas grill and rounded lid, with preparation surface on either side.
 box(.84,.07,.53,2.30,.94,20.60,metal,'outdoor-barbecue');
 soft(.82,.38,.54,2.30,1.10,20.66,kitchenDark).name='barbecue-lid';
 box(.59,.025,.025,2.30,1.07,20.36,metal,'barbecue-handle');
 for(const x of[2.02,2.21,2.40,2.59]){const knob=cyl(.025,.018,x,.97,20.315,metal);knob.rotation.x=Math.PI/2;}
 box(.47,.012,.39,1.12,.906,20.58,metal,'outdoor-sink-rim');box(.39,.016,.31,1.12,.915,20.58,kitchenDark,'outdoor-sink-bowl');
 const tapCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(1.12,.91,20.84),new THREE.Vector3(1.12,1.23,20.84),new THREE.Vector3(1.12,1.27,20.66),new THREE.Vector3(1.12,1.16,20.58)]);
 const tap=new THREE.Mesh(new THREE.TubeGeometry(tapCurve,24,.011,8,false),metal);tap.name='outdoor-kitchen-tap';group.add(tap);
 box(.52,.67,.032,3.35,.45,20.235,kitchenDark,'outdoor-kitchen-fridge');box(.022,.38,.025,3.54,.50,20.20,metal,'outdoor-fridge-handle');
 box(2.95,.012,.025,2.2,2.61,20.94,glow,'outdoor-kitchen-warm-led');
 group.userData={obstacles,style:'Japandi',fullyPaved:true,planting:false};return group;
}
