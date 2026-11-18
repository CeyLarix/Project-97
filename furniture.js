import {addKerPinkArt} from './ker-art.js';
import {addYoriRug} from './yori-rug.js';
import {addLivingFlowerLamp} from './flower-lamp.js';
import {addLivingPlisses} from './plisse.js';
import { furnishKitchen } from './kitchen.js';
import { furnishMancave } from './mancave.js';
import * as THREE from './assets/three.module.js';

// All sizes in metres; furniture is an interior proposal, independent of the shell.
export function furnish(scene, shared = {}, options = {}) {
  const obstacles = [], kitchenMaterials = [], lights = [];
  const existingChildren = new Set(scene.children);
  let seed = 97;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const mat = (color, roughness = .82, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  const cream = shared.fabric || mat('#ddd4c5'), fabric = shared.fabric || mat('#c7bba6'), cushion = shared.fabric || mat('#e7dece'), darkCushion = shared.secondaryFabric || mat('#867d65');
  const bronze = shared.metal || mat('#3c3830', .43, { metalness: .55 }), black = mat('#282925', .58);
  const stone = shared.stone || mat('#e8e3d9', .4), ceramic = shared.accent || mat('#b8aa96', .65), paper = mat('#eee7da');
  const cabinet = shared.cabinet || mat('#b6aa96', .65); kitchenMaterials.push(cabinet);
  function grainTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 512;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#a58d69'; ctx.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 520; i++) {
      const x = rnd() * 256; ctx.beginPath(); ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + rnd() * 9 - 4, 160, x + rnd() * 12 - 6, 350, x, 512);
      ctx.strokeStyle = `rgba(${rnd() > .5 ? '65,44,22' : '228,206,167'},${.03 + rnd() * .13})`;
      ctx.lineWidth = .3 + rnd(); ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }
  const oak = shared.wood || mat('#d3c5a7', .73, { map: grainTexture() }); if(!oak.map)oak.map=grainTexture();
  const walnut = shared.wood ? shared.wood.clone() : mat('#79664e', .7, { map: grainTexture() }); walnut.userData.role='wood';
  const geoCache = new Map();
  function roundedGeo(w,h,d,r=.04) {
    const k = [w,h,d,r].join(); if (geoCache.has(k)) return geoCache.get(k);
    r = Math.min(r,w/2-.001,h/2-.001,d/2-.001); r = Math.max(.001,r);
    const s = new THREE.Shape(), x = -w/2, y = -h/2;
    s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.quadraticCurveTo(x+w,y,x+w,y+r);
    s.lineTo(x+w,y+h-r); s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    s.lineTo(x+r,y+h); s.quadraticCurveTo(x,y+h,x,y+h-r);
    s.lineTo(x,y+r); s.quadraticCurveTo(x,y,x+r,y);
    const g = new THREE.ExtrudeGeometry(s, {depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:r,bevelThickness:r,curveSegments:4});
    g.translate(0,0,-d/2+r); g.computeVertexNormals(); geoCache.set(k,g); return g;
  }
  function box(w,h,d,x,y,z,m=cream,r=0) {
    const mesh = new THREE.Mesh(r ? roundedGeo(w,h,d,r) : new THREE.BoxGeometry(w,h,d),m);
    mesh.position.set(x,y,z); mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh); return mesh;
  }
  function cylinder(rt,rb,h,x,y,z,m=oak,n=28) {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),m); o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o;
  }
  function sphere(x,y,z,sx,sy,sz,m) {
    const o = new THREE.Mesh(new THREE.SphereGeometry(1,14,10),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;scene.add(o);return o;
  }
  function obstacle(x,z,w,d) { obstacles.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2}); }
  function leg(x,z,height=.4) { cylinder(.018,.014,height,x,height/2+.04,z,bronze,10); }
  function book(x,y,z,w=.12,h=.25,d=.19,color='#8f8c79') { return box(w,h,d,x,y+h/2,z,mat(color),.005); }
  function vase(x,y,z,scale=1) {
    cylinder(.065*scale,.095*scale,.19*scale,x,y+.095*scale,z,ceramic);
    cylinder(.045*scale,.065*scale,.1*scale,x,y+.24*scale,z,ceramic);
    for(let i=0;i<4;i++) {
      const stem = cylinder(.003,.003,.42*scale,x+(rnd()-.5)*.04,y+.47*scale,z+(rnd()-.5)*.04,mat('#6c7056'),6);
      stem.rotation.z=(rnd()-.5)*.4;
      const leaf=sphere(x+(rnd()-.5)*.2,y+(.55+rnd()*.15)*scale,z+(rnd()-.5)*.13,.06*scale,.09*scale,.022*scale,mat('#7e8562'));
      leaf.rotation.z=(rnd()-.5)*1.4;
    }
  }
  function plant(x,z,size=1) {
    cylinder(.16*size,.12*size,.3*size,x,.15*size,z,mat('#c9bba6'));
    cylinder(.145*size,.145*size,.012,x,.3*size,z,mat('#51483b'));
    const leafMat=mat('#59664b');
    for(let i=0;i<15;i++) {
      const a=i*2.3999,r=(.12+rnd()*.22)*size,h=(.6+rnd()*.5)*size;
      const stem=cylinder(.006,.008,h-.24*size,x+Math.cos(a)*r*.4,(h+.24*size)/2,z+Math.sin(a)*r*.4,mat('#69704c'),6);
      stem.rotation.z=Math.cos(a)*.18;stem.rotation.x=Math.sin(a)*.18;
      const l=sphere(x+Math.cos(a)*r,h,z+Math.sin(a)*r,.095*size,.22*size,.028*size,leafMat);
      l.rotation.set(Math.sin(a)*.65,a,Math.cos(a)*.65);
    }
  }
  // Keep only a wall-length sofa and the integrated cinewall in the living room.
  if (!options.skipSofa) {
    box(.94,.32,4.30,.74,.35,2.275,fabric,.035).name='living-fallback-sofa';
    box(.18,.72,4.30,.28,.72,2.275,fabric,.035);
    for(const z of [.20,4.35])box(.94,.48,.14,.74,.59,z,fabric,.025);
    for(let i=0;i<5;i++){
      box(.70,.19,.78,.79,.58,.61+i*.83,cushion,.035);
      const back=box(.18,.45,.78,.43,.88,.61+i*.83,fabric,.035);back.rotation.z=-.1;
    }
  }
  obstacle(.80,2.275,1.34,4.40);
  addYoriRug(scene);
  addKerPinkArt(scene);
  // Oldinn Rome set: chestnut mango, round tops and tapered fluted pedestals.
  const romeWood=mat('#80543d',.72,{map:grainTexture()});
  function romeTable(name,diameter,height,x,z){
    const parts=new Set(scene.children);
    const top=new THREE.LatheGeometry([new THREE.Vector2(0,height-.025),new THREE.Vector2(diameter/2-.015,height-.025),new THREE.Vector2(diameter/2,height-.012),new THREE.Vector2(diameter/2-.003,height),new THREE.Vector2(0,height)],64);
    const surface=new THREE.Mesh(top,romeWood);surface.position.set(x,0,z);surface.castShadow=surface.receiveShadow=true;scene.add(surface);
    const baseGeo=new THREE.CylinderGeometry(.15,.20,height-.03,192,1,false);
    const positions=baseGeo.attributes.position;
    for(let i=0;i<positions.count;i++){const px=positions.getX(i),pz=positions.getZ(i),r=Math.hypot(px,pz);if(r>.01){const flute=1+.025*Math.cos(Math.atan2(pz,px)*64);positions.setX(i,px*flute);positions.setZ(i,pz*flute);}}
    baseGeo.computeVertexNormals();const base=new THREE.Mesh(baseGeo,romeWood);base.position.set(x,(height-.03)/2,z);base.castShadow=base.receiveShadow=true;scene.add(base);
    const g=new THREE.Group();g.name=name;g.userData.reference='Oldinn Salontafel Rome';g.userData.dimensions={diameter,height};g.position.y=.016;
    for(const o of [...scene.children])if(!parts.has(o)){scene.remove(o);g.add(o)}scene.add(g);
    obstacle(x,z,diameter,diameter);
  }
  romeTable('rome-coffee-table-80',.80,.39,2.30,2.12);
  romeTable('rome-coffee-table-60',.60,.52,2.48,2.75);
  const flowerPendant=addLivingFlowerLamp(scene);lights.push(flowerPendant.light);
  // Arliwalls Beige X Linnen reference, enlarged proportionally for the 108-inch TV.
  const linenCanvas=document.createElement('canvas');linenCanvas.width=linenCanvas.height=256;
  const lc=linenCanvas.getContext('2d');lc.fillStyle='#d9cebb';lc.fillRect(0,0,256,256);
  for(let i=0;i<256;i+=2){
    lc.fillStyle=i%6?'rgba(255,248,230,.14)':'rgba(103,86,62,.13)';
    lc.fillRect(i,0,1,256);lc.fillRect(0,i,256,1);
  }
  const linenTexture=new THREE.CanvasTexture(linenCanvas);linenTexture.colorSpace=THREE.SRGBColorSpace;
  linenTexture.wrapS=linenTexture.wrapT=THREE.RepeatWrapping;linenTexture.repeat.set(5,3);
  const linen=mat('#eee5d5',.98,{map:linenTexture,bumpMap:linenTexture,bumpScale:.002});
  const beige=mat('#cfc1aa',.8);
  const cinewall=box(.018,1.65,2.90,5.30,1.625,2.25,linen);cinewall.name='living-cinewall';
  cinewall.userData.reference='Arliwalls Japandi Beige X Linnen';
  cinewall.userData.proportionalAdaptation=true;
  const led=mat('#ffe4b6',.5,{emissive:'#ffd398',emissiveIntensity:1.3});
  // The narrow warm halo sits between the floating linen panel and the wall.
  box(.014,1.69,2.94,5.318,1.625,2.25,led,.009).name='living-cinewall-warm-halo';
  const tv=box(.055,1.35,2.40,5.245,1.625,2.25,black,.012);tv.name='living-tv';
  box(.006,1.295,2.34,5.213,1.625,2.25,mat('#182022',.23,{metalness:.18})).name='living-tv-screen';
  const bench=new THREE.Group();bench.name='living-tv-console';scene.add(bench);
  const consolePart=o=>{scene.remove(o);bench.add(o);return o;};
  // Rounded ends in plan, three handleless linen fronts, softly inset toe shadow.
  consolePart(box(.44,.32,2.76,5.12,.46,2.25,beige));
  for(const z of[.87,3.63])consolePart(cylinder(.22,.22,.32,5.12,.46,z,beige,48));
  for(let i=0;i<3;i++)consolePart(box(.014,.277,.888,4.892,.46,1.35+i*.90,linen,.003));
  box(.018,.012,2.98,4.94,.29,2.25,led).name='living-console-underlight';
  obstacle(5.13,2.25,.49,3.22);
  // Reverse only the living arrangement in local plan coordinates. The shell's
  // existing houseRoot reflection is independent and remains unchanged.
  const livingGroup=new THREE.Group();livingGroup.name='living-arrangement';
  livingGroup.position.x=5.4;livingGroup.scale.x=-1;livingGroup.userData.mirrorX=5.4;
  const intoLiving=o=>{scene.remove(o);livingGroup.add(o);return o;};
  for(const child of [...scene.children])if(!existingChildren.has(child))intoLiving(child);
  scene.add(livingGroup);
  for(const o of obstacles){const minX=o.minX;o.minX=5.4-o.maxX;o.maxX=5.4-minX;o.living=true;}
  // A slim oval dining table with a space-saving upholstered wall bench.
  const diningX=1.10,diningZ=11.8;
  const diningChildren=new Set(scene.children);
  const diningGroup=new THREE.Group();diningGroup.name='dining-set-in-kitchen';
  diningGroup.userData.feature='relocated-dining-set';
  diningGroup.userData.tableCenter={x:diningX,z:diningZ};
  const dt=cylinder(.325,.325,.055,diningX,.76,diningZ,oak,64);dt.scale.z=3.2/.65;dt.name='original-oval-dining-table';
  for(const z of[diningZ-.80,diningZ+.80]){const base=cylinder(.17,.23,.7,diningX,.37,z,walnut,32);base.scale.z=1.25;}
  obstacle(diningX,diningZ,.65,3.20);
  function chair(x,z,angle=0,material=cream) {
    const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;scene.add(g);
    const add=(o)=>{scene.remove(o);g.add(o);return o;};
    add(box(.44,.095,.43,0,.47,0,material,.035));
    const back=add(box(.44,.43,.065,0,.71,-.205,material,.03));back.rotation.x=-.1;
    for(const xx of [-.17,.17])for(const zz of [-.16,.16])add(cylinder(.016,.012,.43,xx,.23,zz,walnut,10));
    const sn=Math.abs(Math.sin(angle)),cs=Math.abs(Math.cos(angle));
    obstacle(x,z,.44*cs+.48*sn,.48*cs+.44*sn);
    return g;
  }
  // Replace the wall-side chairs with one continuous Japandi dining sofa.
  const diningBench=new THREE.Group();diningBench.name='kitchen-wall-chill-bench';
  diningBench.userData.feature='upholstered-wall-dining-bench';scene.add(diningBench);
  const diningBenchPart=o=>{scene.remove(o);diningBench.add(o);return o;};
  diningBenchPart(box(.48,.27,3.08,.37,.205,diningZ,oak,.025));
  diningBenchPart(box(.55,.14,3.12,.395,.43,diningZ,cream,.035));
  diningBenchPart(box(.14,.54,3.12,.16,.70,diningZ,cream,.035));
  for(const dz of[-1.04,0,1.04]){
    const pad=diningBenchPart(box(.13,.35,.93,.27,.715,diningZ+dz,cushion,.035));
    pad.rotation.z=.12;
  }
  for(const dz of[-1.48,1.48])diningBenchPart(box(.5,.17,.12,.38,.56,diningZ+dz,cream,.025));
  obstacle(.38,diningZ,.66,3.16);
  const diningChairs=[];for(const z of[diningZ-1.05,diningZ,diningZ+1.05]){diningChairs.push(chair(diningX+.545,z,-Math.PI/2));}
  diningChairs.forEach((o,i)=>{o.name='original-dining-chair-'+(i+1);});
  vase(diningX,.79,diningZ,.7);
  // Seven individual pendants on one oval ceiling plate, aligned with the table.
  const pendant=new THREE.Group();pendant.name='dining-seven-pendant-lamp';
  pendant.userData.feature='oval-plate-four-ribbed-three-slim';scene.add(pendant);
  const lampPart=o=>{scene.remove(o);pendant.add(o);return o;};
  const plate=lampPart(cylinder(.29,.29,.035,diningX,2.675,diningZ,bronze,64));
  plate.scale.z=4.05;plate.name='dining-oval-ceiling-plate';
  const amber=mat('#c69b62',.38,{metalness:.13,emissive:'#ffbb65',emissiveIntensity:.22,side:THREE.DoubleSide});
  const diffuser=mat('#f7dfb0',.5,{emissive:'#ffd18a',emissiveIntensity:.75});
  // Physical fluting is part of the mesh: 36 rounded ribs, four samples per rib.
  // All four shades share this geometry and materials, avoiding dozens of meshes.
  const ribbedGeo=new THREE.LatheGeometry([
    new THREE.Vector2(.13,-.13),new THREE.Vector2(.16,-.12),
    new THREE.Vector2(.175,-.075),new THREE.Vector2(.175,.06),
    new THREE.Vector2(.16,.11),new THREE.Vector2(.125,.13)
  ],144);
  const ribPositions=ribbedGeo.attributes.position;
  for(let i=0;i<ribPositions.count;i++){
    const x=ribPositions.getX(i),z=ribPositions.getZ(i);
    const rib=1+.045*Math.cos(Math.atan2(x,z)*36);
    ribPositions.setXYZ(i,x*rib,ribPositions.getY(i),z*rib);
  }
  ribbedGeo.computeVertexNormals();
  const shades=[[-.14,-.51,2.15],[.14,-.17,2.04],[-.14,.17,2.12],[.14,.51,2.00]];
  shades.forEach(([dx,dz,y],i)=>{
    const x=diningX+dx,z=diningZ+dz;
    const g=new THREE.Group();g.name='dining-ribbed-shade-'+(i+1);
    g.userData.feature='warm-ribbed-shade';pendant.add(g);
    const shade=new THREE.Mesh(ribbedGeo,amber);shade.position.set(x,y,z);shade.castShadow=true;g.add(shade);
    const suspension=lampPart(cylinder(.0035,.0035,2.655-y-.14,x,(2.655+y+.14)/2,z,bronze,8));
    pendant.remove(suspension);g.add(suspension);
    const cap=lampPart(cylinder(.032,.032,.035,x,y+.14,z,bronze,16));pendant.remove(cap);g.add(cap);
    const glow=lampPart(cylinder(.12,.12,.009,x,y-.12,z,diffuser,40));pendant.remove(glow);g.add(glow);
  });
  [[.12,-.49,1.83],[-.14,-.16,1.94],[-.10,.48,1.76]].forEach(([dx,dz,bottom],i)=>{
    const x=diningX+dx,z=diningZ+dz,h=.22;
    const g=new THREE.Group();g.name='dining-slim-pendant-'+(i+1);
    g.userData.feature='slim-pendant';g.userData.bottomHeight=bottom;pendant.add(g);
    const body=lampPart(cylinder(.015,.015,h-.045,x,bottom+.045+(h-.045)/2,z,bronze,16));pendant.remove(body);g.add(body);
    const tip=lampPart(cylinder(.015,.015,.045,x,bottom+.0225,z,diffuser,16));pendant.remove(tip);g.add(tip);
    const wire=lampPart(cylinder(.0025,.0025,2.655-bottom-h,x,(2.655+bottom+h)/2,z,bronze,8));pendant.remove(wire);g.add(wire);
  });
  const diningLight=new THREE.PointLight('#ffe1b2',9,4,2);diningLight.name='dining-pendant-light';diningLight.userData.diningPendant=true;
  diningLight.position.set(diningX,1.94,diningZ);pendant.add(diningLight);lights.push(diningLight);
  pendant.traverse(o=>{if(o!==pendant&&o.position.z)o.position.z=diningZ+(o.position.z-diningZ)*1.6;});
  // Group the relocated set without changing its original furniture/materials.
  for(const child of [...scene.children])if(!diningChildren.has(child)){
    scene.remove(child);diningGroup.add(child);
  }
  scene.add(diningGroup);
  // Selected kitchen follows the supplied layout and material photographs.
  const kitchen=furnishKitchen(scene,shared);
  // Preserve the chosen kitchen after correcting the core rear face to z=8.40 m.
  kitchen.group.position.z=.15;
  for(const o of kitchen.obstacles){o.minZ+=.15;o.maxZ+=.15;}
  obstacles.push(...kitchen.obstacles);lights.push(...kitchen.lights);
  const mirror = new THREE.Mesh(new THREE.CircleGeometry(.34,40),mat('#aab6ad',.15,{metalness:.8}));mirror.rotation.y=-Math.PI/2;mirror.position.set(5.3,1.5,6.55);scene.add(mirror);

  // Wall-mounted TV on the free core wall to the right of the island.
  // This uses the floor's plan frame, independently of the kitchen Z reflection.
  box(.24,.20,.025,3.75,1.65,8.417,black).name='kitchen-tv-wall-mount';
  const kitchenTV=box(1.24,.70,.045,3.75,1.65,8.45,black,.012);kitchenTV.name='kitchen-wall-tv';
  const kitchenScreen=mat('#243337',.24,{metalness:.12,emissive:'#132126',emissiveIntensity:.12});
  box(1.195,.655,.006,3.75,1.65,8.477,kitchenScreen,.006).name='kitchen-tv-screen';
  // The annex becomes a mancave; its existing shell and doors stay intact.
  const mancave=furnishMancave(scene,shared);obstacles.push(...mancave.obstacles);lights.push(...mancave.lights);
  // Full-height linen drapes, with folds cast into geometry.
  const curtainMat=mat('#e1d8c9',.95,{side:THREE.DoubleSide,transparent:true,opacity:.86});
  function curtain(x,z,width=.32) {
    const g=new THREE.PlaneGeometry(width,2.32,16,1),p=g.attributes.position;
    for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)/width*Math.PI*7)*.035);
    g.computeVertexNormals();const o=new THREE.Mesh(g,curtainMat);o.position.set(x,1.25,z);o.castShadow=true;scene.add(o);return o;
  }
  addLivingPlisses(scene);
  for(const x of [.3,2.55,4.42])curtain(x,13.45,.32);
  // Quiet abstract canvases add a domestic scale to long walls.
  function art(x,z,width,height,axis='x') {
    const c=document.createElement('canvas');c.width=256;c.height=320;const a=c.getContext('2d');
    a.fillStyle='#ddd6c6';a.fillRect(0,0,256,320);a.fillStyle='#a7a38b';a.beginPath();a.ellipse(90,190,90,150,.3,0,7);a.fill();
    a.fillStyle='#8b806b';a.beginPath();a.ellipse(200,240,95,115,-.3,0,7);a.fill();a.strokeStyle='#e8e1d1';a.lineWidth=6;a.beginPath();a.moveTo(80,320);a.bezierCurveTo(200,230,50,150,180,40);a.stroke();
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
    if(axis==='x') {box(.045,height+.05,width+.05,x,1.5,z,walnut);const p=new THREE.Mesh(new THREE.PlaneGeometry(width,height),mat('#ffffff',.9,{map:t}));p.rotation.y=Math.PI/2;p.position.set(x+.026,1.5,z);scene.add(p);}
    else {box(width+.05,height+.05,.045,x,1.5,z,walnut);const p=new THREE.Mesh(new THREE.PlaneGeometry(width,height),mat('#ffffff',.9,{map:t}));p.position.set(x,1.5,z+.026);scene.add(p);}
  }
  for (const child of scene.children) {
    if (existingChildren.has(child)) continue;
    child.traverse(o => { if (o.isMesh) {
      const materials=Array.isArray(o.material)?o.material:[o.material];
      o.castShadow=materials.every(m=>!m.transparent);
      o.receiveShadow=true;
    } });
  }
  return { kitchenMaterials, obstacles, lights };
}
