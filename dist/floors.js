import * as THREE from './assets/three.module.js';
import { makeOakFloor } from './floor.js';

// Current official product families checked on 17 November 2026. The generated
// materials show colour/pattern comparisons; they are not manufacturer scans.
const impression = 'Sfeerbenadering van kleur en patroon; vergelijk de echte kleur altijd met een staal.';
export const FLOORS = [
  {id:'warm-oak',name:'Warm Oak',subtitle:'Jouw staal · XL visgraat',description:'Warm eiken in het ruime visgraatpatroon van je Ambiant-staal.',pattern:'herringbone',swatch:'#a58c6d',colors:['#b29b7b','#a38a69','#bfaa8b'],source:{title:'Ambiant · Spigato XL Soleno Warm Oak',url:'https://ambiant.nl/producten/spigato-xl-soleno-visgraat-dryback-warm-oak/'},note:impression},
  {id:'natural-plank',name:'Naturel eiken',subtitle:'Rustige rechte plank',description:'Een naturel eikentint met lange rechte planken; geïnspireerd op Ambiant Soleno Natural.',pattern:'plank',swatch:'#b8a084',colors:['#b9a184','#c2af95','#ad9679'],source:{title:'Ambiant · Soleno Natural',url:'https://ambiant.nl/producten/soleno-dryback-natural/'},note:impression},
  {id:'beige-herringbone',name:'Licht beige eiken',subtitle:'Luchtige XL visgraat',description:'Een zachte beige houttint voor een lichte basis; geïnspireerd op Ambiant Spigato XL Soleno Beige.',pattern:'herringbone',swatch:'#c6b69b',colors:['#cabba3','#bfae95','#d0c2ad'],source:{title:'Ambiant · Spigato XL Soleno Beige',url:'https://ambiant.nl/producten/spigato-xl-soleno-visgraat-dryback-beige/'},note:impression},
  {id:'dark-herringbone',name:'Donker eiken',subtitle:'Warme XL visgraat',description:'Een diepere eikentint die contrasteert met lichte wanden; geïnspireerd op Ambiant Soleno Dark Oak.',pattern:'herringbone',swatch:'#806b54',colors:['#7c6851','#917a61','#6f5c48'],source:{title:'Ambiant · Spigato XL Soleno Dark Oak',url:'https://ambiant.nl/producten/spigato-xl-soleno-visgraat-dryback-dark-oak/'},note:impression},
  {id:'greige-tile',name:'Greige steenlook',subtitle:'Matte PVC-tegel',description:'Een rustige warmgrijze betonlook in rechthoekige tegels; geïnspireerd op Floer Betonlook Greige.',pattern:'tile',swatch:'#b4afa3',colors:['#b4afa3','#a9a59b','#c2bdb1'],source:{title:'Floer · Tegel PVC Betonlook Greige',url:'https://floer.nl/product/floer-tegel-pvc-betonlook-greige/'},note:impression},
  {id:'light-chevron',name:'Licht eiken punt',subtitle:'Hongaarse punt · 60°',description:'Een lichte onbehandelde eikenlook met doorlopende punten; geïnspireerd op Floer Onbehandeld Eiken.',pattern:'chevron',swatch:'#c7b89e',colors:['#c5b59a','#d0c2ac','#b8a68b'],source:{title:'Floer · Hongaarse Punt Onbehandeld Eiken',url:'https://floer.nl/product/floer-hongaarse-punt-pvc-onbehandeld-eiken/'},note:impression},
];

FLOORS.forEach(floor => { floor.preview = `./assets/floors/${floor.id}.png`; });

