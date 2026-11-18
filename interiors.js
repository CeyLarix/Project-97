import {addBesiktasLounge} from './besiktas.js';
import * as THREE from './assets/three.module.js';

// Upper-storey furniture. All coordinates are local to the supplied floor group.
export function furnishUpper(group, level, materials={}) {
 const id=typeof level==='object'?level.id:level;
 const obstacles=[],lights=[],m={...materials};
 const defaults={wood:'#ac9474',cabinet:'#bdb3a2',fabric:'#d4cbbd',secondaryFabric:'#9f9b85',accent:'#8c8e70',stone:'#e4dfd4',metal:'#514c42',rug:'#c8bca7',ceiling:'#f1eae0'};
 for(const [role,color]of Object.entries(defaults)){if(!m[role])m[role]=new THREE.MeshStandardMaterial({color,roughness:['fabric','secondaryFabric','rug'].includes(role)?.96:.7});m[role].userData.role=role;}
 const ceramic=materials.ceramic||new THREE.MeshStandardMaterial({color:'#eeece4',roughness:.23});ceramic.userData.role='ceramic';
 const glass=materials.glass||new THREE.MeshPhysicalMaterial({color:'#dce3dc',roughness:.04,transparent:true,opacity:.13,depthWrite:false});glass.userData.role='glass';
 const dark=new THREE.MeshStandardMaterial({color:'#272a27',roughness:.37});dark.userData.role='metal';
 const water=new THREE.MeshStandardMaterial({color:'#d0dfd8',roughness:.12,transparent:true,opacity:.55});water.userData.role='glass';
 const cache=new Map();
 function geo(w,h,d,r=.035){
  const key=[w,h,d,r].join();if(cache.has(key))return cache.get(key);
  r=Math.max(.001,Math.min(r,w/2-.001,h/2-.001,d/2-.001));
  const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:3,curveSegments:5,steps:1});g.translate(0,0,-d/2+r);g.computeVertexNormals();cache.set(key,g);return g;
 }
 function mesh(g,mat,parent=group){const o=new THREE.Mesh(g,mat);o.castShadow=!mat.transparent;o.receiveShadow=true;parent.add(o);return o;}
 function box(w,h,d,x,y,z,mat=m.wood,r=0,parent=group){const o=mesh(r?geo(w,h,d,r):new THREE.BoxGeometry(w,h,d),mat,parent);o.position.set(x,y,z);return o;}
 function cyl(rt,rb,h,x,y,z,mat=m.wood,parent=group,n=28){const o=mesh(new THREE.CylinderGeometry(rt,rb,h,n),mat,parent);o.position.set(x,y,z);return o;}
 function ball(x,y,z,sx,sy,sz,mat,parent=group){const o=mesh(new THREE.SphereGeometry(1,24,14),mat,parent);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;}
 function obs(x,z,w,d){obstacles.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});}
 function lamp(x,y,z,parent=group,small=false,palette=m){const r=small?.075:.115;cyl(r*.7,r*.9,.025,x,y+.013,z,palette.metal,parent);cyl(.009,.011,.25,x,y+.15,z,palette.metal,parent,10);cyl(r,r*1.35,.17,x,y+.34,z,palette.fabric,parent);const l=new THREE.PointLight('#ffe1b7',small?1.7:3.0,2.5,2);l.position.set(x,y+.28,z);parent.add(l);lights.push(l);}
 function books(x,y,z,parent=group,palette=m){for(let i=0;i<3;i++){const o=box(.24-i*.017,.022,.17,x,y+.012+i*.023,z,i===1?palette.accent:palette.secondaryFabric,.003,parent);o.rotation.y=(i-1)*.08;}}
 function plant(x,z,size=.7,parent=group){cyl(.13*size,.10*size,.25*size,x,.125*size,z,m.stone,parent);const stemMat=m.accent;for(let i=0;i<12;i++){const a=i*2.4,h=(.48+(i%4)*.11)*size,r=.13*size;cyl(.003,.004,h,x+Math.cos(a)*r*.3,.25*size+h/2,z+Math.sin(a)*r*.3,m.wood,parent,6);const leaf=ball(x+Math.cos(a)*r,h+.2*size,z+Math.sin(a)*r,.065*size,.17*size,.018*size,stemMat,parent);leaf.rotation.set(Math.sin(a)*.7,a,Math.cos(a)*.6);}}
 function rug(x,z,w,d,parent=group,material=m.rug){const o=box(w,.012,d,x,.013,z,material,.004,parent);for(let side of [-1,1])for(let i=0;i<Math.ceil(w/.06);i++)box(.011,.008,.045,x-w/2+.025+i*.06,.013,z+side*(d/2+.015),material,0,parent);return o;}
 function wardrobe(x,z,w,d,h=2.3,angle=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;group.add(g);box(w,h,d,0,h/2+.03,0,m.cabinet,.015,g);box(w-.06,.07,d-.06,0,.065,0,m.metal,0,g);const n=Math.max(2,Math.round(w/.48));for(let i=0;i<n;i++){const xx=-w/2+(i+.5)*w/n;box(w/n-.012,h-.1,.018,xx,h/2+.06,d/2+.013,m.cabinet,.005,g);box(.013,.27,.025,xx+w/n*.3,1.11,d/2+.036,m.metal,.004,g);}const a=Math.abs(Math.cos(angle)),b=Math.abs(Math.sin(angle));obs(x,z,w*a+d*b,d*a+w*b);return g;}
 function puff(w,h,d,x,y,z,mat,parent,angle=0){const o=ball(x,y,z,w/2,h/2,d/2,mat,parent);o.rotation.y=angle;return o;}
 function sheet(parent,width,length,mat,duvet=false){
  const nx=36,nz=44,positions=[],uvs=[],indices=[];
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
   const u=i/nx,v=j/nz,x=(u-.5)*(width+.25),z=duvet?(-length/2-.16+v*(length*.73+.16)):(v-.5)*(length+.27);
   const ex=Math.max(0,(Math.abs(x)-width/2+.045)/.17),ez=Math.max(0,(-z-length/2+.035)/.18);
   let y=(duvet?.674:.595)+(duvet?.047:0)*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)-.25*Math.pow(Math.max(ex,ez),.67);
   y+=(Math.sin(x*31+z*13)*.004+Math.sin(x*17-z*22)*.004)*(1+ex*2+ez*2);
   positions.push(x,y,z);uvs.push(u*2,v*2);
  }
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;indices.push(a,c,b,b,c,d);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();const material=mat.clone();material.side=THREE.DoubleSide;if(!mat.userData.fixedChildRoom)material.userData.role='secondaryFabric';return mesh(g,material,parent);
 }
 function bed(x,z,w=1.4,l=2,angle=0,name='',options={}){
  const palette=options.palette||m;
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;g.name=name;group.add(g);
  if(options.room)Object.assign(g.userData,{room:options.room,mattressWidth:w,mattressLength:l,pillowCount:1});
  // Upholstered plinth, raised piped mattress and curved headboard.
  box(w,.27,l,0,.235,0,palette.fabric,.055,g);box(w-.06,.06,l-.04,0,.11,0,palette.wood,.015,g);const mattress=box(options.room?w-.12:w-.025,options.room?.10:.22,options.room?l:l-.035,0,.485,0,palette.secondaryFabric,.06,g);
  if(options.room){mattress.name='single-mattress';mattress.geometry.computeBoundingBox();const b=mattress.geometry.boundingBox;mattress.scale.x=w/(b.max.x-b.min.x);mattress.scale.z=l/(b.max.z-b.min.z);}
  box(w+.11,1.02,.13,0,.62,l/2+.065,palette.fabric,.06,g);
  for(let j=0;j<Math.round(w/.22);j++)box(.005,.84,.008,-w/2+.11+j*.22,.65,l/2+.137,palette.secondaryFabric,.002,g);
  for(const xx of [-w*.37,w*.37])for(const zz of [-l*.39,l*.39])cyl(.025,.02,.13,xx,.065,zz,palette.wood,g,12);
  sheet(g,w,l,palette.secondaryFabric,false);sheet(g,w+.015,l,palette.secondaryFabric,true);
  // Plump pillows with visible centre seams, slightly askew rather than square blocks.
  const pillows=w>1.3?2:1;
  for(let i=0;i<pillows;i++){const px=pillows===1?0:(i-.5)*w*.48;const p=puff(w/pillows*.87,.19,.4,px,.704,l*.33,palette.secondaryFabric,g,(i-.5)*.1);p.rotation.x=-.08;if(options.room)p.name='sleeping-pillow';const seam=new THREE.Mesh(new THREE.TorusGeometry(.1,.0025,4,32),palette.fabric);seam.scale.set(w/pillows*4,1.65,1);seam.rotation.x=Math.PI/2;seam.position.set(px,.704,l*.33);g.add(seam);}
  // A textured folded throw drapes over the foot with soft, irregular folds.
  const throwMat=palette.accent.clone();if(!palette.accent.userData.fixedChildRoom)throwMat.userData.role='secondaryFabric';
  const throwGeo=new THREE.PlaneGeometry(w+.14,.38,26,7),p=throwGeo.attributes.position;
  for(let i=0;i<p.count;i++){const xx=p.getX(i),yy=p.getY(i);p.setXYZ(i,xx,.727+Math.sin(xx*24+yy*5)*.011-Math.max(0,Math.abs(xx)-w/2+.025)*1.4,-l*.3+yy);}
  throwGeo.computeVertexNormals();throwMat.side=THREE.DoubleSide;mesh(throwGeo,throwMat,g);
  const a=Math.abs(Math.cos(angle)),b=Math.abs(Math.sin(angle));obs(x,z,w*a+(l+.16)*b,(l+.16)*a+w*b);
  return g;
 }
 function nightstand(x,z,palette=m){box(.39,.43,.36,x,.25,z,palette.wood,.025);box(.35,.18,.018,x,.33,z-.191,palette.cabinet,.006);box(.1,.012,.012,x,.33,z-.207,palette.metal,.003);lamp(x,.47,z,group,false,palette);obs(x,z,.41,.39);}
 function chair(x,z,angle=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;group.add(g);box(.46,.09,.44,0,.47,0,m.fabric,.035,g);const b=box(.46,.4,.07,0,.69,-.195,m.fabric,.025,g);b.rotation.x=-.13;for(const xx of[-.17,.17])for(const zz of[-.15,.15])cyl(.014,.011,.43,xx,.23,zz,m.wood,g,10);const a=Math.abs(Math.cos(angle)),b2=Math.abs(Math.sin(angle));obs(x,z,.46*a+.48*b2,.48*a+.46*b2);return g;}
 function desk(x,z,w=1.2,angle=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;group.add(g);box(w,.045,.57,0,.755,0,m.wood,.018,g);for(const xx of[-w/2+.07,w/2-.07])for(const zz of[-.21,.21])box(.035,.72,.035,xx,.37,zz,m.metal,.008,g);box(.44,.28,.026,.1,.995,.12,dark,.013,g);box(.028,.14,.028,.1,.83,.12,m.metal,0,g);box(.2,.014,.14,.1,.79,.12,m.metal,.004,g);box(.31,.009,.11,.1,.784,-.15,m.cabinet,.003,g);books(-w*.33,.78,.03,g);lamp(w*.36,.78,.08,g,true);const a=Math.abs(Math.cos(angle)),b=Math.abs(Math.sin(angle));obs(x,z,w*a+.59*b,.59*a+w*b);return g;}
 function mirror(x,y,z,w,h,angle=0){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=angle;group.add(g);box(w+.035,h+.035,.025,0,0,0,m.metal,.012,g);const reflective=new THREE.MeshStandardMaterial({color:'#b9c4bd',metalness:.78,roughness:.18});reflective.userData.role='glass';box(w,h,.012,0,0,.019,reflective,.006,g);}
 function abstract(x,y,z,w,h,angle=0){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=angle;group.add(g);box(w+.04,h+.04,.025,0,0,0,m.wood,.01,g);box(w,h,.012,0,0,.02,m.fabric,.005,g);const a=ball(-w*.14,-h*.03,.04,w*.28,h*.36,.004,m.accent,g);a.rotation.z=.2;const b=ball(w*.23,-h*.24,.047,w*.25,h*.2,.005,m.secondaryFabric,g);b.rotation.z=-.4;}
 function curtains(x,z,w,palette=m){const cm=palette.fabric.clone();cm.transparent=true;cm.opacity=.87;cm.side=THREE.DoubleSide;if(!palette.fabric.userData.fixedChildRoom)cm.userData.role='fabric';for(const side of[-1,1]){const g=new THREE.PlaneGeometry(.29,2.12,16,1),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*70)*.033);g.computeVertexNormals();const o=mesh(g,cm);o.position.set(x+side*(w/2+.04),1.32,z);}}
 // These room-local materials retain the selected child palettes in all house styles.
 function childPalette(room,duvet,accent){
  const colors={wood:'#c5aa80',cabinet:'#f4f1e9',fabric:'#eee7db',secondaryFabric:duvet,accent,rug:'#e7ded0',metal:'#a3957b'};
  return Object.fromEntries(Object.entries(colors).map(([role,color])=>{
   const material=m[role].clone();material.color.set(color);delete material.userData.role;
   Object.assign(material.userData,{fixedChildRoom:true,room});material.name=room+'-'+role;
   return [role,material];
  }));
 }
 function pax(x,z,width,angle,room,palette){
  const depth=.58,height=2.01,g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;
  g.name='pax-'+room;Object.assign(g.userData,{room,brand:'IKEA',range:'PAX',width,depth,height,
   sourceUrl:width===.75?'https://www.ikea.com/nl/nl/p/pax-basiselement-kledingkast-wit-80458231/':'https://www.ikea.com/nl/nl/p/pax-basiselement-kledingkast-wit-70458203/',
   configuration:width===.75?'Visual interpretation: 50 cm door and 25 cm open shelving':'Visual interpretation: two 50 cm plain doors'});group.add(g);
  // 18 mm white corpus; every panel stays within the specified PAX frame size.
  for(const xx of [-width/2+.009,width/2-.009])box(.018,height,depth-.018,xx,height/2,-.009,palette.cabinet,0,g);
  for(const y of [.074,height-.009])box(width-.036,.018,depth-.018,0,y,-.009,palette.cabinet,0,g);
  box(width-.036,height-.036,.006,0,height/2,-depth/2+.003,palette.cabinet,0,g);
  box(width-.036,.065,depth-.06,0,.0325,-.02,palette.cabinet,0,g);
  const door=(xx,w,handleSide)=>{
   box(w-.007,height-.105,.018,xx,(height+.065)/2,.281,palette.cabinet,0,g);
   box(.012,.19,.025,xx+handleSide*(w/2-.045),1.04,.303,palette.metal,.003,g);
  };
  if(width===.75){
   door(-.125,.5,1);box(.018,height-.10,depth-.06,.125,(height+.065)/2,-.025,palette.cabinet,0,g);
   for(const y of [.45,.85,1.25,1.65])box(.223,.018,.49,.25,y,-.025,palette.cabinet,0,g);
   for(let i=0;i<3;i++)box(.025,.17+i*.015,.14,.187+i*.04,.944+i*.0075,.13,i===1?palette.accent:palette.secondaryFabric,.002,g);
   box(.17,.18,.30,.25,.55,.06,palette.fabric,.009,g);
  }else{door(-.25,.5,1);door(.25,.5,-1);}
  const a=Math.abs(Math.cos(angle)),b=Math.abs(Math.sin(angle)),handleExtra=.032;
  obs(x+Math.sin(angle)*handleExtra/2,z+Math.cos(angle)*handleExtra/2,width*a+(depth+handleExtra)*b,(depth+handleExtra)*a+width*b);
  return g;
 }
 function childPrint(x,y,z,w,h,angle,kind,palette){
  const g=new THREE.Group();g.name=kind+'-childrens-print';g.position.set(x,y,z);g.rotation.y=angle;group.add(g);
  box(w+.035,h+.035,.025,0,0,0,palette.wood,.006,g);box(w,h,.008,0,0,.019,palette.cabinet,0,g);
  if(kind==='rainbow'){
   for(let i=0;i<3;i++){const arch=mesh(new THREE.TorusGeometry(.155-i*.035,.011,6,36,Math.PI),i===1?palette.fabric:i===2?palette.wood:palette.accent,g);arch.position.set(0,-.07,.033);}
   ball(-.105,-.08,.034,.055,.022,.006,palette.fabric,g);ball(.105,-.08,.034,.055,.022,.006,palette.fabric,g);
  }else{
   for(const [x,y,r]of [[-.10,.11,.066],[.11,-.10,.045],[.13,.17,.025]]){
    const shape=new THREE.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,rr=i%2?r*.46:r;if(i===0)shape.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);else shape.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}shape.closePath();
    const star=mesh(new THREE.ShapeGeometry(shape),palette.wood,g);star.position.set(x,y,.031);
   }
   const moon=mesh(new THREE.TorusGeometry(.095,.021,8,36,Math.PI*1.45),palette.accent,g);moon.rotation.z=.3;moon.position.set(-.015,-.045,.034);
  }
 }
 function teddy(parent,palette){
  const g=new THREE.Group();g.name='small-teddy';g.position.set(.18,.79,-.35);parent.add(g);
  ball(0,0,0,.075,.10,.06,palette.fabric,g);ball(0,.12,0,.067,.065,.055,palette.fabric,g);
  for(const x of [-.052,.052]){ball(x,.17,0,.028,.03,.022,palette.fabric,g);ball(x*.95,-.07,.035,.038,.035,.055,palette.fabric,g);}
  ball(0,.105,.05,.03,.025,.014,palette.wood,g);
  for(const x of [-.023,.023])ball(x,.132,.052,.004,.005,.003,palette.metal,g);
 }
 if(id==='first'||id===1){
  // Master: a calming room with a separate wardrobe in the L-shaped entrance.
  rug(1.45,8.55,2.55,2.65);bed(1.45,8.6,1.72,2.05,0,'master-bed-fallback');nightstand(.3,9.1);nightstand(2.6,9.1);
  wardrobe(.35,4.97,1.35,.56,2.25,Math.PI/2);mirror(.035,1.22,6.6,.55,1.55,Math.PI/2);plant(2.72,9.7,.65);curtains(1.36,9.86,1.68);
  abstract(.03,1.62,7.3,.58,.75,Math.PI/2);
  // Two quiet girls' rooms: standard single beds and dimensioned PAX frames.
  const firstFloorGroup=group;
  group=new THREE.Group();group.name='girls-bedroom-2';group.userData.room='bedroom2';firstFloorGroup.add(group);
  const blush=childPalette('bedroom2','#d7b3b4','#b78587');
  rug(1.28,.88,2.45,1.48,group,blush.rug);
  const bed2=bed(1.31,.72,.9,2,-Math.PI/2,'single-bed',{palette:blush,room:'bedroom2'});teddy(bed2,blush);
  pax(.40,3.62,.75,Math.PI/2,'bedroom2',blush);
  box(.2,.055,.78,2.45,.82,1.68,blush.wood,.013);box(.17,.15,.74,2.45,.72,1.68,blush.cabinet,.009);obs(2.45,1.68,.22,.8);
  books(2.43,.86,1.68,group,blush);mirror(2.60,1.4,1.68,.48,.57,-Math.PI/2);curtains(.86,.14,.68,blush);
  childPrint(.13,1.43,1.50,.55,.65,Math.PI/2,'rainbow',blush);
  group=new THREE.Group();group.name='girls-bedroom-3';group.userData.room='bedroom3';firstFloorGroup.add(group);
  const lilac=childPalette('bedroom3','#c9c0d5','#a9b59e');
  rug(4.05,1.42,2,2.45,group,lilac.rug);
  const bed3=bed(4.06,1.3,.9,2,Math.PI,'single-bed-bedroom3',{palette:lilac,room:'bedroom3'});teddy(bed3,lilac);
  nightstand(5.02,.57,lilac);pax(5.0,2.78,1,-Math.PI/2,'bedroom3',lilac);
  childPrint(2.745,1.6,1.1,.6,.8,Math.PI/2,'stars',lilac);curtains(4.11,.14,1.72,lilac);plant(3.07,.45,.58);
  group=firstFloorGroup;
  const mainUpperGroup=group;group=new THREE.Group();group.name='bathroom-fallback';mainUpperGroup.add(group);const bathObstacleStart=obstacles.length;
  // Bathroom: open approach from the landing, freestanding bath and glazed shower.
  rug(3.93,8.75,.5,1.3); // woven bath mat in front of the vanity
  box(.4,.47,1.12,3.47,.6,8.73,m.cabinet,.025);box(.45,.055,1.17,3.47,.865,8.73,m.stone,.018);
  // A shallow oval vessel basin, formed from a scaled torus rim plus bowl.
  const rim=mesh(new THREE.TorusGeometry(.17,.023,12,40),ceramic);rim.rotation.x=Math.PI/2;rim.scale.set(.83,1.36,1);rim.position.set(3.47,.94,8.73);
  const bowl=ball(3.47,.905,8.73,.14,.035,.23,ceramic);cyl(.013,.013,.23,3.3,1.0,8.73,m.metal);box(.17,.018,.016,3.37,1.12,8.73,m.metal,.006);
  mirror(3.226,1.48,8.73,1.05,.91,Math.PI/2);obs(3.47,8.73,.48,1.2);
  // Bath outer shell and recessed interior. Rim reveals carry realistic ceramic highlights.
  const bath=new THREE.Group();bath.position.set(4.94,0,8.98);group.add(bath);
  box(.73,.53,1.78,0,.34,0,ceramic,.13,bath);box(.6,.065,1.6,0,.61,0,m.stone,.028,bath);box(.52,.018,1.48,0,.646,0,water,.008,bath);
  for(const x of[-.325,.325])box(.07,.045,1.63,x,.644,0,ceramic,.02,bath);for(const z of[-.815,.815])box(.64,.045,.07,0,.644,z,ceramic,.022,bath);
  cyl(.014,.014,.77,4.49,.405,9.45,m.metal);box(.21,.02,.02,4.58,.79,9.45,m.metal,.008);obs(4.94,8.98,.78,1.83);
  // Shower tray, frameless panel and wall-mounted rain shower.
  box(.83,.045,.88,4.9,.035,7.56,m.stone,.018);box(.012,1.98,.87,4.46,1.04,7.56,glass);box(.83,1.98,.012,4.88,1.04,7.12,glass);
  box(.015,.04,.87,4.46,2.01,7.56,m.metal,.005);cyl(.014,.014,1.17,5.31,1.37,7.64,m.metal);box(.39,.023,.023,5.12,1.97,7.64,m.metal,.009);cyl(.13,.13,.025,4.94,1.97,7.64,m.metal);
  cyl(.035,.035,.055,5.3,1.1,7.64,m.metal);box(.26,.008,.018,4.9,.066,7.26,m.metal,.004);obs(4.9,7.56,.91,.94);
  // Wall-hung WC and a rolled linen towel on a slim rail.
  box(.32,.4,.1,5.28,.57,6.52,ceramic,.025);const wc=ball(5.04,.43,6.52,.28,.18,.2,ceramic);box(.47,.045,.36,5.02,.58,6.52,ceramic,.018);box(.025,.16,.24,5.32,1.03,6.52,m.metal,.009);obs(5.02,6.52,.59,.44);
  box(.025,.02,.56,3.26,1.0,7.58,m.metal,.004);box(.032,.48,.38,3.27,.77,7.58,m.secondaryFabric,.01);books(3.51,.9,9.16);
  for(const o of obstacles.slice(bathObstacleStart))o.bathroom=true;group=mainUpperGroup;
  // A slim landing console avoids the stair arrival and all door swings.
  box(.24,.065,.72,5.16,.83,5.45,m.wood,.015);box(.025,.76,.025,5.16,.41,5.13,m.metal);box(.025,.76,.025,5.16,.41,5.77,m.metal);books(5.15,.87,5.45);obs(5.16,5.45,.28,.76);
 } else if(id==='attic'||id===2){
  for(const [role,color]of Object.entries({fabric:'#232427',secondaryFabric:'#f1f0e8',accent:'#a72230',rug:'#333537'})){m[role]=m[role].clone();m[role].color.set(color);delete m[role].userData.role;}
  // Attic media lounge, with a clear approach to the stair opening.
  rug(2.0,3.55,2.8,2.8);
  box(.92,.30,2.55,.63,.31,3.35,m.fabric,.075).name='attic-chill-sofa';
  box(.16,.70,2.55,.20,.69,3.35,m.fabric,.06);
  for(const z of[2.14,4.56])box(.92,.48,.16,.63,.48,z,m.fabric,.05);
  for(let i=0;i<3;i++){box(.70,.17,.76,.72,.54,2.55+i*.80,m.secondaryFabric,.045);const c=box(.18,.40,.70,.34,.79,2.55+i*.80,m.fabric,.04);c.rotation.z=-.1;}
  puff(.22,.35,.38,.7,.8,2.6,m.accent,group);obs(.63,3.35,1.0,2.65);
  cyl(.42,.42,.045,2.05,.39,3.35,m.wood);cyl(.16,.23,.36,2.05,.19,3.35,m.wood);obs(2.05,3.35,.88,.88);
  box(.13,2.1,2.05,5.29,1.05,2.62,new THREE.MeshStandardMaterial({color:'#212325',roughness:.8}),.015).name='attic-media-wall';
  box(.05,.94,1.67,5.195,1.40,2.62,dark,.012).name='attic-large-tv';
  box(.008,.89,1.61,5.165,1.40,2.62,new THREE.MeshStandardMaterial({color:'#263b40',roughness:.25})).name='attic-tv-screen';
  box(.30,.24,1.9,5.18,.40,2.62,m.wood,.02);obs(5.18,2.62,.40,2.09);
  box(.05,.07,.85,5.02,.59,2.62,dark,.01);
  plant(2.3,5.65,.7);
  // Workspace at the back-left, with a chair facing the desk and a framed print.
  desk(1.2,7.95,1.65,0);chair(1.2,7.24,0);abstract(.03,1.42,7.49,.64,.8,Math.PI/2);plant(.27,8.38,.65);
  const atticPaxWhite=m.cabinet.clone();atticPaxWhite.color.set('#f4f1e9');delete atticPaxWhite.userData.role;
  const atticPaxPalette={...m,cabinet:atticPaxWhite};
  for(const [i,z]of[5.55,6.30].entries()){const cabinet=pax(.40,z,.75,Math.PI/2,'attic-pax-'+(i+1),atticPaxPalette);cabinet.userData.room='attic-room';}
  addBesiktasLounge(group,{attic:true});
  // Utility: laundry pair along the side wall, pipework and heat-pump equipment.
  const machine=(x,z,dryer=false)=>{box(.59,.85,.62,x,.44,z,m.cabinet,.023);box(.56,.79,.023,x,.46,z-.322,ceramic,.015);const ring=mesh(new THREE.TorusGeometry(.19,.026,12,44),m.metal);ring.position.set(x,.43,z-.344);const disk=mesh(new THREE.CircleGeometry(.168,40),dark);disk.position.set(x,.43,z-.346);box(.37,.08,.012,x,.79,z-.342,m.metal,.006);box(.15,.025,.006,x-.07,.79,z-.351,dark);cyl(.035,.035,.016,x+.2,.79,z-.352,m.metal).rotation.x=Math.PI/2;obs(x,z,.63,.66);};
  machine(2.98,7.95,false);machine(3.67,7.95,true);box(1.31,.04,.67,3.325,.89,7.95,m.wood,.012);box(.48,.15,.35,3.4,1.0,7.95,m.secondaryFabric,.04);
  box(.62,1.48,.58,4.92,.78,8.13,ceramic,.03);box(.45,.16,.018,4.92,1.2,7.828,m.metal,.008);box(.19,.08,.008,4.92,1.2,7.816,dark,.005);obs(4.92,8.13,.68,.64);
  for(const x of[4.72,4.94,5.16]){cyl(.018,.018,.48,x,1.74,8.27,m.metal);const elbow=mesh(new THREE.TorusGeometry(.07,.018,8,14,Math.PI/2),m.metal);elbow.position.set(x,1.95,8.2);elbow.rotation.y=Math.PI/2;}
  // Low shelf and baskets fit under the rear pitch.
  for(const y of[.3,.7,1.1])box(.4,.027,.65,5.07,y,6.82,m.wood,.005);
  for(const z of[6.52,7.12])for(const x of[4.9,5.24])box(.025,1.12,.025,x,.57,z,m.metal);box(.31,.25,.45,5.07,.45,6.82,m.secondaryFabric,.018);obs(5.07,6.82,.45,.7);
 }
 return {obstacles,lights};
}
