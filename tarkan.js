import * as THREE from './assets/three.module.js';
let youtubeAPI;
export function loadYouTubeAPI(){
  if(window.YT?.Player)return Promise.resolve(window.YT);
  if(youtubeAPI)return youtubeAPI;
  youtubeAPI=new Promise((resolve,reject)=>{
    const previous=window.onYouTubeIframeAPIReady;
    const timer=setTimeout(()=>{youtubeAPI=null;reject(new Error('YouTube laden duurt te lang'));},15000);
    window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);previous?.();resolve(window.YT);};
    const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';
    script.onerror=()=>{clearTimeout(timer);youtubeAPI=null;reject(new Error('YouTube is niet bereikbaar'));};
    document.head.appendChild(script);
  });return youtubeAPI;
}
// Prepare a paused player before the music click, so that click can start it directly.
export function setupTarkanPlayer({button,futbolButton=null,panel,mount,closeButton,beforeOpen=()=>{},getInitialTV=()=> 'living',onError=()=>{},loadAPI=loadYouTubeAPI}){
  let selected='living',content='music',loaded='music',api=null,ready=false,wanted=false,playing=false,preparing=null;
  const videos={music:'cpp69ghR1IM',futbol:'c4dTDowd1YA'};
  const buttons={music:button,futbol:futbolButton};
  const labels={music:'♫ Muziek',futbol:'⚽ Futbol'};
  function syncButtons(){for(const [id,b] of Object.entries(buttons)){if(!b)continue;const active=wanted&&id===content;b.textContent=labels[id];b.title=active?'Afspelen stoppen':(id==='music'?'Muziek':'Futbol')+' afspelen op de tv';b.setAttribute('aria-expanded',String(active));b.classList.toggle('active',active);}}
  function retryLabel(){const b=buttons[content];b.textContent='▶ '+(content==='music'?'Muziek':'Futbol');b.title='Klik hier om afspelen te starten';}
  const choice=panel.querySelector('#music-tv');
  function select(id){selected=['living','kitchen','attic','mancave'].includes(id)?id:'living';if(choice)choice.value=selected;}
  if(choice)choice.onchange=()=>select(choice.value);
  function start(){if(!ready||!wanted)return;if(loaded!==content){api.loadVideoById(videos[content]);loaded=content;}api.unMute();api.setVolume(70);api.playVideo();}
  function prepare(){
    if(preparing)return preparing;
    preparing=loadAPI().then(YT=>{
      const frame=document.createElement('iframe');
      frame.src='https://www.youtube-nocookie.com/embed/cpp69ghR1IM?autoplay=0&playsinline=1&rel=0&enablejsapi=1&origin='+encodeURIComponent(window.location.origin);
      frame.title='TV-speler – Muziek en Futbol';frame.width='640';frame.height='360';
      frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;
      frame.referrerPolicy='strict-origin-when-cross-origin';mount.replaceChildren(frame);
      api=new YT.Player(frame,{events:{
        onReady:event=>{api=event.target;ready=true;if(wanted)start();},
        onStateChange:event=>{
          playing=event.data===1;
          if(playing&&!wanted){event.target.pauseVideo();playing=false;}
          if(playing)syncButtons();
        },
        onAutoplayBlocked:()=>{playing=false;retryLabel();onError('Je browser vraagt nog een tik: klik opnieuw op '+(content==='music'?'Muziek':'Futbol')+'.');},
        onError:()=>{playing=false;retryLabel();onError('YouTube kan deze video nu niet afspelen.');}
      }});
    }).catch(error=>{preparing=null;if(wanted)onError(error.message);});return preparing;
  }
  function setOpen(open){
    if(open){
      if(!wanted){beforeOpen();select(getInitialTV());}
      wanted=true;panel.hidden=false;
      // Do not defer this call: it must run within the music button's click.
      if(ready)start();else prepare();
    }else{
      wanted=false;playing=false;panel.hidden=true;mount.hidden=true;
      if(ready){api.pauseVideo();api.seekTo(0,true);}

    }
    syncButtons();
  }
  function choose(id){const same=id===content;if(!same){content=id;playing=false;}setOpen(!same||!wanted||!playing);}
  button.onclick=()=>choose('music');
  if(futbolButton)futbolButton.onclick=()=>choose('futbol');
  closeButton.onclick=()=>{setOpen(false);buttons[content].focus();};
  panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.stopPropagation();setOpen(false);buttons[content].focus();}});
  for(const type of ['keydown','keyup','pointerdown','touchstart','wheel'])panel.addEventListener(type,event=>event.stopPropagation());
  prepare();
  return {setOpen,get open(){return wanted},get selected(){return selected},get playing(){return playing}};
}

