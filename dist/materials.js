import * as THREE from './assets/three.module.js';
export function createMaterials(style){
 const c=style.colors,m={};
 for(const [role,color]of Object.entries(c)){const mat=new THREE.MeshStandardMaterial({color,roughness:['wall','ceiling','fabric','rug'].includes(role)?.95:.7});mat.name=role;mat.userData.role=role;m[role]=mat;}
 m.fabric=new THREE.MeshPhysicalMaterial({color:c.fabric,roughness:.95,sheen:.5,sheenRoughness:.9,sheenColor:'#ebe3d7'});m.fabric.userData.role='fabric';m.fabric.name='fabric';
 m.secondaryFabric=new THREE.MeshPhysicalMaterial({color:c.secondaryFabric,roughness:.92,sheen:.5,sheenRoughness:.9});m.secondaryFabric.userData.role='secondaryFabric';
 m.metal.metalness=.55;m.metal.roughness=.4;m.stone.roughness=.5;
 m.trim=new THREE.MeshStandardMaterial({color:c.ceiling,roughness:.7});m.trim.userData.role='ceiling';
 m.ceramic=new THREE.MeshStandardMaterial({color:'#eeeae0',roughness:.25});m.glass=new THREE.MeshPhysicalMaterial({color:'#dce6df',roughness:.03,metalness:0,transparent:true,opacity:.12,depthWrite:false});
 const loader=new THREE.TextureLoader();
 const load=(name,repeat,colour=false)=>{const t=loader.load('assets/pbr/'+name);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=4;if(colour)t.colorSpace=THREE.SRGBColorSpace;return t;};
 const plaster=load('plaster-normal.jpg',1.4);m.wall.normalMap=plaster;m.wall.normalScale.set(.16,.16);m.wall.roughnessMap=load('plaster-roughness.jpg',1.4);
 for(const role of ['fabric','secondaryFabric','rug']){m[role].normalMap=load('linen-normal.jpg',3);m[role].normalScale.set(.3,.3);m[role].roughnessMap=load('linen-roughness.jpg',3);}
 m.stone.map=load('marble-color.jpg',1,true);m.stone.normalMap=load('marble-normal.jpg',1);m.stone.normalScale.set(.12,.12);m.stone.roughnessMap=load('marble-roughness.jpg',1);
 Object.assign(m,createKitchenMaterials());
 return m;
}
export function applyStyle(materials,style){for(const [role,color]of Object.entries(style.colors)){const m=materials[role];if(m?.color)m.color.set(color);}materials.trim.color.set(style.colors.ceiling);materials.metal.roughness=style.materials.metalRoughness;materials.metal.metalness=style.materials.metalness;materials.stone.roughness=style.materials.stoneRoughness;}

// Source-fixed kitchen finishes, approximated from the supplied design and sample board.
// These deliberately have no style role: the user's selected kitchen remains in all palettes.
export function createKitchenMaterials(){
 let seed=1797;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const ctx=canvas.getContext('2d');ctx.fillStyle='#e6dbca';ctx.fillRect(0,0,1024,1024);
 for(let i=0;i<115;i++){const x=rnd()*1024,y=rnd()*1024,r=24+rnd()*145;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,i%3?'rgba(151,125,97,.11)':'rgba(255,250,236,.45)');g.addColorStop(1,'rgba(218,199,172,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);}
 for(let i=0;i<125;i++){const x=rnd()*1024,y=rnd()*1024,angle=rnd()*Math.PI*2,length=15+rnd()*170;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+Math.cos(angle)*length*.3,y+Math.sin(angle)*length*.4,x+Math.cos(angle+.6)*length*.7,y+Math.sin(angle+.6)*length*.7,x+Math.cos(angle)*length,y+Math.sin(angle)*length);ctx.strokeStyle=`rgba(133,105,79,${.035+rnd()*.12})`;ctx.lineWidth=.5+rnd()*2.1;ctx.stroke();}
 for(let i=0;i<15500;i++){ctx.fillStyle=i%3?'rgba(112,88,61,.035)':'rgba(255,251,238,.16)';ctx.fillRect(rnd()*1024,rnd()*1024,.5+rnd()*2.5,.5+rnd()*1.6);}
 const stoneTex=new THREE.CanvasTexture(canvas);stoneTex.colorSpace=THREE.SRGBColorSpace;stoneTex.wrapS=stoneTex.wrapT=THREE.RepeatWrapping;stoneTex.anisotropy=8;
 const woodCanvas=document.createElement('canvas');woodCanvas.width=256;woodCanvas.height=1024;const wc=woodCanvas.getContext('2d');wc.fillStyle='#82624f';wc.fillRect(0,0,256,1024);
 for(let i=0;i<650;i++){const x=rnd()*256;wc.beginPath();wc.moveTo(x,0);wc.bezierCurveTo(x+Math.sin(i)*3,330,x+Math.cos(i)*4,690,x,1024);wc.strokeStyle=i%3?`rgba(45,26,19,${.035+rnd()*.09})`:`rgba(221,181,139,${.03+rnd()*.10})`;wc.lineWidth=.25+rnd()*.9;wc.stroke();}
 const woodTex=new THREE.CanvasTexture(woodCanvas);woodTex.colorSpace=THREE.SRGBColorSpace;woodTex.wrapS=woodTex.wrapT=THREE.RepeatWrapping;woodTex.anisotropy=8;
 const fixed=(name,material)=>{material.name=name;material.userData.kitchenReference=true;return material;};
 return {
  kitchenFront:fixed('Keuken · crème-zand matte fronten',new THREE.MeshStandardMaterial({color:'#ddd8cd',roughness:.62})),
  kitchenWalnut:fixed('Keuken · geribbeld warm walnoot',new THREE.MeshStandardMaterial({color:'#d4b39c',map:woodTex,roughness:.64})),
  kitchenStone:fixed('Keuken · licht warm geaderd steen, gepolijst',new THREE.MeshPhysicalMaterial({color:'#fff9ef',map:stoneTex,bumpMap:stoneTex,bumpScale:.0004,roughness:.24,clearcoat:.22,clearcoatRoughness:.22})),
  kitchenMetal:fixed('Keuken · geborsteld champagne-brons',new THREE.MeshStandardMaterial({color:'#9c8570',metalness:.78,roughness:.33}))
 };
}
