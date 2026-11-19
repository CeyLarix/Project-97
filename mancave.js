import * as THREE from './assets/three.module.js';
// A measured, custom cabinet-wall proposal within the existing 3.00 × 3.55 m annex.
export function furnishMancave(parent,materials={}){
 const group=new THREE.Group();group.name='annex-workroom';group.userData.room='office';parent.add(group);
 const obstacles=[],lights=[],cache=new Map();
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.84,...extra});
 const oak=materials.wood?.clone()||mat('#aa8968');delete oak.userData.role;
 const sand=mat('#d4cab8'),fabric=mat('#c8bdab'),cushion=mat('#e7dfd0'),black=mat('#272724'),darkOak=mat('#63442e'),groove=mat('#3c2a20'),metal=mat('#77796f',{metalness:.5,roughness:.45});
 function rounded(w,h,d,r){const key=[w,h,d,r].join();if(cache.has(key))return cache.get(key);r=Math.min(r,w/4,h/4,d/4);const x=-w/2+r,y=-h/2+r,iw=w-2*r,ih=h-2*r,rr=Math.min(r,iw/4,ih/4),s=new THREE.Shape();s.moveTo(x+rr,y);s.lineTo(x+iw-rr,y);s.quadraticCurveTo(x+iw,y,x+iw,y+rr);s.lineTo(x+iw,y+ih-rr);s.quadraticCurveTo(x+iw,y+ih,x+iw-rr,y+ih);s.lineTo(x+rr,y+ih);s.quadraticCurveTo(x,y+ih,x,y+ih-rr);s.lineTo(x,y+rr);s.quadraticCurveTo(x,y,x+rr,y);const geo=new THREE.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:3,curveSegments:5,steps:1});geo.translate(0,0,-d/2+r);cache.set(key,geo);return geo;}
 function box(w,h,d,x,y,z,m=sand,name='',p=group,r=0){const o=new THREE.Mesh(r?rounded(w,h,d,r):new THREE.BoxGeometry(w,h,d),m);o.name=name;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o;}
 function cyl(r,h,x,y,z,m=black,p=group){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o;}
 function obstacle(name,x,z,w,d){const o={name,mancave:true,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2};obstacles.push(o);return o;}
 const wall=new THREE.Group();wall.name='workroom-full-cabinet-wall';wall.userData.dimensions={width:2.92,depth:.65,height:2.68};wall.userData.type='maatwerkvoorstel';group.add(wall);
 // A continuous top, side fillers and recessed plinth tie all three functions together.
 box(2.92,.08,.65,7.32,2.64,10.425,sand,'cabinet-wall-cornice',wall);
 for(const x of[5.87,7.07,7.69,8.77])box(.02,2.60,.65,x,1.30,10.425,sand,'cabinet-wall-end-panel',wall);
 box(2.92,.085,.06,7.32,.0425,10.65,black,'cabinet-wall-recessed-plinth',wall);
 // Retain the selected IKEA BESTÅ on its exact 120 × 42 × 202 cm product envelope.
 const besta=new THREE.Group();besta.name='ikea-besta-19421699';besta.position.set(6.46,0,10.53);besta.userData={brand:'IKEA',range:'BESTÅ',productNumber:'194.216.99',dimensions:{width:1.20,depth:.42,height:2.02},sourceUrl:'https://www.ikea.com/nl/nl/p/besta-opberger-met-deuren-zwartbruin-bjorkoviken-bruin-gebeitst-eiken-fineer-s19421699/'};wall.add(besta);
 for(const x of[-.591,0,.591])box(.018,1.92,.40,x,1.06,-.01,black,'',besta);
 for(const y of[.109,2.011])box(1.2,.018,.40,0,y,-.01,black,'',besta);
 box(1.164,1.884,.012,0,1.06,-.204,black,'',besta);
 for(const y of[.43,.75,1.07,1.39,1.71])for(const x of[-.3,.3])box(.564,.018,.36,x,y,-.03,black,'',besta);
 for(const y of[.42,1.06,1.70]){box(.596,.638,.018,.3,y,.201,darkOak,'besta-bjorkoviken-door',besta);for(let i=0;i<24;i++)box(.003,.626,.002,.013+i*.025,y,.209,groove,'',besta);}
 for(const x of[-.54,0,.54])for(const z of[-.15,.15])box(.04,.10,.04,x,.05,z,black,'',besta);
 box(1.18,.56,.62,6.46,2.31,10.42,sand,'besta-custom-upper-storage',wall);
 box(.012,.50,.012,6.46,2.31,10.739,groove,'upper-door-joint',wall);
 obstacle('ikea-besta-19421699',6.46,10.425,1.2,.65);
 // 60 cm appliance bay for a standard integrated fridge/freezer, with separate doors.
 const fridge=new THREE.Group();fridge.name='workroom-fridge-freezer';fridge.userData.dimensions={moduleWidth:.64,moduleDepth:.65,applianceHeight:1.78};fridge.userData.type='inbouw koel-vriescombinatie, maatvoorstel';wall.add(fridge);
 box(.56,1.78,.55,7.38,.98,10.40,mat('#d2d4cf'),'integrated-fridge-freezer-body',fridge);
 box(.592,1.14,.022,7.38,1.33,10.739,sand,'integrated-fridge-door',fridge);
 box(.592,.64,.022,7.38,.425,10.739,sand,'integrated-freezer-door',fridge);
 for(const y of[.73,.77])box(.42,.014,.008,7.38,y,10.754,black,'appliance-recessed-grip',fridge);
 box(.592,.67,.62,7.38,2.255,10.42,sand,'fridge-upper-storage',wall);
 for(let i=0;i<9;i++)box(.035,.016,.008,7.18+i*.05,.11,10.716,black,'fridge-vent-slot',fridge);
 obstacle('workroom-fridge-freezer',7.38,10.425,.64,.65);
 // A warm oak work niche with an under-cabinet light; no extra expensive point lights.
 const desk=new THREE.Group();desk.name='workroom-desk';desk.userData.dimensions={width:1.06,depth:.60,height:.75};wall.add(desk);
 box(1.06,.035,.60,8.24,.7325,10.43,oak,'work-niche-desktop',desk);
 box(1.06,1.72,.015,8.24,.96,10.115,darkOak,'work-niche-oak-back',wall);
 box(1.06,.78,.34,8.24,2.21,10.565,sand,'work-niche-overhead-storage',wall);
 box(.012,.74,.012,8.24,2.21,10.742,groove,'overhead-door-joint',wall);
 box(.95,.012,.012,8.24,1.81,10.64,mat('#ffdfad',{emissive:'#ffddaa',emissiveIntensity:.65}),'work-niche-led',wall);
 box(.16,.014,.13,8.24,.757,10.36,black);box(.035,.14,.035,8.24,.83,10.31,black);
 box(.54,.32,.03,8.24,1.06,10.31,black,'workroom-monitor');
 box(.51,.29,.004,8.24,1.06,10.327,mat('#344c51',{emissive:'#1d353a',emissiveIntensity:.12}));
 box(.40,.018,.14,8.20,.759,10.64,black,'workroom-keyboard');box(.05,.022,.075,8.48,.761,10.64,black,'workroom-mouse');
 obstacle('workroom-desk',8.24,10.43,1.06,.60);
 const chair=new THREE.Group();chair.name='workroom-task-chair';group.add(chair);
 box(.49,.08,.46,8.24,.46,11.20,fabric,'',chair,.03);box(.47,.47,.06,8.24,.75,11.42,fabric,'',chair,.02);
 for(const x of[7.98,8.50]){box(.025,.20,.025,x,.57,11.20,metal,'',chair);box(.045,.025,.30,x,.68,11.20,black,'',chair,.008);}
 cyl(.035,.35,8.24,.25,11.20,metal,chair);
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5,leg=box(.03,.025,.31,8.24+Math.sin(a)*.14,.07,11.20+Math.cos(a)*.14,metal,'',chair);leg.rotation.y=a;cyl(.027,.035,8.24+Math.sin(a)*.28,.027,11.20+Math.cos(a)*.28,black,chair).rotation.z=Math.PI/2;}
 obstacle('workroom-chair',8.24,11.20,.64,.66);
 // TV stays on the solid wall before the kitchen doorway; only a shallow floating shelf below.
 const tv=new THREE.Group();tv.name='mancave-tv';tv.position.set(5.94,1.48,11.43);tv.rotation.y=Math.PI/2;group.add(tv);
 box(1.19,.70,.045,0,0,0,black,'workroom-wall-tv',tv,.01);
 box(1.14,.65,.006,0,.003,.026,mat('#152427',{emissive:'#204442',emissiveIntensity:.15}),'mancave-tv-screen',tv);
 box(.20,.20,1.20,5.98,.50,11.43,darkOak,'workroom-tv-cabinet',group,.012);
 obstacle('workroom-tv-cabinet',5.98,11.43,.22,1.22);
 // Compact 140 cm sleeper sofa. Open outer footprint is 208 × 140 cm.
 const sofa=new THREE.Group();sofa.name='workroom-sleeper-sofa';sofa.userData.dimensions={sofa:{width:1.40,depth:.84,height:.84},bed:{width:1.20,length:2.00},openOuter:{width:1.40,depth:2.08}};group.add(sofa);
 box(.84,.25,1.40,8.36,.245,12.44,fabric,'sofa-base',sofa,.035);
 box(.13,.60,1.40,8.715,.54,12.44,fabric,'sofa-back-frame',sofa,.035);
 for(const z of[11.805,13.075])box(.82,.39,.13,8.36,.445,z,fabric,'sofa-arm',sofa,.025);
 for(const x of[8.07,8.65])for(const z of[11.88,13.0])box(.035,.12,.035,x,.06,z,darkOak,'sofa-leg',sofa);
 const closed=new THREE.Group();closed.name='sleeper-closed-cushions';sofa.add(closed);
 for(const z of[12.12,12.76]){box(.62,.13,.59,8.28,.435,z,cushion,'seat-cushion',closed,.035);box(.15,.31,.59,8.61,.665,z,fabric,'back-cushion',closed,.025);}
 const bed=new THREE.Group();bed.name='sleeper-open-bed';bed.visible=false;sofa.add(bed);
 box(2.08,.12,1.40,7.74,.32,12.44,darkOak,'extended-bed-frame',bed,.025);
 box(2.00,.13,1.20,7.74,.445,12.44,cushion,'sleeper-mattress',bed,.025);
 for(const z of[11.91,12.97])box(.035,.26,.035,6.79,.13,z,darkOak,'bed-support-leg',bed);
 for(const z of[12.13,12.75])box(.39,.09,.43,8.40,.555,z,mat('#f3ede1'),'sleeping-pillow',bed,.035);
 box(1.20,.025,1.18,7.33,.525,12.44,mat('#a79c85'),'bed-throw',bed,.01);
 const sofaObstacle=obstacle('workroom-sleeper-sofa',8.36,12.44,.84,1.40);
 let sleepMode=false;
 group.userData.setSleepMode=enabled=>{sleepMode=Boolean(enabled);bed.visible=sleepMode;closed.visible=!sleepMode;sofaObstacle.minX=sleepMode?6.70:7.94;sofaObstacle.maxX=8.78;return sleepMode;};
 group.userData.getSleepMode=()=>sleepMode;
 group.userData.design={cabinetWall:{width:2.92,depth:.65,height:2.68},desk:{width:1.06,depth:.60,height:.75},minimumBedAisle:.60,description:'Zandkleurig maatwerk met donker eiken, geïntegreerde werkplek, BESTÅ en koel-vriescombinatie.'};
 return {group,obstacles,lights};
}
