import {createJapandiGarden} from './japandi-garden.js';
import * as THREE from './assets/three.module.js';
import {createForecourt} from './forecourt.js';
import {PLOT97} from './plot97.js';

// Architectural context is intentionally quiet: it supplies real scale and a
// green outlook, while keeping attention on the interior materials.
export function createOutside(scene) {
  const group = new THREE.Group();
  group.name = 'Tuin en omgeving';
  let activeParent=group;const garden=new THREE.Group();garden.name='Tuin volgens situatietekening';group.add(garden);
  let seed = 19297;
  const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const canvasTexture = (paint, size = 512) => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d'); paint(ctx, size);
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 8;
    return tex;
  };
  const material = (color, extra = {}) => new THREE.MeshStandardMaterial({color, roughness: .92, ...extra});
  const box = (w,h,d,x,y,z,mat, parent=activeParent) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    m.position.set(x,y,z); m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  };
  const plane = (w,d,x,y,z,mat) => {
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);
    m.rotation.x=-Math.PI/2;m.position.set(x,y,z);m.receiveShadow=true;activeParent.add(m);return m;
  };
  const grain = canvasTexture((c,s)=>{
    c.fillStyle='#897d68';c.fillRect(0,0,s,s);
    for(let i=0;i<1800;i++) {const x=rand()*s;c.strokeStyle=`rgba(${rand()>.5?'201,185,151':'42,36,27'},${.02+rand()*.1})`;c.lineWidth=.3+rand()*.7;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+rand()*4,170,x-3,350,x+rand()*2,s);c.stroke();}
  });
  const timber=material('#d6c9b6',{map:grain,bumpMap:grain,bumpScale:.012});
  const pavingTexture = canvasTexture((c,s)=>{
    c.fillStyle='#b8b4aa';c.fillRect(0,0,s,s);
    for(let i=0;i<26000;i++){const v=130+Math.floor(rand()*75);c.fillStyle=`rgba(${v},${v-2},${v-7},${.06+rand()*.1})`;c.fillRect(rand()*s,rand()*s,1+rand()*2,1+rand()*2);}
  });
  const paving=material('#f1efea',{map:pavingTexture,bumpMap:pavingTexture,bumpScale:.008});
  const grout=material('#827e71');
  const soil=material('#514b3a');
  const grassTex=canvasTexture((c,s)=>{
    c.fillStyle='#677052';c.fillRect(0,0,s,s);
    for(let i=0;i<70000;i++){
      const x=rand()*s,y=rand()*s,l=2+rand()*10;
      const v=rand();c.strokeStyle=v<.3?'rgba(39,57,31,.29)':v<.7?'rgba(139,151,97,.24)':'rgba(183,177,123,.18)';
      c.lineWidth=.6+rand()*.8;c.beginPath();c.moveTo(x,y);c.lineTo(x+(rand()-.5)*4,y-l);c.stroke();
    }
  },1024);grassTex.repeat.set(5,4);
  const grass=material('#d7dec9',{map:grassTex,bumpMap:grassTex,bumpScale:.016});
  plane(140,140,18,-.09,5,material('#868974'));
  activeParent=garden;
  plane(8.9,9.5,4.3,-.045,18.3,soil);
  plane(7.4,5.9,4.25,-.023,19.55,grass);
  // Terrace: separate large slabs, six-millimetre joints and subtle variation.
  box(8.9,.07,2.88,4.3,-.066,15.08,grout);
  const tiles=[];for(let x=-.1;x<8.8;x+=.75)for(let z=13.65;z<16.52;z+=.72)tiles.push([x+.375,z+.36]);
  const slabs=new THREE.InstancedMesh(new THREE.BoxGeometry(.744,.045,.714),paving,tiles.length);
  const transform=new THREE.Object3D();
  tiles.forEach(([x,z],i)=>{transform.position.set(x,-.026,z);transform.updateMatrix();slabs.setMatrixAt(i,transform.matrix);const shade=.94+rand()*.09;slabs.setColorAt(i,new THREE.Color(shade,shade,shade));});
  slabs.castShadow=slabs.receiveShadow=true;activeParent.add(slabs);
  // A narrow path reaches the rear border, leaving a continuous lawn.
  for(let i=0;i<7;i++)box(.68,.04,.68,7.97,-.018,16.9+i*.78,paving);
  const fenceSlats=[];
  for(let x=-.36;x<9.05;x+=.145)fenceSlats.push([x,22.75,0]);
  for(let z=13.7;z<22.75;z+=.145){fenceSlats.push([-.42,z,Math.PI/2]);fenceSlats.push([9.03,z,Math.PI/2]);}
  const fenceMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.137,1.8,.024),timber,fenceSlats.length);
  fenceSlats.forEach(([x,z,angle],i)=>{transform.position.set(x,.875,z);transform.rotation.set(0,angle,0);transform.updateMatrix();fenceMesh.setMatrixAt(i,transform.matrix);const shade=.87+rand()*.2;fenceMesh.setColorAt(i,new THREE.Color(shade,shade*.99,shade*.96));});
  fenceMesh.castShadow=fenceMesh.receiveShadow=true;activeParent.add(fenceMesh);
  for(let x=-.42;x<9.1;x+=1.88)box(.09,1.91,.09,x,.91,22.76,timber);
  for(let z=13.7;z<22.85;z+=1.8){box(.09,1.91,.09,-.42,.91,z,timber);box(.09,1.91,.09,9.03,.91,z,timber);}
  box(9.55,.06,.06,4.3,1.79,22.75,timber);
  for(const x of [-.42,9.03])box(.06,.06,9.2,x,1.79,18.2,timber);

  const leafTex=canvasTexture((c,s)=>{
    c.clearRect(0,0,s,s);
    for(let i=0;i<135;i++){
      const x=s*(.1+rand()*.8),y=s*(.1+rand()*.8),l=13+rand()*28,w=6+rand()*12;
      c.save();c.translate(x,y);c.rotate(rand()*Math.PI*2);
      const g=c.createLinearGradient(-w,0,w,l);g.addColorStop(0,`hsl(${79+rand()*18},${19+rand()*14}%,${22+rand()*15}%)`);g.addColorStop(1,`hsl(87,26%,${35+rand()*13}%)`);
      c.fillStyle=g;c.beginPath();c.moveTo(0,-l/2);c.quadraticCurveTo(w,-l/4,w*.65,l*.18);c.quadraticCurveTo(w*.25,l*.45,0,l/2);c.quadraticCurveTo(-w,l*.14,-w*.7,-l*.1);c.quadraticCurveTo(-w*.35,-l*.35,0,-l/2);c.fill();
      c.strokeStyle='rgba(204,206,145,.18)';c.lineWidth=.6;c.beginPath();c.moveTo(0,-l/2);c.lineTo(0,l/2);c.stroke();c.restore();
    }
  });
  leafTex.wrapS=leafTex.wrapT=THREE.ClampToEdgeWrapping;
  const leaves=material('#e5e7d6',{map:leafTex,alphaTest:.43,side:THREE.DoubleSide,roughness:.95});
  const barkTex=canvasTexture((c,s)=>{
    c.fillStyle='#716652';c.fillRect(0,0,s,s);
    for(let i=0;i<1100;i++){c.strokeStyle=`rgba(${rand()>.5?'33,29,22':'177,160,126'},.16)`;c.lineWidth=.5+rand()*2;const x=rand()*s,y=rand()*s;c.beginPath();c.moveTo(x,y);c.lineTo(x+(rand()-.5)*4,y+rand()*95);c.stroke();}
  });
  const bark=material('#c1b5a0',{map:barkTex,bumpMap:barkTex,bumpScale:.035});
  const branch=(from,to,r1,r2)=>{
    const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),v=b.clone().sub(a);
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,v.length(),7),bark);
    mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());mesh.castShadow=true;activeParent.add(mesh);
  };
  const foliageCards=[];
  const tree=(x,z,h,spread)=>{
    branch([x,-.03,z],[x+.12,h*.71,z+.05],.1,.035);
    for(let i=0;i<12;i++){
      const a=i*2.4,reach=spread*(.4+rand()*.43),y=h*(.47+rand()*.28);
      branch([x+.08,y*.91,z],[x+Math.cos(a)*reach,y+reach*.52,z+Math.sin(a)*reach],.025,.006);
    }
    for(let i=0;i<155;i++){
      const angle=rand()*Math.PI*2,r=Math.sqrt(rand())*spread;
      const cy=h*.75+(rand()-.5)*h*.3 + .3*Math.cos(angle*3);
      foliageCards.push({x:x+Math.cos(angle)*r,y:cy,z:z+Math.sin(angle)*r*.77,s:.61+rand()*.55,rx:(rand()-.5)*2.5,ry:rand()*Math.PI*2,rz:rand()*Math.PI});
    }
  };
  tree(1.25,21.55,4.9,1.45);tree(7.5,21.1,4.6,1.25);tree(-3.2,17.8,5.6,1.9);tree(12.4,20.1,6.2,2.25);
  // Low planting lies along the fences, with varied leaf orientations rather
  // than solid balls; a few seed heads break the edge of the border.
  for(let i=0;i<145;i++){
    const side=i%2===0,x=side?.1+rand()*.3:8.5+rand()*.15,z=17+rand()*5.3;
    foliageCards.push({x,y:.24+rand()*.55,z,s:.38+rand()*.3,rx:(rand()-.5)*1.8,ry:rand()*Math.PI*2,rz:rand()*Math.PI});
  }
  const foliage=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),leaves,foliageCards.length);
  foliageCards.forEach((v,i)=>{transform.position.set(v.x,v.y,v.z);transform.rotation.set(v.rx,v.ry,v.rz);transform.scale.setScalar(v.s);transform.updateMatrix();foliage.setMatrixAt(i,transform.matrix);const shade=.82+rand()*.25;foliage.setColorAt(i,new THREE.Color(shade,shade,shade*.96));});
  transform.scale.setScalar(1);foliage.castShadow=foliage.receiveShadow=true;activeParent.add(foliage);
  const potMat=material('#9b9588');
  for(const [x,z,r] of [[.3,14.25,.25],[8.35,15.95,.32]]){
    const pot=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.78,.49,28),potMat);pot.position.set(x,.23,z);pot.castShadow=pot.receiveShadow=true;activeParent.add(pot);
    const top=new THREE.Mesh(new THREE.CylinderGeometry(r*.9,r*.9,.018,28),soil);top.position.set(x,.48,z);activeParent.add(top);
    for(let i=0;i<17;i++){
      const blade=new THREE.Mesh(new THREE.PlaneGeometry(.035,.65+rand()*.5),material(i%3===0?'#868d63':'#596650',{side:THREE.DoubleSide}));
      blade.position.set(x+(rand()-.5)*.24,.75,z+(rand()-.5)*.24);blade.rotation.set((rand()-.5)*.7,rand()*Math.PI,(rand()-.5)*.8);blade.castShadow=true;activeParent.add(blade);
    }
  }

  const sx=(PLOT97.maxX-PLOT97.minX)/(9.03+.42),sz=(PLOT97.rearZ-13.7)/(22.75-13.7);garden.scale.set(sx,1,sz);garden.position.set(PLOT97.minX+.42*sx,0,13.7*(1-sz));activeParent=group;

  garden.visible=false;const japandi=createJapandiGarden();group.add(japandi);
  const forecourt=createForecourt({paving,timber,soil,leaves});group.add(forecourt);group.userData.obstacles=[...forecourt.userData.obstacles,...japandi.userData.obstacles];
  const street=new THREE.Group();street.name='Straat buiten perceel';group.add(street);activeParent=street;
  // Modest street context at the front: pavement, road, and three brick homes.
  plane(110,1.8,4,-.03,-1.15,material('#aaa79d'));
  plane(110,5.4,4,-.055,-4.75,material('#686b69'));
  plane(110,1.75,4,-.03,-8.2,material('#b3b0a7'));
  street.position.z=PLOT97.frontZ+.25;
  scene.add(group);
  return group;
}