// Project an embedded player onto the physical TV plane without copying video data.
export function quadTransform(points,width=640,height=360){
  const [p0,p1,p2,p3]=points,dx1=p1.x-p2.x,dx2=p3.x-p2.x,dx3=p0.x-p1.x+p2.x-p3.x;
  const dy1=p1.y-p2.y,dy2=p3.y-p2.y,dy3=p0.y-p1.y+p2.y-p3.y;
  const det=dx1*dy2-dx2*dy1;if(Math.abs(det)<1e-8)return null;
  const g=(dx3*dy2-dx2*dy3)/det,h=(dx1*dy3-dx3*dy1)/det;
  const a=p1.x-p0.x+g*p1.x,b=p3.x-p0.x+h*p3.x;
  const d=p1.y-p0.y+g*p1.y,e=p3.y-p0.y+h*p3.y;
  return [a/width,d/width,0,g/width,b/height,e/height,0,h/height,0,0,1,0,p0.x,p0.y,0,1];
}
export function attachTVPlayer({holder,camera,root,mount,player,isVisible=()=>true,getOccluders=()=>[root]}){
  holder.appendChild(mount);mount.classList.add('tv-surface-player');
  const screens={
    living:{mesh:root.getObjectByName('living-tv-screen'),corners:[[-.004,.6475,-1.17],[-.004,.6475,1.17],[-.004,-.6475,1.17],[-.004,-.6475,-1.17]],normal:new THREE.Vector3(-1,0,0)},
    attic:{mesh:root.getObjectByName('attic-tv-screen'),corners:[[-.005,.445,.805],[-.005,.445,-.805],[-.005,-.445,-.805],[-.005,-.445,.805]],normal:new THREE.Vector3(-1,0,0)},
    mancave:{mesh:root.getObjectByName('mancave-tv-screen'),corners:[[.57,.325,.004],[-.57,.325,.004],[-.57,-.325,.004],[.57,-.325,.004]],normal:new THREE.Vector3(0,0,1)},
    kitchen:{mesh:root.getObjectByName('kitchen-tv-screen'),corners:[[.5975,.3275,.004],[-.5975,.3275,.004],[-.5975,-.3275,.004],[.5975,-.3275,.004]],normal:new THREE.Vector3(0,0,1)}
  };
  const ray=new THREE.Raycaster(),center=new THREE.Vector3(),normal=new THREE.Vector3(),toward=new THREE.Vector3();
  let lastCheck=-Infinity,occluded=true,lastScreen=null;
  for(const event of ['pointerdown','touchstart','wheel'])mount.addEventListener(event,e=>e.stopPropagation());
  return {update(now){
    const s=screens[player.selected];
    if(!player.open||!isVisible()||!s?.mesh){mount.hidden=true;return;}
    for(let ancestor=s.mesh;ancestor;ancestor=ancestor.parent){if(!ancestor.visible){mount.hidden=true;return;}}
    s.mesh.updateWorldMatrix(true,false);camera.updateMatrixWorld();
    s.mesh.getWorldPosition(center);normal.copy(s.normal).transformDirection(s.mesh.matrixWorld);toward.subVectors(camera.position,center);
    if(normal.dot(toward)<=0){mount.hidden=true;return;}
    const rect=holder.getBoundingClientRect();
    const corners=s.corners.map(p=>new THREE.Vector3(...p).applyMatrix4(s.mesh.matrixWorld));
    if(corners.some(p=>p.clone().applyMatrix4(camera.matrixWorldInverse).z>=-.06)){mount.hidden=true;return;}
    if(now-lastCheck>150||lastScreen!==s){
      lastCheck=now;lastScreen=s;
      const direction=center.clone().sub(camera.position),distance=direction.length();ray.set(camera.position,direction.normalize());ray.far=distance-.035;
      const targets=[];for(const object of getOccluders())object.traverseVisible(o=>{if(o.isMesh)targets.push(o)});
      occluded=ray.intersectObjects(targets,false).length>0;
    }
    if(occluded){mount.hidden=true;return;}
    const points=corners.map(p=>{p.project(camera);return{x:(p.x+1)*rect.width/2,y:(1-p.y)*rect.height/2}});
    const matrix=quadTransform(points);mount.hidden=!matrix;
    if(matrix)mount.style.transform='matrix3d('+matrix.join(',')+')';
  }};
}