const templates = new Map();
const modulo = (a,b) => ((a%b)+b)%b;
function random(seed) {let n=seed>>>0;return ()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}
function texture(canvas,worldWidth,worldDepth,rotation=0) {
  const map=new THREE.CanvasTexture(canvas);
  map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;
  map.repeat.set(1/worldWidth,1/worldDepth);map.rotation=rotation;map.anisotropy=8;
  return map;
}
function standard(map,name,bumpScale=.0025) {
  const m=new THREE.MeshStandardMaterial({color:0xffffff,map,bumpMap:map,bumpScale,roughness:.92,metalness:0});
  m.name=name;m.userData.floorChoice=true;return m;
}
function woodGrain(ctx,length,width,base,seed) {
  const r=random(seed),shade=(r()-.5)*13;
  ctx.fillStyle=`rgb(${base.map(v=>Math.round(v+shade)).join(',')})`;
  ctx.fillRect(-.13,0,length+.26,width);
  for(let i=0;i<9;i++){
    const cy=r()*width,spread=.005+r()*.011;
    const g=ctx.createLinearGradient(0,cy-spread,0,cy+spread);
    g.addColorStop(0,'rgba(65,45,27,0)');g.addColorStop(.5,i%3===0?'rgba(241,220,185,.12)':'rgba(74,50,30,.055)');g.addColorStop(1,'rgba(65,45,27,0)');
    ctx.fillStyle=g;ctx.fillRect(-.13,cy-spread,length+.26,spread*2);
  }
  const phase=r()*6.283,knot=r()<.28,kx=length*(.23+r()*.52),ky=width*(.25+r()*.5);
  for(let i=0;i<170;i++){
    const y0=(i+.3)/170*width;
    ctx.strokeStyle=i%6===0?'rgba(235,216,181,.14)':`rgba(67,45,27,${.035+r()*.07})`;
    ctx.lineWidth=.0003+r()*.0006;ctx.beginPath();
    for(let x=-.13;x<=length+.14;x+=.022){
      let y=y0+Math.sin(x*7+phase+y0*63)*.0027+Math.sin(x*21+phase)*.00045;
      if(knot)y+=Math.sign(y0-ky)*.005*Math.exp(-(((x-kx)/.09)**2))*Math.exp(-Math.abs(y0-ky)/.025);
      if(x===-.13)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  if(knot)for(let i=0;i<4;i++){
    ctx.beginPath();ctx.ellipse(kx,ky,.003+i*.004,.0009+i*.001,0,0,Math.PI*2);
    ctx.strokeStyle=`rgba(65,43,26,${.13-i*.024})`;ctx.lineWidth=.00045;ctx.stroke();
  }
  for(let i=0;i<110;i++){ctx.fillStyle='rgba(71,48,28,.07)';ctx.fillRect(r()*length,r()*width,.002+r()*.008,.0004);}
}
function board(ctx,points,angle,origin,length,width,base,seed) {
  ctx.save();ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();
  ctx.translate(origin[0],origin[1]);ctx.rotate(angle);woodGrain(ctx,length,width,base,seed);ctx.restore();
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
  ctx.strokeStyle='rgba(61,47,33,.28)';ctx.lineWidth=.0012;ctx.stroke();
}
function straightPlanks() {
  const width=.236,length=1.53,worldWidth=width*8,worldDepth=length*2;
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=2048;
  const ctx=canvas.getContext('2d');ctx.scale(canvas.width/worldWidth,canvas.height/worldDepth);
  for(let col=0;col<8;col++){
    const offset=[0,length*.34,length*.67,length*.18][col%4];
    for(let row=-1;row<3;row++){
      const x=col*width,y=row*length+offset;
      board(ctx,[[x,y],[x+width,y],[x+width,y+length],[x,y+length]],Math.PI/2,[x+width,y],length,width,[184,162,132],1100+col*37+modulo(row,2)*159);
    }
  }
  return standard(texture(canvas,worldWidth,worldDepth),'Naturel eiken · rechte plank (sfeerbenadering)');
}
function recolouredHerringbone(base,name) {
  const original=makeOakFloor(),canvas=document.createElement('canvas');
  canvas.width=original.map.image.width;canvas.height=original.map.image.height;
  const ctx=canvas.getContext('2d');ctx.drawImage(original.map.image,0,0);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),data=pixels.data;
  for(let i=0;i<data.length;i+=4){
    // Preserve fine grain and individual board shades, while moving the
    // generated oak palette to a lighter beige or deeper smoked-oak range.
    const luma=(data[i]-165)*.55+(data[i+1]-140)*.3+(data[i+2]-109)*.15;
    data[i]=Math.max(0,Math.min(255,base[0]+luma));data[i+1]=Math.max(0,Math.min(255,base[1]+luma));data[i+2]=Math.max(0,Math.min(255,base[2]+luma));
  }
  ctx.putImageData(pixels,0,0);original.map.dispose();original.dispose();
  return standard(texture(canvas,1.78,1.78,Math.PI/4),name);
}
function chevron() {
  // 60° end cuts: the grain runs at ±30° and every V meets along a
  // continuous vertical joint. Physical plank size is approximately 55×15.9cm.
  const angle=Math.PI/6,length=.55,width=.159;
  const run=length*Math.cos(angle),rise=length*Math.sin(angle),step=width/Math.cos(angle);
  const worldWidth=run*2,rows=8,worldDepth=step*rows;
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=2048;
  const ctx=canvas.getContext('2d');ctx.scale(canvas.width/worldWidth,canvas.height/worldDepth);
  for(let row=-2;row<rows+2;row++){
    const y=row*step;
    board(ctx,[[0,y],[run,y+rise],[run,y+rise+step],[0,y+step]],angle,[0,y],length,width,[197,181,155],2400+modulo(row,rows)*41);
    board(ctx,[[run,y+rise],[run*2,y],[run*2,y+step],[run,y+rise+step]],-angle,[run,y+rise],length,width,[197,181,155],3700+modulo(row,rows)*37);
  }
  return standard(texture(canvas,worldWidth,worldDepth),'Licht eiken · Hongaarse punt (sfeerbenadering)');
}
function stoneTiles() {
  const length=.914,width=.457,worldWidth=length*2,worldDepth=width*4;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=2048;
  const ctx=canvas.getContext('2d'),scale=canvas.width/worldWidth;
  ctx.fillStyle='#a9a59a';ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let row=0;row<4;row++)for(let col=0;col<2;col++){
    const r=random(7400+row*91+col*37),x=col*length*scale,y=row*width*scale,w=length*scale,h=width*scale,variation=(r()-.5)*8;
    ctx.save();ctx.beginPath();ctx.rect(x+1,y+1,w-2,h-2);ctx.clip();
    ctx.fillStyle=`rgb(${180+variation},${175+variation},${163+variation})`;ctx.fillRect(x,y,w,h);
    for(let i=0;i<34;i++){
      const cx=x+r()*w,cy=y+r()*h,rad=20+r()*180;
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rad);
      g.addColorStop(0,i%2?'rgba(77,73,65,.027)':'rgba(231,224,210,.055)');g.addColorStop(1,'rgba(130,125,115,0)');
      ctx.fillStyle=g;ctx.fillRect(cx-rad,cy-rad,rad*2,rad*2);
    }
    for(let i=0;i<6000;i++){
      ctx.fillStyle=i%3?'rgba(62,58,49,.035)':'rgba(243,238,222,.07)';ctx.fillRect(x+r()*w,y+r()*h,.5+r()*1.6,.5+r()*1.3);
    }
    ctx.restore();ctx.strokeStyle='rgba(84,80,70,.24)';ctx.lineWidth=1.2;ctx.strokeRect(x+.8,y+.8,w-1.6,h-1.6);
  }
  return standard(texture(canvas,worldWidth,worldDepth),'Greige matte PVC-tegel (sfeerbenadering)',.0015);
}

