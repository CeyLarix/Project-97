import * as THREE from './assets/three.module.js';
export function addRakiMasasi(parent){
 const group=new THREE.Group();group.name='mancave-raki-masasi';parent.add(group);const obstacles=[];
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.8,...extra});
 const black=mat('#191b1d'),wood=mat('#6e5140'),white=mat('#f8f5e9'),gold=mat('#bc9553',{metalness:.65,roughness:.35}),glass=mat('#dfe8e3',{transparent:true,opacity:.35,depthWrite:false});
 const mesh=(geometry,material,name,x=0,y=0,z=0,p=group)=>{const o=new THREE.Mesh(geometry,material);o.name=name;o.position.set(x,y,z);o.castShadow=!material.transparent;o.receiveShadow=true;p.add(o);return o;};
 const box=(w,h,d,x,y,z,m=black,name='',p=group)=>mesh(new THREE.BoxGeometry(w,h,d),m,name,x,y,z,p);
 const cyl=(r,h,x,y,z,m=white,name='',p=group)=>mesh(new THREE.CylinderGeometry(r,r,h,32),m,name,x,y,z,p);
 function obstacle(name,x,z,w,d){obstacles.push({name,mancave:true,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});}
 const x=7.3,z=12.4,y=.76;
 box(1.4,.045,.72,x,y-.0225,z,wood,'raki-dining-table');for(const dx of[-.57,.57])for(const dz of[-.25,.25])box(.055,.715,.055,x+dx,.3575,z+dz,black);
 // Cream runner leaves the chestnut table edge visible.
 box(.40,.004,.70,x,y+.002,z,white,'raki-table-runner');obstacle('raki-table',x,z,1.4,.72);
 for(const [cx,cz,angle]of[[x,z-.81,0],[x+1.10,z,-Math.PI/2]]){const chair=new THREE.Group();chair.name='raki-dining-chair';chair.position.set(cx,0,cz);chair.rotation.y=angle;group.add(chair);box(.46,.085,.46,0,.46,0,black,'',chair);box(.46,.43,.055,0,.715,-.215,black,'',chair);for(const dx of[-.18,.18])for(const dz of[-.18,.18])box(.03,.42,.03,dx,.21,dz,black,'',chair);obstacle('raki-chair',cx,cz,angle?.51:.48,angle?.48:.51);}

 // Tekirdağ Gold: frosted body, sloping shoulder, tall neck and gold closure.
 const bottle=new THREE.Group();bottle.name='tekirdag-gold-raki-bottle';bottle.position.set(x-.35,y,z-.10);group.add(bottle);
 const profile=[[.0,0],[.044,0],[.044,.19],[.039,.225],[.020,.253],[.017,.32]].map(p=>new THREE.Vector2(...p));
 mesh(new THREE.LatheGeometry(profile,48),mat('#e0ded1',{transparent:true,opacity:.86}),'frosted-raki-bottle',0,0,0,bottle);cyl(.019,.035,0,.333,0,gold,'tekirdag-gold-cap',bottle);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=768;const ctx=canvas.getContext('2d');ctx.fillStyle='#e6dcc2';ctx.fillRect(0,0,512,768);ctx.strokeStyle='#a17a36';ctx.lineWidth=14;ctx.strokeRect(18,18,476,732);ctx.fillStyle='#8e682c';ctx.textAlign='center';ctx.font='bold 57px Georgia';ctx.fillText('TEKİRDAĞ',256,170);ctx.font='43px Georgia';ctx.fillText('RAKISI',256,235);ctx.font='bold 65px Georgia';ctx.fillText('GOLD',256,400);ctx.font='40px Georgia';ctx.fillText('SERIES',256,460);ctx.font='26px Arial';ctx.fillText('70 cl  •  45%',256,657);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const label=mesh(new THREE.PlaneGeometry(.070,.145),mat('#ffffff',{map:texture,side:THREE.DoubleSide}),'tekirdag-gold-label',0,.126,.0445,bottle);label.scale.x=-1;
 for(const dz of[-.25,.25]){const gx=x+.44,gz=z+dz;cyl(.025,.17,gx,y+.085,gz,glass,'raki-drinking-glass');cyl(.021,.10,gx,y+.052,gz,white,'milky-raki');cyl(.040,.006,gx,y+.005,gz,black,'glass-coaster');}
 const carafe=new THREE.Group();carafe.name='raki-water-carafe';carafe.position.set(x+.05,y,z-.23);group.add(carafe);cyl(.047,.19,0,.095,0,glass,'',carafe);cyl(.027,.07,0,.225,0,glass,'',carafe);
 // Beyaz peynir: six visibly separate soft white cheese blocks on a ceramic plate.
 const cheese=new THREE.Group();cheese.name='beyaz-peynir-plate';cheese.position.set(x-.22,y+.012,z+.16);group.add(cheese);cyl(.115,.014,0,0,0,white,'peynir-serving-plate',cheese);const feta=mat('#fffce9');for(let i=0;i<6;i++){const a=(i%3-1)*.053,b=(Math.floor(i/3)-.5)*.052;box(.043,.034,.043,a,.025,b,feta,'beyaz-peynir',cheese);for(const offset of[-.01,.012])box(.001,.001,.028,a+offset,.0425,b,mat('#e1ddc8'),'cheese-texture',cheese);}
 // Kavun wedges: pale yellow-green melon flesh with a dark green rind.
 const melon=new THREE.Group();melon.name='kavun-melon-plate';melon.position.set(x+.16,y+.012,z+.08);group.add(melon);cyl(.14,.014,0,0,0,white,'melon-serving-plate',melon);
 function halfDisk(radius){const shape=new THREE.Shape();shape.moveTo(-radius,0);shape.lineTo(radius,0);shape.absarc(0,0,radius,0,Math.PI,false);shape.closePath();return shape;}
 for(let i=0;i<3;i++){const slice=new THREE.Group();slice.name='kavun-slice';slice.position.set(-.06+i*.06,.018+i*.003,-.025+i*.015);slice.rotation.y=i*.28-.25;melon.add(slice);const rind=mesh(new THREE.ExtrudeGeometry(halfDisk(.082),{depth:.021,bevelEnabled:false,curveSegments:20}),mat('#72904a'),'green-melon-rind',0,0,0,slice);rind.rotation.x=-Math.PI/2;const flesh=mesh(new THREE.ExtrudeGeometry(halfDisk(.073),{depth:.024,bevelEnabled:false,curveSegments:20}),mat('#e8e9a0'),'kavun-flesh',0,.002,0,slice);flesh.rotation.x=-Math.PI/2;}
 // Freestanding Kara Kartal sculpture with raised, feathered wings.
 const statue=new THREE.Group();statue.name='besiktas-eagle-statue';statue.position.set(6.4,0,10.55);group.add(statue);
 box(.46,.70,.46,0,.35,0,black,'eagle-display-plinth',statue);box(.49,.035,.49,0,.7175,0,gold,'plinth-trim',statue);obstacle('eagle-statue-plinth',6.4,10.55,.50,.50);
 const bronze=mat('#27292a',{metalness:.65,roughness:.43});cyl(.11,.08,0,.775,0,bronze,'eagle-rock-base',statue);
 const body=mesh(new THREE.SphereGeometry(1,24,18),bronze,'eagle-body',0,1.02,0,statue);body.scale.set(.10,.21,.095);
 const head=mesh(new THREE.SphereGeometry(.064,20,16),bronze,'eagle-head',0,1.255,.033,statue);head.scale.y=1.15;
 const beak=mesh(new THREE.ConeGeometry(.028,.075,12),gold,'eagle-beak',0,1.25,.105,statue);beak.rotation.x=Math.PI/2;
 for(const side of[-1,1]){
  const wing=new THREE.Shape();wing.moveTo(side*.055,.99);wing.lineTo(side*.19,1.28);wing.lineTo(side*.47,1.48);wing.lineTo(side*.43,1.26);wing.lineTo(side*.29,1.11);wing.lineTo(side*.13,.98);wing.closePath();mesh(new THREE.ExtrudeGeometry(wing,{depth:.038,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:1}),bronze,'eagle-raised-wing',0,0,-.02,statue);
  for(let i=0;i<6;i++){const f=box(.037,.22-i*.014,.025,side*(.19+i*.045),1.17+i*.045,.025,bronze,'eagle-feather',statue);f.rotation.z=-side*(.42+i*.08);}
  cyl(.014,.10,side*.045,.84,.025,gold,'eagle-leg',statue);
 }
 return {group,obstacles};
}
