export function detectPlatform(navigatorLike){
 const ua=navigatorLike.userAgent||'',platform=navigatorLike.platform||'',touches=Number(navigatorLike.maxTouchPoints)||0;
 const isIPhone=/iPhone|iPod/i.test(ua);
 const isIPad=!isIPhone&&(/iPad/i.test(ua)||(/Mac/i.test(platform)&&touches>1));
 return {isIPhone,isIPad,isWindows:!isIPhone&&!isIPad&&/Win/i.test(platform+' '+ua)};
}
// Extra input support is intentionally scoped to Windows and iPad; iPhone keeps its existing controls.
export function setupPlatformControls({holder,onZoom=()=>{},onResetZoom=()=>{},onGestureStart=()=>{},canInteract=()=>true,doc=document,win=window,nav=navigator}){
 const platform=detectPlatform(nav),removers=[];
 if(!platform.isIPad&&!platform.isWindows)return {platform,destroy(){}};
 const listen=(target,type,handler,options)=>{target.addEventListener(type,handler,options);removers.push(()=>target.removeEventListener(type,handler,options));};
 const className=platform.isIPad?'ipad-device':'windows-device';doc.body.classList.add(className);
 const help=doc.querySelector('#platform-help');if(help){help.hidden=false;help.textContent=platform.isIPad?'iPad: joystick om te lopen, één vinger om te kijken en twee vingers om te zoomen. Een muis, trackpad en toetsenbord kun je ook gebruiken.':'Windows: WASD of pijltjes om te lopen, slepen met de muis om te kijken en het muiswiel om te zoomen. +/− zoomen; 0 herstelt de zoom.';}
 listen(win,'keydown',event=>{
  if(!canInteract()||event.ctrlKey||event.metaKey||event.altKey||event.target?.isContentEditable||['INPUT','TEXTAREA','SELECT','BUTTON'].includes(event.target?.tagName))return;
  if(['+','='].includes(event.key)||event.code==='NumpadAdd'){event.preventDefault();onZoom(-5);}
  else if(event.key==='-'||event.code==='NumpadSubtract'){event.preventDefault();onZoom(5);}
  else if(event.key==='0'){event.preventDefault();onResetZoom();}
 });
 // Existing one-finger/joystick handlers remain untouched; intercept only a two-finger scene gesture.
 if(platform.isIPad){
  const pointers=new Map();let pinching=false,previousDistance=0;
  const distance=()=>{const[a,b]=[...pointers.values()];return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0;};
  const prevent=e=>{if(e.cancelable!==false)e.preventDefault();e.stopImmediatePropagation();};
  function reset(){pinching=false;previousDistance=0;for(const id of pointers.keys()){try{holder.releasePointerCapture?.(id)}catch{}}pointers.clear();}
  listen(holder,'pointerdown',e=>{
   if(e.pointerType!=='touch'||!canInteract())return;
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size===2){onGestureStart();pinching=true;previousDistance=distance();for(const id of pointers.keys()){try{holder.setPointerCapture?.(id)}catch{}}prevent(e);}
   else if(pinching)prevent(e);
  },{capture:true,passive:false});
  listen(holder,'pointermove',e=>{
   if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!pinching)return;
   prevent(e);const next=distance();if(next>8&&previousDistance>8&&canInteract())onZoom(Math.max(-8,Math.min(8,Math.log(previousDistance/next)*55)));previousDistance=next;
  },{capture:true,passive:false});
  function end(e){if(!pointers.has(e.pointerId))return;const owned=pinching;pointers.delete(e.pointerId);if(owned){prevent(e);reset();}}
  for(const type of ['pointerup','pointercancel'])listen(win,type,end,{capture:true,passive:false});
  for(const type of ['blur','orientationchange','pagehide'])listen(win,type,reset);
  listen(doc,'visibilitychange',()=>{if(doc.hidden)reset();});
  removers.push(reset);
 }
 return {platform,destroy(){removers.splice(0).forEach(remove=>remove());doc.body.classList.remove(className);if(help)help.hidden=true;}};
}
