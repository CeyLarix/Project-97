import * as THREE from './assets/three.module.js';
// Workroom within the existing annex; the TV surface retains its player attachment.
export function furnishMancave(parent,materials={}){
 const group=new THREE.Group();group.name='annex-workroom';group.userData.room='office';parent.add(group);
 const obstacles=[],lights=[];
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.8,...extra});
 const wood=materials.wood?.clone()||mat('#b59c78');delete wood.userData.role;
 const sand=mat('#d4ccbd'),black=mat('#26292b'),fabric=mat('#696b67'),metal=mat('#8b8f8c',{metalness:.55,roughness:.4});
 function box(w,h,d,x,y,z,m=sand,name=''){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;group.add(o);return o;}
 function cyl(r,h,x,y,z,m=black){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;group.add(o);return o;}
 function obstacle(name,x,z,w,d){obstacles.push({name,mancave:true,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});}
 // A 180 cm desk on the solid north wall, with a separate screen and keyboard.
 box(1.8,.045,.68,7.5,.75,10.46,wood,'workroom-desk');
 for(const x of[6.72,8.28])for(const z of[10.22,10.69])box(.045,.727,.045,x,.3635,z,black);
 box(.40,.60,.54,8.12,.43,10.46,sand,'workroom-desk-drawers');
 for(const y of[.25,.45,.65])box(.28,.014,.012,8.12,y,10.736,metal);
 obstacle('workroom-desk',7.5,10.46,1.8,.68);
 box(.20,.014,.15,7.35,.784,10.39,black);box(.04,.16,.04,7.35,.86,10.34,black);
 box(.66,.39,.034,7.35,1.13,10.34,black,'workroom-monitor');
 box(.625,.35,.004,7.35,1.13,10.36,mat('#35555c',{emissive:'#203c44',emissiveIntensity:.2}));
 box(.43,.018,.15,7.35,.784,10.66,black,'workroom-keyboard');
 for(let row=0;row<4;row++)for(let key=0;key<12;key++)box(.025,.002,.021,7.166+key*.033,.794,10.61+row*.031,mat('#8d9391'));
 box(.052,.022,.08,7.68,.789,10.65,black,'workroom-mouse');
 box(.24,.016,.30,6.84,.781,10.53,mat('#eee8da'),'workroom-notebook');
 // Task chair faces the desk and leaves a clear route around its left side.
 box(.52,.09,.49,7.45,.48,11.30,fabric,'workroom-task-chair');
 box(.50,.49,.055,7.45,.77,11.53,fabric);
 for(const x of[7.17,7.73]){box(.035,.22,.035,x,.58,11.30,black);box(.055,.03,.35,x,.69,11.30,black);}
 cyl(.035,.35,7.45,.265,11.30,metal);
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const arm=box(.035,.025,.33,7.45+Math.sin(a)*.14,.07,11.30+Math.cos(a)*.14,black);arm.rotation.y=a;cyl(.035,.04,7.45+Math.sin(a)*.28,.04,11.30+Math.cos(a)*.28,black).rotation.z=Math.PI/2;}
 obstacle('workroom-chair',7.45,11.30,.72,.75);
 // Keep the existing TV location, with a proper low media cabinet below it.
 const tv=new THREE.Group();tv.name='mancave-tv';tv.position.set(5.94,1.48,11.43);tv.rotation.y=Math.PI/2;group.add(tv);
 const tvPart=(w,h,d,x,y,z,m,name)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;tv.add(o);return o;};
 tvPart(1.19,.70,.045,0,0,0,black,'workroom-wall-tv');
 tvPart(1.14,.65,.006,0,.003,.026,mat('#152427',{emissive:'#204442',emissiveIntensity:.15}),'mancave-tv-screen');
 box(.38,.44,1.48,6.04,.32,11.43,wood,'workroom-tv-cabinet');
 for(const z of[10.94,11.43,11.92]){box(.015,.39,.46,6.239,.32,z,sand);box(.008,.015,.13,6.249,.46,z,black);}
 for(const x of[5.92,6.15])for(const z of[10.83,12.03])box(.035,.10,.035,x,.05,z,black);
 obstacle('workroom-tv-cabinet',6.04,11.43,.42,1.52);
 // Low storage against the east wall; garden glass and the kitchen door stay clear.
 box(.40,1.13,1.12,8.59,.605,12.57,sand,'workroom-storage');
 for(const z of[12.30,12.84])box(.015,1.04,.52,8.382,.605,z,wood);
 for(const z of[12.48,12.66])box(.018,.13,.015,8.37,.73,z,black);
 obstacle('workroom-storage',8.59,12.57,.43,1.15);
 box(.29,.02,1.22,8.62,1.18,12.57,wood);
 // One small club emblem keeps a personal accent without the previous lounge setup.
 const crestMaterial=mat('#ffffff',{transparent:true,side:THREE.DoubleSide});
 if(typeof Image!=='undefined')new THREE.TextureLoader().load('assets/references/besiktas-logo.svg',t=>{t.colorSpace=THREE.SRGBColorSpace;crestMaterial.map=t;crestMaterial.needsUpdate=true;});
 const crest=new THREE.Mesh(new THREE.PlaneGeometry(.18,.30),crestMaterial);crest.position.set(8.27,1.53,10.064);crest.scale.x=-1;crest.name='workroom-besiktas-crest';group.add(crest);
 return {group,obstacles,lights};
}
