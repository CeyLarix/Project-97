export function createPersonDance(getModel){
 let model=null,base=null,amount=0,last=null;
 return {update(time,playing){
   const next=getModel();if(!next)return;
   if(next!==model){model=next;base={position:model.position.clone(),rotation:model.rotation.clone()};amount=0;last=time;}
   const dt=Math.min(.1,Math.max(0,(time-(last??time))/1000));last=time;
   amount+=(Number(Boolean(playing))-amount)*Math.min(1,dt*9);
   if(!playing&&amount<.001){amount=0;model.position.copy(base.position);model.rotation.copy(base.rotation);return;}
   const beat=time/1000*7;
   model.position.copy(base.position);model.position.x+=Math.sin(beat)*.045*amount;
   model.position.y+=Math.abs(Math.sin(beat))*.065*amount;
   model.position.z+=Math.sin(beat*.5)*.025*amount;
   model.rotation.copy(base.rotation);model.rotation.y+=Math.sin(beat*.5)*.17*amount;model.rotation.z+=Math.sin(beat)*.035*amount;
 }};
}
