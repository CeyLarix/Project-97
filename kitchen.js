import * as THREE from './assets/three.module.js';

// Fixed kitchen specification transcribed from the four supplied references.
// Local ground-floor metres: the cabinetry faces -X, garden is toward +Z.
// houseRoot reflects X. Restore the reference handedness within each fixed
// footprint along Z: viewed from the island, ovens and wine fridge belong left.
export function furnishKitchen(group, materials={}) {
 const obstacles=[],lights=[],features={};
 const kitchenGroup=new THREE.Group();kitchenGroup.name='reference-kitchen';kitchenGroup.userData.feature='reference-kitchen';group.add(kitchenGroup);group=kitchenGroup;
 const cabinetryGroup=new THREE.Group(),islandGroup=new THREE.Group();
 cabinetryGroup.name='reference-cabinetry';islandGroup.name='reference-island';
 kitchenGroup.add(cabinetryGroup,islandGroup);group=cabinetryGroup;
 const material=(role,color,roughness=.65,extra={})=>{
  if(materials[role])return materials[role];
  const m=new THREE.MeshStandardMaterial({color,roughness,...extra});m.name=role;m.userData.kitchenRole=role;m.userData.fixedKitchen=true;return m;
 };
 const front=material('kitchenFront','#e5dfd0',.78);
 const walnut=material('kitchenWalnut','#66503f',.65);
 const stone=material('kitchenStone','#d5c0ac',.49);
 const bronze=material('kitchenMetal','#9d8970',.36,{metalness:.78});
 const black=material('kitchenAppliance','#151919',.24,{metalness:.22});
 const steel=material('kitchenSteel','#8a8780',.32,{metalness:.85});
 const ovenGlass=material('kitchenOvenGlass','#142020',.12,{metalness:.5});
 const bottleGreen=material('kitchenBottle','#283c2c',.23,{metalness:.1});
 const bottleBrown=material('kitchenBottleBrown','#4b3125',.25);
 const label=material('kitchenLabel','#c2ad81',.8);
 const porcelain=material('kitchenCeramic','#e3d7c5',.46);
 const glass=materials.kitchenGlass||new THREE.MeshPhysicalMaterial({color:'#adc4bb',roughness:.08,metalness:.07,transparent:true,opacity:.20,depthWrite:false});
 glass.name='kitchenGlass';delete glass.userData.role;glass.userData.kitchenRole='kitchenGlass';glass.userData.fixedKitchen=true;
 const amber=new THREE.MeshStandardMaterial({color:'#ffcb72',emissive:'#ffae47',emissiveIntensity:3,roughness:.4});amber.userData.kitchenRole='kitchenLED';amber.userData.fixedKitchen=true;
 const cache=new Map();
 function roundGeo(w,h,d,r=.009){
  const key=[w,h,d,r].join();if(cache.has(key))return cache.get(key);
  r=Math.max(.0005,Math.min(r,w/2-.0001,h/2-.0001,d/2-.0001));
  const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:2,curveSegments:4,steps:1});g.translate(0,0,-d/2+r);g.computeVertexNormals();cache.set(key,g);return g;
 }
 function mesh(geometry,mat){const o=new THREE.Mesh(geometry,mat);o.castShadow=!mat.transparent;o.receiveShadow=true;group.add(o);return o;}
 function box(w,h,d,x,y,z,mat=front,r=0){const o=mesh(r?roundGeo(w,h,d,r):new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);return o;}
 function cyl(rt,rb,h,x,y,z,mat=bronze,n=24){const o=mesh(new THREE.CylinderGeometry(rt,rb,h,n),mat);o.position.set(x,y,z);return o;}
 function ball(x,y,z,sx,sy,sz,mat){const o=mesh(new THREE.SphereGeometry(1,20,12),mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;}
 function obstacle(minX,minZ,maxX,maxZ){obstacles.push({minX,minZ,maxX,maxZ});}
 function ribbedFace(axis,fixed,from,to,y,height,sign=1){
  const length=to-from;
  if(axis==='x')box(.025,height,length,fixed,y,(from+to)/2,walnut);
  else box(length,height,.025,(from+to)/2,y,fixed,walnut);
  const n=Math.floor(length/.022),spacing=length/n;
  const geometry=axis==='x'?roundGeo(.013,height-.006,.012,.0055):roundGeo(.012,height-.006,.013,.0055);
  const ribs=new THREE.InstancedMesh(geometry,walnut,n),matrix=new THREE.Matrix4();
  for(let i=0;i<n;i++){
   const p=from+(i+.5)*spacing;
   matrix.makeTranslation(axis==='x'?fixed+sign*.017:p,y,axis==='x'?p:fixed+sign*.017);
   ribs.setMatrixAt(i,matrix);
  }
  ribs.castShadow=ribs.receiveShadow=true;ribs.name='physical-walnut-fluting';group.add(ribs);
 }
 function tube(points,radius,mat=bronze){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,30,radius,10,false),mat);}

 // Full-height ivory enclosure: two adjacent 600mm oven columns, never stacked.
 box(.64,2.48,1.20,5.075,1.31,8.95,front,.006);
 box(.58,.105,3.65,5.10,.0625,10.175,black);
 for(const z of [8.65,9.25]){
  box(.022,.84,.588,4.743,.535,z,front,.004);
  box(.022,.30,.588,4.743,.965,z,front,.004);
  box(.022,.42,.588,4.743,1.805,z,front,.004);
  box(.022,.51,.588,4.743,2.28,z,front,.004);
  // Black glass appliance door, brushed edge, display strip and pull handle.
  const oven=box(.038,.59,.57,4.718,1.30,z,black,.009);oven.name=z<9?'oven-left':'oven-right';oven.userData.feature=oven.name;features[oven.name]=oven;
  box(.008,.40,.495,4.694,1.265,z,ovenGlass,.005);
  box(.009,.075,.54,4.693,1.545,z,black,.003);
  box(.014,.012,.43,4.677,1.476,z,steel,.004);
  for(const zz of [z-.203,z+.203])box(.032,.018,.018,4.691,1.476,zz,steel,.003);
  box(.004,.016,.105,4.686,1.55,z,ovenGlass,.001);
  const diode=new THREE.MeshBasicMaterial({color:'#b6c3bd'});diode.userData.kitchenRole='kitchenDisplay';diode.userData.fixedKitchen=true;
  box(.003,.004,.028,4.683,1.55,z,diode);
  for(const zz of[z-.204,z+.204]){const knob=cyl(.013,.013,.009,4.681,1.546,zz,steel,16);knob.rotation.z=Math.PI/2;}
 }
 // Tall cupboard at the far end, with precise narrow door reveals.
 box(.64,2.48,.80,5.075,1.31,11.60,front,.006);
 for(const z of[11.40,11.80]){
  box(.022,1.54,.388,4.743,.905,z,front,.004);
  box(.022,.85,.388,4.743,2.12,z,front,.004);
 }
 // Counter-height ivory fronts beneath the sink niche.
 box(.64,.60,1.65,5.075,.40,10.375,front,.006);
 for(const z of[9.825,10.375,10.925]){
  box(.022,.16,.538,4.743,.792,z,front,.003);
  box(.022,.58,.538,4.743,.405,z,front,.004);
 }
 // True sink aperture: four pieces of stone surround the recessed bowl.
 const topY=.925;
 box(.105,.04,1.65,4.7675,topY,10.375,stone,.003);
 box(.145,.04,1.65,5.3275,topY,10.375,stone,.003);
 box(.435,.04,.505,5.0375,topY,9.8025,stone,.003);
 box(.435,.04,.565,5.0375,topY,10.9175,stone,.003);
 box(.018,.17,.57,4.823,.823,10.35,black,.004);
 box(.018,.17,.57,5.247,.823,10.35,black,.004);
 box(.424,.17,.018,5.035,.823,10.074,black,.004);
 box(.424,.17,.018,5.035,.823,10.626,black,.004);
 box(.424,.018,.552,5.035,.744,10.35,black,.004);
 const drain=cyl(.032,.032,.004,5.035,.756,10.35,steel,24);
 for(const xx of[4.812,5.258])box(.008,.007,.584,xx,.947,10.35,bronze,.002);
 for(const zz of[10.058,10.642])box(.446,.007,.008,5.035,.947,zz,bronze,.002);
 // The sample stone continues vertically over the complete recess.
 const splash=box(.023,.684,1.65,5.378,1.289,10.375,stone,.003);splash.name='sink-niche';splash.userData.feature='sink-niche';features.sinkNiche=splash;
 // Full-height upper cupboard fronts, as in the supplied cream/walnut design.
 // The previous thin cream cap and solid walnut block obscured this open niche.
 const cupboardParts=[];
 const upperPart=o=>{cupboardParts.push(o);return o;};
 upperPart(box(.64,.018,1.65,5.075,2.011,10.375,front));
 upperPart(box(.64,.018,1.65,5.075,2.541,10.375,front));
 for(const z of [9.559,10.375,11.191])upperPart(box(.64,.53,.018,5.075,2.276,z,front));
 upperPart(box(.018,.53,1.65,5.378,2.276,10.375,front));
 const upperFronts=[];
 for(const [i,z]of [9.825,10.375,10.925].entries()){
  const door=upperPart(box(.024,.516,.538,4.741,2.276,z,front,.003));
  door.name='sink-upper-cupboard-front-'+(i+1);door.userData.feature='sink-upper-cupboard-front';upperFronts.push(door);
  // Small recessed bronze pull under each door, leaving the plain fronts calm.
  upperPart(box(.014,.012,.16,4.721,2.025,z,bronze,.002));
 }
 features.upperCabinetFronts=upperFronts;
 // A real open walnut shelf between the tap and cupboards: back and edges only.
 const shelf=box(.43,.032,1.65,5.16,1.65,10.375,walnut,.003);
 shelf.name='open-walnut-shelf-above-faucet';shelf.userData.feature='sink-open-shelf';features.sinkShelf=shelf;
 box(.018,.346,1.65,5.378,1.825,10.375,walnut);
 for(const z of [9.562,11.188])box(.43,.346,.024,5.16,1.825,z,walnut);
 // Narrow fluted fascia caps the open cubby, with light below and below shelf.
 ribbedFace('x',4.95,9.55,11.20,1.958,.084,-1);
 box(.014,.008,1.55,4.966,1.909,10.375,amber,.002).name='open-shelf-upper-led';
 box(.014,.008,1.55,4.966,1.629,10.375,amber,.002).name='open-shelf-under-led';
 // A few low cups/books reveal that the space above the shelf is actually open.
 for(const z of [9.70,9.82])cyl(.035,.029,.08,5.18,1.706,z,porcelain);
 for(let i=0;i<3;i++)box(.05,.14+i*.015,.11,5.24,1.736+i*.0075,10.94+i*.06,i===1?front:walnut,.002);
 for(const z of[9.86,10.375,10.89]){
  const l=new THREE.PointLight('#ffd29b',.65,1.5,2);l.position.set(4.94,1.60,z);l.userData.kitchenLED=true;l.userData.baselineIntensity=.65;group.add(l);lights.push(l);
 }
 const shelfLight=new THREE.PointLight('#ffd29b',.45,.85,2);shelfLight.position.set(5.05,1.83,10.375);shelfLight.userData.kitchenLED=true;group.add(shelfLight);lights.push(shelfLight);
 // Brushed bronze swan-neck faucet and separate, practical mixer lever.
 cyl(.032,.032,.012,5.285,.953,10.35,bronze);
 tube([[5.285,.955,10.35],[5.285,1.25,10.35],[5.24,1.325,10.35],[5.08,1.325,10.35],[5.005,1.23,10.35]],.014);
 cyl(.018,.018,.035,5.005,1.223,10.35,bronze);
 cyl(.026,.026,.045,5.285,.966,10.49,bronze);tube([[5.285,.98,10.49],[5.285,1.075,10.49],[5.24,1.085,10.49]],.008);
 // Soap dispenser and a small timber board sit at the sides of the sink.
 cyl(.029,.032,.115,5.23,1.005,10.83,porcelain);box(.032,.012,.014,5.215,1.068,10.83,bronze,.003);
 box(.022,.23,.30,5.32,1.064,9.79,walnut,.025);
 // Sage Barista Impress, Almond Nougat, alongside the sink.
 const coffee=new THREE.Group();coffee.name='sage-barista-impress-almond-nougat';group.add(coffee);
 const coffeeStart=new Set(group.children),almond=material('coffeeAlmond','#d2c4aa',.55,{metalness:.18});
 box(.32,.36,.33,5.08,1.13,10.88,almond,.025);
 box(.018,.22,.27,4.91,1.17,10.88,steel,.008);
 box(.13,.025,.28,4.87,.969,10.88,steel,.005);
 box(.06,.03,.09,4.88,1.17,10.96,black,.005);
 box(.14,.022,.025,4.80,1.15,10.96,black,.005);
 const hopper=cyl(.065,.055,.10,5.10,1.36,10.81,ovenGlass);cyl(.067,.067,.012,5.10,1.415,10.81,black);
 for(const z of[10.80,10.89]){const knob=cyl(.025,.025,.016,4.895,1.25,z,steel);knob.rotation.z=Math.PI/2;}
 cyl(.033,.028,.065,4.85,1.013,10.96,porcelain);
 for(const o of [...group.children])if(!coffeeStart.has(o)){group.remove(o);coffee.add(o);}
 obstacle(4.70,8.35,5.40,12.00);

 group=islandGroup;
 // Island: reduced-depth body behind the seating recess, full body at the fridge end.
 box(.59,.80,1.73,3.495,.48,10.865,walnut,.005);
 // The fridge bay remains hollow; a solid timber block would hide its racks.
 box(.40,.80,.70,3.60,.48,9.65,walnut,.005);
 box(.53,.09,2.25,3.49,.085,10.525,black);
 ribbedFace('x',3.793,9.30,11.75,.49,.80,1);
 ribbedFace('x',3.196,10.045,11.68,.49,.80,-1);
 ribbedFace('z',9.307,2.775,3.80,.49,.80,-1);
 // Return at the far end forms a timber waterfall leg down to the floor.
 ribbedFace('z',11.718,2.675,3.80,.465,.88,1);
 box(1.125,.88,.045,3.2375,.465,11.724,walnut,.004);
 // Thin continuous stone, with a comfortable overhang over the recessed front.
 box(1.19,.04,2.51,3.245,.925,10.525,stone,.007);
 // Recess fascia and fridge-side vertical stile leave the glass door fully exposed.
 box(.035,.84,.052,2.775,.465,9.335,walnut,.004);
 box(.035,.84,.052,2.775,.465,9.995,walnut,.004);
 box(.035,.048,.66,2.775,.884,9.665,walnut,.004);
 // Black induction surface, subdued cooking-zone etching and a touch-control rail.
 box(.66,.009,.75,3.28,.951,10.60,black,.008);
 const etch=material('kitchenHobEtching','#747f7a',.5,{metalness:.2});
 for(const xx of[3.12,3.44])for(const zz of[10.43,10.77]){
  const ring=mesh(new THREE.RingGeometry(.091,.093,40),etch);ring.rotation.x=-Math.PI/2;ring.position.set(xx,.9563,zz);
 }
 box(.018,.002,.28,2.993,.957,10.60,etch,.001);
 for(const z of[10.51,10.60,10.69])box(.004,.002,.018,2.976,.958,z,etch);
 // A wine fridge in the visible front-left island bay. Its interior is real geometry.
 const fz=9.665,frontX=2.741;
 box(.024,.81,.58,3.352,.442,fz,black,.004);
 for(const z of[fz-.286,fz+.286])box(.60,.81,.022,3.052,.442,z,black,.003);
 box(.60,.026,.59,3.052,.839,fz,black,.004);
 box(.60,.026,.59,3.052,.047,fz,black,.004);
 // Door frame surrounding a transparent panel: racks remain visible through it.
 for(const z of[fz-.276,fz+.276])box(.022,.75,.029,frontX,.466,z,steel,.003);
 for(const y of[.105,.827])box(.022,.029,.58,frontX,y,fz,steel,.003);
 const wineGlass=box(.009,.693,.518,frontX-.013,.466,fz,glass,.002);wineGlass.name='wine-fridge-glass';wineGlass.userData.feature='wine-fridge-glass';features.wineGlass=wineGlass;
 for(const z of[fz-.248,fz+.248])box(.015,.69,.012,frontX-.018,.466,z,black,.002);
 // Long brushed handle is offset at one edge as in the reference.
 box(.036,.026,.026,frontX-.032,.18,fz-.217,steel,.006);
 box(.036,.026,.026,frontX-.032,.73,fz-.217,steel,.006);
 box(.02,.58,.019,frontX-.055,.455,fz-.217,steel,.006);
 for(const y of[.20,.36,.52,.68]){
  for(const x of[2.82,3.25]){const rack=box(.025,.017,.47,x,y,fz,walnut,.003);rack.name='wine-fridge-rack';rack.userData.feature='wine-fridge-rack';}
  for(let i=0;i<5;i++){
   const z=fz-.192+i*.096;
   box(.44,.008,.009,3.035,y-.005,z,steel,.002);
   const body=cyl(.027,.027,.20,3.055,y+.035,z,i%2?bottleBrown:bottleGreen,16);body.rotation.z=Math.PI/2;
   const shoulder=ball(2.938,y+.035,z,.035,.027,.027,i%2?bottleBrown:bottleGreen);
   const neck=cyl(.011,.013,.075,2.89,y+.035,z,i%2?bottleBrown:bottleGreen,12);neck.rotation.z=Math.PI/2;
   const cap=cyl(.012,.012,.018,2.846,y+.035,z,bronze,12);cap.rotation.z=Math.PI/2;
   const wrap=cyl(.0275,.0275,.052,3.05,y+.035,z,label,16);wrap.rotation.z=Math.PI/2;
  }
 }
 // A tiny warm top strip illuminates the bottle shoulders without casting new shadows.
 box(.008,.008,.45,2.86,.807,fz,amber,.002);
 // Base ventilation grille, multiple real slots rather than a solid black strip.
 box(.025,.083,.56,frontX-.006,.064,fz,black,.003);
 for(let i=0;i<6;i++)box(.006,.004,.47,frontX-.021,.034+i*.011,fz,steel,.001);
 // Restrained styling from the reference: amber vase, stems and three small vessels.
 const vaseMat=material('kitchenVase','#ae7b4e',.32,{metalness:.08});
 cyl(.065,.08,.18,3.34,1.04,9.60,vaseMat);cyl(.038,.065,.09,3.34,1.175,9.60,vaseMat);
 for(let i=0;i<7;i++){
  const a=i*2.4,dx=Math.cos(a)*.10,dz=Math.sin(a)*.06;
  tube([[3.34,.99,9.60],[3.34+dx*.5,1.35,9.60+dz*.5],[3.34+dx,1.53+(i%3)*.045,9.60+dz]],.0025,walnut);
  for(let j=0;j<3;j++){const leaf=ball(3.34+dx*(.65+j*.14),1.35+j*.065,9.60+dz,.018,.043,.007,label);leaf.rotation.set(Math.sin(a)*.5,a,Math.cos(a)*.5);}
 }
 for(const z of[9.90,10.04,10.18]){cyl(.035,.032,.075,3.60,.982,z,porcelain);cyl(.028,.028,.002,3.60,1.021,z,black);}
 // Barco Sora 46244: 120 cm sand/champagne bar, 30 mm wide, six MINI GU10 heads.
 // Source: https://www.barco.nl/p/zandkleurige-opbouwspot-120cm-mini-gu10-verstelbare-lichtpunten/46244
 const islandLamp=new THREE.Group();islandLamp.name='barco-46244-island-spotbar';
 islandLamp.position.set(3.245,2.675,10.525);islandGroup.add(islandLamp);
 Object.assign(islandLamp.userData,{feature:'island-spotbar',brand:'Barco',article:'46244',length:1.20,barWidth:.03,headCount:6,sourceUrl:'https://www.barco.nl/p/zandkleurige-opbouwspot-120cm-mini-gu10-verstelbare-lichtpunten/46244'});
 const sand=new THREE.MeshStandardMaterial({color:'#b7a48a',roughness:.73,metalness:.25});sand.userData.fixedKitchen=true;sand.userData.kitchenRole='islandSpotSand';
 const reflector=new THREE.MeshStandardMaterial({color:'#34312b',roughness:.38,metalness:.5});reflector.userData.fixedKitchen=true;
 const lens=new THREE.MeshStandardMaterial({color:'#fff0cc',emissive:'#ffe2aa',emissiveIntensity:1.4,roughness:.3});lens.userData.fixedKitchen=true;
 const fixtureMesh=(geometry,mat,parent=islandLamp)=>{const o=new THREE.Mesh(geometry,mat);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 const mount=fixtureMesh(new THREE.BoxGeometry(.10,.03,.10),sand);mount.name='spotbar-10cm-mount';
 const bar=fixtureMesh(new THREE.CylinderGeometry(.015,.015,1.2,20),sand);bar.rotation.x=Math.PI/2;bar.position.y=-.04;bar.name='spotbar-120cm-bar';
 for(const [i,z]of [-.56,-.42,-.09,.08,.44,.56].entries()){
  const pivot=new THREE.Group();pivot.name='adjustable-mini-gu10-'+(i+1);pivot.userData.feature='island-spot-head';pivot.position.set(0,-.058,z);pivot.rotation.set(i%2?.26:-.22,0,i%3===0?-.20:.18);islandLamp.add(pivot);
  const stem=fixtureMesh(new THREE.CylinderGeometry(.006,.006,.025,10),sand,pivot);stem.position.y=-.008;
  const head=fixtureMesh(new THREE.CylinderGeometry(.023,.023,.075,24,1,true),sand,pivot);head.position.y=-.052;
  const ring=fixtureMesh(new THREE.RingGeometry(.0175,.0225,24),reflector,pivot);ring.rotation.x=Math.PI/2;ring.position.y=-.090;
  const face=fixtureMesh(new THREE.CircleGeometry(.0175,24),lens,pivot);face.rotation.x=Math.PI/2;face.position.y=-.0905;
  const light=new THREE.SpotLight('#ffe7c3',.65,3.1,Math.PI/7,.65,1.8);light.position.set(0,-.093,0);light.castShadow=false;light.userData.kitchenIslandSpot=true;pivot.add(light);
  const target=new THREE.Object3D();target.position.set(0,-1.72,0);pivot.add(target);light.target=target;lights.push(light);
 }
 features.islandSpotbar=islandLamp;
 // Collisions follow the stone overhang, so walking never clips through the counter.
 obstacle(2.65,9.27,3.84,11.78);
 // Reflect each assembly around its own existing depth midpoint; do not move
 // the wall run or island footprint, which have different centres. Both AABB
 // colliders are symmetric about these centres and remain in plan coordinates.
 cabinetryGroup.position.z=8.35+12.00;cabinetryGroup.scale.z=-1;
 islandGroup.position.z=9.27+11.78;islandGroup.scale.z=-1;
 return {obstacles,lights,fixtures:lights,group:kitchenGroup,features};
}
