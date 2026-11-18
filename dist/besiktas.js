import {addRakiMasasi} from './raki-masasi.js';
import * as THREE from './assets/three.module.js';
const fixed=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.85,...extra});
export function addBesiktasLounge(parent,{attic=false}={}){
 const group=new THREE.Group();group.name=attic?'besiktas-attic-lounge':'besiktas-mancave-lounge';parent.add(group);
 const black=fixed('#16181a'),white=fixed('#f1f0e9'),red=fixed('#b41f2d'),wood=fixed('#514337');
 const tex=(path,transparent=false,crop=false)=>{const m=fixed('#ffffff',{transparent,side:THREE.DoubleSide});if(typeof Image!=='undefined')new THREE.TextureLoader().load(path,t=>{t.colorSpace=THREE.SRGBColorSpace;if(crop){t.offset.set(.19,.42);t.repeat.set(.59,.48);}m.map=t;m.needsUpdate=true});return m;};
 const logo=tex('assets/references/besiktas-logo.svg',true),eagle=tex('assets/references/besiktas-eagle-wall.jpg',false,true);
 function box(w,h,d,x,y,z,m=black,p=group){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o;}
 function cylinder(rt,rb,h,x,y,z,m=white,p=group){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,24),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o;}
 function label(text,bg='#151719',fg='#faf9f3'){
  const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 116px Arial';ctx.fillText(text,512,133);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return fixed('#ffffff',{map:t,side:THREE.DoubleSide});
 }
 function picture(name,w,h,x,y,z,angle,material,frame=true){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);g.rotation.y=angle;group.add(g);if(frame)box(w+.035,h+.035,.022,0,0,0,black,g);const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);o.position.z=.013;o.scale.x=-1;g.add(o);return g;}
 // The eagle and club crest are distinct features, with a clean red accent.
 const wallX=attic?.115:8.795,angle=attic?Math.PI/2:-Math.PI/2,wallZ=attic?3.35:11.10;
 picture('besiktas-black-eagle-mural',attic?1.82:1.38,attic?1.05:.88,wallX,1.93,wallZ,angle,eagle);
 picture('besiktas-supporter-scarf',attic?1.88:1.42,.16,wallX,1.32,wallZ,angle,label('BEŞİKTAŞ  1903'));
 const crestX=attic?5.305:8.795,crestZ=attic?3.94:12.38,crestAngle=-Math.PI/2;
 picture('besiktas-official-club-crest',.37,.61,crestX,1.76,crestZ,crestAngle,logo,false);
 picture('besiktas-kara-kartal-sign',attic?1.45:1.22,.22,attic?5.17:5.92,attic?2.09:2.09,attic?2.62:11.34,attic?-Math.PI/2:Math.PI/2,label('KARA KARTAL'));
 // Framed black-and-white supporter shirt with 1903, rather than a generic print.
 const jersey=new THREE.Group();jersey.name='besiktas-framed-shirt';jersey.position.set(attic?5.30:7.20,attic?1.75:1.9,attic?4.50:10.07);jersey.rotation.y=attic?-Math.PI/2:0;group.add(jersey);
 box(.58,.72,.035,0,0,0,black,jersey);box(.52,.66,.012,0,0,.023,white,jersey);box(.27,.42,.014,0,-.015,.038,white,jersey);
 for(const x of[-.09,0,.09])box(.043,.42,.003,x,-.015,.047,black,jersey);
 for(const x of[-.19,.19]){const sleeve=box(.14,.17,.016,x,.14,.04,white,jersey);sleeve.rotation.z=Math.sign(x)*.35;}
 const shirtLogo=new THREE.Mesh(new THREE.PlaneGeometry(.065,.107),logo);shirtLogo.position.set(-.07,.12,.052);shirtLogo.scale.x=-1;jersey.add(shirtLogo);
 // Black/white football on the media shelf.
 const ball=new THREE.Mesh(new THREE.SphereGeometry(.10,24,16),white);ball.position.set(attic?5.13:5.99,attic?.635:.72,attic?1.94:11.02);ball.name='besiktas-football';group.add(ball);
 for(let i=0;i<8;i++){const a=i*Math.PI/4,patch=new THREE.Mesh(new THREE.CircleGeometry(.028,5),black);patch.position.copy(ball.position).add(new THREE.Vector3(Math.sin(a)*.098,Math.cos(a)*.098,0));patch.lookAt(ball.position.clone().multiplyScalar(2).sub(patch.position));group.add(patch);}
 let diningObstacles=[];
 if(attic){
 // The existing upstairs drinks remain on the attic coffee table.
 const drinks=new THREE.Group();drinks.name='besiktas-raki-service';group.add(drinks);
 const x=attic?2.05:7.48,z=attic?3.35:11.05,y=attic?.415:.56;
 if(!attic){cylinder(.245,.245,.035,x,y-.018,z,wood);cylinder(.035,.055,.52,x,.27,z,black);cylinder(.18,.18,.025,x,.014,z,black);}
 cylinder(.205,.205,.016,x,y+.008,z,black,drinks);
 const glass=fixed('#d8e8e1',{transparent:true,opacity:.38,depthWrite:false});
 cylinder(.037,.044,.20,x-.07,y+.117,z,glass,drinks);cylinder(.014,.025,.075,x-.07,y+.254,z,glass,drinks);cylinder(.017,.017,.02,x-.07,y+.30,z,white,drinks);
 picture('raki-bottle-label',.06,.07,x-.07,y+.15,z+.045,0,label('RAKI','#f5f1e7','#151719'),false);
 for(const dx of[.04,.12]){cylinder(.022,.022,.13,x+dx,y+.084,z+.055,glass,drinks);cylinder(.018,.018,.065,x+dx,y+.045,z+.055,white,drinks);}
 cylinder(.038,.038,.16,x+.07,y+.10,z-.10,glass,drinks);cylinder(.036,.036,.012,x+.07,y+.187,z-.10,black,drinks);
 }else{const dining=addRakiMasasi(group);diningObstacles=dining.obstacles;}
 group.userData.sources=['https://tr.pinterest.com/pin/black-bed-black-bedroom-bjk-bedroom-amazing-bedroom-siyah-yatak-odas--297870962863325788/','https://commons.wikimedia.org/wiki/File:BesiktasJK-Logo.svg','https://www.shopier.com/7226154'];
 return {group,obstacles:diningObstacles};
}
