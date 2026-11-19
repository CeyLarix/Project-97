import * as THREE from './assets/three.module.js';
export function addGardenShed(parent){
 const group=new THREE.Group();group.name='japandi-rear-left-garden-shed';group.userData={dimensions:{width:2.70,depth:2.50,height:2.55},type:'tuinberging, ontwerpvoorstel',fridgeNote:'Plaatsingsvoorstel; koelkastmodel afstemmen op de temperatuur in de berging.'};parent.add(group);const obstacles=[];
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.85,...extra});
 const cedar=mat('#9c7c58'),dark=mat('#383b36'),lining=mat('#c8baa4'),metal=mat('#a6aba5',{metalness:.6,roughness:.4}),white=mat('#ecece3'),green=mat('#596b49');
 const box=(w,h,d,x,y,z,m=cedar,name='',p=group)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;p.add(o);return o;};
 const cyl=(r,h,x,y,z,m=metal,p=group)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o;};
 const block=(name,x,z,w,d)=>obstacles.push({name,garden:true,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
 box(2.70,.06,2.50,1.60,-.03,19.85,lining,'shed-floor');
 for(const x of[.30,2.90]){box(.10,2.40,2.50,x,1.23,19.85,cedar,'shed-side-wall');block('shed-side-wall',x,19.85,.10,2.50);}
 box(2.70,2.40,.10,1.60,1.23,21.05,cedar,'shed-rear-wall');block('shed-rear-wall',1.60,21.05,2.70,.10);
 // 95cm doorway in the garden-facing wall, with the hinged door parked open.
 box(.75,2.40,.10,.625,1.23,18.65,cedar,'shed-front-left');block('shed-front-left',.625,18.65,.75,.10);
 box(1.0,2.40,.10,2.45,1.23,18.65,cedar,'shed-front-right');block('shed-front-right',2.45,18.65,1.0,.10);
 box(.95,.25,.10,1.475,2.305,18.65,cedar,'shed-door-header');
 for(const x of[1.0,1.95])box(.045,2.16,.14,x,1.11,18.64,dark,'shed-door-frame');
 const door=new THREE.Group();door.name='shed-open-door';door.position.set(1.0,.03,18.58);door.rotation.y=Math.PI/2;group.add(door);
 box(.94,2.12,.045,.47,1.06,0,dark,'shed-door-leaf',door);
 for(let i=0;i<9;i++)box(.08,2.06,.016,.05+i*.103,1.06,-.031,cedar,'shed-door-slat',door);
 box(.016,.16,.025,.82,1.0,-.042,metal,'shed-door-handle',door);block('shed-open-door',1,18.11,.08,.96);
 // Vertical battens, dark roof fascia and a small high ventilation grille.
 for(let x=.35;x<2.9;x+=.12){box(.016,2.32,.014,x,1.22,21.107,dark,'shed-rear-batten');if(x<.99||x>1.96)box(.016,2.32,.014,x,1.22,18.593,dark,'shed-front-batten');}
 for(let z=18.72;z<21;z+=.12)for(const x of[.243,2.957])box(.014,2.32,.016,x,1.22,z,dark,'shed-side-batten');
 box(2.84,.10,2.64,1.60,2.50,19.85,dark,'shed-flat-roof');
 box(.58,.17,.02,2.45,2.12,18.585,dark,'shed-ventilation-grille');for(let i=0;i<5;i++)box(.54,.012,.025,2.45,2.06+i*.028,18.569,metal,'shed-vent-slat');
 // Left-hand open storage and crates for garden supplies.
 for(const y of[.35,.92,1.49])box(.46,.035,1.18,.62,y,20.14,lining,'shed-storage-shelf');
 for(const x of[.42,.82])for(const z of[19.61,20.67])box(.035,1.66,.035,x,.86,z,dark,'shed-shelving-post');block('shed-shelving',.62,20.14,.48,1.20);
 for(const z of[19.85,20.35]){box(.34,.25,.40,.62,.49,z,dark,'garden-supply-crate');box(.18,.035,.014,.62,.52,z-.207,lining,'crate-handle');}
 // American-style side-by-side fridge/freezer, on a realistic 90 × 75 × 180 cm envelope.
 const fridge=new THREE.Group();fridge.name='shed-garden-fridge';fridge.userData.dimensions={width:.90,depth:.75,height:1.80};fridge.userData.type='Amerikaanse side-by-side koel-vriescombinatie';fridge.userData.specification='Maatvoorstel; concreet model afstemmen op de temperatuur in de berging';group.add(fridge);
 const steel=mat('#aaaead',{metalness:.55,roughness:.38});
 box(.90,1.78,.69,2.30,.91,20.55,steel,'shed-fridge-body',fridge);
 box(.38,1.74,.03,2.05,.90,20.185,steel,'american-freezer-door',fridge);
 box(.49,1.74,.03,2.505,.90,20.185,steel,'american-fridge-door',fridge);
 box(.012,1.74,.008,2.25,.90,20.166,dark,'american-door-centre-seal',fridge);
 for(const x of[2.20,2.30])box(.018,.65,.025,x,.98,20.1575,metal,'american-fridge-handle',fridge);
 box(.15,.235,.014,2.05,1.09,20.160,dark,'american-water-ice-dispenser',fridge);
 box(.10,.014,.015,2.05,.977,20.158,metal,'dispenser-drip-tray',fridge);
 box(.085,.030,.004,2.05,1.30,20.166,mat('#9db9be',{emissive:'#718f95',emissiveIntensity:.25}),'american-fridge-display',fridge);
 for(const x of[1.95,2.65])for(const z of[20.30,20.78])box(.035,.02,.035,x,.01,z,dark,'shed-fridge-foot',fridge);
 block('shed-fridge',2.30,20.52,.90,.75);
 // Distinct hanging spade, rake, broom and a coiled hose.
 for(const [i,x]of[1.05,1.40,1.78].entries()){
  cyl(.015,1.15,x,1.08,20.96,cedar);
  if(i===0){box(.19,.27,.018,x,.39,20.96,metal,'garden-spade-blade');const grip=new THREE.Mesh(new THREE.TorusGeometry(.065,.012,8,24),dark);grip.position.set(x,1.68,20.96);group.add(grip);}
  else if(i===1){box(.32,.035,.03,x,.49,20.96,metal,'garden-rake-head');for(let j=0;j<7;j++)box(.012,.12,.012,x-.135+j*.045,.425,20.96,metal,'garden-rake-tooth');}
  else{box(.25,.11,.08,x,.45,20.96,dark,'garden-broom-head');for(let j=0;j<9;j++)box(.012,.12,.075,x-.11+j*.027,.34,20.96,cedar,'garden-broom-bristles');}
 }
 for(let i=0;i<4;i++){const hose=new THREE.Mesh(new THREE.TorusGeometry(.16-i*.018,.012,8,40),green);hose.position.set(2.30,1.98,20.975);group.add(hose);}
 return {group,obstacles};
}