// UVs throughout the house are in metres. Textures carry their own repeat
// dimensions. Return a distinct material so each storey can own its settings;
// GPU texture data is shared safely between those materials.
export function createFloorMaterial(id='warm-oak') {
  const selected=FLOORS.find(f=>f.id===id)||FLOORS[0];
  if(!templates.has(selected.id)) {
    let m;
    switch(selected.id) {
      case 'natural-plank':m=straightPlanks();break;
      case 'beige-herringbone':m=recolouredHerringbone([198,182,155],'Licht beige eiken · XL visgraat (sfeerbenadering)');break;
      case 'dark-herringbone':m=recolouredHerringbone([126,107,84],'Donker eiken · XL visgraat (sfeerbenadering)');break;
      case 'greige-tile':m=stoneTiles();break;
      case 'light-chevron':m=chevron();break;
      default:m=makeOakFloor();
    }
    m.userData.floorId=selected.id;templates.set(selected.id,m);
  }
  return templates.get(selected.id).clone();
}

// Catalog materials are generated only when selected. Each returned material
// owns its map; the app's bounded, pinned LRU owns disposal. Unlike the six
// original presets, imported products do not share cached GPU texture data.
const catalogPalette = {
  beige:[194,178,153],natural:[176,150,116],naturel:[176,150,116],warm:[165,140,109],
  brown:[137,108,78],bruin:[137,108,78],dark:[103,84,64],donker:[103,84,64],
  grey:[157,150,139],gray:[157,150,139],grijs:[157,150,139],greige:[179,172,159],
  white:[215,204,183],wit:[215,204,183],cream:[209,195,173],black:[77,73,65],zwart:[77,73,65],
};
function catalogHash(text) {
  let n=2166136261;
  for(const ch of String(text)){n^=ch.charCodeAt(0);n=Math.imul(n,16777619);}
  return n>>>0;
}
function hexRgb(value) {
  if(typeof value!=='string')return null;
  let s=value.trim();
  if(/^#[a-f\d]{3}$/i.test(s))s='#'+s.slice(1).split('').map(c=>c+c).join('');
  if(/^#[a-f\d]{6}$/i.test(s))return [1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
  const match=s.match(/^rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/i);
  return match?match.slice(1,4).map(Number):null;
}
function catalogBase(entry) {
  const colors=entry.colors||entry.swatches||[];
  const values=Array.isArray(colors)?colors:[colors];
  for(const v of [...values,entry.swatch,entry.tone?.color,entry.tone]) {
    const rgb=hexRgb(typeof v==='object'?v?.color||v?.hex:v);if(rgb)return rgb;
  }
  const tone=String(entry.tone?.name||entry.tone||'').toLowerCase();
  if(catalogPalette[tone])return catalogPalette[tone];
  const name=String(entry.name||entry.title||'').toLowerCase();
  for(const [label,rgb] of Object.entries(catalogPalette))if(name.includes(label))return rgb;
  return catalogPalette.natural;
}
function catalogPattern(entry) {
  const p=String(entry.pattern||'plank').toLowerCase();
  if(/hongaar|chevron/.test(p))return 'chevron';
  if(/herring|visgraat|walvis/.test(p))return 'herringbone';
  if(/tile|tegel|steen|beton/.test(p))return 'tile';
  return 'plank';
}
function catalogDimensions(entry,pattern) {
  const defaults=pattern==='tile'?[.914,.457]:pattern==='herringbone'?[.914,.152]:pattern==='chevron'?[.55,.159]:[1.219,.228];
  const d=entry.dimensions||{};
  let length=Number(d.length||entry.length),width=Number(d.width||entry.width);
  // The public contract is metres. Centimetre and millimetre input is also
  // normalized for suppliers whose JSON still carries explicit unit fields.
  const unit=String(d.unit||entry.dimensionUnit||'m').toLowerCase();
  if(unit==='cm'){length/=100;width/=100;}else if(unit==='mm'){length/=1000;width/=1000;}
  if(!Number.isFinite(length)||length<.1||length>3)length=defaults[0];
  if(!Number.isFinite(width)||width<.06||width>1.6)width=defaults[1];
  return {length,width};
}
function catalogCanvas(worldWidth,worldDepth) {
  const canvas=document.createElement('canvas'),ratio=worldWidth/worldDepth;
  canvas.width=ratio>=1?1024:Math.max(128,Math.round(1024*ratio));
  canvas.height=ratio<=1?1024:Math.max(128,Math.round(1024/ratio));
  const ctx=canvas.getContext('2d');ctx.scale(canvas.width/worldWidth,canvas.height/worldDepth);
  return {canvas,ctx};
}
function catalogStoneBoard(ctx,points,angle,origin,length,width,base,seed) {
  const r=random(seed),padding=Math.max(.13,width),variation=(r()-.5)*13;
  ctx.save();ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();ctx.translate(origin[0],origin[1]);ctx.rotate(angle);
  ctx.fillStyle=`rgb(${base.map(v=>Math.max(0,Math.min(255,Math.round(v+variation)))).join(',')})`;ctx.fillRect(-padding,0,length+2*padding,width);
  for(let i=0;i<18;i++) {
    const x=-padding+r()*(length+padding*2),y=r()*width,rad=.012+r()*Math.min(length,width)*.8;
    const gradient=ctx.createRadialGradient(x,y,0,x,y,rad);
    gradient.addColorStop(0,i%2?'rgba(57,37,25,.06)':'rgba(247,224,187,.07)');gradient.addColorStop(1,'rgba(130,100,75,0)');ctx.fillStyle=gradient;ctx.fillRect(x-rad,y-rad,rad*2,rad*2);
  }
  for(let i=0;i<240;i++) {
    ctx.fillStyle=i%4?'rgba(43,29,20,.075)':'rgba(247,230,202,.1)';ctx.fillRect(-padding+r()*(length+padding*2),r()*width,.0005+r()*.0015,.0005+r()*.0011);
  }
  ctx.restore();ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.strokeStyle='rgba(65,49,37,.36)';ctx.lineWidth=.002;ctx.stroke();
}
function catalogIsStone(entry) {return entry.surface==='stone'||entry.material==='terracotta';}
function catalogBoard(ctx,points,angle,origin,length,width,base,seed,scan,stone=false) {
  if(stone&&!scan)return catalogStoneBoard(ctx,points,angle,origin,length,width,base,seed);
  if(!scan){
    const paddedOrigin=[origin[0]-width*Math.cos(angle),origin[1]-width*Math.sin(angle)];
    return board(ctx,points,angle,paddedOrigin,length+2*width,width,base,seed);
  }
  ctx.save();ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();
  ctx.translate(origin[0],origin[1]);ctx.rotate(angle);
  // A verified, tightly cropped plank scan supplies the actual grain. Extend
  // the end slightly for a chevron's diagonal cut; never use a room photo.
  const r=random(seed),flip=r()>.5,padding=Math.max(.13,width);
  if(flip){ctx.translate(length,0);ctx.scale(-1,1);}
  const img=scan;
  if(img.width>=img.height)ctx.drawImage(img,-padding,0,length+padding*2,width);
  else {ctx.save();ctx.translate(-padding,width);ctx.rotate(-Math.PI/2);ctx.drawImage(img,0,0,width,length+padding*2);ctx.restore();}
  ctx.fillStyle=`rgba(${r()>.5?'255,247,225':'61,42,24'},.025)`;ctx.fillRect(-padding,0,length+padding*2,width);ctx.restore();
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.strokeStyle='rgba(54,43,31,.22)';ctx.lineWidth=.001;ctx.stroke();
}
function catalogPlanks(entry,base,seed,scan) {
  const {length,width}=catalogDimensions(entry,'plank'),columns=6,rows=2,worldWidth=width*columns,worldDepth=length*rows;
  const {canvas,ctx}=catalogCanvas(worldWidth,worldDepth);
  for(let col=0;col<columns;col++) {
    const offset=[0,.34,.67,.17,.52,.83][col]*length;
    for(let row=-1;row<rows+1;row++){
      const x=col*width,y=row*length+offset;
      catalogBoard(ctx,[[x,y],[x+width,y],[x+width,y+length],[x,y+length]],Math.PI/2,[x+width,y],length,width,base,seed+col*71+modulo(row,rows)*313,scan,catalogIsStone(entry));
    }
  }
  return texture(canvas,worldWidth,worldDepth);
}
function catalogHerringbone(entry,base,seed,scan) {
  const {length:L,width:W}=catalogDimensions(entry,'herringbone'),q=Math.SQRT1_2;
  // The exact lattice vectors (L,L),(-W,W) are perpendicular. Rendering in
  // their rotated frame gives a seamless 45° herringbone for ANY L/W ratio,
  // including 91.4×15.2cm boards; no integer-ratio approximation is needed.
  const columns=2,rows=Math.max(4,Math.min(8,Math.round(L/W))),periodX=Math.SQRT2*L,periodY=Math.SQRT2*W;
  const worldWidth=periodX*columns,worldDepth=periodY*rows,{canvas,ctx}=catalogCanvas(worldWidth,worldDepth);
  const margin=Math.ceil(L/(2*W))+2;
  for(let col=-1;col<=columns;col++)for(let row=-margin;row<rows+margin;row++) {
    const x=col*periodX,y=row*periodY;
    const a=[[x,y],[x+L*q,y-L*q],[x+(L+W)*q,y+(W-L)*q],[x+W*q,y+W*q]];
    const b=[[x+L*q,y-L*q],[x+(L+W)*q,y-(L+W)*q],[x+(2*L+W)*q,y-W*q],[x+2*L*q,y]];
    for(const [poly,angle,origin,part] of [[a,-Math.PI/4,a[0],0],[b,Math.PI/4,b[1],1]]) {
      if(Math.max(...poly.map(p=>p[0]))<0||Math.min(...poly.map(p=>p[0]))>worldWidth||Math.max(...poly.map(p=>p[1]))<0||Math.min(...poly.map(p=>p[1]))>worldDepth)continue;
      catalogBoard(ctx,poly,angle,origin,L,W,base,seed+modulo(col,columns)*683+modulo(row,rows)*97+part*193,scan,catalogIsStone(entry));
    }
  }
  return texture(canvas,worldWidth,worldDepth);
}
function catalogChevron(entry,base,seed,scan) {
  const {length,width}=catalogDimensions(entry,'chevron');
  const cut=Number(entry.cutAngle||entry.angle||60),angle=(90-(cut===45?45:60))*Math.PI/180;
  const run=length*Math.cos(angle),rise=length*Math.sin(angle),step=width/Math.cos(angle),rows=8;
  const worldWidth=run*2,worldDepth=step*rows,{canvas,ctx}=catalogCanvas(worldWidth,worldDepth);
  const margin=Math.ceil(rise/step)+1;
  for(let row=-margin;row<rows+margin;row++) {
    const y=row*step;
    catalogBoard(ctx,[[0,y],[run,y+rise],[run,y+rise+step],[0,y+step]],angle,[0,y],length,width,base,seed+modulo(row,rows)*101,scan,catalogIsStone(entry));
    catalogBoard(ctx,[[run,y+rise],[run*2,y],[run*2,y+step],[run,y+rise+step]],-angle,[run,y+rise],length,width,base,seed+modulo(row,rows)*137+1201,scan,catalogIsStone(entry));
  }
  return texture(canvas,worldWidth,worldDepth);
}
function catalogTiles(entry,base,seed,scan) {
  const {length,width}=catalogDimensions(entry,'tile'),columns=2,rows=Math.max(2,Math.min(4,Math.round(2*length/width)));
  const worldWidth=length*columns,worldDepth=width*rows,{canvas,ctx}=catalogCanvas(worldWidth,worldDepth);
  ctx.fillStyle=`rgb(${base.map(v=>Math.max(0,v-18)).join(',')})`;ctx.fillRect(0,0,worldWidth,worldDepth);
  for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
    const r=random(seed+row*107+col*179),x=col*length,y=row*width,variation=(r()-.5)*7;
    ctx.save();ctx.beginPath();ctx.rect(x+.0008,y+.0008,length-.0016,width-.0016);ctx.clip();
    if(scan)ctx.drawImage(scan,x,y,length,width);
    else {
      ctx.fillStyle=`rgb(${base.map(v=>Math.round(v+variation)).join(',')})`;ctx.fillRect(x,y,length,width);
      for(let i=0;i<28;i++){
        const cx=x+r()*length,cy=y+r()*width,rad=.015+r()*.18,g=ctx.createRadialGradient(cx,cy,0,cx,cy,rad);
        g.addColorStop(0,i%2?'rgba(70,65,56,.035)':'rgba(240,232,212,.06)');g.addColorStop(1,'rgba(130,125,110,0)');ctx.fillStyle=g;ctx.fillRect(cx-rad,cy-rad,rad*2,rad*2);
      }
      for(let i=0;i<1100;i++){ctx.fillStyle=i%3?'rgba(53,49,40,.045)':'rgba(249,241,222,.08)';ctx.fillRect(x+r()*length,y+r()*width,.0006+r()*.0015,.0006+r()*.0013);}
    }
    ctx.restore();ctx.strokeStyle='rgba(67,61,51,.18)';ctx.lineWidth=.0008;ctx.strokeRect(x+.0006,y+.0006,length-.0012,width-.0012);
  }
  return texture(canvas,worldWidth,worldDepth);
}
function buildCatalogMap(entry,scan=null) {
  const base=catalogBase(entry),seed=catalogHash(entry.id||entry.name||'catalog-floor');
  switch(catalogPattern(entry)) {
    case 'herringbone':return catalogHerringbone(entry,base,seed,scan);
    case 'chevron':return catalogChevron(entry,base,seed,scan);
    case 'tile':return catalogTiles(entry,base,seed,scan);
    default:return catalogPlanks(entry,base,seed,scan);
  }
}
function loadCatalogScan(material,entry) {
  if(!entry.textureImage||!['flat-decor','plank-scan','tile-scan'].includes(entry.imageKind))return;
  // Only local/same-origin, tightly cropped supplier decor images explicitly
  // classified by the importer are accepted. Lifestyle/room photos are ignored.
  let disposed=false;
  material.addEventListener('dispose',()=>{disposed=true;});
  const loader=new THREE.TextureLoader();
  loader.load(entry.textureImage,loaded=>{
    if(disposed){loaded.dispose();return;}
    try {
      const map=buildCatalogMap(entry,loaded.image),previous=material.map;
      material.map=material.bumpMap=map;material.needsUpdate=true;
      material.userData.textureSource='supplier-decor';previous?.dispose();
    } finally {loaded.dispose();}
  },undefined,()=>{material.userData.textureSource='procedural-approximation';});
}

/**
 * One independently owned material for an imported supplier product.
 * Dimensions are metres. Thumbnail/room images are never used as textures.
 * A verified flat scan may be supplied with textureImage + imageKind.
 * The caller owns its bounded cache, and disposes material.map once (it is
 * also bumpMap), followed by material.dispose() when an unpinned item expires.
 */
export function createCatalogFloorMaterial(entry) {
  if(!entry||typeof entry!=='object')entry={id:'catalog-default',name:'Warm eiken',tone:'warm',pattern:'herringbone',dimensions:{length:.89,width:.178}};
  const pattern=catalogPattern(entry),dimensions=catalogDimensions(entry,pattern);
  const map=buildCatalogMap(entry),material=standard(map,`${entry.name||entry.title||'PVC'} (sfeerbenadering)`,pattern==='tile'?.0015:.0025);
  material.userData={...material.userData,floorId:entry.id,textureSource:'procedural-approximation',pattern,dimensions};
  if(catalogIsStone(entry)){material.roughness=.97;material.bumpScale=.0035;}
  loadCatalogScan(material,entry);return material;
}

/** Convenience disposal for independently owned catalog materials only. */
export function disposeCatalogFloorMaterial(material) {
  if(!material)return;
  for(const map of new Set([material.map,material.bumpMap]))map?.dispose();
  material.dispose();
}
